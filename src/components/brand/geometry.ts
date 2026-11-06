/**
 * Brand geometry, ported from docs/mockup/optioutlet-mockup.dc.html.
 *
 * Correction vs. the mockup (per the brand manual): the bite of the isotipo
 * and of the pattern dot BREAKS the circle's edge. The mockup drew them as
 * interior holes (evenodd), which is wrong. Bites are cut with an SVG mask.
 */

export type ShapeName = 'u' | 'loop' | 'dot';

/** viewBox shared by every pattern stroke (U, loop, dot). */
export const SHAPE_VIEWBOX = '-60 -60 120 140';

export const U_SHAPE = { d: 'M-32 -40 V20 A32 32 0 0 0 32 20 V-40', strokeWidth: 22 } as const;

export const LOOP_SHAPE = {
  d: 'M-30 0 A30 30 0 1 0 30 0 A30 30 0 1 0 -30 0 M30 0 L22 72',
  strokeWidth: 20,
} as const;

/** Dot with a bite: circle r22 at the origin minus circle r9 at (10, −12). 15.6 + 9 > 22 → breaks the edge. */
export const DOT_SHAPE = { r: 22, bite: { cx: 10, cy: -12, r: 9 } } as const;

/** Isotipo: circle r50 at (50, 50) minus circle r19 at (70, 24). 32.8 + 19 > 50 → breaks the edge. */
export const ISOTIPO_SHAPE = { viewBox: '0 0 100 100', cx: 50, cy: 50, r: 50, bite: { cx: 70, cy: 24, r: 19 } } as const;

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

export const PATTERN_IDS = { dark: 'oo-pattern-dark', light: 'oo-pattern-light' } as const;
export type PatternVariant = keyof typeof PATTERN_IDS;

export const PATTERN_COLORS: Record<PatternVariant, Record<PatternTone, string>> = {
  dark: { accent: '#67bbb5', contrast: '#ffffff' },
  light: { accent: '#67bbb5', contrast: '#214367' },
};

/** React's useId() output is not guaranteed to be a clean SVG/CSS id; normalize it. */
export const svgId = (reactId: string, suffix: string) => `oo${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}-${suffix}`;
