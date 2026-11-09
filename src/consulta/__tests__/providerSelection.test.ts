import { describe, expect, it, vi } from 'vitest';
import { createApiConsultaProvider } from '../providers/api';
import { createConsultaProvider, isDemo, providerKind } from '../providers/index';
import { createScriptedProvider } from '../providers/scripted';
import type { AssistantTurn, ConsultaProvider, ConversationMessage } from '../types';

/** The demo's main conversation, by quick-reply id. */
const MAIN = ['experienced', 'office-screens', 'daily', 'yes', 'current'];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Runs a whole consultation through `provider`, answering each turn with the next quick reply. */
async function runConsultation(provider: ConsultaProvider, answers = MAIN) {
  const turns: AssistantTurn[] = [];
  let history: ConversationMessage[] = [];
  let turn = await provider.start();
  turns.push(turn);
  history = [{ role: 'assistant', turn }];
  for (const id of answers) {
    if (turn.status !== 'asking') break;
    const reply = turn.quickReplies.find((r) => r.id === id)!;
    const next = await provider.reply(history, { kind: 'quick', replyId: reply.id, label: reply.label });
    history = [...history, { role: 'user', text: reply.label }, { role: 'assistant', turn: next }];
    turns.push(next);
    turn = next;
  }
  return { turns, last: turn, history };
}

describe('?demo=1', () => {
  it('isDemo is true only for demo=1', () => {
    expect(isDemo('?demo=1')).toBe(true);
    expect(isDemo('?utm_source=x&demo=1')).toBe(true);
    for (const search of ['', '?demo=0', '?demo=true', '?demo=', '?demo', '?demo=11', '?Demo=1']) expect(isDemo(search)).toBe(false);
  });

  it('wins over VITE_CONSULTA_PROVIDER and the mode', () => {
    expect(providerKind('api', 'production', '?demo=1')).toBe('scripted');
    expect(providerKind(undefined, 'development', '?demo=1')).toBe('scripted');
  });

  it('a whole consultation with demo=1 never calls fetch', async () => {
    const fetchImpl = vi.fn(async () => json({}, 500));
    const provider = createConsultaProvider({ setting: 'api', mode: 'production', search: '?demo=1', fetchImpl: fetchImpl as unknown as typeof fetch, scriptedLatencyMs: 0 });
    const { last, turns } = await runConsultation(provider);
    expect(last.status).toBe('done');
    expect(last.recommendations.map((r) => r.productId)).toEqual(['jj-biweekly-toric', 'jj-daily-toric']);
    expect(turns).toHaveLength(6);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each(['', '?demo=0', '?demo=true', '?utm_source=instagram'])('without demo=1 (%j) the API is used as today', async (search) => {
    expect(providerKind(undefined, 'production', search)).toBe('api');
    const fetchImpl = vi.fn(async () => json({}, 503));
    const provider = createConsultaProvider({ setting: undefined, mode: 'production', search, fetchImpl: fetchImpl as unknown as typeof fetch, scriptedLatencyMs: 0 });
    await provider.start();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe('429 from /api/chat', () => {
  function setup(statuses: number[]) {
    let call = 0;
    const fetchImpl = vi.fn(async () => {
      const status = statuses[Math.min(call++, statuses.length - 1)]!;
      return status === 200 ? json({ turn: undefined }) : json({ error: 'x' }, status);
    });
    const scripted = createScriptedProvider({ latencyMs: 0 });
    const fallback: ConsultaProvider = { start: vi.fn(() => scripted.start()), reply: vi.fn((h, i) => scripted.reply(h, i)) };
    const causes: string[] = [];
    const provider = createApiConsultaProvider({ fallback, fetchImpl: fetchImpl as unknown as typeof fetch, onFallback: (c) => causes.push(c) });
    return { provider, fetchImpl, fallback, causes };
  }

  it('that turn and the rest of the consultation go scripted, with a single fetch in total', async () => {
    const { provider, fetchImpl, fallback, causes } = setup([429]);
    const { last, turns } = await runConsultation(provider);
    expect(last.status).toBe('done');
    expect(turns).toHaveLength(6);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fallback.start).toHaveBeenCalledTimes(1);
    expect(fallback.reply).toHaveBeenCalledTimes(5);
    expect(causes).toEqual(['http 429']);
  });

  it('a 429 in the middle pins the remaining turns', async () => {
    // start: 503 (fallback, that turn only) → reply 1: 429 → no more fetch.
    const { provider, fetchImpl } = setup([503, 429]);
    const { last } = await runConsultation(provider);
    expect(last.status).toBe('done');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('restarting the consultation after a 429 tries the API again', async () => {
    const { provider, fetchImpl } = setup([429, 503]);
    await runConsultation(provider);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await provider.start();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    // Not rate-limited any more: a 503 there falls back for that turn only, so the next turn calls again.
    const { history } = await runConsultation(provider, ['experienced']);
    expect(history.length).toBeGreaterThan(1);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('a 503 is still a fallback for that turn only', async () => {
    const { provider, fetchImpl, causes } = setup([503]);
    const { last } = await runConsultation(provider);
    expect(last.status).toBe('done');
    expect(fetchImpl).toHaveBeenCalledTimes(6);
    expect(causes).toEqual(Array(6).fill('http 503'));
  });
});
