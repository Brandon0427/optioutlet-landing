/**
 * Script of the consultation with Opti (es-MX): every sentence Opti says,
 * the quick-reply options, the free-text keywords and the recommendation
 * reasons. Single source for the scripted provider and `recommend()`.
 * Source of truth for questions and options: docs/mockup/optioutlet-mockup.dc.html.
 *
 * Plain TypeScript: no React, no DOM.
 *
 * Keywords are written normalized (lowercase, no accents, no punctuation) and
 * match whole words. When two matched keywords overlap ("no" inside "no se"),
 * the longer one wins.
 */
import type { Astigmatism, Experience, Frequency, Prescription, Routine } from '../consulta/types';
import { MASCOT_NAME } from './landing';

export type ScriptOption<V extends string> = {
  /** Stable quick-reply id; also the profile value. */
  value: V;
  label: string;
  keywords: string[];
};

export type ScriptQuestion<V extends string> = {
  text: string;
  /** Short clarification shown before repeating the question when free text doesn't match. */
  clarify: string;
  options: ScriptOption<V>[];
};

type Questions = {
  experience: ScriptQuestion<Experience>;
  routine: ScriptQuestion<Routine>;
  frequency: ScriptQuestion<Frequency>;
  astigmatism: ScriptQuestion<Astigmatism>;
  prescription: ScriptQuestion<Prescription>;
};

export type ConsultaScript = {
  greeting: string;
  questions: Questions;
  /** Answer when the user asks about their power, base curve or axis. Never gives values. */
  prescriptionValues: { answer: string; terms: string[]; questionWords: string[] };
  /** Symptoms stop the consultation. */
  refer: { message: string; keywords: string[] };
  done: { message: string };
  notes: { prescriptionExpired: string; astigmatismUnsure: string };
  reasons: {
    routine: Record<Routine, string>;
    frequency: Record<Frequency, string>;
    astigmatism: string;
    firstTime: string;
    lead: string;
    fallback: string;
    alternative: { daily: string; biweekly: string; monthly: string };
  };
};

export const consultaScript: ConsultaScript = {
  greeting: `Hola, soy ${MASCOT_NAME}. Te haré cinco preguntas para conocer tu rutina y recomendarte lentes de contacto. Tú pones la receta; yo te ayudo a elegir.`,

  questions: {
    experience: {
      text: 'Para empezar, ¿ya usas lentes de contacto?',
      clarify: 'Para esta pregunta me sirve saber si ya los usas o si sería tu primera vez.',
      options: [
        {
          value: 'experienced',
          label: 'Sí, ya los uso',
          keywords: ['si', 'ya los uso', 'ya uso', 'los uso', 'uso lentes', 'si los uso', 'claro', 'desde hace', 'tengo experiencia', 'ya los he usado', 'ya he usado'],
        },
        {
          value: 'first-time',
          label: 'Sería mi primera vez',
          keywords: ['no', 'primera', 'primera vez', 'nunca', 'nunca los he usado', 'no los he usado', 'no he usado', 'no los uso', 'todavia no', 'aun no'],
        },
      ],
    },
    routine: {
      text: '¿Cómo es un día normal para ti?',
      clarify: 'Cuéntame si pasas el día frente a pantallas, afuera y en movimiento, o un poco de todo.',
      options: [
        {
          value: 'office-screens',
          label: 'Oficina y computadora',
          keywords: ['oficina', 'computadora', 'compu', 'pantalla', 'pantallas', 'escritorio', 'laptop', 'home office', 'trabajo en casa', 'estudio', 'escuela', 'celular'],
        },
        {
          value: 'outdoors-active',
          label: 'Afuera y en movimiento',
          keywords: ['afuera', 'aire libre', 'movimiento', 'deporte', 'deportes', 'ejercicio', 'correr', 'corro', 'gym', 'gimnasio', 'calle', 'campo', 'manejo', 'camino', 'en la calle'],
        },
        {
          value: 'mixed',
          label: 'Un poco de todo',
          keywords: ['un poco de todo', 'de todo', 'mixto', 'ambos', 'ambas', 'las dos', 'los dos', 'combinado', 'depende', 'varia'],
        },
      ],
    },
    frequency: {
      text: '¿Cada cuánto los usarías?',
      clarify: 'Dime si los usarías todos los días, algunos días a la semana o solo en ocasiones especiales.',
      options: [
        {
          value: 'daily',
          label: 'Todos los días',
          keywords: ['todos los dias', 'diario', 'a diario', 'diariamente', 'cada dia', 'siempre', 'toda la semana', 'todo el tiempo', 'diarios'],
        },
        {
          value: 'some-days',
          label: 'Algunos días a la semana',
          keywords: ['algunos dias', 'algunos', 'unos dias', 'varios dias', 'a veces', 'fin de semana', 'fines de semana', 'entre semana', 'dos dias', 'tres dias', 'cuatro dias', 'algunas veces'],
        },
        {
          value: 'occasional',
          label: 'Solo en ocasiones especiales',
          keywords: ['ocasiones', 'ocasion', 'especiales', 'especial', 'eventos', 'evento', 'fiestas', 'fiesta', 'bodas', 'de vez en cuando', 'rara vez', 'casi nunca', 'para salir'],
        },
      ],
    },
    astigmatism: {
      text: '¿Tu receta indica astigmatismo? Suele aparecer como cilindro (CYL) y eje.',
      clarify: 'Revisa tu receta: me basta con saber si dice astigmatismo (cilindro o CYL), si no lo dice o si no estás seguro.',
      options: [
        {
          value: 'yes',
          label: 'Sí',
          keywords: ['si', 'si tengo', 'tengo astigmatismo', 'con astigmatismo', 'cilindro', 'cyl', 'torico', 'toricos', 'si indica', 'si dice'],
        },
        {
          value: 'no',
          label: 'No',
          keywords: ['no', 'no tengo', 'no tengo astigmatismo', 'sin astigmatismo', 'no indica', 'no dice', 'nada de astigmatismo'],
        },
        {
          value: 'unsure',
          label: 'No estoy seguro',
          keywords: ['no se', 'no lo se', 'no estoy seguro', 'no estoy segura', 'no recuerdo', 'no me acuerdo', 'ni idea', 'creo que si', 'creo que no', 'tal vez', 'quiza', 'quizas', 'puede ser', 'no entiendo mi receta'],
        },
      ],
    },
    prescription: {
      text: 'Última pregunta: ¿tienes una receta vigente de lentes de contacto?',
      clarify: 'Me sirve saber si tu receta es reciente, o si ya venció o no tienes una.',
      options: [
        {
          value: 'current',
          label: 'Sí, es reciente',
          keywords: ['si', 'si tengo', 'reciente', 'es reciente', 'vigente', 'actualizada', 'al dia', 'nueva', 'este ano', 'hace poco', 'la tengo', 'tengo receta'],
        },
        {
          value: 'expired-or-none',
          label: 'No, o no tengo receta',
          keywords: ['no', 'no tengo', 'no tengo receta', 'no la tengo', 'ya no', 'vencida', 'caducada', 'expirada', 'vieja', 'antigua', 'no esta vigente', 'hace mucho', 'no es reciente', 'perdi'],
        },
      ],
    },
  },

  prescriptionValues: {
    answer:
      'Tu graduación, la curva base y el eje vienen de tu receta: yo no los calculo ni los sugiero. Si tienes dudas sobre esos datos, pregúntale a tu especialista. Sigamos con tu rutina.',
    terms: ['graduacion', 'graduado', 'dioptria', 'dioptrias', 'curva base', 'curva', 'eje', 'potencia', 'aumento', 'medida', 'miopia', 'hipermetropia'],
    questionWords: ['que', 'cual', 'cuales', 'cuanto', 'cuanta', 'cuantas', 'cuantos', 'como', 'sabes', 'dime', 'calcula', 'calculas', 'necesito', 'tengo que', 'deberia', 'recomiendas'],
  },

  refer: {
    message:
      'Gracias por contarme. Lo que describes conviene revisarlo con un especialista en salud visual antes de usar o comprar lentes de contacto, así que aquí detengo la consulta. Si traes lentes puestos y te molestan, retíralos. Cuando te revisen, con gusto te ayudo a elegir.',
    keywords: [
      'ojo rojo', 'ojos rojos', 'rojo', 'rojos', 'roja', 'enrojecido', 'enrojecidos', 'irritado', 'irritados', 'irritacion',
      'dolor', 'duele', 'duelen', 'arde', 'arden', 'ardor', 'comezon', 'pica', 'pican', 'picazon',
      'vision borrosa', 'veo borroso', 'borroso', 'borrosa', 'secrecion', 'laganas', 'pus',
      'infeccion', 'infectado', 'infectados', 'inflamado', 'inflamados', 'inflamacion', 'hinchado', 'hinchados',
      'lagrimeo', 'molestia', 'molestias', 'fotofobia', 'sensibilidad a la luz', 'conjuntivitis', 'orzuelo', 'sangre', 'golpe',
    ],
  },

  done: {
    message: 'Listo. Con lo que me contaste, estos son los lentes que te recomiendo.',
  },

  notes: {
    prescriptionExpired:
      'Tu receta ya no está vigente o no la tienes. Agenda una revisión antes de comprar; te dejo estas opciones para que las platiques con tu especialista.',
    astigmatismUnsure: 'Revisa tu receta: si tiene valores de cilindro (CYL) y eje, necesitas lentes para astigmatismo.',
  },

  reasons: {
    routine: {
      'office-screens': 'pasas buena parte del día frente a la computadora',
      'outdoors-active': 'pasas el día afuera y en movimiento',
      mixed: 'tu día combina pantallas y movimiento',
    },
    frequency: {
      daily: 'los usarías todos los días',
      'some-days': 'los usarías solo algunos días',
      occasional: 'los quieres para ocasiones especiales',
    },
    astigmatism: 'tu receta indica astigmatismo',
    firstTime: 'sería tu primera vez',
    lead: 'Porque',
    fallback: 'Por lo que me contaste de tu rutina.',
    alternative: {
      daily: 'Si prefieres no usar estuche ni solución: abres un par nuevo cada día.',
      biweekly: 'Si prefieres un par que dure dos semanas y no te molesta limpiarlos con solución cada noche.',
      monthly: 'Si prefieres un par que dure un mes y no te molesta limpiarlos con solución cada noche.',
    },
  },
};

