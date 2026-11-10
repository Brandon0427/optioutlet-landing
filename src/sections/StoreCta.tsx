import { useRef } from 'react';
import { landing } from '../content/landing';
import { RIBBON_REPEAT_LENGTH, Ribbon } from '../components/brand/Ribbon';
import { ActionLink, pill } from '../components/ui/ActionLink';
import { MEDIA, ORDER, SCRUB, gsap, useGSAP } from '../lib/gsap';

const { storeCta } = landing;

/**
 * "¿Ya sabes cuáles quieres?" with the teal U ribbon. From 1024px the ribbon
 * sits to the right of the copy (as in the mockup); below it, it moves under
 * the buttons, smaller, so it never sits behind the text.
 *
 * The ribbon is a continuous band (see Ribbon). Static / reduced motion: the
 * offset rests at −REP / 2. Animated: its progress belongs to this section
 * only — 0 when the section peeks in at the bottom, 1 when it leaves at the
 * top (or at the max scroll, if that comes first) — and startOffset goes
 * linearly from −REP to 0: exactly one repetition, so both ends look alike.
 * The tween starts from the numeric attribute Ribbon renders, so reverting it
 * on refresh restores a valid length (Session 7: B1).
 */
export function StoreCta() {
  const root = useRef<HTMLElement>(null);
  const textPath = useRef<SVGTextPathElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        gsap.fromTo(
          textPath.current,
          { attr: { startOffset: -RIBBON_REPEAT_LENGTH } },
          {
            attr: { startOffset: 0 },
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              // The section sits near the end of the page: clamp so the
              // full −REP → 0 travel completes at the max scroll.
              end: 'clamp(bottom top)',
              scrub: SCRUB,
              refreshPriority: ORDER.store,
            },
          },
        );
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
