import { useRef } from 'react';
import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { PatternFill } from '../components/brand/PatternFill';
import type { ShapeName } from '../components/brand/geometry';
import { HEADER_OFFSET, MEDIA, ORDER, SCRUB, STAGE_HEIGHT, STAGE_PAD, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { profiles } = landing;

/** Decorative stroke per card, in content order (mockup `profiles[].shape/rot/color`). */
const CARD_SHAPES: ReadonlyArray<{ shape: ShapeName; rot: number; color: string }> = [
  { shape: 'dot', rot: 0, color: 'text-teal' },
  { shape: 'u', rot: -22, color: 'text-navy' },
  { shape: 'loop', rot: 18, color: 'text-teal' },
  { shape: 'u', rot: 160, color: 'text-teal' },
  { shape: 'dot', rot: 0, color: 'text-navy' },
];

/** Extra pinned scroll after the row's travel (mockup: t3H = stage + overflow + 240). */
const EXTRA_TRAVEL = 240;
/** Pattern parallax travel, px (mockup: patY = −p3 · 180). */
const PATTERN_TRAVEL = 180;
/** Card width in the carousel, px. */
const CARD_W = 360;
/** Content never shrinks below this to fit a very short stage; never grows. */
const MIN_FIT = 0.6;

/**
 * "Tu día dice mucho de tus lentes".
 * Static (Phase 4 / reduced motion): cards in a wrapping grid.
 * ≥ 768px: pinned; vertical scroll drives the row horizontally. The first card
 * starts on the content's left edge, the last one ends on its right edge, and
 * cards slide out to the screen edges (not clipped at the 1200px column).
 * < 768px: stacked, no pin; the pattern keeps a vertical parallax.
 */
export function Profiles() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLUListElement>(null);
  const pattern = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MEDIA.motion, wide: MEDIA.wide }, (ctx) => {
        const { motion, wide } = ctx.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const section = root.current!;

        if (!wide) {
          // Mobile: no pin, pattern parallax while the section crosses the screen.
          gsap.fromTo(
            pattern.current,
            { y: 0 },
            {
              y: -PATTERN_TRAVEL,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: SCRUB, refreshPriority: ORDER.profiles },
            },
          );
          ScrollTrigger.sort();
          return;
        }

        const stageEl = stage.current!;
        const rowEl = row.current!;
        const cards = gsap.utils.toArray<HTMLLIElement>('li', rowEl);

        gsap.set(stageEl, { height: STAGE_HEIGHT, paddingTop: STAGE_PAD, paddingBottom: STAGE_PAD });
        gsap.set(rowEl, { flexWrap: 'nowrap' });
        gsap.set(cards, { flex: `0 0 ${CARD_W}px` });

        // Row travel: everything that doesn't fit in the content column.
        // Layout widths (unaffected by transforms) so the fit scale doesn't skew it.
        const overflow = () => Math.max(0, rowEl.scrollWidth - rowEl.clientWidth);

        const fit = () => {
          const el = block.current;
          if (!el) return;
          const avail = stageEl.clientHeight - STAGE_PAD * 2;
          gsap.set(el, { scale: gsap.utils.clamp(MIN_FIT, 1, avail / el.offsetHeight) });
        };
        ScrollTrigger.addEventListener('revert', fit);
        fit();

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: `top ${HEADER_OFFSET}px`,
            end: () => `+=${overflow() + EXTRA_TRAVEL}`,
            pin: true,
            scrub: SCRUB,
            invalidateOnRefresh: true,
            refreshPriority: ORDER.profiles,
          },
        });
        tl.fromTo(rowEl, { x: 0 }, { x: () => -overflow(), duration: 1 }, 0).fromTo(
          pattern.current,
          { y: 0 },
          { y: -PATTERN_TRAVEL, duration: 1 },
          0,
        );
        ScrollTrigger.sort();

        return () => ScrollTrigger.removeEventListener('revert', fit);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="profiles-title" className="relative overflow-hidden bg-navy">
      <div aria-hidden="true" className="stage-underlay" />
      <div ref={stage} className="relative box-border flex flex-col justify-center px-gutter py-30">
        <PatternFill
          ref={pattern}
          variant="dark"
          className="pointer-events-none absolute -top-[200px] left-0 h-[calc(100%+400px)] w-full"
          style={{ opacity: 0.28 }}
        />

        <div ref={block} className="relative flex flex-col gap-11">
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
            <ul ref={row} className="m-0 flex list-none flex-wrap gap-6 p-0">
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
      </div>
    </section>
  );
}
