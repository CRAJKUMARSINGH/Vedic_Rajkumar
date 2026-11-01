#!/usr/bin/env node
/**
 * scripts/accuracy-shadbala-golden.mjs
 *
 * Shadbala golden generator — regression baseline for the independent oracle.
 *
 * These are *regression* goldens, not published tables: the corpus has no worked
 * Shadbala example to check against (see docs/accuracy/UNVERIFIED.md). What they
 * buy is that a refactor of the oracle cannot move a single value unnoticed —
 * the reader test (src/tests/accuracy/shadbala.golden.test.ts) re-derives every
 * stored case from its own `inputs` and fails on any drift.
 *
 * It is a script rather than a `.test.ts` for the same reason
 * `scripts/accuracy-golden.mjs` is: a generator that rewrites a baseline must
 * never run inside the normal suite, and the suite's `exclude` list cannot be
 * bypassed from the CLI (a file filter does not override it).
 *
 * Run:
 *   npm run accuracy:shadbala-golden
 *
 * Writes only when the content changed (ignoring the timestamp), so a re-run
 * with no rule change is a no-op and the diff stays readable.
 */

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as R from '../tools/accuracy/shadbalaReference.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden', 'shadbala');

mkdirSync(GOLDEN_DIR, { recursive: true });

const CUSPS = Array.from({ length: 12 }, (_, i) => i * 30);

const KENDRA_BHAVA = { ...R.DIG_BEST_BHAVA };
const DUSTHANA_BHAVA = Object.fromEntries(
  R.PLANETS.map((p) => [p, ((KENDRA_BHAVA[p] + 5) % 12) + 1]),
); // the 7th from the strongest bhava — the weakest position

const ALL = (value) => Object.fromEntries(R.PLANETS.map((p) => [p, value]));

/** Canonical, fully-explicit snapshots. Inputs are stored verbatim in the golden. */
const CASES = [
  {
    id: 'exaltation-noon',
    label: 'Every graha at its exaltation degree, in its strongest bhava, at noon',
    sky: {
      lon: { ...R.EXALTATION },
      house: { ...KENDRA_BHAVA },
      speed: ALL(-1), // retrograde → full Cheshta Bala
      declination: ALL(0), // Ayana Bala neutral
    },
    ctx: { cusps: CUSPS, localHours: 12, isDay: true, third: 1, lords: ALL('Sun') },
  },
  {
    id: 'debilitation-midnight',
    label: 'Every graha at its debilitation degree, in the weakest bhava, at midnight',
    sky: {
      lon: Object.fromEntries(R.PLANETS.map((p) => [p, (R.EXALTATION[p] + 180) % 360])),
      house: { ...DUSTHANA_BHAVA },
      speed: ALL(1), // direct → zero Cheshta Bala
      declination: ALL(24), // extreme Kranti
    },
    ctx: { cusps: CUSPS, localHours: 0, isDay: false, third: 0, lords: ALL('Saturn') },
  },
  {
    id: 'conjunction-aries',
    label: 'All grahas conjunct at 0° Aries in the 1st bhava, at sunrise',
    sky: {
      lon: ALL(0),
      house: ALL(1),
      speed: ALL(0), // stationary
      declination: Object.fromEntries(R.PLANETS.map((p, i) => [p, i * 6 - 18])),
    },
    ctx: { cusps: CUSPS, localHours: 6, isDay: true, third: 0, lords: ALL('Jupiter') },
  },
];

/** 2-space JSON + trailing newline so the file diff is readable and byte-stable. */
const stableStringify = (value) => JSON.stringify(value, null, 2) + '\n';

console.log(`\n${'─'.repeat(64)}`);
console.log(`  Shadbala golden generator (independent oracle)`);
console.log(`${'─'.repeat(64)}\n`);

let written = 0;
let unchanged = 0;
const manifest = [];

for (const c of CASES) {
  const golden = {
    _meta: {
      caseId: c.id,
      label: c.label,
      unit: 'virupas (shashtiamsas); 60 virupas = 1 rupa',
      school: 'A',
      source: 'tools/accuracy/shadbalaReference.mjs',
      note: 'Regression baseline for the independent oracle. Not a published table.',
      generatedAt: new Date().toISOString(),
    },
    inputs: { sky: c.sky, ctx: c.ctx, school: 'A' },
    shadbala: R.shadbala(c.sky, c.ctx, 'A'),
  };

  const path = join(GOLDEN_DIR, `${c.id}.json`);
  const newStr = stableStringify(golden);
  const oldStr = existsSync(path) ? readFileSync(path, 'utf8') : '';

  // Compare ignoring the timestamp so a re-run with no rule change is a no-op.
  const strip = (s) => s.replace(/"generatedAt":\s*"[^"]*"/, '"generatedAt":"REPLACED"');
  if (strip(newStr) !== strip(oldStr)) {
    writeFileSync(path, newStr, 'utf8');
    written++;
    manifest.push({ id: c.id, written: true });
    console.log(`  ✓ ${c.id.padEnd(22)} ${c.label}`);
  } else {
    unchanged++;
    manifest.push({ id: c.id, written: false });
    console.log(`  · ${c.id.padEnd(22)} unchanged`);
  }
}

writeFileSync(
  join(GOLDEN_DIR, 'manifest.json'),
  stableStringify({
    generatedAt: new Date().toISOString(),
    source: 'tools/accuracy/shadbalaReference.mjs',
    caseCount: CASES.length,
    written,
    unchanged,
    cases: manifest,
  }),
  'utf8',
);

console.log(`\n  ${written} written, ${unchanged} unchanged`);
console.log(`  Directory: tools/accuracy/golden/shadbala/\n`);
