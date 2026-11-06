# Verificación · Sesión 2 — Consulta con Opti (motor guionado)

La consulta ya funciona de punta a punta en la página, sin red y sin IA: Opti
hace las cinco preguntas, entiende opciones o texto libre, arma el perfil y
recomienda dos productos del catálogo con la razón de cada uno.

## Cómo probarla

```bash
npm install
npm run start:dev        # http://localhost:5173
npm test                 # pruebas del dominio, del proveedor y del reducer
```

1. Abre la página. La consulta **no** arranca al cargar.
2. Baja hasta "Empieza tu consulta" o toca "Empezar mi consulta". Al entrar la
   sección en pantalla, Opti escribe (tres puntos, 0.6 a 1 s) y saluda.
3. Contesta con las opciones o escribiendo en el campo (Enter o "Enviar").
4. Para empezar de nuevo, "Volver a empezar". Recargar la página también
   reinicia: la conversación no se guarda en ningún lado.

## Matriz de recorridos

| Recorrido | Qué hacer | Estado esperado |
|---|---|---|
| Oficina / diario | Sí, ya los uso → Oficina y computadora → Todos los días → No → Sí, es reciente | "Listo". 1.ª opción **[Producto J&J quincenal]** (Reemplazo cada 2 semanas · Silicona hidrogel · Esférico), razón "Porque pasas buena parte del día frente a la computadora y los usarías todos los días." 2.ª **[Producto J&J diario]**. Sin avisos. |
| Deporte / ocasional | Sería mi primera vez → Afuera y en movimiento → Solo en ocasiones especiales → No → Sí, es reciente | 1.ª **[Producto J&J diario]**; 2.ª quincenal. La razón incluye "pasas el día afuera y en movimiento", "ocasiones especiales" y "sería tu primera vez". |
| Astigmatismo sí | Cualquier camino con "Sí" en la cuarta pregunta | Las **dos** tarjetas son "para astigmatismo" (etiqueta "Para astigmatismo"). Nunca un esférico. |
| Astigmatismo dudoso | "No estoy seguro" en la cuarta | Tarjetas esféricas y el aviso "Revisa tu receta: si tiene valores de cilindro (CYL) y eje, necesitas lentes para astigmatismo." |
| Receta vencida | "No, o no tengo receta" en la quinta | Recomendaciones normales y el aviso "Tu receta ya no está vigente o no la tienes. Agenda una revisión antes de comprar…" |
| Texto libre que coincide | En la segunda pregunta escribe "trabajo en oficina todo el día" | Avanza a "¿Cada cuánto los usarías?"; progreso "Pregunta 3 de 5". También: "nunca los he usado", "solo los fines de semana", "no sé", "ya no está vigente". |
| Texto libre que no coincide | Escribe "me gustan los gatos" | Opti aclara ("Cuéntame si pasas el día frente a pantallas…"), repite la pregunta con las mismas opciones y **no** avanza. |
| Síntomas | En cualquier pregunta escribe "tengo el ojo rojo y me arde" (o dolor, visión borrosa, secreción, infección…) | "Consulta en pausa". Opti sugiere ver a un especialista. Sin tarjetas, sin opciones, sin campo de texto; solo "Volver a empezar". |
| Pregunta por la graduación | Escribe "¿Qué graduación necesito?" | Opti responde que la graduación, la curva base y el eje vienen de la receta (sin ningún número), repite la pregunta y no avanza. |
| Reiniciar a media consulta | Contesta dos preguntas y toca "Volver a empezar" cuando aparezca (o recarga) | Conversación nueva en "Pregunta 1 de 5", el foco en la primera opción. Una respuesta que estuviera en camino se descarta. |

Barra y etiqueta de progreso: "Pregunta N de 5" con N = respuestas + 1; "Listo"
al terminar; "Consulta en pausa" al derivar.

## Qué NO es un defecto

- **Los productos son marcadores.** Nombres entre corchetes ("[Producto J&J
  quincenal]"), "Foto del producto" en lugar de foto. Los datos reales de J&J
  llegan en la Sesión 4, en `src/consulta/catalog.ts`, sin cambiar su forma.
- **El precio dice `[PRECIO]`.** `priceMXN` es `null` en todos los marcadores.
- **"Ver en la tienda" lleva a la tienda general** (https://shop.optioutlet.com.mx),
  en pestaña nueva. Los enlaces de producto llegan en la Sesión 4.
- **Opti todavía no usa IA.** Es un guion: entiende palabras clave en español,
  no frases arbitrarias. La API de Claude entra en la Sesión 3.
- **El texto libre ambiguo pide aclaración.** "Todos los días o a veces" no
  avanza: si el texto encaja en dos opciones, Opti pregunta de nuevo.
- **Llegar con `/#consulta` no desplaza la página.** La consulta sí arranca,
  pero el navegador no salta a la sección: React la monta después de que el
  navegador buscó el ancla. No depende de esta sesión (la sección también la
  montaba React en la Sesión 1). Los enlaces internos "Empezar mi consulta" sí
  desplazan.

## Lo que no se ve a simple vista

### El contrato, y por qué la interfaz solo confía en él

`src/consulta/types.ts` define cada turno de Opti (`AssistantTurn`: mensaje,
opciones, perfil acumulado, estado, recomendaciones y avisos) y
`src/consulta/schema.ts` lo valida con `zod`. Ningún archivo importa React ni
el DOM: la función del servidor de la Sesión 3 va a validar la salida de
Claude con este mismo esquema.

- La interfaz solo pinta turnos que pasan `parseAssistantTurn` (nunca lanza:
  si algo no cumple, devuelve `null`). Además de los tipos, el esquema exige:
  máximo 4 opciones con ids únicos, máximo 2 recomendaciones con rangos 1 y 2
  únicos, recomendaciones solo en `done`, ninguna opción en `refer`.
- Las tarjetas se arman con el catálogo local a partir del `productId`
  (`resolveRecommendations`). Del turno solo se usa la razón. Nombre, precio,
  foto, etiquetas y enlace salen del catálogo; un id desconocido se descarta
  sin romper nada (con aviso en consola solo en desarrollo).
- Un tipo de verificación en `schema.ts` hace que `tsc` falle si el esquema y
  los tipos dejan de coincidir. Se comprobó cambiando un campo a propósito:
  `TS2344: Type 'false' does not satisfy the constraint 'true'`.
- El progreso no viaja en el contrato: se deriva del perfil (`progress.ts`).
- El proveedor guionado (`providers/scripted.ts`) no tiene estado: recibe el
  historial completo y reconstruye dónde va desde el perfil del último turno,
  igual que lo hará la API. Valida cada turno antes de entregarlo.

**Cómo se comprobó:** `schema.test.ts` (válido, campos faltantes, `status`
desconocido, 5 opciones, rangos 0/3/1.5/"1", entradas hostiles) y
`scripted.test.ts` (todos los turnos de varias conversaciones pasan el
contrato), dentro de las 119 pruebas.

### Respuestas viejas y duplicadas

Cada solicitud al proveedor lleva un `requestId` nuevo (`useConsulta.ts`). El
reducer acepta una respuesta solo si su id es el vigente **y** la fase sigue en
`waiting`. Además, el efecto que llama al proveedor tiene una bandera de
cancelación en su limpieza.

- Reiniciar mientras Opti escribe sube el id: la respuesta vieja que llega
  tarde se ignora.
- En desarrollo, `StrictMode` monta el efecto dos veces con el mismo id: la
  primera llamada queda cancelada y, aunque llegara, un segundo `received` con
  el mismo id ya no está en `waiting`. Opti nunca dice algo dos veces.
- "Reintentar" genera un id nuevo con el mismo historial y la misma entrada,
  así el efecto vuelve a dispararse.
- `start` solo se acepta desde `idle`: el IntersectionObserver, el ancla
  `#consulta` y el doble montaje pueden llamarlo sin efecto repetido.
- No hay doble envío: fuera de `asking` (por ejemplo en `waiting`) los envíos
  se ignoran, igual que el texto vacío o de puros espacios.
- Un turno inválido o un error del proveedor pasan a `error` sin perder la
  conversación; la interfaz muestra el mensaje y "Reintentar".

**Cómo se comprobó:** `reducer.test.ts`: respuesta tardía tras reiniciar
(`received` y `failed` con el id viejo se descartan), dos `received` seguidos
con el mismo id → un solo mensaje de Opti, `retry` con id nuevo, `start`
idempotente, doble envío, texto vacío, turno inválido y error del proveedor. En
el navegador se forzó un error del proveedor y "Reintentar" continuó la
consulta.

### Altura fija y su relación con los pines

Debajo de la consulta hay ScrollTriggers cuyo recorrido depende de la altura de
la página: el sello de la receta y la franja de patrón (`start: 0`,
`end: 'max'`) y el listón de la tienda (`trigger` = su sección). Si la consulta
cambiara de alto al conversar, todos se descuadrarían.

- La **tarjeta completa del chat** tiene altura fija: **720 px**, y **784 px**
  por debajo de 640 px (lo que medía el cascarón de la Sesión 1: 720 y
  783.5 px). Por dentro es una columna: encabezado, barra y área inferior toman
  su alto natural, y el historial ocupa el resto (`flex: 1`, `min-height: 0`,
  piso de 240 px) con scroll interno. Si las opciones ocupan más renglones, el
  historial se encoge; la tarjeta no.
- El historial se desplaza asignando su propio `scrollTop`, al llegar cada
  mensaje y cada vez que cambia de tamaño (`ResizeObserver`). Nunca con
  `scrollIntoView`. Al terminar, deja el mensaje de cierre arriba y las
  tarjetas debajo.
- Todos los cambios de foco usan `preventScroll`: la página no se mueve.
- El arranque usa un IntersectionObserver, no un ScrollTrigger: no agrega nada
  al motor de scroll.

**Cómo se comprobó** (Chrome sin interfaz por el protocolo DevTools, servidor
de desarrollo; en cada momento se forzó `ScrollTrigger.refresh()` antes de
leer, para que los valores no fueran los guardados):

| Viewport | Momento | Sección | Tarjeta | Historial | Documento |
|---|---|---|---|---|---|
| 1440 × 800 | Al cargar | 976 | 720 | 538 | 9111 |
| 1440 × 800 | Pregunta 3 de 5 | 976 | 720 | 480 | 9111 |
| 1440 × 800 | Terminada (2 tarjetas) | 976 | 720 | 542 | 9111 |
| 375 × 812 | Al cargar | 1348.36 | 784 | 586.5 | 11930 |
| 375 × 812 | Pregunta 3 de 5 | 1348.36 | 784 | 420.5 | 11930 |
| 375 × 812 | Terminada (2 tarjetas) | 1348.36 | 784 | 606 | 11930 |

`start`–`end` de todos los ScrollTriggers, idénticos en los tres momentos:

- 1440 × 800: inicio 0–560 · revelación 812–2012 (pin) · cómo funciona
  2740–4240 (pin) · perfiles 4968–5904 (pin) · tienda 7516–8311 · tres de
  página 0–8311.
- 375 × 812: inicio 0–560 · revelación 1199–2399 (pin) · cómo funciona
  3139–4639 (pin) · perfiles 4639–8250 · tienda 9912–11118 · tres de página
  0–11118.

Son los mismos valores que daba la Sesión 1. Peor caso del historial: 375 px
con las tres opciones más largas ("Todos los días", "Algunos días a la
semana", "Solo en ocasiones especiales"), **420.5 px**, lejos del piso de
240 px.

### Foco

- Tras tocar una opción, el foco pasa al campo de texto (que está en solo
  lectura mientras Opti escribe, nunca deshabilitado, para que pueda tener el
  foco). "Enviar" lleva `aria-disabled` en lugar de `disabled`.
- Al terminar o al derivar, el foco va a "Volver a empezar". Al volver a
  empezar, a la primera opción de la nueva conversación.
- En error, a "Reintentar". Tras reintentar, al campo de texto.
- El historial es `role="log"` con `aria-live="polite"` y `aria-busy` mientras
  Opti escribe; el indicador de escritura tiene texto para lectores de pantalla.

**Cómo se comprobó:** `document.activeElement` leído en el navegador en cada
paso, a 1440 y 375: INPUT (solo lectura) tras la opción, "Volver a empezar" al
terminar y al derivar, "Sí, ya los uso" tras reiniciar, "Reintentar" en error,
INPUT tras reintentar. Nunca `BODY`.

### Nada se guarda

Sin `localStorage`, `sessionStorage` ni cookies: no aparecen en `src/` y en el
navegador, después de una consulta completa, `localStorage.length` y
`sessionStorage.length` son 0 y `document.cookie` está vacío.

### Build de producción

Recorrido completo sobre `vite preview` sin errores en consola;
`window.__ST` no existe. El JS pasa de 374 kB (125 kB gzip) a 475 kB
(156 kB gzip): la diferencia es casi toda `zod`.

## Checklist final

- [x] El contrato (`types.ts` + `schema.ts`) existe y no depende de React ni del DOM. La parada de la Fase 2 se sustituyó, por tu indicación, por su inclusión completa en el reporte final.
- [x] `catalog.ts` tiene la forma definitiva y productos de marcador que cubren diario/quincenal × esférico/tórico (más un multifocal mensual).
- [x] `recommend()` nunca recomienda un esférico a alguien con astigmatismo, probado en las 27 combinaciones de rutina × frecuencia × astigmatismo.
- [x] El proveedor guionado es sin estado y todo turno que produce pasa la validación.
- [x] Texto libre, síntomas y pregunta por la graduación se comportan según las reglas, con pruebas.
- [x] El reducer bloquea el doble envío, descarta respuestas viejas tras reiniciar y maneja turnos inválidos y errores, con pruebas.
- [x] Las tarjetas se construyen desde el catálogo por `productId`; nada de lo que se muestra de un producto viene del texto del proveedor.
- [x] La altura de la sección y las posiciones de todos los ScrollTriggers son idénticas al cargar, a media consulta y al terminar, a 1440 × 800 y a 375 × 812.
- [x] El chat se desplaza con `scrollTop` propio; no hay `scrollIntoView`.
- [x] La conversación no se guarda en ningún almacenamiento del navegador.
- [x] El foco nunca se pierde en el `body` durante la conversación.
- [x] `ConsultaShell` se eliminó sin referencias huérfanas.
- [x] Existe `docs/verificacion-sesion-2.md`.
- [x] Ninguna fase cerró con «esto necesita su propia sesión».

## Futuro (documentado, no implementado)

- **Sesión 3:** `ApiConsultaProvider` que llama a `/api/chat`. La función
  serverless valida con el mismo `schema.ts` y verifica los `productId` contra
  el catálogo; si la API falla, se cae al proveedor guionado. El punto de
  entrada es `getConsultaProvider()` en `src/consulta/providers/index.ts`.
- **Sesión 4:** datos reales de J&J en `catalog.ts` (precios, fotos, enlaces de
  producto).
- **Sesión 5:** `?demo=1` para forzar el proveedor guionado; parámetros UTM en
  los enlaces a la tienda.
- **Si algún día se guardan conversaciones:** aviso de privacidad y
  consentimiento, porque son datos de salud.
