import { useId, type CSSProperties, type Ref } from 'react';
import { DOT_SHAPE, LOOP_SHAPE, SHAPE_VIEWBOX, U_SHAPE, svgId, type ShapeName } from './geometry';

export type BrandShapeProps = {
  shape: ShapeName;
  /** Size, color (via `currentColor`) and positioning. */
  className?: string;
  style?: CSSProperties;
  ref?: Ref<SVGSVGElement>;
  title?: never; // always decorative
};

/** One of the three pattern strokes: U, loop (9-like) or dot with a bite. Always decorative. */
export function BrandShape({ shape, className, style, ref }: BrandShapeProps) {
  const maskId = svgId(useId(), 'dot-bite');
  return (
    <svg
      ref={ref}
      viewBox={SHAPE_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      {shape === 'u' && <path d={U_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={U_SHAPE.strokeWidth} />}
      {shape === 'loop' && (
        <path d={LOOP_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={LOOP_SHAPE.strokeWidth} />
      )}
      {shape === 'dot' && (
        <>
          <defs>
            <DotBiteMask id={maskId} />
          </defs>
          <circle r={DOT_SHAPE.r} fill="currentColor" mask={`url(#${maskId})`} />
        </>
      )}
    </svg>
  );
}

/** Mask that cuts the dot's bite. Shared with PatternDefs. Coordinates are the dot's own (origin-centered). */
export function DotBiteMask({ id }: { id: string }) {
  const pad = DOT_SHAPE.r + 4;
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x={-pad} y={-pad} width={pad * 2} height={pad * 2}>
      <rect x={-pad} y={-pad} width={pad * 2} height={pad * 2} fill="#ffffff" />
      <circle cx={DOT_SHAPE.bite.cx} cy={DOT_SHAPE.bite.cy} r={DOT_SHAPE.bite.r} fill="#000000" />
    </mask>
  );
}
