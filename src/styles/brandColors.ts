/**
 * Brand colors for places where CSS variables can't reach (SVG presentation
 * attributes such as `fill`, `stroke` and `color` inside <pattern>, which are
 * not reliably resolved with var() across browsers).
 *
 * MUST MATCH the @theme block in src/styles/index.css. If a value changes
 * there, change it here too. Components never hard-code brand hex values;
 * they use Tailwind classes (CSS) or this constant (SVG attributes).
 */
export const BRAND_COLORS = {
  navy: '#214367',
  teal: '#67bbb5',
  mint: '#b2ddd5',
  mist: '#eef7f6',
  white: '#ffffff',
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
