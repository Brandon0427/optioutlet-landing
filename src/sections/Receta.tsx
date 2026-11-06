import { useRef } from 'react';
import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Mascot } from '../components/brand/Mascot';
import { Seal } from '../components/brand/Seal';
import { MEDIA, ORDER, SCRUB, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { receta } = landing;

/** Seal rotation per px of page scroll, degrees (mockup: −sy · 0.08). */
const SEAL_RATE = -0.08;

/** "Opti te orienta. Tu especialista te receta." The seal spins counter-clockwise with scroll. */
export function Receta() {
  const root = useRef<HTMLElement>(null);
  const seal = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        gsap.fromTo(
          seal.current,
          { rotation: 0 },
          {
            rotation: () => ScrollTrigger.maxScroll(window) * SEAL_RATE,
            ease: 'none',
            transformOrigin: '50% 50%',
            scrollTrigger: { start: 0, end: 'max', scrub: SCRUB, invalidateOnRefresh: true, refreshPriority: ORDER.page },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="receta-title" className="overflow-hidden bg-white px-gutter py-32">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-18">
        <div className="mx-auto flex flex-[0_1_380px] justify-center">
          <div className="relative aspect-square w-full max-w-[380px]">
            <Seal ref={seal} text={receta.seal} color="white" background="navy" className="absolute inset-0 size-full" />
            <div className="absolute inset-[15%] flex items-center justify-center rounded-full bg-mint">
              <Mascot variant="onLight" size={220} className="size-[82%]" />
            </div>
          </div>
        </div>

        <div className="flex flex-[1_1_480px] flex-col gap-8">
          <h2
            id="receta-title"
            className="m-0 font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-navy"
          >
            {receta.title}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-[22px] p-0">
            {receta.points.map((point) => (
              <li key={point} className="flex items-start gap-4">
                <BrandShape shape="dot" framing="tight" className="mt-px size-[26px] flex-[0_0_26px] text-teal" />
                <p className="m-0 max-w-[34em] text-lg leading-[1.6] text-ink-2">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
