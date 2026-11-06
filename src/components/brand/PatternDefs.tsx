import { useId } from 'react';
import { DotBiteMask } from './BrandShape';
import {
  DOT_SHAPE,
  LOOP_SHAPE,
  PATTERN_COLORS,
  PATTERN_IDS,
  PATTERN_LAYOUT,
  PATTERN_SCALE,
  PATTERN_TILE,
  U_SHAPE,
  svgId,
  type PatternVariant,
} from './geometry';

/**
 * Single <svg> of definitions for the brand patterns. Mount ONCE, in App.
 * Exposes `pattern-dark` (teal + white) and `pattern-light` (teal + navy)
 * under the ids in PATTERN_IDS; PatternFill references them.
 */
export function PatternDefs() {
  const base = useId();
  const ids = {
    u: svgId(base, 'g-u'),
    loop: svgId(base, 'g-loop'),
    dot: svgId(base, 'g-dot'),
    bite: svgId(base, 'g-dot-bite'),
  };

  const pattern = (variant: PatternVariant) => (
    <pattern
      id={PATTERN_IDS[variant]}
      width={PATTERN_TILE}
      height={PATTERN_TILE}
      patternUnits="userSpaceOnUse"
      patternTransform={`scale(${PATTERN_SCALE})`}
    >
      {PATTERN_LAYOUT.map((item, i) => (
        <use key={i} href={`#${ids[item.shape]}`} transform={item.transform} color={PATTERN_COLORS[variant][item.tone]} />
      ))}
    </pattern>
  );

  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <DotBiteMask id={ids.bite} />
        <g id={ids.u}>
          <path d={U_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={U_SHAPE.strokeWidth} />
        </g>
        <g id={ids.loop}>
          <path d={LOOP_SHAPE.d} fill="none" stroke="currentColor" strokeWidth={LOOP_SHAPE.strokeWidth} />
        </g>
        <g id={ids.dot}>
          <circle r={DOT_SHAPE.r} fill="currentColor" mask={`url(#${ids.bite})`} />
        </g>
        {pattern('dark')}
        {pattern('light')}
      </defs>
    </svg>
  );
}
