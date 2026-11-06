import { useId } from 'react';
import { ISOTIPO_SHAPE as S, svgId } from './geometry';

type IsotipoProps = {
  /** Tailwind classes for size and color (fill follows `currentColor`). Defaults to teal. */
  className?: string;
};

/** Brand isotipo: a teal circle with a bite that breaks its top-right edge. Always decorative. */
export function Isotipo({ className = 'size-8 text-teal' }: IsotipoProps) {
  const maskId = svgId(useId(), 'isotipo-bite');
  return (
    <svg viewBox={S.viewBox} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="#ffffff" />
          <circle cx={S.bite.cx} cy={S.bite.cy} r={S.bite.r} fill="#000000" />
        </mask>
      </defs>
      <circle cx={S.cx} cy={S.cy} r={S.r} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
