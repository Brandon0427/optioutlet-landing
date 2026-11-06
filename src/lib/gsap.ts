import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Module scope runs once per page load, so plugins are registered exactly once.
gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Height of the fixed header, in px. Every ScrollTrigger pin starts below it. */
export const HEADER_OFFSET = 72;

export { gsap, ScrollTrigger, useGSAP };
