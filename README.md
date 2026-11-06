# Optioutlet — Landing (optioutlet.com.mx)

Landing con Opti, el asistente que recomienda lentes de contacto del catálogo.
Stack: Vite + React + TypeScript (estricto), Tailwind CSS v4 (CSS-first, `@theme`), GSAP + ScrollTrigger.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (http://localhost:5173) |
| `npm run typecheck` | Revisión de tipos (`tsc -b`) |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build de `dist/` |

Requiere Node `>=22.12`.

## Regla de versiones de dependencias

Aplica a **toda** dependencia que se agregue o actualice, directa o de desarrollo:

1. **Antigüedad mínima de 14 días.** Solo se usa una versión publicada hace 14 días o más. Si la última versión es más reciente, se toma la release anterior que cumpla el plazo. La fecha se consulta con:
   ```sh
   npm view <paquete> time --json
   ```
2. **Versiones exactas** en `package.json`, sin `^` ni `~`.
3. **Instalar con `--before`** para que las dependencias indirectas respeten el mismo plazo. La fecha es hoy menos 14 días:
   ```sh
   npm install --before=AAAA-MM-DDT23:59:59Z
   # para agregar un paquete:
   npm install --save-exact --before=AAAA-MM-DDT23:59:59Z <paquete>@<versión>
   ```
4. TypeScript se mantiene en la línea **5.9** (no 7.x) mientras parte del ecosistema dependa de la API anterior.

## Estructura

- `src/content/landing.ts` — todo texto visible (es-MX). Los componentes no llevan texto suelto. El nombre de la mascota vive en `MASCOT_NAME`.
- `src/styles/index.css` — tokens de marca y tipografías en `@theme`. La fuente de texto se cambia solo en `--font-sans`.
- `src/styles/fonts.css` — `@font-face` autoalojados, solo subconjunto latín (español completo).
- `src/lib/gsap.ts` — registro único de ScrollTrigger y `useGSAP`; `HEADER_OFFSET = 72`.
- `src/components/brand/` — isotipo, trazos del patrón, patrones, sello, listón, mascota e imagotipo. `geometry.ts` guarda la geometría compartida.
  - `Mascot.tsx` e `Imagotipo.tsx` son aproximaciones marcadas con `TODO(brand-svg)`; al llegar los vectores oficiales se reemplaza el contenido de ese archivo y nada más.
- `src/styles/brandColors.ts` — hexadecimales de marca para atributos SVG; debe coincidir con `@theme`.
- `src/components/layout/` — encabezado, footer y franja de patrón. `src/components/ui/ActionLink.tsx` — enlaces y CTAs.
- `src/sections/` — una sección de la página por archivo, en el orden de `App.tsx`.
- `docs/mockup/optioutlet-mockup.dc.html` — mockup aprobado (referencia, no ejecutable).
- `docs/verificacion-sesion-1.md` — cómo verificar la landing; `docs/backlog.md` — residuales abiertos.
