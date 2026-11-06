/**
 * Every user-visible string on the landing lives here (es-MX).
 * Source of truth: docs/mockup/optioutlet-mockup.dc.html.
 * Components never hard-code copy; they read from `landing`.
 */

import type { LensDesign, Material, Replacement } from '../consulta/catalog';

/** Mascot name. Change it here and nowhere else. */
export const MASCOT_NAME = 'Opti';

export const STORE_URL = 'https://shop.optioutlet.com.mx';

const BRAND_NAME = 'Optioutlet';

// ─── Types ────────────────────────────────────────────────────────────────

export type Link = { label: string; href: string; external?: boolean };

export type Step = { title: string; body: string };

export type PhoneBubble = { from: 'opti' | 'user'; text: string };

export type PhoneScreen = {
  bubbles: PhoneBubble[];
  chips?: string[];
  product?: { photo: string; name: string; tag: string };
  cta?: string;
};

export type Profile = {
  title: string;
  question: string;
  answer: string;
  product: string;
};

export type LandingContent = {
  meta: { brandName: string; wordmark: string; mascotLabel: string; newTabHint: string };
  header: {
    homeLabel: string;
    navLabel: string;
    links: Link[];
    cta: Link;
  };
  hero: {
    title: string;
    body: string;
    primaryCta: Link;
    secondaryCta: Link;
    seal: string;
  };
  reveal: {
    caption: string;
    title: string;
    body: string;
  };
  howItWorks: {
    title: string;
    steps: Step[];
    phone: {
      contactName: string;
      screens: [PhoneScreen, PhoneScreen, PhoneScreen];
    };
  };
  profiles: {
    title: string;
    body: string;
    askLabel: string;
    lookLabel: string;
    items: Profile[];
  };
  consulta: {
    title: string;
    body: string;
    note: string;
    chat: {
      name: string;
      role: string;
      progressLabel: (current: number, total: number) => string;
      doneLabel: string;
      pausedLabel: string;
      typingLabel: string;
      inputLabel: string;
      inputPlaceholder: string;
      send: string;
      restart: string;
      retry: string;
      logLabel: string;
      quickRepliesLabel: string;
      /** Keyed by `ConsultaError` (useConsulta.ts). */
      errors: { provider: string; 'invalid-turn': string };
    };
    result: {
      listLabel: string;
      notesLabel: string;
      firstLabel: string;
      secondLabel: string;
      photo: string;
      price: string;
      storeCta: string;
      tags: {
        replacement: Record<Replacement, string>;
        material: Record<Material, string>;
        design: Record<LensDesign, string>;
      };
    };
  };
  receta: {
    seal: string;
    title: string;
    points: string[];
  };
  storeCta: {
    title: string;
    body: string;
    primaryCta: Link;
    secondaryCta: Link;
    ribbon: string;
  };
  footer: {
    navLabel: string;
    links: Link[];
    copyright: string;
  };
};

// ─── Content ──────────────────────────────────────────────────────────────

const consultaLink: Link = { label: 'Empezar mi consulta', href: '#consulta' };

export const landing: LandingContent = {
  meta: {
    brandName: BRAND_NAME,
    wordmark: 'optioutlet',
    mascotLabel: `${MASCOT_NAME}, la mascota de ${BRAND_NAME}`,
    newTabHint: '(se abre en una pestaña nueva)',
  },

  header: {
    homeLabel: `${BRAND_NAME}, inicio`,
    navLabel: 'Principal',
    links: [
      { label: 'Cómo funciona', href: '#como' },
      { label: 'Tienda', href: STORE_URL, external: true },
    ],
    cta: consultaLink,
  },

  hero: {
    title: 'Cuéntanos cómo vives y te decimos qué lentes van contigo.',
    body: `${MASCOT_NAME}, nuestro asistente, te hace cinco preguntas sobre tu día a día y te recomienda lentes de contacto de nuestro catálogo. Tú traes la receta; nosotros te ayudamos a elegir.`,
    primaryCta: consultaLink,
    secondaryCta: { label: 'Prefiero ir directo a la tienda', href: STORE_URL, external: true },
    seal: `CONSULTA CON ${MASCOT_NAME.toUpperCase()} • TODO PARA VER BIEN • CONSULTA CON ${MASCOT_NAME.toUpperCase()} • TODO PARA VER BIEN •`,
  },

  reveal: {
    caption: `Sigue bajando para conocer a ${MASCOT_NAME}`,
    title: 'Antes de recomendarte algo, queremos conocerte.',
    body: `Soy ${MASCOT_NAME}. Te haré unas preguntas sobre cómo vives, no sobre qué quieres comprar.`,
  },

  howItWorks: {
    title: 'Así funciona tu consulta',
    steps: [
      {
        title: `Platicas con ${MASCOT_NAME}`,
        body: 'Responde con un toque o escríbele como le escribirías a alguien en la tienda.',
      },
      {
        title: `${MASCOT_NAME} conoce tu rutina`,
        body: 'Pantallas, actividad, cada cuánto los usarías y lo que dice tu receta.',
      },
      {
        title: 'Recibes tu recomendación',
        body: 'Lentes de nuestro catálogo que encajan contigo, con la razón de cada uno.',
      },
    ],
    phone: {
      contactName: MASCOT_NAME,
      screens: [
        {
          bubbles: [
            { from: 'opti', text: `Hola, soy ${MASCOT_NAME}. ¿Te ayudo a encontrar tus lentes de contacto?` },
            { from: 'opti', text: 'Puedes tocar una opción o escribirme.' },
          ],
          chips: ['Sí, empecemos'],
        },
        {
          bubbles: [
            { from: 'opti', text: '¿Cómo es un día normal para ti?' },
            { from: 'user', text: 'Oficina y computadora' },
            { from: 'opti', text: '¿Cada cuánto los usarías?' },
          ],
          chips: ['Todos los días', 'Algunos días'],
        },
        {
          bubbles: [
            { from: 'opti', text: 'Listo. Por tus horas de pantalla, estos son los que te recomiendo.' },
          ],
          product: { photo: 'Foto del producto', name: '[Producto J&J]', tag: 'Reemplazo diario' },
          cta: 'Ver en la tienda',
        },
      ],
    },
  },

  profiles: {
    title: 'Tu día dice mucho de tus lentes',
    body: `Algunas de las cosas que ${MASCOT_NAME} toma en cuenta antes de recomendarte algo.`,
    askLabel: `${MASCOT_NAME} pregunta`,
    lookLabel: 'Lo que buscamos para ti',
    items: [
      {
        title: 'Ocho horas frente a la pantalla',
        question: '¿Cuántas horas al día pasas frente a una computadora?',
        answer: 'Materiales que conservan la humedad y dejan pasar más oxígeno, como la silicona hidrogel.',
        product: '[Producto J&J]',
      },
      {
        title: 'Siempre en movimiento',
        question: '¿Haces deporte o pasas el día afuera?',
        answer: 'Desechables diarios: un par nuevo cada mañana, sin estuche ni solución.',
        product: '[Producto J&J]',
      },
      {
        title: 'Solo para ocasiones especiales',
        question: '¿Cada cuánto los usarías?',
        answer: 'Diarios, para abrir un par solo los días que los necesitas.',
        product: '[Producto J&J]',
      },
      {
        title: 'Mi receta dice astigmatismo',
        question: '¿Tu receta tiene valores de cilindro y eje?',
        answer: 'Lentes tóricos, diseñados para mantenerse en la posición correcta.',
        product: '[Producto J&J]',
      },
      {
        title: 'Primera vez con lentes de contacto',
        question: '¿Ya los has usado antes?',
        answer: 'Opciones fáciles de manejar, y el recordatorio de pedirle a tu especialista una prueba de adaptación.',
        product: '[Producto J&J]',
      },
    ],
  },

  consulta: {
    title: 'Empieza tu consulta',
    body: `Cinco preguntas sobre tu rutina. Al final, ${MASCOT_NAME} te muestra los lentes que encajan contigo y te explica por qué.`,
    note: 'Ten a la mano tu receta: datos como el astigmatismo vienen de ahí.',
    chat: {
      name: MASCOT_NAME,
      role: `Asistente de ${BRAND_NAME}`,
      progressLabel: (current, total) => `Pregunta ${current} de ${total}`,
      doneLabel: 'Listo',
      pausedLabel: 'Consulta en pausa',
      typingLabel: `${MASCOT_NAME} está escribiendo`,
      inputLabel: 'Escribe tu respuesta',
      inputPlaceholder: `O escríbele a ${MASCOT_NAME} con tus palabras`,
      send: 'Enviar',
      restart: 'Volver a empezar',
      retry: 'Reintentar',
      logLabel: `Conversación con ${MASCOT_NAME}`,
      quickRepliesLabel: 'Opciones de respuesta',
      errors: {
        provider: `No pude recibir la respuesta de ${MASCOT_NAME}. Revisa tu conexión e inténtalo de nuevo; no perderás lo que ya contestaste.`,
        'invalid-turn': `La respuesta de ${MASCOT_NAME} llegó incompleta. Inténtalo de nuevo; no perderás lo que ya contestaste.`,
      },
    },
    result: {
      listLabel: 'Lentes recomendados',
      notesLabel: 'Avisos',
      firstLabel: 'Mi primera opción para ti',
      secondLabel: 'También te puede funcionar',
      photo: 'Foto del producto',
      price: '[PRECIO]',
      storeCta: 'Ver en la tienda',
      tags: {
        replacement: { daily: 'Reemplazo diario', biweekly: 'Reemplazo cada 2 semanas', monthly: 'Reemplazo mensual' },
        material: { 'silicone-hydrogel': 'Silicona hidrogel', hydrogel: 'Hidrogel' },
        design: { spherical: 'Esférico', toric: 'Para astigmatismo', multifocal: 'Multifocal' },
      },
    },
  },

  receta: {
    seal: 'TU RECETA PRIMERO • TU RECETA PRIMERO • TU RECETA PRIMERO •',
    title: `${MASCOT_NAME} te orienta. Tu especialista te receta.`,
    points: [
      `${MASCOT_NAME} no calcula ni sugiere tu graduación. Esos datos vienen de tu receta.`,
      'Si tu receta ya no está vigente, te sugerirá una revisión antes de comprar.',
      'Si le cuentas de molestias como ojo rojo, dolor o visión borrosa, te pedirá que consultes a un profesional.',
    ],
  },

  storeCta: {
    title: '¿Ya sabes cuáles quieres?',
    body: 'Todo nuestro catálogo de lentes de contacto está en la tienda.',
    primaryCta: { label: 'Ir a la tienda', href: STORE_URL, external: true },
    secondaryCta: consultaLink,
    ribbon: 'TODO PARA VER BIEN • TODO PARA VER BIEN •',
  },

  footer: {
    navLabel: 'Legal y contacto',
    links: [
      { label: 'Aviso de privacidad', href: '#' },
      { label: 'Términos y condiciones', href: '#' },
      { label: 'Contacto', href: '#' },
    ],
    copyright: `© 2026 ${BRAND_NAME}`,
  },
};
