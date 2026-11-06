/**
 * Server configuration for the consultation. The only place that names a model.
 *
 * Runtime imports in `server/` and `api/` use `.js` specifiers: Vercel runs the
 * transpiled files as native ES modules, and Node does not resolve
 * extensionless relative imports.
 */

export const DEFAULT_MODEL = 'claude-haiku-5-5';

/** Thinking depth per turn. A turn is a short, rule-bound reply: low is enough and keeps latency down. */
export const EFFORT = 'low' as const;

/**
 * Output cap per model call. A turn is about 300–600 tokens of JSON; adaptive
 * thinking also counts against this cap, so it leaves room for it without
 * letting a runaway answer through. A cut-off turn (`max_tokens`) is invalid.
 */
export const MAX_TOKENS = 2048;

/**
 * Wall-clock budget for one request, both attempts included. The client gives
 * up after 12 s and answers that turn with the scripted provider, so the
 * server must finish (or fail) before that.
 */
export const TOTAL_BUDGET_MS = 10_000;

/** A retry is only attempted when at least this much of the budget is left. */
export const MIN_RETRY_BUDGET_MS = 2_500;

export interface ServerEnv {
  ANTHROPIC_API_KEY?: string | undefined;
  ANTHROPIC_MODEL?: string | undefined;
}

export interface ChatConfig {
  apiKey: string | null;
  model: string;
}

export function readConfig(env: ServerEnv): ChatConfig {
  const apiKey = env.ANTHROPIC_API_KEY?.trim() || null;
  const model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  return { apiKey, model };
}
