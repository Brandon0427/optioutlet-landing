import type { ConsultaProvider } from '../types';
import { createApiConsultaProvider } from './api';
import { createScriptedProvider } from './scripted';

let provider: ConsultaProvider | null = null;

export type ProviderKind = 'api' | 'scripted';

/** True only for `demo=1` in the query string (Plan B and C of the demo). */
export function isDemo(search: string): boolean {
  return new URLSearchParams(search).get('demo') === '1';
}

/**
 * `?demo=1` → scripted, over everything else. Otherwise
 * `VITE_CONSULTA_PROVIDER` = `api` (default) | `scripted`, and tests always
 * get the scripted provider.
 */
export function providerKind(setting: string | undefined, mode: string, search = ''): ProviderKind {
  if (isDemo(search)) return 'scripted';
  if (mode === 'test') return 'scripted';
  return setting?.trim().toLowerCase() === 'scripted' ? 'scripted' : 'api';
}

export interface ProviderSelection {
  setting: string | undefined;
  mode: string;
  /** `location.search` at page load. */
  search: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Scripted latency override (tests). */
  scriptedLatencyMs?: 0;
}

/** Pure factory behind `getConsultaProvider()`. */
export function createConsultaProvider(selection: ProviderSelection): ConsultaProvider {
  const scripted = createScriptedProvider(selection.scriptedLatencyMs === 0 ? { latencyMs: 0 } : {});
  if (providerKind(selection.setting, selection.mode, selection.search) === 'scripted') return scripted;
  return createApiConsultaProvider({ fallback: scripted, baseUrl: selection.baseUrl ?? '', fetchImpl: selection.fetchImpl });
}

/**
 * The provider the consultation talks to: Claude through `/api/chat`, with
 * the scripted provider answering any turn the API can't. With `?demo=1` in
 * the URL it is the scripted provider, and the page never calls `/api/chat`.
 * Evaluated once, at page load.
 */
export function getConsultaProvider(): ConsultaProvider {
  if (!provider) {
    const search = typeof location === 'undefined' ? '' : location.search;
    if (import.meta.env.DEV && isDemo(search)) console.info('[consulta] ?demo=1 → proveedor guionado (sin /api/chat)');
    provider = createConsultaProvider({
      setting: import.meta.env.VITE_CONSULTA_PROVIDER,
      mode: import.meta.env.MODE,
      search,
      baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
    });
  }
  return provider;
}
