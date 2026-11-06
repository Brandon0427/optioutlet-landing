import { useRef } from 'react';
import { landing } from '../content/landing';
import { Ribbon, centerRibbonText, measureRibbon } from '../components/brand/Ribbon';
import { ActionLink, pill } from '../components/ui/ActionLink';
import { MEDIA, ORDER, SCRUB, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { storeCta } = landing;

/**
 * "¿Ya sabes cuáles quieres?" with the teal U ribbon. From 1024px the ribbon
 * sits to the right of the copy (as in the mockup); below it, it moves under
 * the buttons, smaller, so it never sits behind the text.
 *
 * Static: the whole text centered on the stroke.
 * Animated: while the section crosses the screen, startOffset goes linearly
 * from 0 to L − T (stroke length − text length), so the text never leaves the
 * stroke. L and T are measured on every refresh ('revert', after fonts).
 */
export function StoreCta() {
  const root = useRef<HTMLElement>(null);
  const textPath = useRef<SVGTextPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const tp = textPath.current!;
        tp.dataset.animated = 'true';
        let range = 0;
        const measure = () => {
          const { pathLength, textLength } = measureRibbon(tp);
          range = Math.max(0, pathLength - textLength);
        };
        ScrollTrigger.addEventListener('revert', measure);
        measure();

        gsap.fromTo(
          tp,
          { attr: { startOffset: 0 } },
          {
            attr: { startOffset: () => range },
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              // The section sits near the end of the page: clamp so the
              // full 0 → L − T travel completes at the max scroll.
              end: 'clamp(bottom top)',
              scrub: SCRUB,
              invalidateOnRefresh: true,
              refreshPriority: ORDER.store,
            },
          },
        );

        return () => {
          ScrollTrigger.removeEventListener('revert', measure);
          delete tp.dataset.animated;
          // After the context restores the attribute, go back to the static centered text.
          requestAnimationFrame(() => centerRibbonText(tp));
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="store-title" className="bg-store-cta relative overflow-hidden px-gutter py-30 max-lg:pb-[300px]">
      <Ribbon
        textPathRef={textPath}
        text={storeCta.ribbon}
        className="pointer-events-none absolute -rotate-[14deg] lg:top-1/2 lg:right-[clamp(-120px,-2vw,0px)] lg:-mt-[247px] lg:h-[494px] lg:w-[400px] max-lg:right-[-8px] max-lg:bottom-[-16px] max-lg:h-[320px] max-lg:w-[260px]"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-7 lg:pr-[clamp(0px,24vw,380px)]">
        <h2
          id="store-title"
          className="m-0 font-display text-[clamp(30px,3.6vw,52px)] leading-[1.1] font-semibold tracking-[-0.025em] text-white"
        >
          {storeCta.title}
        </h2>
        <p className="m-0 max-w-[28em] text-xl leading-[1.6] text-foam-2">{storeCta.body}</p>
        <div className="flex flex-wrap gap-4">
          <ActionLink link={storeCta.primaryCta} className={`${pill.base} ${pill.lg} bg-white text-navy hover:bg-mist hover:text-navy`} />
          <ActionLink
            link={storeCta.secondaryCta}
            className={`${pill.base} ${pill.lg} box-border border-2 border-white text-white hover:bg-white/10 hover:text-white`}
          />
        </div>
      </div>
    </section>
  );
}
