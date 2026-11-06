import { useLayoutEffect, useRef } from 'react';
import type { QuickReply } from '../../consulta/types';
import type { useConsulta } from '../../consulta/useConsulta';
import { ChatHeader } from './ChatHeader';
import { Composer, type ComposerRefs } from './Composer';
import { MessageLog } from './MessageLog';

type ChatCardProps = { consulta: ReturnType<typeof useConsulta> };

/**
 * The chat card has a FIXED height per breakpoint (the Session 1 shell's
 * measured height: 720px, and 784px below 640px). Header, progress bar and
 * composer take their natural height; the message log takes the rest and
 * scrolls internally. The section never changes height during the
 * conversation, so the ScrollTriggers below it (receta seal, store ribbon,
 * pattern strip) keep their start/end.
 *
 * Focus never falls to <body>: after tapping an option it moves to the text
 * field; on done/refer to "Volver a empezar"; on error to "Reintentar"; after
 * "Volver a empezar", to the first option of the new conversation.
 * Every focus() uses preventScroll so the page (and the pins) never move.
 */
export function ChatCard({ consulta }: ChatCardProps) {
  const { state, progress, sendQuick, sendText, setDraft, reset, retry } = consulta;
  const { phase, quickReplies } = state;

  const cardRef = useRef<HTMLDivElement>(null);
  const refs: ComposerRefs = {
    input: useRef<HTMLInputElement>(null),
    firstReply: useRef<HTMLButtonElement>(null),
    restart: useRef<HTMLButtonElement>(null),
    retry: useRef<HTMLButtonElement>(null),
  };
  /** The visitor has used the chat; only then do we move focus for them. */
  const interacted = useRef(false);
  /** Set by "Volver a empezar": focus the first option once it arrives. */
  const focusFirstReply = useRef(false);

  const onQuick = (reply: QuickReply) => {
    interacted.current = true;
    // The options disappear on the next render; the field takes the focus.
    refs.input.current?.focus({ preventScroll: true });
    sendQuick(reply);
  };
  const onSubmit = () => {
    interacted.current = true;
    sendText(state.draft);
  };
  const onRestart = () => {
    interacted.current = true;
    focusFirstReply.current = true;
    reset();
  };
  const onRetry = () => {
    interacted.current = true;
    retry();
  };

  useLayoutEffect(() => {
    if (!interacted.current) return;
    const active = document.activeElement;
    const lost = !active || active === document.body;
    // Don't pull focus back if the visitor moved elsewhere on the page.
    if (!lost && !cardRef.current?.contains(active)) return;
    const focus = (el: HTMLElement | null) => el?.focus({ preventScroll: true });

    if (phase === 'error') return focus(refs.retry.current);
    if (phase === 'done' || phase === 'refer') return focus(refs.restart.current);
    if (focusFirstReply.current && quickReplies.length > 0) {
      focusFirstReply.current = false;
      return focus(refs.firstReply.current);
    }
    // The button that had focus was removed (restart, retry): keep it on the field.
    if (lost || focusFirstReply.current) focus(refs.input.current);
    // refs are stable objects created from useRef.
  }, [phase, quickReplies]);

  return (
    <div
      ref={cardRef}
      className="flex h-[720px] min-w-0 flex-[999_1_520px] flex-col overflow-hidden rounded-[28px_72px_28px_28px] bg-white shadow-chat max-sm:h-[784px]"
    >
      <ChatHeader label={progress.label} fraction={progress.fraction} />
      <MessageLog state={state} />
      <Composer
        state={state}
        refs={refs}
        onQuick={onQuick}
        onSubmit={onSubmit}
        onDraft={setDraft}
        onRestart={onRestart}
        onRetry={onRetry}
      />
    </div>
  );
}
