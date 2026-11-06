import { describe, expect, it } from 'vitest';
import { nextField, profileProgress, progressFraction, progressLabel } from '../progress';

describe('progress', () => {
  it('starts at question 1 of 5', () => {
    expect(profileProgress({})).toEqual({ answered: 0, total: 5, current: 1 });
    expect(progressLabel({}, 'asking')).toBe('Pregunta 1 de 5');
    expect(progressLabel({}, null)).toBe('Pregunta 1 de 5');
  });

  it('counts defined fields and caps the question at 5', () => {
    expect(progressLabel({ experience: 'experienced', routine: 'mixed' }, 'asking')).toBe('Pregunta 3 de 5');
    const full = { experience: 'first-time', routine: 'mixed', frequency: 'daily', astigmatism: 'no', prescription: 'current' } as const;
    expect(profileProgress(full)).toEqual({ answered: 5, total: 5, current: 5 });
    expect(nextField(full)).toBeNull();
  });

  it('labels done and refer', () => {
    expect(progressLabel({}, 'done')).toBe('Listo');
    expect(progressLabel({ experience: 'experienced' }, 'refer')).toBe('Consulta en pausa');
  });

  it('derives the bar fill', () => {
    expect(progressFraction({}, 'asking')).toBe(0);
    expect(progressFraction({ experience: 'experienced' }, 'asking')).toBeCloseTo(0.2);
    expect(progressFraction({}, 'done')).toBe(1);
  });

  it('asks fields in the mockup order', () => {
    expect(nextField({})).toBe('experience');
    expect(nextField({ experience: 'experienced' })).toBe('routine');
    expect(nextField({ experience: 'experienced', routine: 'mixed', frequency: 'daily' })).toBe('astigmatism');
  });
});
