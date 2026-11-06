/**
 * Runtime validation of the contract in `types.ts`.
 *
 * The UI only renders turns that pass `parseAssistantTurn`. The Session 3
 * serverless function validates the Claude API output with these same
 * schemas, so this file must stay free of React and DOM imports.
 */
import { z } from 'zod';
import type { AssistantTurn } from './types.js';

export const MAX_QUICK_REPLIES = 4;

export const experienceSchema = z.enum(['experienced', 'first-time']);
export const routineSchema = z.enum(['office-screens', 'outdoors-active', 'mixed']);
export const frequencySchema = z.enum(['daily', 'some-days', 'occasional']);
export const astigmatismSchema = z.enum(['yes', 'no', 'unsure']);
export const prescriptionSchema = z.enum(['current', 'expired-or-none']);

export const customerProfileSchema = z.object({
  experience: experienceSchema.optional(),
  routine: routineSchema.optional(),
  frequency: frequencySchema.optional(),
  astigmatism: astigmatismSchema.optional(),
  prescription: prescriptionSchema.optional(),
});

export const quickReplySchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1),
});

export const recommendationSchema = z.object({
  productId: z.string().min(1),
  rank: z.union([z.literal(1), z.literal(2)]),
  reason: z.string().trim().min(1),
});

export const turnStatusSchema = z.enum(['asking', 'done', 'refer']);

export const assistantTurnSchema = z
  .object({
    message: z.string().trim().min(1),
    quickReplies: z.array(quickReplySchema).max(MAX_QUICK_REPLIES),
    profile: customerProfileSchema,
    status: turnStatusSchema,
    recommendations: z.array(recommendationSchema).max(2),
    notes: z.array(z.string().trim().min(1)),
  })
  .superRefine((turn, ctx) => {
    const ids = turn.quickReplies.map((r) => r.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', path: ['quickReplies'], message: 'quick reply ids must be unique' });
    }
    if (turn.status === 'done' && turn.recommendations.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['recommendations'], message: "'done' needs at least one recommendation" });
    }
    if (turn.status !== 'done' && turn.recommendations.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['recommendations'], message: "recommendations only in 'done'" });
    }
    if (turn.status === 'refer' && turn.quickReplies.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['quickReplies'], message: "no quick replies in 'refer'" });
    }
    const ranks = turn.recommendations.map((r) => r.rank);
    if (new Set(ranks).size !== ranks.length) {
      ctx.addIssue({ code: 'custom', path: ['recommendations'], message: 'ranks must be unique' });
    }
  });

/** Validates an unknown value as an `AssistantTurn`. Never throws: invalid input → `null`. */
export function parseAssistantTurn(input: unknown): AssistantTurn | null {
  try {
    const result = assistantTurnSchema.safeParse(input);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Compile-time guard: the zod schema and the hand-written contract must match exactly.
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type SchemaMatchesContract = Assert<Equals<z.infer<typeof assistantTurnSchema>, AssistantTurn>>;
