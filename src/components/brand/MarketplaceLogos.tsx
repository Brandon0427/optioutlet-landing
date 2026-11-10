// TODO(brand-logos): reemplazar el nombre de cada tienda por su logo oficial
// (Mercado Libre, de preferencia su sello de Tienda oficial; Amazon; Liverpool)
// cuando lleguen los archivos. No dibujar ni aproximar esos logos.

type MarketplaceLogosProps = {
  /** Store names, in display order. */
  stores: string[];
  /** Accessible name of the list. */
  label: string;
  className?: string;
};

/**
 * Stores where Optioutlet also sells. Until the official logo files arrive,
 * each slot shows the store's name as text in a quiet pill. Swapping in the
 * logos means replacing the content of each `li`, nothing else.
 */
export function MarketplaceLogos({ stores, label, className = '' }: MarketplaceLogosProps) {
  return (
    <ul aria-label={label} className={`m-0 flex list-none flex-wrap gap-2 p-0 ${className}`}>
      {stores.map((store) => (
        <li
          key={store}
          className="box-border inline-flex h-9 w-28 items-center justify-center rounded-[10px] border-[1.5px] border-solid border-white/55 text-[11px] font-semibold text-foam"
        >
          {store}
        </li>
      ))}
    </ul>
  );
}
