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
