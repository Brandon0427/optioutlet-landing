/**
 * Product catalog for the consultation. The UI builds every product card from
 * here by `productId`; nothing about a product comes from the provider's text.
 *
 * Session 4: the seven real Johnson & Johnson (ACUVUE) products. Optional
 * fields may be absent (ACOA has no listing yet); consumers must skip them.
 */
import { STORE_URL } from '../config/store.js';

export type Replacement = 'daily' | 'biweekly' | 'monthly';
export type LensDesign = 'spherical' | 'toric' | 'multifocal';
export type Material = 'silicone-hydrogel' | 'hydrogel';

/** Technical specs from the official ACUVUE sheet (AS112401). */
export interface ProductSpecs {
  lensMaterial: string; // 'senofilcon A'
  waterContentPct: number; // 38
  dkt: number; // 121  (×10⁻⁹ at -3.00D)
  uvBlocking: string; // '>99.9% UVB y 96% UVA'
  technologies: string[]; // ['HydraLuxe®']
  baseCurvesMm: number[]; // [8.5, 9.0]
  diameterMm: number; // 14.3
}

export interface Product {
  id: string; // stable slug
  name: string;
  brand: 'Johnson & Johnson';
  replacement: Replacement;
  design: LensDesign;
  material: Material;
  priceMXN: number | null; // null = the card shows no price
  imageUrl: string | null; // null = brand fallback (isotipo on the brand gradient)
  /** Absolute URL: the Mercado Libre listing, or the store (STORE_URL) when there is none. */
  storeUrl: string;
  isPlaceholder: boolean;
  skuCode?: string; // 'AC1O'
  specs?: ProductSpecs;
  lensesPerBox?: number; // 30
  boxDaysBothEyes?: number; // 15 (same prescription in both eyes)
}

/** A Mercado Libre listing URL from its item id ('MLM1895638309' → '…/MLM-1895638309'). No UTM. */
export const mercadoLibreUrl = (itemId: string): string =>
  `https://articulo.mercadolibre.com.mx/MLM-${itemId.replace(/^MLM-?/, '')}`;

const JJ = { brand: 'Johnson & Johnson', isPlaceholder: false } as const;

/**
 * Real J&J catalog (Session 4). Source: docs/data/catalogo-jj.json (Mercado
 * Libre listings + ACUVUE sheet AS112401); this file is the runtime source.
 */
export const CATALOG: readonly Product[] = [
  {
    ...JJ,
    id: 'acuvue-1-day-moist',
    skuCode: 'AC1D',
    name: '1-DAY ACUVUE® MOIST',
    replacement: 'daily',
    design: 'spherical',
    material: 'hydrogel',
    specs: { lensMaterial: 'etafilcon A', waterContentPct: 58, dkt: 25.5, uvBlocking: '~97% UVB y 82% UVA', technologies: ['LACREON®'], baseCurvesMm: [8.5, 9.0], diameterMm: 14.2 },
    lensesPerBox: 30,
    boxDaysBothEyes: 15,
    priceMXN: 1069,
    imageUrl: '/productos/acuvue-1-day-moist.webp',
    storeUrl: mercadoLibreUrl('MLM1895638309'),
  },
  {
    ...JJ,
    id: 'acuvue-oasys-1-day',
    skuCode: 'AC1O',
    name: 'ACUVUE® OASYS 1-Day',
    replacement: 'daily',
    design: 'spherical',
    material: 'silicone-hydrogel',
    specs: { lensMaterial: 'senofilcon A', waterContentPct: 38, dkt: 121, uvBlocking: '>99.9% UVB y 96% UVA', technologies: ['HydraLuxe®'], baseCurvesMm: [8.5, 9.0], diameterMm: 14.3 },
    lensesPerBox: 30,
    boxDaysBothEyes: 15,
    priceMXN: 1199,
    imageUrl: '/productos/acuvue-oasys-1-day.webp',
    storeUrl: mercadoLibreUrl('MLM1895663565'),
  },
  {
    ...JJ,
    id: 'acuvue-vita',
    skuCode: 'ACVI',
    name: 'ACUVUE® VITA®',
    replacement: 'monthly',
    design: 'spherical',
    material: 'silicone-hydrogel',
    specs: { lensMaterial: 'senofilcon C', waterContentPct: 41, dkt: 147, uvBlocking: '>99% UVB y >93% UVA', technologies: ['HydraMax®'], baseCurvesMm: [8.4, 8.8], diameterMm: 14.0 },
    lensesPerBox: 6,
    boxDaysBothEyes: 90,
    priceMXN: 1199,
    imageUrl: '/productos/acuvue-vita.webp',
    storeUrl: mercadoLibreUrl('MLM2209649768'),
  },
  {
    // ACOA: sold, but no Mercado Libre listing yet. Price, box size, photo and
    // listing are pending (docs/backlog.md); until then it links to the store.
    ...JJ,
    id: 'acuvue-oasys',
    skuCode: 'ACOA',
    name: 'ACUVUE® OASYS',
    replacement: 'biweekly',
    design: 'spherical',
    material: 'silicone-hydrogel',
    specs: { lensMaterial: 'senofilcon A', waterContentPct: 38, dkt: 147, uvBlocking: '>99.9% UVB y ~96% UVA', technologies: ['HYDRACLEAR® PLUS'], baseCurvesMm: [8.4, 8.8], diameterMm: 14.0 },
    priceMXN: null,
    imageUrl: null,
    storeUrl: STORE_URL,
  },
  {
    ...JJ,
    id: 'acuvue-1-day-moist-astigmatismo',
    skuCode: 'AC1DAS',
    name: '1-DAY ACUVUE® MOIST for ASTIGMATISM',
    replacement: 'daily',
    design: 'toric',
    material: 'hydrogel',
    specs: { lensMaterial: 'etafilcon A', waterContentPct: 58, dkt: 23.8, uvBlocking: '~97% UVB y 82% UVA', technologies: ['LACREON®', 'BLINK STABILIZED® Design'], baseCurvesMm: [8.5], diameterMm: 14.5 },
    lensesPerBox: 30,
    boxDaysBothEyes: 15,
    priceMXN: 1479,
    imageUrl: '/productos/acuvue-1-day-moist-astigmatismo.webp',
    storeUrl: mercadoLibreUrl('MLM672456958'),
  },
  {
    ...JJ,
    id: 'acuvue-vita-astigmatismo',
    skuCode: 'ACVIAS',
    name: 'ACUVUE® VITA® for ASTIGMATISM',
    replacement: 'monthly',
    design: 'toric',
    material: 'silicone-hydrogel',
    specs: { lensMaterial: 'senofilcon C', waterContentPct: 41, dkt: 129, uvBlocking: '>99% UVB y >93% UVA', technologies: ['HydraMax®', 'BLINK STABILIZED® Design'], baseCurvesMm: [8.6], diameterMm: 14.5 },
    lensesPerBox: 6,
    boxDaysBothEyes: 90,
    priceMXN: 2159,
    imageUrl: '/productos/acuvue-vita-astigmatismo.webp',
    storeUrl: mercadoLibreUrl('MLM1895649425'),
  },
  {
    ...JJ,
    id: 'acuvue-oasys-astigmatismo',
    skuCode: 'ACOAAS',
    name: 'ACUVUE® OASYS for ASTIGMATISM',
    replacement: 'biweekly',
    design: 'toric',
    material: 'silicone-hydrogel',
    specs: { lensMaterial: 'senofilcon A', waterContentPct: 38, dkt: 129, uvBlocking: '>99.9% UVB y ~96% UVA', technologies: ['HYDRACLEAR® PLUS', 'BLINK STABILIZED® Design'], baseCurvesMm: [8.6], diameterMm: 14.5 },
    lensesPerBox: 6,
    boxDaysBothEyes: 42,
    priceMXN: 1446.11,
    imageUrl: '/productos/acuvue-oasys-astigmatismo.webp',
    storeUrl: mercadoLibreUrl('MLM2705311961'),
  },
];

export function findProduct(id: string, catalog: readonly Product[] = CATALOG): Product | undefined {
  return catalog.find((p) => p.id === id);
}
