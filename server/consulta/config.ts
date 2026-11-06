/**
 * Server configuration for the consultation. The only place that names a model.
 *
 * Runtime imports in `server/` and `api/` use `.js` specifiers: Vercel runs the
 * transpiled files as native ES modules, and Node does not resolve
 * extensionless relative imports.
 */

/**
 * Model when `ANTHROPIC_MODEL` is not set. Sonnet 5.5 by the owner's decision
 * (Session 3): in the live evaluation both Haiku 5.5 and Sonnet 5.5 passed
 * 10/10, but Haiku reasons less. Any other model is chosen with the
 * environment variable, locally (`.env.local`) or in Vercel, without code changes.
 */
export const DEFAULT_MODEL = 'claude-sonnet-5-5';

/** Reasoning depth per turn, set with `ANTHROPIC_EFFORT`. */
export const EFFORTS = ['low', 'medium', 'high'] as const;
export type Effort = (typeof EFFORTS)[number];

/**
 * Effort when `ANTHROPIC_EFFORT` is not set (or is not one of `EFFORTS`).
 * Medium since Session 3: with Sonnet 5.5 its p95 per turn was 2.9 s, under
 * the 6 s bar set for adopting it (docs/verificacion-sesion-3.md).
 */
export const DEFAULT_EFFORT: Effort = 'medium';

/**
 * Output cap per model call. A turn is about 300–600 tokens of JSON; adaptive
 * thinking also counts against this cap, and at medium or high effort it can
 * take a few thousand. The cap leaves that room without letting a runaway
 * answer through. A cut-off turn (`max_tokens`) is invalid.
 */
export const MAX_TOKENS = 4096;

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
  ANTHROPIC_EFFORT?: string | undefined;
}

export interface ChatConfig {
  apiKey: string | null;
  model: string;
  effort: Effort;
}

const isEffort = (value: string): value is Effort => (EFFORTS as readonly string[]).includes(value);

export function readConfig(env: ServerEnv): ChatConfig {
  const apiKey = env.ANTHROPIC_API_KEY?.trim() || null;
  const model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  const requested = env.ANTHROPIC_EFFORT?.trim().toLowerCase() ?? '';
  const effort = isEffort(requested) ? requested : DEFAULT_EFFORT;
  return { apiKey, model, effort };
}
