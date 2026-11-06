import { landing } from '../../content/landing';
import { BrandShape } from '../brand/BrandShape';
import { Mascot } from '../brand/Mascot';

const { chat } = landing.consulta;

type ChatHeaderProps = {
  /** "Pregunta N de 5", "Listo" or "Consulta en pausa", derived from the profile. */
  label: string;
  /** Progress bar fill, 0–1. */
  fraction: number;
};

/** Navy header with Opti and the progress derived from the profile. */
export function ChatHeader({ label, fraction }: ChatHeaderProps) {
  return (
    <>
      <div className="relative flex shrink-0 items-center justify-between gap-4 overflow-hidden bg-navy px-7 py-5">
        <BrandShape shape="u" className="absolute -top-[26px] right-[120px] size-[90px] rotate-[150deg] text-navy-2" />
        <div className="relative flex items-center gap-3.5">
          <Mascot variant="onLight" size={52} crop="head" className="shrink-0 rounded-full bg-mint" />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[17px] font-semibold text-white">{chat.name}</span>
            <span className="text-sm text-foam">{chat.role}</span>
          </div>
        </div>
        <span className="relative text-sm font-semibold whitespace-nowrap text-white">{label}</span>
      </div>

      <div aria-hidden="true" className="h-[5px] shrink-0 bg-line-2">
        <div className="h-[5px] bg-teal transition-[width] duration-400" style={{ width: `${Math.round(fraction * 100)}%` }} />
      </div>
    </>
  );
}
