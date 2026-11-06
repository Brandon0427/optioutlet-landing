/**
 * Turns the contract's history into alternating text messages for the API.
 *
 * - Opti's turns become assistant text (their `message`); the customer's,
 *   user text.
 * - The conversation always opens with a synthetic user message (the API
 *   requires the first message to be from the user, and Opti greets first).
 * - The last user message carries the accumulated profile explicitly, as
 *   structured data, so the model never has to infer it from the transcript.
 * - Consecutive messages with the same role are merged.
 */
import type Anthropic from '@anthropic-ai/sdk';
import { nextField } from '../../src/consulta/progress.js';
import type { ConversationMessage, CustomerProfile, UserInput } from '../../src/consulta/types.js';

export const START_MESSAGE = 'La consulta comienza. Saluda y haz la primera pregunta.';

/** Wraps the customer's words so the model treats them as data, never as instructions. */
export function quoteCustomer(text: string): string {
  return `<cliente>${text.replaceAll('<', '‹').replaceAll('>', '›')}</cliente>`;
}

function describeInput(input: UserInput): string {
  return input.kind === 'quick'
    ? `El cliente tocó la opción rápida con id "${input.replyId}": ${quoteCustomer(input.label)}`
    : `El cliente escribió: ${quoteCustomer(input.text)}`;
}

export function profileContext(profile: CustomerProfile): string {
  const pending = nextField(profile);
  return [
    `Perfil acumulado hasta ahora (JSON): ${JSON.stringify(profile)}`,
    pending ? `Siguiente tema pendiente: ${pending}.` : 'Los cinco temas ya están en el perfil.',
  ].join('\n');
}

export function toClaudeMessages(
  history: readonly ConversationMessage[],
  input: UserInput | null,
  profile: CustomerProfile,
): Anthropic.MessageParam[] {
  const raw: { role: 'user' | 'assistant'; text: string }[] = [{ role: 'user', text: START_MESSAGE }];
  for (const m of history) {
    raw.push(m.role === 'assistant' ? { role: 'assistant', text: m.turn.message } : { role: 'user', text: quoteCustomer(m.text) });
  }
  const last = input ? `${describeInput(input)}\n\n${profileContext(profile)}` : profileContext(profile);
  raw.push({ role: 'user', text: last });

  const merged: Anthropic.MessageParam[] = [];
  for (const m of raw) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === m.role && typeof prev.content === 'string') prev.content = `${prev.content}\n\n${m.text}`;
    else merged.push({ role: m.role, content: m.text });
  }
  return merged;
}
