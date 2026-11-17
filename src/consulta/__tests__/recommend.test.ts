import { afterEach, describe, expect, it, vi } from 'vitest';
import { CATALOG, findProduct, type Product } from '../catalog';
import { consultaScript } from '../../content/consulta';
import { preferredReplacement, recommend, resolveRecommendations, SLOTS } from '../recommend';
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
  it('has exactly the seven real J&J products, no placeholders and no multifocals', () => {
    expect(CATALOG.map((p) => p.id)).toEqual([
      'acuvue-1-day-moist',
      'acuvue-oasys-1-day',
      'acuvue-vita',
      'acuvue-oasys',
      'acuvue-1-day-moist-astigmatismo',
      'acuvue-vita-astigmatismo',
      'acuvue-oasys-astigmatismo',
    ]);
    for (const p of CATALOG) {
      expect(p.isPlaceholder).toBe(false);
      expect(p.name).not.toMatch(/[[\]]/);
      expect(p.design).not.toBe('multifocal');
      expect(p.specs).toBeDefined();
    }
  });

  it('has a photo and a price for every product with a listing; ACOA has neither and links to the store', () => {
    for (const p of CATALOG.filter((p) => p.id !== 'acuvue-oasys')) {
      expect(p.imageUrl).toBe(`/productos/${p.id}.webp`);
      expect(p.priceMXN).toBeGreaterThan(0);
      expect(p.storeUrl).toMatch(/^https:\/\/articulo\.mercadolibre\.com\.mx\/MLM-\d+$/);
    }
    const acoa = findProduct('acuvue-oasys')!;
    expect(acoa.priceMXN).toBeNull();
    expect(acoa.imageUrl).toBeNull();
    expect(acoa.lensesPerBox).toBeUndefined();
    expect(acoa.boxDaysBothEyes).toBeUndefined();
  });

  it('every slot points at two products of the catalog with the slot design', () => {
    for (const [slot, ids] of Object.entries(SLOTS)) {
      const design = slot.split('-')[1];
      for (const id of ids) expect(findProduct(id)?.design, `${slot} ${id}`).toBe(design);
    }
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

    expect(recs.map((r) => r.productId)).toEqual(SLOTS[`${preferredReplacement(profile)}-${expectedDesign}`]);
    const { alternative, alternativeSameReplacement } = consultaScript.reasons;
    expect(recs[1]!.reason).toBe(
      second!.replacement === first!.replacement ? alternativeSameReplacement : alternative[second!.replacement],
    );

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
    const noDailyToric = CATALOG.filter((p) => p.id !== 'acuvue-1-day-moist-astigmatismo');
    const profile: CustomerProfile = { routine: 'outdoors-active', frequency: 'daily', astigmatism: 'yes' };
    const recs = recommend(profile, noDailyToric);
    expect(recs.map((r) => r.productId)).toEqual(['acuvue-oasys-astigmatismo', 'acuvue-vita-astigmatismo']);
    for (const r of recs) expect(findProduct(r.productId)!.design).toBe('toric');
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
        { productId: 'acuvue-1-day-moist-astigmatismo', rank: 2, reason: 'b' },
        { productId: 'does-not-exist', rank: 1, reason: 'a' },
        { productId: 'acuvue-oasys-astigmatismo', rank: 1, reason: 'c' },
      ],
      CATALOG,
    );
    expect(resolved.map((r) => r.product.id)).toEqual(['acuvue-oasys-astigmatismo', 'acuvue-1-day-moist-astigmatismo']);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when nothing exists', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const empty: Product[] = [];
    expect(resolveRecommendations([{ productId: 'acuvue-1-day-moist-astigmatismo', rank: 1, reason: 'x' }], empty)).toEqual([]);
  });
});
