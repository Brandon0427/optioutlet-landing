import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { landing } from '../../../content/landing';
import { Header } from '../../layout/Header';
import { BrandShape } from '../BrandShape';
import { ISOTIPO_SPLIT } from '../geometry';
import { Imagotipo } from '../Imagotipo';
import { Isotipo } from '../Isotipo';
import { Mascot } from '../Mascot';
import { PatternDefs } from '../PatternDefs';

// Built from parts so a repo-wide grep for these strings stays empty (Session 8 check).
const FILE_TEAL = ['33', 'c4', 'b6'].join('');
const FILE_CLASS = ['cl', 's-'].join('');

/** Every official brand component, mounted together on one page (Session 8, decision 2). */
const page = renderToStaticMarkup(
  <main>
    <Header />
    <Imagotipo variant="onLight" size="md" />
    <Imagotipo variant="onLight" size="sm" />
    <Imagotipo variant="onNavy" size="sm" />
    <Isotipo />
    {(['u', 'loop', 'dot'] as const).map((s) => (
      <BrandShape key={s} shape={s} />
    ))}
    <BrandShape shape="dot" framing="tight" />
    <Mascot variant="onLight" size={150} />
    <Mascot variant="onNavy" size={150} />
    <Mascot variant="onLight" size={52} crop="head" />
    <Mascot variant="onNavy" size={52} crop="head" />
    <svg viewBox={ISOTIPO_SPLIT.viewBox}>
      <path d={ISOTIPO_SPLIT.disc} />
      <path d={ISOTIPO_SPLIT.biteLens} />
    </svg>
    <PatternDefs />
  </main>,
);

describe('official brand assets mounted together', () => {
  it('carry no <style> block and no designer class names', () => {
    expect(page).not.toMatch(/<style/i);
    expect(page).not.toContain(FILE_CLASS);
  });

  it("never use the designer files' teal; the brand teal comes from the tokens", () => {
    expect(page.toLowerCase()).not.toContain(FILE_TEAL);
    expect(page.toLowerCase()).toContain('#67bbb5');
  });

  it('have no repeated ids (gradients come from useId)', () => {
    const ids = [...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('render the multiply shade only on the color logo, never on the white one', () => {
    const logos = [...page.matchAll(/<svg[^>]*role="img"[^>]*aria-label="Optioutlet"[^>]*>[\s\S]*?<\/svg>/g)].map((m) => m[0]);
    // 2 in the Header (sm + md) + md + sm color + 1 white
    expect(logos).toHaveLength(5);
    const white = logos.filter((l) => !l.includes('#214367'));
    expect(white).toHaveLength(1);
    expect(white[0]).not.toContain('multiply');
    expect(white[0]).not.toContain('url(#');
    logos.filter((l) => l.includes('#214367')).forEach((l) => expect(l).toContain('mix-blend-mode:multiply'));
  });

  it('expose the logo as an image named "Optioutlet"', () => {
    const html = renderToStaticMarkup(<Imagotipo variant="onNavy" />);
    expect(html).toMatch(/^<svg[^>]*role="img"/);
    expect(html).toContain(`aria-label="${landing.meta.brandName}"`);
    expect(landing.meta.brandName).toBe('Optioutlet');
  });

  it('keep the Header home link name (its own aria-label) around the logo', () => {
    const link = page.match(/<a href="#inicio"[^>]*>/)?.[0] ?? '';
    expect(link).toContain(`aria-label="${landing.header.homeLabel}"`);
    expect(landing.header.homeLabel.trim()).not.toBe('');
  });
});
