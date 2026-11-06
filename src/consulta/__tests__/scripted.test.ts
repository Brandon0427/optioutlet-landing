import { afterEach, describe, expect, it, vi } from 'vitest';
import { consultaScript } from '../../content/consulta';
import { findProduct } from '../catalog';
import { createScriptedProvider } from '../providers/scripted';
import { parseAssistantTurn } from '../schema';
import type { AssistantTurn, ConsultaProvider, ConversationMessage, CustomerProfile, UserInput } from '../types';

const { questions } = consultaScript;

/** Drives a conversation and records every turn the provider produced. */
class Session {
  history: ConversationMessage[] = [];
  turns: AssistantTurn[] = [];
  private provider: ConsultaProvider;
  constructor(provider: ConsultaProvider) {
    this.provider = provider;
  }

  get last(): AssistantTurn {
    return this.turns[this.turns.length - 1]!;
  }

  async start() {
    this.push(await this.provider.start());
    return this.last;
  }

  async send(input: UserInput) {
    const turn = await this.provider.reply(this.history, input);
    this.history.push({ role: 'user', text: input.kind === 'quick' ? input.label : input.text });
    this.push(turn);
    return turn;
  }

  quick(replyId: string) {
    const reply = this.last.quickReplies.find((r) => r.id === replyId);
    if (!reply) throw new Error(`no quick reply ${replyId} in: ${this.last.message}`);
    return this.send({ kind: 'quick', replyId, label: reply.label });
  }

  text(text: string) {
    return this.send({ kind: 'text', text });
  }

  private push(turn: AssistantTurn) {
    this.history.push({ role: 'assistant', turn });
    this.turns.push(turn);
  }
}

const newSession = () => new Session(createScriptedProvider({ latencyMs: 0 }));

const FULL_PATH = ['experienced', 'office-screens', 'daily', 'no', 'current'];

async function answerFirst(s: Session, n: number) {
  await s.start();
  for (const id of FULL_PATH.slice(0, n)) await s.quick(id);
}

const allValid = (turns: AssistantTurn[]) => turns.every((t) => parseAssistantTurn(t) !== null);

describe('scripted provider', () => {
  afterEach(() => vi.useRealTimers());

  it('completes the consultation with quick replies', async () => {
    const s = newSession();
    const first = await s.start();
    expect(first.message).toContain(consultaScript.greeting);
    expect(first.message).toContain(questions.experience.text);
    expect(first.quickReplies.map((r) => r.label)).toEqual(['Sí, ya los uso', 'Sería mi primera vez']);

    const asked: string[] = [];
    for (const id of FULL_PATH) {
      asked.push(s.last.message);
      await s.quick(id);
    }
    expect(asked.slice(1)).toEqual([questions.routine.text, questions.frequency.text, questions.astigmatism.text, questions.prescription.text]);

    const done = s.last;
    expect(done.status).toBe('done');
    expect(done.profile).toEqual<CustomerProfile>({
      experience: 'experienced',
      routine: 'office-screens',
      frequency: 'daily',
      astigmatism: 'no',
      prescription: 'current',
    });
    expect(done.recommendations.map((r) => r.rank)).toEqual([1, 2]);
    for (const r of done.recommendations) expect(findProduct(r.productId)).toBeDefined();
    expect(findProduct(done.recommendations[0]!.productId)!.replacement).toBe('biweekly');
    expect(done.quickReplies).toEqual([]);
    expect(done.notes).toEqual([]);
    expect(allValid(s.turns)).toBe(true);
  });

  it('advances with matching free text', async () => {
    const s = newSession();
    await answerFirst(s, 1);
    const turn = await s.text('trabajo en oficina todo el día');
    expect(turn.profile.routine).toBe('office-screens');
    expect(turn.message).toBe(questions.frequency.text);
  });

  it.each<[number, string, keyof CustomerProfile, string]>([
    [0, 'Nunca los he usado', 'experience', 'first-time'],
    [0, 'sí, desde hace años', 'experience', 'experienced'],
    [1, 'Salgo a correr y estoy en la calle', 'routine', 'outdoors-active'],
    [1, 'un poco de todo', 'routine', 'mixed'],
    [2, 'Solo los fines de semana', 'frequency', 'some-days'],
    [2, 'para fiestas y bodas', 'frequency', 'occasional'],
    [3, 'No tengo astigmatismo', 'astigmatism', 'no'],
    [3, 'Sí, dice CYL', 'astigmatism', 'yes'],
    [3, 'No sé', 'astigmatism', 'unsure'],
    [3, 'creo que sí', 'astigmatism', 'unsure'],
    [4, 'Ya no está vigente', 'prescription', 'expired-or-none'],
    [4, 'No tengo receta', 'prescription', 'expired-or-none'],
    [4, 'Sí, es de este año', 'prescription', 'current'],
  ])('question %i: "%s" sets %s = %s', async (answered, text, field, value) => {
    const s = newSession();
    await answerFirst(s, answered);
    const turn = await s.text(text);
    expect(turn.profile[field]).toBe(value);
  });

  it('repeats the question with a clarification when free text does not match', async () => {
    const s = newSession();
    await answerFirst(s, 1);
    const before = s.last;
    const turn = await s.text('me gustan los gatos');
    expect(turn.status).toBe('asking');
    expect(turn.profile).toEqual(before.profile);
    expect(turn.message).toBe(`${questions.routine.clarify}\n\n${questions.routine.text}`);
    expect(turn.quickReplies).toEqual(before.quickReplies);
  });

  it('treats ambiguous free text as no match', async () => {
    const s = newSession();
    await answerFirst(s, 2);
    const turn = await s.text('todos los días o a veces');
    expect(turn.profile.frequency).toBeUndefined();
    expect(turn.message).toContain(questions.frequency.clarify);
  });

  it.each([0, 1, 2, 3, 4])('refers to a specialist on symptoms at question %i', async (answered) => {
    const s = newSession();
    await answerFirst(s, answered);
    const before = s.last.profile;
    const turn = await s.text('Últimamente tengo el ojo rojo y me arde');
    expect(turn.status).toBe('refer');
    expect(turn.message).toBe(consultaScript.refer.message);
    expect(turn.quickReplies).toEqual([]);
    expect(turn.recommendations).toEqual([]);
    expect(turn.profile).toEqual(before);
    expect(allValid(s.turns)).toBe(true);
  });

  it.each(['Me duele un poco', 'Veo borroso desde ayer', 'tengo secreción', 'creo que es una infección'])(
    'detects the symptom in "%s"',
    async (text) => {
      const s = newSession();
      await answerFirst(s, 2);
      expect((await s.text(text)).status).toBe('refer');
    },
  );

  it('stays paused after a referral', async () => {
    const s = newSession();
    await answerFirst(s, 1);
    await s.text('tengo dolor');
    const again = await s.text('oficina');
    expect(again.status).toBe('refer');
    expect(again.recommendations).toEqual([]);
  });

  it.each(['¿Qué graduación necesito?', 'cual es mi graduacion', '¿Qué curva base y eje me tocan?', 'dime cuantas dioptrias tengo'])(
    'answers "%s" without values and without advancing',
    async (text) => {
      const s = newSession();
      await answerFirst(s, 3);
      const before = s.last;
      const turn = await s.text(text);
      expect(turn.status).toBe('asking');
      expect(turn.profile).toEqual(before.profile);
      expect(turn.message).toContain(consultaScript.prescriptionValues.answer);
      expect(turn.message).toContain(questions.astigmatism.text);
      expect(turn.message).not.toMatch(/\d/);
      expect(turn.quickReplies).toEqual(before.quickReplies);
    },
  );

  it('never puts numbers in what Opti says', async () => {
    const s = newSession();
    await s.start();
    for (const id of ['first-time', 'outdoors-active', 'occasional', 'yes', 'expired-or-none']) await s.quick(id);
    for (const t of s.turns) {
      expect(t.message).not.toMatch(/\d/);
      for (const r of t.recommendations) expect(r.reason).not.toMatch(/\d/);
    }
  });

  it('adds the expired-prescription note', async () => {
    const s = newSession();
    await answerFirst(s, 4);
    const done = await s.quick('expired-or-none');
    expect(done.status).toBe('done');
    expect(done.notes).toEqual([consultaScript.notes.prescriptionExpired]);
  });

  it('adds the unsure-astigmatism note and keeps spherical lenses', async () => {
    const s = newSession();
    await answerFirst(s, 3);
    await s.quick('unsure');
    const done = await s.quick('expired-or-none');
    expect(done.notes).toEqual([consultaScript.notes.prescriptionExpired, consultaScript.notes.astigmatismUnsure]);
    for (const r of done.recommendations) expect(findProduct(r.productId)!.design).toBe('spherical');
  });

  it('recommends toric lenses with astigmatism', async () => {
    const s = newSession();
    await s.start();
    for (const id of ['first-time', 'outdoors-active', 'occasional', 'yes', 'current']) await s.quick(id);
    const designs = s.last.recommendations.map((r) => findProduct(r.productId)!.design);
    expect(designs).toEqual(['toric', 'toric']);
    expect(findProduct(s.last.recommendations[0]!.productId)!.replacement).toBe('daily');
  });

  it('is stateless: the same history gives the same turn, across instances', async () => {
    const a = newSession();
    await answerFirst(a, 2);
    const fresh = createScriptedProvider({ latencyMs: 0 });
    const input: UserInput = { kind: 'quick', replyId: 'daily', label: 'Todos los días' };
    expect(await fresh.reply(a.history, input)).toEqual(await createScriptedProvider({ latencyMs: 0 }).reply(a.history, input));
    expect((await fresh.reply(a.history, input)).profile.frequency).toBe('daily');
  });

  it('falls back to the label when the quick reply id is unknown', async () => {
    const s = newSession();
    await answerFirst(s, 1);
    const turn = await s.send({ kind: 'quick', replyId: 'zzz', label: 'Afuera y en movimiento' });
    expect(turn.profile.routine).toBe('outdoors-active');
  });

  it('answers after done with the same closing turn', async () => {
    const s = newSession();
    await answerFirst(s, 5);
    const done = s.last;
    expect(await s.text('gracias')).toEqual(done);
  });

  it('every turn of a long mixed conversation passes the contract', async () => {
    const s = newSession();
    await s.start();
    await s.text('mmm');
    await s.text('ya los uso');
    await s.text('¿qué graduación tengo?');
    await s.quick('mixed');
    await s.text('a veces');
    await s.text('no sé');
    await s.text('no, ya venció');
    expect(s.last.status).toBe('done');
    expect(s.turns).toHaveLength(8);
    expect(allValid(s.turns)).toBe(true);
  });

  it('simulates 600–1000 ms of latency by default', async () => {
    vi.useFakeTimers();
    const provider = createScriptedProvider({ random: () => 1 });
    let resolved = false;
    void provider.start().then(() => (resolved = true));
    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);

    const fast = createScriptedProvider({ random: () => 0 });
    let fastResolved = false;
    void fast.start().then(() => (fastResolved = true));
    await vi.advanceTimersByTimeAsync(599);
    expect(fastResolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(fastResolved).toBe(true);
  });
});
