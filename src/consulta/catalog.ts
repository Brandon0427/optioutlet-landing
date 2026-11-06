/**
 * Product catalog for the consultation. The UI builds every product card from
 * here by `productId`; nothing about a product comes from the provider's text.
 *
 * Session 2: placeholder products. Session 4 replaces the DATA with real
 * Johnson & Johnson products; the `Product` shape is final.
 */
import { STORE_URL } from '../content/landing';

export type Replacement = 'daily' | 'biweekly' | 'monthly';
export type LensDesign = 'spherical' | 'toric' | 'multifocal';
export type Material = 'silicone-hydrogel' | 'hydrogel';

export interface Product {
  id: string; // stable slug
  name: string; // in brackets while it is a placeholder
  brand: 'Johnson & Johnson';
  replacement: Replacement;
  design: LensDesign;
  material: Material;
  priceMXN: number | null; // null = shown as [PRECIO]
  imageUrl: string | null; // null = "Foto del producto" placeholder
  storeUrl: string; // for now, the store URL
  isPlaceholder: boolean;
}

const placeholder = (p: Pick<Product, 'id' | 'name' | 'replacement' | 'design' | 'material'>): Product => ({
  ...p,
  brand: 'Johnson & Johnson',
  priceMXN: null,
  imageUrl: null,
  storeUrl: STORE_URL,
  isPlaceholder: true,
});

export const CATALOG: readonly Product[] = [
  placeholder({ id: 'jj-daily-spherical', name: '[Producto J&J diario]', replacement: 'daily', design: 'spherical', material: 'hydrogel' }),
  placeholder({ id: 'jj-daily-toric', name: '[Producto J&J diario para astigmatismo]', replacement: 'daily', design: 'toric', material: 'hydrogel' }),
  placeholder({ id: 'jj-biweekly-spherical', name: '[Producto J&J quincenal]', replacement: 'biweekly', design: 'spherical', material: 'silicone-hydrogel' }),
  placeholder({ id: 'jj-biweekly-toric', name: '[Producto J&J quincenal para astigmatismo]', replacement: 'biweekly', design: 'toric', material: 'silicone-hydrogel' }),
  placeholder({ id: 'jj-monthly-multifocal', name: '[Producto J&J multifocal mensual]', replacement: 'monthly', design: 'multifocal', material: 'silicone-hydrogel' }),
];

export function findProduct(id: string, catalog: readonly Product[] = CATALOG): Product | undefined {
  return catalog.find((p) => p.id === id);
}
