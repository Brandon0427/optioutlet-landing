# Verificación · Sesión 4 — Catálogo J&J real

Para Brandon. Unos 10 minutos en https://optioutlet.com.mx.

## 1. Consulta con el guionado (siempre igual)

Abre **https://optioutlet.com.mx/?demo=1#consulta** y toca, en orden:
“Sí, ya los uso” → “Oficina y computadora” → “Todos los días” → “No” →
“Sí, es reciente”.

Debes ver dos tarjetas:

| Tarjeta | Foto | Precio | Botón |
|---|---|---|---|
| **ACUVUE® VITA®** (Mi primera opción) | Caja morada de Vita | $1,199 | “Ver en Mercado Libre” |
| **ACUVUE® OASYS** (También te puede funcionar) | Isotipo blanco sobre fondo verde agua | *ninguno* | “Ver en la tienda” |

**No es defecto:** que ACUVUE® OASYS no tenga precio ni foto y que su botón
lleve a la tienda. Todavía no tiene publicación en Mercado Libre; cuando la
tenga se cambia en una línea de `src/consulta/catalog.ts`.

## 2. Consulta con Claude y astigmatismo

Recarga sin `?demo=1` (**https://optioutlet.com.mx/#consulta**) y toca:
“Sí, ya los uso” → “Oficina y computadora” → “Todos los días” → **“Sí”** →
“Sí, es reciente”.

- Las dos tarjetas son **para astigmatismo** (la etiqueta lo dice). Cuáles y
  en qué orden puede variar.
- Cada una con foto de la caja, precio y “Ver en Mercado Libre”.
- La razón habla de tu rutina y del lente (reemplazo, material, oxígeno,
  solución). No debe aparecer: precios, nombres de productos, “luz azul”, ni
  promesas de salud. Si menciona UV, dice que no sustituye a los lentes de sol.

## 3. Enlaces de Mercado Libre (pendiente, solo se puede a mano)

Mercado Libre bloquea la revisión automática, así que no pude comprobar el
título de cada publicación. Abre cada enlace y confirma que es el producto:

| Producto | Enlace | Precio en la tarjeta |
|---|---|---|
| 1-DAY ACUVUE® MOIST | https://articulo.mercadolibre.com.mx/MLM-1895638309 | $1,069 |
| ACUVUE® OASYS 1-Day | https://articulo.mercadolibre.com.mx/MLM-1895663565 | $1,199 |
| ACUVUE® VITA® | https://articulo.mercadolibre.com.mx/MLM-2209649768 | $1,199 |
| 1-DAY ACUVUE® MOIST for ASTIGMATISM | https://articulo.mercadolibre.com.mx/MLM-672456958 | $1,479 |
| ACUVUE® VITA® for ASTIGMATISM | https://articulo.mercadolibre.com.mx/MLM-1895649425 | $2,159 |
| ACUVUE® OASYS for ASTIGMATISM | https://articulo.mercadolibre.com.mx/MLM-2705311961 | $1,446.11 |

Si alguno no corresponde, dime cuál; se corrige en `catalog.ts`.

## 4. Dos preguntas en texto libre (con Claude)

- En cualquier pregunta escribe **“tengo 48 y ya no veo bien de cerca”**:
  Opti detiene la consulta y sugiere ver a tu especialista. No muestra
  productos.
- En otra consulta escribe **“¿puedo dormir con ellos?”**: Opti dice que no,
  que se retiran antes de dormir, y sigue con la pregunta.

## Qué no es defecto

- ACUVUE® OASYS sin precio, con isotipo y con “Ver en la tienda”.
- La foto de ACUVUE® OASYS for ASTIGMATISM trae una etiqueta naranja; viene
  así de la publicación de ML (ver `docs/backlog.md`).
- “Foto del producto” en el teléfono de la sección “Cómo funciona”: es la
  etiqueta del dibujo de ejemplo, no de una tarjeta real.
- Con `?demo=1`, la conversación principal (astigmatismo) da ACUVUE® OASYS for
  ASTIGMATISM y luego ACUVUE® VITA® for ASTIGMATISM (ver
  `docs/guion-demo.md`).
