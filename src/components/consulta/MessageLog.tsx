import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { landing } from '../../content/landing';
import type { ConsultaState } from '../../consulta/useConsulta';
import { ProductCard } from './ProductCard';

const { chat, result } = landing.consulta;

/** Opti's text may hold paragraphs (blank line); each one is a bubble, as in the mockup. */
const paragraphs = (message: string) => message.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

const optiBubble =
  'max-w-[78%] self-start whitespace-pre-line rounded-[18px_18px_18px_4px] bg-mist px-4 py-3 text-base leading-[1.5] text-navy max-sm:max-w-[88%]';
const userBubble =
  'max-w-[70%] self-end whitespace-pre-line rounded-[18px_18px_4px_18px] bg-navy px-4 py-3 text-base leading-[1.5] text-white max-sm:max-w-[85%]';

/**
 * Chat history. Takes the remaining height of the fixed-height card
 * (flex-1, min-h-0, floor of 240px) and scrolls internally.
 *
 * It scrolls by setting its OWN scrollTop, never with scrollIntoView, which
 * would move the page and fire the pins. It re-scrolls when a message
 * arrives and whenever it is resized (more quick-reply rows shrink it).
 */
export function MessageLog({ state }: { state: ConsultaState }) {
  const logRef = useRef<HTMLDivElement>(null);
  const lastOptiRef = useRef<HTMLDivElement>(null);
  const { messages, phase, notes, recommendations } = state;
  const waiting = phase === 'waiting';
  let lastOptiIndex = -1;
  messages.forEach((m, i) => {
    if (m.role === 'assistant') lastOptiIndex = i;
  });

  const scrollToLatest = useCallback(() => {
    const log = logRef.current;
    if (!log) return;
    const anchor = lastOptiRef.current;
    // With results, show Opti's closing message at the top and the cards below it.
    log.scrollTop = phase === 'done' && anchor ? anchor.offsetTop - 16 : log.scrollHeight;
  }, [phase]);

  useLayoutEffect(scrollToLatest, [scrollToLatest, messages.length, waiting]);

  useEffect(() => {
    const log = logRef.current;
    if (!log || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => scrollToLatest());
    ro.observe(log);
    return () => ro.disconnect();
  }, [scrollToLatest]);

  return (
    <div
      ref={logRef}
      role="log"
      aria-live="polite"
      aria-busy={waiting}
      aria-label={chat.logLabel}
      tabIndex={0}
      className="relative box-border flex min-h-60 flex-1 flex-col gap-3 overflow-y-auto p-6 max-sm:p-4"
    >
      {messages.map((m, i) =>
        m.role === 'assistant' ? (
          <div key={i} ref={i === lastOptiIndex ? lastOptiRef : undefined} className="flex flex-col gap-3">
            {paragraphs(m.turn.message).map((p, j) => (
              <div key={j} className={optiBubble}>
                {p}
              </div>
            ))}
          </div>
        ) : (
          <div key={i} className={userBubble}>
            {m.text}
          </div>
        ),
      )}

      {phase === 'done' && notes.length > 0 && (
        <ul aria-label={result.notesLabel} className="m-0 flex shrink-0 list-none flex-col gap-3 p-0">
          {notes.map((note) => (
            <li key={note} className="rounded-[14px] border-[1.5px] border-navy bg-white px-4 py-3 text-[15px] leading-[1.5] text-navy">
              {note}
            </li>
          ))}
        </ul>
      )}

      {phase === 'done' && recommendations.length > 0 && (
        <section aria-label={result.listLabel} className="flex shrink-0 flex-col gap-3">
          {recommendations.map((item) => (
            <ProductCard key={item.product.id} item={item} />
          ))}
        </section>
      )}

      {waiting && (
        <div className="flex shrink-0 gap-1.5 self-start rounded-[18px_18px_18px_4px] bg-mist px-[18px] py-4">
          <span className="sr-only">{chat.typingLabel}</span>
          {[0, 0.15, 0.3].map((delay) => (
            <span
              key={delay}
              aria-hidden="true"
              className="size-2 rounded-full bg-navy opacity-60 motion-safe:animate-typing-dot"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
