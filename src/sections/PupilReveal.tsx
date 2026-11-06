import { landing } from '../content/landing';
import { Mascot } from '../components/brand/Mascot';
import { PatternFill } from '../components/brand/PatternFill';

const { reveal } = landing;

/**
 * "Antes de recomendarte algo…" — static state = end of the reveal:
 * navy stage, dark pattern at 0.18, Opti at full scale. The navy pupil, its
 * bite and the scroll caption are present but hidden; Phase 5 animates them.
 */
export function PupilReveal() {
  return (
    <section aria-labelledby="reveal-title" className="relative bg-navy">
      <div className="relative box-border flex min-h-[680px] items-center justify-center overflow-hidden px-gutter py-24">
        {/* Pupil (navy disc + bite). Hidden in the static version. */}
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 -mt-20 -ml-20 size-40 opacity-0">
          <div className="absolute inset-0 rounded-full bg-navy" />
          <div className="absolute top-1.5 right-[22px] size-[60px] rounded-full bg-mist opacity-0" />
        </div>

        <PatternFill variant="dark" style={{ opacity: 0.18 }} />

        <p
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(50%+112px)] m-0 text-center text-[17px] font-semibold text-navy opacity-0"
        >
          {reveal.caption}
        </p>

        <div className="relative z-[2] flex max-w-[880px] flex-col items-center gap-[26px] text-center">
          <div className="flex size-[168px] items-center justify-center rounded-full bg-navy">
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
