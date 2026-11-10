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
| `npm run verify:redirects -- <url base> [--follow]` | Verificación en vivo de las redirecciones 301 a la tienda y de las rutas de la landing (no forma parte de `check`) |

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

## Demo: planes A, A′, B y C

| Plan | Dónde | Cómo | Qué responde |
|---|---|---|---|
| A | Producción | https://optioutlet.com.mx | Claude, con el guionado como respaldo por turno |
| A′ | Producción, si el dominio falla | https://optioutlet-landing.vercel.app (y `/?demo=1`) | La misma app y el mismo despliegue |
| B | Producción | https://optioutlet.com.mx/?demo=1 | Solo el guionado; ninguna solicitud a `/api/chat` |
| C | Esta Mac, sin red | `npm run demo:local` → http://localhost:4173/?demo=1 | Solo el guionado; ninguna solicitud externa |

- `?demo=1` se evalúa al cargar la página y tiene prioridad sobre `VITE_CONSULTA_PROVIDER`. Cualquier otro valor conserva el comportamiento normal. No hay indicador visible (en desarrollo, un aviso en consola).
- Si `/api/chat` responde 429 (límite por visitante del firewall de Vercel), ese turno y el resto de la consulta los responde el guionado, hasta reiniciar la consulta o recargar. Los demás fallos siguen siendo de respaldo solo por turno.
- Guion de la presentación: `docs/guion-demo.md`.

## Despliegue

Vercel, con la integración de GitHub (`Brandon0427/optioutlet-landing`) y el preset de Vite. **`main` publica directo a producción** (https://optioutlet-landing.vercel.app) por decisión del proyecto en esta etapa. Cada cierre de fase va como `npm run check && git commit … && git push origin main`. Nunca hay push forzado ni se reescribe historial publicado.

- `vercel.json` lleva `headers`: `/assets/*` (archivos con hash) con `public, max-age=31536000, immutable`. El HTML conserva `max-age=0, must-revalidate`.
- `vercel.json` lleva también `redirects` (Sesión 6): las rutas viejas de la tienda (`/products`, `/collections`, `/cart`, `/pages`, `/account`, `/discount`, `/<id de la tienda>/orders/…`, los sitemaps, etc.) responden **301** a la misma ruta y query en `https://shop.optioutlet.com.mx`.
  - **Nunca se redirigen:** `/`, `/assets/*`, `/api/*`, los archivos de `public/` y `robots.txt`.
  - **Código explícito:** `statusCode: 301`, nunca `permanent` (que da 308).
  - **Patrones:** cada prefijo tiene una regla exacta (`/cart`, `/cart/`) y otra para subrutas (`/cart/…`), porque `/:path*` dejaría `Location` con una diagonal final.
  - **Prueba en `check`:** `scripts/redirects.test.ts` convierte las reglas con `@vercel/routing-utils`, la misma biblioteca de Vercel. Comprueba el 301, que el destino coincida con `DEFAULT_STORE_URL` y que ninguna ruta de la landing coincida con una regla. La tabla de casos es `scripts/redirect-cases.json`; un caso nuevo o un prefijo nuevo se agregan ahí.
  - **En vivo:** `npm run verify:redirects -- https://optioutlet-landing.vercel.app --follow`.
    - Contra `www` acepta un primer salto de dominio (www → raíz) y después exige el 301.
    - La query se compara por sus pares clave/valor decodificados y en orden. Vercel conserva claves, valores y orden, pero recodifica (`/` → `%2F`, `+` → `%20`).
    - `--skip-post` omite el único `POST /api/chat` (cuerpo inválido, 400) cuando ya se verificó en otra corrida de la misma ventana del firewall.
  - La redirección de `www` al raíz no va en `vercel.json`: se configura en el panel de dominios de Vercel. La lista del corte y la reversa están en `docs/verificacion-sesion-6.md`.
- `POST /api/chat` tiene un límite por IP en el firewall de Vercel (20 solicitudes cada 10 minutos, 429 al excederse). Se configura en el panel, no en código: ver `docs/verificacion-sesion-5.md`.

## Íconos y metadatos

- **Íconos provisionales** (`TODO(brand-svg)`): salen de la pupila del isotipo (`ISOTIPO_SHAPE` en `geometry.ts`, con la mordida rompiendo el borde) y de los colores de `brandColors.ts`. Se reemplazan cuando lleguen los SVG oficiales.
  - `public/favicon.svg`: pupila verde agua sobre fondo transparente.
  - `public/favicon.ico`: 16, 32 y 48 px, PNG dentro de un contenedor ICO.
  - `public/apple-touch-icon.png`: 180 × 180, pupila verde agua sobre azul marino, con 30 px de margen.
- **Regenerarlos** (los archivos generados se commitean): el generador `scripts/generate-icons.ts` usa herramientas aisladas en `.cache/tools/` (carpeta local, fuera de git) y el Google Chrome instalado. No descarga navegadores.
  ```sh
  # una vez: .cache/tools/package.json con versiones exactas (regla de versiones)
  # {"name":"qa-tools","private":true,"type":"module","dependencies":{"lighthouse":"13.5.0","playwright":"1.64.1","tsx":"4.23.15"}}
  npm --prefix .cache/tools install --before=AAAA-MM-DDT23:59:59Z
  node .cache/tools/node_modules/.bin/tsx scripts/generate-icons.ts
  ```
- **Metadatos en `index.html`:**
  - El `<title>` y la `meta description`.
  - Open Graph de texto (`og:type`, `og:site_name`, `og:locale`, `og:title`, `og:description`, `og:url`).
  - `<link rel="canonical" href="https://optioutlet.com.mx/">`, para que `optioutlet-landing.vercel.app` no compita como duplicado.
  - Sin `og:image`: pendiente en `docs/backlog.md`.

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
  - `MarketplaceLogos.tsx` (fila “También en” del hero) muestra los logos oficiales de `src/assets/brand/marketplaces/` en `<img>` (importados con `?no-inline` para que siempre salgan como archivo con hash). Esos SVG se usan tal cual se entregaron: no se editan ni se dibujan logos de terceros.
  - `Ribbon.tsx` es una banda continua: el lema se repite `RIBBON_REPEATS` veces con un largo fijo por repetición (`RIBBON_REPEAT_LENGTH`, vía `textLength`), y su progreso depende solo de la sección del cierre.
- `src/styles/brandColors.ts` — hexadecimales de marca para atributos SVG; debe coincidir con `@theme`.
- `src/components/layout/` — encabezado, footer y franja de patrón. `src/components/ui/ActionLink.tsx` — enlaces y CTAs.
- `src/sections/` — una sección de la página por archivo, en el orden de `App.tsx`.
- `docs/mockup/optioutlet-mockup.dc.html` — mockup aprobado (referencia, no ejecutable).
  - El mockup es referencia de diseño, no fuente de verdad. Donde la landing ya se apartó de él a propósito, gana la landing. Desviaciones conocidas: la fila "También en" usa los logos oficiales sobre pastillas blancas de 112×44 (el mockup muestra recuadros punteados con corchetes), y las tiendas se muestran sin enlace. Ver `docs/verificacion-sesion-7.md`.
- `src/consulta/` — dominio de la consulta: contrato (`types.ts`, `schema.ts`), catálogo, reglas, proveedor guionado y estado (`useConsulta.ts`). `src/content/consulta.ts` — guion de Opti.
- `src/consulta/providers/` — `scripted.ts` (guion), `api.ts` (llama a `/api/chat` y cae al guionado por turno) e `index.ts` (elige el proveedor).
- `server/consulta/` — servidor de la consulta: configuración (modelo y effort), validación de la solicitud, esquema de salida, system prompt, conversión de mensajes, combinación del perfil y `handleChat`. `server/http/` y `server/dev/` — adaptadores. `api/chat.ts` — función de Vercel.
- `scripts/eval-consulta.ts` — evaluación en vivo (`vitest.eval.config.ts`).
- `scripts/verify-redirects.ts` — verificación en vivo de las redirecciones (Node puro, sin imports de `.ts`); `scripts/redirect-cases.json` — su tabla de casos, compartida con `scripts/redirects.test.ts`. `scripts/generate-icons.ts` — generador de los íconos provisionales.
- `docs/verificacion-sesion-1.md` a `docs/verificacion-sesion-3.md`, `docs/verificacion-sesion-5.md` y `docs/verificacion-sesion-6.md` — cómo verificar la landing, la consulta, su conexión con Claude, el blindaje de la demo (planes A/B/C, límite del firewall, UTM) y los dominios (redirecciones, lista del corte y reversa); `docs/guion-demo.md` — guion de la presentación; `docs/backlog.md` — residuales abiertos.
