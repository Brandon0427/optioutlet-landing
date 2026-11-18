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

/** One of the three official pattern pieces: U, loop (9-like) or dot with a bite. Always decorative. */
export function BrandShape({ shape, className, style, framing = 'pattern', ref }: BrandShapeProps) {
  const viewBox = framing === 'tight' && shape === 'dot' ? DOT_TIGHT_VIEWBOX : SHAPE_VIEWBOX;
  return (
    <svg ref={ref} viewBox={viewBox} aria-hidden="true" focusable="false" className={className} style={style}>
      <ShapeGeometry shape={shape} />
    </svg>
  );
}

const SHAPES = { u: U_SHAPE, loop: LOOP_SHAPE, dot: DOT_SHAPE } as const;

/** Raw geometry of a piece, filled with `currentColor`. Shared with PatternDefs. */
export function ShapeGeometry({ shape }: { shape: ShapeName }) {
  const s = SHAPES[shape];
  return <path d={s.d} transform={s.transform} fill="currentColor" />;
}
