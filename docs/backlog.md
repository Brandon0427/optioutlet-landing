# Backlog

Trabajo residual registrado al cerrar fases. Cada entrada tiene su razón, sus
ítems y la medición que falta.

## Sesión 1 · Fase 6 — CERRADA CON RESIDUAL (2026-11-06)

### R1. Verificación en Safari de escritorio (5.2, 5.3 y 5.4)

- **Razón:** no se pudo conectar a `safaridriver`. En los cuatro intentos
  (cierre de la 5.3, inicio y cierre de la 5.4, inicio y cierre de la Fase 6)
  `curl http://localhost:4444/status` terminó con código 7 ("Failed to connect")
  y `lsof -iTCP:4444 -sTCP:LISTEN` no mostró ningún proceso escuchando.
  Por instrucción, no se arrancó `safaridriver` desde el entorno de Claude.
- **Ítems:**
  1. Revelación a 1440 × 800: pin 812 → 2012; pupila 287 px al 20 %, 801 px al
     45 %; mordida 0.60 al 45 %; contenido 0.12 y Opti a escala 0.563 al 65 %;
     fondo marino al 100 %.
  2. Hero: parallax a 560 px (`--hero-g1y-shift` −12 %, trazo 1 en y −160,
     pupila ×1.16, sello 67.2°) y seguimiento del cursor.
  3. Cómo funciona: pin 2740 → 4240; paso activo 1/2/3 al 10/50/90 %; disco 120°.
  4. Perfiles: pin 4968 → 5904; primera tarjeta en x=120 al inicio, última
     terminando en x=1320 al final; patrón −180.
  5. Listón: `startOffset` de 0 a L − T sin salirse del trazo; franja y sello
     de la receta.
  6. `.pin-spacer` = 3 y ninguna sección cortada a 0/25/50/75/100 % de cada pin.
- **Medición pendiente:** con `safaridriver -p 4444` escuchando, correr las
  mismas comprobaciones de `.cache/qa52.mjs`, `qa53.mjs` y `qa54.mjs` por
  WebDriver (`/session`, `/execute/sync`, `/screenshot`) a 1440 × 800 y
  compararlas con los valores de Chrome de arriba.

### R2. Prueba en iPhone real

- **Razón:** requiere el dispositivo; la hace el equipo con el servidor de
  desarrollo en la red local (`npx vite --host 0.0.0.0`, `http://<IP>:5173`).
- **Ítems:**
  1. La franja bajo cada escenario fijado al esconderse la barra de Safari
     muestra el fondo de la sección (revelación: menta → marino), nunca blanco.
  2. La mirada en reposo de la pupila del hero; se detiene fuera de pantalla.
  3. Pines sin brincos al engancharse con el scroll por inercia.
  4. Modo compacto de "Cómo funciona": ningún paso cortado.
- **Medición pendiente:** confirmación visual de los cuatro puntos; si el pin
  brinca, evaluar `ScrollTrigger.normalizeScroll()`.

### R3. Auditoría de Lighthouse

- **Razón:** correrla desde la línea de comandos exige instalar el paquete
  `lighthouse` (en el proyecto o global), lo cual está fuera de lo permitido.
  En su lugar se hizo la revisión con el protocolo DevTools sobre el build de
  producción (contraste real por píxel, foco, objetivos táctiles, `aria-hidden`,
  estructura): ver `docs/verificacion-sesion-1.md`.
- **Ítems:** calificaciones de Rendimiento, Accesibilidad, Buenas prácticas y SEO.
- **Medición pendiente:** `npm run build && npm run preview`, abrir
  http://localhost:4173 en Chrome → DevTools → Lighthouse → modo navegación,
  escritorio y móvil, y anotar las cuatro calificaciones aquí.

## Sesión 5 · Fase 5 — Residuales R1, R2 y R3 (2026-11-09)

### R1. Safari de escritorio — CERRADA CON RESIDUAL

- **Hecho:** pasada automatizada con WebKit de Playwright 1.64.1 (WebKit 27.2)
  contra producción con `?demo=1`, a 1440 × 800 y 1470 × 956 (resolución nativa
  de la Mac de la demo). Pines, alturas de sección, modo compacto, secciones
  fijadas a 72 px al 25/50/75 % de cada pin y la consulta completa: **idénticos a
  Chrome 157** (0 diferencias de más de 1 px). Detalle en
  `docs/verificacion-sesion-5.md`.
- **Razón del residual:** WebKit de Playwright es una aproximación; no es Safari
  (motor de scroll, barra y `font-display` del sistema pueden diferir).
- **Ítems:** la lista manual "R1 · Safari de escritorio" de
  `docs/verificacion-sesion-5.md`.
- **Medición pendiente:** que Brandon recorra esa lista en Safari real y anote
  aquí el resultado. No bloquea la demo: se presenta en Chrome.

### R2. iPhone real — CERRADA CON RESIDUAL

- **Razón:** requiere el dispositivo.
- **Ítems:** la lista manual "R2 · iPhone" de `docs/verificacion-sesion-5.md`
  (franja bajo el escenario fijo, mirada en reposo de la pupila, pines por
  inercia, modo compacto).
- **Medición pendiente:** confirmación visual de cada punto en Safari de iOS,
  con https://optioutlet-landing.vercel.app/?demo=1. Si un pin brinca, evaluar
  `ScrollTrigger.normalizeScroll()` (motor de scroll: va en su propia fase).

### R3. Lighthouse — CERRADA

Medido en producción (`https://optioutlet-landing.vercel.app/?demo=1`, para no
gastar API), Lighthouse 13.5.0 con Chrome 157, tres corridas por formato,
mediana. "Después" = con `vercel.json` (caché inmutable en `/assets/*`).

| Formato | Momento | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| Móvil | Antes | 98 | 100 | 96 | 90 |
| Móvil | Después | 98 | 100 | 96 | 90 |
| Escritorio | Antes | 100 | 100 | 96 | 90 |
| Escritorio | Después | 100 | 100 | 96 | 90 |

La caché no cambia la calificación (Lighthouse mide una carga en frío), pero
cada recarga posterior ya no vuelve a descargar JS, CSS ni fuentes.

Lo que no se arregló aquí, por estar fuera de lo permitido en la sesión:

#### B1. Errores de consola del listón (`<textPath> startOffset=""`)
- **Razón:** vienen de la animación del listón del cierre (GSAP sobre
  `startOffset` en `StoreCta`): el motor de scroll no se toca en esta sesión.
  No se ve nada en pantalla; Lighthouse los cuenta en "Buenas prácticas".
- **Ítems:** 21 errores "Unexpected end of attribute. Expected length, """ por
  carga.
- **Medición pendiente:** Buenas prácticas pasa de 96 a 100 junto con B2; el
  listón conserva su recorrido 0 → L − T (verificación de la Sesión 1).

#### B2. `/favicon.ico` responde 404
- **Razón:** el ícono es un recurso de marca (SVG oficiales: fuera de alcance).
- **Medición pendiente:** 0 errores 404 en consola al cargar.

#### B3. Sin `<meta name="description">`
- **Razón:** SEO y metadatos para compartir quedan fuera de esta sesión.
- **Medición pendiente:** SEO de 90 a 100.

#### B4. Cadena de carga CSS → fuentes
- **Razón:** precargar las fuentes con hash pide tocar el build y cambia el
  momento en que se sustituye la tipografía (algo visible al cargar).
- **Ítems:** `render-blocking-insight` 0.5 y `network-dependency-tree-insight` 0;
  FCP móvil de 1.73 s (mediana), CLS 0.026.
- **Medición pendiente:** FCP y CLS móviles antes y después de un `preload`.

## Sesión 5 · Fase 7 — Hallazgos de la demo (2026-11-09)

### B5. La consulta arranca sola al entrar en pantalla

- **Razón:** `Consulta.tsx` llama `start()` con un IntersectionObserver en cuanto
  la sección entra en pantalla (o al abrir `#consulta`). Cada visita que llega
  hasta ahí hace una solicitud a `/api/chat` aunque no toque nada. No se cambia
  en esta sesión: el saludo inmediato es parte de la experiencia aprobada.
- **Medición** (evaluación de la Sesión 3, Sonnet 5.5 · medium, 10
  conversaciones y 61 turnos):
  - **Tokens por turno:** unos 4,645 de entrada (unos 4,281 leídos de caché y
    unos 364 sin caché) y unos 187 de salida. El turno de inicio es de los más
    chicos, porque no lleva historial.
  - **Costo por turno:** del orden de US$0.003 (US$0.02 por consulta completa
    de unos 6 turnos, según `docs/verificacion-sesion-3.md`). Con la caché
    fría, el primer turno cuesta más, porque escribe los ~4,000 tokens del
    system prompt en caché.
  - **Cada visita que llega a la consulta sin interactuar:** 1 solicitud y del
    orden de US$0.003. 1,000 visitas así serían unos US$3.
- **Ítems:** decidir si el saludo inicial sale del guion (sin API) y Claude
  entra desde la primera respuesta, o si `start()` espera la primera
  interacción.
- **Medición pendiente:** solicitudes a `/api/chat` por visita sin interacción
  (hoy 1) y tokens del turno de inicio medidos por separado.
