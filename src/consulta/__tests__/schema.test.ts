import { describe, expect, it } from 'vitest';
import { parseAssistantTurn } from '../schema';
import type { AssistantTurn } from '../types';

const valid: AssistantTurn = {
  message: '¿Cómo es un día normal para ti?',
  quickReplies: [
    { id: 'office-screens', label: 'Oficina y computadora' },
    { id: 'outdoors-active', label: 'Afuera y en movimiento' },
  ],
  profile: { experience: 'experienced' },
  status: 'asking',
  recommendations: [],
  notes: [],
};

const done: AssistantTurn = {
  message: 'Listo.',
  quickReplies: [],
  profile: { experience: 'experienced', routine: 'mixed', frequency: 'daily', astigmatism: 'no', prescription: 'current' },
  status: 'done',
  recommendations: [
    { productId: 'jj-biweekly-spherical', rank: 1, reason: 'Porque sí.' },
    { productId: 'jj-daily-spherical', rank: 2, reason: 'Alternativa.' },
  ],
  notes: [],
};

describe('parseAssistantTurn', () => {
  it('accepts a valid asking turn', () => {
    expect(parseAssistantTurn(valid)).toEqual(valid);
  });

  it('accepts a valid done turn', () => {
    expect(parseAssistantTurn(done)).toEqual(done);
  });

  it('accepts a JSON round-trip of a valid turn', () => {
    expect(parseAssistantTurn(JSON.parse(JSON.stringify(valid)))).toEqual(valid);
  });

  it.each(['message', 'quickReplies', 'profile', 'status', 'recommendations', 'notes'] as const)(
    'returns null when "%s" is missing',
    (field) => {
      const turn: Record<string, unknown> = { ...valid };
      delete turn[field];
      expect(parseAssistantTurn(turn)).toBeNull();
    },
  );

  it('returns null with an unknown status', () => {
    expect(parseAssistantTurn({ ...valid, status: 'thinking' })).toBeNull();
  });

  it('returns null with more than 4 quick replies', () => {
    const quickReplies = Array.from({ length: 5 }, (_, i) => ({ id: `o${i}`, label: `Opción ${i}` }));
    expect(parseAssistantTurn({ ...valid, quickReplies })).toBeNull();
  });

  it.each([0, 3, 1.5, '1'])('returns null with rank %s', (rank) => {
    const recommendations = [{ productId: 'jj-daily-spherical', rank, reason: 'x' }];
    expect(parseAssistantTurn({ ...done, recommendations })).toBeNull();
  });

  it('returns null with an unknown profile value', () => {
    expect(parseAssistantTurn({ ...valid, profile: { routine: 'space' } })).toBeNull();
  });

  it('returns null with recommendations outside done', () => {
    expect(parseAssistantTurn({ ...done, status: 'asking' })).toBeNull();
  });

  it('returns null with quick replies in refer', () => {
    expect(parseAssistantTurn({ ...valid, status: 'refer' })).toBeNull();
  });

  it('returns null with duplicated quick reply ids or ranks', () => {
    expect(parseAssistantTurn({ ...valid, quickReplies: [valid.quickReplies[0], valid.quickReplies[0]] })).toBeNull();
    const [first] = done.recommendations;
    expect(parseAssistantTurn({ ...done, recommendations: [first, first] })).toBeNull();
  });

  it('never throws, whatever the input', () => {
    const hostile = {
      get message(): string {
        throw new Error('boom');
      },
    };
    for (const input of [null, undefined, 42, 'texto', [], {}, hostile]) {
      expect(() => parseAssistantTurn(input)).not.toThrow();
      expect(parseAssistantTurn(input)).toBeNull();
    }
  });
});
