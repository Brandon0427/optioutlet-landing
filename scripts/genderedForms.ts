/**
 * Detects gendered forms that address the customer (or that the customer says
 * about themselves in a quick reply). Opti doesn't know who it is talking to,
 * so it must use gender-neutral Spanish: "te doy la bienvenida", "¿todo
 * listo?", "si tienes dudas", "si es tu primera vez".
 *
 * Interjections that describe the consultation, not the person ("Listo. Con
 * lo que me contaste…", "¿Todo listo?"), are neutral and allowed.
 */

const ADJECTIVES = '(?:list|segur|interesad|cansad|preparad|convencid|decidid|tranquil|c[oó]mod|content|encantad|nuev|primeriz|solter|casad)[oa]s?';
const SECOND_PERSON = '(?:est[aá]s|eres|te sientes|te ves|te notas|te encuentras|quedas|quedaste|sigues|andas)';
const FIRST_PERSON = '(?:estoy|soy|me siento|ando|sigo)';
const DEGREE = '(?:\\s+(?:muy|m[aá]s|tan|bien|del todo|completamente|realmente))?';

const PATTERNS: [string, RegExp][] = [
  // "bienvenida" as a noun ("te doy la bienvenida") is neutral.
  ['bienvenido/a', /\bbienvenidos?\b|(?<!\bla\s)\bbienvenidas?\b/i],
  ['primerizo/a', /\bprimeriz[oa]s?\b/i],
  ['adjetivo con género dirigido al cliente', new RegExp(`\\b${SECOND_PERSON}${DEGREE}\\s+${ADJECTIVES}\\b`, 'i')],
  ['adjetivo con género del cliente sobre sí', new RegExp(`\\b(?:no\\s+)?${FIRST_PERSON}${DEGREE}\\s+${ADJECTIVES}\\b`, 'i')],
  ['pregunta con género (¿listo?, ¿segura?)', new RegExp(`¿\\s*${ADJECTIVES}\\s*\\?`, 'i')],
];

/** Labels of the gendered forms found in `text` (empty = neutral). */
export function genderedForms(text: string): string[] {
  return PATTERNS.filter(([, re]) => re.test(text)).map(([label]) => label);
}
