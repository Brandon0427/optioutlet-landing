import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STORE_URL, STORE_URL } from '../src/config/store.js';

const SRC = fileURLToPath(new URL('../src', import.meta.url));
const CONFIG = join('config', 'store.ts');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe('store domain', () => {
  it('appears in src/ only inside the config module', () => {
    const hosts = [...new Set([new URL(DEFAULT_STORE_URL).host, new URL(STORE_URL).host])];
    const offenders = files(SRC)
      .filter((path) => relative(SRC, path) !== CONFIG)
      .filter((path) => hosts.some((host) => readFileSync(path, 'utf8').includes(host)))
      .map((path) => relative(SRC, path).split(sep).join('/'));
    expect(offenders).toEqual([]);
  });
});
