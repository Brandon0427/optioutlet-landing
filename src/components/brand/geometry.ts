/**
 * Brand geometry. Since Session 8 every shape is the designer's official outline
 * (officialGeometry.ts, copied verbatim from docs/brand/svg/). Each pattern piece is placed in
 * the shared frame with a UNIFORM transform (no X/Y distortion): rotated to the orientation the
 * previous drawn shape had, centered on its painted center, and scaled so its longer side matches.
 * That keeps the visual size, rotation and position of every instance and of the pattern tiles.
 * Transforms computed by .cache/qa-s8/align.mjs (rotation by best IoU against the old shape).
 */

import { BRAND_COLORS } from '../../styles/brandColors';
import { OFFICIAL_DOT, OFFICIAL_LOOP, OFFICIAL_U } from './officialGeometry';

export type ShapeName = 'u' | 'loop' | 'dot';

/** viewBox shared by every pattern piece (U, loop, dot). */
export const SHAPE_VIEWBOX = '-60 -60 120 140';
/** Tight viewBox around the dot, for inline use (list bullets). */
export const DOT_TIGHT_VIEWBOX = '-30 -30 60 60';

/** 5.svg. Old painted box 86×103 → longer side 103; official rotated 45.7° so it opens upwards. */
export const U_SHAPE = { d: OFFICIAL_U.d, transform: 'translate(-11.709 -62.029) scale(1.191) rotate(45.7)' } as const;
/** 3.svg. Old painted box 80×113.2 → longer side 113.2; rotated −4.2° to match the old tail. */
export const LOOP_SHAPE = { d: OFFICIAL_LOOP.d, transform: 'translate(-45.801 -37.328) scale(1.145) rotate(-4.2)' } as const;
/** 7.svg, official orientation (bite top-right). Old painted box 44×44, centered on the origin. */
export const DOT_SHAPE = { d: OFFICIAL_DOT.d, transform: 'translate(-22 -22) scale(1.245)' } as const;

/** Isotipo: the official bitten pupil, in its own viewBox (the bite breaks the edge). */
export const ISOTIPO_SHAPE = { viewBox: OFFICIAL_DOT.viewBox, d: OFFICIAL_DOT.d } as const;

/**
 * PupilReveal splits the isotipo in two so its timeline can fade the bite out (decision 5):
 * - DISC: the official outline with the bite closed by an arc (r 17.72, fitted to the outline), navy.
 * - BITE_LENS: the official bite contour (from A 32.05,7.32 to B 17.04,0) closed with the same arc,
 *   painted in the stage color. BITE_EDGE is that arc alone, stroked 0.4 units in the stage color: it
 *   hides the disc's antialiased edge under the bite (no navy hairline) without a visible overhang.
 */
const BITE_CONTOUR = '-.65,1.18-1.6,2.22-2.81,3-3.89,2.49-9.06,1.35-11.55-2.54-1.55-2.42-1.69-5.32-.65-7.78';
if (!OFFICIAL_DOT.d.includes(BITE_CONTOUR)) throw new Error('geometry: official dot bite contour not found');
export const ISOTIPO_SPLIT = {
  viewBox: OFFICIAL_DOT.viewBox,
  disc: OFFICIAL_DOT.d.replace(BITE_CONTOUR, 'A17.72 17.72 0 0 0 17.04 0c'),
  biteLens: `M32.05,7.32c${BITE_CONTOUR}A17.72 17.72 0 0 1 32.05 7.32Z`,
  biteEdge: { d: 'M17.04,0A17.72 17.72 0 0 1 32.05,7.32', strokeWidth: 0.4 },
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
