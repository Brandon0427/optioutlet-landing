/**
 * The profile never loses answers: the model may correct a field (the customer
 * changed their mind), but a field already defined cannot disappear.
 */
import type { CustomerProfile } from '../../src/consulta/types.js';

export function mergeProfile(previous: CustomerProfile, fromModel: CustomerProfile): CustomerProfile {
  const merged: CustomerProfile = { ...previous };
  for (const [key, value] of Object.entries(fromModel) as [keyof CustomerProfile, CustomerProfile[keyof CustomerProfile]][]) {
    if (value !== undefined) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}
