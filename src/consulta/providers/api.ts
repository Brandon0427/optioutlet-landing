/**
 * API provider: asks `/api/chat` (Claude on the server) for each turn.
 *
 * The demo can't hang: if the request times out, the answer isn't a 200, the
 * network fails or the turn doesn't pass `parseAssistantTurn`, that turn is
 * answered by the fallback (the scripted provider). The fallback can take
 * over at any point because the contract is stateless: it rebuilds the
 * conversation from the last turn's accumulated profile. The UI never sees an
 * error caused by the model.
 *
 * A 429 (the per-visitor rate limit of the Vercel firewall) is different: that
 * turn AND the rest of the consultation go to the fallback, without calling
 * the API again, so the two voices don't mix and the limit isn't hit again.
 * `start()` (a restart, or a page reload) tries the API again. Every other
 * failure falls back for that turn only.
 *
 * Identical concurrent requests share one promise (StrictMode mounts the
 * request effect twice in development), so a turn is never paid for twice.
 *
 * No React or DOM imports.
 */
import { parseAssistantTurn } from '../schema';
import type { AssistantTurn, ConsultaProvider, ConversationMessage, UserInput } from '../types';

export const DEFAULT_TIMEOUT_MS = 12_000;

export interface ApiProviderOptions {
  /** Answers any turn the API can't (the scripted provider). */
  fallback: ConsultaProvider;
  timeoutMs?: number;
  /** Origin of the backend; '' = same origin. */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Called with the cause each time a turn falls back. Default: console.warn in development only. */
  onFallback?: (cause: string) => void;
}

class FallbackCause extends Error {}

/** HTTP status that pins the rest of the consultation to the fallback. */
export const RATE_LIMITED_STATUS = 429;

const devWarn = (cause: string) => {
  if (import.meta.env.DEV) console.warn(`[consulta] /api/chat → respaldo guionado (${cause})`);
};

export function createApiConsultaProvider(options: ApiProviderOptions): ConsultaProvider {
  const { fallback, timeoutMs = DEFAULT_TIMEOUT_MS, baseUrl = '', fetchImpl = fetch, onFallback = devWarn } = options;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/chat`;
  const inFlight = new Map<string, Promise<AssistantTurn>>();
  /** Set by a 429; cleared by `start()`. */
  let rateLimited = false;

  async function requestTurn(history: ConversationMessage[], input: UserInput | null): Promise<AssistantTurn> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ history, input }),
          signal: controller.signal,
        });
      } catch {
        throw new FallbackCause(controller.signal.aborted ? 'timeout' : 'network');
      }
      if (response.status === RATE_LIMITED_STATUS) rateLimited = true;
      if (response.status !== 200) throw new FallbackCause(`http ${response.status}`);
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new FallbackCause(controller.signal.aborted ? 'timeout' : 'invalid json');
      }
      const turn = parseAssistantTurn((json as { turn?: unknown } | null)?.turn);
      if (!turn) throw new FallbackCause('invalid turn');
      return turn;
    } finally {
      clearTimeout(timer);
    }
  }

  function turnFor(history: ConversationMessage[], input: UserInput | null, useFallback: () => Promise<AssistantTurn>) {
    if (rateLimited) return useFallback();
    const key = JSON.stringify({ history, input });
    const pending = inFlight.get(key);
    if (pending) return pending;

    const promise = requestTurn(history, input)
      .catch((error: unknown) => {
        onFallback(error instanceof FallbackCause ? error.message : 'unknown');
        return useFallback();
      })
      .finally(() => {
        // Resolved, failed or aborted: the next identical request makes a new call.
        if (inFlight.get(key) === promise) inFlight.delete(key);
      });
    inFlight.set(key, promise);
    return promise;
  }

  return {
    start: () => {
      // A new consultation: try the API again after a 429.
      rateLimited = false;
      return turnFor([], null, () => fallback.start());
    },
    reply: (history, input) => turnFor(history, input, () => fallback.reply(history, input)),
  };
}
