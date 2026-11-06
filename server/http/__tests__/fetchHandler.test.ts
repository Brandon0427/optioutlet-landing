import { afterEach, describe, expect, it, vi } from 'vitest';
import vercelFunction from '../../../api/chat.js';
import type { HandleChatResult } from '../../consulta/handleChat.js';
import { MAX_BODY_BYTES } from '../../consulta/requestSchema.js';
import { USAGE_HEADER, usageHeaderValue } from '../../dev/viteChatPlugin.js';
import { readBodyLimited, toFetchHandler } from '../fetchHandler.js';

const withUsage: HandleChatResult = {
  status: 200,
  body: { turn: { message: 'Hola', quickReplies: [], profile: {}, status: 'asking', recommendations: [], notes: [] } },
  meta: { model: 'm', durationMs: 5, attempts: 2, usage: { inputTokens: 1234, outputTokens: 321, cacheReadTokens: 1000 } },
};

const post = (body: string) => new Request('http://localhost/api/chat', { method: 'POST', body, headers: { 'content-type': 'application/json' } });

describe('Vercel adapter', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('never writes the usage header, even when handleChat returns usage', async () => {
    const run = vi.fn(async () => withUsage);
    const res = await toFetchHandler(run)(post('{}'));
    expect(res.status).toBe(200);
    expect(res.headers.has(USAGE_HEADER)).toBe(false);
    expect([...res.headers.keys()].sort()).toEqual(['cache-control', 'content-type']);
    const text = await res.text();
    expect(text).not.toContain('1234');
    expect(JSON.parse(text)).toEqual(withUsage.body);
    expect(run).toHaveBeenCalledWith('POST', '{}');
  });

  it('passes null for a body over the limit and does not read GET bodies', async () => {
    const run = vi.fn(async () => withUsage);
    await toFetchHandler(run)(post('x'.repeat(MAX_BODY_BYTES + 1)));
    expect(run).toHaveBeenLastCalledWith('POST', null);
    await toFetchHandler(run)(new Request('http://localhost/api/chat'));
    expect(run).toHaveBeenLastCalledWith('GET', '');
  });

  it('readBodyLimited reads up to the limit', async () => {
    expect(await readBodyLimited(post('{"a":"ñ"}'))).toBe('{"a":"ñ"}');
    expect(await readBodyLimited(post('12345'), 4)).toBeNull();
  });

  it('api/chat.ts: 405 and 500 without the usage header or internal details', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    const get = await vercelFunction.fetch(new Request('http://localhost/api/chat'));
    expect(get.status).toBe(405);
    expect(get.headers.has(USAGE_HEADER)).toBe(false);
    const res = await vercelFunction.fetch(post(JSON.stringify({ history: [], input: null })));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'server_misconfigured' });
    expect(res.headers.has(USAGE_HEADER)).toBe(false);
  });
});

describe('dev middleware usage header', () => {
  it('carries model, attempts and tokens only when the model was called', () => {
    expect(JSON.parse(usageHeaderValue(withUsage)!)).toEqual({ model: 'm', attempts: 2, inputTokens: 1234, outputTokens: 321, cacheReadTokens: 1000 });
    expect(usageHeaderValue({ ...withUsage, meta: { ...withUsage.meta, attempts: 0, usage: null } })).toBeNull();
  });
});
