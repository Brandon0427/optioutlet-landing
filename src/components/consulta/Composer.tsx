import { useId, type FormEvent, type RefObject } from 'react';
import { landing } from '../../content/landing';
import type { QuickReply } from '../../consulta/types';
import type { ConsultaState } from '../../consulta/useConsulta';

const { chat } = landing.consulta;

const outlineButton =
  'min-h-11 cursor-pointer rounded-full border-[1.5px] border-navy bg-white px-[18px] font-sans text-[15px] font-semibold text-navy transition-colors duration-200 hover:bg-navy hover:text-white';

export type ComposerRefs = {
  input: RefObject<HTMLInputElement | null>;
  firstReply: RefObject<HTMLButtonElement | null>;
  restart: RefObject<HTMLButtonElement | null>;
  retry: RefObject<HTMLButtonElement | null>;
};

type ComposerProps = {
  state: ConsultaState;
  refs: ComposerRefs;
  onQuick: (reply: QuickReply) => void;
  onSubmit: () => void;
  onDraft: (draft: string) => void;
  onRestart: () => void;
  onRetry: () => void;
};

/**
 * Bottom of the chat card: quick replies + text field while asking, "Volver a
 * empezar" when the consultation ends, "Reintentar" on error. Natural height;
 * the message log above absorbs any change, so the card never changes size.
 *
 * The text field is never `disabled` (a disabled field can't hold focus and
 * focus would fall to <body> after tapping an option): it is read-only while
 * Opti types, and the reducer ignores sends outside 'asking'.
 */
export function Composer({ state, refs, onQuick, onSubmit, onDraft, onRestart, onRetry }: ComposerProps) {
  const inputId = useId();
  const errorId = useId();
  const { phase, quickReplies, draft, error } = state;
  const canSend = phase === 'asking';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <div className="flex shrink-0 flex-col gap-3.5 border-t border-line px-6 pt-4 pb-5 max-sm:px-4">
      {phase === 'error' && error ? (
        <div className="flex flex-col items-start gap-3">
          <p id={errorId} role="alert" className="m-0 text-[15px] leading-[1.5] text-navy">
            {chat.errors[error]}
          </p>
          <button ref={refs.retry} type="button" onClick={onRetry} aria-describedby={errorId} className={outlineButton}>
            {chat.retry}
          </button>
        </div>
      ) : phase === 'done' || phase === 'refer' ? (
        <div className="flex flex-wrap gap-2.5">
          <button ref={refs.restart} type="button" onClick={onRestart} className={outlineButton}>
            {chat.restart}
          </button>
        </div>
      ) : (
        <>
          {quickReplies.length > 0 && (
            <div role="group" aria-label={chat.quickRepliesLabel} className="flex flex-wrap gap-2.5">
              {quickReplies.map((reply, i) => (
                <button
                  key={reply.id}
                  ref={i === 0 ? refs.firstReply : undefined}
                  type="button"
                  onClick={() => onQuick(reply)}
                  className={outlineButton}
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={submit} className="flex items-center gap-2.5">
            <label htmlFor={inputId} className="sr-only">
              {chat.inputLabel}
            </label>
            <input
              ref={refs.input}
              id={inputId}
              type="text"
              autoComplete="off"
              value={draft}
              readOnly={!canSend}
              onChange={(e) => onDraft(e.target.value)}
              placeholder={chat.inputPlaceholder}
              className="box-border min-h-12 min-w-0 flex-auto rounded-full border-[1.5px] border-line-3 bg-white px-[18px] font-sans text-base text-navy placeholder:text-ink-3"
            />
            <button
              type="submit"
              aria-disabled={canSend ? undefined : 'true'}
              className="min-h-12 flex-[0_0_auto] cursor-pointer rounded-full border-0 bg-navy px-[22px] font-sans text-[15px] font-semibold text-white hover:bg-navy-hover aria-disabled:cursor-default aria-disabled:opacity-60 aria-disabled:hover:bg-navy"
            >
              {chat.send}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
