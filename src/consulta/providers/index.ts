import type { ConsultaProvider } from '../types';
import { createApiConsultaProvider } from './api';
import { createScriptedProvider } from './scripted';

let provider: ConsultaProvider | null = null;

export type ProviderKind = 'api' | 'scripted';

/**
 * `VITE_CONSULTA_PROVIDER` = `api` (default) | `scripted`. Tests always get
 * the scripted provider.
 */
export function providerKind(setting: string | undefined, mode: string): ProviderKind {
  if (mode === 'test') return 'scripted';
  return setting?.trim().toLowerCase() === 'scripted' ? 'scripted' : 'api';
}

/**
 * The provider the consultation talks to: Claude through `/api/chat`, with
 * the scripted provider answering any turn the API can't.
 * Session 5 adds `?demo=1` here to force the scripted provider.
 */
export function getConsultaProvider(): ConsultaProvider {
  if (!provider) {
    const scripted = createScriptedProvider();
    provider =
      providerKind(import.meta.env.VITE_CONSULTA_PROVIDER, import.meta.env.MODE) === 'scripted'
        ? scripted
        : createApiConsultaProvider({ fallback: scripted, baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });
  }
  return provider;
}
