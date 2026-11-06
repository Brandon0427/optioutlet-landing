import { landing } from '../content/landing';
import { Ribbon } from '../components/brand/Ribbon';
import { ActionLink, pill } from '../components/ui/ActionLink';

const { storeCta } = landing;

/**
 * "¿Ya sabes cuáles quieres?" with the teal U ribbon. From 1024px the ribbon
 * sits to the right of the copy (as in the mockup); below it, it moves under
 * the buttons, smaller, so it never sits behind the text.
 * Phase 5 drives the ribbon text's startOffset with scroll.
 */
export function StoreCta() {
  return (
    <section aria-labelledby="store-title" className="bg-store-cta relative overflow-hidden px-gutter py-30 max-lg:pb-[300px]">
      <Ribbon
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
