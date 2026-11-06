/**
 * Web-standard adapter (Request → Response) over `handleChat`, used by the
 * Vercel function. It writes the status and the JSON body only: `meta`
 * (tokens, attempts) never leaves the server here. The `x-consulta-usage`
 * header exists only in the Vite dev middleware.
 */
import type { HandleChatResult, RawBody } from '../consulta/handleChat.js';
import { MAX_BODY_BYTES } from '../consulta/requestSchema.js';

export type ChatRunner = (method: string, rawBody: RawBody) => Promise<HandleChatResult>;

/** Reads the body as UTF-8 text; `null` when it is larger than `limit` bytes or unreadable. */
export async function readBodyLimited(request: Request, limit = MAX_BODY_BYTES): Promise<RawBody> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function toFetchHandler(run: ChatRunner) {
  return async (request: Request): Promise<Response> => {
    const raw = request.method.toUpperCase() === 'POST' ? await readBodyLimited(request) : '';
    const { status, body } = await run(request.method, raw);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  };
}
