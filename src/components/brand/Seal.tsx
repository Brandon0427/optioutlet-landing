import { useId, type Ref } from 'react';
import { BRAND_COLORS, type BrandColor } from '../../styles/brandColors';
import { svgId } from './geometry';

type SealProps = {
  /** Text that runs around the circle. Repeat it in the content so it closes the loop. */
  text: string;
  /** Text color (brand token name). */
  color: BrandColor;
  /** Optional filled disc behind the text (receta seal). Without it the ring is bare (hero seal). */
  background?: BrandColor;
  className?: string;
  /** The rotating element. Sections animate its rotation; the component never does. */
  ref?: Ref<SVGSVGElement>;
};

/**
 * Circular text seal. Geometry from the mockup (viewBox 200):
 * - bare (hero): text on r91, 8.5px, weight 500, textLength 566.
 * - with background (receta): disc r99, text on r86, 10px, weight 600, textLength 535.
 */
export function Seal({ text, color, background, className = 'size-full', ref }: SealProps) {
  const pathId = svgId(useId(), 'seal-path');
  const g = background
    ? { r: 86, fontSize: 10, fontWeight: 600, textLength: 535 }
    : { r: 91, fontSize: 8.5, fontWeight: 500, textLength: 566 };

  return (
    <svg ref={ref} viewBox="0 0 200 200" aria-hidden="true" focusable="false" className={className}>
      {background && <circle cx="100" cy="100" r="99" fill={BRAND_COLORS[background]} />}
      <defs>
        <path id={pathId} d={`M100 100 m-${g.r} 0 a${g.r} ${g.r} 0 1 1 ${g.r * 2} 0 a${g.r} ${g.r} 0 1 1 -${g.r * 2} 0`} />
      </defs>
      <text
        fill={BRAND_COLORS[color]}
        className="font-display"
        style={{ fontSize: g.fontSize, fontWeight: g.fontWeight, letterSpacing: 1 }}
      >
        <textPath href={`#${pathId}`} textLength={g.textLength} lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
