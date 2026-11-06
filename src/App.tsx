import { landing } from './content/landing';

// TEMPORARY (Phase 2): token + font smoke test. Replaced by the real page in Phase 4.
const SWATCHES = [
  'navy', 'teal', 'teal-ink', 'mint', 'mist', 'mist-2', 'charcoal',
  'ink', 'ink-2', 'ink-3', 'ink-4', 'foam', 'foam-2', 'line', 'line-2', 'line-3',
] as const;

export default function App() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-16">
      <h1 className="font-display text-5xl font-semibold tracking-tight text-navy">
        {landing.hero.title}
      </h1>
      <p className="max-w-[30em] font-sans text-xl leading-relaxed text-ink">{landing.hero.body}</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SWATCHES.map((token) => (
          <li key={token} className="flex items-center gap-3">
            <span
              className="size-12 shrink-0 rounded-full border border-line-3"
              style={{ background: `var(--color-${token})` }}
            />
            <code className="text-sm text-ink-2">{token}</code>
          </li>
        ))}
      </ul>
    </main>
  );
}
