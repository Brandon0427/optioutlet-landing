import { describe, expect, it } from 'vitest';
import { CATALOG } from '../../consulta/catalog';
import { landing } from '../../content/landing';
import {
  DEFAULT_STORE_URL,
  DEFAULT_UTM,
  STORE_URL,
  buildStoreLink,
  readIncomingUtm,
  storeLink,
  type StoreLinkPlacement,
} from '../store';

const PLACEMENTS: StoreLinkPlacement[] = ['header-tienda', 'hero-tienda', 'cierre-tienda', 'recomendacion-1', 'recomendacion-2'];
const params = (href: string) => Object.fromEntries(new URL(href).searchParams);
const keys = (href: string) => [...new URL(href).searchParams.keys()];

describe('STORE_URL', () => {
  it('defaults to the store origin when VITE_STORE_URL is not set', () => {
    expect(STORE_URL).toBe(DEFAULT_STORE_URL);
    expect(new URL(STORE_URL).origin).toBe(STORE_URL);
  });
});

describe('storeLink without incoming UTM', () => {
  it.each(PLACEMENTS)('%s carries the four default parameters', (placement) => {
    const href = buildStoreLink('/', placement, {});
    expect(new URL(href).origin).toBe(STORE_URL);
    expect(params(href)).toEqual({ ...DEFAULT_UTM, utm_content: placement });
  });

  it('is what the landing links use (no UTM in the test URL)', () => {
    expect(landing.header.links.find((l) => l.external)?.href).toBe(storeLink('/', 'header-tienda'));
    expect(landing.hero.secondaryCta.href).toBe(storeLink('/', 'hero-tienda'));
    expect(landing.storeCta.primaryCta.href).toBe(storeLink('/', 'cierre-tienda'));
    expect(params(landing.storeCta.primaryCta.href).utm_content).toBe('cierre-tienda');
  });
});

describe('storeLink with incoming UTM', () => {
  const incoming = readIncomingUtm('?utm_source=instagram&utm_medium=paid&utm_campaign=nov&utm_content=reel-3&demo=1&foo=x&gclid=abc');

  it('reads only utm_* keys, never demo or anything else', () => {
    expect(incoming).toEqual({ utm_source: 'instagram', utm_medium: 'paid', utm_campaign: 'nov', utm_content: 'reel-3' });
  });

  it('forwards the incoming ones instead of the landing ones', () => {
    const href = buildStoreLink('/', 'header-tienda', incoming);
    expect(params(href)).toEqual({ utm_source: 'instagram', utm_medium: 'paid', utm_campaign: 'nov', utm_content: 'reel-3' });
  });

  it('does not mix in landing defaults when only some utm_* arrived', () => {
    const href = buildStoreLink('/', 'hero-tienda', readIncomingUtm('?utm_source=newsletter'));
    expect(params(href)).toEqual({ utm_source: 'newsletter' });
  });

  it('never forwards demo or non-utm parameters', () => {
    for (const placement of PLACEMENTS) {
      const href = buildStoreLink('/', placement, readIncomingUtm('?demo=1&foo=x&utm_campaign=nov'));
      expect(keys(href).every((k) => k.startsWith('utm_'))).toBe(true);
      expect(href).not.toContain('demo');
      expect(href).not.toContain('foo');
    }
  });

  it('drops empty utm values and keeps the first of repeated keys', () => {
    expect(readIncomingUtm('?utm_source=&utm_campaign=a&utm_campaign=b')).toEqual({ utm_campaign: 'a' });
    expect(readIncomingUtm('')).toEqual({});
  });
});

describe('targets', () => {
  it('a path resolves against the store origin', () => {
    const href = buildStoreLink('/collections/contacto', 'cierre-tienda', {});
    expect(href.startsWith(`${STORE_URL}/collections/contacto?`)).toBe(true);
    expect(href.split('?')).toHaveLength(2);
  });

  it('a product URL keeps its own parameters, with a single ?', () => {
    const href = buildStoreLink(`${STORE_URL}/products/lente?variant=1`, 'recomendacion-1', {});
    expect(href.split('?')).toHaveLength(2);
    expect(new URL(href).pathname).toBe('/products/lente');
    expect(params(href)).toEqual({ variant: '1', ...DEFAULT_UTM, utm_content: 'recomendacion-1' });
  });

  it('a utm_* already in the target is overwritten, never duplicated', () => {
    const href = buildStoreLink(`${STORE_URL}/products/lente?utm_source=old&utm_content=old`, 'recomendacion-2', {});
    expect(new URL(href).searchParams.getAll('utm_source')).toEqual(['landing']);
    expect(new URL(href).searchParams.getAll('utm_content')).toEqual(['recomendacion-2']);
    const forwarded = buildStoreLink(`${STORE_URL}/?utm_source=old`, 'header-tienda', { utm_source: 'instagram' });
    expect(new URL(forwarded).searchParams.getAll('utm_source')).toEqual(['instagram']);
  });
});

describe('catalog', () => {
  it.each(CATALOG.map((p) => [p.id, p.storeUrl]))('%s lives on the store origin', (_id, storeUrl) => {
    expect(new URL(storeUrl).origin).toBe(new URL(STORE_URL).origin);
  });
});
