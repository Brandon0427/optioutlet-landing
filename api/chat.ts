/**
 * Vercel Function (Node.js runtime) for `/api/chat`: a thin adapter over
 * `handleChat`. The key comes from the project's environment variables
 * (`ANTHROPIC_API_KEY`) and never reaches the client bundle.
 */
import { createChatDeps } from '../server/consulta/deps.js';
import { handleChat, type ChatDeps } from '../server/consulta/handleChat.js';
import { toFetchHandler } from '../server/http/fetchHandler.js';

let deps: ChatDeps | null = null;

export default {
  fetch: toFetchHandler((method, rawBody) => {
    deps ??= createChatDeps(process.env);
    return handleChat(method, rawBody, deps);
  }),
};
