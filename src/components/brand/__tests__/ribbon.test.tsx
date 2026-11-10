import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { landing } from '../../../content/landing';
import {
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

  it('one repetition is the motto with its separator and trailing space', () => {
    expect(landing.storeCta.ribbon).toBe('TODO PARA VER BIEN • ');
  });
});
