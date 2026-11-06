/**
 * Conversation state of the consultation: a pure reducer plus the hook that
 * talks to the provider.
 *
 * Rules the reducer enforces (each one covered by tests):
 * - `start` only from 'idle', so it is idempotent (IntersectionObserver,
 *   #consulta and StrictMode's double mount may all fire it).
 * - `send` only while 'asking'; empty or whitespace-only text is ignored.
 *   No double send while 'waiting'.
 * - Every request gets a new `requestId`. A response is accepted only if its
 *   id is the current one AND the phase is still 'waiting'. Late responses
 *   after a restart and duplicates are ignored.
 * - An invalid turn, a provider error, or a 'done' turn none of whose products
 *   exist in the catalog → 'error', keeping the conversation.
 * - `retry` re-sends the last request (same history, same input) with a NEW id.
 *
 * Nothing here is persisted: no localStorage, sessionStorage or cookies.
 */
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { CATALOG, type Product } from './catalog';
import { getConsultaProvider } from './providers';
import { progressFraction, progressLabel } from './progress';
import { resolveRecommendations, type ResolvedRecommendation } from './recommend';
import { parseAssistantTurn } from './schema';
import type {
  ConsultaProvider,
  ConversationMessage,
  CustomerProfile,
  QuickReply,
  TurnStatus,
  UserInput,
} from './types';

export type ConsultaPhase = 'idle' | 'waiting' | 'asking' | 'done' | 'refer' | 'error';
export type ConsultaError = 'invalid-turn' | 'provider';

export type PendingRequest =
  | { kind: 'start' }
  | { kind: 'reply'; history: ConversationMessage[]; input: UserInput };

export interface ConsultaState {
  messages: ConversationMessage[];
  profile: CustomerProfile;
  /** Status of the last accepted turn; null before the first one. */
  status: TurnStatus | null;
  quickReplies: QuickReply[];
  recommendations: ResolvedRecommendation[];
  notes: string[];
  phase: ConsultaPhase;
  draft: string;
  requestId: number;
  /** Last request sent, kept for `retry`. */
  pending: PendingRequest | null;
  error: ConsultaError | null;
}

export type ConsultaAction =
  | { type: 'start' }
  | { type: 'send'; input: UserInput }
  | { type: 'received'; requestId: number; raw: unknown }
  | { type: 'failed'; requestId: number }
  | { type: 'retry' }
  | { type: 'reset' }
  | { type: 'setDraft'; draft: string };

export function createInitialState(): ConsultaState {
  return {
    messages: [],
    profile: {},
    status: null,
    quickReplies: [],
    recommendations: [],
    notes: [],
    phase: 'idle',
    draft: '',
    requestId: 0,
    pending: null,
    error: null,
  };
}

const isCurrent = (state: ConsultaState, requestId: number) =>
  requestId === state.requestId && state.phase === 'waiting';

export function createConsultaReducer(catalog: readonly Product[]) {
  return function consultaReducer(state: ConsultaState, action: ConsultaAction): ConsultaState {
    switch (action.type) {
      case 'start':
        if (state.phase !== 'idle') return state;
        return { ...state, phase: 'waiting', requestId: state.requestId + 1, pending: { kind: 'start' }, error: null };

      case 'send': {
        if (state.phase !== 'asking') return state;
        const { input } = action;
        const text = input.kind === 'quick' ? input.label.trim() : input.text.trim();
        if (!text) return state;
        const normalized: UserInput = input.kind === 'quick' ? { ...input, label: text } : { kind: 'text', text };
        return {
          ...state,
          messages: [...state.messages, { role: 'user', text }],
          quickReplies: [],
          draft: input.kind === 'text' ? '' : state.draft,
          phase: 'waiting',
          requestId: state.requestId + 1,
          pending: { kind: 'reply', history: state.messages, input: normalized },
          error: null,
        };
      }

      case 'received': {
        if (!isCurrent(state, action.requestId)) return state;
        const turn = parseAssistantTurn(action.raw);
        if (!turn) return { ...state, phase: 'error', error: 'invalid-turn' };
        const recommendations = turn.status === 'done' ? resolveRecommendations(turn.recommendations, catalog) : [];
        // A finished consultation is never shown without products.
        if (turn.status === 'done' && recommendations.length === 0) {
          return { ...state, phase: 'error', error: 'invalid-turn' };
        }
        return {
          ...state,
          messages: [...state.messages, { role: 'assistant', turn }],
          profile: turn.profile,
          status: turn.status,
          quickReplies: turn.status === 'asking' ? turn.quickReplies : [],
          recommendations,
          notes: turn.notes,
          phase: turn.status,
          pending: null,
          error: null,
        };
      }

      case 'failed':
        if (!isCurrent(state, action.requestId)) return state;
        return { ...state, phase: 'error', error: 'provider' };

      case 'retry':
        if (state.phase !== 'error' || !state.pending) return state;
        return { ...state, phase: 'waiting', requestId: state.requestId + 1, error: null };

      case 'reset':
        // Back to a clean conversation and straight into a new start. The new
        // id makes any response still in flight stale.
        return {
          ...createInitialState(),
          phase: 'waiting',
          requestId: state.requestId + 1,
          pending: { kind: 'start' },
        };

      case 'setDraft':
        return state.draft === action.draft ? state : { ...state, draft: action.draft };
    }
  };
}

export const consultaReducer = createConsultaReducer(CATALOG);

export function useConsulta(provider: ConsultaProvider = getConsultaProvider()) {
  const [state, dispatch] = useReducer(consultaReducer, undefined, createInitialState);
  const { phase, pending, requestId } = state;

  // One provider call per request id. The cleanup flag drops the result when
  // the effect is torn down (StrictMode's second run, unmount, a newer id);
  // the reducer additionally ignores anything not for the current id while
  // 'waiting'.
  useEffect(() => {
    if (phase !== 'waiting' || !pending) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => (pending.kind === 'start' ? provider.start() : provider.reply(pending.history, pending.input)))
      .then(
        (raw) => {
          if (!cancelled) dispatch({ type: 'received', requestId, raw });
        },
        () => {
          if (!cancelled) dispatch({ type: 'failed', requestId });
        },
      );
    return () => {
      cancelled = true;
    };
    // `phase` and `pending` only change together with `requestId` when a request starts.
  }, [provider, requestId]);

  const start = useCallback(() => dispatch({ type: 'start' }), []);
  const sendQuick = useCallback(
    (reply: QuickReply) => dispatch({ type: 'send', input: { kind: 'quick', replyId: reply.id, label: reply.label } }),
    [],
  );
  const sendText = useCallback((text: string) => dispatch({ type: 'send', input: { kind: 'text', text } }), []);
  const retry = useCallback(() => dispatch({ type: 'retry' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const setDraft = useCallback((draft: string) => dispatch({ type: 'setDraft', draft }), []);

  const progress = useMemo(
    () => ({ label: progressLabel(state.profile, state.status), fraction: progressFraction(state.profile, state.status) }),
    [state.profile, state.status],
  );

  return { state, progress, start, sendQuick, sendText, retry, reset, setDraft };
}
