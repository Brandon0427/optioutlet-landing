import { ShapeGeometry } from './BrandShape';
import {
  PATTERN_COLORS,
  PATTERN_IDS,
  PATTERN_LAYOUT,
  PATTERN_SCALE,
  PATTERN_SHAPE_IDS,
  PATTERN_TILE,
  type PatternVariant,
  type ShapeName,
} from './geometry';

const SHAPES: ShapeName[] = ['u', 'loop', 'dot'];

/**
 * Single <svg> of definitions for the brand patterns. Mount ONCE, in App.
 * Exposes `pattern-dark` (teal + white) and `pattern-light` (teal + navy)
 * under the ids in PATTERN_IDS; PatternFill references them.
 */
export function PatternDefs() {
  const pattern = (variant: PatternVariant) => (
    <pattern
      id={PATTERN_IDS[variant]}
      width={PATTERN_TILE}
      height={PATTERN_TILE}
      patternUnits="userSpaceOnUse"
      patternTransform={`scale(${PATTERN_SCALE})`}
    >
      {PATTERN_LAYOUT.map((item, i) => (
        <use
          key={i}
          href={`#${PATTERN_SHAPE_IDS[item.shape]}`}
          transform={item.transform}
          color={PATTERN_COLORS[variant][item.tone]}
        />
      ))}
    </pattern>
  );

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {SHAPES.map((shape) => (
          <g key={shape} id={PATTERN_SHAPE_IDS[shape]}>
            <ShapeGeometry shape={shape} />
          </g>
        ))}
        {pattern('dark')}
        {pattern('light')}
      </defs>
    </svg>
  );
}
