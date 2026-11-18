// SPDX-License-Identifier: MIT
/**
 * tools/accuracy/gen-varga-golden.mjs — varga golden corpus generator (ACC-01).
 *
 * Builds tools/accuracy/golden/varga/<chartId>.json from the Lahiri sidereal
 * longitudes already committed under tools/accuracy/golden/ (produced by
 * scripts/accuracy-golden.mjs from Swiss Ephemeris), then applies the
 * *independent* transform in ./lib/varga.mjs.
 *
 * It MUST NOT import from src/. If it did, the gate that consumes this golden
 * would be comparing the engine to itself — a tautology. src/tests/accuracy/
 * noEngineImports.test.ts enforces that, and the whole chain stays independent
 * of the shipped engine: Swiss Ephemeris → independent varga transform.
 *
 *   npm run accuracy:golden:varga
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vargaSigns, VARGA_KEYS } from './lib/varga.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden');
const OUT_DIR = join(GOLDEN_DIR, 'varga');
const SWISS_MANIFEST = join(GOLDEN_DIR, 'manifest.json');

/** Bodies carried in the golden, mapped to their name in the Swiss golden. */
const BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu'];

const swissManifest = JSON.parse(readFileSync(SWISS_MANIFEST, 'utf8'));

const readSwissGolden = (id) => {
  const p = join(GOLDEN_DIR, `${id}.json`);
  if (!existsSync(p)) throw new Error(`Swiss golden missing for ${id}: ${p}`);
  return JSON.parse(readFileSync(p, 'utf8'));
};

mkdirSync(OUT_DIR, { recursive: true });

const entries = [];

for (const id of swissManifest.charts) {
  const swiss = readSwissGolden(id);
  const bodies = {};

  for (const name of BODIES) {
    const graha = swiss.grahas.find((g) => g.name === name);
    if (!graha) throw new Error(`${id}: body ${name} absent from the Swiss golden`);
    const lon = graha.sidereal;
    bodies[name] = { lon: +lon.toFixed(6), varga: vargaSigns(lon) };
  }

  const out = { id, ayanamsaMode: swiss.ayanamsaMode, bodies };
  writeFileSync(join(OUT_DIR, `${id}.json`), JSON.stringify(out, null, 2) + '\n');
  entries.push({
    id,
    sha256: createHash('sha256').update(JSON.stringify(out)).digest('hex'),
  });
  console.log(`  ✓ ${id.padEnd(24)} ${BODIES.length} bodies × ${VARGA_KEYS.length} vargas`);
}

writeFileSync(
  join(OUT_DIR, 'manifest.json'),
  JSON.stringify(
    {
      convention: 'parashari-classical-starts-D2-D3-D7-D10-D12-D20-D24-D30-D40-D45-D60',
      ayanamsa: swissManifest.ayanamsaMode,
      longitudeSource: 'tools/accuracy/golden (swisseph-wasm)',
      swisseph: swissManifest.swissephWasmVersion,
      corpusHash: swissManifest.corpusHash,
      vargas: VARGA_KEYS,
      charts: entries,
    },
    null,
    2,
  ) + '\n',
);

console.log(`\n  Wrote ${entries.length} varga golden files + manifest.json`);
