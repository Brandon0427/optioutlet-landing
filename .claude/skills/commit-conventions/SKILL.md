---
name: commit-conventions
description: >
  Guía obligatoria para redactar mensajes de commit en la landing de Optioutlet
  (optioutlet.com.mx, consulta con Opti). Usar siempre que se vayan a hacer commits,
  se mencione git commit, se pida staging de cambios, se cierre una fase de una sesión,
  o se necesite documentar qué se hizo en una sesión de trabajo (secciones, efectos de
  scroll con GSAP, componentes de marca, tokens, contenido, docs). Genera mensajes
  consistentes, descriptivos y útiles para el historial del proyecto.
---

# Commit Conventions — Optioutlet (Landing Page)

## Formato

```
tipo(scope): título corto en imperativo

Descripción breve de qué cambió y por qué. Solo incluir si el título
no es suficiente para entender el cambio.
```

- **Título**: máximo 72 caracteres, en inglés, en imperativo ("add", "fix", "remove" — no "added", "fixing")
- **Descripción**: en español, 1–3 líneas, separada del título por una línea en blanco
- **Scope**: sección, componente o área afectada — opcional pero recomendado
- **Sesiones por fases**: si el commit cierra una fase de un prompt de sesión, la
  primera línea de la descripción la nombra: `Sesión 2 · Fase 3`. Así el historial
  sigue mostrando la fase sin romper el formato.

---

## Tipos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva sección, componente, efecto de scroll, hook o integración (lógica de la consulta, API de Claude) |
| `fix` | Corrección de un bug de comportamiento o visual (pin que brinca, texto cortado, contraste) |
| `refactor` | Cambio de código sin alterar comportamiento ni apariencia |
| `style` | Cambio puramente visual: Tailwind, spacing, colores, alineación. **No** es formateo de whitespace (eso es `chore`) |
| `motion` | Ajuste de una animación existente: rangos, curvas, `scrub`, duración, sin agregar ni arreglar funcionalidad |
| `a11y` | Contraste, foco, objetivos táctiles, `aria-*`, movimiento reducido |
| `seo` | Meta tags, títulos, metadatos para compartir |
| `docs` | Comentarios, README, CLAUDE.md, `docs/verificacion-*`, `docs/backlog.md`, notas de sesión |
| `chore` | Dependencias, configuración (Vite, TS, Tailwind, graphify, `.claude/`), scripts, formateo |
| `perf` | Fuentes, peso del bundle, code splitting — sin cambio de comportamiento |

> **Nota sobre `style` y `motion`:** un elemento visual o efecto **nuevo** es `feat`; un
> defecto **corregido** es `fix`. `style` y `motion` son para ajustes de apariencia o de
> animación que no agregan ni arreglan funcionalidad. Si el equipo prefiere el sentido
> estricto de Conventional Commits, cámbialo aquí y será la fuente de verdad.

---

## Scopes recomendados

Secciones de la página (`src/sections/`, en orden):

`hero` · `reveal` · `como` · `profiles` · `consulta` · `receta` · `store-cta`

Layout (`src/components/layout/`): `header` · `footer` · `strip`

Para áreas transversales:

- `brand` — `src/components/brand/` (isotipo, trazos, patrones, sello, listón, mascota, imagotipo, `geometry.ts`)
- `content` — `src/content/landing.ts` (todo texto visible, `MASCOT_NAME`)
- `tokens` — `src/styles/index.css` (`@theme`, gradientes), `src/styles/brandColors.ts`, `src/styles/fonts.css`
- `gsap` — `src/lib/gsap.ts` (registro, `ORDER`, `MEDIA`, `SCRUB`) y comportamiento compartido de ScrollTrigger
- `ui` — `src/components/ui/` (enlaces y CTAs)
- `deps` — `package.json` / `package-lock.json`
- `graphify` — `.graphifyignore`, `.claude/hooks/graphify-fresh.sh`, `graphify-out/cache/semantic/`

Para cambios que afectan múltiples áreas, omitir el scope.

---

## Ejemplos

```
feat(reveal): pin the pupil reveal and scale Opti in
```

```
fix(como): measure compact mode on the revert event

Sesión 1 · Fase 5.3
En refreshInit los pines aún tenían el tamaño anterior y el modo
compacto llegaba un paso tarde al redimensionar.
```

```
a11y(hero): keep the light blob off the headline on desktop
```

```
motion(profiles): add 240px of hold after the carousel ends
```

```
chore(deps): add playwright-core 1.x (published 14+ days ago)
```

```
docs: add session 2 verification checklist
```

---

## Cuándo agregar descripción

Agregar descripción cuando el título solo no explica el **porqué**:

- Decisiones no obvias (ej. por qué las mediciones viven en `revert` y no en `refreshInit`)
- Cambios que afectan varias secciones o el comportamiento compartido de GSAP
- Desviaciones del mockup (`docs/mockup/optioutlet-mockup.dc.html`) y su razón
- Workarounds o soluciones temporales
- Cierre de una fase de sesión (siempre: nombrar la fase)

No agregar descripción para cambios simples y autoexplicativos.

---

## Antes de hacer commit — verificar documentación y estado

**Siempre revisar** si el cambio requiere actualizar algo antes de hacer staging:

| Si tocaste… | Revisar… |
|---|---|
| Cualquier código | `npm run typecheck` y `npm run build` pasan |
| Texto visible | Que salga de `src/content/landing.ts`, no escrito en el componente |
| Un color de marca | `@theme` en `index.css` **y** `src/styles/brandColors.ts` (deben coincidir) |
| Una animación o un pin | Que con movimiento reducido siga la versión estática; que el conteo de `.pin-spacer` siga siendo 2 (< 768 px) / 3 (≥ 768 px); actualizar `docs/verificacion-*.md` si cambia lo esperado |
| Una dependencia | La regla del README: ≥ 14 días de publicada, versión exacta, `npm install --before=…` |
| Algo que quedó pendiente | Registrarlo en `docs/backlog.md` (razón, ítems, medición pendiente) |
| `Imagotipo.tsx` o `Mascot.tsx` | Mantener o quitar el `TODO(brand-svg)` según corresponda |
| Un `.md` del proyecto o el mockup | Sugerir `/graphify --update` para mantener el grafo completo |

Si la documentación ya está al día (o el cambio es puramente interno sin impacto observable),
se puede omitir. En caso de duda, actualizar — es parte del mismo cambio.

---

## Cuándo NO hacer un solo commit gigante

Si una sesión tocó varias secciones o concerns distintos, separar en commits atómicos.
Cada commit debe representar un cambio coherente que pueda revertirse de forma independiente.

**Mal:**
```
feat: add carousel, fix focus ring, update fonts
```

**Bien:**
```
feat(profiles): drive the card row horizontally with scroll
a11y(tokens): use a two-tone focus ring
perf(tokens): ship only the latin font subset
```

Excepción: en sesiones por fases, el usuario pide **un commit al cierre de cada fase**.
Ahí el commit de la fase puede agrupar sus cambios; si la fase tocó concerns muy
distintos, preferir varios commits atómicos que en su descripción nombren la misma fase.

---

## Gestión de ramas después del commit

El repo trabaja hoy solo en `main`, con remoto `origin` en GitHub
(`Brandon0427/optioutlet-landing`). Vercel despliega por la integración de GitHub y
**cada push a `main` publica directo a producción** (https://optioutlet-landing.vercel.app).

- Se puede hacer `git push origin main`, siempre **después** de `npm run check` y del
  commit, encadenados: `npm run check && git commit … && git push origin main`.
- Prohibidos el push forzado (`--force`, `--force-with-lease`) y reescribir historial
  ya publicado (`rebase`, `commit --amend` o `reset` sobre commits que ya están en `origin`).
- Los commits van con la identidad local del repo (`Brandon <brandon@grupoldm.com.mx>`);
  no tocar la identidad global ni la configuración de SSH de la máquina.

Después de hacer commit, verificar en qué rama se está trabajando:

```bash
git branch --show-current
```

**Si la rama actual NO es `main`**, preguntar al usuario:

> "¿Quieres hacer merge de estos cambios a `main` y regresar a esta rama?"

Si el usuario confirma, ejecutar en orden:

```bash
git checkout main
git merge <rama-original>
git checkout <rama-original>
```

Si el usuario dice que no, quedarse en la rama actual sin hacer nada más.
Cuando el repo tenga ramas `develop`/`testeo` o ramas por sesión con vistas previas,
actualizar esta sección.
