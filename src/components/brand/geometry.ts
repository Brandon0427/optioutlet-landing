/**
 * Brand geometry, ported from docs/mockup/optioutlet-mockup.dc.html.
 *
 * Correction vs. the mockup (per the brand manual): the bite of the isotipo
 * and of the pattern dot BREAKS the circle's edge. The mockup drew them as
 * interior holes (evenodd), which is wrong. Bites are drawn as a single
 * pre-cut path (circle minus bite circle), so no masks or unique ids are needed
 * and the shape looks the same on any background, including inside patterns.
 */

import { BRAND_COLORS } from '../../styles/brandColors';

export type ShapeName = 'u' | 'loop' | 'dot';

type Circle = { cx: number; cy: number; r: number };

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Path of `base` with the `bite` circle removed, where the bite crosses the
 * edge. Uses the two intersection points of both circles:
 *   d = |bite − base|, a = (R² − r² + d²) / 2d, h = √(R² − a²)
 * then: long arc of the base circle (outside the bite) + concave arc of the bite.
 */
export function bittenCirclePath(base: Circle, bite: Circle): string {
  const dx = bite.cx - base.cx;
  const dy = bite.cy - base.cy;
  const d = Math.hypot(dx, dy);
  if (d + bite.r <= base.r || d >= base.r + bite.r) {
    throw new Error('bittenCirclePath: the bite must cross the edge of the base circle');
  }
  const a = (base.r ** 2 - bite.r ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(base.r ** 2 - a ** 2);
  const ux = dx / d;
  const uy = dy / d;
  const px = base.cx + a * ux;
  const py = base.cy + a * uy;
  const x1 = round(px - h * uy);
  const y1 = round(py + h * ux);
  const x2 = round(px + h * uy);
  const y2 = round(py - h * ux);
  const largeBase = a > 0 ? 1 : 0; // base arc outside the bite is > 180° when the chord is past the base center
  const largeBite = d < a ? 1 : 0; // bite arc inside the base is > 180° when the bite center is inside the chord
  return `M${x1} ${y1} A${base.r} ${base.r} 0 ${largeBase} 1 ${x2} ${y2} A${bite.r} ${bite.r} 0 ${largeBite} 0 ${x1} ${y1} Z`;
}

/** viewBox shared by every pattern stroke (U, loop, dot). */
export const SHAPE_VIEWBOX = '-60 -60 120 140';
/** Tight viewBox around the dot, for inline use (list bullets). */
export const DOT_TIGHT_VIEWBOX = '-30 -30 60 60';

export const U_SHAPE = { d: 'M-32 -40 V20 A32 32 0 0 0 32 20 V-40', strokeWidth: 22 } as const;

export const LOOP_SHAPE = {
  d: 'M-30 0 A30 30 0 1 0 30 0 A30 30 0 1 0 -30 0 M30 0 L22 72',
  strokeWidth: 20,
} as const;

/** Dot with a bite: circle r22 at the origin minus circle r9 at (10, −12). 15.6 + 9 > 22 → breaks the edge. */
const DOT_BASE: Circle = { cx: 0, cy: 0, r: 22 };
const DOT_BITE: Circle = { cx: 10, cy: -12, r: 9 };
export const DOT_SHAPE = { ...DOT_BASE, bite: DOT_BITE, d: bittenCirclePath(DOT_BASE, DOT_BITE) } as const;

/** Isotipo: circle r50 at (50, 50) minus circle r19 at (70, 24). 32.8 + 19 > 50 → breaks the edge. */
const ISO_BASE: Circle = { cx: 50, cy: 50, r: 50 };
const ISO_BITE: Circle = { cx: 70, cy: 24, r: 19 };
export const ISOTIPO_SHAPE = {
  viewBox: '0 0 100 100',
  ...ISO_BASE,
  bite: ISO_BITE,
  d: bittenCirclePath(ISO_BASE, ISO_BITE),
} as const;

// ─── Pattern ──────────────────────────────────────────────────────────────

export const PATTERN_TILE = 520;
export const PATTERN_SCALE = 0.72;
/** Rendered height of one tile, in px. A parallax that cycles by this amount loops seamlessly. */
export const PATTERN_PERIOD = PATTERN_TILE * PATTERN_SCALE; // 374.4

/** `accent` is always teal; `contrast` is white on the dark pattern and navy on the light one. */
export type PatternTone = 'accent' | 'contrast';

export const PATTERN_LAYOUT: ReadonlyArray<{ shape: ShapeName; transform: string; tone: PatternTone }> = [
  { shape: 'u', transform: 'translate(90 100) rotate(-20)', tone: 'accent' },
  { shape: 'loop', transform: 'translate(260 100) rotate(25)', tone: 'contrast' },
  { shape: 'dot', transform: 'translate(420 90)', tone: 'accent' },
  { shape: 'dot', transform: 'translate(150 250) scale(0.8)', tone: 'contrast' },
  { shape: 'u', transform: 'translate(340 260) rotate(160)', tone: 'contrast' },
  { shape: 'dot', transform: 'translate(455 250) scale(0.6)', tone: 'accent' },
  { shape: 'loop', transform: 'translate(110 390) rotate(-50)', tone: 'accent' },
  { shape: 'u', transform: 'translate(290 420) rotate(30)', tone: 'accent' },
  { shape: 'dot', transform: 'translate(440 420)', tone: 'contrast' },
  { shape: 'dot', transform: 'translate(220 330) scale(0.6)', tone: 'accent' },
];

/** Fixed ids: PatternDefs is mounted exactly once. */
export const PATTERN_IDS = { dark: 'oo-pattern-dark', light: 'oo-pattern-light' } as const;
export const PATTERN_SHAPE_IDS: Record<ShapeName, string> = { u: 'oo-shape-u', loop: 'oo-shape-loop', dot: 'oo-shape-dot' };
export type PatternVariant = keyof typeof PATTERN_IDS;

export const PATTERN_COLORS: Record<PatternVariant, Record<PatternTone, string>> = {
  dark: { accent: BRAND_COLORS.teal, contrast: BRAND_COLORS.white },
  light: { accent: BRAND_COLORS.teal, contrast: BRAND_COLORS.navy },
};

/** React's useId() output is not guaranteed to be a clean SVG/CSS id; normalize it. */
export const svgId = (reactId: string, suffix: string) => `oo${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${suffix}`;
