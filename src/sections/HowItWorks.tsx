import { useRef, type Ref } from 'react';
import { landing, type PhoneScreen } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Mascot } from '../components/brand/Mascot';
import { HEADER_OFFSET, MEDIA, ORDER, SCRUB, STAGE_HEIGHT, STAGE_PAD, ScrollTrigger, gsap, useGSAP } from '../lib/gsap';

const { howItWorks } = landing;

/** Index of the phone screen shown in the static version (step 3). */
const STATIC_SCREEN = 2;
/** Scroll distance (px) the section stays pinned (mockup: t2H = stage + 1500). */
const HOW_TRAVEL = 1500;
/** Natural phone height, px. */
const PHONE_H = 580;
/** Container width below which steps and phone can't sit side by side. */
const COMPACT_WIDTH = 760;
/** Vertical gaps of the layout (px): title → steps list, text column → phone when wrapped. */
const GAP_TITLE = 40;
const GAP_WRAP = 56;
/** Last-resort fit for extremely short stages (content block scale). */
const MIN_FIT = 0.6;

/** Active step for a progress value: one step per third of the pin (mockup: 0.34 / 0.68). */
const stepFor = (p: number) => (p < 0.34 ? 0 : p < 0.68 ? 1 : 2);

/**
 * "Así funciona tu consulta".
 * Static (Phase 4 / reduced motion): three steps active, phone on screen 3.
 * Animated: pinned for 1500px; the active step follows the scroll by thirds,
 * the phone swaps screens with it and the gradient disc spins 0 → 120°.
 * Compact mode (one step at a time + phone) when side by side doesn't fit in
 * width (< 760px container) or the full step column doesn't fit in height.
 */
export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const textCol = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const section = root.current!;
        const stageEl = stage.current!;
        const steps = gsap.utils.toArray<HTMLLIElement>('[data-step]', section);
        const screens = gsap.utils.toArray<HTMLDivElement>('[data-screen]', section);

        gsap.set(stageEl, { height: STAGE_HEIGHT, paddingTop: STAGE_PAD, paddingBottom: STAGE_PAD, overflow: 'hidden' });

        // ── Active step + phone screen (DOM attributes, no React state) ──
        let current = -1;
        const setStep = (i: number, animate: boolean) => {
          if (i === current) return;
          current = i;
          steps.forEach((li, k) => li.setAttribute('data-active', String(k === i)));
          screens.forEach((s, k) => {
            gsap.killTweensOf(s);
            const v = k === i ? 1 : 0;
            if (animate) gsap.to(s, { autoAlpha: v, duration: 0.25, ease: 'power1.out' });
            else gsap.set(s, { autoAlpha: v });
          });
        };

        // ── Compact mode + phone scale, always decided on the FULL layout ──
        const layout = () => {
          const innerEl = inner.current!;
          const phoneEl = phone.current!;
          // 1. Back to the full state: no compact, phone at natural size, no fit.
          section.setAttribute('data-compact', 'false');
          gsap.set(phoneEl, { scale: 1, marginBottom: 0 });
          gsap.set(innerEl, { scale: 1 });
          // 2. Measure the full state (all three steps visible).
          const avail = stageEl.clientHeight - STAGE_PAD * 2;
          const containerW = innerEl.clientWidth;
          const colH = textCol.current!.offsetHeight;
          const wrapped = phoneEl.offsetTop > textCol.current!.offsetTop + 10;
          const maxStepH = Math.max(...steps.map((li) => li.offsetHeight));
          const titleH = title.current!.offsetHeight;
          // 3. Decide.
          const compact = containerW < COMPACT_WIDTH || colH > avail;
          const reserve = wrapped ? (compact ? titleH + GAP_TITLE + maxStepH : colH) + GAP_WRAP : 0;
          const s = gsap.utils.clamp(0.5, 1, (avail - reserve) / PHONE_H);
          // 4. Apply.
          section.setAttribute('data-compact', String(compact));
          gsap.set(phoneEl, { scale: s, marginBottom: -PHONE_H * (1 - s) });
          // Last resort (e.g. landscape phones): shrink the whole block to fit.
          const blockH = innerEl.offsetHeight;
          if (blockH > avail) gsap.set(innerEl, { scale: gsap.utils.clamp(MIN_FIT, 1, avail / blockH) });
        };
        ScrollTrigger.addEventListener('revert', layout);
        layout();
        setStep(0, false);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: `top ${HEADER_OFFSET}px`,
            end: `+=${HOW_TRAVEL}`,
            pin: true,
            scrub: SCRUB,
            refreshPriority: ORDER.como,
            onUpdate: (self) => setStep(stepFor(self.progress), true),
            onRefresh: (self) => setStep(stepFor(self.progress), false),
          },
        });
        tl.fromTo(disc.current, { rotation: 0 }, { rotation: 120, ease: 'none', duration: 1 });

        return () => {
          ScrollTrigger.removeEventListener('revert', layout);
          section.removeAttribute('data-compact');
          steps.forEach((li) => li.removeAttribute('data-active'));
          gsap.killTweensOf(screens);
          gsap.set(screens, { clearProps: 'opacity,visibility' });
          gsap.set([phone.current, inner.current], { clearProps: 'transform,marginBottom' });
        };
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="como" aria-labelledby="como-title" className="group/como relative overflow-x-clip bg-white">
      <div aria-hidden="true" className="stage-underlay" />
      <div ref={stage} className="box-border flex items-center px-gutter py-24">
        <div
          ref={inner}
          className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-14"
        >
          <div ref={textCol} className="flex max-w-[560px] flex-[1_1_360px] flex-col gap-10">
            <h2
              ref={title}
              id="como-title"
              className="m-0 font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-navy"
            >
              {howItWorks.title}
            </h2>
            <ol className="m-0 flex list-none flex-col gap-[30px] p-0">
              {howItWorks.steps.map((step, i) => (
                <li
                  key={step.title}
                  data-step={i}
                  className="group/step flex items-start gap-5 group-data-[compact=true]/como:data-[active=false]:hidden"
                >
                  <StepBadge num={i + 1} />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <h3 className="m-0 text-[22px] font-bold text-navy transition-colors duration-300 group-data-[active=false]/step:text-ink-4">
                      {step.title}
                    </h3>
                    <p className="m-0 max-w-[30em] text-[17px] leading-[1.55] text-navy transition-colors duration-300 group-data-[active=false]/step:text-ink-4">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Phone phoneRef={phone} discRef={disc} />
        </div>
      </div>
    </section>
  );
}

/** Step number badge. Active (default / static): teal with a bite. Inactive: white with a grey ring. */
function StepBadge({ num }: { num: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative box-border flex h-[52px] flex-[0_0_52px] items-center justify-center rounded-full border-2 border-teal bg-teal font-display text-[17px] font-semibold text-navy transition-colors duration-300 group-data-[active=false]/step:border-line-3 group-data-[active=false]/step:bg-white"
    >
      {/* bite on the badge's top-right edge */}
      <span className="absolute top-0.5 right-[5px] size-3.5 rounded-full bg-white transition-opacity duration-300 group-data-[active=false]/step:opacity-0" />
      {num}
    </span>
  );
}

function Phone({ phoneRef, discRef }: { phoneRef: Ref<HTMLDivElement>; discRef: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={phoneRef}
      aria-hidden="true"
      className="relative mx-auto flex h-[580px] w-[340px] max-w-full flex-[0_0_auto] origin-top items-center justify-center"
    >
      <div ref={discRef} className="bg-phone-disc absolute top-1/2 left-1/2 -mt-[230px] -ml-[230px] size-[460px] rounded-full" />
      <BrandShape shape="u" className="absolute top-10 left-2 size-[74px] -rotate-[24deg] text-navy" />
      <BrandShape shape="dot" className="absolute right-1 bottom-14 size-16 text-teal" />

      <div className="relative box-border flex h-[540px] w-[280px] flex-col gap-3 overflow-hidden rounded-[44px] border-10 border-navy bg-white px-4 py-[22px]">
        <div className="flex items-center gap-2.5 border-b border-line pb-3">
          <Mascot variant="onLight" size={36} crop="head" className="rounded-full bg-mist" />
          <span className="text-[15px] font-bold text-navy">{howItWorks.phone.contactName}</span>
        </div>
        <div className="grid flex-1">
          {howItWorks.phone.screens.map((screen, i) => (
            <PhoneScreenView key={i} screen={screen} visible={i === STATIC_SCREEN} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneScreenView({ screen, visible, index }: { screen: PhoneScreen; visible: boolean; index: number }) {
  return (
    <div
      data-screen={index}
      className={`col-start-1 row-start-1 flex flex-col gap-3 ${visible ? 'visible opacity-100' : 'invisible opacity-0'}`}
    >
      {screen.bubbles.map((b, i) =>
        b.from === 'opti' ? (
          <div key={i} className="max-w-[86%] self-start rounded-[16px_16px_16px_4px] bg-mist px-3.5 py-2.5 text-sm leading-[1.45] text-navy">
            {b.text}
          </div>
        ) : (
          <div key={i} className="max-w-[80%] self-end rounded-[16px_16px_4px_16px] bg-navy px-3.5 py-2.5 text-sm leading-[1.45] text-white">
            {b.text}
          </div>
        ),
      )}
      {screen.product && (
        <div className="flex flex-col gap-2 rounded-[18px_40px_18px_18px] border border-line-2 p-3">
          <div className="flex h-[92px] items-center justify-center rounded-xl bg-mist text-xs text-ink-3">{screen.product.photo}</div>
          <span className="text-sm font-bold text-navy">{screen.product.name}</span>
          <span className="self-start rounded-full bg-mist-2 px-2.5 py-1 text-xs font-semibold text-navy">{screen.product.tag}</span>
        </div>
      )}
      {screen.chips && (
        <div className="mt-auto flex flex-wrap gap-2">
          {screen.chips.map((c) => (
            <span key={c} className="rounded-full border-[1.5px] border-navy px-3.5 py-2 text-[13px] font-semibold text-navy">
              {c}
            </span>
          ))}
        </div>
      )}
      {screen.cta && (
        <div className="mt-auto flex min-h-10 items-center justify-center rounded-full bg-teal text-sm font-bold text-navy">{screen.cta}</div>
      )}
    </div>
  );
}
