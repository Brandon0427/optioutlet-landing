import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Module scope runs once per page load, so plugins are registered exactly once.
gsap.registerPlugin(ScrollTrigger, useGSAP);

// iOS: the URL bar changes innerHeight while scrolling; don't refresh for that.
// Pinned stages use 100svh, so their size doesn't depend on it either.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Height of the fixed header, in px. Every ScrollTrigger pin starts below it. */
export const HEADER_OFFSET = 72;

/** Height of a pinned stage: the small viewport minus the header. */
export const STAGE_HEIGHT = `calc(100svh - ${HEADER_OFFSET}px)`;

/** gsap.matchMedia() conditions shared by every section. */
export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  wide: '(min-width: 768px)',
  finePointer: '(hover: hover) and (pointer: fine)',
} as const;

/** Default scrub smoothing for scroll-linked animation. */
export const SCRUB = 0.4;

// Dev-only handle for QA scripts (counting triggers, pin spacers).
if (import.meta.env.DEV) {
  (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };
