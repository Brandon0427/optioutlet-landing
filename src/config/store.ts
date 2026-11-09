/**
 * Store configuration: the ONLY file that knows the store's domain.
 *
 * Every link from the landing to the store goes through `storeLink()`, which
 * adds UTM parameters:
 * - By default: utm_source=landing, utm_medium=referral, utm_campaign=opti and
 *   utm_content=<placement>.
 * - If the visit arrived with `utm_*` parameters (an Instagram ad, say), those
 *   are forwarded as they came instead, so the campaign's origin survives.
 *   They are read once, when this module loads, and kept in memory.
 * - Only `utm_*` keys are ever forwarded; never `demo` or anything else.
 *
 * The server also loads this module (through catalog.ts and landing.ts), in
 * plain Node: `import.meta.env` and `location` may not exist there, so both
 * are read defensively. No React or DOM imports.
 */

export const DEFAULT_STORE_URL = 'https://shop.optioutlet.com.mx';

type ViteEnv = { VITE_STORE_URL?: string };

/** Origin of a URL string, or null when it isn't an absolute http(s) URL. */
function originOf(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null;
  } catch {
    return null;
  }
}

/** Store origin: `VITE_STORE_URL` when it is a valid URL, else the default. No trailing slash. */
export const STORE_URL: string =
  originOf((import.meta as ImportMeta & { env?: ViteEnv }).env?.VITE_STORE_URL) ?? DEFAULT_STORE_URL;

/** Where the link sits on the landing (`seccion-elemento`); feeds utm_content. */
export type StoreLinkPlacement = 'header-tienda' | 'hero-tienda' | 'cierre-tienda' | 'recomendacion-1' | 'recomendacion-2';

export const DEFAULT_UTM = {
  utm_source: 'landing',
  utm_medium: 'referral',
  utm_campaign: 'opti',
} as const;

export type UtmParams = Readonly<Record<string, string>>;

/** The `utm_*` parameters of a query string, as they came (empty values dropped). */
export function readIncomingUtm(search: string): UtmParams {
  const utm: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (key.startsWith('utm_') && value !== '' && !(key in utm)) utm[key] = value;
  }
  return utm;
}

/**
 * Pure builder. `target` is a store path ('/', '/collections/…') or a
 * product's absolute URL; parameters it already has are kept, and any
 * `utm_*` it carries is overwritten (set, never appended).
 */
export function buildStoreLink(target: string, placement: StoreLinkPlacement, incoming: UtmParams, base: string = STORE_URL): string {
  const url = new URL(target, base);
  const utm: UtmParams = Object.keys(incoming).length > 0 ? incoming : { ...DEFAULT_UTM, utm_content: placement };
  for (const [key, value] of Object.entries(utm)) url.searchParams.set(key, value);
  return url.toString();
}

const locationSearch = (globalThis as { location?: { search?: string } }).location?.search ?? '';

/** UTM parameters the visit arrived with, read once at page load. */
export const INCOMING_UTM: UtmParams = readIncomingUtm(locationSearch);

/** Link to the store for `placement`, with the UTM parameters that apply to this visit. */
export function storeLink(target: string, placement: StoreLinkPlacement): string {
  return buildStoreLink(target, placement, INCOMING_UTM);
}
