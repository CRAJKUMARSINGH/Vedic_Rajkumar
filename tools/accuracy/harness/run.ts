/**
 * run.ts — Accuracy harness runner (no golden files needed for phase 1).
 *
 * Phase 1 (3 charts): runs the engine, prints all positions, identifies any
 * self-consistency issues.  When golden values from Swiss Ephemeris are added
 * to tools/accuracy/golden/*.json, the comparator is activated.
 *
 * Usage:
 *   npx tsx tools/accuracy/harness/run.ts
 *   npx tsx tools/accuracy/harness/run.ts --json   (machine-readable output)
 *
 * Exit code: 0 always in phase 1 (no golden to compare against).
 *            1 when golden files exist and Tier B breaches are found.
 */

import { createReadStream } from 'node:fs';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import type { CorpusChart, ChartRunResult, Finding } from './types.js';
import { runEngine } from './engine-adapter.js';
import { TOL_ARCSEC } from './tolerances.js';

const ROOT        = new URL('../../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const CORPUS_FILE = join(ROOT, 'tools', 'accuracy', 'corpus', 'charts.jsonl');
const GOLDEN_DIR  = join(ROOT, 'tools', 'accuracy', 'golden');
const DIST_DIR    = join(ROOT, 'dist');
const JSON_MODE   = process.argv.includes('--json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function arcsecDelta(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d * 3600;
}

function norm360(d: number): number { return ((d % 360) + 360) % 360; }

async function readCorpus(path: string): Promise<CorpusChart[]> {
  const charts: CorpusChart[] = [];
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed) charts.push(JSON.parse(trimmed) as CorpusChart);
  }
  return charts;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const charts = await readCorpus(CORPUS_FILE);
const results: ChartRunResult[] = [];
let tierBBreaches = 0;

console.log(`\n${'─'.repeat(60)}`);
console.log(`  Vedic Rajkumar Accuracy Harness — Phase 1 (${charts.length} charts)`);
console.log(`${'─'.repeat(60)}\n`);

for (const chart of charts) {
  process.stdout.write(`  ${chart.id.padEnd(24)} ${chart.label}\n`);

  let engineOutput;
  try {
    engineOutput = await runEngine(chart);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`    ✗ ENGINE ERROR: ${errorMsg}\n`);
    results.push({ chartId: chart.id, label: chart.label, strata: chart.strata, findings: [], error: errorMsg });
    continue;
  }

  // Print positions
  console.log(`    JD=${engineOutput.julianDay.toFixed(6)}  Ayanamsa=${engineOutput.ayanamsa.toFixed(6)}°`);
  console.log(`    Ascendant: ${engineOutput.ascendant.sidereal.toFixed(4)}°  (${engineOutput.ascendant.rashi} ${engineOutput.ascendant.nakshatra} pada ${engineOutput.ascendant.pada})`);
  for (const g of engineOutput.grahas) {
    console.log(`    ${g.name.padEnd(10)} ${g.sidereal.toFixed(4)}°  ${g.rashi.padEnd(13)}  ${g.nakshatra} p${g.pada}`);
  }

  // Compare to golden if it exists
  const goldenPath = join(GOLDEN_DIR, `${chart.id}.json`);
  const findings: Finding[] = [];

  if (existsSync(goldenPath)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const golden = JSON.parse(readFileSync(goldenPath, 'utf8')) as any;

    // Tier A — ayanamsa
    const ayErr = arcsecDelta(engineOutput.ayanamsa, golden.ayanamsa);
    if (ayErr > TOL_ARCSEC.ayanamsa) {
      findings.push({ chartId: chart.id, tier: 'A', metric: 'ayanamsa', err: ayErr, tol: TOL_ARCSEC.ayanamsa, unit: 'arcsec' });
    }

    // Tier A — ascendant
    const ascErr = arcsecDelta(engineOutput.ascendant.sidereal, golden.ascendant.sidereal);
    if (ascErr > TOL_ARCSEC.ascendant) {
      findings.push({ chartId: chart.id, tier: 'A', metric: 'ascendant', err: ascErr, tol: TOL_ARCSEC.ascendant, unit: 'arcsec' });
    }

    // Tier B — ascendant rashi/nakshatra
    if (engineOutput.ascendant.rashi !== golden.ascendant.rashi) {
      findings.push({ chartId: chart.id, tier: 'B', metric: 'ascendant.rashi', expected: golden.ascendant.rashi, got: engineOutput.ascendant.rashi });
      tierBBreaches++;
    }

    // Tier A + B — grahas
    for (const eg of engineOutput.grahas) {
      const gg = golden.grahas?.find((g: { name: string }) => g.name === eg.name);
      if (!gg) continue;
      const tol = eg.name === 'Moon' ? TOL_ARCSEC.moon : (eg.name === 'Rahu' || eg.name === 'Ketu') ? TOL_ARCSEC.node : TOL_ARCSEC.graha;
      const err = arcsecDelta(eg.sidereal, gg.sidereal);
      if (err > tol) {
        findings.push({ chartId: chart.id, tier: 'A', metric: `graha.${eg.name}`, err, tol, unit: 'arcsec' });
      }
      if (eg.nakshatra !== gg.nakshatra) {
        findings.push({ chartId: chart.id, tier: 'B', metric: `nakshatra.${eg.name}`, expected: gg.nakshatra, got: eg.nakshatra });
        tierBBreaches++;
      }
    }

    if (findings.length === 0) {
      console.log(`    ✓ golden comparison passed\n`);
    } else {
      for (const f of findings) {
        const tag = f.tier === 'A'
          ? `  TIER-A ${f.metric} err=${f.err?.toFixed(2)}" (tol ${f.tol}")`
          : `  TIER-B ${f.metric}: expected "${f.expected}" got "${f.got}"`;
        console.log(`    ${f.tier === 'B' ? '✗' : '⚠'} ${tag}`);
      }
      console.log('');
    }
  } else {
    console.log(`    (no golden file — run npm run accuracy:golden to generate)\n`);
  }

  results.push({ chartId: chart.id, label: chart.label, strata: chart.strata, findings });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

const totalFindings = results.reduce((n, r) => n + r.findings.length, 0);
const totalErrors   = results.filter(r => r.error).length;

console.log('─'.repeat(60));
console.log(`  Charts run: ${charts.length}`);
console.log(`  Engine errors: ${totalErrors}`);
console.log(`  Total findings: ${totalFindings}`);
console.log(`  Tier B breaches: ${tierBBreaches}`);
console.log('─'.repeat(60) + '\n');

// ─── Write reports ────────────────────────────────────────────────────────────

if (JSON_MODE) {
  const summary = {
    runAt:          new Date().toISOString(),
    chartsRun:      charts.length,
    engineErrors:   totalErrors,
    totalFindings,
    tierBBreaches,
    results,
  };
  mkdirSync(DIST_DIR, { recursive: true });
  writeFileSync(join(DIST_DIR, 'accuracy-summary.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(`  Wrote dist/accuracy-summary.json\n`);
}

process.exit(tierBBreaches > 0 ? 1 : 0);
