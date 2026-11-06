import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Mascot } from '../components/brand/Mascot';
import { Seal } from '../components/brand/Seal';

const { receta } = landing;

/** "Opti te orienta. Tu especialista te receta." Phase 5 spins the seal counter-clockwise with scroll. */
export function Receta() {
  return (
    <section aria-labelledby="receta-title" className="overflow-hidden bg-white px-gutter py-32">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-18">
        <div className="mx-auto flex flex-[0_1_380px] justify-center">
          <div className="relative aspect-square w-full max-w-[380px]">
            <Seal text={receta.seal} color="white" background="navy" className="absolute inset-0 size-full" />
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
