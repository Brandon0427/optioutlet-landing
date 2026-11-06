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

/** Vertical padding of every pinned stage, px. */
export const STAGE_PAD = 32;

/**
 * refreshPriority per section, in page order (higher refreshes first).
 * Pins push everything below them down, so triggers must be calculated top to
 * bottom even when one is re-created later (e.g. Profiles crossing 768px).
 * Page-wide triggers (end: 'max') depend on the final page height: last.
 * After creating triggers, call ScrollTrigger.sort() so the order applies.
 */
export const ORDER = {
  hero: 100,
  reveal: 90,
  como: 80,
  profiles: 70,
  consulta: 60,
  receta: 50,
  store: 40,
  strip: 30,
  page: -100,
} as const;

// Dev-only handle for QA scripts (counting triggers, pin spacers).
if (import.meta.env.DEV) {
  (window as unknown as { __ST?: typeof ScrollTrigger }).__ST = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };
