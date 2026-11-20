/**
 * agplBoundary.test.ts — P3: license-boundary structural guard.
 *
 * swisseph-wasm is AGPL-3.0. The app's licensing posture depends on it being
 * reachable ONLY through the dynamic import inside swissEphemerisService.ts,
 * gated by VITE_USE_SWISS_EPHEMERIS. This test fails if:
 *  - any file statically imports/requires 'swisseph-wasm' (eager bundle edge),
 *  - a second module gains a dynamic import of the package,
 *  - an app caller invokes the Swiss path without the env gate.
 * It proves the structural boundary the LICENSING decision record relies on —
 * it does NOT prove legal compliance.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PKG = 'swisseph-wasm';
const SRC = 'src';

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e)) out.push(p);
  }
  return out;
}

const FILES = walk(SRC).filter(f => !f.includes('tests'));

/** Real import edges only — comments and stub docstrings don't count. */
const STATIC_IMPORT = new RegExp(`import\\s+[^'";]*from\\s+['"]${PKG}['"]`);
const DYNAMIC_IMPORT = new RegExp(`import\\(\\s*['"]${PKG}['"]`);
const REQUIRE_CALL = new RegExp(`require\\(\\s*['"]${PKG}['"]`);

const staticHits = FILES.filter(f => STATIC_IMPORT.test(readFileSync(f, 'utf8')));
const dynamicHits = FILES.filter(f => DYNAMIC_IMPORT.test(readFileSync(f, 'utf8')));
const requireHits = FILES.filter(f => REQUIRE_CALL.test(readFileSync(f, 'utf8')));

describe('AGPL boundary — swisseph-wasm isolation', () => {
  it('no static import edge to the AGPL package anywhere in src/', () => {
    expect(staticHits).toEqual([]);
    expect(requireHits).toEqual([]);
  });

  it('exactly one dynamic-import site: swissEphemerisService.ts', () => {
    expect(dynamicHits.map(f => f.replace(/\\/g, '/'))).toEqual([
      'src/services/swissEphemerisService.ts',
    ]);
  });

  it('the Swiss path is gated by VITE_USE_SWISS_EPHEMERIS at the call site', () => {
    const hook = readFileSync(join(SRC, 'hooks', 'useChartCalculation.ts'), 'utf8');
    expect(hook).toContain("VITE_USE_SWISS_EPHEMERIS === 'true'");
  });

  it('env schema defaults the flag to false', () => {
    const env = readFileSync(join(SRC, 'config', 'env.ts'), 'utf8');
    expect(env).toMatch(/VITE_USE_SWISS_EPHEMERIS.*default\('false'\)/);
  });
});
