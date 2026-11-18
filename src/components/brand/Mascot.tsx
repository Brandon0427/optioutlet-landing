import { landing } from '../../content/landing';
import { BRAND_COLORS as C } from '../../styles/brandColors';
import { OFFICIAL_OPTI as O } from './officialGeometry';

type MascotProps = {
  /** onLight: official colors (navy body, teal pupils). onNavy: teal body, navy pupils. */
  variant: 'onLight' | 'onNavy';
  /** Rendered width and height in px. */
  size: number;
  /** full: whole body. head: avatar crop without legs and feet (chat headers). */
  crop?: 'full' | 'head';
  /** Extra classes (e.g. a round background for avatars). */
  className?: string;
};

const PALETTE = {
  onLight: { body: C.navy, pupil: C.teal },
  onNavy: { body: C.teal, pupil: C.navy },
} as const;

/**
 * Where the drawn mascot (before Session 8) sat inside its square box: painted center and the share
 * of the box its LONGER side took. The official figure keeps that center and that longer side
 * (uniform scale), so every consumer keeps the mascot's visual size and position.
 * full: longer side = height (84.1 %). head: longer side = width (75.3 %).
 */
const FRAME = {
  full: { fx: 0.4927, fy: 0.4958, longer: 0.8415 },
  head: { fx: 0.492, fy: 0.392, longer: 0.7533 },
} as const;

const viewBoxFor = (crop: 'full' | 'head') => {
  const b = O.bounds[crop];
  const f = FRAME[crop];
  const side = Math.max(b.w, b.h) / f.longer;
  const r = (n: number) => Math.round(n * 100) / 100;
  return `${r(b.x + b.w / 2 - f.fx * side)} ${r(b.y + b.h / 2 - f.fy * side)} ${r(side)} ${r(side)}`;
};
const VIEWBOX = { full: viewBoxFor('full'), head: viewBoxFor('head') } as const;

/** Opti, the mascot (official docs/brand/svg/Opti.svg). Exposed to assistive tech as an image with a label. */
export function Mascot({ variant, size, crop = 'full', className }: MascotProps) {
  const { body, pupil } = PALETTE[variant];
  const full = crop === 'full';
  return (
    <svg
      viewBox={VIEWBOX[crop]}
      role="img"
      aria-label={landing.meta.mascotLabel}
      width={size}
      height={size}
      className={className}
    >
      {O.parts.map((p, i) => {
        switch (p.role) {
          case 'body':
            return <path key={i} d={p.d} fill={body} />;
          case 'pupil':
            return <path key={i} d={p.d} fill={pupil} />;
          case 'eye':
            return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={C.white} stroke={body} strokeWidth={O.strokeWidth} strokeMiterlimit={10} />;
          case 'leg':
            return full && <rect key={i} x={p.x} y={p.y} width={p.width} height={p.height} fill={body} />;
          case 'foot':
            return full && <path key={i} d={p.d} fill={C.white} stroke={body} strokeWidth={O.strokeWidth} strokeMiterlimit={10} />;
        }
      })}
    </svg>
  );
}
