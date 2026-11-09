# Verificación · Sesión 5 — Blindaje de la demo

Esta sesión casi no cambia nada visible. Su trabajo es que la demo no pueda
fallar delante del cliente y que la URL pública no pueda gastar la API sin
límite.

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
