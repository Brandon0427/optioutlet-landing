# Guion de la demo · 19 y 20 de noviembre de 2026

Para Brandon. Presentación en la Mac (pantalla de 1470 × 956 o proyector de
1920 × 1080 en espejo) con Chrome, sobre **https://optioutlet.com.mx**. Si el
dominio falla ese día, la misma app está en https://optioutlet-landing.vercel.app
(Plan A′, abajo).

## Antes de presentar (15 minutos antes)

1. **Tu propia conexión:** el hotspot de tu teléfono, no la red del cliente.
   - El límite es de 20 solicitudes por IP cada 10 minutos. En una red
     compartida, otras personas del cliente cuentan contra tu límite.
   - El hotspot es además más predecible.
2. **Chrome actualizado**, con una sola pestaña, pantalla completa (⌃⌘F) y zoom al
   100% (⌘0).
3. **Notificaciones apagadas:** macOS → Centro de control → No molestar.
4. **“Reducir movimiento” apagado:** Ajustes del Sistema → Accesibilidad →
   Pantalla. Si está prendido, la página se ve estática, sin animaciones.
5. **Consulta de calentamiento cinco minutos antes:** abre la página y haz una
   consulta completa. La primera respuesta de Claude despierta la función:
   medida en 2.8 s, contra 1.6 a 2.0 s las siguientes.
6. **Recarga (⌘R) y vuelve arriba** antes de que entre el cliente. Cada recarga
   empieza una consulta nueva.
7. **Ten a la mano los planes A′ y B** (abajo), en una nota o en el
   portapapeles.
8. **Comprueba el dominio:** https://optioutlet.com.mx abre la landing con
   candado (certificado válido), y el favicon (la pupila verde agua) aparece en
   la pestaña. Si no abre o el navegador advierte del certificado, pasa al
   Plan A′ sin intentar arreglarlo.

## Recorrido de la landing (unos 3 minutos)

Baja con la rueda o el trackpad a ritmo tranquilo. Las secciones fijas
avanzan con el scroll: si bajas rápido, la animación pasa rápido.

| Sección | Qué mostrar | Tiempo |
|---|---|---|
| Inicio | La promesa: “Cuéntanos cómo vives y te decimos qué lentes van contigo”. Mueve el cursor sobre el disco: la pupila lo sigue. | 25 s |
| Revelación | Se queda fija: la pupila crece hasta cubrir la pantalla y aparece Opti con “Antes de recomendarte algo, queremos conocerte”. Lee los tres puntos: no calcula graduación, pide receta vigente y refiere si hay molestias. | 35 s |
| Cómo funciona | Tres pasos que cambian con el scroll, con el teléfono mostrando cada pantalla. | 35 s |
| Perfiles | Las cinco tarjetas corren de lado: para quién es cada tipo de lente. | 30 s |
| Consulta | Detente aquí: Opti ya saluda solo. Pasa a la conversación principal. | — |
| Receta y cierre | Después de la conversación: “Tu receta primero” y el listón “Todo para ver bien” con “Ir a la tienda”. | 25 s |

## Conversación principal (unos 15 s de espera en total con Claude)

Persona de oficina, muchas horas de pantalla, uso diario, con astigmatismo y
receta vigente. Toca las opciones en este orden:

1. “Sí, ya los uso”
2. “Oficina y computadora”
3. “Todos los días”
4. “Sí” (astigmatismo)
5. “Sí, es reciente”

**Cierre:** Opti dice que ya tiene la recomendación y muestra dos productos
**para astigmatismo** (tóricos): primero el quincenal y luego el diario.

- Cada producto trae su razón; el texto lo redacta Claude.
- Para terminar, da clic en “Ver en la tienda” del primero: abre la tienda en
  otra pestaña.

**Tiempos medidos en producción el 2026-11-09, con Claude:**

| Turno | Primero (en frío) | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| ms | 2,816 | 1,642 | 1,986 | 1,641 | 1,770 | 2,615 |

Total: 14 s de punta a punta, sin ningún turno en guionado.

## Conversación corta: referir al especialista

Para mostrar que Opti sabe cuándo no recomendar:

1. Toca “Volver a empezar” o recarga la página.
2. “Sí, ya los uso”
3. “Oficina y computadora”
4. En la pregunta de frecuencia, **escribe** en el campo:
   `Tengo el ojo rojo y me arde` → Enviar.

**Cierre:** Opti detiene la consulta y recomienda revisarse con un especialista
en salud visual antes de usar o comprar lentes. No muestra productos.

**Tiempos medidos con Claude:** 1,556, 1,688, 1,811 y 1,607 ms. Total: 8 s, sin
respaldos.

Las dos conversaciones funcionan igual con Claude y con el guionado: mismas
entradas y mismo tipo de cierre. Con Claude cambia la redacción de los
mensajes; con el guionado es siempre la misma.

## Si preguntan por los productos

“Son marcadores: los nombres entre corchetes, `[PRECIO]` y ‘Foto del producto’
se reemplazan con el catálogo real de Johnson & Johnson. La lógica ya está
completa: con astigmatismo nunca recomienda un lente esférico, y la tienda
recibe de qué botón vino cada visita.”

“Ver en la tienda” abre `shop.optioutlet.com.mx` en otra pestaña. Si no
carga, es la tienda (Shopify), no la landing: di que la tienda se administra
aparte y sigue con la presentación.

## Planes A′, B y C

Úsalos si Claude tarda, si la red del lugar falla o si algo raro pasa. Para el
público **no cambia nada visible**: mismo diseño, mismas preguntas y mismo tipo
de cierre. Solo responde el guion en lugar de Claude, más rápido (0.6 a 1 s por
turno).

| Plan | Cuándo | Cómo se activa |
|---|---|---|
| **A** | Normal | **https://optioutlet.com.mx** |
| **A′** | El dominio falla (no abre, error de certificado, DNS) | La misma app, mismo despliegue: **https://optioutlet-landing.vercel.app**. Con Claude lento, además: **https://optioutlet-landing.vercel.app/?demo=1**. |
| **B** | Claude lento o con errores; hay internet | Agrega `?demo=1` y recarga: **https://optioutlet.com.mx/?demo=1**. Ninguna solicitud a la API. |
| **C** | Sin internet | En Terminal, dentro de la carpeta del proyecto: `npm run demo:local`. Hace el build y abre http://localhost:4173/?demo=1. Sin red; ningún dominio externo. Para detenerlo: ⌃C en la Terminal. |

- **Ensaya el Plan C** una vez antes del día: el build tarda unos 5 s y la
  página abre sola.
- **Si Claude falla a media consulta,** ese turno lo contesta el guion solo y
  la consulta sigue. No hace falta cambiar de plan.
- **Si se llega al límite de solicitudes (429),** el resto de esa consulta la
  responde el guion. Al reiniciarla o recargar, vuelve a intentar con Claude.
