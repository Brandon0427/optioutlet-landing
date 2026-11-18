# Verificación · Sesión 8 — Activos oficiales de marca

Todo elemento de marca de la página usa ahora la geometría oficial que mandó la
diseñadora (`docs/brand/svg/`), con los colores de los tokens (turquesa
`#67bbb5`). Principio rector: **se cambia la forma, no el movimiento.** El
motor de scroll, los pines, los textos y la consulta no cambiaron.

**Punto de regreso:** antes de esta sesión, producción estaba en `362d37e`.
Si algo sale mal, `git revert` del commit de esta sesión devuelve todo como
estaba.

## 1. Qué cambió

| Pieza | Antes | Ahora |
|---|---|---|
| Logo (header y footer) | isotipo + palabra “optioutlet” en Unbounded (texto HTML) | `Logo.svg` oficial, con el mismo ancho: 163 px en el header, 148 px en el header de celular y en el footer |
| Logo en el footer (fondo azul marino) | isotipo turquesa + palabra blanca | **logo blanco derivado**: todo blanco y sin el trazo con degradado. Es provisional hasta que la diseñadora lo apruebe |
| Isotipo (hero, tarjetas sin foto) | círculo con mordida dibujado a mano | `7.svg` oficial |
| Pupila que crece (revelación) | disco navy + mordida circular en `div`s | el isotipo oficial dividido en dos: disco navy y la mordida oficial, que se desvanece igual que antes |
| Piezas del patrón y flotantes (U, bucle, punto) | trazos con grosor uniforme | `5.svg` (U), `3.svg` (bucle) y `7.svg` (punto), rellenas |
| Opti (mascota) | aproximación del mockup | `Opti.svg` oficial. En fondo azul marino, el cuerpo va en turquesa y las pupilas en navy, como antes |
| Favicon e ícono de iPhone | pupila aproximada | isotipo oficial, regenerado con `scripts/generate-icons.ts` |

Fuentes: **no cambiaron.** Las que mandó la diseñadora (Unbounded 1.701 y
Albert Sans 1.025) son las mismas versiones que ya servía la página en
`woff2`. Mundo Sans y Nauryz Red Keds no se integraron; están pendientes de
licencia (`docs/backlog.md`).

### Correspondencia de formas

- **U → `5.svg`.** `6.svg` es la misma U rotada 85° (error medio de 0.45 % al
  alinearlas).
- **Bucle → `3.svg`.**
- **Punto e isotipo → `7.svg`.** `4.svg` es la misma figura reflejada.
- **Trazo en S (`1.svg`, `2.svg`) y `patron.svg`:** no se usan. El patrón de la
  página es un mosaico generado con las piezas oficiales; no había un lugar
  con el patrón como composición fija.

### Normalización (escala uniforme, sin deformar)

Cada pieza oficial se centró en el centro de la anterior y se escaló para que
su **lado mayor** midiera lo mismo. Por eso el lado menor cambia; está
**previsto**, no es un defecto.

| Pieza | Rotación | Escala | Caja anterior (an × al) | Caja oficial | Proporción anterior → oficial |
|---|---|---|---|---|---|
| U | 45.7° | 1.191 | 86 × 103 | 68.7 × 103 | 0.835 → 0.667 (más angosta) |
| Bucle | −4.2° | 1.145 | 80 × 113.2 | 86.6 × 113.2 | 0.707 → 0.766 (más ancho) |
| Punto | 0° (orientación oficial) | 1.245 | 44 × 44 | 44 × 44 | 1 → 1 |
| Opti, completo | — | — | 75 % × 84 % de su caja | 81 % × 84 % | lado mayor = alto |
| Opti, cabeza | — | — | 75 % × 63 % | 75 % × 64 % | lado mayor = ancho |
| Logo | — | — | 163 × 30 px (md) | 163 × 31.4 px | lado mayor = ancho |

## 2. Comparación de antes y después (medida, no a ojo)

Se midió en 390, 768 y 1440 px. Las capturas están en `.cache/qa-s8/`, que no
se sube a git: `antes/`, `despues/` y las láminas lado a lado en `pares/`.

- **Caja pintada de cada pieza.** Es lo que de verdad se dibuja, no el
  contenedor. Tolerancia: ±2 px, o ±3 % en piezas grandes.
  - Con movimiento: 45 dentro de tolerancia, 26 con un cambio **previsto** del
    lado menor (U, bucle y Opti, por la tabla de arriba) y 1 inesperado: la
    pupila del hero a 390 px. Ese inesperado es ruido. En pantallas táctiles,
    la pupila “mira” sola de forma aleatoria, y la versión de antes medida
    dos veces ya variaba 5 px.
  - Con movimiento reducido: **0 inesperados**.
  - Todos los centros coinciden a ±0.1 px.
- **Secciones y pines:** idénticos en 375, 768, 1440 y 1470 px (Δ 0 px).
- **Animaciones:** se recorrió la página completa con `?demo=1` en 390 y
  1440 px. Se registraron la pupila que sigue al cursor, el sello, los
  flotantes, la pupila que crece y la mordida que se desvanece, la mascota,
  el disco de los pasos, el patrón de los perfiles, el listón, la franja del
  patrón y el sello de la receta. Los valores de antes y después son
  **idénticos**. La consulta en demo llega a las 4 recomendaciones, sin
  desbordes horizontales ni errores de consola.
- **Borde de la mordida:** se capturó con zoom en su punto de mayor tamaño,
  cuando la pupila ya casi llena la pantalla. No hay hilo navy en el borde.
- **Fuentes:** con red 4G simulada, las fuentes terminan de bajar (3.5 s)
  antes de que aparezca el texto (3.8 s). No hay destello de fuente sin
  estilo y no hizo falta `preload`.

## 3. Qué revisar en producción (sección por sección)

Abre https://optioutlet.com.mx/?demo=1 en Chrome, con “Reducir movimiento”
apagado.

1. **Header:** el logo oficial (“OPTI” en navy y “OUTLET” en turquesa, con el
   isotipo como “O”) a la izquierda. En el celular cabe junto al botón
   “Empezar mi consulta”.
2. **Hero:**
   - El isotipo dentro del círculo claro tiene la mordida oficial arriba a la
     derecha y sigue al cursor como antes.
   - Las piezas flotantes son las oficiales; giran y suben al bajar.
   - El sello gira.
3. **Revelación:**
   - La pupila navy crece con la mordida oficial, la mordida se desvanece y la
     pupila llena la pantalla.
   - Aparece Opti oficial en turquesa sobre su círculo navy.
   - El patrón del fondo usa las piezas oficiales, en turquesa y blanco.
4. **Así funciona tu consulta:** el avatar de Opti en el teléfono, la U navy y
   el punto turquesa junto al disco.
5. **Tu día dice mucho de tus lentes:** cada tarjeta tiene su pieza oficial y
   el patrón del fondo se mueve como antes.
6. **Consulta:**
   - El avatar de Opti está en el encabezado del chat, con la U de fondo.
   - Haz la consulta completa.
7. **Receta:** Opti oficial dentro del sello, que gira, y viñetas con el punto
   oficial.
8. **Listón y franja del patrón:** el listón no cambió; la franja usa las
   piezas oficiales en turquesa y navy.
9. **Footer:** el logo **blanco** sobre azul marino.
10. **Pestaña del navegador:** el favicon es el isotipo oficial. Si ves el
    anterior, recarga con ⌘⇧R; el navegador guarda el favicon en caché.

### Cambios previstos que no son defectos

- La U se ve más angosta y algo inclinada, el bucle un poco más ancho, y
  Opti un poco más ancho. Es la proporción de las piezas oficiales; el lado
  mayor y la posición son los mismos.
- El logo ya no es texto, así que no se puede seleccionar ni copiar. Los
  lectores de pantalla lo leen como “Optioutlet”, y el enlace del header
  conserva su nombre.
- El turquesa sigue siendo `#67bbb5`, aunque los archivos de la diseñadora
  traigan otro. Hay que confirmarlo con ella (backlog).
- El logo blanco es un derivado nuestro. Para mandárselo a la diseñadora:
  `docs/brand/derivados/logo-blanco.svg` y `logo-blanco-lamina.png`.

## 4. Archivos

- **Componentes:**
  - `src/components/brand/officialGeometry.ts` (nuevo; trazos copiados tal
    cual, sin `<style>` ni clases)
  - `geometry.ts`, `BrandShape.tsx`, `Isotipo.tsx`, `Imagotipo.tsx` y
    `Mascot.tsx`
  - `src/sections/PupilReveal.tsx`: solo el contenido de la pupila; los refs
    y el timeline no cambiaron.
- **Prueba nueva:** `src/components/brand/__tests__/brand-assets.test.tsx`.
  Monta juntos todos los componentes de marca y verifica que no hay `<style>`,
  clases de la diseñadora, turquesa de sus archivos ni ids repetidos, que el
  degradado solo va en el logo a color y que el logo tiene nombre accesible.
  `npm run check`: 19 archivos, 291 pruebas.
- **Íconos:** `scripts/generate-icons.ts`, `public/favicon.svg`,
  `public/favicon.ico` y `public/apple-touch-icon.png`.
- **Activos:**
  - `docs/brand/svg/`: originales sin editar.
  - `docs/brand/fonts/`: solo Unbounded y Albert Sans, con su licencia OFL.
  - `docs/brand/derivados/`.
  - El brandbook queda fuera de git porque el repositorio es público; ver el
    backlog.
- **Documentación:** `docs/backlog.md`, `README.md`, `index.html` (solo el
  comentario de los íconos), `.gitignore` y `.graphifyignore`.
