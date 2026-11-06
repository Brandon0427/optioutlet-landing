import { describe, expect, it } from 'vitest';
import { consultaScript } from '../../content/consulta';
import { scriptedReply } from '../providers/scripted';
import type { AssistantTurn, UserInput } from '../types';
import { consultaReducer, createInitialState, type ConsultaAction, type ConsultaState } from '../useConsulta';

const reduce = (state: ConsultaState, ...actions: ConsultaAction[]) => actions.reduce(consultaReducer, state);

const firstTurn = scriptedReply([], { kind: 'text', text: '' });

/** Answers the pending request with the scripted provider, as the hook would. */
function respond(state: ConsultaState): ConsultaState {
  const { pending } = state;
  if (!pending) throw new Error('nothing pending');
  const turn = pending.kind === 'start' ? firstTurn : scriptedReply(pending.history, pending.input);
  return consultaReducer(state, { type: 'received', requestId: state.requestId, raw: turn });
}

const quick = (id: string, label: string): ConsultaAction => ({ type: 'send', input: { kind: 'quick', replyId: id, label } });
const text = (t: string): ConsultaAction => ({ type: 'send', input: { kind: 'text', text: t } });

/** A conversation that already asked the first question. */
const asking = () => respond(reduce(createInitialState(), { type: 'start' }));

const optiMessages = (s: ConsultaState) => s.messages.filter((m) => m.role === 'assistant');

describe('consultaReducer', () => {
  it('starts in idle, then waits for the first turn', () => {
    const s0 = createInitialState();
    expect(s0.phase).toBe('idle');
    const s1 = consultaReducer(s0, { type: 'start' });
    expect(s1.phase).toBe('waiting');
    expect(s1.requestId).toBe(1);
    const s2 = respond(s1);
    expect(s2.phase).toBe('asking');
    expect(s2.quickReplies).toHaveLength(2);
    expect(optiMessages(s2)).toHaveLength(1);
  });

  it('start is idempotent: only accepted from idle', () => {
    const s1 = consultaReducer(createInitialState(), { type: 'start' });
    expect(consultaReducer(s1, { type: 'start' })).toBe(s1);
    const s2 = respond(s1);
    expect(consultaReducer(s2, { type: 'start' })).toBe(s2);
  });

  it('records a quick reply as the user message and waits', () => {
    const s = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    expect(s.phase).toBe('waiting');
    expect(s.messages.at(-1)).toEqual({ role: 'user', text: 'Sí, ya los uso' });
    expect(s.quickReplies).toEqual([]);
    expect(s.pending).toEqual({
      kind: 'reply',
      history: asking().messages,
      input: { kind: 'quick', replyId: 'experienced', label: 'Sí, ya los uso' },
    });
  });

  it('blocks a double send while waiting', () => {
    const s1 = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    expect(consultaReducer(s1, text('otra cosa'))).toBe(s1);
    expect(consultaReducer(s1, quick('first-time', 'Sería mi primera vez'))).toBe(s1);
  });

  it.each(['', '   ', '\n\t '])('does not send empty text %j', (t) => {
    const s = asking();
    expect(consultaReducer(s, text(t))).toBe(s);
  });

  it('trims text and clears the draft on send', () => {
    const s = reduce(asking(), { type: 'setDraft', draft: '  ya los uso  ' }, text('  ya los uso  '));
    expect(s.messages.at(-1)).toEqual({ role: 'user', text: 'ya los uso' });
    expect(s.draft).toBe('');
    expect((s.pending as { input: UserInput }).input).toEqual({ kind: 'text', text: 'ya los uso' });
  });

  it('discards a late response after a restart', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const staleId = waiting.requestId;
    const staleTurn = scriptedReply(waiting.messages, { kind: 'quick', replyId: 'experienced', label: 'Sí, ya los uso' });

    const restarted = consultaReducer(waiting, { type: 'reset' });
    expect(restarted.phase).toBe('waiting');
    expect(restarted.messages).toEqual([]);
    expect(restarted.requestId).toBeGreaterThan(staleId);

    const afterLate = consultaReducer(restarted, { type: 'received', requestId: staleId, raw: staleTurn });
    expect(afterLate).toBe(restarted);
    const afterLateFail = consultaReducer(restarted, { type: 'failed', requestId: staleId });
    expect(afterLateFail).toBe(restarted);

    const fresh = respond(restarted);
    expect(fresh.phase).toBe('asking');
    expect(fresh.profile).toEqual({});
    expect(fresh.messages).toHaveLength(1);
  });

  it('accepts a response only once: a duplicate with the same id adds one Opti message', () => {
    const s1 = consultaReducer(createInitialState(), { type: 'start' });
    const action: ConsultaAction = { type: 'received', requestId: s1.requestId, raw: firstTurn };
    const s2 = reduce(s1, action, action);
    expect(optiMessages(s2)).toHaveLength(1);
    expect(s2.phase).toBe('asking');
  });

  it('moves to error on an invalid turn, keeping the conversation', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const bad = { ...firstTurn, status: 'thinking' };
    const s = consultaReducer(waiting, { type: 'received', requestId: waiting.requestId, raw: bad });
    expect(s.phase).toBe('error');
    expect(s.error).toBe('invalid-turn');
    expect(s.messages).toEqual(waiting.messages);
    expect(s.pending).toEqual(waiting.pending);
  });

  it('moves to error on a provider failure, keeping the conversation', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const s = consultaReducer(waiting, { type: 'failed', requestId: waiting.requestId });
    expect(s.phase).toBe('error');
    expect(s.error).toBe('provider');
    expect(s.messages).toEqual(waiting.messages);
  });

  it('does not accept sends while in error', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const s = consultaReducer(waiting, { type: 'failed', requestId: waiting.requestId });
    expect(consultaReducer(s, text('hola'))).toBe(s);
  });

  it('retry repeats the last request with the same history and a NEW id', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const failed = consultaReducer(waiting, { type: 'failed', requestId: waiting.requestId });
    const retried = consultaReducer(failed, { type: 'retry' });
    expect(retried.phase).toBe('waiting');
    expect(retried.requestId).toBe(waiting.requestId + 1);
    expect(retried.pending).toBe(waiting.pending);
    expect(retried.messages).toEqual(waiting.messages);

    // The failed request's id is now stale.
    expect(consultaReducer(retried, { type: 'received', requestId: waiting.requestId, raw: firstTurn })).toBe(retried);
    const ok = respond(retried);
    expect(ok.phase).toBe('asking');
    expect(ok.profile).toEqual({ experience: 'experienced' });
  });

  it('retry also works for a failed start', () => {
    const s1 = consultaReducer(createInitialState(), { type: 'start' });
    const failed = consultaReducer(s1, { type: 'failed', requestId: s1.requestId });
    const retried = consultaReducer(failed, { type: 'retry' });
    expect(retried.pending).toEqual({ kind: 'start' });
    expect(respond(retried).phase).toBe('asking');
  });

  it('retry is ignored outside error', () => {
    const s = asking();
    expect(consultaReducer(s, { type: 'retry' })).toBe(s);
  });

  it('reaches done with resolved recommendations and notes', () => {
    let s = asking();
    for (const [id, label] of [
      ['experienced', 'Sí, ya los uso'],
      ['office-screens', 'Oficina y computadora'],
      ['daily', 'Todos los días'],
      ['unsure', 'No lo sé'],
      ['expired-or-none', 'No, o no tengo receta'],
    ] as const) {
      s = respond(consultaReducer(s, quick(id, label)));
    }
    expect(s.phase).toBe('done');
    expect(s.status).toBe('done');
    expect(s.recommendations.map((r) => r.recommendation.rank)).toEqual([1, 2]);
    expect(s.recommendations.every((r) => r.product.id === r.recommendation.productId)).toBe(true);
    expect(s.notes).toEqual([consultaScript.notes.prescriptionExpired, consultaScript.notes.astigmatismUnsure]);
    expect(s.quickReplies).toEqual([]);
    expect(consultaReducer(s, text('hola'))).toBe(s);
  });

  it('drops recommendations whose product is not in the catalog', () => {
    const s1 = consultaReducer(createInitialState(), { type: 'start' });
    const turn: AssistantTurn = {
      message: 'Listo.',
      quickReplies: [],
      profile: {},
      status: 'done',
      recommendations: [
        { productId: 'ghost', rank: 1, reason: 'x' },
        { productId: 'jj-daily-spherical', rank: 2, reason: 'y' },
      ],
      notes: [],
    };
    const original = console.warn;
    console.warn = () => {};
    try {
      const s = consultaReducer(s1, { type: 'received', requestId: s1.requestId, raw: turn });
      expect(s.phase).toBe('done');
      expect(s.recommendations.map((r) => r.product.id)).toEqual(['jj-daily-spherical']);
    } finally {
      console.warn = original;
    }
  });

  it('moves to error when a done turn has no product left after resolving', () => {
    const waiting = reduce(asking(), quick('experienced', 'Sí, ya los uso'));
    const turn: AssistantTurn = {
      message: 'Listo.',
      quickReplies: [],
      profile: { experience: 'experienced' },
      status: 'done',
      recommendations: [
        { productId: 'ghost-1', rank: 1, reason: 'x' },
        { productId: 'ghost-2', rank: 2, reason: 'y' },
      ],
      notes: [],
    };
    const original = console.warn;
    console.warn = () => {};
    try {
      const s = consultaReducer(waiting, { type: 'received', requestId: waiting.requestId, raw: turn });
      expect(s.phase).toBe('error');
      expect(s.error).toBe('invalid-turn');
      expect(s.messages).toEqual(waiting.messages);
      expect(s.recommendations).toEqual([]);
      const retried = consultaReducer(s, { type: 'retry' });
      expect(retried.phase).toBe('waiting');
      expect(retried.pending).toBe(waiting.pending);
    } finally {
      console.warn = original;
    }
  });

  it('enters refer without quick replies', () => {
    const s = respond(consultaReducer(asking(), text('me arde el ojo')));
    expect(s.phase).toBe('refer');
    expect(s.quickReplies).toEqual([]);
    expect(s.recommendations).toEqual([]);
    expect(consultaReducer(s, text('hola'))).toBe(s);
  });
});
