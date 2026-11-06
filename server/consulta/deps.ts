/**
 * Builds `handleChat`'s dependencies from the environment. Shared by the
 * Vercel function and the Vite dev middleware. The key is read here and
 * handed to the SDK; it is never logged or returned.
 */
import Anthropic from '@anthropic-ai/sdk';
import { readConfig, type ServerEnv } from './config.js';
import type { ChatDeps } from './handleChat.js';

export function createChatDeps(env: ServerEnv): ChatDeps {
  const { apiKey, model } = readConfig(env);
  // Retries are handleChat's job (one, within the time budget); the SDK's own would blow it.
  const client = apiKey ? new Anthropic({ apiKey, maxRetries: 0 }) : null;
  return { client, model };
}
