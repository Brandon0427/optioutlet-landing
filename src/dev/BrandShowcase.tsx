// TEMPORARY (Phase 3): visual check of every brand component and variant.
// Delete this file (and its use in App.tsx) at the end of Phase 4.
// Labels here are dev-only scaffolding, not landing copy.

import type { ReactNode } from 'react';
import { landing } from '../content/landing';
import { BrandShape } from '../components/brand/BrandShape';
import { Imagotipo } from '../components/brand/Imagotipo';
import { Isotipo } from '../components/brand/Isotipo';
import { Mascot } from '../components/brand/Mascot';
import { PatternFill } from '../components/brand/PatternFill';
import { Ribbon } from '../components/brand/Ribbon';
import { Seal } from '../components/brand/Seal';
import { DOT_SHAPE, ISOTIPO_SHAPE, SHAPE_VIEWBOX } from '../components/brand/geometry';

function Block({ title, children, dark = false }: { title: string; children: ReactNode; dark?: boolean }) {
  return (
    <section className={`flex flex-col gap-6 rounded-3xl p-8 ${dark ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-line'}`}>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Tile({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <figure className="m-0 flex flex-col items-center gap-3">
      <div className={`flex items-center justify-center rounded-2xl p-5 ${className}`}>{children}</div>
      <figcaption className="font-mono text-xs opacity-80">{label}</figcaption>
    </figure>
  );
}

/** Dashed outlines of the full circle and the bite circle, to check the bite breaks the edge. */
function IsotipoGuide() {
  const s = ISOTIPO_SHAPE;
  return (
    <svg viewBox={s.viewBox} aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
      <circle cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke="#e0457b" strokeWidth="0.6" strokeDasharray="2 2" />
      <circle cx={s.bite.cx} cy={s.bite.cy} r={s.bite.r} fill="none" stroke="#e0457b" strokeWidth="0.6" strokeDasharray="2 2" />
    </svg>
  );
}

function DotGuide() {
  const d = DOT_SHAPE;
  return (
    <svg viewBox={SHAPE_VIEWBOX} aria-hidden="true" className="absolute inset-0 size-full">
      <circle r={d.r} fill="none" stroke="#e0457b" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx={d.bite.cx} cy={d.bite.cy} r={d.bite.r} fill="none" stroke="#e0457b" strokeWidth="0.8" strokeDasharray="2 2" />
    </svg>
  );
}

export function BrandShowcase() {
  const shapes = ['u', 'loop', 'dot'] as const;
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-navy">Muestra de marca · Fase 3</h1>

      <Block title="Isotipo">
        <div className="flex flex-wrap items-end gap-8">
          <Tile label="sobre blanco · 240px" className="bg-white ring-1 ring-line">
            <div className="relative size-60">
              <Isotipo className="size-60 text-teal" />
            </div>
          </Tile>
          <Tile label="guía: círculo r50 + mordida (70,24) r19" className="bg-white ring-1 ring-line">
            <div className="relative size-60">
              <Isotipo className="size-60 text-teal" />
              <IsotipoGuide />
            </div>
          </Tile>
          <Tile label="sobre mist" className="bg-mist">
            <Isotipo className="size-32 text-teal" />
          </Tile>
          <Tile label="sobre marino" className="bg-navy">
            <Isotipo className="size-32 text-teal" />
          </Tile>
          <Tile label="30px (header)" className="bg-white ring-1 ring-line">
            <Isotipo className="size-[30px] text-teal" />
          </Tile>
        </div>
      </Block>

      <Block title="BrandShape · U, bucle, punto">
        <div className="flex flex-wrap items-end gap-8">
          {shapes.map((shape) => (
            <Tile key={`n-${shape}`} label={`${shape} · navy`} className="bg-white ring-1 ring-line">
              <BrandShape shape={shape} className="size-40 text-navy" />
            </Tile>
          ))}
          {shapes.map((shape) => (
            <Tile key={`t-${shape}`} label={`${shape} · teal / marino`} className="bg-navy">
              <BrandShape shape={shape} className="size-40 text-teal" />
            </Tile>
          ))}
          {shapes.map((shape) => (
            <Tile key={`w-${shape}`} label={`${shape} · blanco / marino`} className="bg-navy">
              <BrandShape shape={shape} className="size-40 text-white" />
            </Tile>
          ))}
          <Tile label="guía punto: r22 + mordida (10,−12) r9" className="bg-white ring-1 ring-line">
            <div className="relative size-60">
              <BrandShape shape="dot" className="absolute inset-0 size-60 text-teal" />
              <DotGuide />
            </div>
          </Tile>
        </div>
      </Block>

      <Block title="Patrón oscuro (pattern-dark) · láminas 15/16" dark>
        <div className="relative h-[620px] overflow-hidden rounded-2xl bg-navy">
          <PatternFill variant="dark" />
        </div>
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-navy">
          <PatternFill variant="dark" style={{ opacity: 0.28 }} />
          <p className="relative m-6 font-mono text-xs">opacidad 0.28 (Perfiles)</p>
        </div>
      </Block>

      <Block title="Patrón claro (pattern-light)">
        <div className="relative h-[620px] overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          <PatternFill variant="light" />
        </div>
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-mist">
          <PatternFill variant="light" style={{ opacity: 0.1 }} />
          <p className="relative m-6 font-mono text-xs">opacidad 0.1 sobre mist (Consulta)</p>
        </div>
      </Block>

      <Block title="Seal · sello del hero (sin fondo) y de la receta (con fondo)">
        <div className="flex flex-wrap items-center gap-10">
          <Tile label="hero · texto blanco sobre gradiente" className="bg-[#2a5876]">
            <div className="relative size-[420px]">
              <Seal text={landing.hero.seal} color="white" className="absolute inset-0 size-full" />
              <div className="absolute inset-[11%] flex items-center justify-center rounded-full border-2 border-mint bg-mist">
                <Isotipo className="size-[58%] text-teal" />
              </div>
            </div>
          </Tile>
          <Tile label="receta · fondo marino" className="bg-white ring-1 ring-line">
            <div className="relative size-[380px]">
              <Seal text={landing.receta.seal} color="white" background="navy" className="absolute inset-0 size-full" />
              <div className="absolute inset-[15%] flex items-center justify-center rounded-full bg-mint">
                <Mascot variant="onLight" size={220} />
              </div>
            </div>
          </Tile>
        </div>
      </Block>

      <Block title="Ribbon · listón en U con texto">
        <div className="flex flex-wrap items-center gap-10">
          <Tile label="sin rotar · startOffset 40" className="bg-[#26506f]">
            <Ribbon text={landing.storeCta.ribbon} className="h-[494px] w-[400px]" />
          </Tile>
          <Tile label="como en el cierre · −14°" className="bg-[#26506f]">
            <Ribbon text={landing.storeCta.ribbon} className="h-[494px] w-[400px] -rotate-[14deg]" />
          </Tile>
          <Tile label="startOffset 260 (máximo del mockup)" className="bg-[#26506f]">
            <Ribbon text={landing.storeCta.ribbon} startOffset={260} className="h-[494px] w-[400px]" />
          </Tile>
        </div>
      </Block>

      <Block title="Mascot · variantes y recortes">
        <div className="flex flex-wrap items-end gap-8">
          <Tile label="onLight · full · 200" className="bg-mint">
            <Mascot variant="onLight" size={200} />
          </Tile>
          <Tile label="onNavy · full · 150 (revelación)" className="bg-navy">
            <Mascot variant="onNavy" size={150} />
          </Tile>
          <Tile label="onLight · head · 52 (consulta)" className="bg-navy">
            <Mascot variant="onLight" size={52} crop="head" className="rounded-full bg-mint" />
          </Tile>
          <Tile label="onLight · head · 36 (teléfono)" className="bg-white ring-1 ring-line">
            <Mascot variant="onLight" size={36} crop="head" className="rounded-full bg-mist" />
          </Tile>
          <Tile label="onNavy · head · 120" className="bg-navy">
            <Mascot variant="onNavy" size={120} crop="head" />
          </Tile>
        </div>
      </Block>

      <Block title="Imagotipo">
        <div className="flex flex-wrap items-center gap-8">
          <Tile label="onLight · md (header)" className="bg-white ring-1 ring-line">
            <Imagotipo variant="onLight" size="md" />
          </Tile>
          <Tile label="onLight · sm" className="bg-white ring-1 ring-line">
            <Imagotipo variant="onLight" size="sm" />
          </Tile>
          <Tile label="onNavy · md" className="bg-navy">
            <Imagotipo variant="onNavy" size="md" />
          </Tile>
          <Tile label="onNavy · sm (footer)" className="bg-navy">
            <Imagotipo variant="onNavy" size="sm" />
          </Tile>
        </div>
      </Block>

      <Block title="Tipografía · caracteres del español">
        <p className="font-display text-3xl font-semibold">¿Año? ¡Señal! Ñandú · áéíóú · ü</p>
        <p className="text-2xl">¿Año? ¡Señal! Ñandú · áéíóú · ü — Albert Sans</p>
      </Block>
    </main>
  );
}
