import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Isotipo } from '../components/brand/Isotipo';
import { Seal } from '../components/brand/Seal';
import type { ShapeName } from '../components/brand/geometry';
import { ActionLink, pill } from '../components/ui/ActionLink';

const { hero } = landing;

/**
 * Floating pattern strokes (mockup `floatDefs`). `k` is each one's parallax
 * travel in px, used in Phase 5; static rotation is `rot`. `wideOnly` strokes
 * are hidden below 1024px, where they would land on the headline or the seal.
 */
export const HERO_FLOATS: ReadonlyArray<{
  shape: ShapeName;
  left: string;
  top: string;
  size: number;
  color: string;
  opacity: number;
  rot: number;
  k: number;
  wideOnly?: boolean;
}> = [
  { shape: 'u', left: '3%', top: '6%', size: 84, color: 'text-teal', opacity: 0.9, rot: -18, k: 160, wideOnly: true },
  { shape: 'dot', left: '45%', top: '7%', size: 44, color: 'text-white', opacity: 0.9, rot: 0, k: 260, wideOnly: true },
  { shape: 'loop', left: '47%', top: '82%', size: 104, color: 'text-mint', opacity: 0.75, rot: 32, k: 120, wideOnly: true },
  { shape: 'u', left: '91%', top: '4%', size: 78, color: 'text-white', opacity: 0.85, rot: 160, k: 220 },
  { shape: 'dot', left: '93%', top: '74%', size: 58, color: 'text-navy', opacity: 1, rot: 0, k: 300 },
  { shape: 'dot', left: '1%', top: '86%', size: 40, color: 'text-mint', opacity: 0.9, rot: 0, k: 200 },
];

export function Hero() {
  return (
    <section id="inicio" className="bg-hero relative overflow-hidden px-gutter pt-24 pb-32">
      {HERO_FLOATS.map((f, i) => (
        <BrandShape
          key={i}
          shape={f.shape}
          className={`pointer-events-none absolute ${f.color} ${f.wideOnly ? 'max-lg:hidden' : ''}`}
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            transform: `rotate(${f.rot}deg)`,
          }}
        />
      ))}

      <div className="relative z-[2] mx-auto flex max-w-[1200px] flex-wrap items-center gap-14">
        <div className="flex max-w-[600px] flex-[1_1_460px] flex-col gap-[30px]">
          <h1 className="m-0 font-display text-[clamp(40px,5.2vw,72px)] leading-[1.04] font-semibold tracking-[-0.03em] text-white">
            {hero.title}
          </h1>
          <p className="m-0 max-w-[30em] text-xl leading-[1.6] text-foam-2">{hero.body}</p>
          <div className="flex flex-wrap items-center gap-[22px]">
            <ActionLink link={hero.primaryCta} className={`${pill.base} ${pill.lg} bg-white text-navy hover:bg-mist hover:text-navy`} />
            <ActionLink
              link={hero.secondaryCta}
              className="inline-flex min-h-11 items-center text-[17px] font-semibold text-white underline underline-offset-[5px] hover:text-white"
            />
          </div>
        </div>

        <div className="flex flex-[1_1_380px] justify-center">
          <div className="relative aspect-square w-full max-w-[540px]">
            <Seal text={hero.seal} color="white" className="absolute inset-0 size-full" />
            <div className="absolute inset-[11%] box-border flex items-center justify-center rounded-full border-2 border-mint bg-mist">
              <Isotipo className="size-[58%] text-teal" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
