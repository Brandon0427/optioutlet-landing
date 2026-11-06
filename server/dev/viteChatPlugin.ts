/**
 * Dev-only: mounts `handleChat` at `/api/chat` in `npm run dev`, so local
 * development does not need `vercel dev`. The key is read with `loadEnv` from
 * `.env.local` (or the shell) inside the dev server process only; it is never
 * passed to `define` and never reaches the client.
 *
 * This is the only place that writes `x-consulta-usage` (model, tokens,
 * attempts) for the live evaluation. The Vercel function never does.
 */
import type { IncomingMessage } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { createChatDeps } from '../consulta/deps.js';
import { handleChat, type ChatDeps, type HandleChatResult, type RawBody } from '../consulta/handleChat.js';
import { MAX_BODY_BYTES } from '../consulta/requestSchema.js';

export const USAGE_HEADER = 'x-consulta-usage';

function readNodeBody(req: IncomingMessage, limit = MAX_BODY_BYTES): Promise<RawBody> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;
    const settle = (value: RawBody) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        settle(null);
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => settle(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => settle(null));
  });
}

export function usageHeaderValue(result: HandleChatResult): string | null {
  const { meta } = result;
  if (meta.attempts === 0) return null;
  return JSON.stringify({
    model: meta.model,
    attempts: meta.attempts,
    inputTokens: meta.usage?.inputTokens ?? 0,
    outputTokens: meta.usage?.outputTokens ?? 0,
    cacheReadTokens: meta.usage?.cacheReadTokens ?? 0,
  });
}

export function consultaApiDevPlugin(): Plugin {
  return {
    name: 'optioutlet:consulta-api-dev',
    // Only the dev server; never during `vite build` or inside Vitest.
    apply: (_config, env) => env.command === 'serve' && !process.env.VITEST,
    configureServer(server) {
      let deps: ChatDeps | null = null;
      server.middlewares.use('/api/chat', (req, res) => {
        void (async () => {
          deps ??= createChatDeps(loadEnv(server.config.mode, server.config.root, 'ANTHROPIC_'));
          const method = req.method ?? 'GET';
          const raw = method.toUpperCase() === 'POST' ? await readNodeBody(req) : '';
          const result = await handleChat(method, raw, deps);
          res.statusCode = result.status;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.setHeader('cache-control', 'no-store');
          const usage = usageHeaderValue(result);
          if (usage) res.setHeader(USAGE_HEADER, usage);
          res.end(JSON.stringify(result.body));
        })().catch(() => {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'server_misconfigured' }));
        });
      });
    },
  };
}
