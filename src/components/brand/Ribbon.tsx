import { useId, type Ref } from 'react';
import { BRAND_COLORS as C } from '../../styles/brandColors';
import { svgId } from './geometry';

/** The U ribbon's centerline (viewBox 0 0 340 420). */
export const RIBBON_PATH = 'M60 10 V250 A110 110 0 0 0 280 250 V10';

/** Length of RIBBON_PATH in user units: two 240 straights + a half circle of r 110 (≈ 825.6). */
export const RIBBON_PATH_LENGTH = 240 + Math.PI * 110 + 240;

/**
 * Fixed length of one repetition of the motto, in user units (mockup: 420).
 * The natural length of «TODO PARA VER BIEN • » at 22px Unbounded 700 is ≈ 348,
 * so `lengthAdjust="spacing"` only widens the gaps; letters never overlap.
 */
export const RIBBON_REPEAT_LENGTH = 420;

/**
 * Repetitions: the text must cover the stroke plus one full travel
 * (REPEATS × REP ≥ L + REP), so the band never shows an empty stretch.
 */
export const RIBBON_REPEATS = 4;

/** Resting offset (static and reduced motion): half a repetition. */
export const RIBBON_REST_OFFSET = -RIBBON_REPEAT_LENGTH / 2;

type RibbonProps = {
  /** One repetition of the text that runs along the stroke (repeated RIBBON_REPEATS times). */
  text: string;
  className?: string;
  /** The <textPath>; sections animate its `startOffset` from −REP to 0. */
  textPathRef?: Ref<SVGTextPathElement>;
};

/**
 * Teal U-shaped ribbon with navy text riding on the stroke, as a continuous
 * band: each repetition has a fixed length (textLength), so the motion is the
 * same in every browser. Always decorative.
 */
export function Ribbon({ text, className, textPathRef }: RibbonProps) {
  const pathId = svgId(useId(), 'ribbon-path');

  return (
    <svg viewBox="0 0 340 420" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <path id={pathId} d={RIBBON_PATH} />
      </defs>
      <path d={RIBBON_PATH} fill="none" stroke={C.teal} strokeWidth="60" />
      <text
        fill={C.navy}
        dominantBaseline="central"
        className="font-display"
        style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}
      >
        <textPath
          ref={textPathRef}
          href={`#${pathId}`}
          startOffset={RIBBON_REST_OFFSET}
          textLength={RIBBON_REPEATS * RIBBON_REPEAT_LENGTH}
          lengthAdjust="spacing"
        >
          {text.repeat(RIBBON_REPEATS)}
        </textPath>
      </text>
    </svg>
  );
}
