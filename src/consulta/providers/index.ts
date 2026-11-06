import type { ConsultaProvider } from '../types';
import { createScriptedProvider } from './scripted';

let provider: ConsultaProvider | null = null;

/**
 * The provider the consultation talks to.
 *
 * Session 2: always the scripted provider.
 * Session 3 adds `ApiConsultaProvider` (calls `/api/chat`) here, and falls back
 * to the scripted one if the API fails.
 * Session 5 adds `?demo=1` here to force the scripted provider.
 */
export function getConsultaProvider(): ConsultaProvider {
  provider ??= createScriptedProvider();
  return provider;
}
