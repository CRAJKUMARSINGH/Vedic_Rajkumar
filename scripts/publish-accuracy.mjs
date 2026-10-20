#!/usr/bin/env node
/**
 * publish-accuracy.mjs - regenerate the /accuracy page's snapshot.
 *
 *   node scripts/publish-accuracy.mjs
 *
 * Runs the SHIPPED engine over the accuracy corpus and measures it against the
 * Swiss Ephemeris golden files, then writes the snapshot the /accuracy page
 * renders. Nothing is copied from a gate run: the numbers are re-derived here,
 * so the page cannot drift from the engine that ships.
 *
 * Engine loading: the production engine is TypeScript with `@/` aliases, so it
 * is loaded through Vite's SSR module runner rather than re-implemented.  If the
 * corpus or golden files are absent the committed placeholder is left in place.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CORPUS_FILE = join(ROOT, 'tools', 'accuracy', 'corpus', 'charts.jsonl');
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden');
const DEST = join(ROOT, 'src', 'generated', 'summary.json');

// ── Honesty constants ─────────────────────────────────────────────────────────
// Claim: the accuracy the engine actually advertises in arcseconds.
//   Sun 0.01 deg ... Saturn 0.5 deg  - header of precisionEphemerisService.ts
//   Moon 15"                          - docs/MOON_ACCURACY.md
//   Rahu/Ketu 0.1 deg                 - mean node (Meeus)
//   Ascendant 30"                     - the bound ascendantProof.test.ts asserts
//                                       against Swiss houses_ex
// Max: the user-visible fail ceiling from the corpus gate (0.5 deg = 1800").
const CLAIM_ARCSEC = {
  Sun: 36,
  Moon: 15,
  Mercury: 7200,
  Venus: 1800,
  Mars: 3600,
  Jupiter: 1800,
  Saturn: 1800,
  Rahu: 360,
  Ketu: 360,
  Ascendant: 30,
};
const MAX_ARCSEC = 1800;
const MOON_CLAIM_ARCSEC = 15;
const PREVIOUS_MOON_CLAIM_ARCSEC = 180;
const BODY_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'];

const norm360 = (d) => ((d % 360) + 360) % 360;
function arcsec(a, b) {
  let d = Math.abs(norm360(a) - norm360(b)) % 360;
  if (d > 180) d = 360 - d;
  return d * 3600;
}

// ── Historical / IANA UTC-offset resolution (mirrors accuracy-golden.mjs) ──────

function resolveOffset(chart) {
  if (chart.tz === 'Asia/Kolkata') {
    const d = chart.date.split('-').map(Number);
    const di = d[0] * 10000 + d[1] * 100 + d[2];
    if ((di >= 19411001 && di <= 19420514) || (di >= 19420901 && di <= 19451014)) return 6.5;
    return 5.5;
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

function readCorpus() {
  const raw = readFileSync(CORPUS_FILE, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function swissVersion() {
  try {
    const manifest = JSON.parse(readFileSync(join(GOLDEN_DIR, 'manifest.json'), 'utf8'));
    return `swisseph-wasm v${manifest.swissephWasmVersion} (Lahiri)`;
  } catch {
    return 'swisseph-wasm (Lahiri)';
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!existsSync(CORPUS_FILE) || !existsSync(GOLDEN_DIR)) {
  console.warn('! corpus or golden directory missing - leaving the placeholder snapshot in place.');
  console.warn('  Generate golden first: npm run accuracy:golden');
  process.exit(0);
}

const charts = readCorpus();

const server = await createServer({
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  // Own cache dir: never collides with the dev server's node_modules/.vite lock.
  cacheDir: join(ROOT, 'node_modules', '.vite-accuracy-publish'),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, preTransformRequests: false },
  resolve: { alias: { '@': resolvePath(ROOT, 'src') } },
});

let report;
try {
  const eng = await server.ssrLoadModule('/src/services/precisionEphemerisService.ts');
  const nakshatraEdge = await server.ssrLoadModule('/src/lib/nakshatraEdge.ts');

  const worst = new Map(BODY_ORDER.map((b) => [b, null]));
  const note = (body, err) => {
    const prev = worst.get(body);
    if (prev === null || err > prev) worst.set(body, err);
  };

  let compared = 0;
  let pre1906 = 0;
  let boundaryBefore = 0;
  let boundaryNow = 0;

  for (const chart of charts) {
    const goldenPath = join(GOLDEN_DIR, `${chart.id}.json`);
    if (!existsSync(goldenPath)) continue;

    const golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
    const offset = resolveOffset(chart);
    const pc = eng.calculatePreciseChart(chart.date, chart.time.substring(0, 5), chart.lat, chart.lon, offset);

    compared += 1;
    if (Number(chart.date.slice(0, 4)) < 1906) pre1906 += 1;

    note('Ascendant', arcsec(pc.ascendant.siderealLongitude, golden.ascendant.sidereal));

    for (const g of golden.grahas) {
      const p = pc.planets.find((pp) => pp.name === g.name);
      if (p) note(g.name, arcsec(p.siderealLongitude, g.sidereal));
    }

    const moon = pc.planets.find((p) => p.name === 'Moon');
    if (moon) {
      const d = nakshatraEdge.distanceToNakshatraEdgeArcsec(moon.siderealLongitude);
      if (d < PREVIOUS_MOON_CLAIM_ARCSEC) boundaryBefore += 1;
      if (d < MOON_CLAIM_ARCSEC) boundaryNow += 1;
    }
  }

  const bodies = BODY_ORDER.map((body) => {
    const observed = worst.get(body);
    return {
      body,
      claimArcsec: CLAIM_ARCSEC[body],
      maxArcsec: MAX_ARCSEC,
      observedArcsec: observed === null ? null : Number(observed.toFixed(2)),
    };
  });

  report = {
    isPlaceholder: false,
    generatedAt: new Date().toISOString(),
    engineFrame: 'sidereal (Lahiri) - bodies on TT, angles on UT',
    swissVersion: swissVersion(),
    corpus: {
      charts: compared,
      pre1906,
      sources: ['swisseph-wasm (Lahiri sidereal, houses_ex house system E)'],
    },
    bodies,
    exposure: {
      moonBoundaryNow: boundaryNow,
      moonBoundaryBefore: boundaryBefore,
      moonClaimArcsec: MOON_CLAIM_ARCSEC,
    },
  };
} finally {
  await server.close();
}

mkdirSync(dirname(DEST), { recursive: true });
writeFileSync(DEST, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log(`published ${DEST}`);
console.log(`  ${report.corpus.charts} charts compared · Swiss ${report.swissVersion}`);
for (const b of report.bodies) {
  const obs = b.observedArcsec === null ? '—' : `${b.observedArcsec.toFixed(1)}"`;
  const verdict = b.observedArcsec === null ? 'unmeasured' : b.observedArcsec <= b.claimArcsec ? 'pass' : 'OVER CLAIM';
  console.log(`  ${b.body.padEnd(10)} ${obs.padStart(9)}  claim ${String(b.claimArcsec).padStart(5)}"  ${verdict}`);
}
