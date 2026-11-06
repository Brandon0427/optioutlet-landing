import type { CSSProperties, Ref } from 'react';
import { DOT_SHAPE, DOT_TIGHT_VIEWBOX, LOOP_SHAPE, SHAPE_VIEWBOX, U_SHAPE, type ShapeName } from './geometry';

export type BrandShapeProps = {
  shape: ShapeName;
  /** Size, color (via `currentColor`) and positioning. */
  className?: string;
  style?: CSSProperties;
  /**
   * pattern: the mockup's shared frame (-60 -60 120 140), same as inside the patterns.
   * tight: cropped close to the dot, for inline use such as list bullets. Dot only.
   */
  framing?: 'pattern' | 'tight';
  ref?: Ref<SVGSVGElement>;
  title?: never; // always decorative
};

/** One of the three pattern strokes: U, loop (9-like) or dot with a bite. Always decorative. */
export function BrandShape({ shape, className, style, framing = 'pattern', ref }: BrandShapeProps) {
  const viewBox = framing === 'tight' && shape === 'dot' ? DOT_TIGHT_VIEWBOX : SHAPE_VIEWBOX;
  return (
    <svg ref={ref} viewBox={viewBox} aria-hidden="true" focusable="false" className={className} style={style}>
      <ShapeGeometry shape={shape} />
    </svg>
  );
}

/** Raw geometry of a shape, colored with `currentColor`. Shared with PatternDefs. */
export function ShapeGeometry({ shape }: { shape: ShapeName }) {
  switch (shape) {
    case 'u':
      return <path d={U_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={U_SHAPE.strokeWidth} />;
    case 'loop':
      return <path d={LOOP_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={LOOP_SHAPE.strokeWidth} />;
    case 'dot':
      return <path d={DOT_SHAPE.d} fill="currentColor" />;
  }
}
