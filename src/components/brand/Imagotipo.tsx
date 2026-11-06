// TODO(brand-svg): reemplazar por el vector oficial del imagotipo.
// Este archivo es una aproximación tomada del mockup (isotipo + palabra en Unbounded).
// Al llegar el SVG oficial, se reemplaza el contenido de este archivo y nada más.

import { landing } from '../../content/landing';
import { Isotipo } from './Isotipo';

type ImagotipoProps = {
  /** onLight: navy wordmark (header). onNavy: white wordmark (footer). */
  variant: 'onLight' | 'onNavy';
  /** md: header (30px mark, 20px word). sm: footer (28px mark, 18px word). */
  size?: 'md' | 'sm';
  className?: string;
};

const SIZES = {
  md: { mark: 'size-7.5', word: 'text-[20px]' },
  sm: { mark: 'size-7', word: 'text-[18px]' },
} as const;

/** Isotipo + "optioutlet" wordmark. Wrap it in a link with an aria-label when it navigates. */
export function Imagotipo({ variant, size = 'md', className = '' }: ImagotipoProps) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Isotipo className={`${s.mark} shrink-0 text-teal`} />
      <span
        className={`font-display font-semibold tracking-[-0.01em] ${s.word} ${variant === 'onLight' ? 'text-navy' : 'text-white'}`}
      >
        {landing.meta.wordmark}
      </span>
    </span>
  );
}
