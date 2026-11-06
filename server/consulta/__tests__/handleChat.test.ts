import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import type { AssistantTurn, ConversationMessage, CustomerProfile } from '../../../src/consulta/types.js';
import { handleChat, RETRY_INSTRUCTION, type ChatDeps, type MessagesClient } from '../handleChat.js';
import { MAX_BODY_BYTES } from '../requestSchema.js';

const MODEL = 'model-under-test';
const SECRET = 'TEXTO-INTERNO-DEL-MODELO';

const asking = (profile: CustomerProfile = {}, message = '¿Cómo es un día normal para ti?'): AssistantTurn => ({
  message,
  quickReplies: [
    { id: 'office-screens', label: 'Oficina y computadora' },
    { id: 'outdoors-active', label: 'Afuera y en movimiento' },
  ],
  profile,
  status: 'asking',
  recommendations: [],
  notes: [],
});

const FULL: CustomerProfile = { experience: 'experienced', routine: 'office-screens', frequency: 'daily', astigmatism: 'no', prescription: 'current' };

const done = (profile: CustomerProfile, ids: [string, string]): AssistantTurn => ({
  message: 'Listo. Estos son los lentes que te recomiendo.',
  quickReplies: [],
  profile,
  status: 'done',
  recommendations: [
    { productId: ids[0], rank: 1, reason: 'Porque los usarías todos los días.' },
    { productId: ids[1], rank: 2, reason: 'Si prefieres un par nuevo cada día.' },
  ],
  notes: [],
});

function message(text: string, stop_reason: Anthropic.StopReason = 'end_turn'): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: MODEL,
    content: [{ type: 'text', text, citations: null }],
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: 60, cache_creation_input_tokens: 40, cache_read_input_tokens: 0, output_tokens: 50 },
  } as unknown as Anthropic.Message;
}

/** A client double that answers with the given sequence (a value is returned, an Error is thrown). */
function fakeClient(...answers: (Anthropic.Message | Error)[]) {
  const create = vi.fn(async (_body: Anthropic.MessageCreateParamsNonStreaming, _options?: object): Promise<Anthropic.Message> => {
    const next = answers.shift();
    if (!next) throw new Error('no more answers');
    if (next instanceof Error) throw next;
    return next;
  });
  const client: MessagesClient = { messages: { create } };
  return { client, create };
}

const deps = (client: MessagesClient | null, extra: Partial<ChatDeps> = {}): ChatDeps => ({ client, model: MODEL, log: () => {}, ...extra });

const body = (history: ConversationMessage[], input: unknown) => JSON.stringify({ history, input });

const midHistory = (profile: CustomerProfile): ConversationMessage[] => [
  { role: 'assistant', turn: asking(profile, 'Para empezar, ¿ya usas lentes de contacto?') },
];
const quick = { kind: 'quick', replyId: 'experienced', label: 'Sí, ya los uso' };

describe('handleChat', () => {
  it('valid turn → 200 with the turn, one model call', async () => {
    const turn = asking({ experience: 'experienced' });
    const { client, create } = fakeClient(message(JSON.stringify(turn)));
    const res = await handleChat('POST', body(midHistory({}), quick), deps(client));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ turn });
    expect(create).toHaveBeenCalledTimes(1);
    expect(res.meta).toMatchObject({ model: MODEL, attempts: 1, usage: { inputTokens: 100, outputTokens: 50, cacheReadTokens: 0 } });
  });

  it('starts the consultation with input null', async () => {
    const turn = asking({}, 'Hola. Para empezar, ¿ya usas lentes de contacto?');
    const { client, create } = fakeClient(message(JSON.stringify(turn)));
    const res = await handleChat('POST', body([], null), deps(client));
    expect(res.status).toBe(200);
    const params = create.mock.calls[0]![0] as Anthropic.MessageCreateParamsNonStreaming;
    expect(params.model).toBe(MODEL);
    expect(params.messages[0]!.role).toBe('user');
    expect(params.output_config?.format?.type).toBe('json_schema');
    expect(params).not.toHaveProperty('tool_choice');
    expect(params.output_config?.effort).toBe('medium');
  });

  it('sends the configured effort', async () => {
    const { client, create } = fakeClient(message(JSON.stringify(asking())));
    const res = await handleChat('POST', body([], null), deps(client, { effort: 'high' }));
    expect((create.mock.calls[0]![0] as Anthropic.MessageCreateParamsNonStreaming).output_config?.effort).toBe('high');
    expect(res.meta.effort).toBe('high');
  });

  it('invalid then valid → 200 after one retry that explains the problem', async () => {
    const turn = asking({ experience: 'experienced' });
    const { client, create } = fakeClient(message('esto no es JSON'), message(JSON.stringify(turn)));
    const res = await handleChat('POST', body(midHistory({}), quick), deps(client));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ turn });
    expect(create).toHaveBeenCalledTimes(2);
    const retry = create.mock.calls[1]![0] as Anthropic.MessageCreateParamsNonStreaming;
    const last = retry.messages[retry.messages.length - 1]!;
    expect(last.role).toBe('user');
    expect(String(last.content)).toContain(RETRY_INSTRUCTION);
    expect(res.meta).toMatchObject({ attempts: 2, usage: { inputTokens: 200, outputTokens: 100, cacheReadTokens: 0 } });
  });

  it('two invalid answers → 502', async () => {
    const { client, create } = fakeClient(message(`{"message": "${SECRET}"}`), message(`{"message": "${SECRET}"}`));
    const res = await handleChat('POST', body(midHistory({}), quick), deps(client));
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'model_invalid' });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("'done' with an unknown productId counts as invalid", async () => {
    const bad = done(FULL, ['jj-biweekly-spherical', 'producto-inventado']);
    const good = done(FULL, ['jj-biweekly-spherical', 'jj-daily-spherical']);
    const { client, create } = fakeClient(message(JSON.stringify(bad)), message(JSON.stringify(good)));
    const res = await handleChat('POST', body(midHistory({ ...FULL, prescription: undefined }), quick), deps(client));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ turn: good });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("'done' with astigmatism 'yes' and a spherical recommendation counts as invalid and is retried", async () => {
    const astig = { ...FULL, astigmatism: 'yes' } as const;
    const bad = done(astig, ['jj-biweekly-toric', 'jj-daily-spherical']);
    const { client, create } = fakeClient(message(JSON.stringify(bad)), message(JSON.stringify(bad)));
    const res = await handleChat('POST', body(midHistory({ ...astig, prescription: undefined }), quick), deps(client));
    expect(res.status).toBe(502);
    expect(create).toHaveBeenCalledTimes(2);
    const retry = create.mock.calls[1]![0] as Anthropic.MessageCreateParamsNonStreaming;
    expect(String(retry.messages[retry.messages.length - 1]!.content)).toContain('astigmatismo');

    const good = done(astig, ['jj-biweekly-toric', 'jj-daily-toric']);
    const second = fakeClient(message(JSON.stringify(bad)), message(JSON.stringify(good)));
    const ok = await handleChat('POST', body(midHistory({ ...astig, prescription: undefined }), quick), deps(second.client));
    expect(ok.status).toBe(200);
    expect(ok.body).toEqual({ turn: good });
  });

  it('the astigmatism rule also applies when only the previous profile says yes', async () => {
    const turnWithoutAstig = done({ ...FULL, astigmatism: undefined }, ['jj-biweekly-spherical', 'jj-daily-spherical']);
    const { client } = fakeClient(message(JSON.stringify(turnWithoutAstig)), message(JSON.stringify(turnWithoutAstig)));
    const res = await handleChat('POST', body(midHistory({ ...FULL, astigmatism: 'yes', prescription: undefined }), quick), deps(client));
    expect(res.status).toBe(502);
  });

  it('the profile keeps every field even when the model omits them', async () => {
    const previous: CustomerProfile = { experience: 'first-time', routine: 'outdoors-active' };
    const fromModel = asking({ frequency: 'occasional' });
    const { client } = fakeClient(message(JSON.stringify(fromModel)));
    const res = await handleChat('POST', body(midHistory(previous), { kind: 'text', text: 'solo en fiestas' }), deps(client));
    expect(res.status).toBe(200);
    expect('turn' in res.body && res.body.turn.profile).toEqual({ experience: 'first-time', routine: 'outdoors-active', frequency: 'occasional' });
  });

  it('the model may correct a field', async () => {
    const { client } = fakeClient(message(JSON.stringify(asking({ experience: 'experienced' }))));
    const res = await handleChat('POST', body(midHistory({ experience: 'first-time' }), quick), deps(client));
    expect('turn' in res.body && res.body.turn.profile).toEqual({ experience: 'experienced' });
  });

  it('a refusal or a cut-off answer is invalid', async () => {
    const turn = asking();
    const { client, create } = fakeClient(message('', 'refusal'), message(JSON.stringify(turn).slice(0, 20), 'max_tokens'));
    const res = await handleChat('POST', body(midHistory({}), quick), deps(client));
    expect(res.status).toBe(502);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('a finished consultation answers with its closing turn without calling the model', async () => {
    const closing = done(FULL, ['jj-biweekly-spherical', 'jj-daily-spherical']);
    const { client, create } = fakeClient();
    const res = await handleChat('POST', body([{ role: 'assistant', turn: closing }], { kind: 'text', text: 'gracias' }), deps(client));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ turn: closing });
    expect(create).not.toHaveBeenCalled();
  });

  it('skips the retry when the budget is nearly spent', async () => {
    let t = 0;
    const { client, create } = fakeClient(message('x'), message(JSON.stringify(asking())));
    create.mockImplementationOnce(async () => {
      t += 9_000;
      return message('x');
    });
    const res = await handleChat('POST', body(midHistory({}), quick), deps(client, { now: () => t, totalBudgetMs: 10_000, minRetryBudgetMs: 2_500 }));
    expect(res.status).toBe(502);
    expect(create).toHaveBeenCalledTimes(1);
  });

  describe('errors', () => {
    const okClient = () => fakeClient(message(JSON.stringify(asking()))).client;

    it.each(['GET', 'PUT', 'DELETE'])('%s → 405', async (method) => {
      const res = await handleChat(method, '', deps(okClient()));
      expect(res).toMatchObject({ status: 405, body: { error: 'method_not_allowed' } });
    });

    it('missing key → 500', async () => {
      const res = await handleChat('POST', body([], null), deps(null));
      expect(res).toMatchObject({ status: 500, body: { error: 'server_misconfigured' } });
    });

    it.each([
      ['malformed JSON', '{"history": ['],
      ['body over 64 kB', JSON.stringify({ history: [], input: null, pad: 'x'.repeat(MAX_BODY_BYTES) })],
      ['unreadable body (adapter passed null)', null],
      ['history over 30 messages', body(Array.from({ length: 31 }, () => ({ role: 'user', text: 'hola' })), quick)],
      ['user text over 500 characters', body(midHistory({}), { kind: 'text', text: 'a'.repeat(501) })],
      ['history text over 500 characters', body([...midHistory({}), { role: 'user', text: 'a'.repeat(501) }], quick)],
      ['empty text', body(midHistory({}), { kind: 'text', text: '   ' })],
      ['invalid assistant turn in history', JSON.stringify({ history: [{ role: 'assistant', turn: { ...asking(), status: 'unknown' } }], input: quick })],
      ['unknown input kind', body(midHistory({}), { kind: 'voice', text: 'hola' })],
      ['input null with history', body(midHistory({}), null)],
      ['input without history', body([], quick)],
      ['not an object', '"hola"'],
    ])('%s → 400', async (_name, raw) => {
      const { client, create } = fakeClient();
      const res = await handleChat('POST', raw, deps(client));
      expect(res).toMatchObject({ status: 400, body: { error: 'bad_request' } });
      expect(create).not.toHaveBeenCalled();
    });

    it.each([
      ['timeout', new Anthropic.APIConnectionTimeoutError()],
      ['connection', new Anthropic.APIConnectionError({ message: SECRET })],
      ['500 from the API', new Anthropic.InternalServerError(500, { error: SECRET }, SECRET, new Headers())],
      ['429 from the API', new Anthropic.RateLimitError(429, { error: SECRET }, SECRET, new Headers())],
      ['unexpected error', new Error(SECRET)],
    ])('API error (%s) → 503 without retry', async (_name, error) => {
      const { client, create } = fakeClient(error);
      const res = await handleChat('POST', body(midHistory({}), quick), deps(client));
      expect(res).toMatchObject({ status: 503, body: { error: 'upstream_unavailable' } });
      expect(create).toHaveBeenCalledTimes(1);
    });

    it('no error body or log line carries model text or configuration', async () => {
      const lines: string[] = [];
      const log = (entry: object) => lines.push(JSON.stringify(entry));
      const cases: [string, string | null, MessagesClient | null][] = [
        ['GET', '', okClient()],
        ['POST', body([], null), null],
        ['POST', '{', okClient()],
        ['POST', body(midHistory({}), quick), fakeClient(message(SECRET), message(SECRET)).client],
        ['POST', body(midHistory({}), quick), fakeClient(new Anthropic.APIConnectionError({ message: SECRET })).client],
      ];
      for (const [method, raw, client] of cases) {
        const res = await handleChat(method, raw, deps(client, { log, systemPrompt: `PROMPT ${SECRET}` }));
        const text = JSON.stringify(res.body);
        expect(Object.keys(res.body)).toEqual(['error']);
        expect(text).not.toContain(SECRET);
        expect(text).not.toContain('PROMPT');
        expect(text).not.toContain(MODEL);
        expect(text).not.toMatch(/sk-ant|ANTHROPIC/);
      }
      expect(lines.join('\n')).not.toContain(SECRET);
    });

    it('logs metadata only, never conversation content', async () => {
      const lines: string[] = [];
      const userText = 'trabajo en una oficina de contabilidad';
      const { client } = fakeClient(message(JSON.stringify(asking({ experience: 'experienced' }))));
      await handleChat('POST', body(midHistory({}), { kind: 'text', text: userText }), deps(client, { log: (e) => lines.push(JSON.stringify(e)) }));
      expect(lines).toHaveLength(1);
      const entry = JSON.parse(lines[0]!);
      expect(Object.keys(entry).sort()).toEqual(['attempts', 'cacheReadTokens', 'durationMs', 'effort', 'inputTokens', 'model', 'outputTokens', 'reason', 'retries', 'status']);
      expect(lines[0]).not.toContain(userText);
      expect(lines[0]).not.toContain('día normal');
    });
  });
});
