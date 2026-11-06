import { ISOTIPO_SHAPE as S } from './geometry';

type IsotipoProps = {
  /** Tailwind classes for size and color (fill follows `currentColor`). Defaults to teal. */
  className?: string;
};

/** Brand isotipo: a teal circle with a bite that breaks its top-right edge. Always decorative. */
export function Isotipo({ className = 'size-8 text-teal' }: IsotipoProps) {
  return (
    <svg viewBox={S.viewBox} aria-hidden="true" focusable="false" className={className}>
      <path d={S.d} fill="currentColor" />
    </svg>
  );
}
