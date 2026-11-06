import type { CSSProperties, Ref } from 'react';
import { PATTERN_IDS, type PatternVariant } from './geometry';

type PatternFillProps = {
  variant: PatternVariant;
  /** Defaults to covering the positioned parent. Override to oversize it for parallax. */
  className?: string;
  style?: CSSProperties;
  /** The element sections animate (opacity, translate). */
  ref?: Ref<SVGSVGElement>;
};

/** Fills its (positioned) container with a brand pattern. Requires <PatternDefs /> mounted once. */
export function PatternFill({
  variant,
  className = 'pointer-events-none absolute inset-0 size-full',
  style,
  ref,
}: PatternFillProps) {
  return (
    <svg ref={ref} aria-hidden="true" focusable="false" className={className} style={style}>
      <rect width="100%" height="100%" fill={`url(#${PATTERN_IDS[variant]})`} />
    </svg>
  );
}
