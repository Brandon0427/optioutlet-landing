import { useRef } from 'react';
import { PatternFill } from '../brand/PatternFill';
import { PATTERN_PERIOD } from '../brand/geometry';
import { MEDIA, ORDER, SCRUB, ScrollTrigger, gsap, useGSAP } from '../../lib/gsap';

/** Parallax rate of the strip's pattern per px of page scroll (mockup: sy · 0.15). */
const STRIP_RATE = 0.15;

/**
 * Wraps any offset into (−PATTERN_PERIOD, 0]. The tile repeats every
 * PATTERN_PERIOD px (520 · 0.72 = 374.4), so jumping back by one period is
 * invisible: the parallax cycles forever without a seam.
 */
const cycle = (y: number) => -((((-y) % PATTERN_PERIOD) + PATTERN_PERIOD) % PATTERN_PERIOD);

/**
 * Light pattern strip before the footer. The inner pattern is 580px tall:
 * 180px visible + up to 374.4px of offset, so no gap ever shows.
 */
export function PatternStrip() {
  const root = useRef<HTMLDivElement>(null);
  const pattern = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        gsap.fromTo(
          pattern.current,
          { y: 0 },
          {
            y: () => -ScrollTrigger.maxScroll(window) * STRIP_RATE,
            ease: 'none',
            modifiers: { y: (y: string) => `${cycle(parseFloat(y)).toFixed(2)}px` },
            scrollTrigger: { start: 0, end: 'max', scrub: SCRUB, invalidateOnRefresh: true, refreshPriority: ORDER.page },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="relative h-[180px] overflow-hidden bg-white">
      <PatternFill ref={pattern} variant="light" className="pointer-events-none absolute top-0 left-0 h-[580px] w-full" />
    </div>
  );
}
