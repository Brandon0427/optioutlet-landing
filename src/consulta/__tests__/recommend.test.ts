import { afterEach, describe, expect, it, vi } from 'vitest';
import { CATALOG, findProduct, type Product } from '../catalog';
import { recommend, resolveRecommendations } from '../recommend';
import type { Astigmatism, CustomerProfile, Frequency, Routine } from '../types';

const ROUTINES: Routine[] = ['office-screens', 'outdoors-active', 'mixed'];
const FREQUENCIES: Frequency[] = ['daily', 'some-days', 'occasional'];
const ASTIGMATISM: Astigmatism[] = ['yes', 'no', 'unsure'];

const combos = ROUTINES.flatMap((routine) =>
  FREQUENCIES.flatMap((frequency) =>
    ASTIGMATISM.map((astigmatism): CustomerProfile => ({
      experience: 'experienced',
      routine,
      frequency,
      astigmatism,
      prescription: 'current',
    })),
  ),
);

describe('catalog', () => {
  it('covers daily/biweekly × spherical/toric with placeholders', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(4);
    expect(CATALOG.length).toBeLessThanOrEqual(6);
    for (const replacement of ['daily', 'biweekly'] as const) {
      for (const design of ['spherical', 'toric'] as const) {
        expect(CATALOG.some((p) => p.replacement === replacement && p.design === design)).toBe(true);
      }
    }
    for (const p of CATALOG) {
      expect(p.isPlaceholder).toBe(true);
      expect(p.name).toMatch(/^\[.*\]$/);
    }
    expect(new Set(CATALOG.map((p) => p.id)).size).toBe(CATALOG.length);
  });
});

describe('recommend', () => {
  it('has 27 combinations', () => {
    expect(combos).toHaveLength(27);
  });

  it.each(combos)('returns two valid recommendations for %o', (profile) => {
    const recs = recommend(profile, CATALOG);
    expect(recs.map((r) => r.rank)).toEqual([1, 2]);
    const [first, second] = recs.map((r) => findProduct(r.productId));
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    const expectedDesign = profile.astigmatism === 'yes' ? 'toric' : 'spherical';
    expect(first!.design).toBe(expectedDesign);
    expect(second!.design).toBe(expectedDesign);

    const expectedReplacement =
      profile.frequency !== 'daily' || profile.routine === 'outdoors-active' ? 'daily' : 'biweekly';
    expect(first!.replacement).toBe(expectedReplacement);
    expect(second!.replacement).not.toBe(first!.replacement);

    for (const r of recs) expect(r.reason.trim().length).toBeGreaterThan(0);
  });

  it('never recommends a spherical lens with astigmatism', () => {
    for (const profile of combos.filter((p) => p.astigmatism === 'yes')) {
      for (const r of recommend(profile, CATALOG)) {
        expect(findProduct(r.productId)!.design).not.toBe('spherical');
      }
    }
  });

  it('builds the first reason from the profile, as in the mockup', () => {
    const [first] = recommend(
      { experience: 'experienced', routine: 'office-screens', frequency: 'daily', astigmatism: 'no', prescription: 'current' },
      CATALOG,
    );
    expect(first!.reason).toBe('Porque pasas buena parte del día frente a la computadora y los usarías todos los días.');
  });

  it('relaxes the replacement, never the design', () => {
    const noDailyToric = CATALOG.filter((p) => p.id !== 'jj-daily-toric');
    const profile: CustomerProfile = { routine: 'outdoors-active', frequency: 'daily', astigmatism: 'yes' };
    const recs = recommend(profile, noDailyToric);
    expect(recs).toHaveLength(1);
    expect(findProduct(recs[0]!.productId)!.design).toBe('toric');
    expect(findProduct(recs[0]!.productId)!.replacement).toBe('biweekly');
  });

  it('returns nothing rather than a spherical lens when no toric exists', () => {
    const noToric = CATALOG.filter((p) => p.design !== 'toric');
    expect(recommend({ astigmatism: 'yes' }, noToric)).toEqual([]);
  });
});

describe('resolveRecommendations', () => {
  afterEach(() => vi.restoreAllMocks());

  it('drops unknown ids without breaking and orders by rank', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const resolved = resolveRecommendations(
      [
        { productId: 'jj-daily-toric', rank: 2, reason: 'b' },
        { productId: 'does-not-exist', rank: 1, reason: 'a' },
        { productId: 'jj-biweekly-toric', rank: 1, reason: 'c' },
      ],
      CATALOG,
    );
    expect(resolved.map((r) => r.product.id)).toEqual(['jj-biweekly-toric', 'jj-daily-toric']);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when nothing exists', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const empty: Product[] = [];
    expect(resolveRecommendations([{ productId: 'jj-daily-toric', rank: 1, reason: 'x' }], empty)).toEqual([]);
  });
});
