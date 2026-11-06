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

/** Teal U-shaped ribbon with navy text riding on the stroke. Always decorative. */
export function Ribbon({ text, startOffset = 'center', className, textPathRef }: RibbonProps) {
  const pathId = svgId(useId(), 'ribbon-path');
  const strokeRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const textPathEl = useRef<SVGTextPathElement>(null);

  useEffect(() => {
    if (startOffset !== 'center') return;
    let cancelled = false;
    const center = () => {
      const path = strokeRef.current;
      const label = textRef.current;
      const tp = textPathEl.current;
      if (cancelled || !path || !label || !tp) return;
      const offset = Math.max(0, (path.getTotalLength() - label.getComputedTextLength()) / 2);
      tp.setAttribute('startOffset', offset.toFixed(1));
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
      <path ref={strokeRef} d={RIBBON_PATH} fill="none" stroke={C.teal} strokeWidth="60" />
      <text
        ref={textRef}
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
