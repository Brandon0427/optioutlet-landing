import { describe, expect, it, vi } from 'vitest';
import { createApiConsultaProvider } from '../providers/api';
import { providerKind } from '../providers/index';
import { createScriptedProvider } from '../providers/scripted';
import type { AssistantTurn, ConsultaProvider, ConversationMessage, UserInput } from '../types';

const claudeTurn: AssistantTurn = {
  message: '¡Perfecto! ¿Cada cuánto los usarías?',
  quickReplies: [
    { id: 'daily', label: 'Todos los días' },
    { id: 'some-days', label: 'Algunos días a la semana' },
    { id: 'occasional', label: 'Solo en ocasiones especiales' },
  ],
  profile: { experience: 'experienced', routine: 'office-screens' },
  status: 'asking',
  recommendations: [],
  notes: [],
};

const history: ConversationMessage[] = [{ role: 'assistant', turn: claudeTurn }];
const input: UserInput = { kind: 'quick', replyId: 'daily', label: 'Todos los días' };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function setup(fetchImpl: typeof fetch, timeoutMs = 50) {
  const scripted = createScriptedProvider({ latencyMs: 0 });
  const fallback: ConsultaProvider = { start: vi.fn(() => scripted.start()), reply: vi.fn((h, i) => scripted.reply(h, i)) };
  const causes: string[] = [];
  const provider = createApiConsultaProvider({ fallback, fetchImpl, timeoutMs, baseUrl: 'https://api.example.com/', onFallback: (c) => causes.push(c) });
  return { provider, fallback, causes };
}

/** A fetch that never answers, and rejects when its signal aborts (as the real one does). */
const hangingFetch = vi.fn(
  (_url: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    }),
) as unknown as typeof fetch;

describe('ApiConsultaProvider', () => {
  it('200 with a valid turn → returns it; posts history and input to ${baseUrl}/api/chat', async () => {
    const fetchImpl = vi.fn(async () => json({ turn: claudeTurn }));
    const { provider, fallback } = setup(fetchImpl as unknown as typeof fetch);
    expect(await provider.reply(history, input)).toEqual(claudeTurn);
    expect(fallback.reply).not.toHaveBeenCalled();
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.example.com/api/chat');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ history, input });
  });

  it('start sends input null', async () => {
    const fetchImpl = vi.fn(async () => json({ turn: claudeTurn }));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);
    await provider.start();
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(init.body as string)).toEqual({ history: [], input: null });
  });

  it.each([
    ['timeout', () => hangingFetch, 'timeout'],
    ['502', () => vi.fn(async () => json({ error: 'model_invalid' }, 502)), 'http 502'],
    ['503', () => vi.fn(async () => json({ error: 'upstream_unavailable' }, 503)), 'http 503'],
    ['network down', () => vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))), 'network'],
    ['invalid turn', () => vi.fn(async () => json({ turn: { ...claudeTurn, status: 'thinking' } })), 'invalid turn'],
    ['not JSON', () => vi.fn(async () => new Response('<html>', { status: 200 })), 'invalid json'],
  ])('%s → the scripted provider answers that turn', async (_name, makeFetch, cause) => {
    const { provider, fallback, causes } = setup(makeFetch() as unknown as typeof fetch);
    const turn = await provider.reply(history, input);
    expect(fallback.reply).toHaveBeenCalledWith(history, input);
    expect(causes).toEqual([cause]);
    expect(turn.status).toBe('asking');
  });

  it('start falls back to the scripted greeting', async () => {
    const { provider, fallback } = setup(vi.fn(async () => json({}, 503)) as unknown as typeof fetch);
    const turn = await provider.start();
    expect(fallback.start).toHaveBeenCalledTimes(1);
    expect(turn.quickReplies.map((r) => r.id)).toEqual(['experienced', 'first-time']);
  });

  it('a scripted turn in the middle of a Claude conversation continues from the accumulated profile', async () => {
    let call = 0;
    const fetchImpl = vi.fn(async () => (++call === 1 ? json({}, 503) : json({ turn: { ...claudeTurn, message: 'Claude otra vez' } })));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);

    // Claude asked about frequency with two fields already known; the API fails on this turn.
    const scriptedTurn = await provider.reply(history, input);
    expect(scriptedTurn.profile).toEqual({ experience: 'experienced', routine: 'office-screens', frequency: 'daily' });
    expect(scriptedTurn.quickReplies.map((r) => r.id)).toEqual(['yes', 'no', 'unsure']);

    // The next turn goes back to the API with the full history, scripted turn included.
    const next: ConversationMessage[] = [...history, { role: 'user', text: input.label }, { role: 'assistant', turn: scriptedTurn }];
    const back = await provider.reply(next, { kind: 'quick', replyId: 'no', label: 'No' });
    expect(back.message).toBe('Claude otra vez');
    const sent = JSON.parse((fetchImpl.mock.calls[1] as unknown as [string, RequestInit])[1].body as string);
    expect(sent.history.at(-1).turn.profile).toEqual(scriptedTurn.profile);
  });

  it('two identical simultaneous requests → one fetch, same turn', async () => {
    const fetchImpl = vi.fn(async () => json({ turn: claudeTurn }));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);
    const [a, b] = await Promise.all([provider.reply(history, input), provider.reply(history, input)]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);

    const [s1, s2] = await Promise.all([provider.start(), provider.start()]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(s1).toBe(s2);
  });

  it('different requests are not merged', async () => {
    const fetchImpl = vi.fn(async () => json({ turn: claudeTurn }));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);
    await Promise.all([provider.reply(history, input), provider.reply(history, { kind: 'text', text: 'diario' })]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('a request that fails, then an identical one → two fetch calls (the failed promise is not reused)', async () => {
    const fetchImpl = vi.fn(async () => json({ error: 'upstream_unavailable' }, 503));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);
    await provider.reply(history, input);
    await provider.reply(history, input);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('a request aborted by the timeout is not reused either', async () => {
    const { provider } = setup(hangingFetch);
    (hangingFetch as unknown as ReturnType<typeof vi.fn>).mockClear();
    await provider.reply(history, input);
    await provider.reply(history, input);
    expect(hangingFetch).toHaveBeenCalledTimes(2);
  });

  it('a completed request is not reused', async () => {
    const fetchImpl = vi.fn(async () => json({ turn: claudeTurn }));
    const { provider } = setup(fetchImpl as unknown as typeof fetch);
    await provider.reply(history, input);
    await provider.reply(history, input);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('providerKind', () => {
  it('api by default, scripted on request, always scripted in tests', () => {
    expect(providerKind(undefined, 'development')).toBe('api');
    expect(providerKind('', 'production')).toBe('api');
    expect(providerKind('API', 'production')).toBe('api');
    expect(providerKind('scripted', 'development')).toBe('scripted');
    expect(providerKind(' Scripted ', 'production')).toBe('scripted');
    expect(providerKind('api', 'test')).toBe('scripted');
  });
});
