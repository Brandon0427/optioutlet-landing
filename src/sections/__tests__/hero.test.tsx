import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// Markup only: the scroll engine needs a browser and never runs on the server.
vi.mock('../../lib/gsap', () => ({
  HEADER_OFFSET: 72,
  MEDIA: {},
  ORDER: {},
  SCRUB: 0,
  STAGE_HEIGHT: '',
  STAGE_PAD: 0,
  gsap: {},
  ScrollTrigger: {},
  useGSAP: () => {},
}));
import { landing } from '../../content/landing';
import { MarketplaceLogos } from '../../components/brand/MarketplaceLogos';
import { Hero } from '../Hero';

const { hero } = landing;

/** Text content of server-rendered markup (tags dropped, entities decoded). */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ');

describe('Hero', () => {
  const html = renderToStaticMarkup(<Hero />);
  const text = textOf(html);

  it('renders its copy from landing.ts', () => {
    for (const s of [hero.title, hero.body, hero.badges.sales, hero.badges.shipping, hero.marketplaces.label]) {
      expect(text).toContain(s);
    }
    expect(html).toContain(`aria-label="${hero.badges.listLabel}"`);
    expect(html).toContain(`aria-label="${hero.marketplaces.listLabel}"`);
  });

  it('keeps the badge icons decorative', () => {
    const badges = html.slice(html.indexOf(`aria-label="${hero.badges.listLabel}"`), html.indexOf('</ul>'));
    const svgs = badges.match(/<svg[^>]*>/g) ?? [];
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) expect(svg).toContain('aria-hidden="true"');
  });
});

describe('MarketplaceLogos', () => {
  const html = renderToStaticMarkup(<MarketplaceLogos stores={hero.marketplaces.stores} label={hero.marketplaces.listLabel} />);

  it('shows exactly three official logos as <img>, with the store names from landing.ts as alt', () => {
    expect(hero.marketplaces.stores).toEqual(['Mercado Libre', 'Amazon', 'Liverpool']);
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    expect(imgs).toHaveLength(3);
    expect(imgs.map((img) => img.match(/alt="([^"]*)"/)?.[1])).toEqual(hero.marketplaces.stores);
    for (const img of imgs) {
      expect(img).toMatch(/src="[^"]+\.svg(\?[^"]*)?"/);
      expect(img).not.toContain('src="data:');
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it('draws no logo as inline <svg>, links nowhere and shows no brackets', () => {
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<a ');
    expect(textOf(html)).not.toMatch(/[[\]]/);
    expect(html).not.toMatch(/alt="[^"]*[[\]][^"]*"/);
  });
});
