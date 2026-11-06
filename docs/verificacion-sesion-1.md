# Verificación — Sesión 1 (Landing viva)

> Documento en construcción. Las secciones de estado final por sección, cómo
> verificar cada efecto y qué no es un defecto se completan en la Fase 6.

## Lo que no se ve a simple vista

### Las mediciones de layout se hacen en el evento `revert`, no en `refreshInit`

**Qué se mide.** Varias decisiones de layout dependen del tamaño real de la
ventana y se recalculan en cada `ScrollTrigger.refresh()` (al cambiar el tamaño
de la ventana, al cargar las fuentes y al cruzar un breakpoint):

- "Cómo funciona": el modo compacto (contenedor < 760 px, o la columna de los
  tres pasos no cabe en el alto disponible) y la escala del teléfono.
- Revelación y Perfiles: el ajuste del bloque de contenido a escenarios muy
  bajos (escala mínima 0.6, nunca hacia arriba).
- Cierre: el largo del trazo del listón (L) y del texto (T) que fijan el
  recorrido de `startOffset` entre 0 y L − T.

**El problema con `refreshInit`.** `refreshInit` se dispara al empezar el
`refresh`, *antes* de que ScrollTrigger revierta los pines. En ese momento cada
sección fijada todavía conserva los estilos en línea que ScrollTrigger le puso
en el cálculo anterior (ancho, alto y el `pin-spacer` con el tamaño viejo). Lo
que se mide ahí es el tamaño de la ventana *anterior*.

**Cómo se detectó.** Redimensionando de 2 en 2 px alrededor del umbral de 760 px,
el modo compacto llegaba siempre con un paso de retraso: con la ventana en
824 px (contenedor de 758 px, que debe ser compacto) seguía en modo lado a lado,
y solo se corregía en el siguiente cambio de tamaño o con un `refresh()` manual.
Si el usuario dejaba de redimensionar justo en ese punto, la sección se quedaba
en el modo equivocado.

**La solución.** Las mediciones viven en `ScrollTrigger.addEventListener('revert', …)`.
`revert` se dispara durante el `refresh` cuando los pines ya se quitaron y el DOM
está en su layout natural, y antes de que ScrollTrigger recalcule los `start`/`end`.
Así:

1. Se mide el tamaño actual, no el anterior.
2. Los valores en función (`end: () => …`, `x: () => -overflow()`,
   `attr.startOffset: () => L − T`) se evalúan después, con las medidas nuevas.

**Regla adicional del modo compacto.** La decisión se toma siempre sobre el
estado completo: primero se quita el compacto (los tres pasos visibles, el
teléfono a escala 1), se mide la columna completa y el ancho del contenedor, se
decide y solo entonces se aplica. Si se midiera con el compacto aplicado, los
pasos ocultos medirían cero y el criterio cambiaría de resultado en cada
recálculo: el modo se prendería y apagaría solo.

**Cómo se comprobó.** Barrido de ancho de 812 a 842 px y de alto de 612 a 642 px,
en las dos direcciones, leyendo el modo después de cada cambio y otra vez tras
dos `refresh()` forzados: exactamente un cambio de modo por dirección (a los
760 px de contenedor y a los 626/628 px de alto), sin ninguna lectura inestable.
