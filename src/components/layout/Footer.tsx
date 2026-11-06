import { landing } from '../../content/landing';
import { Imagotipo } from '../brand/Imagotipo';
import { ActionLink } from '../ui/ActionLink';

const { footer } = landing;

export function Footer() {
  return (
    <footer className="bg-navy px-gutter py-12">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
        <Imagotipo variant="onNavy" size="sm" />
        <nav aria-label={footer.navLabel} className="flex flex-wrap gap-x-6 gap-y-2">
          {footer.links.map((link) => (
            <ActionLink
              key={link.label}
              link={link}
              className="inline-flex min-h-11 items-center text-[15px] text-foam underline-offset-4 hover:text-white"
            />
          ))}
        </nav>
        <span className="text-sm text-foam">{footer.copyright}</span>
      </div>
    </footer>
  );
}
