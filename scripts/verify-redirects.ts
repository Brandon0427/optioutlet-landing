/**
 * Live check of the store redirects (Sesión 6). Not part of `npm run check`.
 *
 *   npm run verify:redirects -- <base url> [--follow]
 *   npm run verify:redirects -- https://optioutlet-landing.vercel.app --follow
 *
 * IMPORTANT: this file imports only Node built-ins and reads the case table
 * (redirect-cases.json) with fs. It must never import another .ts module from
 * the project: it runs with Node's type stripping (`--experimental-strip-types`),
 * which does not resolve imports between .ts files. That is also why the live
 * consultation eval runs under Vitest instead. Types are still checked by
 * `npm run check` (tsconfig.server.json includes scripts/).
 *
 * The live run is inside main(), which only runs when this file is executed
 * directly: scripts/redirectChain.test.ts imports evaluateChain() from here,
 * and importing must never send requests.
 *
 * Every request uses `redirect: 'manual'`.
 * - Store paths: 301 with the exact Location (path and query).
 * - Landing paths: no redirect (200, or 400 for one POST /api/chat with an
 *   invalid body; the firewall allows 20 per IP every 10 minutes).
 * - Domain hop: on www, the first response is the domain redirect set in the
 *   Vercel panel (www → apex, usually 308). A first 301/308 to the same path
 *   and query on another host is accepted once, reported, followed, and the
 *   normal expectation is applied to the next response. A hop to the store's
 *   host is never a domain hop: that is the redirect under test (otherwise a
 *   landing path wrongly sent to the store would pass after following it).
 * - --follow: GET each store destination on the store (following Shopify's own
 *   redirects). A 404 means the sample path no longer exists in the store; it
 *   is reported apart and is not a redirect failure.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export type Hop = { status: number; location: string | null };
export type Expectation = { kind: 'redirect'; location: string } | { kind: 'status'; status: number };
export type ChainResult =
  | { verdict: 'pass'; domainHop: string | null; detail: string }
  | { verdict: 'fail'; domainHop: string | null; detail: string }
  | { verdict: 'follow'; domainHop: string; followUrl: string; detail: string };

const DOMAIN_HOP_STATUSES = new Set([301, 308]);

function meets(expectation: Expectation, hop: Hop): boolean {
  if (expectation.kind === 'status') return hop.status === expectation.status;
  return hop.status === 301 && hop.location === expectation.location;
}

function describeHop(hop: Hop): string {
  return hop.location ? `${hop.status} → ${hop.location}` : String(hop.status);
}

/** The Location as an absolute URL, resolved against the URL that answered. */
function absolute(location: string, base: string): URL | null {
  try {
    return new URL(location, base);
  } catch {
    return null;
  }
}

/** Same path and query on another host that is not the store: a www ↔ apex domain redirect. */
function isDomainHop(hop: Hop, from: URL, target: URL | null, storeHost: string): target is URL {
  return (
    DOMAIN_HOP_STATUSES.has(hop.status) &&
    target !== null &&
    target.host !== from.host &&
    target.host !== storeHost &&
    target.pathname === from.pathname &&
    target.search === from.search
  );
}

/**
 * Evaluates the responses received so far for one request against its
 * expectation. `responses[0]` answers `requestUrl`; `responses[1]`, if present,
 * answers the domain hop. Returns 'follow' when a domain hop needs its next
 * response. `storeHost` is the store's host (shop.optioutlet.com.mx).
 */
export function evaluateChain(requestUrl: string, expectation: Expectation, responses: readonly Hop[], storeHost: string): ChainResult {
  const [first, second] = responses;
  if (!first) return { verdict: 'fail', domainHop: null, detail: 'no response' };
  if (meets(expectation, first)) return { verdict: 'pass', domainHop: null, detail: describeHop(first) };

  const requested = new URL(requestUrl);
  const target = first.location ? absolute(first.location, requestUrl) : null;
  if (!isDomainHop(first, requested, target, storeHost)) {
    return { verdict: 'fail', domainHop: null, detail: `unexpected ${describeHop(first)}` };
  }

  const domainHop = `${first.status} → ${target.href}`;
  if (!second) return { verdict: 'follow', domainHop, followUrl: target.href, detail: 'domain hop, next response pending' };
  if (meets(expectation, second)) return { verdict: 'pass', domainHop, detail: describeHop(second) };

  const secondTarget = second.location ? absolute(second.location, target.href) : null;
  const detail = isDomainHop(second, target, secondTarget, storeHost) ? `more than one domain hop: ${describeHop(second)}` : `unexpected ${describeHop(second)} after the domain hop`;
  return { verdict: 'fail', domainHop, detail };
}

// ─── Live run ─────────────────────────────────────────────────────────────

type StoreCase = { prefix: string; path: string; location: string };
type LandingCase = { path: string; method: string; status: number };
type Cases = { store: StoreCase[]; landing: LandingCase[] };

const USER_AGENT = 'optioutlet-verify-redirects';
const ASSET_CACHE = 'public, max-age=31536000, immutable';
const HTML_CACHE = 'public, max-age=0, must-revalidate';
const INVALID_CHAT_BODY = '{"bad":true}';

type Outcome = { label: string; ok: boolean; line: string };

async function request(url: string, method: string): Promise<{ hop: Hop; headers: Headers }> {
  const post = method === 'POST';
  const response = await fetch(url, {
    method,
    redirect: 'manual',
    headers: post ? { 'user-agent': USER_AGENT, 'content-type': 'application/json' } : { 'user-agent': USER_AGENT },
    body: post ? INVALID_CHAT_BODY : null,
  });
  await response.arrayBuffer();
  return { hop: { status: response.status, location: response.headers.get('location') }, headers: response.headers };
}

/** Runs one request through evaluateChain, following at most one domain hop. */
async function check(url: string, method: string, expectation: Expectation, storeHost: string): Promise<{ result: ChainResult; headers: Headers }> {
  const first = await request(url, method);
  let result = evaluateChain(url, expectation, [first.hop], storeHost);
  let headers = first.headers;
  if (result.verdict === 'follow') {
    const second = await request(result.followUrl, method);
    headers = second.headers;
    result = evaluateChain(url, expectation, [first.hop, second.hop], storeHost);
  }
  return { result, headers };
}

async function findAsset(base: string): Promise<string | null> {
  const html = await (await fetch(`${base}/`, { headers: { 'user-agent': USER_AGENT } })).text();
  return /\/assets\/[^"']+\.js/.exec(html)?.[0] ?? null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const follow = args.includes('--follow');
  const baseArg = args.find((arg) => !arg.startsWith('--'));
  if (!baseArg) {
    console.error('usage: npm run verify:redirects -- <base url> [--follow]');
    process.exit(2);
  }
  const base = new URL(baseArg).origin;
  const cases = JSON.parse(readFileSync(new URL('./redirect-cases.json', import.meta.url), 'utf8')) as Cases;
  const storeHost = new URL(cases.store[0]?.location ?? 'https://invalid.example').host;
  const outcomes: Outcome[] = [];
  const hops: string[] = [];
  const missing: string[] = [];

  console.log(`verify:redirects ${base}${follow ? ' --follow' : ''}\n`);

  console.log('Store paths (301, same path and query):');
  for (const c of cases.store) {
    const { result } = await check(`${base}${c.path}`, 'GET', { kind: 'redirect', location: c.location }, storeHost);
    const ok = result.verdict === 'pass';
    if (result.domainHop) hops.push(`${c.path}: ${result.domainHop}`);
    const line = `${ok ? 'PASS' : 'FAIL'}  ${c.path}  ${result.detail}${result.domainHop ? `  (domain hop ${result.domainHop})` : ''}`;
    outcomes.push({ label: c.path, ok, line });
    console.log(`  ${line}`);
  }

  console.log('\nLanding paths (never redirected):');
  const asset = await findAsset(base);
  for (const c of cases.landing) {
    const path = c.path === '@asset' ? asset : c.path;
    if (!path) {
      outcomes.push({ label: '@asset', ok: false, line: 'FAIL  @asset  no /assets/*.js found in the HTML' });
      console.log('  FAIL  @asset  no /assets/*.js found in the HTML');
      continue;
    }
    const { result, headers } = await check(`${base}${path}`, c.method, { kind: 'status', status: c.status }, storeHost);
    let ok = result.verdict === 'pass';
    let extra = '';
    if (ok && c.path === '@asset') {
      const cache = headers.get('cache-control');
      ok = cache === ASSET_CACHE;
      extra = `  cache-control: ${cache}`;
    }
    if (ok && c.path === '/') {
      const cache = headers.get('cache-control');
      ok = cache === HTML_CACHE;
      extra = `  cache-control: ${cache}`;
    }
    if (result.domainHop) hops.push(`${path}: ${result.domainHop}`);
    const line = `${ok ? 'PASS' : 'FAIL'}  ${c.method} ${path}  ${result.detail}${extra}${result.domainHop ? `  (domain hop ${result.domainHop})` : ''}`;
    outcomes.push({ label: path, ok, line });
    console.log(`  ${line}`);
  }

  if (follow) {
    console.log('\n--follow: each destination on the store:');
    for (const c of cases.store) {
      try {
        const response = await fetch(c.location, { redirect: 'follow', headers: { 'user-agent': USER_AGENT } });
        await response.arrayBuffer();
        const status = response.status;
        const where = response.url !== c.location ? `  (ended at ${response.url})` : '';
        if (status === 404) {
          missing.push(c.location);
          console.log(`  404   ${c.location}  not in the store (not a redirect failure)`);
        } else if (status >= 500) {
          outcomes.push({ label: `follow ${c.location}`, ok: false, line: `FAIL  ${status} ${c.location}` });
          console.log(`  FAIL  ${status}  ${c.location}${where}`);
        } else {
          console.log(`  ${String(status).padEnd(5)} ${c.location}${where}`);
        }
      } catch (error) {
        outcomes.push({ label: `follow ${c.location}`, ok: false, line: `FAIL  ${c.location}: ${String(error)}` });
        console.log(`  FAIL  ${c.location}: ${String(error)}`);
      }
    }
  }

  const failed = outcomes.filter((o) => !o.ok);
  console.log(`\nDomain hops: ${hops.length}${hops.length ? `\n  ${hops.join('\n  ')}` : ''}`);
  if (follow) console.log(`Sample paths not in the store (404): ${missing.length}`);
  console.log(`Result: ${outcomes.length - failed.length}/${outcomes.length} passed${failed.length ? ' — FAILED' : ''}`);
  process.exit(failed.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
