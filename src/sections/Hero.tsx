import { useRef } from 'react';
import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Isotipo } from '../components/brand/Isotipo';
import { MarketplaceLogos } from '../components/brand/MarketplaceLogos';
import { Seal } from '../components/brand/Seal';
import type { ShapeName } from '../components/brand/geometry';
import { ActionLink, pill } from '../components/ui/ActionLink';
import { BRAND_COLORS as C } from '../styles/brandColors';
import { HEADER_OFFSET, MEDIA, ORDER, SCRUB, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { hero } = landing;

/**
 * Floating pattern strokes (mockup `floatDefs`). `k` is each one's parallax
 * travel in px; static rotation is `rot`. `wideOnly` strokes are hidden below
 * 1024px, where they would land on the headline or the seal.
 */
export const HERO_FLOATS: ReadonlyArray<{
  shape: ShapeName;
  left: string;
  top: string;
  size: number;
  color: string;
  opacity: number;
  rot: number;
  k: number;
  wideOnly?: boolean;
}> = [
  { shape: 'u', left: '3%', top: '6%', size: 84, color: 'text-teal', opacity: 0.9, rot: -18, k: 160, wideOnly: true },
  { shape: 'dot', left: '45%', top: '7%', size: 44, color: 'text-white', opacity: 0.9, rot: 0, k: 260, wideOnly: true },
  { shape: 'loop', left: '47%', top: '82%', size: 104, color: 'text-mint', opacity: 0.75, rot: 32, k: 120, wideOnly: true },
  { shape: 'u', left: '91%', top: '4%', size: 78, color: 'text-white', opacity: 0.85, rot: 160, k: 220 },
  { shape: 'dot', left: '93%', top: '74%', size: 58, color: 'text-navy', opacity: 1, rot: 0, k: 300 },
  { shape: 'dot', left: '1%', top: '86%', size: 40, color: 'text-mint', opacity: 0.9, rot: 0, k: 200 },
];

/** Scroll distance (px) over which the hero's parallax runs (mockup: heroP = sy / 560). */
const HERO_TRAVEL = 560;
/** Max pupil offset as a fraction of the eye box width (mockup: 0.08). */
const EYE_MAX = 0.08;
/** Gradient blob 1 follows the pupil at this ratio, as % (mockup: eyeX · 0.25). */
const PTR_TO_GRADIENT = 0.25;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const eyeBox = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLDivElement>(null);
  const seal = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MEDIA.motion, finePointer: MEDIA.finePointer }, (ctx) => {
        const { motion, finePointer } = ctx.conditions as { motion: boolean; finePointer: boolean };
        if (!motion) return; // reduced motion: static Phase 4 version
        const section = root.current!;

        // ── Scroll: gradient blobs, floating strokes, pupil scale ──
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: `top ${HEADER_OFFSET}px`,
            end: `+=${HERO_TRAVEL}`,
            scrub: SCRUB,
            refreshPriority: ORDER.hero,
          },
        });
        // Blob shifts relative to each layout's base position (mockup: 16→4%, 86→76%, 6→12%).
        tl.fromTo(
          section,
          { '--hero-g1y-shift': '0%', '--hero-g2y-shift': '0%', '--hero-g3x-shift': '0%' },
          { '--hero-g1y-shift': '-12%', '--hero-g2y-shift': '-10%', '--hero-g3x-shift': '6%' },
          0,
        );
        gsap.utils.toArray<SVGSVGElement>('.js-float', section).forEach((el, i) => {
          const f = HERO_FLOATS[i];
          if (f) tl.fromTo(el, { y: 0, rotation: f.rot }, { y: -f.k, rotation: f.rot + 40 }, 0);
        });
        tl.fromTo(pupil.current, { scale: 1 }, { scale: 1.16 }, 0);

        // ── Seal: rotation = scroll · 0.12° across the whole page ──
        gsap.fromTo(
          seal.current,
          { rotation: 0 },
          {
            rotation: () => ScrollTrigger.maxScroll(window) * 0.12,
            ease: 'none',
            transformOrigin: '50% 50%',
            scrollTrigger: { start: 0, end: 'max', scrub: SCRUB, invalidateOnRefresh: true, refreshPriority: ORDER.page },
          },
        );

        // ── Pupil offset (cursor or idle gaze) → pupil x/y + gradient blob 1 ──
        const ptr = { x: 0, y: 0 };
        const apply = () => {
          gsap.set(pupil.current, { x: ptr.x, y: ptr.y });
          // The gradient only follows the cursor to the right: moving the light
          // blob left would put it behind the headline (contrast below AA).
          section.style.setProperty('--hero-ptr-x', `${Math.max(0, ptr.x * PTR_TO_GRADIENT).toFixed(2)}%`);
          section.style.setProperty('--hero-ptr-y', `${(ptr.y * PTR_TO_GRADIENT).toFixed(2)}%`);
        };
        const maxOffset = () => (eyeBox.current?.getBoundingClientRect().width ?? 0) * EYE_MAX;

        if (finePointer) {
          const toX = gsap.quickTo(ptr, 'x', { duration: 0.3, ease: 'power1.out', onUpdate: apply });
          const toY = gsap.quickTo(ptr, 'y', { duration: 0.3, ease: 'power1.out', onUpdate: apply });
          const onMove = (e: MouseEvent) => {
            const r = eyeBox.current!.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, d / (r.width * 0.8));
            toX((dx / d) * r.width * EYE_MAX * k);
            toY((dy / d) * r.width * EYE_MAX * k);
          };
          const onLeave = () => {
            toX(0);
            toY(0);
          };
          section.addEventListener('mousemove', onMove);
          section.addEventListener('mouseleave', onLeave);
          return () => {
            section.removeEventListener('mousemove', onMove);
            section.removeEventListener('mouseleave', onLeave);
            section.style.removeProperty('--hero-ptr-x');
            section.style.removeProperty('--hero-ptr-y');
            gsap.set(pupil.current, { clearProps: 'transform' });
          };
        }

        // Touch: slow idle gaze, paused while the hero is off-screen.
        let gaze: gsap.core.Tween | null = null;
        let next: gsap.core.Tween | null = null;
        let active = true;
        const wander = () => {
          if (!active) return;
          const m = maxOffset() * 0.5;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * m;
          gaze = gsap.to(ptr, { x: Math.cos(a) * r, y: Math.sin(a) * r, duration: 1.4, ease: 'power2.inOut', onUpdate: apply });
          next = gsap.delayedCall(gsap.utils.random(2.5, 3.5), wander);
        };
        const visibility = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          refreshPriority: ORDER.hero,
          onToggle: (self) => {
            active = self.isActive;
            if (active && !next?.isActive()) wander();
            if (!active) {
              next?.kill();
              gaze?.pause();
            }
          },
        });
        wander();
        return () => {
          active = false;
          next?.kill();
          gaze?.kill();
          visibility.kill();
          section.style.removeProperty('--hero-ptr-x');
          section.style.removeProperty('--hero-ptr-y');
          gsap.set(pupil.current, { clearProps: 'transform' });
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="inicio" className="bg-hero relative overflow-hidden px-gutter pt-24 pb-32">
      {HERO_FLOATS.map((f, i) => (
        <BrandShape
          key={i}
          shape={f.shape}
          className={`js-float pointer-events-none absolute ${f.color} ${f.wideOnly ? 'max-lg:hidden' : ''}`}
          style={{
            left: f.left,
            top: f.top,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            transform: `rotate(${f.rot}deg)`,
          }}
        />
      ))}

      <div className="relative z-[2] mx-auto flex max-w-[1200px] flex-wrap items-center gap-14">
        <div className="flex max-w-[600px] flex-[1_1_460px] flex-col gap-[30px]">
          <h1 className="m-0 font-display text-[clamp(34px,4.2vw,58px)] leading-[1.06] font-semibold tracking-[-0.03em] text-white">
            {hero.title}
          </h1>
          <p className="m-0 max-w-[26em] text-xl leading-[1.55] text-foam-2">{hero.body}</p>
          <div className="-mt-1 flex flex-col gap-[14px]">
            <ul aria-label={hero.badges.listLabel} className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              <li className="inline-flex min-h-[38px] items-center gap-2 rounded-full bg-white pr-4 pl-2.5 text-[15px] font-bold text-navy">
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="size-5 shrink-0">
                  <circle cx="10" cy="10" r="9" fill={C.teal} />
                  <path d="M6 10.4 L8.8 13 L14 7.6" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {hero.badges.sales}
              </li>
              <li className="box-border inline-flex min-h-[38px] items-center gap-2 rounded-full border-[1.5px] border-solid border-white/60 pr-4 pl-3 text-[15px] font-semibold text-white">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 shrink-0">
                  <path d="M2 6 H14 V16 H2 Z M14 9 H18.5 L22 12.5 V16 H14" fill="none" stroke={C.white} strokeWidth="1.8" strokeLinejoin="round" />
                  <circle cx="6.5" cy="17.5" r="2" fill={C.navy} stroke={C.white} strokeWidth="1.8" />
                  <circle cx="17.5" cy="17.5" r="2" fill={C.navy} stroke={C.white} strokeWidth="1.8" />
                </svg>
                {hero.badges.shipping}
              </li>
            </ul>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[13px] font-semibold tracking-[0.06em] text-mint uppercase">{hero.marketplaces.label}</span>
              <MarketplaceLogos stores={hero.marketplaces.stores} label={hero.marketplaces.listLabel} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-[22px]">
            <ActionLink link={hero.primaryCta} className={`${pill.base} ${pill.lg} bg-white text-navy hover:bg-mist hover:text-navy`} />
            <ActionLink
              link={hero.secondaryCta}
              className="inline-flex min-h-11 items-center text-[17px] font-semibold text-white underline underline-offset-[5px] hover:text-white"
            />
          </div>
        </div>

        <div className="flex flex-[1_1_380px] justify-center">
          <div ref={eyeBox} className="relative aspect-square w-full max-w-[540px]">
            <Seal ref={seal} text={hero.seal} color="white" className="absolute inset-0 size-full" />
            <div className="absolute inset-[11%] box-border flex items-center justify-center rounded-full border-2 border-mint bg-mist">
              <div ref={pupil} className="flex size-[58%] items-center justify-center will-change-transform">
                <Isotipo className="size-full text-teal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
