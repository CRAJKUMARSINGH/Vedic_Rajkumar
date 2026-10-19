#!/usr/bin/env node
/**
 * scripts/accuracy-golden.mjs
 *
 * Slice 2 — Swiss Ephemeris cross-check · golden generator.
 *
 * The accuracy harness (tools/accuracy/harness/run.ts) and the corpus test
 * (src/tests/accuracy/corpusPhase1.test.ts) both compare the *shipped* engine
 * against golden files under tools/accuracy/golden/.  Those files did not exist,
 * so the Tier A/B gates were inert.  This script generates them from the
 * independent authority — Swiss Ephemeris (swisseph-wasm) — exactly as
 * docs/accuracy/METHODOLOGY.md promises:
 *
 *   npm run accuracy:golden    # generate golden values from Swiss Ephemeris
 *   npm run test:accuracy:full # compare engine output to golden
 *
 * Golden values are Lahiri sidereal longitudes for the 9 grahas + the ascendant,
 * resolved with each chart's correct historical UTC offset (India wartime +6:30
 * is honoured — Intl does not carry pre-independence Kolkata rules).
 *
 * Output:
 *   tools/accuracy/golden/<chartId>.json   — per-chart truth
 *   tools/accuracy/golden/manifest.json    — swisseph-wasm version, ayanamsa
 *                                            mode, corpus hash (reproducibility)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import SwissEph from 'swisseph-wasm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CORPUS_FILE = join(ROOT, 'tools', 'accuracy', 'corpus', 'charts.jsonl');
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden');

// ── Constants (mirror swissEphemerisService.ts) ───────────────────────────────

const SE_PLANET = {
  Sun: 0, Moon: 1, Mercury: 2, Venus: 3, Mars: 4,
  Jupiter: 5, Saturn: 6, Rahu: 10 /* MEAN_NODE */,
};
const SEFLG_SIDEREAL = 0x10000; // 65536
const LAHIRI_SID_MODE = 1;

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const norm360 = (d) => ((d % 360) + 360) % 360;
const rashiOf = (lon) => RASHIS[Math.floor(norm360(lon) / 30)];
const nakshatraOf = (lon) => NAKSHATRAS[Math.min(26, Math.floor(norm360(lon) / (360 / 27)))];
const padaOf = (lon) => {
  const span = 360 / 27;
  return Math.min(4, Math.floor((norm360(lon) % span) / (span / 4)) + 1);
};

// ── Historical / IANA UTC-offset resolution (mirrors engine-adapter.ts) ───────

function resolveOffset(chart) {
  if (chart.tz === 'Asia/Kolkata') {
    const d = chart.date.split('-').map(Number);
    const di = d[0] * 10000 + d[1] * 100 + d[2];
    // India wartime UTC+6:30 (both 1942-45 windows).
    if ((di >= 19411001 && di <= 19420514) || (di >= 19420901 && di <= 19451014)) return 6.5;
    return 5.5; // Modern IST — pre-1942 "Bombay Time" is +5:30 for our purposes.
  }
  try {
    const [y, mo, day] = chart.date.split('-').map(Number);
    const [h, mi] = chart.time.substring(0, 5).split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, day, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: chart.tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const gp = (t) => Number(parts.find((p) => p.type === t)?.value ?? '0');
    const tzMs = Date.UTC(gp('year'), gp('month') - 1, gp('day'), gp('hour'), gp('minute'), gp('second'));
    return (tzMs - dt.getTime()) / 3_600_000;
  } catch {
    return 5.5;
  }
}

// ── Corpus ────────────────────────────────────────────────────────────────────

function readCorpus() {
  if (!existsSync(CORPUS_FILE)) throw new Error(`Corpus not found: ${CORPUS_FILE}`);
  const raw = readFileSync(CORPUS_FILE, 'utf8');
  const charts = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  return { charts, raw };
}

// ── Swiss computation ─────────────────────────────────────────────────────────

function buildGolden(swe, chart) {
  const [y, m, d] = chart.date.split('-').map(Number);
  const [h, mi] = chart.time.substring(0, 5).split(':').map(Number);
  const offset = resolveOffset(chart);
  const utcHour = h + mi / 60 - offset;

  const jd = swe.julday(y, m, d, utcHour);
  swe.set_sid_mode(LAHIRI_SID_MODE, 0, 0);

  const ayanamsa = swe.get_ayanamsa_ut(jd);

  const calc = (body) => {
    const r = swe.calc_ut(jd, body, SEFLG_SIDEREAL);
    if (!r || r.error) throw new Error(r?.error ?? `calc_ut(${body}) failed`);
    return norm360(r[0]);
  };

  const grahas = [];
  for (const [name, id] of Object.entries(SE_PLANET)) {
    const lon = calc(id);
    grahas.push({ name, sidereal: lon, rashi: rashiOf(lon), nakshatra: nakshatraOf(lon), pada: padaOf(lon) });
  }
  // Ketu = Rahu + 180°
  const rahu = grahas.find((g) => g.name === 'Rahu').sidereal;
  const ketu = norm360(rahu + 180);
  grahas.push({ name: 'Ketu', sidereal: ketu, rashi: rashiOf(ketu), nakshatra: nakshatraOf(ketu), pada: padaOf(ketu) });

  const houses = swe.houses_ex(jd, SEFLG_SIDEREAL, chart.lat, chart.lon, 'E');
  if (!houses || houses.error) throw new Error(houses?.error ?? 'houses_ex failed');
  const asc = norm360(houses.ascmc[0]);

  return {
    id: chart.id,
    label: chart.label,
    date: chart.date,
    time: chart.time,
    tz: chart.tz,
    resolvedOffsetHours: offset,
    lat: chart.lat,
    lon: chart.lon,
    julianDay: jd,
    ayanamsa,
    ayanamsaMode: 'Lahiri',
    source: 'swisseph-wasm',
    ascendant: { sidereal: asc, rashi: rashiOf(asc), nakshatra: nakshatraOf(asc), pada: padaOf(asc) },
    grahas,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const { charts, raw } = readCorpus();

const swe = new SwissEph();
await swe.initSwissEph();

mkdirSync(GOLDEN_DIR, { recursive: true });

console.log(`\n${'─'.repeat(64)}`);
console.log(`  Vedic Rajkumar — Swiss Ephemeris golden generator (slice 2)`);
console.log(`  Corpus: ${charts.length} charts · ayanamsa: Lahiri`);
console.log(`${'─'.repeat(64)}\n`);

for (const chart of charts) {
  const golden = buildGolden(swe, chart);
  writeFileSync(join(GOLDEN_DIR, `${chart.id}.json`), JSON.stringify(golden, null, 2) + '\n');
  console.log(`  ✓ ${chart.id.padEnd(24)} ${chart.label}`);
  console.log(`      jd=${golden.julianDay.toFixed(5)}  ayanamsa=${golden.ayanamsa.toFixed(4)}°  asc=${golden.ascendant.rashi} ${golden.ascendant.sidereal.toFixed(3)}°`);
}

// ── Manifest (reproducibility record) ─────────────────────────────────────────

let swissephVersion = 'unknown';
try {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'node_modules', 'swisseph-wasm', 'package.json'), 'utf8'));
  swissephVersion = pkg.version;
} catch { /* non-fatal */ }

const corpusHash = createHash('sha256').update(raw).digest('hex');
const manifest = {
  generatedAt: new Date().toISOString(),
  engine: 'swisseph-wasm (Swiss Ephemeris)',
  swissephWasmVersion: swissephVersion,
  ayanamsaMode: 'Lahiri',
  sidMode: LAHIRI_SID_MODE,
  houseSystem: 'E (Equal)',
  corpusFile: 'tools/accuracy/corpus/charts.jsonl',
  corpusHash: `sha256:${corpusHash}`,
  chartCount: charts.length,
  charts: charts.map((c) => c.id),
};
writeFileSync(join(GOLDEN_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`\n  Wrote ${charts.length} golden files + manifest.json`);
console.log(`  swisseph-wasm v${swissephVersion} · corpus ${manifest.corpusHash.slice(0, 19)}…\n`);
