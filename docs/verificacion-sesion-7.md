# Verificación · Sesión 7 — Narrativa de marca, indicación de scroll y listón

El objetivo es que quien llegue por primera vez entienda en un vistazo quiénes
somos y qué vendemos, que Opti tenga una presentación propia, que nadie se
quede sin saber que hay que bajar, y que el listón del cierre se vea completo
en todo momento.

Principio rector: **menos texto visual, la misma página.** Cambian palabras,
se agregan los badges y la indicación de scroll, y el listón cambia su lógica.
El motor de scroll, los pines y el resto de las secciones se comportan igual.

Referencia: `docs/mockup/optioutlet-mockup.dc.html` (versión nueva, en el
commit de la Fase 2). Todo texto nuevo vive en `src/content/landing.ts`.

## 1. Qué cambió

| Fase | Commit | Qué |
|---|---|---|
| 2 · Hero | `fa2d5f9` | Título y párrafo nuevos; badges “+100 mil ventas” y “Envío a todo México”; fila “También en” con `MarketplaceLogos` (`TODO(brand-logos)`). Título a `clamp(34px, 4.2vw, 58px)` con interlineado 1.06. |
| 3 · Revelación | `b4adc64` | Antetítulo “¿No sabes cuáles elegir?”, “Conoce a Opti.” y el párrafo nuevo. Debajo de “Sigue bajando para conocer a Opti”, un mouse con ruedita y dos flechas, animados solo con CSS. |
| 4 · Listón | `a112ff0` | Banda continua: 4 repeticiones de 420 unidades (`textLength`), desplazamiento de −420 a 0 con el progreso de su sección. B1 cerrada. |
| 5 · Metadatos | `bbed577` | `<title>`, meta description, `og:title` y `og:description`. |
| 5 · Docs | (el commit de este documento) | Guion de la demo, backlog, README y este documento. |

Archivos: `src/content/landing.ts`, `src/sections/Hero.tsx`,
`src/components/brand/MarketplaceLogos.tsx`, `src/sections/PupilReveal.tsx`,
`src/styles/index.css`, `src/components/brand/Ribbon.tsx`,
`src/sections/StoreCta.tsx`, `index.html`. Pruebas nuevas:
`src/sections/__tests__/hero.test.tsx` y
`src/components/brand/__tests__/ribbon.test.tsx`. `npm run check`: 18
archivos, 273 pruebas.

## 2. Cómo verificarlo

1. Abre https://optioutlet.com.mx/?demo=1. El hero dice “Lentes para cada
   forma de ver.”, tiene los dos badges y la fila “También en” con los
   nombres de Mercado Libre, Amazon y Liverpool como texto en pastillas de
   borde sólido.
2. Baja un poco: en la revelación, debajo de la pupila, aparece “Sigue bajando
   para conocer a Opti” con un mouse cuya ruedita baja y se desvanece, y dos
   flechas que se encienden una tras otra (azul marino y verde agua).
3. Sigue bajando hasta que la pupila cubra la pantalla: “¿No sabes cuáles
   elegir?”, “Conoce a Opti.” y el párrafo, completos.
4. Baja hasta el cierre: el listón corre como una banda continua, sin tramos
   vacíos, mientras la sección cruza la pantalla.
5. DevTools → Consola, recorre toda la página: cero errores.
6. Con “Reducir movimiento” prendido, la revelación se ve estática (como
   antes) y el listón queda quieto a la mitad, sin huecos.
7. La pestaña dice “Optioutlet — Todo para ver bien”.

## 3. Hallazgos de la Fase 1

- **Textos:** todos en `landing.ts`. El título del hero era
  `clamp(40px, 5.2vw, 72px)`, interlineado 1.04. “Sigue bajando para conocer a
  Opti” ya existía (`reveal.caption`). Opacidad 1 → 0 en el primer 20 % del
  pin; en la versión estática, opacidad 0.
- **Diff del mockup:** título, párrafo, badges, fila de tiendas (con recuadros
  punteados y corchetes, que no se portan por la decisión 4), indicación de
  scroll (`ooWheel`, `ooChev`), textos de la revelación, listón con
  `textLength="1680"` y progreso propio de la sección (`pC`), y el `<title>`.
- **Listón:** su progreso **ya dependía solo de su sección**
  (`top bottom` → `clamp(bottom top)`). La decisión 10 se cumplía y se
  conserva. Trazado `getTotalLength` = 825.62. Texto anterior: 2 repeticiones
  con 702.9 de largo natural, centrado o de 0 a L − T. Dejaba **122 unidades
  vacías** en un extremo al inicio y al final del recorrido.
- **Causa de B1:** el plugin `attr` de GSAP
  (`node_modules/gsap/gsap-core.js`, `init`) guarda como valor inicial
  `getAttribute('startOffset') || ""`. El `<textPath>` se montaba sin
  `startOffset` en modo animado: `StoreCta` marcaba `data-animated` en su
  layout effect antes del centrado de `Ribbon`. Cada vez que ScrollTrigger
  revertía el tween (`invalidateOnRefresh` en cada `refresh`), escribía
  `startOffset=""`. Mensaje: `Error: <textPath> attribute startOffset:
  Unexpected end of attribute. Expected length, "".`, desde `render` del
  plugin. **21 al cargar y 24 en un recorrido completo** (1440 × 800 y
  375 × 812).
- **Lenguaje neutro:** ningún texto nuevo lo marca `genderedForms`.
  `scripts/genderedForms.test.ts` recorre todo `landing`.
- **Metadatos anteriores:** “Optioutlet — Consulta con Opti” y la
  description “Opti, el asistente de Optioutlet, te hace unas preguntas…”.

## 4. Geometría

`.cache/qa-s5/geom.mjs` con `?demo=1` a 375 × 812, 768 × 1024, 1440 × 800 y
1470 × 956. El criterio (`.cache/qa-s7/geomcmp.mjs`):

- La duración de cada pin, la altura de las demás secciones y el modo
  compacto no cambian más de 1 px.
- El inicio de cada pin y de cada sección se mueve lo mismo que el hero
  (±1 px).

Base: producción antes de la sesión. Después: build de la Fase 4.

| Tamaño | Altura del hero | Pines: inicio, duración | Modo compacto |
|---|---|---|---|
| 375 × 812 | 1199 → 1236 (+37) | revelación 1271 → 1308, 1200 → 1200; cómo 3211 → 3248, 1500 → 1500 | sí → sí |
| 768 × 1024 | 1159 → 1186 (+27) | revelación 1231 → 1258, 1200 → 1200; cómo 3383 → 3410, 1500 → 1500; perfiles 5835 → 5862, 1429 → 1429 | sí → sí |
| 1440 × 800 | 812 → 764 (−48) | revelación 884 → 836, 1200 → 1200; cómo 2812 → 2764, 1500 → 1500; perfiles 5040 → 4992, 936 → 936 | no → no |
| 1470 × 956 | 812 → 764 (−48) | revelación 884 → 836, 1200 → 1200; cómo 2968 → 2920, 1500 → 1500; perfiles 5352 → 5304, 936 → 936 | no → no |

- Las Fases 3 y 4 no movieron nada (0 px contra la fase anterior).
- La altura del documento se movió lo mismo que el hero (±1).
- La geometría de producción después de cada push coincide con la local
  (93 números, 0 diferencias de más de 1 px).

## 5. Contraste del hero (decisión 6)

`.cache/qa-s7/contrast.mjs`: se ocultan los textos (color transparente,
íconos ocultos), se captura el gradiente y se busca el píxel que da la
**relación más baja** dentro de las cajas de línea de cada texto. Cada ancho
tiene 10 condiciones (8 en 375):

- **Scroll:** al inicio (scroll 0) y a punto de salir (el fondo del hero 40 px
  debajo del header). En el segundo caso, los triggers se congelan con
  `disable(false)` y la página vuelve arriba, para medir el gradiente de
  salida bajo el texto real.
- **Cursor:** en 768 y 1440, las cuatro esquinas y el centro del hero. En 375
  (táctil) no hay cursor: se toman 4 muestras de la mirada en reposo, a
  3.2 s de distancia.

| Texto | Tamaño | Peor en 375 | Peor en 768 | Peor en 1440 | Umbral |
|---|---|---|---|---|---|
| Título | 34–58 px / 600 | 7.62 (inicio, mirada) | 7.51 (inicio, ↖) | **4.84** (inicio, ↙) | 3:1 |
| Párrafo | 20 px | 6.67 | 6.57 | 6.30 | 4.5:1 |
| Badge “+100 mil ventas” (marino sobre blanco) | 15 px / 700 | 10.18 | 10.18 | 10.18 | 4.5:1 |
| Badge “Envío a todo México” | 15 px / 600 | 7.62 | 7.51 | 9.19 | 4.5:1 |
| Etiqueta “También en” (`#b2ddd5`) | 13 px / 600 | 6.12 | 6.29 | 7.48 | 4.5:1 |
| Tienda (peor de las tres, `#d6ecea`) | 11 px / 600 | 6.19 (Amazon) | **6.09** (Liverpool, salida, ↖) | 7.23 (Liverpool) | 4.5:1 |

Todo pasa AA. No hubo parada D. El caso más bajo del título (1440, cursor
abajo a la izquierda) cae al final de “forma de”, sobre la mancha clara.
Sigue arriba de 3:1, el umbral para texto de 24 px o más.

## 6. Revelación (decisión 9)

`.cache/qa-s7/reveal.mjs`, al final del pin (progreso 1):

| Tamaño | Escala de `fit()` | Párrafo efectivo | Margen libre arriba/abajo | Cortes o encimados |
|---|---|---|---|---|
| 375 × 667 | 1 | 20 px | 54 / 54 px | ninguno |
| 390 × 844 | 1 | 20 px | 143 / 143 px | ninguno |
| 768 × 1024 | 1 | 20 px | 281 / 281 px | ninguno |
| 1280 × 720 | 1 | 20 px | 117 / 117 px | ninguno |
| 1440 × 800 | 1 | 20 px | 154 / 154 px | ninguno |
| 1470 × 923 | 1 | 20 px | 216 / 216 px | ninguno |
| 375 × 667, estática | 1 | 20 px | 97 / 97 px | ninguno |
| 1440 × 800, estática | 1 | 20 px | 130 / 130 px | ninguno |

Ningún tamaño necesita escalar. Ningún párrafo queda por debajo de 14 px.
Capturas en `.cache/qa-s7/reveal-after-*.png`.

**Indicación de scroll** (`.cache/qa-s7/cue.mjs`, al inicio del pin, 375 y
1440):

- Con movimiento: `scroll-wheel` y `scroll-chev` corren en ciclos de 1.6 s y
  la segunda flecha va 0.25 s después. La ruedita baja hasta 13 px y se
  desvanece. La caja queda dentro del escenario: 80 px libres abajo en
  375 × 667.
- Con movimiento reducido: `animation-name: none`, ruedita y flechas a
  opacidad 1 y sin desplazamiento. El contenedor hereda la opacidad 0 del
  texto en la versión estática, como se acordó.

## 7. Listón (decisiones 10 a 12)

| Medida | Valor |
|---|---|
| Largo del trazado (`getTotalLength`) | 825.62 (analítico 240 + π·110 + 240 = 825.58) |
| Largo natural de “TODO PARA VER BIEN • ” | 348.1 (≤ 420, así que se queda el valor del mockup) |
| Largo fijo por repetición (`RIBBON_REPEAT_LENGTH`) | 420 |
| Repeticiones (`RIBBON_REPEATS`) | 4 → texto total 1680 ≥ 825.6 + 420 = 1245.6 |
| Recorrido | −420 → 0 (una repetición) |
| Reposo (estático y movimiento reducido) | −`RIBBON_REPEAT_LENGTH` / 2 = −210 |

Cobertura (`.cache/qa-s7/ribbon.mjs`; la distancia de cada glifo se proyecta
sobre el trazado con `getPointAtLength` cada 0.1 unidades). En 375 y 1440 se
obtuvieron los mismos valores (±0.3):

| Progreso | `startOffset` | Libre al inicio | Libre al final | Mayor hueco entre glifos | Glifos encimados |
|---|---|---|---|---|---|
| 0 | −420 | 3.3 | 2.5 | 3.5 | 0 |
| 0.25 | −315 | 11.6 | 5.7 | 3.5 | 0 |
| 0.5 | −210 | 0 | 8.5–8.7 | 3.5 | 0 |
| 0.75 | −105 | 6.7–7.0 | 12.0–12.3 | 3.5 | 0 |
| 1 | 0 | 0 | 5.8 | 3.5 | 0 |
| Reducido (fijo) | −210 | 0 | 8.7 | 3.5 | 0 |

- **Sin tramos vacíos:** lo libre en cada punta es como máximo 12.3
  unidades, menos de un glifo (el avance medio es de 20). `textPath` no dibuja
  un glifo cuyo centro cae fuera del trazado, así que **ningún glifo sale
  cortado por la punta**; ese residuo es el hueco hasta el siguiente glifo
  completo.
- **Sin encimados:** el final de cada glifo nunca pasa el inicio del
  siguiente. El espacio entre glifos es de 3.5 (2 de `letter-spacing` más el
  ajuste de `lengthAdjust="spacing"`: (420 − 348) / 21 ≈ 3.4).
- Capturas: `.cache/qa-s7/ribbon-1440-p075.png` y `ribbon-375-p075.png`.

**Errores de consola** (`.cache/qa-s7/console.mjs`: carga, recorrido completo
en pasos de 0.6 pantallas y regreso arriba; dominios Runtime y Log de CDP):

| | Antes (producción) | Después |
|---|---|---|
| 1440 × 800 | 21 al cargar, 24 en total | **0** |
| 375 × 812 | 24 en total | **0** |

## 8. Lighthouse

Lighthouse 13.5.0 con Chrome 157, en producción con `?demo=1`. Tres corridas
por formato, mediana.

| Formato | Momento | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| Móvil | Antes | 95 (97/90/95) | 100 | 96 | 100 |
| Móvil | Después | 96 (94/98/96) | 100 | **100** | 100 |
| Escritorio | Antes | 100 | 100 | 96 | 100 |
| Escritorio | Después | 100 | 100 | **100** | 100 |

| Métrica (mediana) | Móvil antes → después | Escritorio antes → después |
|---|---|---|
| FCP | 1,750 → 1,734 ms | 402 → 406 ms |
| LCP | 1,890 → 1,858 ms | 432 → 435 ms |
| TBT | 214 → 85 ms | 1 → 8 ms |
| CLS | 0.026 → 0.000 | 0.023 → 0.000 |
| Speed Index | 1,750 → 1,734 ms | 570 → 600 ms |

- **Buenas prácticas, de 96 a 100:** desaparece `errors-in-console`, que solo
  marcaba los errores del listón (B1).
- **Rendimiento:** la variación móvil es de red y de carga del equipo. Una
  corrida de “después” marcó FCP de 2.2 s y Speed Index de 4.4 s, pero la
  mediana mejora.

## 9. Lo que no se ve a simple vista

- **La banda tiene repeticiones fuera del trazado.** El texto mide 1680
  unidades y el trazado 825.6. Siempre hay texto antes y después de la U, que
  `textPath` no dibuja, para que al moverse nunca aparezca un tramo vacío.
- **El progreso del listón no depende del resto de la página:** va de 0
  cuando el cierre asoma por abajo a 1 cuando sale por arriba, o cuando la
  página llega al final si eso pasa antes. Cambiar la altura de otras
  secciones no cambia su recorrido.
- **El `startOffset` siempre es un número.** `Ribbon` lo renderiza en
  −REP/2, y por eso el revert de GSAP ya no escribe un atributo vacío (B1).
- **`MarketplaceLogos` usa los logos oficiales** desde el 2026-11-10 (sección
  14). Durante la sesión mostró los nombres como texto. Nunca se dibujó ni se
  aproximó un logo de terceros.
- **La indicación de scroll comparte el tween del texto:** está dentro del
  mismo contenedor que “Sigue bajando…”, así que aparece y se desvanece con
  él, sin tocar el timeline de la revelación.

## 10. Qué NO es defecto

- **El brazo derecho de la U sobresale por arriba de la sección del cierre.**
  A partir de 1024 px, el `overflow: hidden` de la sección recorta unas letras
  en esa orilla. Es el acomodo de siempre (posición, tamaño y rotación de
  `-14deg` del mockup), no lo cambió esta sesión y no es la punta del trazado.
  Si se quiere ver la punta completa, es un ajuste de posición que habría que
  decidir aparte.
- **En la versión estática de la revelación no se ve la indicación de
  scroll.** Así estaba el texto que acompaña (opacidad 0 en estático), y se
  acordó que la indicación lo herede.

## 11. Diferencias entre el prompt y el mockup (ganó el mockup)

- **Mínimo del título del hero:** el prompt pedía bajarlo “en la misma
  proporción” (40 × 58/72 ≈ 32 px). El mockup usa 34 px y quedó en 34 px
  (`clamp(34px, 4.2vw, 58px)`).
- **Posición del texto “Sigue bajando…”:** de `50% + 112px` a `50% + 104px`,
  como el mockup, ahora en columna con la indicación (gap de 12 px).
- **Pastillas de tiendas:** medidas del mockup (112 × 36, radio 10, borde
  1.5 px `rgba(255,255,255,0.55)`, texto de 11 px `#d6ecea`). Solo el borde
  pasó de punteado a sólido y se quitaron los corchetes (decisión 4).
- **Listón:** 420 por repetición y 4 repeticiones, como el mockup. El largo
  natural medido (348.1) es menor, así que no hizo falta ajustarlo.

## 12. Checklist final

- [x] El hero dice quiénes somos con el título, el párrafo, los dos badges y la fila “También en”.
- [x] Los nombres de las tiendas se ven como texto terminado y no hay logos dibujados.
- [x] Todo texto nuevo del hero cumple AA sobre el gradiente (peor caso: 4.84:1 en el título, 6.09:1 en texto chico).
- [x] La revelación presenta a Opti y su texto cabe en los seis tamaños (escala 1).
- [x] La indicación de scroll se anima y queda quieta con movimiento reducido.
- [x] El listón avanza con su propia sección y cubre todo el trazado en todo momento.
- [x] Cero errores de consola en un recorrido completo; B1 cerrada.
- [x] La duración de los pines, las demás secciones y el modo compacto no cambiaron.
- [x] Título de la pestaña, meta description y Open Graph actualizados.
- [x] Todo texto nuevo vive en `landing.ts`.
- [x] Lighthouse medido antes y después; el guion y este documento al día.
- [x] No se tocó el contrato, el servidor, la consulta, el catálogo, `vercel.json` ni ningún panel.
- [x] Ninguna fase cerró con «esto necesita su propia sesión».

## 13. Futuro (documentado, no implementado)

- Ajustes de redacción de la diseñadora sobre los textos nuevos: se cambian
  solo en `src/content/landing.ts`.
- Sesión 4: catálogo real de J&J.
- `og:image`, B4 y B5 (backlog).

## 14. Logos oficiales (2026-11-10, después del cierre)

Llegaron los logos oficiales y se resolvió `TODO(brand-logos)`.

- **Archivos:** `src/assets/brand/marketplaces/mercadolibre.svg`,
  `amazon.svg` y `liverpool.svg`, usados tal cual se entregaron, sin
  modificarlos. Se importan con `?no-inline`: `amazon.svg` pesa 3.77 kB y
  Vite lo habría incrustado como data URI por su límite de 4 KB. Así los tres
  salen como archivo con hash (`mercadolibre-BSOa5GMO.svg`,
  `amazon-PhULPKGW.svg`, `liverpool-yjk4W1UD.svg`).
- **Pastillas:** blancas, 112 × 44 px, radio 10, padding 0 14px, sin borde ni
  texto. `<img>` con `alt` desde `landing.hero.marketplaces.stores`. No son
  enlaces. La etiqueta “También en” no cambió.
- **Tamaños:** `width`/`height` en enteros con el tamaño final, `height: auto`,
  `max-width: 100%`.

  | Logo | Archivo | Tope de alto | Atributos | Dibujado | Proporción (dibujada / archivo) |
  |---|---|---|---|---|---|
  | Mercado Libre | 150.1 × 135.8 | 32 px | 35 × 32 | 35 × 31.7 | 1.106 / 1.103 |
  | Amazon | 2500 × 752 | 26 px | 84 × 25 | 84 × 25.3 | 3.325 / 3.324 |
  | Liverpool | 184 × 49 | 24 px | 84 × 22 | 84 × 22.4 | 3.757 / 3.755 |

  Amazon y Liverpool llegan primero al ancho útil de 84 px y se reducen desde
  ahí sin deformarse. Mercado Libre queda en 31.7 px porque manda su ancho
  entero (35).
- **Pruebas:** `hero.test.tsx` confirma exactamente tres `<img>` con `alt`
  igual a los nombres de `landing.ts` y `src` de archivo (no data URI),
  ningún `<svg>` en línea, ningún enlace y ningún corchete.
- **Geometría** (criterio de la Sección 4, contra la producción final de la
  sesión): 0 diferencias de duración, secciones y modo compacto.

  | Tamaño | Δ hero | Por qué |
  |---|---|---|
  | 375 × 812 | +16 px | La fila ocupa dos renglones: +8 px por cada uno |
  | 768 × 1024 | +8 px | Un renglón, pastillas 8 px más altas |
  | 1440 × 800 | 0 px | La altura del hero la define la columna del ojo |
  | 1470 × 956 | 0 px | Igual |

  Los inicios de cada pin se movieron exactamente lo mismo.
- **Capturas:** `.cache/qa-s7/logos-375.png` (dos renglones: Mercado Libre y
  Amazon arriba, Liverpool abajo) y `logos-1440.png` (un renglón).
- **Consola:** 0 errores.

- **Lighthouse** (producción con `?demo=1`, mediana de 3):

  | Formato | Rendimiento | Accesibilidad | Buenas prácticas | SEO | CLS |
  |---|---|---|---|---|---|
  | Móvil | 97 (97/98/95) | 100 | 100 | 100 | 0.000 |
  | Escritorio | 100 (100/100/85) | 100 | 100 | 100 | 0.000 |

  La corrida de 85 en escritorio tuvo un TBT de 280 ms. Fue ruido del equipo:
  las otras dos dieron 100 con el mismo bundle (`index-bmFCc-8u.js`).
- **Producción:** la geometría coincide con la local (93 números, 0
  diferencias de más de 1 px). Hay 0 errores de consola en el recorrido
  completo a 1440 y a 375, y `amazon-PhULPKGW.svg` responde 200
  `image/svg+xml`.

## 15. Listón: texto recortado a la banda (2026-11-10, después del cierre)

- **Defecto:** las letras que pasaban por un extremo de la U se dibujaban
  completas aunque la banda ya hubiera terminado, y sobresalían de la punta
  (se veía en producción, en el brazo izquierdo). Chrome solo descarta un
  glifo cuando su punto medio queda fuera del trazado, así que la mitad de una
  letra podía quedar fuera de la banda.
- **Cambio:** `Ribbon.tsx` recorta el `<text>` con un `<mask>` que dibuja la
  banda con la misma geometría: el mismo `d` (`RIBBON_PATH`), el mismo grosor
  (`RIBBON_BAND_WIDTH` = 60, también usado por la banda) y extremos `butt`, en
  blanco sobre un rectángulo negro (`maskUnits="userSpaceOnUse"`, todo el
  viewBox). La máscara se aplica al texto, no a la banda, y su id sale de
  `useId`. No cambian el desplazamiento, `RIBBON_REPEAT_LENGTH` ni
  `RIBBON_REPEATS`, la animación, ni el reposo en −REP / 2.
- **Pruebas:** `ribbon.test.tsx` comprueba que la máscara existe, que su
  trazado tiene el mismo `d` y grosor que la banda, con extremos `butt`, que
  el `<text>` la referencia y la banda no, y que dos listones tienen ids
  distintos.
- **Método (`.cache/qa-s7/ribbonmask.mjs`, build local con `?demo=1`):**
  1. En cada progreso se fija el scroll real y se lee el `startOffset` que
     escribió GSAP.
  2. El listón se pone en una pose de medición: completo dentro de la
     ventana, con el `overflow` de la sección apagado y el mismo offset
     reaplicado cuando el scrub ya asentó.
  3. Se toman tres capturas de la caja del SVG, que solo cambian la pintura
     del listón: fondo (todo transparente), texto en rojo puro y banda en
     verde puro.
  4. Píxel de texto: cambia entre el fondo y la captura del texto. Píxel
     fuera: es de texto y no cambia en la captura de la banda. Umbral
     estricto: cualquier diferencia cuenta.

  La misma medición sin la máscara (quitando el atributo) prueba que el
  método sí detecta el defecto.

  | Ancho | Progreso | Offset | Píxeles de texto | Fuera de la banda | Sin máscara |
  |---|---|---|---|---|---|
  | 375 | 0 | −420 | 4220 | **0** | 0 |
  | 375 | 0.25 | −315.2 | 4067 | **0** | 0 |
  | 375 | 0.5 | −210 | 4100 | **0** | 0 |
  | 375 | 0.75 | −105.2 | 4084 | **0** | 0 |
  | 375 | 1 | 0 | 4215 | **0** | 0 |
  | 1440 | 0 | −420 | 9099 | **0** | 0 |
  | 1440 | 0.25 | −314.9 | 8758 | **0** | 0 |
  | 1440 | 0.5 | −209.7 | 8794 | **0** | 0 |
  | 1440 | 0.75 | −105.1 | 8840 | **0** | 0 |
  | 1440 | 1 | 0 | 9098 | **0** | 0 |
  | 375, movimiento reducido | 0 y 1 | −210 | 4100 | **0** | 0 |
  | 1440, movimiento reducido | 0 y 1 | −210 | 8810 | **0** | 0 |

  En esos cinco puntos ninguna letra queda montada en una punta, por eso
  también da 0 sin la máscara. Por eso se agregó un **barrido** de todo el
  recorrido (−420 → 0, cada 2 unidades, 211 offsets):

  | Ancho | Con máscara: peor caso | Sin máscara: offsets con píxeles fuera | Sin máscara: peor caso |
  |---|---|---|---|
  | 375 | **0** | 106 de 211 | 125 px (offset −58) |
  | 1440 | **0** | 106 de 211 | 277 px (offset −56) |

  El atributo no se movió durante ninguna medición (0 desvíos).
- **Capturas** (pose de medición, ×4) en `.cache/qa-s7/mask-shots/`:
  `tip-<ancho>[-reduced]-p<0|1>-<left|right>.png`, las dos puntas de la U en
  los progresos 0 y 1, en 375 y 1440. El blanco que aparece arriba en algunas
  es la sección anterior: en la pose, la punta pasa del borde de la sección.
- **Cobertura** (`ribbon.mjs`): igual que en la Sección 7.
  - 40 o 41 glifos visibles; hueco máximo entre glifos de 3.5 unidades; 0
    encimados.
  - Espacio libre en las puntas ≤ 12.3 unidades en 375 y 1440, en los cinco
    progresos.
  - Con movimiento reducido: offset −210 y sin huecos.
- **Consola:** 0 errores en el recorrido completo a 375 y a 1440.
- **Geometría** (contra `geom-logos-local.json`): Δ 0 en todo. Hero, pines,
  secciones, alto del documento y modo compacto, en 375, 768, 1440 y 1470.
