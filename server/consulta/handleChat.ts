/**
 * `/api/chat`, independent of the hosting: receives the method and the raw
 * body, returns `{ status, body, meta }`. The Vercel function (`api/chat.ts`)
 * and the Vite dev middleware are thin adapters on top of this.
 *
 * Claude proposes, the contract decides: every model answer goes through
 * `parseAssistantTurn`, the catalog check and the astigmatism rule before it
 * leaves. An invalid turn is retried once with a short correction; a second
 * failure is a 502 and the client answers that turn with the scripted provider.
 *
 * Logs carry metadata only (duration, model, tokens, attempts, status), never
 * conversation content. Error bodies are fixed strings.
 */
import Anthropic from '@anthropic-ai/sdk';
import { findProduct, type Product } from '../../src/consulta/catalog.js';
import { parseAssistantTurn } from '../../src/consulta/schema.js';
import type { AssistantTurn, CustomerProfile } from '../../src/consulta/types.js';
import { EFFORT, MAX_TOKENS, MIN_RETRY_BUDGET_MS, TOTAL_BUDGET_MS } from './config.js';
import { mergeProfile } from './mergeProfile.js';
import { TURN_OUTPUT_SCHEMA } from './outputSchema.js';
import { SYSTEM_PROMPT } from './prompt.js';
import { chatRequestSchema, MAX_BODY_BYTES } from './requestSchema.js';
import { toClaudeMessages } from './toClaudeMessages.js';

export type ChatErrorCode = 'bad_request' | 'method_not_allowed' | 'model_invalid' | 'upstream_unavailable' | 'server_misconfigured';

export type ChatResponseBody = { turn: AssistantTurn } | { error: ChatErrorCode };

export interface ChatMeta {
  model: string;
  durationMs: number;
  /** Model calls made (0, 1 or 2). */
  attempts: number;
  /**
   * Summed over attempts; null when the model was not called. `inputTokens`
   * is the whole prompt (uncached + cache writes + cache reads);
   * `cacheReadTokens` is the part served from the prompt cache.
   */
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number } | null;
}

export interface HandleChatResult {
  status: number;
  body: ChatResponseBody;
  meta: ChatMeta;
}

/** The slice of the Anthropic client this module uses; tests pass a double. */
export interface MessagesClient {
  messages: {
    create(body: Anthropic.MessageCreateParamsNonStreaming, options?: { timeout?: number; maxRetries?: number }): Promise<Anthropic.Message>;
  };
}

export interface ChatDeps {
  /** null when ANTHROPIC_API_KEY is missing. */
  client: MessagesClient | null;
  model: string;
  catalog?: readonly Product[];
  systemPrompt?: string;
  totalBudgetMs?: number;
  minRetryBudgetMs?: number;
  now?: () => number;
  log?: (entry: Record<string, string | number | null>) => void;
}

/** Raw body passed by the adapters; `null` = larger than the limit or unreadable. */
export type RawBody = string | null;

export const RETRY_INSTRUCTION =
  'Tu respuesta anterior no cumplió el formato o las reglas del turno. Responde de nuevo con un solo objeto JSON válido que respete todas las reglas.';

type Validation = { ok: true; turn: AssistantTurn } | { ok: false; reason: string };

/** Validates the model's text as a turn: contract, profile merge, catalog, astigmatism rule. */
export function validateModelTurn(text: string, previous: CustomerProfile, catalog?: readonly Product[]): Validation {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'json' };
  }
  const parsed = parseAssistantTurn(json);
  if (!parsed) return { ok: false, reason: 'contract' };

  const turn = parseAssistantTurn({ ...parsed, profile: mergeProfile(previous, parsed.profile) });
  if (!turn) return { ok: false, reason: 'contract' };

  if (turn.status === 'done') {
    const products = turn.recommendations.map((r) => findProduct(r.productId, catalog));
    if (products.length === 0 || products.some((p) => p === undefined)) return { ok: false, reason: 'unknown_product' };
    if (turn.profile.astigmatism === 'yes' && products.some((p) => p?.design === 'spherical')) {
      return { ok: false, reason: 'spherical_with_astigmatism' };
    }
  }
  return { ok: true, turn };
}

const textOf = (message: Anthropic.Message) =>
  message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

const defaultLog = (entry: Record<string, string | number | null>) => console.info(JSON.stringify({ event: 'consulta.chat', ...entry }));

export async function handleChat(method: string, rawBody: RawBody, deps: ChatDeps): Promise<HandleChatResult> {
  const now = deps.now ?? Date.now;
  const log = deps.log ?? defaultLog;
  const started = now();
  let attempts = 0;
  let usage: ChatMeta['usage'] = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;

  const finish = (status: number, body: ChatResponseBody, reason?: string): HandleChatResult => {
    const meta: ChatMeta = { model: deps.model, durationMs: now() - started, attempts, usage };
    log({
      status,
      model: deps.model,
      durationMs: meta.durationMs,
      attempts,
      retries: Math.max(0, attempts - 1),
      inputTokens: usage?.inputTokens ?? null,
      outputTokens: usage?.outputTokens ?? null,
      cacheReadTokens: usage?.cacheReadTokens ?? null,
      reason: reason ?? null,
    });
    return { status, body, meta };
  };

  if (method.toUpperCase() !== 'POST') return finish(405, { error: 'method_not_allowed' });
  if (!deps.client) return finish(500, { error: 'server_misconfigured' });

  if (rawBody === null || Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) return finish(400, { error: 'bad_request' }, 'body_size');
  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return finish(400, { error: 'bad_request' }, 'json');
  }
  const request = chatRequestSchema.safeParse(json);
  if (!request.success) return finish(400, { error: 'bad_request' }, 'schema');
  const { history, input } = request.data;
  // Starting means an empty history; replying needs one.
  if ((input === null) !== (history.length === 0)) return finish(400, { error: 'bad_request' }, 'shape');

  const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant');
  // The consultation is over: answer with the same closing turn, like the scripted provider.
  if (lastAssistant && lastAssistant.turn.status !== 'asking') return finish(200, { turn: lastAssistant.turn }, 'closed');

  const previous = lastAssistant?.turn.profile ?? {};
  const messages = toClaudeMessages(history, input, previous);
  const budget = deps.totalBudgetMs ?? TOTAL_BUDGET_MS;
  const minRetry = deps.minRetryBudgetMs ?? MIN_RETRY_BUDGET_MS;

  let lastReason = 'none';
  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = budget - (now() - started);
    if (attempt > 0 && remaining < minRetry) break;

    let response: Anthropic.Message;
    try {
      attempts++;
      response = await deps.client.messages.create(
        {
          model: deps.model,
          max_tokens: MAX_TOKENS,
          system: [{ type: 'text', text: deps.systemPrompt ?? SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
          messages,
          output_config: { effort: EFFORT, format: { type: 'json_schema', schema: TURN_OUTPUT_SCHEMA } },
        },
        { timeout: Math.max(1, remaining), maxRetries: 0 },
      );
    } catch (error) {
      const kind = error instanceof Anthropic.APIError ? `api_${error.status ?? 'connection'}` : 'unknown';
      return finish(503, { error: 'upstream_unavailable' }, kind);
    }

    const u = response.usage;
    inputTokens += (u?.input_tokens ?? 0) + (u?.cache_creation_input_tokens ?? 0) + (u?.cache_read_input_tokens ?? 0);
    outputTokens += u?.output_tokens ?? 0;
    cacheReadTokens += u?.cache_read_input_tokens ?? 0;
    usage = { inputTokens, outputTokens, cacheReadTokens };

    const text = textOf(response);
    const result: Validation =
      response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens'
        ? { ok: false, reason: `stop_${response.stop_reason}` }
        : validateModelTurn(text, previous, deps.catalog);
    if (result.ok) return finish(200, { turn: result.turn }, attempt > 0 ? `retried_${lastReason}` : undefined);

    lastReason = result.reason;
    if (text) messages.push({ role: 'assistant', content: text });
    messages.push({ role: 'user', content: `${RETRY_INSTRUCTION} (Problema: ${describeProblem(result.reason)})` });
  }
  return finish(502, { error: 'model_invalid' }, lastReason);
}

function describeProblem(reason: string): string {
  switch (reason) {
    case 'unknown_product':
      return 'recomendaste un id que no existe en el catálogo; usa solo los ids listados.';
    case 'spherical_with_astigmatism':
      return 'el cliente tiene astigmatismo y recomendaste un esférico; recomienda solo tóricos.';
    case 'json':
      return 'la respuesta no fue un objeto JSON válido.';
    case 'stop_max_tokens':
      return 'la respuesta quedó incompleta; sé más breve.';
    default:
      return 'el turno no cumplió el esquema (por ejemplo: recomendaciones solo en "done", máximo 4 opciones con id únicos, sin opciones en "refer").';
  }
}
