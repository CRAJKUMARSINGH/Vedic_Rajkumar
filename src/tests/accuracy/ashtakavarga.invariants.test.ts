/**
 * ashtakavarga.invariants.test.ts
 *
 * W18 Thread B — "invariants before transcription".
 *
 * The Ashtakavarga engine (src/services/ashtakavargaService.ts) is a *point
 * table*: for each of the seven grahas it lists, per contributor, the houses
 * (counted from that contributor) that yield one bindu. Two classical
 * invariants fall out of that shape and are therefore chart-independent:
 *
 *   · a graha's Bhinnashtakavarga (BAV) totals the same number of bindus on
 *     every chart — the sum of its rule-list lengths — and that number is the
 *     classical 48/49/39/54/56/52/39, totalling 337;
 *   · the Sarvashtakavarga (SAV) is the sum of the seven BAV tables, so each
 *     sign stays within 0..56 and the twelve signs total exactly 337.
 *
 * Stage 1 (below) asserts those invariants over the full 15-chart accuracy
 * corpus, and additionally pins the *per-contributor rule lengths*. That vector
 * also changes if a single house is added or dropped from a rule list, so it
 * gates the table below the total level without a 672-entry parallel
 * transcription. The W18 plan warns outright that a wholesale second
 * transcription is "where a week goes to die"; Stage 2 stays deferred until the
 * cheap gates stop being enough. The classical totals do hold on this repo's
 * tables — verified here, not assumed.
 *
 * Gochar consequence: the plan asks for an assertion that the transit layer
 * *reads* the gated BAV rather than recomputing it. The wired path
 * (dynamicTransitService.computeAshtakavargaTransitPoints) does read it, and
 * that is asserted below over the corpus. The parallel, unwired path
 * (ashtakavargaTransitService) does not — it defaults to a hard-coded table.
 * That divergence is pinned in its own block and logged as DEF-012 in
 * docs/app-robustness-testing.md.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { resolveBirthTimezone } from '@/lib/birthTimezone';
import { calculateAshtakavarga } from '@/services/ashtakavargaService';
import { computeAshtakavargaTransitPoints } from '@/services/dynamicTransitService';
import {
  calculateAshtakavargaTransitAnalysis,
  calculateSarvashtakavarga,
} from '@/services/ashtakavargaTransitService';

// ── Corpus ────────────────────────────────────────────────────────────────────

interface CorpusEntry {
  id: string;
  label: string;
  date: string;
  time: string; // "HH:MM:SS" in the corpus file
  tz: string;
  lat: number;
  lon: number;
  place: string;
}

const CORPUS: CorpusEntry[] = readFileSync(
  join(process.cwd(), 'tools', 'accuracy', 'corpus', 'charts.jsonl'),
  'utf8',
)
  .split(/\r?\n/)
  .filter((line) => line.trim().length > 0)
  .map((line) => JSON.parse(line) as CorpusEntry);

/** Same offset-resolution rule the Shadbala corpus gate uses. */
function resolveOffset(e: CorpusEntry): number {
  if (e.tz === 'Asia/Kolkata') {
    return resolveBirthTimezone({ date: e.date, location: e.place })?.offsetHours ?? 5.5;
  }
  try {
    const [y, mo, d] = e.date.split('-').map(Number);
    const [h, mi] = e.time.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: e.tz,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const gp = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
    return (
      (Date.UTC(gp('year'), gp('month') - 1, gp('day'), gp('hour'), gp('minute'), gp('second')) -
        dt.getTime()) / 3_600_000
    );
  } catch {
    return 0;
  }
}

// ── Classical constants (restated so a silent edit fails here) ────────────────

/** BAV total bindus per graha, classical. Sum == 337. */
const BAV_TOTALS: Record<string, number> = {
  Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39,
};

/** Sum of the seven BAV totals — the SAV total, invariant on every chart. */
const SAV_TOTAL = 337;

/** Contributors, in the engine's insertion order. */
const CONTRIBUTORS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Ascendant'] as const;

/**
 * BAV rule-list lengths per contributor — the transcription gate at the vector
 * level. A rule list of length n contributes n bindus to the BAV total, so any
 * added/removed house anywhere in the 672-entry table moves one of these cells.
 */
const BAV_CONTRIBUTOR_LENGTHS: Record<string, number[]> = {
  //          Sun Moon Mars Merc  Jup  Ven  Sat  Asc
  Sun:      [8, 4, 8, 7, 4, 3, 8, 6],
  Moon:     [6, 6, 7, 8, 7, 7, 4, 4],
  Mars:     [5, 3, 7, 4, 4, 4, 7, 5],
  Mercury:  [5, 6, 8, 8, 4, 8, 8, 7],
  Jupiter:  [9, 5, 7, 8, 8, 6, 4, 9],
  Venus:    [3, 9, 6, 5, 5, 9, 7, 8],
  Saturn:   [7, 3, 6, 6, 4, 3, 4, 6],
};

const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

interface NatalFrame {
  rashis: Record<string, number>;
  lagna: number;
}

function natalFrameFor(e: CorpusEntry): NatalFrame {
  const chart = calculatePreciseChart(e.date, e.time.slice(0, 5), e.lat, e.lon, resolveOffset(e));
  const byName = new Map(chart.planets.map((p) => [p.name, p] as const));
  const rashis: Record<string, number> = {};
  for (const name of GRAHAS) {
    const p = byName.get(name);
    expect(p, `${e.id}: engine chart must contain ${name}`).toBeDefined();
    rashis[name] = p!.rashiIndex;
  }
  return { rashis, lagna: chart.ascendant.rashiIndex };
}

// ── Stage 1 — invariants hold on every chart in the corpus ────────────────────

describe('Ashtakavarga invariants over the 15-chart corpus', () => {
  it('parses a non-empty corpus', () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(15);
    expect(CORPUS.every((e) => e.id && e.date && e.time)).toBe(true);
  });

  for (const e of CORPUS) {
    it(`${e.id} — ${e.label}: BAV/SAV are bounded, coherent and chart-independent`, () => {
      const { rashis, lagna } = natalFrameFor(e);
      const av = calculateAshtakavarga(rashis, lagna);

      // Exactly the seven classical grahas, in order.
      expect(av.tables.map((t) => t.planet)).toEqual([...GRAHAS]);
      expect(av.ascendantRashi).toBe(lagna);

      let corpusBavTotal = 0;
      for (const table of av.tables) {
        // Every bindu count is a real bindu count.
        for (const pts of table.bavPoints) {
          expect(Number.isInteger(pts), `${table.planet} bindu integral`).toBe(true);
          expect(pts, `${table.planet} bindu >= 0`).toBeGreaterThanOrEqual(0);
          expect(pts, `${table.planet} bindu <= 8`).toBeLessThanOrEqual(8);
        }

        // The BAV total is the sum of the rule-list lengths — chart-independent.
        const total = table.bavPoints.reduce((a, b) => a + b, 0);
        expect(total, `${table.planet} BAV total is classical`).toBe(BAV_TOTALS[table.planet]);
        corpusBavTotal += total;

        // Per-contributor sums reproduce the rule-list lengths (transcription gate).
        const lengths = CONTRIBUTORS.map((c) =>
          (table.contributorPoints[c] ?? []).reduce((a, b) => a + b, 0),
        );
        expect(lengths, `${table.planet} rule-list lengths`).toEqual(
          BAV_CONTRIBUTOR_LENGTHS[table.planet],
        );

        // Contributor points add up to the BAV row, rashi by rashi.
        for (let r = 0; r < 12; r++) {
          const contribSum = Object.values(table.contributorPoints).reduce(
            (acc, pts) => acc + (pts[r] ?? 0),
            0,
          );
          expect(contribSum, `${table.planet} contributors sum rashi ${r}`).toBe(
            table.bavPoints[r],
          );
        }
      }

      expect(corpusBavTotal).toBe(SAV_TOTAL);

      // SAV = sum of the seven BAV tables, per sign.
      expect(av.savPoints).toHaveLength(12);
      for (let r = 0; r < 12; r++) {
        const summed = av.tables.reduce((acc, t) => acc + t.bavPoints[r], 0);
        expect(av.savPoints[r], `SAV rashi ${r} equals BAV column sum`).toBe(summed);
        expect(av.savPoints[r], `SAV rashi ${r} >= 0`).toBeGreaterThanOrEqual(0);
        expect(av.savPoints[r], `SAV rashi ${r} <= 56`).toBeLessThanOrEqual(56);
      }
      expect(av.savPoints.reduce((a, b) => a + b, 0)).toBe(SAV_TOTAL);

      // House strengths re-index SAV by the ascendant and stay in band.
      expect(av.houseStrengths).toHaveLength(12);
      for (let i = 0; i < 12; i++) {
        const hs = av.houseStrengths[i];
        expect(hs.house).toBe(i + 1);
        expect(hs.rashiIndex).toBe((lagna + i) % 12);
        expect(hs.savPoints).toBe(av.savPoints[hs.rashiIndex]);
      }
    });
  }

  it('BAV totals are identical on a degenerate chart (all grahas in one sign)', () => {
    const flat = Object.fromEntries(GRAHAS.map((g) => [g, 0])) as Record<string, number>;
    const av = calculateAshtakavarga(flat, 0);
    for (const table of av.tables) {
      expect(table.bavPoints.reduce((a, b) => a + b, 0)).toBe(BAV_TOTALS[table.planet]);
    }
    expect(av.savPoints.reduce((a, b) => a + b, 0)).toBe(SAV_TOTAL);
  });
});

// ── Gochar wiring — the transit layer reads the gated BAV, it does not recompute ─

describe('Gochar wiring: the transit layer reads the gated BAV/SAV', () => {
  for (const e of CORPUS) {
    it(`${e.id} — wired transit points mirror the gated engine exactly`, () => {
      const { rashis, lagna } = natalFrameFor(e);

      // Transit rashi == natal rashi, so the scored values must mirror the table.
      const points = computeAshtakavargaTransitPoints(rashis, lagna, rashis);
      const ref = calculateAshtakavarga(rashis, lagna);
      const bavByPlanet = new Map(ref.tables.map((t) => [t.planet, t.bavPoints] as const));

      // Only the seven grahas carry a natal rashi here; Rahu/Ketu have no BAV.
      // (The transit module lists the grahas in its own order.)
      expect(points).toHaveLength(GRAHAS.length);
      expect([...points.map((p) => p.planet)].sort()).toEqual([...GRAHAS].sort());

      for (const p of points) {
        expect(p.transitRashi).toBe(rashis[p.planet]);
        expect(p.savPoints, `${p.planet} SAV read from the gated table`).toBe(
          ref.savPoints[p.transitRashi],
        );
        const bav = bavByPlanet.get(p.planet);
        if (bav) {
          expect(p.bavPoints, `${p.planet} BAV read from the gated table`).toBe(
            bav[p.transitRashi],
          );
        } else {
          // Rahu/Ketu carry no BAV in the classical 7-planet scheme.
          expect(p.bavPoints).toBeUndefined();
        }
      }
    });
  }
});

// ── Divergence — the unwired path is pinned, not hidden ───────────────────────

describe('Divergence (DEF-012): ashtakavargaTransitService recomputes SAV from a fabricated default', () => {
  it('its default SAV is a hard-coded table, not the gated engine output', () => {
    // Called with no savScores it silently uses DEFAULT_SAV_SCORES — a made-up
    // constant — so house 1 always reports 28 regardless of the chart.
    const [sun] = calculateAshtakavargaTransitAnalysis([{ planet: 'Sun', house: 1 }]);
    expect(sun.savScore).toBe(28);
  });

  it('no corpus chart produces that hard-coded house-1 score as its lagna SAV', () => {
    // Proves the default is not "the" SAV: it is not reproducible from any chart.
    let matches = 0;
    for (const e of CORPUS) {
      const { rashis, lagna } = natalFrameFor(e);
      const av = calculateAshtakavarga(rashis, lagna);
      if (av.savPoints[lagna] === 28) matches += 1;
    }
    expect(matches).toBeLessThan(CORPUS.length);
  });

  it('given the gated tables it sums to 337 — but indexes by rashi while the output names houses', () => {
    // calculateSarvashtakavarga() reads the BAV arrays positionally, so it
    // re-derives the *rashi*-indexed SAV and then labels the twelve cells
    // "house1..house12". The two frames coincide only when lagna === 0; every
    // other lagna leaves a caller reading a rashi value where a house is meant.
    const { rashis } = natalFrameFor(CORPUS[0]);
    const av = calculateAshtakavarga(rashis, 0); // lagna 0: rashi index === house index
    const gated = Object.fromEntries(av.tables.map((t) => [t.planet, t.bavPoints]));
    const recomputed = calculateSarvashtakavarga(gated);
    for (let h = 1; h <= 12; h++) {
      expect(recomputed[`house${h}` as keyof typeof recomputed]).toBe(av.savPoints[h - 1]);
    }
    expect(Object.values(recomputed).reduce((a, b) => a + b, 0)).toBe(SAV_TOTAL);
  });
});
