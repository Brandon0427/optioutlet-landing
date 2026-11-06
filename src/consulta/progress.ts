/**
 * Progress is not part of the contract: the UI derives it from the profile
 * (defined fields out of 5). No React or DOM.
 */
import { landing } from '../content/landing';
import type { CustomerProfile, TurnStatus } from './types';

/** Profile fields in the order Opti asks them (the mockup's order). */
export const QUESTION_ORDER = ['experience', 'routine', 'frequency', 'astigmatism', 'prescription'] as const;

export type ProfileField = (typeof QUESTION_ORDER)[number];

export const TOTAL_QUESTIONS = QUESTION_ORDER.length;

export interface ProfileProgress {
  /** Defined fields. */
  answered: number;
  total: number;
  /** Question being asked: answered + 1, at most total. */
  current: number;
}

export function profileProgress(profile: CustomerProfile): ProfileProgress {
  const answered = QUESTION_ORDER.filter((f) => profile[f] !== undefined).length;
  return { answered, total: TOTAL_QUESTIONS, current: Math.min(answered + 1, TOTAL_QUESTIONS) };
}

/** First profile field still undefined, or null when the profile is complete. */
export function nextField(profile: CustomerProfile): ProfileField | null {
  return QUESTION_ORDER.find((f) => profile[f] === undefined) ?? null;
}

/** "Pregunta N de 5", "Listo" in 'done', "Consulta en pausa" in 'refer'. */
export function progressLabel(profile: CustomerProfile, status: TurnStatus | null): string {
  const { chat } = landing.consulta;
  if (status === 'done') return chat.doneLabel;
  if (status === 'refer') return chat.pausedLabel;
  const { current, total } = profileProgress(profile);
  return chat.progressLabel(current, total);
}

/** Fill of the progress bar, 0–1. Full in 'done'. */
export function progressFraction(profile: CustomerProfile, status: TurnStatus | null): number {
  if (status === 'done') return 1;
  return profileProgress(profile).answered / TOTAL_QUESTIONS;
}
