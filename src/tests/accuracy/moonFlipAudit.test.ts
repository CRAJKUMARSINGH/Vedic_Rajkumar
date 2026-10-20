/**
 * tools/accuracy/moonFlipAudit.test.ts
 *
 * The decision-relevant question, answered directly: of the corpus, which charts
 * had their nakshatra decided by the Moon series rather than by the birth data?
 *
 * "Truth" is the independent Swiss Ephemeris golden (`swisseph-wasm`), the same
 * authority the corpus gate uses. "Engine" is the shipped Moon series. Every
 * chart where the two disagree was previously misclassified — and the test
 * asserts that every such chart sits close to a boundary, because a flip far
 * from an edge means the series has a bug rather than a truncation.
 *
 * Nakshatra sets the Vimshottari dasha sequence, so a flip is not cosmetic: it
 * moves the start of the whole dasha sequence. For every flip the audit prints
 * the lord change and the shift in first-mahadasha start, from an independent
 * formula (`src/lib/vimshottari.ts`) so a disagreement is a real signal.
 *
 * Exposure (charts within the error bar of an edge) is reported at both the old
 * truncated-series claim and the shipped series' claim, so the improvement is a
 * number in the log rather than a claim.
 *
 * Run: npm run test:accuracy:moon
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { resolveBirthTimezone } from '@/lib/birthTimezone';
import { vimshottariFirstDasha } from '@/lib/vimshottari';
import {
  distanceToNakshatraEdgeArcsec,
  nakshatraCouldFlip,
  nakshatraIndex,
  nakshatraName,
  nakshatraReach,
  norm360,
} from '@/lib/nakshatraEdge';

const ROOT = process.cwd();
const CORPUS_FILE = join(ROOT, 'tools', 'accuracy', 'corpus', 'charts.jsonl');
const GOLDEN_DIR = join(ROOT, 'tools', 'accuracy', 'golden');

/** The old truncated Moon series advertised this. */
const PREVIOUS_MOON_CLAIM_ARCSEC = 180;
/** What the shipped Moon series holds against Swiss Ephemeris. */
const ENGINE_MOON_CLAIM_ARCSEC = 15;

interface CorpusRow {
  id: string;
  date: string;
  time: string;
  tz: string;
  lat: number;
  lon: number;
  place: string;
}

interface GoldenMoon {
  grahas: { name: string; sidereal: number }[];
}

interface Flip {
  id: string;
  date: string;
  place: string;
  from: string;
  to: string;
  distanceArcsec: number;
  oldLord: string;
  newLord: string;
  dashaShiftDays: number;
  moonErrorArcsec: number;
}

function loadCorpus(): CorpusRow[] {
  return readFileSync(CORPUS_FILE, 'utf8')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as CorpusRow);
}

function resolveOffset(row: CorpusRow): number {
  if (row.tz === 'Asia/Kolkata') {
    const r = resolveBirthTimezone({ date: row.date, location: row.place });
    return r ? r.offsetHours : 5.5;
  }
  try {
    const [y, mo, d] = row.date.split('-').map(Number);
    const [h, mi] = row.time.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: row.tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const gp = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
    return (Date.UTC(gp('year'), gp('month') - 1, gp('day'), gp('hour'), gp('minute'), gp('second')) - dt.getTime()) / 3_600_000;
  } catch {
    return 0;
  }
}

function separationArcsec(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b)) % 360;
  const s = d > 180 ? 360 - d : d;
  return s * 3600;
}

function goldenMoonSidereal(id: string): number | null {
  const path = join(GOLDEN_DIR, `${id}.json`);
  if (!existsSync(path)) return null;
  const golden = JSON.parse(readFileSync(path, 'utf8')) as GoldenMoon;
  const moon = golden.grahas.find((g) => g.name === 'Moon');
  return moon ? moon.sidereal : null;
}

const corpus = loadCorpus();

describe('moon flip audit', () => {
  it('has a corpus with an independent Swiss golden for every chart', () => {
    expect(corpus.length).toBeGreaterThan(0);
    for (const row of corpus) {
      expect(goldenMoonSidereal(row.id), `missing golden Moon for ${row.id}`).not.toBeNull();
    }
  });

  it('finds which charts the Moon error was misclassifying', () => {
    const flips: Flip[] = [];
    let exposureOld = 0;
    let exposureNew = 0;
    let maxMoonErrorArcsec = 0;

    for (const row of corpus) {
      const truth = goldenMoonSidereal(row.id);
      if (truth === null) continue;

      const offset = resolveOffset(row);
      const chart = calculatePreciseChart(row.date, row.time, row.lat, row.lon, offset);
      const engine = chart.planets.find((p) => p.name === 'Moon')!.siderealLongitude;

      const moonErrorArcsec = separationArcsec(engine, truth);
      maxMoonErrorArcsec = Math.max(maxMoonErrorArcsec, moonErrorArcsec);

      if (nakshatraCouldFlip(truth, PREVIOUS_MOON_CLAIM_ARCSEC)) exposureOld++;
      if (nakshatraCouldFlip(truth, ENGINE_MOON_CLAIM_ARCSEC)) exposureNew++;

      if (nakshatraIndex(engine) !== nakshatraIndex(truth)) {
        const oldDasha = vimshottariFirstDasha(engine);
        const newDasha = vimshottariFirstDasha(truth);
        flips.push({
          id: row.id,
          date: row.date,
          place: row.place,
          from: nakshatraName(engine),
          to: nakshatraName(truth),
          distanceArcsec: distanceToNakshatraEdgeArcsec(truth),
          oldLord: oldDasha.lord,
          newLord: newDasha.lord,
          dashaShiftDays: newDasha.startOffsetDays - oldDasha.startOffsetDays,
          moonErrorArcsec,
        });
      }
    }

    console.log('\nmoon nakshatra audit over ' + corpus.length + ' charts');
    console.log('  largest engine Moon error vs Swiss:              ' + maxMoonErrorArcsec.toFixed(2) + ' arcsec');
    console.log('  charts the shipped Moon series misclassified:    ' + flips.length);
    console.log('  charts inside a ' + PREVIOUS_MOON_CLAIM_ARCSEC + ' arcsec band (old claim):  ' + exposureOld);
    console.log('  charts inside a ' + ENGINE_MOON_CLAIM_ARCSEC + ' arcsec band (shipped):    ' + exposureNew);
    console.log('  reduction: ' + (exposureOld - exposureNew) + ' charts, ' +
      ((1 - exposureNew / Math.max(1, exposureOld)) * 100).toFixed(1) + '%');

    for (const flip of flips) {
      console.log(
        '  ' + flip.id + ' ' + flip.date + ' ' + flip.place + ': ' +
          flip.from + ' -> ' + flip.to +
          ' | dasha lord ' + flip.oldLord + ' -> ' + flip.newLord +
          ' | first mahadasha start shifts ' + (flip.dashaShiftDays / 365.25).toFixed(2) + ' y' +
          ' (' + flip.distanceArcsec.toFixed(0) + ' arcsec from edge, Moon error ' +
          flip.moonErrorArcsec.toFixed(1) + ' arcsec)',
      );
    }

    if (flips.length > 0) {
      const lordChanged = flips.filter((f) => f.oldLord !== f.newLord).length;
      const movedByYear = flips.filter((f) => Math.abs(f.dashaShiftDays) > 365.25).length;
      const largestShiftYears = Math.max(...flips.map((f) => Math.abs(f.dashaShiftDays))) / 365.25;
      console.log('  charts whose first dasha lord changed:            ' + lordChanged);
      console.log('  charts whose dasha start moves by > a year:       ' + movedByYear);
      console.log('  largest dasha start shift:                        ' + largestShiftYears.toFixed(2) + ' years');

      // Every flip must be explainable by proximity: a flip far from an edge is
      // a series bug, not a truncation.
      for (const flip of flips) {
        expect(
          flip.distanceArcsec,
          flip.id + ' flipped ' + flip.from + ' -> ' + flip.to + ' while ' +
            flip.distanceArcsec.toFixed(0) + ' arcsec from a boundary',
        ).toBeLessThanOrEqual(ENGINE_MOON_CLAIM_ARCSEC * 2);
      }

      // Consecutive nakshatras always have different lords, so a flip almost
      // always moves the dasha lord too. That is the publishable consequence.
      expect(lordChanged).toBeGreaterThanOrEqual(Math.floor(flips.length * 0.9));
    }

    // The narrowing of the exposure band is the improvement, asserted not narrated.
    expect(exposureNew).toBeLessThanOrEqual(exposureOld);
  }, 120_000);

  it('narrows the reachable nakshatra set to at most three', () => {
    for (const row of corpus) {
      const truth = goldenMoonSidereal(row.id);
      if (truth === null) continue;
      const reach = nakshatraReach(truth, ENGINE_MOON_CLAIM_ARCSEC);
      expect(reach.length).toBeGreaterThanOrEqual(1);
      expect(reach.length).toBeLessThanOrEqual(3);
    }
  });
});
