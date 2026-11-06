import { useId } from 'react';
import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Mascot } from '../components/brand/Mascot';
import { PatternFill } from '../components/brand/PatternFill';

const { consulta } = landing;
const { chat, sample } = consulta;

/**
 * Visual shell of the consultation with Opti (Session 1). Static sample
 * content from landing.ts; the conversation logic arrives in Session 2.
 */
export function ConsultaShell() {
  const inputId = useId();
  const progressPct = Math.round(((sample.current - 1) / sample.total) * 100);

  return (
    <section
      id="consulta"
      aria-labelledby="consulta-title"
      className="bg-consulta relative overflow-hidden px-gutter py-32"
    >
      <PatternFill variant="light" style={{ opacity: 0.1 }} />

      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-start gap-14">
        <div className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-[22px]">
          <h2
            id="consulta-title"
            className="m-0 font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-navy"
          >
            {consulta.title}
          </h2>
          <p className="m-0 text-[19px] leading-[1.6] text-ink">{consulta.body}</p>
          <p className="m-0 text-base leading-[1.6] text-ink-2">{consulta.note}</p>
        </div>

        <div className="flex min-w-0 flex-[999_1_520px] flex-col overflow-hidden rounded-[28px_72px_28px_28px] bg-white shadow-chat">
          {/* Chat header */}
          <div className="relative flex items-center justify-between gap-4 overflow-hidden bg-navy px-7 py-5">
            <BrandShape shape="u" className="absolute -top-[26px] right-[120px] size-[90px] rotate-[150deg] text-navy-2" />
            <div className="relative flex items-center gap-3.5">
              <Mascot variant="onLight" size={52} crop="head" className="shrink-0 rounded-full bg-mint" />
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-[17px] font-semibold text-white">{chat.name}</span>
                <span className="text-sm text-foam">{chat.role}</span>
              </div>
            </div>
            <span className="relative text-sm font-semibold whitespace-nowrap text-white">
              {chat.progressLabel(sample.current, sample.total)}
            </span>
          </div>

          {/* Progress */}
          <div aria-hidden="true" className="h-[5px] bg-line-2">
            <div className="h-[5px] bg-teal transition-[width] duration-400" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Messages */}
          <div aria-live="polite" className="box-border flex h-[480px] flex-col gap-3 overflow-y-auto p-6 max-sm:h-[420px] max-sm:p-4">
            {sample.messages.map((m, i) =>
              m.from === 'opti' ? (
                <div key={i} className="max-w-[78%] self-start rounded-[18px_18px_18px_4px] bg-mist px-4 py-3 text-base leading-[1.5] text-navy max-sm:max-w-[88%]">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="max-w-[70%] self-end rounded-[18px_18px_4px_18px] bg-navy px-4 py-3 text-base leading-[1.5] text-white max-sm:max-w-[85%]">
                  {m.text}
                </div>
              ),
            )}
          </div>

          {/* Composer */}
          <div className="flex flex-col gap-3.5 border-t border-line px-6 pt-4 pb-5 max-sm:px-4">
            <div className="flex flex-wrap gap-2.5">
              {sample.chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="min-h-11 cursor-pointer rounded-full border-[1.5px] border-navy bg-white px-[18px] font-sans text-[15px] font-semibold text-navy transition-colors duration-200 hover:bg-navy hover:text-white"
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              <label htmlFor={inputId} className="sr-only">
                {chat.inputLabel}
              </label>
              <input
                id={inputId}
                type="text"
                placeholder={chat.inputPlaceholder}
                className="box-border min-h-12 min-w-0 flex-auto rounded-full border-[1.5px] border-line-3 bg-white px-[18px] font-sans text-base text-navy placeholder:text-ink-3"
              />
              <button
                type="button"
                className="min-h-12 flex-[0_0_auto] cursor-pointer rounded-full border-0 bg-navy px-[22px] font-sans text-[15px] font-semibold text-white hover:bg-navy-hover"
              >
                {chat.send}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
