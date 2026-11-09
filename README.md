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
| `npm run demo:local` | Build y `vite preview` abierto en `/?demo=1` (Plan C de la demo: sin red ni API) |
| `npm test` | Pruebas unitarias (vitest) |
| `npm run check` | Typecheck, pruebas y build, encadenados: se detiene en el primer fallo |
| `npm run eval:consulta` | Evaluación en vivo de la consulta contra `/api/chat` (gasta tokens; no forma parte de `check`) |

Requiere Node `>=22.12`.

## Consulta con Claude (servidor)

- `/api/chat` vive en `server/consulta/handleChat.ts`, independiente del hosting. Encima van dos adaptadores: `api/chat.ts` (función de Vercel) y `server/dev/viteChatPlugin.ts` (lo monta en `npm run dev`).
- Variables en `.env.local` (copia `.env.example`) y en Vercel:
  - `ANTHROPIC_API_KEY`: solo servidor y nunca con prefijo `VITE_`.
  - `ANTHROPIC_MODEL`: por defecto `claude-sonnet-5-5`.
  - `ANTHROPIC_EFFORT`: `low` | `medium` | `high`; por defecto `medium`.
  - En el cliente, `VITE_CONSULTA_PROVIDER` (`api` | `scripted`) y `VITE_API_BASE_URL`.
  - `VITE_STORE_URL` (cliente): origen de la tienda; vacío = `https://shop.optioutlet.com.mx`.
- **Regla de imports `.js`:** todo archivo que el servidor importe en tiempo de ejecución (`api/`, `server/`, `scripts/` y lo que cargan del dominio: `schema.ts`, `catalog.ts`, `progress.ts`, `content/consulta.ts`, `content/landing.ts`) usa especificadores relativos con `.js` (`'./types.js'`). Vercel corre la función como ESM nativo y Node no resuelve imports sin extensión; Vite y tsc resuelven `.js` a `.ts`. Si un archivo nuevo entra a esa cadena, sigue la misma regla.
- `npm run check` también revisa los tipos de `api/`, `server/` y `scripts/` (`tsconfig.server.json`).

## Demo: planes A, B y C

| Plan | Dónde | Cómo | Qué responde |
|---|---|---|---|
| A | Producción | https://optioutlet-landing.vercel.app | Claude, con el guionado como respaldo por turno |
| B | Producción | https://optioutlet-landing.vercel.app/?demo=1 | Solo el guionado; ninguna solicitud a `/api/chat` |
| C | Esta Mac, sin red | `npm run demo:local` → http://localhost:4173/?demo=1 | Solo el guionado; ninguna solicitud externa |

- `?demo=1` se evalúa al cargar la página y tiene prioridad sobre `VITE_CONSULTA_PROVIDER`. Cualquier otro valor conserva el comportamiento normal. No hay indicador visible (en desarrollo, un aviso en consola).
- Si `/api/chat` responde 429 (límite por visitante del firewall de Vercel), ese turno y el resto de la consulta los responde el guionado, hasta reiniciar la consulta o recargar. Los demás fallos siguen siendo de respaldo solo por turno.
- Guion de la presentación: `docs/guion-demo.md`.

## Despliegue

Vercel, con la integración de GitHub (`Brandon0427/optioutlet-landing`) y el preset de Vite. **`main` publica directo a producción** (https://optioutlet-landing.vercel.app) por decisión del proyecto en esta etapa. Cada cierre de fase va como `npm run check && git commit … && git push origin main`. Nunca hay push forzado ni se reescribe historial publicado.

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

## Regla de cierre de fase (commits)

El commit de cierre de fase va **encadenado** a las comprobaciones, para que
cualquier fallo lo detenga:

```sh
npm run check && git commit …
# equivale a: npm run typecheck && npm test && npm run build && git commit …
```

Nunca se corren las comprobaciones y el commit como pasos independientes (`;` o
en líneas separadas): un build roto llegó así a un commit en la Sesión 2.

## Estructura

- `src/config/store.ts` — único lugar con el dominio de la tienda (`STORE_URL`, de `VITE_STORE_URL`) y `storeLink(target, placement)`, que arma cada enlace a la tienda con UTM (`utm_source=landing`, `utm_medium=referral`, `utm_campaign=opti`, `utm_content=<placement>`) o reenvía los `utm_*` con los que llegó la visita. Ningún otro archivo escribe el dominio; lo prueba `scripts/storeDomain.test.ts`.
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
- `src/consulta/` — dominio de la consulta: contrato (`types.ts`, `schema.ts`), catálogo, reglas, proveedor guionado y estado (`useConsulta.ts`). `src/content/consulta.ts` — guion de Opti.
- `src/consulta/providers/` — `scripted.ts` (guion), `api.ts` (llama a `/api/chat` y cae al guionado por turno) e `index.ts` (elige el proveedor).
- `server/consulta/` — servidor de la consulta: configuración (modelo y effort), validación de la solicitud, esquema de salida, system prompt, conversión de mensajes, combinación del perfil y `handleChat`. `server/http/` y `server/dev/` — adaptadores. `api/chat.ts` — función de Vercel.
- `scripts/eval-consulta.ts` — evaluación en vivo (`vitest.eval.config.ts`).
- `docs/verificacion-sesion-1.md` a `docs/verificacion-sesion-3.md` — cómo verificar la landing, la consulta y su conexión con Claude; `docs/backlog.md` — residuales abiertos.
