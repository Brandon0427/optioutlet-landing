# Verificación — Sesión 1 (Landing viva)

Cómo revisar la landing de optioutlet.com.mx al cierre de la Sesión 1: qué debe
verse en cada sección, cómo comprobar cada efecto, qué no es un defecto y lo que
no se ve a simple vista.

## Cómo correrla

| Para | Comando | URL |
|---|---|---|
| Desarrollo | `npm run dev` | http://localhost:5173 |
| Desarrollo desde un celular en la misma red | `npx vite --host 0.0.0.0` | `http://<IP de la Mac>:5173` |
| Build de producción | `npm run build` | — |
| Probar el build | `npm run preview` | http://localhost:4173 |

Para ver la versión estática (la que recibe quien tiene activado el movimiento
reducido): macOS → Ajustes del Sistema → Accesibilidad → Pantalla → *Reducir
movimiento*; iOS → Accesibilidad → Movimiento → *Reducir movimiento*. También en
Chrome DevTools → Rendering → *Emulate CSS prefers-reduced-motion: reduce*.

## Estado esperado por sección

"Animado" es con el movimiento normal; "estático" es con movimiento reducido.
En escritorio (≥ 1024 px) el hero y el cierre van lado a lado; por debajo se apilan.

| Sección | Escritorio (1440 × 800) | Celular (375 × 812) | Estático (cualquier ancho) |
|---|---|---|---|
| Encabezado | Fijo, blanco opaco, 72 px. Logo, "Cómo funciona", "Tienda" y "Empezar mi consulta". | Logo compacto y solo el botón "Empezar mi consulta". | Igual. |
| Hero | Título y textos a la izquierda; a la derecha el disco claro con la pupila verde agua y el sello "CONSULTA CON OPTI • TODO PARA VER BIEN •". Seis trazos flotando. | Texto arriba, disco abajo. Tres trazos (los otros tres taparían el título o el sello). | Sin movimiento; el sello sin girar. |
| Revelación | Fijada 1200 px: la pupila marino crece hasta cubrir la pantalla, se va la mordida, aparece el patrón y entra Opti con "Antes de recomendarte algo, queremos conocerte." | Igual, fijada 1200 px. | Fondo marino, patrón tenue y Opti visible desde el inicio. |
| Cómo funciona | Fijada 1500 px. Tres pasos a la izquierda (uno resaltado por tercio de scroll) y el teléfono a la derecha cambiando de pantalla. | Modo compacto: solo el paso activo y el teléfono escalado debajo. | Los tres pasos resaltados y el teléfono en la pantalla 3. |
| Perfiles | Fijada; el scroll vertical mueve las cinco tarjetas en horizontal, de la columna izquierda hasta que la última termina en el borde derecho de la columna. Patrón con parallax. | Tarjetas apiladas, sin fijar; el patrón conserva el parallax. | Tarjetas en rejilla. |
| Consulta | Cascarón visual con contenido de muestra en "Pregunta 2 de 5". | Igual, a una columna. | Igual. |
| Receta | Opti en el sello "TU RECETA PRIMERO •", que gira en sentido contrario al scroll. | Sello arriba, texto abajo. | Sello sin girar. |
| Cierre | Listón en U a la derecha con "TODO PARA VER BIEN •" corriendo por el trazo. | Listón abajo de los botones, más pequeño. | Texto del listón centrado en el trazo. |
| Franja de patrón | Patrón claro con parallax continuo. | Igual. | Sin movimiento. |
| Footer | Marino con imagotipo, enlaces legales y ©. | Igual, en varias líneas. | Igual. |

## Cómo verificar cada efecto

| Efecto | Qué hacer | Qué debe pasar |
|---|---|---|
| Pupila del hero (escritorio) | Mover el cursor sobre el hero. | La pupila se desplaza hacia el cursor (máx. ≈ 8 % del ancho del disco) y la mancha clara del fondo la acompaña hacia la derecha. Al sacar el cursor, vuelve al centro. |
| Pupila del hero (celular) | Quedarse en el hero sin tocar. | La pupila "mira" sola con movimientos lentos cada 2.5–3.5 s. Al bajar de la sección se detiene. |
| Parallax del hero | Bajar los primeros 560 px. | Los trazos suben a distintas velocidades y giran; las manchas del fondo se desplazan; la pupila crece hasta 1.16. |
| Sellos | Bajar por toda la página. | El del hero gira a favor (0.12° por px); el de la receta en contra (0.08° por px). |
| Revelación | Bajar desde el final del hero. | La sección se queda fija bajo el encabezado; la leyenda "Sigue bajando…" desaparece al 20 %; la pupila crece con aceleración suave hasta cubrir todo; la mordida se desvanece entre el 35 y el 60 %; Opti, el texto y el patrón entran entre el 62 y el 87 %. |
| Cómo funciona | Seguir bajando. | Se fija; el paso resaltado cambia al 34 % y al 68 % del recorrido y el teléfono muestra la conversación de ese paso; el disco de color gira 120°. |
| Modo compacto | Ventana de escritorio angosta (contenedor < 760 px) o baja (≈ < 628 px de alto a 1440 de ancho). | Un solo paso visible a la vez junto al teléfono; ningún paso cortado. Al redimensionar lento alrededor del umbral, el modo cambia una sola vez. |
| Carrusel de perfiles (≥ 768 px) | Bajar al llegar a Perfiles. | Se fija y las tarjetas corren hacia la izquierda hasta el borde de la pantalla; al final, la última tarjeta queda alineada a la derecha de la columna. |
| Listón | Bajar hasta el final. | El texto avanza por la U desde el inicio del trazo y termina justo en su final al llegar al fondo de la página; nunca se sale. |
| Franja de patrón | Subir y bajar cerca del footer. | El patrón se mueve sin saltos visibles. |
| Cambio de tamaño | Redimensionar la ventana con la página abierta (cruzando 768 px). | Perfiles pasa de carrusel fijado a apilado y viceversa sin descuadrar las demás secciones. |
| Movimiento reducido | Activarlo y recargar (o activarlo con la página abierta). | La página es la versión estática: sin secciones fijadas, sin animaciones, con todo el contenido visible. |
| iPhone: franja bajo el escenario | En Safari de iOS, con una sección fijada, bajar lento hasta que se esconda la barra. | La franja que se abre bajo el escenario tiene el mismo fondo que la sección (en la revelación: verde menta al inicio, marino al final), nunca blanco. |
| Enlaces | "Empezar mi consulta" (encabezado, hero, cierre); "Tienda" / "Ir a la tienda". | Los primeros llevan a la consulta, que queda justo bajo el encabezado; los de tienda abren https://shop.optioutlet.com.mx en pestaña nueva. |

## Qué NO es un defecto

- **Imagotipo y mascota aproximados.** `Imagotipo.tsx` y `Mascot.tsx` son
  aproximaciones del mockup, marcadas con `TODO(brand-svg)`, a la espera de los
  vectores oficiales. Cambiarlos es reemplazar el contenido de esos dos archivos.
- **Marcadores entre corchetes.** `[Producto J&J]`, `[PRECIO]` y "Foto del
  producto" son intencionales: los datos reales de productos llegan en la Sesión 4.
- **La consulta no responde.** Los chips, el campo y "Enviar" son el cascarón
  visual con contenido de muestra fijo ("Pregunta 2 de 5"). La lógica de la
  conversación es de la Sesión 2 y la conexión con Claude de la Sesión 3.
- **Enlaces legales con `#`.** "Aviso de privacidad", "Términos y condiciones" y
  "Contacto" todavía no tienen destino.
- **Diferencias deliberadas con el mockup** (aprobadas o necesarias):
  - La mordida del isotipo y del punto del patrón rompe el borde (el mockup
    tenía un hueco interior).
  - Perfiles alineado con el resto de las secciones (el mockup tenía 48 px de más).
  - Bajo 1024 px: el listón va abajo de los botones, tres trazos del hero se
    ocultan y las manchas claras de los gradientes se mueven detrás del disco y
    del listón, para no quedar detrás del texto.
  - En escritorio, la mancha clara del hero está en el 72 % (mockup: 64 %) y
    sigue al cursor solo hacia la derecha: en la posición del mockup el final
    del título quedaba por debajo del contraste AA.
  - El listón recorre el trazo una vez, linealmente, en lugar de oscilar.

## Lo que no se ve a simple vista

### Las mediciones de layout se hacen en el evento `revert`, no en `refreshInit`

**Qué se mide.** Varias decisiones de layout dependen del tamaño real de la
ventana y se recalculan en cada `ScrollTrigger.refresh()` (al cambiar el tamaño
de la ventana, al cargar las fuentes y al cruzar un breakpoint):

- "Cómo funciona": el modo compacto (contenedor < 760 px, o la columna de los
  tres pasos no cabe en el alto disponible) y la escala del teléfono.
- Revelación y Perfiles: el ajuste del bloque de contenido a escenarios muy
  bajos (escala mínima 0.6, nunca hacia arriba).
- Cierre: el largo del trazo del listón (L) y del texto (T) que fijan el
  recorrido de `startOffset` entre 0 y L − T.

**El problema con `refreshInit`.** `refreshInit` se dispara al empezar el
`refresh`, *antes* de que ScrollTrigger revierta los pines. En ese momento cada
sección fijada todavía conserva los estilos en línea que ScrollTrigger le puso
en el cálculo anterior (ancho, alto y el `pin-spacer` con el tamaño viejo). Lo
que se mide ahí es el tamaño de la ventana *anterior*.

**Cómo se detectó.** Redimensionando de 2 en 2 px alrededor del umbral de 760 px,
el modo compacto llegaba siempre con un paso de retraso: con la ventana en
824 px (contenedor de 758 px, que debe ser compacto) seguía en modo lado a lado,
y solo se corregía en el siguiente cambio de tamaño o con un `refresh()` manual.
Si el usuario dejaba de redimensionar justo en ese punto, la sección se quedaba
en el modo equivocado.

**La solución.** Las mediciones viven en `ScrollTrigger.addEventListener('revert', …)`.
`revert` se dispara durante el `refresh` cuando los pines ya se quitaron y el DOM
está en su layout natural, y antes de que ScrollTrigger recalcule los `start`/`end`.
Así:

1. Se mide el tamaño actual, no el anterior.
2. Los valores en función (`end: () => …`, `x: () => -overflow()`,
   `attr.startOffset: () => L − T`) se evalúan después, con las medidas nuevas.

**Regla adicional del modo compacto.** La decisión se toma siempre sobre el
estado completo: primero se quita el compacto (los tres pasos visibles, el
teléfono a escala 1), se mide la columna completa y el ancho del contenedor, se
decide y solo entonces se aplica. Si se midiera con el compacto aplicado, los
pasos ocultos medirían cero y el criterio cambiaría de resultado en cada
recálculo: el modo se prendería y apagaría solo.

**Cómo se comprobó.** Barrido de ancho de 812 a 842 px y de alto de 612 a 642 px,
en las dos direcciones, leyendo el modo después de cada cambio y otra vez tras
dos `refresh()` forzados: exactamente un cambio de modo por dirección (a los
760 px de contenedor y a los 626/628 px de alto), sin ninguna lectura inestable.

### Dos piezas escriben el mismo atributo del listón

El `startOffset` del texto del listón lo escriben dos piezas distintas:

1. **`Ribbon` (versión estática):** centra el texto en el trazo,
   `(L − T) / 2`, al montarse y otra vez en `document.fonts.ready`, porque el
   largo del texto cambia cuando carga Unbounded.
2. **`StoreCta` (versión animada):** GSAP anima el mismo atributo de 0 a L − T
   con el scroll.

**El conflicto.** `useGSAP` corre como efecto de layout y `Ribbon` como efecto
normal, así que el `fonts.ready` de `Ribbon` se registra *después* del
`refresh()` global de `App`. Al cargar las fuentes, el centrado estático corría
al final y pisaba el valor animado: el texto quedaba centrado aunque el scroll
dijera otra cosa, hasta el siguiente movimiento.

**La solución.** En modo animado, `StoreCta` marca el `textPath` con
`data-animated="true"` y `centerRibbonText()` no lo toca mientras esa marca
exista. Al revertir el contexto (por ejemplo, al activar el movimiento reducido
con la página abierta), `StoreCta` quita la marca y, en el siguiente cuadro
(cuando GSAP ya restauró el atributo), vuelve a centrar el texto. Las dos piezas
usan las mismas funciones `measureRibbon()` y `centerRibbonText()`.

**El final del recorrido.** El cierre está casi al final de la página, así que
`end: 'bottom top'` caía después del scroll máximo y el texto nunca terminaba
su recorrido. Se usa `end: 'clamp(bottom top)'`: el recorrido completo
(0 → L − T) termina justo al llegar al final de la página.

### Limpieza de ScrollTriggers y doble montaje

Cada sección crea sus animaciones dentro de `useGSAP` con su propio `scope` y un
`gsap.matchMedia()`. Al desmontar (o al doble montaje de `StrictMode` en
desarrollo, o en un recargado en caliente), el contexto revierte todo: triggers,
pines y sus `pin-spacer`, estilos en línea y atributos `data-*`. Los listeners
manuales (`mousemove`, `revert`) y las animaciones creadas después (la mirada en
reposo) se quitan en la función de limpieza de cada `matchMedia`.

Comprobado en desarrollo contando `ScrollTrigger.getAll()` y `.pin-spacer`
(acceso `window.__ST` solo en desarrollo; no existe en el build de producción):

| Escenario | Triggers | `.pin-spacer` |
|---|---|---|
| 1440 px al cargar, tras recargado en caliente de cada sección | 8 (5 hasta la 5.3) | 3 |
| 375 px al cargar, tras recargado en caliente | 9 (6 hasta la 5.3) | 2 |
| Cruce de 768 px con la página abierta (1000 → 700 → 1000) | — | 3 → 2 → 3, mismas posiciones que al cargar |
| Movimiento reducido | 0 | 0 |

### Recálculo al cambiar el tamaño y al cargar las fuentes

- ScrollTrigger recalcula solo al redimensionar. Todo lo que depende de medidas
  es una función con `invalidateOnRefresh` (tamaño de la pupila, recorrido del
  carrusel, giros totales de los sellos y la franja, rango del listón).
- `App` llama `ScrollTrigger.sort()` + `refresh()` cuando todas las secciones
  están montadas, y otra vez `refresh()` con `document.fonts.ready`.
- Cada sección tiene un `refreshPriority` en el orden de la página. Cuando
  `matchMedia` recrea el pin de Perfiles al cruzar 768 px, los triggers de abajo
  se siguen calculando después de él.
- En iOS la barra de direcciones cambia el alto de la ventana al hacer scroll:
  `ignoreMobileResize` evita recalcular por eso, y los escenarios miden `100svh`.
  La franja que se abre debajo cuando la barra se esconde la cubre un hijo
  `stage-underlay` (alto `100lvh − 100svh`) que hereda el fondo de la sección.

### Movimiento reducido

No hay una rama de "versión reducida": con `prefers-reduced-motion: reduce`,
`matchMedia` simplemente no crea nada. La página es el marcado de la Fase 4 tal
cual. Comprobado a 375, 768 y 1440 px: 0 triggers, 0 `pin-spacer`, 0
transformaciones en línea y la altura del documento idéntica a la de la Fase 4
(9817, 8135 y 6013 px).

### Build de producción

- `window.__ST` no existe en el build (`typeof window.__ST === 'undefined'`
  medido sobre `vite preview`); el bundle no contiene `__ST`, `import.meta.env`,
  `jsxDEV`, código de HMR ni advertencias de desarrollo de React.
- Una sola copia de `react`, `react-dom` y `gsap` (`npm ls` y sourcemap sin
  paquetes anidados).
- Peso final: JS 374 kB (125 kB gzip), del que la mayor parte es React DOM y
  GSAP + ScrollTrigger; CSS 26 kB (6.6 kB gzip).
- Fuentes: solo el subconjunto latín (Unbounded 51 kB + Albert Sans 32 kB).
  Comprobado con `CSS.getPlatformFontsForNode` que "ñÑ ¿¡ áéíóú ÁÉÍÓÚ ü • — ©"
  se dibuja con Unbounded y con Albert Sans, sin fuente de respaldo.

### Accesibilidad (medida sobre el build, a 1440, 1024, 768 y 375 px)

- Contraste: el color de cada bloque de texto contra los píxeles reales detrás
  (captura con el texto oculto, muestreada en una rejilla). 0 bloques bajo AA en
  los cuatro anchos; el mínimo es 3.66:1 en el título del hero a 1024 px (texto
  grande, requiere 3:1). Incluye el peor caso del cursor sobre el hero.
- Foco: anillo doble (marino pegado al elemento + verde agua por fuera), visible
  sobre fondos claros y oscuros; todas las paradas de Tab lo muestran.
- Objetivos táctiles: ningún enlace, botón o campo visible mide menos de 44 px.
- Decoración: todos los SVG decorativos tienen `aria-hidden`; las cuatro
  mascotas son `role="img"` con etiqueta. El teléfono completo es decorativo y
  sus pantallas ocultas no reciben foco.
- Estructura: `lang="es-MX"`, un `h1`, encabezados en orden, `header`/`main`/
  `footer`/`nav`, campo con `label`, enlaces externos con aviso de pestaña nueva
  para lectores de pantalla.
