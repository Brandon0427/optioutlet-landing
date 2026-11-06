// TODO(brand-svg): reemplazar por el vector oficial de la mascota.
// Este archivo es una aproximación tomada del mockup. Al llegar el SVG oficial,
// se reemplaza el contenido de este archivo y nada más (misma firma de props).

import { landing } from '../../content/landing';
import { BRAND_COLORS as C } from '../../styles/brandColors';

type MascotProps = {
  /** onNavy: teal strokes, navy pupils. onLight: navy strokes, teal pupils. */
  variant: 'onLight' | 'onNavy';
  /** Rendered width and height in px. */
  size: number;
  /** full: whole body. head: avatar crop without body and legs (chat headers). */
  crop?: 'full' | 'head';
  /** Extra classes (e.g. a round background for avatars). */
  className?: string;
};

const PALETTE = {
  onNavy: { stroke: C.teal, pupil: C.navy },
  onLight: { stroke: C.navy, pupil: C.teal },
} as const;

/** Opti, the mascot. Exposed to assistive tech as an image with a label. */
export function Mascot({ variant, size, crop = 'full', className }: MascotProps) {
  const { stroke, pupil } = PALETTE[variant];
  const full = crop === 'full';
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={landing.meta.mascotLabel}
      width={size}
      height={size}
      className={className}
    >
      {/* arm + head + antenna */}
      <path d="M58 46 L30 56 C14 62 16 80 32 80 L46 76" fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 46 C44 30 48 14 60 14 C70 14 72 26 76 36 L84 56" fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
      <path d="M84 56 L100 28" fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round" />
      {/* body */}
      {full && <path d="M84 60 C92 72 86 86 72 86 L62 86 C52 86 48 80 46 74" fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round" />}
      {/* eyes */}
      <circle cx="48" cy="58" r="15" fill={C.white} stroke={stroke} strokeWidth="4" />
      <circle cx="76" cy="58" r="15" fill={C.white} stroke={stroke} strokeWidth="4" />
      <circle cx="50" cy="59" r="7" fill={pupil} />
      <circle cx="78" cy="59" r="7" fill={pupil} />
      <circle cx="53" cy="56" r="2.6" fill={C.white} />
      <circle cx="81" cy="56" r="2.6" fill={C.white} />
      {/* legs + feet */}
      {full && (
        <>
          <path d="M56 90 L56 106" fill="none" stroke={stroke} strokeWidth="6" />
          <path d="M70 90 L70 106" fill="none" stroke={stroke} strokeWidth="6" />
          <path d="M47 110 A8 8 0 0 1 61 110 Z" fill={stroke} />
          <path d="M65 110 A8 8 0 0 1 79 110 Z" fill={stroke} />
        </>
      )}
    </svg>
  );
}
