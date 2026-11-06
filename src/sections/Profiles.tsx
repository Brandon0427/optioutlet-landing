import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { PatternFill } from '../components/brand/PatternFill';
import type { ShapeName } from '../components/brand/geometry';

const { profiles } = landing;

/** Decorative stroke per card, in content order (mockup `profiles[].shape/rot/color`). */
const CARD_SHAPES: ReadonlyArray<{ shape: ShapeName; rot: number; color: string }> = [
  { shape: 'dot', rot: 0, color: 'text-teal' },
  { shape: 'u', rot: -22, color: 'text-navy' },
  { shape: 'loop', rot: 18, color: 'text-teal' },
  { shape: 'u', rot: 160, color: 'text-teal' },
  { shape: 'dot', rot: 0, color: 'text-navy' },
];

/**
 * "Tu día dice mucho de tus lentes". Static version: cards in a wrapping grid.
 * Phase 5 turns the row into a scroll-driven horizontal carousel (≥ 768px)
 * and moves the oversized pattern for parallax.
 */
export function Profiles() {
  return (
    <section aria-labelledby="profiles-title" className="relative overflow-hidden bg-navy">
      <div className="relative box-border flex flex-col justify-center gap-11 px-gutter py-30">
        <PatternFill
          variant="dark"
          className="pointer-events-none absolute -top-[200px] left-0 h-[calc(100%+400px)] w-full"
          style={{ opacity: 0.28 }}
        />

        <div className="relative mx-auto box-border flex w-full max-w-[1200px] flex-wrap items-end justify-between gap-6">
          <h2
            id="profiles-title"
            className="m-0 max-w-[13em] font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-white"
          >
            {profiles.title}
          </h2>
          <p className="m-0 max-w-[26em] text-lg leading-[1.6] text-foam">{profiles.body}</p>
        </div>

        <div className="relative mx-auto box-border w-full max-w-[1200px]">
          <ul className="m-0 flex list-none flex-wrap gap-6 p-0">
            {profiles.items.map((p, i) => {
              const deco = CARD_SHAPES[i % CARD_SHAPES.length]!;
              return (
                <li
                  key={p.title}
                  className="relative box-border flex min-h-[380px] flex-[1_1_300px] flex-col gap-[18px] overflow-hidden rounded-[28px_96px_28px_28px] bg-white px-8 pt-[30px] pb-8"
                >
                  <BrandShape shape={deco.shape} className={`size-16 ${deco.color}`} style={{ transform: `rotate(${deco.rot}deg)` }} />
                  <h3 className="m-0 font-display text-[22px] leading-[1.2] font-semibold tracking-[-0.01em] text-navy">{p.title}</h3>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-teal-ink">{profiles.askLabel}</span>
                    <p className="m-0 text-[17px] leading-[1.5] font-medium text-navy">{p.question}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-teal-ink">{profiles.lookLabel}</span>
                    <p className="m-0 text-base leading-[1.55] text-ink-2">{p.answer}</p>
                  </div>
                  <span className="mt-auto self-start rounded-full bg-mist-2 px-3.5 py-2 text-sm font-semibold text-navy">{p.product}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
