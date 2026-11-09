import { useId } from 'react';
import { storeLink } from '../../config/store';
import { landing } from '../../content/landing';
import type { ResolvedRecommendation } from '../../consulta/recommend';
import { ActionLink } from '../ui/ActionLink';

const { result } = landing.consulta;

const priceFormat = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/**
 * Product card. Everything shown about the product comes from the catalog
 * (`product`); only the reason comes from the validated turn.
 */
export function ProductCard({ item }: { item: ResolvedRecommendation }) {
  const { product, recommendation } = item;
  const titleId = useId();
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
        <img src={product.imageUrl} alt="" width={104} height={104} loading="lazy" className="size-[104px] flex-[0_0_104px] rounded-[14px] object-cover" />
      ) : (
        <div className="flex size-[104px] flex-[0_0_104px] items-center justify-center rounded-[14px] bg-mist text-center text-xs leading-[1.3] text-ink-3">
          {result.photo}
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
          <span className="text-base font-bold text-navy">
            {product.priceMXN === null ? result.price : priceFormat.format(product.priceMXN)}
          </span>
          <ActionLink
            link={{
              label: result.storeCta,
              href: storeLink(product.storeUrl, recommendation.rank === 1 ? 'recomendacion-1' : 'recomendacion-2'),
              external: true,
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-teal px-5 text-[15px] font-bold text-navy no-underline transition-colors hover:bg-mint hover:text-navy"
          >
            {result.storeCta}
            <span className="sr-only">: {product.name}</span>
          </ActionLink>
        </div>
      </div>
    </article>
  );
}
