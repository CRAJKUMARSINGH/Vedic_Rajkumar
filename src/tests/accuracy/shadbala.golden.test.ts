/**
 * shadbala.golden.test.ts
 *
 * Drift guard for the Shadbala oracle goldens.
 *
 * tools/accuracy/golden/shadbala/*.json are regression baselines emitted by
 * scripts/accuracy-shadbala-golden.mjs from the independent oracle — not
 * published tables (the corpus has no worked Shadbala example; see
 * docs/accuracy/UNVERIFIED.md). Their whole value is that a refactor of the
 * oracle cannot move a value unnoticed, so this test re-derives every stored
 * case from the case's *own* stored `inputs` and fails on any difference.
 *
 * It deliberately re-runs the oracle rather than comparing to the engine: the
 * engine does not agree with the oracle on the varga surface (D4/D20/D60) or on
 * the Sthana scale, and those divergences are pinned in shadbala.varga.test.ts
 * and shadbala.corpus.test.ts, not here. This file answers exactly one question
 * — "did the oracle change?" — so a wrong edit to its rules is caught in the
 * same run instead of silently re-baselining.
 *
 * Regenerate (only when a rule change is intended):
 *   npm run accuracy:shadbala-golden
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as R from '../../../tools/accuracy/shadbalaReference.mjs';

const GOLDEN_DIR = join(process.cwd(), 'tools', 'accuracy', 'golden', 'shadbala');

interface GoldenCase {
  _meta: { caseId: string; unit: string; school: 'A' | 'B' };
  inputs: { sky: Record<string, unknown>; ctx: Record<string, unknown>; school: 'A' | 'B' };
  shadbala: ReturnType<typeof R.shadbala>;
}

const readJson = (name: string) => JSON.parse(readFileSync(join(GOLDEN_DIR, name), 'utf8'));

const caseFiles = readdirSync(GOLDEN_DIR).filter((f) => f.endsWith('.json') && f !== 'manifest.json').sort();
const cases: GoldenCase[] = caseFiles.map((f) => readJson(f) as GoldenCase);
const manifest = readJson('manifest.json') as {
  caseCount: number;
  cases: { id: string; written: boolean }[];
};

describe('shadbala goldens', () => {
  it('ships at least one golden, so the drift guard is never inert', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it('has a manifest that matches the files on disk', () => {
    expect(manifest.caseCount).toBe(cases.length);
    expect(manifest.cases.map((c) => c.id).sort()).toEqual(
      cases.map((c) => c._meta.caseId).sort(),
    );
  });

  it.each(caseFiles)('%s re-derives byte-for-byte from its stored inputs', (file) => {
    const g = readJson(file) as GoldenCase;
    // Stored inputs are sufficient — no shared case list, no hidden fixture.
    expect(g.inputs.school).toBe(g._meta.school);
    const again = R.shadbala(
      g.inputs.sky as never,
      g.inputs.ctx as never,
      g.inputs.school,
    );
    expect(again).toEqual(g.shadbala);
  });

  it('stores every value in virupas, with rupas = totalVirupas / 60', () => {
    for (const g of cases) {
      expect(g._meta.unit).toContain('virupas');
      for (const planet of R.PLANETS) {
        const b = g.shadbala[planet];
        expect(Number.isFinite(b.totalVirupas)).toBe(true);
        expect(b.rupas).toBeCloseTo(b.totalVirupas / 60, 12);
      }
    }
  });
});
