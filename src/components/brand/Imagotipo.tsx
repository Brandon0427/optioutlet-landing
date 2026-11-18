import { useId } from 'react';
import { landing } from '../../content/landing';
import { BRAND_COLORS as C } from '../../styles/brandColors';
import { svgId } from './geometry';
import { OFFICIAL_LOGO as L } from './officialGeometry';

type ImagotipoProps = {
  /**
   * onLight: official colors (navy + teal + the multiply shade on the "O" strike).
   * onNavy: white logo derived for dark backgrounds: every fill white, WITHOUT the multiply shade
   * (over a dark background it muddies the letter). Provisional until the designer approves it
   * (docs/brand/derivados/logo-blanco.svg).
   */
  variant: 'onLight' | 'onNavy';
  /** Width kept from the old isotipo + wordmark: md 163px (header), sm 148px (header < 420px, footer). */
  size?: 'md' | 'sm';
  className?: string;
};

const [, , VB_W = 1, VB_H = 1] = L.viewBox.split(' ').map(Number);
const WIDTH = { md: 163, sm: 148 } as const;

/** Official Optioutlet logo (docs/brand/svg/Logo.svg). Exposed as an image named after the brand. */
export function Imagotipo({ variant, size = 'md', className = '' }: ImagotipoProps) {
  const gradientId = svgId(useId(), 'logo-shade');
  const width = WIDTH[size];
  const height = Math.round((width * VB_H * 10) / VB_W) / 10;
  const light = variant === 'onLight';
  const fill = { navy: light ? C.navy : C.white, teal: light ? C.teal : C.white };
  const g = L.shadeGradient;

  return (
    <svg
      viewBox={L.viewBox}
      width={width}
      height={height}
      role="img"
      aria-label={landing.meta.brandName}
      className={`block shrink-0 ${className}`}
    >
      {light && (
        <defs>
          <linearGradient id={gradientId} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={g.from} />
            <stop offset="1" stopColor={g.to} />
          </linearGradient>
        </defs>
      )}
      <g style={{ isolation: 'isolate' }}>
        {L.paths.map((p, i) =>
          p.role === 'shade' ? (
            light && (
              <path key={i} d={p.d} fill={`url(#${gradientId})`} opacity={g.opacity} style={{ mixBlendMode: 'multiply' }} />
            )
          ) : (
            <path key={i} d={p.d} fill={fill[p.role]} />
          ),
        )}
      </g>
    </svg>
  );
}
