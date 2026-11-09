/**
 * evaluateChain() from scripts/verify-redirects.ts (Sesión 6).
 *
 * The www → apex domain hop can only be seen live after the DNS cut, so the
 * chain logic is covered here with synthetic responses.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Expectation, Hop } from './verify-redirects.js';

const fetchSpy = vi.fn(() => Promise.reject(new Error('verify-redirects must not fetch on import')));
let evaluateChain: typeof import('./verify-redirects.js').evaluateChain;

beforeAll(async () => {
  vi.stubGlobal('fetch', fetchSpy);
  ({ evaluateChain } = await import('./verify-redirects.js'));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const STORE = 'https://shop.optioutlet.com.mx';
const STORE_HOST = new URL(STORE).host;
const APEX = 'https://optioutlet.com.mx';
const WWW = 'https://www.optioutlet.com.mx';
const PATH = '/products/lente?variant=1&utm_source=halloween';

const toStore: Expectation = { kind: 'redirect', location: `${STORE}${PATH}` };
const landingOk: Expectation = { kind: 'status', status: 200 };
const hop = (status: number, location: string | null = null): Hop => ({ status, location });

describe('importing verify-redirects.ts', () => {
  it('does not call fetch (the live run only starts when executed directly)', () => {
    expect(evaluateChain).toBeTypeOf('function');
    expect(fetchSpy).toHaveBeenCalledTimes(0);
  });
});

describe('evaluateChain', () => {
  it('passes a direct 301 with the exact Location', () => {
    const result = evaluateChain(`${APEX}${PATH}`, toStore, [hop(301, `${STORE}${PATH}`)], STORE_HOST);
    expect(result).toMatchObject({ verdict: 'pass', domainHop: null });
  });

  it('accepts one domain hop, then the 301', () => {
    const url = `${WWW}${PATH}`;
    const first = hop(308, `${APEX}${PATH}`);
    const pending = evaluateChain(url, toStore, [first], STORE_HOST);
    expect(pending).toMatchObject({ verdict: 'follow', followUrl: `${APEX}${PATH}` });
    const result = evaluateChain(url, toStore, [first, hop(301, `${STORE}${PATH}`)], STORE_HOST);
    expect(result).toMatchObject({ verdict: 'pass', domainHop: `308 → ${APEX}${PATH}` });
  });

  it('accepts one domain hop, then 200 on a landing path', () => {
    const result = evaluateChain(`${WWW}/`, landingOk, [hop(308, `${APEX}/`), hop(200)], STORE_HOST);
    expect(result).toMatchObject({ verdict: 'pass', domainHop: `308 → ${APEX}/` });
  });

  it('fails a first redirect to another path', () => {
    const result = evaluateChain(`${WWW}${PATH}`, toStore, [hop(308, `${APEX}/`)], STORE_HOST);
    expect(result.verdict).toBe('fail');
  });

  it('fails two domain hops', () => {
    const result = evaluateChain(`${WWW}${PATH}`, toStore, [hop(308, `${APEX}${PATH}`), hop(308, `https://otro.example${PATH}`)], STORE_HOST);
    expect(result).toMatchObject({ verdict: 'fail' });
    expect(result.detail).toMatch(/more than one domain hop/);
  });

  it('fails a 308 to the store (only an explicit 301 counts)', () => {
    const result = evaluateChain(`${APEX}${PATH}`, toStore, [hop(308, `${STORE}${PATH}`)], STORE_HOST);
    expect(result.verdict).toBe('fail');
  });

  it('passes a query that Vercel re-encoded (same decoded pairs, same order)', () => {
    const expectation: Expectation = { kind: 'redirect', location: `${STORE}/discount/X?redirect=/collections/anime&q=a+b` };
    const actual = `${STORE}/discount/X?redirect=%2Fcollections%2Fanime&q=a%20b`;
    expect(evaluateChain(`${APEX}/discount/X?redirect=/collections/anime&q=a+b`, expectation, [hop(301, actual)], STORE_HOST).verdict).toBe('pass');
  });

  it('fails a query with a changed value, a missing key or a different order', () => {
    const expectation: Expectation = { kind: 'redirect', location: `${STORE}/cart?a=1&b=2` };
    for (const actual of [`${STORE}/cart?a=1&b=3`, `${STORE}/cart?a=1`, `${STORE}/cart?b=2&a=1`, `${STORE}/cart/?a=1&b=2`]) {
      expect(evaluateChain(`${APEX}/cart?a=1&b=2`, expectation, [hop(301, actual)], STORE_HOST).verdict, actual).toBe('fail');
    }
  });

  it('accepts a domain hop whose query was re-encoded', () => {
    const url = `${WWW}/search?q=a+b`;
    const expectation: Expectation = { kind: 'redirect', location: `${STORE}/search?q=a+b` };
    const result = evaluateChain(url, expectation, [hop(308, `${APEX}/search?q=a%20b`), hop(301, `${STORE}/search?q=a%20b`)], STORE_HOST);
    expect(result.verdict).toBe('pass');
  });

  it('fails a landing path redirected to the store (never a domain hop)', () => {
    const result = evaluateChain(`${APEX}/favicon.ico`, landingOk, [hop(301, `${STORE}/favicon.ico`)], STORE_HOST);
    expect(result.verdict).toBe('fail');
  });
});
