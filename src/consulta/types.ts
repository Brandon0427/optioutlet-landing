/**
 * Contract of the consultation with Opti.
 *
 * Every assistant turn reaches the UI as an `AssistantTurn` validated by
 * `schema.ts`. The scripted provider (Session 2) and the Claude API provider
 * (Session 3) both fulfil this contract, so the UI never changes between them.
 * No React or DOM imports here: the server reuses this file.
 */

export type Experience = 'experienced' | 'first-time';
export type Routine = 'office-screens' | 'outdoors-active' | 'mixed';
export type Frequency = 'daily' | 'some-days' | 'occasional';
export type Astigmatism = 'yes' | 'no' | 'unsure';
export type Prescription = 'current' | 'expired-or-none';

export interface CustomerProfile {
  experience?: Experience;
  routine?: Routine;
  frequency?: Frequency;
  astigmatism?: Astigmatism;
  prescription?: Prescription;
}

export interface QuickReply {
  id: string; // stable within the turn
  label: string; // what is shown and what is recorded as the user's message
}

export interface Recommendation {
  productId: string; // must exist in the catalog
  rank: 1 | 2; // 1 = first choice, 2 = alternative
  reason: string; // why, in Spanish, based on the profile
}

export type TurnStatus = 'asking' | 'done' | 'refer';
// refer = Opti stopped the consultation and suggests seeing a specialist (symptoms)

export interface AssistantTurn {
  message: string; // what Opti says, plain text
  quickReplies: QuickReply[]; // 0 to 4
  profile: CustomerProfile; // ACCUMULATED profile up to this turn
  status: TurnStatus;
  recommendations: Recommendation[]; // empty except in 'done'
  notes: string[]; // warnings (prescription not current, check cylinder)
}

export type UserInput =
  | { kind: 'quick'; replyId: string; label: string }
  | { kind: 'text'; text: string };

export type ConversationMessage =
  | { role: 'assistant'; turn: AssistantTurn }
  | { role: 'user'; text: string };

export interface ConsultaProvider {
  start(): Promise<AssistantTurn>;
  reply(history: ConversationMessage[], input: UserInput): Promise<AssistantTurn>;
}
