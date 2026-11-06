import { PatternFill } from '../brand/PatternFill';

/** Light pattern strip before the footer. The tall inner pattern gives Phase 5 room for a looping parallax. */
export function PatternStrip() {
  return (
    <div aria-hidden="true" className="relative h-[180px] overflow-hidden bg-white">
      <PatternFill variant="light" className="pointer-events-none absolute top-0 left-0 h-[580px] w-full" />
    </div>
  );
}
