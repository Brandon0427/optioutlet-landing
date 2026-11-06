import { defineConfig } from 'vitest/config';

// Live evaluation only (`npm run eval:consulta`); `npm run check` never runs it.
export default defineConfig({
  test: {
    include: ['scripts/eval-consulta.ts'],
    testTimeout: 15 * 60_000,
    reporters: ['default'],
  },
});
