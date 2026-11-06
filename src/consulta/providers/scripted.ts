/**
 * Scripted provider: holds the consultation without a network or AI.
 *
 * Stateless, like the API will be: every call receives the full history and
 * rebuilds where the conversation is from the last assistant turn's profile.
 * Every turn it produces is validated against the contract before leaving.
 * In Session 5 it becomes the `?demo=1` fallback, so it is not throwaway code.
 *
 * No React or DOM imports.
 */
import { consultaScript, type ScriptQuestion } from '../../content/consulta';
import { CATALOG, type Product } from '../catalog';
import { nextField, type ProfileField } from '../progress';
import { recommend } from '../recommend';
import { parseAssistantTurn } from '../schema';
import type { AssistantTurn, ConsultaProvider, ConversationMessage, CustomerProfile, UserInput } from '../types';

export interface ScriptedProviderOptions {
  /** Simulated latency per turn, [min, max] ms. 0 disables it (tests). Default [600, 1000]. */
  latencyMs?: readonly [number, number] | 0;
  /** Random source for the latency, 0–1. */
  random?: () => number;
  catalog?: readonly Product[];
}

const DEFAULT_LATENCY: readonly [number, number] = [600, 1000];

/** Lowercase, no accents, no punctuation, single spaces. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Whole-word (or whole-phrase) match on normalized text. */
const hasPhrase = (normalized: string, phrase: string) => ` ${normalized} `.includes(` ${phrase} `);

export function mentionsSymptoms(text: string): boolean {
  const norm = normalizeText(text);
  return consultaScript.refer.keywords.some((k) => hasPhrase(norm, k));
}

export function asksForPrescriptionValues(text: string): boolean {
  const norm = normalizeText(text);
  const { terms, questionWords } = consultaScript.prescriptionValues;
  if (!terms.some((t) => hasPhrase(norm, t))) return false;
  return /[?¿]/.test(text) || questionWords.some((w) => hasPhrase(norm, w));
}

/**
 * Maps free text to one option of the question. When two matched keywords
 * overlap ("no" inside "no se"), the longer wins. Ambiguous or no match → null.
 */
export function matchOption<V extends string>(question: ScriptQuestion<V>, text: string): V | null {
  const norm = normalizeText(text);
  const matches = question.options.flatMap((o) =>
    o.keywords.filter((k) => hasPhrase(norm, k)).map((k) => ({ value: o.value, keyword: k })),
  );
  const kept = matches.filter(
    (m) => !matches.some((o) => o.value !== m.value && o.keyword !== m.keyword && hasPhrase(o.keyword, m.keyword)),
  );
  const values = [...new Set(kept.map((m) => m.value))];
  return values.length === 1 ? values[0]! : null;
}

const questionFor = (field: ProfileField): ScriptQuestion<string> => consultaScript.questions[field];

function questionTurn(field: ProfileField, profile: CustomerProfile, prefix?: string): AssistantTurn {
  const q = questionFor(field);
  return {
    message: prefix ? `${prefix}\n\n${q.text}` : q.text,
    quickReplies: q.options.map((o) => ({ id: o.value, label: o.label })),
    profile,
    status: 'asking',
    recommendations: [],
    notes: [],
  };
}

function doneTurn(profile: CustomerProfile, catalog: readonly Product[]): AssistantTurn {
  const notes: string[] = [];
  if (profile.prescription === 'expired-or-none') notes.push(consultaScript.notes.prescriptionExpired);
  if (profile.astigmatism === 'unsure') notes.push(consultaScript.notes.astigmatismUnsure);
  return {
    message: consultaScript.done.message,
    quickReplies: [],
    profile,
    status: 'done',
    recommendations: recommend(profile, catalog),
    notes,
  };
}

function referTurn(profile: CustomerProfile): AssistantTurn {
  return { message: consultaScript.refer.message, quickReplies: [], profile, status: 'refer', recommendations: [], notes: [] };
}

function firstTurn(): AssistantTurn {
  return questionTurn('experience', {}, consultaScript.greeting);
}

/** Next turn after answering `field` with `value`. */
function advance(profile: CustomerProfile, field: ProfileField, value: string, catalog: readonly Product[]): AssistantTurn {
  const next = { ...profile, [field]: value } as CustomerProfile;
  const nf = nextField(next);
  return nf ? questionTurn(nf, next) : doneTurn(next, catalog);
}

/** Pure turn logic, without latency or validation. Exported for tests. */
export function scriptedReply(
  history: readonly ConversationMessage[],
  input: UserInput,
  catalog: readonly Product[] = CATALOG,
): AssistantTurn {
  const last = [...history].reverse().find((m) => m.role === 'assistant');
  if (!last) return firstTurn();
  const { turn } = last;
  // The consultation is over: answer with the same closing turn.
  if (turn.status !== 'asking') return turn;

  const profile = turn.profile;
  const field = nextField(profile);
  if (!field) return doneTurn(profile, catalog);
  const question = questionFor(field);

  if (input.kind === 'quick') {
    const option = question.options.find((o) => o.value === input.replyId);
    if (option) return advance(profile, field, option.value, catalog);
  }

  const text = input.kind === 'quick' ? input.label : input.text;
  if (mentionsSymptoms(text)) return referTurn(profile);
  if (asksForPrescriptionValues(text)) return questionTurn(field, profile, consultaScript.prescriptionValues.answer);
  const value = matchOption(question, text);
  if (value) return advance(profile, field, value, catalog);
  return questionTurn(field, profile, question.clarify);
}

function validated(turn: AssistantTurn): AssistantTurn {
  const parsed = parseAssistantTurn(turn);
  if (!parsed) throw new Error('[consulta] scripted turn does not meet the contract');
  return parsed;
}

export function createScriptedProvider(options: ScriptedProviderOptions = {}): ConsultaProvider {
  const { latencyMs = DEFAULT_LATENCY, random = Math.random, catalog = CATALOG } = options;

  const wait = () => {
    if (latencyMs === 0) return Promise.resolve();
    const [min, max] = latencyMs;
    const ms = min + random() * (max - min);
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  };

  return {
    async start() {
      await wait();
      return validated(firstTurn());
    },
    async reply(history, input) {
      await wait();
      return validated(scriptedReply(history, input, catalog));
    },
  };
}
