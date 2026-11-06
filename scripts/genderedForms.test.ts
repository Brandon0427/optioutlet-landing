import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT } from '../server/consulta/prompt.js';
import { consultaScript } from '../src/content/consulta.js';
import { landing } from '../src/content/landing.js';
import { genderedForms } from './genderedForms.js';

/** Every string in a value, skipping free-text `keywords` (what the customer may type). */
function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => (k === 'keywords' ? [] : strings(v, path ? `${path}.${k}` : k)));
  }
  return [];
}

describe('genderedForms', () => {
  it.each([
    'Perfecto, bienvenido.',
    '¡Bienvenida a Optioutlet!',
    '¿Estás listo para la siguiente pregunta?',
    'Si no estás seguro, revisa tu receta.',
    'Si no estás muy segura, revisa tu receta.',
    'Como eres primeriza, te recomiendo…',
    '¿Lista?',
    'No estoy seguro',
    '¿Te sientes cómoda con tus lentes?',
    'Veo que estás interesado en los diarios.',
  ])('flags "%s"', (text) => {
    expect(genderedForms(text)).not.toEqual([]);
  });

  it.each([
    'Listo. Con lo que me contaste, estos son los lentes que te recomiendo.',
    '¿Todo listo? Sigamos.',
    'Te doy la bienvenida.',
    'Si tienes dudas, revisa tu receta.',
    'Si es tu primera vez, los diarios son más sencillos.',
    'No lo sé',
    'Es seguro usarlos todos los días si sigues las indicaciones de tu especialista.',
    'Silicona hidrogel: cómodo en jornadas largas.',
  ])('allows "%s"', (text) => {
    expect(genderedForms(text)).toEqual([]);
  });
});

describe('static texts are gender-neutral', () => {
  it('the consultation script (everything Opti says and every quick reply)', () => {
    const found = strings(consultaScript).filter((s) => genderedForms(s.text).length > 0);
    expect(found).toEqual([]);
  });

  it('the landing texts', () => {
    const found = strings(landing).filter((s) => genderedForms(s.text).length > 0);
    expect(found).toEqual([]);
  });

  it('the system prompt asks for neutral language and does not model gendered forms itself', () => {
    expect(SYSTEM_PROMPT).toContain('lenguaje neutro en género');
    // The rule itself lists the forms to avoid; everything else must be neutral.
    const rest = SYSTEM_PROMPT.split('\n').filter((line) => !line.includes('lenguaje neutro en género'));
    expect(rest.filter((line) => genderedForms(line).length > 0)).toEqual([]);
  });
});
