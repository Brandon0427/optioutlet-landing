import { describe, expect, it } from 'vitest';
import { DEFAULT_EFFORT, DEFAULT_MODEL, readConfig } from '../config.js';

describe('readConfig', () => {
  it('defaults: no key, default model and effort', () => {
    expect(readConfig({})).toEqual({ apiKey: null, model: DEFAULT_MODEL, effort: DEFAULT_EFFORT });
    expect(readConfig({ ANTHROPIC_API_KEY: '  ', ANTHROPIC_MODEL: '', ANTHROPIC_EFFORT: '' })).toEqual({
      apiKey: null,
      model: DEFAULT_MODEL,
      effort: DEFAULT_EFFORT,
    });
  });

  it('reads the model and the effort from the environment', () => {
    const c = readConfig({ ANTHROPIC_API_KEY: 'k', ANTHROPIC_MODEL: ' claude-opus-5-5 ', ANTHROPIC_EFFORT: ' Medium ' });
    expect(c).toEqual({ apiKey: 'k', model: 'claude-opus-5-5', effort: 'medium' });
    expect(readConfig({ ANTHROPIC_EFFORT: 'high' }).effort).toBe('high');
  });

  it('an unknown effort falls back to the default', () => {
    expect(readConfig({ ANTHROPIC_EFFORT: 'max' }).effort).toBe(DEFAULT_EFFORT);
    expect(readConfig({ ANTHROPIC_EFFORT: 'mucho' }).effort).toBe(DEFAULT_EFFORT);
  });
});
