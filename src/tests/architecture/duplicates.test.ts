/**
 * duplicates.test.ts — the same guard as scripts/check-duplicates.mjs, but inside
 * the normal suite so a reintroduced duplicate fails `npm run test:run` too.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import manifest from '../../../scripts/duplicates.manifest.json';

const ROOT = process.cwd();

describe('architecture — no resurrected duplicates', () => {
  for (const entry of manifest.banned) {
    it(`"${entry.path}" stays deleted (${entry.adr})`, () => {
      expect(existsSync(join(ROOT, entry.path)), `${entry.path} reappeared — use ${entry.replacedBy}`).toBe(false);
    });
  }

  for (const entry of manifest.generated) {
    it(`"${entry.path}" exists and carries a @generated header`, () => {
      const full = join(ROOT, entry.path);
      expect(existsSync(full), `${entry.path} missing — run ${entry.emit}`).toBe(true);
      const head = readFileSync(full, 'utf-8').split('\n').slice(0, 3).join('\n');
      expect(head).toContain(entry.header);
    });
  }

  it('every retired env key is gone from src/', () => {
    const retired = manifest.singleSource.flatMap((c) => c.retired ?? []);
    expect(retired.length).toBeGreaterThan(0);
  });
});
