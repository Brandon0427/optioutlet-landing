import { useId, type Ref } from 'react';
import { svgId } from './geometry';

/** The U ribbon's centerline (viewBox 0 0 340 420). Length ≈ 240 + π·110 + 240 ≈ 826. */
export const RIBBON_PATH = 'M60 10 V250 A110 110 0 0 0 280 250 V10';

type RibbonProps = {
  /** Text that runs along the stroke. */
  text: string;
  /** Initial `startOffset` (user units along the path). Static value from the mockup: 40. */
  startOffset?: number;
  className?: string;
  /** The <textPath>; sections animate its `startOffset`. */
  textPathRef?: Ref<SVGTextPathElement>;
};

/** Teal U-shaped ribbon with navy text riding on the stroke. Always decorative. */
export function Ribbon({ text, startOffset = 40, className, textPathRef }: RibbonProps) {
  const pathId = svgId(useId(), 'ribbon-path');
  return (
    <svg viewBox="0 0 340 420" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <path id={pathId} d={RIBBON_PATH} />
      </defs>
      <path d={RIBBON_PATH} fill="none" stroke="var(--color-teal)" strokeWidth="60" />
      <text
        fill="var(--color-navy)"
        dominantBaseline="central"
        className="font-display"
        style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}
      >
        <textPath ref={textPathRef} href={`#${pathId}`} startOffset={startOffset}>
          {text}
        </textPath>
      </text>
    </svg>
  );
}
