/**
 * noEngineImports.test.ts — ACC-01 anti-tautology guard.
 *
 * The accuracy oracles must be INDEPENDENT of the shipped engine. If a
 * generator ever imports `src/` (or the `@/` alias), the golden it emits is
 * self-referential and the varga gate proves nothing. This test fails loudly
 * when that happens.
 *
 * Recursive on purpose: the independent transform lives in tools/accuracy/lib/,
 * which a flat `readdirSync('tools/accuracy')` would never see.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/** An import that reaches the shipped engine through the alias or a relative
 *  path of any depth (`../src`, `../../src`, `../../../src`, ...). */
const FORBIDDEN = /from\s+['"](@\/|(?:\.\.\/)+src)/;

/** Every .mjs under `dir`, at any depth. */
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return walk(path);
    return path.endsWith('.mjs') ? [path] : [];
  });
}

const FILES = [
  ...walk('tools/accuracy'),
  ...readdirSync('scripts')
    .filter((f) => f.startsWith('accuracy') && f.endsWith('.mjs'))
    .map((f) => `scripts/${f}`),
];

describe('accuracy generators are independent of the engine', () => {
  it('discovers the oracles it is meant to guard', () => {
    expect(FILES.length).toBeGreaterThan(0);
    expect(FILES.some((f) => f.includes('/lib/'))).toBe(true);
  });

  for (const file of FILES) {
    it(`${file} does not import src/`, () => {
      const src = readFileSync(file, 'utf8');
      const hit = src
        .split('\n')
        .find((line) => line.trimStart().startsWith('import') && FORBIDDEN.test(line));
      expect(hit, `${file} imports the engine: ${hit}`).toBeUndefined();
    });
  }
});
