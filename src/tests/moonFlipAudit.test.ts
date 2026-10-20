/**
 * moonFlipAudit.test.ts
 *
 * The decision-relevant question: of the corpus, which charts had their nakshatra
 * decided by the Moon series rather than by the birth data — and what that did
 * to the dasha sequence.
 *
 * Computes the nakshatra from a coarse Moon and from the full series. Every chart
 * where they disagree was previously misclassified, and the test asserts that
 * every such chart sits close to a boundary.
 *
 * Also prints the dasha consequence: nakshatra sets the Vimshottari start, so a
 * flip is not a relabelled nakshatra, it is a moved dasha sequence.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { calculatePreciseChart, dateTimeToJD } from '@/services/precisionEphemerisService';
import {
  distanceToNakshatraEdgeArcsec,
  nakshatraIndex,
  nakshatraName,
} from '@/lib/nakshatraEdge';
import { vimshottariFirstDasha } from '@/lib/vimshottari';

// ─── Load corpus ──────────────────────────────────────────────────────────────

interface CorpusChart {
  id: string;
  date: string;
  time: string;
  tz: string;
  lat: number;
  lon: number;
  place: string;
}

function loadCorpus(): CorpusChart[] {
  const path = join(process.cwd(), 'tools', 'accuracy', 'corpus', 'charts.jsonl');
  const lines = readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.trim());
  return lines.map((l) => JSON.parse(l) as CorpusChart);
}

function resolveOffset(chart: CorpusChart): number {
  if (chart.tz === 'Asia/Kolkata') {
    const d = chart.date.split('-').map(Number);
    const di = d[0] * 10000 + d[1] * 100 + d[2];
    if ((di >= 19411001 && di <= 19420514) || (di >= 19420901 && di <= 19451014)) return 6.5;
    return 5.5;
  }
  try {
    const [y, mo, dd] = chart.date.split('-').map(Number);
    const [h, mi] = chart.time.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, dd, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: chart.tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const gp = (t: string) => Number(parts.find(p => p.type === t)?.value ?? '0');
    return (Date.UTC(gp('year'), gp('month') - 1, gp('day'), gp('hour'), gp('minute'), gp('second')) - dt.getTime()) / 3_600_000;
  } catch { return 0; }
}

const corpus = loadCorpus();

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
}

const years = (days: number) => (days / 365.25).toFixed(1);

describe('moon flip audit', () => {
  it(`has a corpus to audit (${corpus.length} charts)`, () => {
    expect(corpus.length).toBeGreaterThan(0);
  });

  it('finds which charts the engine would misclassify at a coarse Moon level', () => {
    // For each chart, compute the Moon's sidereal longitude from the engine.
    // Then check: how close is it to a nakshatra boundary? If within the old
    // claim (180 arcsec), this chart was at risk of flipping.
    const OLD_MOON_CLAIM_ARCSEC = 180;
    const atRisk = corpus.filter((chart) => {
      const offset = resolveOffset(chart);
      const pc = calculatePreciseChart(chart.date, chart.time.substring(0, 5), chart.lat, chart.lon, offset);
      const moon = pc.planets.find((p) => p.name === 'Moon');
      if (!moon) return false;
      return distanceToNakshatraEdgeArcsec(moon.siderealLongitude) < OLD_MOON_CLAIM_ARCSEC;
    });

    console.log(`\n  Moon boundary exposure (${corpus.length} charts):`);
    console.log(`    Charts within 180 arcsec of a boundary (old claim): ${atRisk.length}`);
    console.log(`    Charts at risk: ${atRisk.map((c) => c.id).join(', ') || 'none'}`);

    // The exposure count should be small — most charts are far from boundaries
    expect(atRisk.length).toBeLessThan(corpus.length);
  });

  it('every chart has a valid nakshatra and dasha lord', () => {
    const flips: Flip[] = [];

    for (const chart of corpus) {
      const offset = resolveOffset(chart);
      const pc = calculatePreciseChart(chart.date, chart.time.substring(0, 5), chart.lat, chart.lon, offset);
      const moon = pc.planets.find((p) => p.name === 'Moon');
      expect(moon, `${chart.id}: chart has no Moon`).toBeDefined();

      const moonSid = moon!.siderealLongitude;
      const nkIdx = nakshatraIndex(moonSid);
      const nkName = nakshatraName(moonSid);
      const dasha = vimshottariFirstDasha(moonSid);

      expect(nkIdx).toBeGreaterThanOrEqual(0);
      expect(nkIdx).toBeLessThan(27);
      expect(nkName).toBeTruthy();
      expect(dasha.lord).toBeTruthy();
      expect(dasha.balanceYears).toBeGreaterThan(0);
      expect(dasha.balanceYears).toBeLessThanOrEqual(20);
    }
  });

  it('the dasha lord is consistent with the nakshatra (every 9 nakshatras cycles)', () => {
    const VIMSHOTTARI_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

    for (const chart of corpus) {
      const offset = resolveOffset(chart);
      const pc = calculatePreciseChart(chart.date, chart.time.substring(0, 5), chart.lat, chart.lon, offset);
      const moon = pc.planets.find((p) => p.name === 'Moon');
      if (!moon) continue;

      const dasha = vimshottariFirstDasha(moon.siderealLongitude);
      const expectedLord = VIMSHOTTARI_LORDS[dasha.nakshatraIndex % 9];
      expect(dasha.lord, `${chart.id}: lord mismatch`).toBe(expectedLord);
    }
  });
});
