# Verificación · Sesión 6 — Dominios: redirecciones, favicon y metadatos

El objetivo es que el corte de `optioutlet.com.mx` a Vercel no rompa ni un
enlace viejo de la tienda, y que la pestaña y el enlace compartido se vean de
Optioutlet.

Principio rector: **la landing solo es dueña de lo suyo** (`/`, `/assets/*`,
`/api/*` y los archivos de `public/`). Todo lo que era de la tienda se redirige
a `https://shop.optioutlet.com.mx` con su ruta y su query.

## 1. Cómo estaban los dominios antes del corte (2026-11-09)

### Registros DNS (GoDaddy)

Consultados con `dig` directo a `ns63` y `ns64.domaincontrol.com`. Los dos
responden igual.

| Registro | Valor | TTL | ¿Cambia en el corte? |
|---|---|---|---|
| A `@` | `23.227.38.32` (Shopify) | 600 | **Sí** → el valor que muestre Vercel |
| CNAME `www` | `shops.myshopify.com.` | 600 | **Sí** → el valor que muestre Vercel |
| AAAA `@` | (ninguno) | — | No |
| CNAME `shop` | `shops.myshopify.com.` | 3600 | **Nunca** |
| CNAME `26c306fb-e2f7-444e-8527-4ac3b0ef03b6` | `dns-verification.shopify.com.` | 3600 | **Nunca** (verificación de Shopify) |
| CNAME `_domainconnect` | `_domainconnect.gd.domaincontrol.com.` | 3600 | **Nunca** |
| TXT `_dmarc` | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | 3600 | **Nunca** |
| NS | `ns63.domaincontrol.com.`, `ns64.domaincontrol.com.` | 3600 | **Nunca** |
| SOA | `ns63.domaincontrol.com. dns.jomax.net. 2026110902 28800 7200 604800 600` | 3600 | **Nunca** |
| MX | (ninguno: no hay correo con el dominio que se pueda romper) | — | — |
| CAA | (ninguno: no bloquea el certificado de Vercel) | — | — |

Todo coincide con lo esperado.

### Cómo redirige Shopify hoy

`curl -I` a `https://optioutlet.com.mx`, sin seguir redirecciones. Es la
referencia de lo que el corte no debe empeorar.

| Ruta pedida | Código | `Location` |
|---|---|---|
| `/products/x?utm_source=test&variant=1` | 301 | `https://shop.optioutlet.com.mx/products/x?utm_source=test&variant=1` |
| `/collections/vampiros?utm_source=test` | 301 | `https://shop.optioutlet.com.mx/collections/vampiros?utm_source=test` |
| `/cart?utm_source=test` | 301 | `https://shop.optioutlet.com.mx/cart?utm_source=test` |
| `/pages/contact?utm_source=test` | 301 | `https://shop.optioutlet.com.mx/pages/contact?utm_source=test` |
| `/discount/PRUEBA?redirect=/collections/anime&utm_source=test` | 301 | `https://shop.optioutlet.com.mx/discount/PRUEBA?redirect=/collections/anime&utm_source=test` |
| `/sitemap.xml?utm_source=test` | 301 | `https://shop.optioutlet.com.mx/sitemap.xml?utm_source=test` |
| `/account/login?utm_source=test` | 302 | `https://shopify.com/102718701700/account?…` (la query se pierde) |
| `/`, `/robots.txt`, `/assets/x.js` | 301 | la misma ruta en `shop.` |
| `/favicon.ico` | 404 | — |
| `https://www.optioutlet.com.mx/collections/anime?utm_source=test` | 301 | `https://shop.optioutlet.com.mx/collections/anime?utm_source=test` |

- La cabecera de esas respuestas es `x-redirect-reason: primary_domain_redirection`.
- El id numérico de la tienda es `102718701700`.
- Hoy Shopify redirige **todo**. Después del corte, `/`, `/assets/*`, `/api/*`,
  los íconos y `/robots.txt` son de la landing; lo demás sigue a la tienda.

## 2. Los prefijos que se redirigen

Origen: **sitemap** (`https://shop.optioutlet.com.mx/sitemap.xml` y sus
sitemaps hijos, leídos el 2026-11-09), **docs** (documentación oficial de
Shopify), **tienda** (respuesta real con `curl -I` a `shop.`, robots.txt de la
tienda) o **decisión** (lista de la decisión 4 del prompt de la sesión).

| Prefijo | Origen | URLs en el sitemap | Respuesta hoy en `shop.` |
|---|---|---|---|
| `/products` | sitemap, decisión | 65 | 200 |
| `/collections` | sitemap, decisión | 15 | 200 |
| `/pages` | sitemap, decisión | 3 (`contact`, `envio`, `preguntas-frecuentes`) | 200 |
| `/agents.md` | sitemap (`sitemap_agentic_discovery.xml`) | 1 | 200 |
| `/sitemap.xml` y `/sitemap_*.xml` | sitemap, decisión | 4 hijos | 200 |
| `/cart` | decisión, docs (reservado) | — | 200 |
| `/carts` | docs (reservado) | — | — |
| `/blogs` | decisión | — | 404 (no hay blog hoy) |
| `/search` | decisión | — | 200 |
| `/account` | decisión | — | 302 a `shopify.com` |
| `/customer_authentication` | tienda | — | 302 a `shopify.com` |
| `/policies` | decisión | — | 200 |
| `/discount` | decisión | — | 302 |
| `/gift_cards` | decisión | — | 404 |
| `/checkout` | tienda (robots.txt) | — | 302 |
| `/checkouts` | decisión | — | 404 sin token |
| `/orders` | docs (reservado), robots.txt | — | 404 sin token |
| `/<id de la tienda>/…` (`/102718701700/orders/…`, `/…/checkouts/…`) | decisión, robots.txt | — | 404 sin token |
| `/apps`, `/a`, `/community`, `/tools` | decisión, docs (app proxies) | — | 404 (sin apps con proxy hoy) |
| `/application` | docs (reservado) | — | — |
| `/cdn` | decisión | — | 200 con un archivo real |
| `/password` | decisión | — | 302 a `/` |
| `/services` | docs (reservado), robots.txt | — | 404 |
| `/recommendations` | robots.txt | — | 422 |
| `/admin` | tienda | — | 301 a myshopify |
| `/sf_*` | robots.txt | — | 401 |
| `/llms.txt` | tienda | — | 200 |
| `/products.json`, `/collections.json`, `/search.json`, `/cart.js`, `/cart.json` | tienda | — | 200 |

**No se redirigen:**
- `/shop`, aunque Shopify lo menciona como reservado: no responde nada en la
  tienda y es demasiado genérico.
- `/.well-known/*`: Vercel reserva `/.well-known/acme-challenge`, y
  `/.well-known/ucp` se anuncia relativo al host de la tienda.
- Los prefijos de idioma (`/en/…`): la tienda no tiene idiomas extra (404).

### Las reglas (`vercel.json`, `redirects`)

Son cuatro reglas, todas con `statusCode: 301`:

1. **Ruta exacta de cada prefijo**, con o sin diagonal final: `/cart` y
   `/cart/` → `https://shop.optioutlet.com.mx/cart`.
2. **Subrutas de cada prefijo:** `/products/x` →
   `https://shop.optioutlet.com.mx/products/x`.
3. **Id numérico de la tienda con subruta:** `/:shopId(\d+)/:path+`.
4. **Archivos sueltos:** los sitemaps, `agents.md`, `llms.txt` y los
   `.json`/`.js` de la raíz.

`/:path*` no sirve aquí: Vercel arma `Location` como `…/cart/$1`, y `/cart`
exacto terminaría en `/cart/`. Por eso hay una regla exacta y otra de
subrutas.

## 3. Pruebas dentro de `npm run check`

**`scripts/redirects.test.ts`** convierte `vercel.json` con
`@vercel/routing-utils@6.6.0`, la biblioteca con que Vercel convierte
`redirects` en rutas. Las expresiones regulares probadas son las que evalúa
el CDN. Comprueba que:
- Todas las reglas llevan `statusCode: 301` y ninguna lleva `permanent`.
- El origen de cada destino es el de `DEFAULT_STORE_URL` (`src/config/store.ts`).
  Si cambia el dominio de la tienda, la prueba falla hasta actualizar
  `vercel.json`.
- Ninguna regla coincide con `/`, `/index.html`, `/assets/…`, `/api/chat`,
  `/robots.txt`, `/.well-known/acme-challenge/…` ni con ningún archivo de
  `public/`.
- Cada caso de la tienda coincide con una regla y produce la misma ruta en
  `shop.`.
- Cada prefijo requerido (los de la decisión 4 más los de la Fase 1) tiene al
  menos un caso, y cada regla también.
- Los `headers` de caché de la Sesión 5 siguen idénticos.

Además se comprobó que la prueba falla con reglas rotas: con un `308`, con
`/assets` y `/favicon.ico` agregados a los prefijos, y con otro dominio de
destino.

**`scripts/redirectChain.test.ts`** prueba `evaluateChain()` de
`scripts/verify-redirects.ts` con respuestas sintéticas. **Pasan:**
- Un 301 directo.
- Un salto de dominio y después el 301.
- Un salto de dominio y después un 200 en `/`.
- Una query recodificada.
- Un salto de dominio con la query recodificada.

**Fallan:**
- Un salto a otra ruta.
- Dos saltos de dominio.
- Un 308 a la tienda.
- Una ruta de la landing redirigida a la tienda.
- Una query con un valor cambiado, con una clave de menos o en otro orden.

Otra prueba confirma que importar el script no llama a `fetch`: usa un `fetch`
espía, que queda con 0 llamadas.

La tabla de casos, compartida por la prueba y el script, es
`scripts/redirect-cases.json`:
- 42 rutas de la tienda, con UTM, `?variant=`, `?redirect=`, rutas exactas y
  subrutas.
- 7 rutas de la landing.

## 4. `npm run verify:redirects`

Verificación en vivo. No forma parte de `check`. Todas las solicitudes van con
`redirect: 'manual'`.

```sh
npm run verify:redirects -- <url base>                       # solo las respuestas de la landing
npm run verify:redirects -- <url base> --follow              # además, pide cada destino en la tienda
npm run verify:redirects -- <url base> --follow --skip-post  # sin el POST /api/chat (ya verificado en la misma ventana)
```

- **Rutas de la tienda:** 301 con el `Location` exacto.
  - El origen y la ruta se comparan byte por byte.
  - La query se compara como la lista ordenada de pares clave/valor ya
    decodificados (ver «Lo que no se ve a simple vista»).
- **Rutas de la landing:**
  - 200 en `/` (con `Cache-Control: public, max-age=0, must-revalidate`), en
    `/?demo=1&utm_…`, en `/favicon.ico`, en `/favicon.svg` y en
    `/apple-touch-icon.png`.
  - 200 en un archivo real de `/assets/`, tomado del HTML, con
    `public, max-age=31536000, immutable`.
  - 400 en **un** `POST /api/chat` con `{"bad":true}`, que no llega a Anthropic.
- **`--follow`:** pide en la tienda cada `Location` que devolvió la landing.
  - Un 404 significa que la ruta de ejemplo no existe en la tienda; se reporta
    aparte y no es falla.
  - Las fallas son un 5xx o un error de red.
- **Salto de dominio, contra `www` después del corte:** la primera respuesta
  será la redirección de dominio del panel de Vercel (`www` → raíz,
  normalmente 308), y nuestra 301 llega en el segundo salto. Ese primer salto
  se acepta y se reporta, con estas condiciones:
  - Que sea 301 o 308.
  - Que vaya a otro host que no sea la tienda.
  - Que conserve la misma ruta y la misma query.

  Cualquier otro salto previo, o más de uno, es falla. Esto vale también para
  las rutas de la landing: `/` debe terminar en 200 después del salto.
- Sale con código 1 si algo falla.

### Corrida contra `https://optioutlet-landing.vercel.app` (2026-11-09)

Primero se confirmó que producción servía las reglas: `/cart` respondió 301 a
los 40 s del push de `771a840`.

**Primera corrida (`--follow`)**, con el único `POST /api/chat` de la sesión:
- Resultado: **45/49**. El POST respondió **400** y las rutas de la landing y
  las cabeceras de caché pasaron.
- Las 4 fallas eran la recodificación de la query (sección 6), no las reglas:
  `/search?q=lentes+de+contacto…`, `/account/login?return_url=/account`,
  `/customer_authentication/login?return_to=/account` y
  `/discount/HALLOWEEN?redirect=/collections/anime…`.
- Con la decisión de Brandon de comparar la query por pares decodificados, el
  criterio se corrigió en `2e00317`.

**Corrida final (`--follow --skip-post`): 48/48, 0 saltos de dominio.**

```
PASS  /products/pupilentes-rojo-vampiro-combo-halloween?variant=1&utm_source=halloween&utm_medium=email&utm_campaign=nov  301 → https://shop.optioutlet.com.mx/products/…?variant=1&utm_source=halloween&utm_medium=email&utm_campaign=nov
PASS  /cart/  301 → https://shop.optioutlet.com.mx/cart
PASS  /discount/HALLOWEEN?redirect=/collections/anime&utm_…  301 → https://shop.optioutlet.com.mx/discount/HALLOWEEN?redirect=%2Fcollections%2Fanime&utm_…
PASS  /102718701700/orders/abc123/authenticate?key=def456  301 → https://shop.optioutlet.com.mx/102718701700/orders/abc123/authenticate?key=def456
PASS  /sitemap_products_1.xml?from=10509647478916&to=15400114126980  301 → https://shop.optioutlet.com.mx/sitemap_products_1.xml?from=10509647478916&to=15400114126980
… (42 rutas de la tienda, todas PASS)
PASS  GET /  200  cache-control: public, max-age=0, must-revalidate
PASS  GET /assets/index--Vr_0EpG.js  200  cache-control: public, max-age=31536000, immutable
PASS  GET /favicon.ico  200
SKIP  POST /api/chat  --skip-post (expected 400; checked in an earlier run)
```

**`--follow`, cómo respondió la tienda a cada destino:**

| Respuesta | Destinos |
|---|---|
| **200** (21) | productos, colecciones (incluida `/collections/all?sort_by=…&page=2`), `/cart`, `/pages/contact`, `/search?q=lentes%20de%20contacto…`, `/policies/privacy-policy`, `/cdn/shop/files/logo.png`, `/password` (termina en `/`), los 3 sitemaps, `agents.md`, `llms.txt`, `products.json`, `collections.json`, `cart.js`. **El descuento** con `redirect=%2Fcollections%2Fanime` terminó en `/collections/anime?utm_…`: Shopify decodifica la query recodificada y el enlace de descuento funciona. |
| **404, la ruta de ejemplo no existe en la tienda** (12) | `/cart/c/abc123`, `/carts/abc123`, `/blogs/news/primer-articulo`, `/gift_cards/abc123`, `/orders/abc123`, `/apps/reviews`, `/application/abc`, `/a/loyalty`, `/community/abc`, `/tools/abc`, `/102718701700/orders/abc123/authenticate`, `/102718701700/checkouts/cn/abc123/thank-you`. Son tokens inventados o funciones que la tienda no tiene. |
| **Otra respuesta de Shopify** | 403 en `/checkout` y `/checkouts/cn/abc123` (checkout sin carrito); 400 en `/services/…` y `/admin` (termina en myshopify); 422 en `/recommendations/products`; 401 en `/sf_private_access_tokens`. |
| **406 / 429 de `shopify.com`** | `/account`, `/account/login` y `/customer_authentication/login` llegan a `shopify.com/authentication/…`, ya fuera de la tienda, que rechaza clientes que no son navegador. En Chrome abren el inicio de sesión. |

Ningún 5xx ni error de red.

## 5. El corte (lo hace Brandon, en este orden)

Antes de empezar, `npm run verify:redirects -- https://optioutlet-landing.vercel.app --follow`
debe pasar (sección 4).

1. **Vercel → proyecto `optioutlet-landing` → Settings → Domains → Add:**
   `optioutlet.com.mx`.
   - Cuando ofrezca agregar `www.optioutlet.com.mx`, acéptalo con **«Redirect
     to optioutlet.com.mx»** (redirección de `www` al raíz). Esa redirección
     vive en el panel, no en `vercel.json`.
   - En el método de conexión, elige **registros A y CNAME**. **Nunca** cambies
     los servidores de nombres a los de Vercel: el DNS se queda en GoDaddy.
   - Anota los dos valores que muestra Vercel: el **A de `@`** y el **CNAME de
     `www`**.
2. **GoDaddy → DNS de `optioutlet.com.mx`:** cambia **solo** estos dos
   registros, con TTL de 600 s.
   - A `@`: de `23.227.38.32` al valor de Vercel.
   - CNAME `www`: de `shops.myshopify.com` al valor de Vercel.
   - No toques `shop`, `26c306fb-e2f7-444e-8527-4ac3b0ef03b6`,
     `_domainconnect`, `_dmarc`, NS ni SOA.
3. **Espera** a que Vercel marque los dos dominios como **Valid Configuration**
   y emita el certificado. Con TTL de 600 s, unos 10 minutos más la emisión.
   - Comprobación: `dig +short optioutlet.com.mx @ns63.domaincontrol.com`
     muestra el valor de Vercel.
   - `curl -sI https://optioutlet.com.mx/` responde 200 con `server: Vercel`.
4. **Verifica los dos dominios:**
   ```sh
   npm run verify:redirects -- https://optioutlet.com.mx --follow
   npm run verify:redirects -- https://www.optioutlet.com.mx --follow
   ```
   - Contra `www`, cada caso debe mostrar primero el salto de dominio (`308 →
     https://optioutlet.com.mx/…`) y después el resultado normal.
   - Las dos corridas hacen 2 `POST /api/chat` inválidos en total, lejos del
     límite de 20 cada 10 minutos.
5. **Shopify → Configuración → Dominios:** quita `optioutlet.com.mx` y
   `www.optioutlet.com.mx`.
   - **No** quites `shop.optioutlet.com.mx`, que sigue como dominio
     principal.
   - Después, repite el paso 4.

## 6. La reversa (si algo sale mal después del paso 2)

En GoDaddy, devuelve los dos registros a los valores exactos de antes:

| Registro | Valor | TTL |
|---|---|---|
| A `@` | `23.227.38.32` | 600 |
| CNAME `www` | `shops.myshopify.com` | 600 |

- Si ya hiciste el paso 5, vuelve a conectar `optioutlet.com.mx` y `www` en
  Shopify (como dominios secundarios que redirigen al principal,
  `shop.optioutlet.com.mx`). Así vuelve la redirección de la sección 1.
- En unos 10 minutos (TTL de 600 s) los resolvedores vuelven a Shopify.
  Compruébalo con `curl -sI https://optioutlet.com.mx/cart`: debe responder
  301 con `x-redirect-reason: primary_domain_redirection`.
- La demo sigue funcionando todo ese tiempo en
  https://optioutlet-landing.vercel.app (Plan A′ de `docs/guion-demo.md`).

## 7. Qué NO es defecto

- **`optioutlet-landing.vercel.app` también redirige las rutas de la tienda.**
  Las reglas aplican a todos los dominios del proyecto. Así se verificaron
  antes del corte, sin afectar a nadie.
- **Una ruta de ejemplo que ya no existe en la tienda responde 404 en
  Shopify.** La redirección hizo su parte (301 con la misma ruta); el 404 es
  de la tienda.
- **`/` deja de redirigir a la tienda.** Desde el corte, quien entra a
  `optioutlet.com.mx` ve la landing, y los enlaces viejos a la portada de la
  tienda también. Es intencional: la landing es la nueva portada y enlaza a la
  tienda.
- **`/robots.txt` responde 404 en la landing.** No se redirige (decisión 6). Un
  `robots.txt` propio es trabajo futuro.
- **Las rutas con mayúsculas no se redirigen** (`/Products/x`): en `vercel.json`
  el `source` distingue mayúsculas. Shopify genera todas sus URLs en
  minúsculas.
- **El canonical apunta a `https://optioutlet.com.mx/` también desde
  `vercel.app`.** Es para que `vercel.app` no compita como duplicado.
  Lighthouse no lo marcó (canonical = 1).
- **El ícono de la pestaña sale del `.ico`.** Chrome guardó los cuadros de 16 y
  32 px de `favicon.ico` aunque también existe `favicon.svg`. Es la misma
  pupila.

## 8. Lo que no se ve a simple vista

- **301, no 308.** `permanent: true` produce 308 en Vercel; las reglas usan
  `statusCode: 301` explícito, como hacía Shopify. La prueba lo exige.
- **La query se conserva, pero recodificada.** Vercel conserva todas las claves,
  sus valores y su orden, pero vuelve a codificar cada valor:

  | Llega | Sale |
  |---|---|
  | `?x=a+b` | `?x=a%20b` |
  | `?redirect=/collections/anime` | `?redirect=%2Fcollections%2Fanime` |
  | `?x=a:b,c@d` | `?x=a%3Ab%2Cc%40d` |
  | `?x=ñ` | `?x=%C3%B1` |
  | `?x=1&&y=2` | `?x=1&y=2` |
  | `?foo`, `?a=1&a=2`, `?x=%2B1`, `?x=` | sin cambio |

  - Decodificados, los valores son idénticos, y Shopify los lee igual: el
    descuento llega a su colección y la búsqueda da 200.
  - Ninguna opción de `vercel.json` conserva los bytes originales. Por eso
    `verify:redirects` compara la query por pares decodificados y en orden
    (decisión de Brandon en esta sesión).
- **El destino está sincronizado con `DEFAULT_STORE_URL`.** `vercel.json` no
  puede leer `src/config/store.ts`, así que una prueba compara los dos
  orígenes.
- **La diagonal final.** `/cart/` llega a `/cart`. Las subrutas con diagonal
  final (`/products/x/`) también se redirigen, sin la diagonal.
- **Una redirección taparía un archivo de la landing.** Vercel evalúa
  `redirects` antes que el sistema de archivos. Por eso la prueba revisa cada
  archivo de `public/` contra las reglas.

## 9. Favicon y metadatos (B2 y B3)

- **Íconos provisionales** (`TODO(brand-svg)`), derivados de `ISOTIPO_SHAPE`,
  con la mordida rompiendo el borde:
  - `public/favicon.svg`: verde agua `#67bbb5`, fondo transparente.
  - `public/favicon.ico`: 16, 32 y 48 px.
  - `public/apple-touch-icon.png`: 180 × 180, pupila de 120 px sobre
    `#214367`.
  - Se generan con `scripts/generate-icons.ts` (README › Íconos y metadatos),
    con tsx 4.23.15 y Playwright 1.64.1 en `.cache/tools/` y el Chrome
    instalado.
- **Metadatos en `index.html`:**
  - Se conserva el `<title>`.
  - Meta description.
  - `og:type` `website`, `og:site_name` `Optioutlet`, `og:locale` `es_MX`,
    `og:title`, `og:description` y `og:url` `https://optioutlet.com.mx/`.
  - `<link rel="canonical" href="https://optioutlet.com.mx/">`.
  - Sin `og:image`.
- **En producción:**
  - `/favicon.ico`, `/favicon.svg` y `/apple-touch-icon.png` responden 200.
  - Los metadatos salen en el HTML servido.
- **Chrome 157, con ventana real:** el ícono que guardó para la pestaña
  (base `Favicons` del perfil) es, byte por byte, el cuadro de 32 px de
  `favicon.ico`. No se pudo tomar captura de la pestaña porque el equipo no
  tiene el permiso de grabación de pantalla.

### Lighthouse

Lighthouse 13.5.0 con Chrome 157, en producción con `?demo=1`. Tres corridas
por formato, mediana.

| Formato | Momento | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|---|
| Móvil | Antes | 97 | 100 | 96 | 90 |
| Móvil | Después | 98 | 100 | 96 | **100** |
| Escritorio | Antes | 100 | 100 | 96 | 90 |
| Escritorio | Después | 100 | 100 | 96 | **100** |

| Métrica (mediana) | Móvil antes → después | Escritorio antes → después |
|---|---|---|
| FCP | 1,753 → 1,741 ms | 409 → 407 ms |
| LCP | 1,884 → 1,827 ms | 452 → 440 ms |
| TBT | 147 → 72 ms | 12 → 2 ms |
| CLS | 0.025 → 0.025 | 0.023 → 0.023 |

- **Rendimiento:** las corridas móviles de antes fueron 97/98/90 y las de
  después 98/98/99. La variación es de la red, no del cambio: el bundle JS y
  CSS es el mismo (`index-D7GAmraI.js`, `index-eF2o0y_s.css`).
- **SEO:** sube a 100 por la meta description. El canonical pasa (1).
- **Buenas prácticas:** sigue en 96. Desaparece el 404 del favicon y quedan
  solo los 21 errores del listón (B1). Errores de consola por carga: 22 → 21.

### Geometría

`.cache/qa-s5/geom.mjs` antes y después, en producción con `?demo=1`, a
375 × 812, 768 × 1024, 1440 × 800 y 1470 × 956. Mide pines, alturas de
sección, modo compacto y altura del documento: **93 números comparados, 0
diferencias de más de 1 px**.

## 10. Checklist final

- [x] Todas las reglas de redirección responden 301 y conservan ruta y query (query por pares decodificados, sección 8).
- [x] Ninguna ruta de la landing se redirige.
- [x] El destino de `vercel.json` está sincronizado con `DEFAULT_STORE_URL` por una prueba.
- [x] Existe `npm run verify:redirects` y pasó con `--follow` contra `optioutlet-landing.vercel.app` (48/48).
- [x] Los `headers` de caché de la Sesión 5 siguen iguales (prueba en `check` y cabeceras en vivo).
- [x] El favicon aparece en Chrome y `/favicon.ico` responde 200.
- [x] Están la meta description, las etiquetas Open Graph de texto y el canonical.
- [x] Lighthouse está medido antes y después; la geometría no se movió más de 1 px.
- [x] El guion usa el dominio final y tiene el Plan A′.
- [x] Existe este documento, con la lista del corte para GoDaddy y la reversa.
- [x] No se tocó ningún panel, el servidor, la consulta ni el motor de scroll.
- [x] Ninguna fase cerró con «esto necesita su propia sesión».

## 11. Verificación posterior al corte (2026-11-09, 18:16 UTC)

Brandon hizo el corte: el A de `@` y el CNAME de `www` en GoDaddy, sin
cambiar los servidores de nombres, y `www` → raíz en el panel de Vercel.
`optioutlet.com.mx` y `www` siguen conectados en Shopify; se quitan después
de esta verificación (paso 5 de la sección 5). No se tocó ningún panel ni
registro DNS desde aquí.

### DNS

Consultado con `dig` a `ns63.domaincontrol.com` y a `1.1.1.1`. Los dos
responden igual.

| Registro | Antes | Ahora | TTL |
|---|---|---|---|
| A `@` | `23.227.38.32` | **`216.198.79.1`** (Vercel) | 600 |
| CNAME `www` | `shops.myshopify.com.` | **`6e7eba3c4d24d816.vercel-dns-017.com.`**, que resuelve a `216.198.79.1` y `64.29.17.1` | 600 |
| AAAA `@` | (ninguno) | (ninguno) | — |
| CNAME `shop` | `shops.myshopify.com.` | sin cambio | 3600 |
| CNAME `26c306fb-e2f7-444e-8527-4ac3b0ef03b6` | `dns-verification.shopify.com.` | sin cambio | 3600 |
| CNAME `_domainconnect` | `_domainconnect.gd.domaincontrol.com.` | sin cambio | 3600 |
| TXT `_dmarc` | `v=DMARC1; p=quarantine; …` | sin cambio | 3600 |
| NS | `ns63` y `ns64.domaincontrol.com` | sin cambio | 3600 |
| MX | (ninguno) | (ninguno) | — |

### Certificados y HTML (`curl -vI`)

- **`https://optioutlet.com.mx`:** TLS 1.3, `CN=optioutlet.com.mx`, Let's Encrypt
  YR1, válido del 2026-11-09 al 2027-02-07, `SSL certificate verify ok`.
  Responde `HTTP/2 200` con `server: Vercel` y
  `cache-control: public, max-age=0, must-revalidate`.
- **`https://www.optioutlet.com.mx`:** TLS 1.3, `CN=www.optioutlet.com.mx`, Let's
  Encrypt YR2, válido del 2026-11-09 al 2027-02-07, `SSL certificate verify ok`.
  Responde `HTTP/2 308` con `location: https://optioutlet.com.mx/`.
- **El HTML de `/`** es la landing de `main` (`a56d670`): `index--Vr_0EpG.js` e
  `index-CdNXuJZq.css`, los mismos hashes que el build local. Lleva el título
  y el canonical.

### `verify:redirects`

Sin `--skip-post`, un POST inválido por corrida y unos segundos entre
corridas.

| Corrida | Resultado | Saltos de dominio | POST `/api/chat` | 404 de la tienda (rutas de ejemplo) | 5xx / errores |
|---|---|---|---|---|---|
| `https://optioutlet.com.mx --follow` | **49/49** | 0 | 400 | 12 | 0 |
| `https://www.optioutlet.com.mx --follow` | **49/49** | **49** (todos `308 → https://optioutlet.com.mx/…`, con la misma ruta y query) | 400, tras el 308 | 12 | 0 |

- En los dos dominios, las 42 rutas de la tienda responden 301 con su ruta y
  query (pares decodificados).
- `/` y el asset conservan las cabeceras de caché de la Sesión 5.
- El descuento (`redirect=%2Fcollections%2Fanime`) termina en
  `/collections/anime`.
- Contra `www` se vio el salto de dominio esperado antes de cada resultado.
- Las respuestas de la tienda con `--follow` son las mismas que en la sección 4.

### Lighthouse en el dominio final (medición SEO definitiva)

`https://optioutlet.com.mx/?demo=1`, Lighthouse 13.5.0 con Chrome 157, perfil
temporal en `.cache/tmp`. Tres corridas por formato, mediana.

| Formato | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Móvil | 99 (98/99/99) | 100 | 96 | **100** |
| Escritorio | 100 | 100 | 96 | **100** |

- **Medianas:** FCP móvil 1,684 ms, LCP 1,783 ms, TBT 56 ms y CLS 0.026;
  escritorio 394 ms, 422 ms, 0 ms y 0.023.
- **Canonical:** 1. Ahora apunta a la misma URL que se mide.
  `meta-description` = 1 e `is-crawlable` = 1.
- **Buenas prácticas:** 96 por los 21 errores del listón (B1), los únicos de la
  consola.

**Resultado: la verificación posterior al corte pasa.** Siguiente paso de
Brandon: quitar `optioutlet.com.mx` y `www` de Shopify (sección 5, paso 5) y
repetir las dos corridas de `verify:redirects`.

## 12. Futuro (documentado, no implementado)

- **Repetir `verify:redirects`** contra los dos dominios después de quitarlos de
  Shopify (sección 5, paso 5). La verificación posterior al corte ya pasó
  (sección 11).
- **`og:image`** (pieza de la diseñadora), el **sitemap** y el **`robots.txt`**
  propios de la landing, y **Search Console**.
- **B1** (errores de consola del listón), **B4** (cadena de carga de fuentes) y
  **B5** (costo del arranque automático de la consulta).
- **Sesión 4:** catálogo real de J&J.
- **Íconos oficiales:** reemplazar los provisionales cuando lleguen los SVG de
  marca (`TODO(brand-svg)`).
