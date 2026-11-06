import { useRef } from 'react';
import { landing } from '../content/landing';
import { Mascot } from '../components/brand/Mascot';
import { PatternFill } from '../components/brand/PatternFill';
import { HEADER_OFFSET, MEDIA, SCRUB, STAGE_HEIGHT, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { reveal } = landing;

/** Scroll distance (px) the reveal stays pinned (mockup: t1H = stage + 1200). */
const REVEAL_TRAVEL = 1200;
/** Size (px) of the navy pupil at the start of the reveal. */
const PUPIL_START = 160;
/** Vertical padding of the pinned stage, px. */
const STAGE_PAD = 32;
/** Content never shrinks below this to fit a very short stage; never grows. */
const MIN_FIT = 0.6;

/**
 * "Antes de recomendarte algo…".
 * Static (Phase 4 / reduced motion): navy stage, dark pattern at 0.18, Opti visible.
 * Animated: pinned below the header for 1200px of scroll. The navy pupil grows
 * until it covers the stage, its bite fades, the pattern appears and Opti
 * scales in (0.55 → 1), with the mockup's ranges and curves.
 */
export function PupilReveal() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLDivElement>(null);
  const bite = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const mascot = useRef<HTMLDivElement>(null);
  const pattern = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const section = root.current!;
        const stageEl = stage.current!;

        // Animated layout (reverted with the context → back to the static version).
        gsap.set(section, { backgroundColor: 'var(--color-mist)' });
        gsap.set(stageEl, { height: STAGE_HEIGHT, minHeight: 0, paddingTop: STAGE_PAD, paddingBottom: STAGE_PAD });
        gsap.set(pupil.current, { opacity: 1, margin: 0, xPercent: -50, yPercent: -50 });
        gsap.set(caption.current, { opacity: 1 });

        // The pupil is drawn at its final (cover) size and scaled up from 160px,
        // so it is rasterized at full size and stays sharp. Same curve as the
        // mockup: radius = 80 · (1 + ease(p) · (scaleMax − 1)).
        const cover = () => Math.hypot(window.innerWidth, stageEl.clientHeight) * 1.08;
        const startScale = () => Math.min(1, PUPIL_START / cover());

        // Fit: scale the content block down (never up) when the stage is too short.
        const fit = () => {
          const el = content.current;
          if (!el) return;
          const avail = stageEl.clientHeight - STAGE_PAD * 2;
          const s = gsap.utils.clamp(MIN_FIT, 1, avail / el.offsetHeight);
          gsap.set(el, { scale: s });
        };
        ScrollTrigger.addEventListener('refreshInit', fit);
        fit();

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: `top ${HEADER_OFFSET}px`,
            end: `+=${REVEAL_TRAVEL}`,
            pin: true,
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          pupil.current,
          { width: cover, height: cover, scale: startScale },
          { width: cover, height: cover, scale: 1, ease: 'power1.inOut', duration: 1 },
          0,
        )
          .fromTo(caption.current, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0)
          .fromTo(bite.current, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.35)
          .fromTo(content.current, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.62)
          .fromTo(mascot.current, { scale: 0.55 }, { scale: 1, duration: 0.25, ease: 'power1.inOut' }, 0.62)
          .fromTo(pattern.current, { opacity: 0 }, { opacity: 0.18, duration: 0.25 }, 0.62)
          .set(section, { backgroundColor: 'var(--color-navy)' }, 0.985);

        return () => ScrollTrigger.removeEventListener('refreshInit', fit);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="reveal-title" className="relative bg-navy">
      {/* iOS: fills the strip below the pinned stage when the URL bar hides. */}
      <div aria-hidden="true" className="stage-underlay" />

      <div ref={stage} className="relative box-border flex min-h-[680px] items-center justify-center overflow-hidden px-gutter py-24">
        {/* Pupil (navy disc + bite). Hidden in the static version. */}
        <div ref={pupil} aria-hidden="true" className="absolute top-1/2 left-1/2 -mt-20 -ml-20 size-40 opacity-0 will-change-transform">
          <div className="absolute inset-0 rounded-full bg-navy" />
          <div ref={bite} className="absolute top-[3.75%] right-[13.75%] size-[37.5%] rounded-full bg-mist opacity-0" />
        </div>

        <PatternFill ref={pattern} variant="dark" style={{ opacity: 0.18 }} />

        <p
          ref={caption}
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(50%+112px)] m-0 text-center text-[17px] font-semibold text-navy opacity-0"
        >
          {reveal.caption}
        </p>

        <div ref={content} className="relative z-[2] flex max-w-[880px] flex-col items-center gap-[26px] text-center">
          <div ref={mascot} className="flex size-[168px] items-center justify-center rounded-full bg-navy">
            <Mascot variant="onNavy" size={150} />
          </div>
          <h2
            id="reveal-title"
            className="m-0 font-display text-[clamp(32px,4.2vw,58px)] leading-[1.1] font-semibold tracking-[-0.025em] text-white"
          >
            {reveal.title}
          </h2>
          <p className="m-0 mx-auto max-w-[32em] text-xl leading-[1.6] text-foam">{reveal.body}</p>
        </div>
      </div>
    </section>
  );
}
