import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { landing } from '../../../content/landing';
import {
  RIBBON_BAND_WIDTH,
  RIBBON_PATH,
  RIBBON_PATH_LENGTH,
  RIBBON_REPEATS,
  RIBBON_REPEAT_LENGTH,
  RIBBON_REST_OFFSET,
  Ribbon,
} from '../Ribbon';

describe('Ribbon (continuous band)', () => {
  it('the path length constant matches RIBBON_PATH (two 240 straights + a half circle of r 110)', () => {
    expect(RIBBON_PATH).toBe('M60 10 V250 A110 110 0 0 0 280 250 V10');
    expect(RIBBON_PATH_LENGTH).toBeCloseTo(825.58, 1);
  });

  it('the text covers the stroke plus one full travel', () => {
    expect(RIBBON_REPEATS * RIBBON_REPEAT_LENGTH).toBeGreaterThanOrEqual(RIBBON_PATH_LENGTH + RIBBON_REPEAT_LENGTH);
  });

  it('rests at half a repetition', () => {
    expect(RIBBON_REST_OFFSET).toBe(-RIBBON_REPEAT_LENGTH / 2);
  });

  it('renders a fixed-length band, repeated, resting at −REP / 2', () => {
    const html = renderToStaticMarkup(<Ribbon text={landing.storeCta.ribbon} />);
    const tp = html.match(/<textPath[^>]*>([^<]*)<\/textPath>/);
    expect(tp).not.toBeNull();
    const [tag, content] = [tp![0], tp![1]];
    expect(tag).toContain(`textLength="${RIBBON_REPEATS * RIBBON_REPEAT_LENGTH}"`);
    expect(tag).toContain('lengthAdjust="spacing"');
    expect(tag).toContain(`startOffset="${RIBBON_REST_OFFSET}"`);
    expect(content).toBe(landing.storeCta.ribbon.repeat(RIBBON_REPEATS));
  });

  it('clips the text to the band: a mask with the band geometry, referenced by the <text>', () => {
    const html = renderToStaticMarkup(<Ribbon text={landing.storeCta.ribbon} />);
    const mask = html.match(/<mask id="([^"]+)"[^>]*>(.*?)<\/mask>/);
    expect(mask).not.toBeNull();
    const maskId = mask![1]!;
    const maskBody = mask![2]!;
    const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

    // The band: the stroked path outside <defs>.
    const band = html.match(/<\/defs>.*?(<path[^>]*>)/)![1]!;
    const b = attrs(band);
    expect(b.d).toBe(RIBBON_PATH);
    expect(b['stroke-width']).toBe(String(RIBBON_BAND_WIDTH));

    // Mask: black background, the same stroke in white with butt caps.
    expect(maskBody).toMatch(/<rect[^>]*fill="black"/);
    const m = attrs(maskBody.match(/<path[^>]*>/)![0]);
    expect(m.d).toBe(b.d);
    expect(m['stroke-width']).toBe(b['stroke-width']);
    expect(m.stroke).toBe('white');
    expect(m.fill).toBe('none');
    expect(m['stroke-linecap']).toBe('butt');
    expect(b['stroke-linecap'] ?? 'butt').toBe('butt');

    // Applied to the text, not to the band.
    expect(attrs(html.match(/<text[^>]*>/)![0]).mask).toBe(`url(#${maskId})`);
    expect(b.mask).toBeUndefined();
  });

  it('gives every ribbon its own mask id', () => {
    const html = renderToStaticMarkup(
      <>
        <Ribbon text="A" />
        <Ribbon text="B" />
      </>,
    );
    const ids = [...html.matchAll(/<mask id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('one repetition is the motto with its separator and trailing space', () => {
    expect(landing.storeCta.ribbon).toBe('TODO PARA VER BIEN • ');
  });
});
