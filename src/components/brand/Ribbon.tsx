import { useEffect, useId, useRef, type Ref } from 'react';
import { BRAND_COLORS as C } from '../../styles/brandColors';
import { svgId } from './geometry';

/** The U ribbon's centerline (viewBox 0 0 340 420). Length ≈ 240 + π·110 + 240 ≈ 826. */
export const RIBBON_PATH = 'M60 10 V250 A110 110 0 0 0 280 250 V10';

type RibbonProps = {
  /** Text that runs along the stroke. */
  text: string;
  /**
   * `startOffset` in user units along the path, or 'center' to place the
   * whole text centered on the stroke: (path length − text length) / 2,
   * measured at runtime and again once fonts have loaded.
   */
  startOffset?: number | 'center';
  className?: string;
  /** The <textPath>; sections animate its `startOffset`. */
  textPathRef?: Ref<SVGTextPathElement>;
};

/** Length of the ribbon's stroke (L) and of its text (T), in SVG user units. */
export function measureRibbon(tp: SVGTextPathElement): { pathLength: number; textLength: number } {
  const svg = tp.ownerSVGElement;
  const path = svg?.querySelector<SVGPathElement>('path[stroke]');
  const label = tp.parentElement as unknown as SVGTextElement | null;
  if (!path || !label) return { pathLength: 0, textLength: 0 };
  return { pathLength: path.getTotalLength(), textLength: label.getComputedTextLength() };
}

/**
 * Places the whole text centered on the stroke: (L − T) / 2.
 * Skipped while a section animates the offset (data-animated on the textPath).
 */
export function centerRibbonText(tp: SVGTextPathElement) {
  if (tp.dataset.animated === 'true') return;
  const { pathLength, textLength } = measureRibbon(tp);
  tp.setAttribute('startOffset', Math.max(0, (pathLength - textLength) / 2).toFixed(1));
}

/** Teal U-shaped ribbon with navy text riding on the stroke. Always decorative. */
export function Ribbon({ text, startOffset = 'center', className, textPathRef }: RibbonProps) {
  const pathId = svgId(useId(), 'ribbon-path');
  const textPathEl = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    if (startOffset !== 'center') return;
    let cancelled = false;
    const center = () => {
      const tp = textPathEl.current;
      if (!cancelled && tp) centerRibbonText(tp);
    };
    center();
    document.fonts?.ready.then(center).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startOffset, text]);

  const setTextPath = (el: SVGTextPathElement | null) => {
    textPathEl.current = el;
    if (typeof textPathRef === 'function') textPathRef(el);
    else if (textPathRef) textPathRef.current = el;
  };

  return (
    <svg viewBox="0 0 340 420" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <path id={pathId} d={RIBBON_PATH} />
      </defs>
      <path d={RIBBON_PATH} fill="none" stroke={C.teal} strokeWidth="60" />
      <text
        fill={C.navy}
        dominantBaseline="central"
        className="font-display"
        style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}
      >
        <textPath
          ref={setTextPath}
          href={`#${pathId}`}
          startOffset={typeof startOffset === 'number' ? startOffset : undefined}
        >
          {text}
        </textPath>
      </text>
    </svg>
  );
}
