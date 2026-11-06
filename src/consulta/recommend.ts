/**
 * Recommendation rules (pure functions, no React or DOM).
 *
 * - Daily replacement if the frequency isn't 'daily' or the routine is
 *   'outdoors-active'; otherwise biweekly.
 * - Toric design if astigmatism === 'yes'; otherwise spherical.
 * - Rank 1 meets both rules; rank 2 changes the replacement and keeps the design.
 * - When no product fits, the replacement is relaxed first and the design
 *   never is: someone with astigmatism never gets a spherical lens.
 */
import { consultaScript } from '../content/consulta';
import type { Product, Replacement } from './catalog';
import type { CustomerProfile, Recommendation } from './types';

const { reasons } = consultaScript;

export interface ResolvedRecommendation {
  recommendation: Recommendation;
  product: Product;
}

/** Replacement the rules prefer for this profile. */
export function preferredReplacement(profile: CustomerProfile): Replacement {
  return profile.frequency !== 'daily' || profile.routine === 'outdoors-active' ? 'daily' : 'biweekly';
}

const joinEs = (parts: string[]) =>
  parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;

/** Reason for the first choice, built from the profile (as in the mockup). */
export function firstChoiceReason(profile: CustomerProfile): string {
  const parts: string[] = [];
  if (profile.routine) parts.push(reasons.routine[profile.routine]);
  if (profile.frequency) parts.push(reasons.frequency[profile.frequency]);
  if (profile.astigmatism === 'yes') parts.push(reasons.astigmatism);
  if (profile.experience === 'first-time') parts.push(reasons.firstTime);
  return parts.length ? `${reasons.lead} ${joinEs(parts)}.` : reasons.fallback;
}

export function recommend(profile: CustomerProfile, catalog: readonly Product[]): Recommendation[] {
  const design = profile.astigmatism === 'yes' ? 'toric' : 'spherical';
  const preferred = preferredReplacement(profile);
  const other: Replacement = preferred === 'daily' ? 'biweekly' : 'daily';
  // Relax the replacement in this order; the design is fixed.
  const order: Replacement[] = [preferred, other, 'monthly'];

  const sameDesign = catalog.filter((p) => p.design === design);
  const byReplacement = (r: Replacement) => sameDesign.find((p) => p.replacement === r);

  const first = order.map(byReplacement).find((p): p is Product => p !== undefined);
  if (!first) return [];

  const second = order
    .filter((r) => r !== first.replacement)
    .map(byReplacement)
    .find((p): p is Product => p !== undefined);

  const result: Recommendation[] = [{ productId: first.id, rank: 1, reason: firstChoiceReason(profile) }];
  if (second) {
    result.push({ productId: second.id, rank: 2, reason: reasons.alternative[second.replacement] });
  }
  return result;
}

/**
 * Keeps only recommendations whose product exists in the catalog, ordered by
 * rank. Unknown ids are dropped (with a console warning in development only).
 */
export function resolveRecommendations(
  recs: readonly Recommendation[],
  catalog: readonly Product[],
): ResolvedRecommendation[] {
  const resolved: ResolvedRecommendation[] = [];
  for (const recommendation of recs) {
    const product = catalog.find((p) => p.id === recommendation.productId);
    if (product) {
      resolved.push({ recommendation, product });
    } else if (import.meta.env?.DEV) {
      console.warn(`[consulta] dropped recommendation with unknown productId "${recommendation.productId}"`);
    }
  }
  return resolved.sort((a, b) => a.recommendation.rank - b.recommendation.rank);
}
