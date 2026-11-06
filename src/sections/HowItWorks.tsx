import { landing, type PhoneScreen } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Mascot } from '../components/brand/Mascot';

const { howItWorks } = landing;

/** Index of the phone screen and of the highlighted step in the static version (step 3). */
const STATIC_SCREEN = 2;

/**
 * "Así funciona tu consulta". Static version: the three steps visible and
 * active, the phone on screen 3. Phase 5 pins it, highlights one step per
 * third of the scroll, swaps the phone screen and spins the disc.
 */
export function HowItWorks() {
  return (
    <section id="como" aria-labelledby="como-title" className="relative overflow-x-clip bg-white">
      <div className="box-border flex items-center px-gutter py-24">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-14">
          <div className="flex max-w-[560px] flex-[1_1_360px] flex-col gap-10">
            <h2
              id="como-title"
              className="m-0 font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-navy"
            >
              {howItWorks.title}
            </h2>
            <ol className="m-0 flex list-none flex-col gap-[30px] p-0">
              {howItWorks.steps.map((step, i) => (
                <li key={step.title} data-step={i} className="flex items-start gap-5">
                  <StepBadge num={i + 1} active />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <h3 className="m-0 text-[22px] font-bold text-navy transition-colors duration-300">{step.title}</h3>
                    <p className="m-0 max-w-[30em] text-[17px] leading-[1.55] text-navy transition-colors duration-300">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Phone />
        </div>
      </div>
    </section>
  );
}

function StepBadge({ num, active }: { num: number; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative box-border flex h-[52px] flex-[0_0_52px] items-center justify-center rounded-full border-2 font-display text-[17px] font-semibold text-navy transition-colors duration-300 ${
        active ? 'border-teal bg-teal' : 'border-line-3 bg-white'
      }`}
    >
      {/* bite on the badge's top-right edge */}
      <span className={`absolute top-0.5 right-[5px] size-3.5 rounded-full bg-white ${active ? 'opacity-100' : 'opacity-0'}`} />
      {num}
    </span>
  );
}

function Phone() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex h-[580px] w-[340px] max-w-full flex-[0_0_auto] origin-top items-center justify-center"
    >
      <div className="bg-phone-disc absolute top-1/2 left-1/2 -mt-[230px] -ml-[230px] size-[460px] rounded-full" />
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
