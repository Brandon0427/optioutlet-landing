import { useEffect, useRef } from 'react';
import { landing } from '../content/landing';
import { PatternFill } from '../components/brand/PatternFill';
import { ChatCard } from '../components/consulta/ChatCard';
import { useConsulta } from '../consulta/useConsulta';

const { consulta: copy } = landing;

const SECTION_HASH = '#consulta';

/**
 * The consultation with Opti. It does not start on page load: it starts the
 * first time the section enters the screen, or when someone arrives with (or
 * follows) a #consulta link. `start` is idempotent, so both triggers and
 * StrictMode's double mount are harmless.
 *
 * It uses an IntersectionObserver, not a ScrollTrigger, so it adds nothing to
 * the scroll engine. The conversation is not persisted anywhere.
 */
export function Consulta() {
  const root = useRef<HTMLElement>(null);
  const consulta = useConsulta();
  const { start } = consulta;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fromHash = () => {
      if (window.location.hash === SECTION_HASH) start();
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'undefined') {
      start();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            start();
            io?.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      io.observe(el);
    }
    return () => {
      window.removeEventListener('hashchange', fromHash);
      io?.disconnect();
    };
  }, [start]);

  return (
    <section ref={root} id="consulta" aria-labelledby="consulta-title" className="bg-consulta relative overflow-hidden px-gutter py-32">
      <PatternFill variant="light" style={{ opacity: 0.1 }} />

      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-start gap-14">
        <div className="flex max-w-[420px] flex-[1_1_320px] flex-col gap-[22px]">
          <h2
            id="consulta-title"
            className="m-0 font-display text-[clamp(30px,3.6vw,50px)] leading-[1.1] font-semibold tracking-[-0.025em] text-navy"
          >
            {copy.title}
          </h2>
          <p className="m-0 text-[19px] leading-[1.6] text-ink">{copy.body}</p>
          <p className="m-0 text-base leading-[1.6] text-ink-2">{copy.note}</p>
        </div>

        <ChatCard consulta={consulta} />
      </div>
    </section>
  );
}
