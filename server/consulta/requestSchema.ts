/**
 * Validation of the `/api/chat` request body. Reuses the contract's schemas:
 * an assistant turn in the history must itself be a valid `AssistantTurn`.
 */
import { z } from 'zod';
import { assistantTurnSchema } from '../../src/consulta/schema.js';
import type { ConversationMessage, UserInput } from '../../src/consulta/types.js';

export const MAX_HISTORY_MESSAGES = 30;
export const MAX_USER_TEXT = 500;
export const MAX_BODY_BYTES = 64 * 1024;

const userTextSchema = z.string().trim().min(1).max(MAX_USER_TEXT);

export const userInputSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('quick'), replyId: z.string().min(1).max(100), label: userTextSchema }),
  z.object({ kind: z.literal('text'), text: userTextSchema }),
]);

export const conversationMessageSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('assistant'), turn: assistantTurnSchema }),
  z.object({ role: z.literal('user'), text: userTextSchema }),
]);

export const chatRequestSchema = z.object({
  history: z.array(conversationMessageSchema).max(MAX_HISTORY_MESSAGES),
  input: userInputSchema.nullable(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Compile-time guard: a parsed request is made of the contract's own types.
type Assert<T extends true> = T;
export type RequestMatchesContract = Assert<
  ChatRequest extends { history: ConversationMessage[]; input: UserInput | null } ? true : false
>;
