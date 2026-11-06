import { landing } from '../../content/landing';
import { Imagotipo } from '../brand/Imagotipo';
import { ActionLink, pill } from '../ui/ActionLink';

const { header } = landing;

/** Sticky, opaque white header, 72px tall. Nav links hide below 760px; the CTA always stays. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 box-border h-18 border-b border-line bg-white px-gutter">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 min-[420px]:gap-6">
        <a href="#inicio" aria-label={header.homeLabel} className="flex shrink-0 items-center no-underline">
          {/* Slightly smaller below 420px so logo + CTA fit at 375px. */}
          <Imagotipo variant="onLight" size="sm" className="min-[420px]:hidden" />
          <Imagotipo variant="onLight" size="md" className="max-[419px]:hidden" />
        </a>
        <nav aria-label={header.navLabel} className="flex items-center gap-7">
          {header.links.map((link) => (
            <ActionLink
              key={link.href}
              link={link}
              className="hidden text-base font-medium text-navy no-underline hover:underline min-[760px]:inline"
            />
          ))}
          <ActionLink
            link={header.cta}
            className={`${pill.base} ${pill.sm} bg-navy whitespace-nowrap text-white hover:bg-navy-hover hover:text-white max-[419px]:px-4 max-[419px]:text-sm`}
          />
        </nav>
      </div>
    </header>
  );
}
