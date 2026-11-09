/**
 * Store redirects in vercel.json (Sesión 6).
 *
 * The rules are converted with @vercel/routing-utils, the library Vercel uses
 * to turn `redirects` into routes, so the regular expressions tested here are
 * the ones the CDN evaluates. Vercel appends the request's query string to the
 * Location at runtime; here only the path part is compared, and the live
 * script (scripts/verify-redirects.ts) checks the query.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getTransformedRoutes, isHandler, type Route } from '@vercel/routing-utils';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STORE_URL } from '../src/config/store.js';

type Redirect = { source: string; destination: string; statusCode?: number; permanent?: boolean };
type VercelJson = { headers: unknown; redirects: Redirect[] };
type StoreCase = { prefix: string; path: string; location: string };
type LandingCase = { path: string; method: string; status: number };
type Cases = { store: StoreCase[]; landing: LandingCase[]; requiredPrefixes: { decision4: string[]; phase1: string[] } };

const read = (relative: string) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
const config = JSON.parse(read('../vercel.json')) as VercelJson;
const cases = JSON.parse(read('./redirect-cases.json')) as Cases;
const PUBLIC_FILES = readdirSync(fileURLToPath(new URL('../public/', import.meta.url))).map((name) => `/${name}`);

/** Session 5 cache headers: must not change. */
const SESSION_5_HEADERS = [
  { source: '/assets/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
];

type RedirectRoute = { src: string; status: number; location: string; index: number };

function redirectRoutes(): RedirectRoute[] {
  const { routes, error } = getTransformedRoutes({ redirects: config.redirects });
  if (error) throw new Error(`routing-utils rejected vercel.json: ${error.message}`);
  return (routes ?? [])
    .filter((route: Route): route is Exclude<Route, { handle: string }> => !isHandler(route))
    .map((route, index) => ({ src: route.src, status: route.status ?? 0, location: route.headers?.Location ?? '', index }));
}

const ROUTES = redirectRoutes();

/** First matching route and the Location it produces for `path` (query excluded). */
function resolve(pathWithQuery: string): { route: RedirectRoute; location: string } | null {
  const path = pathWithQuery.split('?')[0] ?? '';
  for (const route of ROUTES) {
    const match = new RegExp(route.src).exec(path);
    if (match) return { route, location: route.location.replace(/\$(\d+)/g, (_, i: string) => match[Number(i)] ?? '') };
  }
  return null;
}

describe('vercel.json redirects', () => {
  it('keeps the Session 5 cache headers unchanged', () => {
    expect(config.headers).toEqual(SESSION_5_HEADERS);
  });

  it('uses an explicit 301 on every rule (never `permanent`, which is 308)', () => {
    expect(config.redirects.length).toBeGreaterThan(0);
    for (const rule of config.redirects) {
      expect(rule.statusCode, rule.source).toBe(301);
      expect(rule.permanent, rule.source).toBeUndefined();
    }
    expect(ROUTES.map((route) => route.status)).toEqual(config.redirects.map(() => 301));
  });

  it('points every destination at DEFAULT_STORE_URL', () => {
    const origin = new URL(DEFAULT_STORE_URL).origin;
    for (const rule of config.redirects) expect(rule.destination.startsWith(`${origin}/`), rule.destination).toBe(true);
    for (const { location } of cases.store) expect(new URL(location).origin).toBe(origin);
  });

  it('never matches a route the landing serves', () => {
    const landingPaths = [
      ...cases.landing.map((c) => (c.path === '@asset' ? '/assets/index-abc123.js' : c.path)),
      ...PUBLIC_FILES,
      '/index.html',
      '/assets/albert-sans-latin-wght-normal-abc123.woff2',
      '/api/chat',
      '/robots.txt',
      '/.well-known/acme-challenge/token',
    ];
    for (const path of landingPaths) expect(resolve(path), path).toBeNull();
  });

  it('sends each store case to the same path on the store', () => {
    for (const c of cases.store) {
      const resolved = resolve(c.path);
      expect(resolved, c.path).not.toBeNull();
      expect(resolved?.location, c.path).toBe(c.location.split('?')[0]);
      const query = c.path.includes('?') ? c.path.slice(c.path.indexOf('?')) : '';
      expect(c.location.endsWith(query), `${c.path}: the expected Location must keep the query`).toBe(true);
    }
  });

  it('has at least one case per required prefix and per rule', () => {
    const covered = new Set(cases.store.map((c) => c.prefix));
    for (const prefix of [...cases.requiredPrefixes.decision4, ...cases.requiredPrefixes.phase1]) {
      expect(covered.has(prefix), prefix).toBe(true);
    }
    const usedRules = new Set(cases.store.map((c) => resolve(c.path)?.route.index));
    expect([...usedRules].sort()).toEqual(ROUTES.map((route) => route.index));
  });
});
