import type { ReactNode } from 'react';
import { landing, type Link } from '../../content/landing';

type ActionLinkProps = {
  link: Link;
  className?: string;
  children?: ReactNode;
};

/**
 * Real <a> for every CTA and nav link. External links open in a new tab,
 * with `rel="noopener noreferrer"` and a screen-reader hint.
 */
export function ActionLink({ link, className, children }: ActionLinkProps) {
  const external = link.external === true;
  return (
    <a
      href={link.href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children ?? link.label}
      {external && <span className="sr-only"> {landing.meta.newTabHint}</span>}
    </a>
  );
}

/** Shared pill styles for CTAs. */
export const pill = {
  base: 'inline-flex items-center justify-center rounded-full font-bold no-underline transition-colors',
  lg: 'min-h-[58px] px-8 text-lg',
  sm: 'min-h-11 px-5 text-[15px] font-semibold',
} as const;
