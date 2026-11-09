# Verificación · Sesión 5 — Blindaje de la demo

Esta sesión casi no cambia nada visible. Su trabajo es que la demo no pueda
fallar delante del cliente y que la URL pública no pueda gastar la API sin
límite.

Principio rector: **la demo nunca muestra un error y lo que ya funciona no se
mueve.**

## Los tres planes

| Plan | URL o comando | Quién responde | Solicitudes a `/api/chat` | Dominios externos |
|---|---|---|---|---|
| A | https://optioutlet-landing.vercel.app | Claude, con el guionado como respaldo por turno | 1 por turno | ninguno |
| B | https://optioutlet-landing.vercel.app/?demo=1 | Solo el guionado | **0** | ninguno |
| C | `npm run demo:local` → http://localhost:4173/?demo=1 | Solo el guionado, sin red | **0** | **ninguno** |

- `?demo=1` se lee una vez al cargar la página y tiene prioridad sobre
  `VITE_CONSULTA_PROVIDER`. Solo cuenta el valor exacto `1`; `demo=0`,
  `demo=true` o la ausencia del parámetro conservan el comportamiento normal.
- No hay indicador visible. En desarrollo, la consola avisa
  `[consulta] ?demo=1 → proveedor guionado (sin /api/chat)`.
- `npm run demo:local` = `npm run build && vite preview --open '/?demo=1'`.
  `vite preview` no tiene `/api/chat`; con `?demo=1` ni siquiera lo intenta.
- El guion de la presentación está en `docs/guion-demo.md`.

## Límite de solicitudes por visitante (firewall de Vercel)

Regla configurada por Brandon en el panel. No hay código: `vercel.json` no
admite rate limit, solo `deny` y `challenge`.

| Campo | Valor |
|---|---|
| Proyecto | optioutlet-landing → Firewall → ⋯ → Configure → Add New… → Rule |
| Nombre | `consulta-api-rate-limit` |
| Si | `Request Path` Equals `/api/chat` **y** `Method` Equals `POST` |
| Entonces | Rate Limit · Fixed Window · **10 min** · **20 solicitudes** · clave **IP** |
| Acción | Too Many Requests (**429**), sin Persistent Action |
| Aplicar | Save Rule → Review Changes → Publish (inmediato, sin volver a desplegar) |

- Está disponible en Hobby (1 regla) y en Pro. Ventana de 10 s a 10 min con
  Fixed Window.
- **20 cada 10 minutos** alcanza para unas tres consultas completas (de 4 a 7
  solicitudes cada una).
- El firewall responde antes que la función: un 429 no invoca `/api/chat` ni
  gasta Anthropic.
- Los contadores son por región de Vercel. En teoría, tráfico que entra por
  varias regiones puede pasar el límite de una sola.
- **Dónde se ve:** Firewall → vista general → selector de agrupación de
  tráfico → la regla. Muestra el tráfico en vivo de los últimos 10 minutos.
- **Cómo verificarla**, solo con cuerpos inválidos, que responden 400 sin
  llamar a Anthropic:
  - `POST /api/chat` con `{"bad":true}`, una solicitud tras otra, hasta recibir
    el 429.
  - Nunca con consultas reales en bucle.
  - La IP de quien prueba queda limitada hasta que termina la ventana.
- **Segunda barrera:** el tope de gasto en la consola de Anthropic, que
  configura Brandon.
- **En la página:** un 429 deja el resto de esa consulta en el guionado (ver
  “Lo que no se ve a simple vista”).

### Verificación del límite en producción (2026-11-09)

**Primer intento, 16:09:41 a 16:09:57 UTC:** 40 solicitudes y 40 respuestas
400, sin ningún 429. La regla todavía no estaba publicada; Brandon la publicó
después.

**Segundo intento:**
- Empezó a las 16:26:03 UTC. La última solicitud anterior fue a las 16:09:57,
  así que la ventana empezó limpia (más de 16 minutos).
- Fueron solicitudes en secuencia, cada ~0.4 s, todas con el cuerpo inválido
  `{"bad":true}`. Ninguna llegó a Anthropic.

| # | Hora (UTC) | Estado |
|---|---|---|
| 1 | 16:26:03.504 | 400 `{"error":"bad_request"}` |
| 2–19 | 16:26:04.339 → 16:26:11.225 | 400 (las 18) |
| 20 | 16:26:11.627 | 400 |
| **21** | **16:26:12.032** | **429** |

**La respuesta 429:**

```
HTTP 429
cache-control: private, no-store, max-age=0
content-type: application/json
server: Vercel
x-vercel-id: cle1::xcpgq-1794241572071-a8bf2aa45895
x-vercel-mitigated: deny

{"error":{"code":"429","message":"Too Many Requests","id":"cle1::xcpgq-1794241572071-a8bf2aa45895"}}
```

- La responde el firewall (`x-vercel-mitigated: deny`), no la función: el
  cuerpo no es el de `/api/chat`.
- No trae `Retry-After`.
- El cliente no lee el cuerpo: cualquier estado 429 pasa al guionado.

**Duración del bloqueo:** sondeo cada 30 s, también con cuerpo inválido.

- El último 429 llegó a las 16:35:46 (+574 s) y el primer 400 a las 16:36:16
  (+605 s).
- **El bloqueo duró entre 9 min 34 s y 10 min 5 s después del primer 429.**
  Coincide con el fin de la ventana fija de 10 minutos que empezó con la
  solicitud 1 (16:26:03).
- Fueron 19 sondeos con 429 y 1 con 400. Cuenta total del segundo intento:
  21 + 20 = 41 solicitudes, todas con cuerpo inválido.

**Resultado:** el límite responde 429 exactamente en la solicitud 21, como se
configuró (20 por IP cada 10 minutos). No hubo efecto visible de los contadores
por región: todo entró por `cle1`.

## Checklist final

- [x] El dominio de la tienda solo existe en el módulo de configuración y todos los enlaces pasan por `storeLink`.
- [x] Los enlaces llevan UTM por defecto, y los UTM de entrada se propagan sin reenviar nada más.
- [x] Con `?demo=1` no hay ninguna solicitud a `/api/chat`.
- [x] Un 429 deja la consulta en el guionado hasta reiniciarla; los demás fallos siguen siendo por turno.
- [x] Existe `npm run demo:local` y el Plan C no hace solicitudes a dominios externos.
- [x] Las fuentes se sirven desde el proyecto (la Fase 1 confirmó que ya era así).
- [x] Toda medición antes y después quedó dentro de 1 px.
- [x] Lighthouse está medido antes y después, y lo no arreglado está en el backlog (B1–B4).
- [x] Existen la pasada de WebKit y las listas manuales de R1 y R2 (cerradas con residual).
- [x] Los tres planes funcionan en el equipo real con las dos conversaciones del guion.
- [x] El límite del firewall responde 429 en producción, verificado solo con cuerpos inválidos.
- [x] Existen `docs/guion-demo.md` y `docs/verificacion-sesion-5.md`.
- [x] No se tocó el contrato, el system prompt, el motor de scroll ni ningún panel.
- [x] Ninguna fase cerró con «esto necesita su propia sesión».

## Futuro (documentado, no implementado)

- **Sesión 4:** catálogo real de J&J en `catalog.ts`, con el system prompt regenerado y la matriz de perfiles con datos reales.
- **Sesión 6:** `optioutlet.com.mx` y `www` en Vercel, las redirecciones 301 de las rutas viejas de la tienda a `shop.optioutlet.com.mx` y su verificación automática.
- **Presupuesto global diario en el servidor,** si el firewall y el límite de gasto no bastan.
- **Arranque de la consulta sin API** (backlog B5).
- **SEO, metadatos para compartir y métricas** (B3).
- **Aviso de privacidad** sobre el procesamiento con un proveedor de IA.
- **Respuestas en streaming,** si la latencia lo pide.

## Enlaces a la tienda y UTM

El dominio vive solo en `src/config/store.ts`:

- `STORE_URL` sale de `VITE_STORE_URL`; si falta, vale
  `https://shop.optioutlet.com.mx`.
- Todos los enlaces pasan por `storeLink(target, placement)`.

| Lugar (`utm_content`) | Texto | Componente |
|---|---|---|
| `header-tienda` | “Tienda” (se oculta con contenedor < 760 px) | `Header` |
| `hero-tienda` | “Prefiero ir directo a la tienda” | `Hero` |
| `cierre-tienda` | “Ir a la tienda” | `StoreCta` |
| `recomendacion-1` | “Ver en la tienda” del primer producto | `ProductCard` |
| `recomendacion-2` | “Ver en la tienda” del segundo producto | `ProductCard` |

**Sin UTM de entrada** (`https://optioutlet-landing.vercel.app/`):

```
https://shop.optioutlet.com.mx/?utm_source=landing&utm_medium=referral&utm_campaign=opti&utm_content=header-tienda
https://shop.optioutlet.com.mx/?utm_source=landing&utm_medium=referral&utm_campaign=opti&utm_content=recomendacion-1
```

**Con UTM de entrada**
(`…/?utm_source=instagram&utm_campaign=nov&demo=1&foo=x`): se reenvían solo
esos, sin mezclar con los de la landing, en todos los enlaces.

```
https://shop.optioutlet.com.mx/?utm_source=instagram&utm_campaign=nov
```

- Nunca se reenvía `demo` ni ninguna clave que no empiece con `utm_`.
- Un `utm_*` que ya traiga la URL destino se sobrescribe (`searchParams.set`),
  no se duplica.
- Una URL de producto con parámetros propios (`?variant=1`) los conserva, con
  un solo `?`.
- `Product.storeUrl` no cambió de forma. Una prueba verifica que el origen de
  cada producto del catálogo es el de `STORE_URL`.
- `scripts/storeDomain.test.ts` falla si el dominio aparece en cualquier
  archivo de `src/` fuera de `src/config/store.ts`.
  - Comprobado: falla con un archivo de prueba que lo contenía.
  - Corre dentro de `npm run check`, con el patrón por omisión de Vitest
    (`**/*.test.ts`).
  - La evaluación en vivo (`scripts/eval-consulta.ts`) no lleva `.test`, así
    que solo la corre `vitest.eval.config.ts`.
- **`VITE_STORE_URL` sí entra al build.** Con
  `VITE_STORE_URL=https://tienda-prueba.example`:
  - el bundle contiene `re("https://tienda-prueba.example") ?? "https://shop.optioutlet.com.mx"`;
  - los cinco enlaces de la página apuntan a `tienda-prueba.example`.
  - El dominio por defecto sigue en el bundle solo como valor de respaldo
    (para una variable vacía o inválida); no lo usa ningún enlace.
  - Ese build de prueba no se commiteó ni se publicó.
  - El build normal no contiene `tienda-prueba`.

## Residuales de la Sesión 1

### R1 · Pasada automatizada con WebKit

Hecha con Playwright 1.64.1 (WebKit 27.2) contra producción con `?demo=1`,
comparada con Chrome 157 usando las mismas expresiones
(`.cache/qa-s5/r1-run.mjs`, local).

| Medida | 1440 × 800 · Chrome | 1440 × 800 · WebKit | 1470 × 956 · Chrome | 1470 × 956 · WebKit |
|---|---|---|---|---|
| Alto del documento | 9111 | 9111 | 9580 | 9580 |
| Pin de Revelación | 884 → 2084 | 884 → 2084 | 884 → 2084 | 884 → 2084 |
| Pin de Cómo funciona | 2812 → 4312 | 2812 → 4312 | 2968 → 4468 | 2968 → 4468 |
| Pin de Perfiles | 5040 → 5976 | 5040 → 5976 | 5352 → 6288 | 5352 → 6288 |
| Modo compacto | no | no | no | no |
| Sección fijada a 72 px al 25/50/75 % | sí | sí | sí | sí |
| Consulta completa (`?demo=1`) | 2 productos | 2 productos | 2 productos | 2 productos |

**Resultado:** 0 diferencias de más de 1 px.

Una lectura aislada de Chrome dio 437 px en lugar de 72 al 25 % de “Cómo
funciona”. Fue un muestreo tomado antes de que el pin se enganchara, tras un
salto de 1,600 px. En dos corridas más dio 72/72/72.

### R1 · Lista manual en Safari real (Mac)

Abrir https://optioutlet-landing.vercel.app/?demo=1 en Safari, ventana
maximizada y zoom al 100%:

1. **Hero.**
   - Al mover el cursor, la pupila lo sigue y vuelve al centro al salir.
   - Al bajar, los trazos suben y giran, y el sello gira.
2. **Revelación.**
   - Se queda fija bajo el encabezado.
   - La pupila marino crece hasta cubrir la pantalla.
   - Aparecen Opti y el texto.
   - Nunca se ve un hueco blanco.
3. **Cómo funciona.**
   - Se fija.
   - El paso resaltado cambia dos veces.
   - El teléfono muestra la pantalla de cada paso.
   - Ningún paso queda cortado.
4. **Perfiles.**
   - Se fija y las cinco tarjetas corren a la izquierda.
   - La última termina alineada con el borde derecho de la columna.
5. **Consulta.**
   - Responder “Sí, ya los uso”, “Oficina y computadora”, “Todos los días”,
     “Sí” y “Sí, es reciente”.
   - Termina con dos productos “para astigmatismo”.
6. **Cierre.**
   - El texto del listón avanza por la U y termina en su final al llegar al
     fondo de la página, sin salirse del trazo.
7. **Sin brincos.** Al subir y bajar rápido, ninguna sección fijada brinca ni
   se corta.

Anota en `docs/backlog.md` (R1) cualquier punto que no se cumpla, con el tamaño
de ventana.

### R2 · Lista manual en iPhone

En Safari de iOS, con https://optioutlet-landing.vercel.app/?demo=1 y
“Reducir movimiento” apagado:

1. **Franja bajo el escenario fijo.**
   - Bajar despacio en la Revelación hasta que se esconda la barra de Safari.
   - La franja que se abre abajo tiene el fondo de la sección: verde menta al
     inicio y marino al final. Nunca blanco.
   - Repetir en Cómo funciona.
2. **Mirada en reposo.**
   - Quedarse en el hero sin tocar.
   - La pupila “mira” sola, con movimientos lentos cada 2.5 a 3.5 s.
   - Al bajar, se detiene.
3. **Pines con inercia.**
   - Deslizar fuerte, para que el scroll siga por inercia, al entrar y salir
     de la Revelación y de Cómo funciona.
   - La sección se engancha y se suelta sin brincos ni parpadeos.
4. **Modo compacto.** En Cómo funciona se ve un solo paso a la vez, junto al
   teléfono, y ningún paso queda cortado.
5. **Consulta.** La misma conversación de R1 termina con dos productos.

Anota el resultado en `docs/backlog.md` (R2).

### R3 · Lighthouse

Calificaciones y pendientes en `docs/backlog.md` (Sesión 5 · Fase 5).

- **Antes:** móvil 98 / 100 / 96 / 90 y escritorio 100 / 100 / 96 / 90
  (rendimiento, accesibilidad, buenas prácticas, SEO).
- **Después:** las mismas calificaciones, porque la caché ayuda en recargas y
  Lighthouse mide en frío.
- **Arreglado:** `vercel.json` con solo `headers`, que marca `/assets/*` como
  `public, max-age=31536000, immutable`.
- **Comprobado en producción:** `/` (el HTML) conserva
  `public, max-age=0, must-revalidate`; solo cambió `/assets/*`.

## Medición antes y después (geometría)

Build local con `vite preview`, Chrome 157 sin ventana. La medición base se
tomó antes de la Fase 2 y se repitió después de las Fases 2 y 3.

| Tamaño | Alto doc. | Revelación | Cómo funciona | Perfiles | Compacto |
|---|---|---|---|---|---|
| 375 × 812 | 11930 | 1271 → 2471 | 3211 → 4711 | apilado (sin pin) | sí |
| 768 × 1024 | 11427 | 1231 → 2431 | 3383 → 4883 | 5835 → 7264 | sí |
| 1440 × 800 | 9111 | 884 → 2084 | 2812 → 4312 | 5040 → 5976 | no |
| 1470 × 956 | 9580 | 884 → 2084 | 2968 → 4468 | 5352 → 6288 | no |

- **Resultado:** 93 valores comparados en cada medición (pines, alturas y
  posiciones de las 7 secciones, modo compacto y alto del documento), con 0
  diferencias de más de 1 px después de la Fase 2 y después de la Fase 3.
- La Fase 5 no tocó `src/`: solo `vercel.json` y documentos.
- La Fase 4 no hizo cambios: las fuentes ya se servían desde el proyecto.

## Pruebas en el equipo real (Fase 6, producción, Chrome 157)

Mac con pantalla integrada Liquid Retina de 2560 × 1664, que equivale a
1470 × 956 px CSS. En pantalla completa queda un área de 1470 × 923, por el
notch. La pantalla externa es de 1920 × 1080.

### Scroll

Ventana real de Chrome en pantalla completa. 1920 × 1080 en la pantalla
externa; 1280 × 720 emulado dentro de esa misma ventana. Recorrido de la página
completa a unos 1,000 px/s, con `?demo=1` para no gastar API.

| Tamaño | Alto doc. | Revelación | Cómo funciona | Perfiles | Fijada a 72 px (25/50/75 %) | Cuadros > 50 ms dentro de pines | Fuera de pines |
|---|---|---|---|---|---|---|---|
| 1470 × 923 (nativa) | 9480 | 884 → 2084 | 2935 → 4435 | 5286 → 6222 | sí en los 3 | 0 | 0 |
| 1920 × 1080 | 9952 | 884 → 2084 | 3092 → 4592 | 5600 → 6536 | sí en los 3 | 1 (53 ms, Revelación) | 0 |
| 1280 × 720 | 8853 | 856 → 2056 | 2704 → 4204 | 4852 → 5804 | sí en los 3 | 0 | 0 |

- Modo compacto: no, en los tres tamaños.
- **El cuadro de 53 ms a 1920 × 1080:** fue una pausa entre cuadros, sin un
  `long-animation-frame` asociado. Es el único en 672 cuadros y queda apenas
  arriba del umbral.

### Planes A, B y C

| Plan | Conversación | Cierre | Solicitudes a `/api/chat` | Respaldos al guionado | Total |
|---|---|---|---|---|---|
| A | Principal | `done`: quincenal y diario para astigmatismo | 6 | 0 | 14.4 s |
| A | Corta (ojo rojo) | `refer` | 4 | 0 | 8.4 s |
| B | Principal | `done`: los mismos dos productos | 0 | — | 7.1 s |
| B | Corta | `refer` | 0 | — | 5.3 s |
| C | Principal | `done`: los mismos dos productos | 0 | — | 6.7 s |
| C | Corta | `refer` | 0 | — | 4.6 s |

Cuenta como respaldo toda solicitud con estado distinto de 200, que falló, que
se canceló o que tardó 12 s o más. En el Plan C, el registro de red no tuvo
ninguna solicitud a un dominio que no fuera `localhost`.

**Tiempos por turno del Plan A**, el 2026-11-09 a las 15:58–15:59 UTC:

| Conversación | Turno 1 (en frío) | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Principal | 2,816 ms | 1,642 | 1,986 | 1,641 | 1,770 | 2,615 |
| Corta | 1,556 ms | 1,688 | 1,811 | 1,607 | — | — |

### Enlaces en producción

- Los cinco `href` llevan `utm_content` con su lugar (ver “Enlaces a la tienda y
  UTM”).
- **Destino:** `shop.optioutlet.com.mx` todavía **no resuelve** en DNS. El
  dominio raíz `optioutlet.com.mx` ya apunta a Shopify (23.227.38.32).
- Mientras no exista el subdominio, el clic abre una pestaña que no carga. No
  es un defecto de esta sesión.

## Qué NO es un defecto

- **Productos de marcador:** nombres entre corchetes, `[PRECIO]` y “Foto del
  producto”. El catálogo real llega en la Sesión 4.
- **Opti responde distinto en cada consulta con Claude.** Lo fijo es lo que
  exige el contrato: estado, perfil, opciones, productos y notas.
- **La tienda no responde** mientras no exista `shop.optioutlet.com.mx`.
- **Los errores de consola del listón** (`<textPath> startOffset`) y el 404 de
  `/favicon.ico`: no se ven en pantalla y están en el backlog (B1 y B2).
- **El dominio por defecto aparece una vez en el bundle,** como respaldo de
  `VITE_STORE_URL`.

## Lo que no se ve a simple vista

- **Propagación de UTM.** Si la visita llega con `utm_*` (por ejemplo, de un
  anuncio), esos son los que llegan a la tienda, en lugar de
  `utm_source=landing`. Se leen una vez al cargar y viven en memoria. Nada se
  guarda en el navegador.
- **Guionado fijo después de un 429.**
  - `createApiConsultaProvider` enciende una bandera con el primer 429. Ese
    turno y los siguientes los responde el guionado sin volver a llamar a
    `fetch`.
  - `start()` (“Volver a empezar” o recargar) la apaga y vuelve a intentar
    con Claude.
  - Los demás fallos (tiempo, 502, 503, red, turno inválido) siguen siendo de
    respaldo solo por turno.
  - Probado en `providerSelection.test.ts`: una sola llamada a `fetch` en una
    consulta completa después del 429. Al quitar la bandera, tres pruebas
    fallan.
- **Cero solicitudes con `?demo=1`.** `getConsultaProvider()` entrega el
  guionado y nunca construye el proveedor de API.
  - Probado con un `fetch` espía en una consulta completa.
  - Comprobado en el registro de red de producción (Plan B) y en local
    (Plan C).
- **Caché de estáticos.** `/assets/*` (JS, CSS y fuentes, con hash) se guarda
  un año. El HTML sigue con `max-age=0, must-revalidate`, así que cada
  despliegue se ve al recargar.

## Hallazgos de la Fase 1 (compuerta)

- **Enlaces a la tienda:** son los cinco de la tabla de UTM. Antes, el dominio
  estaba escrito en `src/content/landing.ts` (`STORE_URL`) y de ahí lo tomaba
  `catalog.ts`.
- **Catálogo:** el campo es `Product.storeUrl`, no `url`. Los marcadores ya
  usaban el origen de la tienda; no se corrigieron datos.
- **El servidor carga `catalog.ts` y `landing.ts` en Node.** Por eso
  `src/config/store.ts` lee `import.meta.env` y `location` con cuidado y usa
  imports con `.js`.
- **Proveedor:**
  - `getConsultaProvider()` es un singleton que se crea en el primer render.
  - Reiniciar la consulta pasa por `provider.start()`.
  - El guionado simula de 600 a 1,000 ms por turno.
- **Fuentes:** ya eran locales, con `@fontsource-variable` y solo el
  subconjunto latín. La página no pedía nada a dominios externos.
- **Rate limit de Vercel:**
  - Disponible en todos los planes.
  - Fixed Window de 10 s a 10 min en Hobby y Pro.
  - Claves IP o JA4.
  - Acción por defecto: 429.
  - Solo se configura en el panel o con el SDK.
- **Equipo:** Chrome 157.0.8103.38 y Node 22.22.3.
- **Herramientas de QA:**
  - `lighthouse@13.5.0` y `playwright@1.64.1`, las dos con 14 días o más,
    instaladas en `.cache/tools/` (ignorada por git), fuera de las
    dependencias del proyecto.
  - Navegadores en `.cache/ms-playwright/`.
  - Temporales en `.cache/tmp/`.
