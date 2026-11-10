import amazon from '../../assets/brand/marketplaces/amazon.svg?no-inline';
import liverpool from '../../assets/brand/marketplaces/liverpool.svg?no-inline';
import mercadoLibre from '../../assets/brand/marketplaces/mercadolibre.svg?no-inline';

/**
 * Official logo per store name (as written in landing.ts). `width`/`height`
 * are the final rendered size, in the file's real proportion, so the row
 * reserves its space before the images load (CLS 0). `maxH` is the cap the
 * logo is drawn at; Amazon and Liverpool hit the pill's 84px content width
 * first and scale down from it without distortion.
 *
 * Files: src/assets/brand/marketplaces/ (official, used as delivered). `?no-inline`
 * keeps each one a hashed file even under Vite's 4 KB inline limit (amazon.svg).
 */
const LOGOS: Record<string, { src: string; width: number; height: number; maxH: number }> = {
  'Mercado Libre': { src: mercadoLibre, width: 35, height: 32, maxH: 32 }, // 150.1 × 135.8
  Amazon: { src: amazon, width: 84, height: 25, maxH: 26 }, // 2500 × 752
  Liverpool: { src: liverpool, width: 84, height: 22, maxH: 24 }, // 184 × 49
};

type MarketplaceLogosProps = {
  /** Store names, in display order (landing.hero.marketplaces.stores). Each one is its logo's alt. */
  stores: string[];
  /** Accessible name of the list. */
  label: string;
  className?: string;
};

/** Stores where Optioutlet also sells: each official logo on a white pill. Not links. */
export function MarketplaceLogos({ stores, label, className = '' }: MarketplaceLogosProps) {
  return (
    <ul aria-label={label} className={`m-0 flex list-none flex-wrap gap-2 p-0 ${className}`}>
      {stores.map((store) => {
        const logo = LOGOS[store];
        return (
          <li
            key={store}
            className="box-border inline-flex h-11 w-28 items-center justify-center rounded-[10px] bg-white px-3.5"
          >
            {logo && (
              <img
                src={logo.src}
                alt={store}
                width={logo.width}
                height={logo.height}
                decoding="async"
                className="block h-auto max-w-full"
                style={{ maxHeight: logo.maxH }}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
