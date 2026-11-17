import { useId } from 'react';
import { productLink } from '../../config/store';
import { landing } from '../../content/landing';
import type { ResolvedRecommendation } from '../../consulta/recommend';
import { Isotipo } from '../brand/Isotipo';
import { ActionLink } from '../ui/ActionLink';

const { result } = landing.consulta;

const wholeFormat = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const centsFormat = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** MXN, with cents only when the price has them ($1,069 · $1,446.11). */
export const formatPrice = (mxn: number) => (Number.isInteger(mxn) ? wholeFormat : centsFormat).format(mxn);

/**
 * Product card. Everything shown about the product comes from the catalog
 * (`product`); only the reason comes from the validated turn.
 */
export function ProductCard({ item }: { item: ResolvedRecommendation }) {
  const { product, recommendation } = item;
  const titleId = useId();
  const link = productLink(product.storeUrl, recommendation.rank === 1 ? 'recomendacion-1' : 'recomendacion-2');
  const cta = link.destination === 'marketplace' ? result.marketplaceCta : result.storeCta;
  const tags = [
    result.tags.replacement[product.replacement],
    result.tags.material[product.material],
    result.tags.design[product.design],
  ];

  return (
    <article
      aria-labelledby={titleId}
      className="flex shrink-0 flex-wrap gap-4 rounded-[20px_48px_20px_20px] border border-line-2 bg-white p-4"
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" width={104} height={104} loading="lazy" className="size-[104px] flex-[0_0_104px] rounded-[14px] object-contain" />
      ) : (
        <div aria-hidden="true" className="bg-phone-disc flex size-[104px] flex-[0_0_104px] items-center justify-center rounded-[14px]">
          <Isotipo className="size-12 text-white/90" />
        </div>
      )}

      <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
        <span className="text-sm font-bold text-teal-ink">{recommendation.rank === 1 ? result.firstLabel : result.secondLabel}</span>
        <h3 id={titleId} className="m-0 font-sans text-lg font-bold text-navy">
          {product.name}
        </h3>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-mist-2 px-2.5 py-1 text-[13px] font-semibold text-navy">
              {tag}
            </li>
          ))}
        </ul>
        <p className="m-0 text-[15px] leading-[1.5] text-ink-2">{recommendation.reason}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          {product.priceMXN !== null && <span className="text-base font-bold text-navy">{formatPrice(product.priceMXN)}</span>}
          <ActionLink
            link={{ label: cta, href: link.href, external: true }}
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-teal px-5 text-[15px] font-bold text-navy no-underline transition-colors hover:bg-mint hover:text-navy"
          >
            {cta}
            <span className="sr-only">: {product.name}</span>
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
