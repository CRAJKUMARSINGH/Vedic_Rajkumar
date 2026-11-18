/**
 * shadbala.corpus.test.ts
 *
 * Runs the shipped Shadbala engine over the 15-chart accuracy corpus and asserts
 * it is *coherent and bounded* — not that it equals the oracle.
 *
 * It deliberately does not compare component values to
 * tools/accuracy/shadbalaReference.mjs. The engine is a compressed, in-house
 * approximation measured in Rupas (Sthana capped at 3, Kala at 2) while the
 * oracle follows BPHS in virupas (Sthana ceiling 465 virupas = 7.75 Rupas). The
 * two are not on the same scale, so a value comparison would encode a false
 * claim. What can be checked honestly is:
 *
 *   · it does not throw, and returns no NaN on real charts;
 *   · every component respects its documented ceiling;
 *   · the ratios and summaries are internally consistent;
 *   · Naisargika Bala reproduces the classical hierarchy the oracle also uses;
 *   · the Engine/oracle divergences (Sun's required minimum, the Sthana scale)
 *     are pinned so they cannot drift unnoticed.
 *
 * The divergences are recorded in docs/accuracy/UNVERIFIED.md.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as R from '../../../tools/accuracy/shadbalaReference.mjs';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { resolveBirthTimezone } from '@/lib/birthTimezone';
import { calculateShadbala, type PlanetData } from '@/services/shadabalaService';

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

/** Same offset-resolution rule the corpus gate uses. */
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

/** Engine's documented per-component ceilings, in Rupas. */
const ENGINE_CEILING = {
  // Sthana is capped at 3.0, then Vargottama (+0.5) and Neecha-Bhanga (+0.75)
  // are added outside the cap.
  sthanaBala: 3.0 + 0.5 + 0.75,
  digBala: 1.0,
  kalaBala: 2.0,
  chestaBala: 1.0,
  naisargikaBala: 1.0,
  drikBala: 1.5,
} as const;

/** Engine's required-minimum table, restated so a silent edit fails here. */
const ENGINE_REQUIRED_RUPAS: Record<string, number> = {
  Sun: 6.5, Moon: 6.0, Mars: 5.0, Mercury: 7.0, Jupiter: 6.5, Venus: 5.5, Saturn: 5.0,
};

function planetsFor(e: CorpusEntry): PlanetData[] {
  const chart = calculatePreciseChart(e.date, e.time.slice(0, 5), e.lat, e.lon, resolveOffset(e));
  const byName = new Map(chart.planets.map((p) => [p.name, p]));
  return R.PLANETS.map((name) => {
    const p = byName.get(name);
    expect(p, `${e.id}: engine chart must contain ${name}`).toBeDefined();
    return {
      name,
      rashiIndex: p!.rashiIndex,
      house: p!.house,
      degrees: p!.degrees,
      isRetrograde: p!.isRetrograde,
      longitude: p!.siderealLongitude,
    };
  });
}

describe('Shadbala engine over the 15-chart corpus', () => {
  it('parses a non-empty corpus', () => {
    expect(CORPUS.length).toBeGreaterThanOrEqual(15);
    expect(CORPUS.every((e) => e.id && e.date && e.time)).toBe(true);
  });

  for (const e of CORPUS) {
    it(`${e.id} — ${e.label}: bounded, finite and internally consistent`, () => {
      const month = Number(e.date.split('-')[1]);
      const analysis = calculateShadbala(planetsFor(e), true, month);

      // Exactly the seven classical grahas, in the oracle's order.
      expect(analysis.planets.map((r) => r.planet)).toEqual([...R.PLANETS]);

      for (const r of analysis.planets) {
        const parts = {
          sthanaBala: r.sthanaBala,
          digBala: r.digBala,
          kalaBala: r.kalaBala,
          chestaBala: r.chestaBala,
          naisargikaBala: r.naisargikaBala,
          drikBala: r.drikBala,
        } as const;

        for (const [key, value] of Object.entries(parts)) {
          expect(Number.isFinite(value), `${r.planet}.${key} finite`).toBe(true);
          expect(value, `${r.planet}.${key} >= 0`).toBeGreaterThanOrEqual(0);
          expect(value, `${r.planet}.${key} <= ceiling`)
            .toBeLessThanOrEqual(ENGINE_CEILING[key as keyof typeof ENGINE_CEILING] + 1e-9);
        }

        expect(Number.isFinite(r.totalRupas), `${r.planet}.totalRupas finite`).toBe(true);
        expect(r.totalRupas).toBeGreaterThan(0);
        expect(r.requiredRupas).toBe(ENGINE_REQUIRED_RUPAS[r.planet]);
        expect(r.shadabalaRatio).toBeCloseTo(r.totalRupas / r.requiredRupas, 10);
        expect(r.isStrong).toBe(r.shadabalaRatio >= 1);
        expect(r.baseRupas).toBeGreaterThan(0);
        expect(r.modifiedRupas).toBe(r.totalRupas);

        // Naisargika Bala is the one component on the same classical hierarchy as
        // the oracle; the engine rounds to three decimals, so 2 dp is the window.
        expect(r.naisargikaBala * 60, `${r.planet} naisargika in virupas`)
          .toBeCloseTo(R.naisargikaBala(r.planet), 1);
      }

      // Summary agrees with the per-planet ratios.
      const byRatio = [...analysis.planets].sort((a, b) => b.shadabalaRatio - a.shadabalaRatio);
      expect(analysis.strongestPlanet).toBe(byRatio[0].planet);
      expect(analysis.weakestPlanet).toBe(byRatio[byRatio.length - 1].planet);
      expect(analysis.weakestPlanetRupas).toBe(byRatio[byRatio.length - 1].totalRupas);
      expect(analysis.summary.en).toContain(analysis.strongestPlanet);
    });
  }
});

describe('Shadbala engine — divergences from the oracle are pinned, not hidden', () => {
  it("the engine's Sun minimum is 6.5 Rupas; BPHS (the oracle) says 5", () => {
    expect(ENGINE_REQUIRED_RUPAS.Sun).toBe(6.5);
    expect(R.REQUIRED_MIN_RUPAS.Sun).toBe(5);
    expect(ENGINE_REQUIRED_RUPAS.Sun).not.toBe(R.REQUIRED_MIN_RUPAS.Sun);
    // Every other graha agrees, so the Sun is the only required-minimum divergence.
    for (const planet of R.PLANETS.filter((p) => p !== 'Sun')) {
      expect(ENGINE_REQUIRED_RUPAS[planet]).toBe(R.REQUIRED_MIN_RUPAS[planet]);
    }
  });

  it('the engine Sthana cap is far below the BPHS Sthana ceiling — different scales', () => {
    // BPHS: Uchcha 60 + Kendradi 60 + Ojhayugmarasyamsa 15 + Drekkana 15 +
    // Saptavargaja 315 = 465 virupas = 7.75 Rupas.
    const bphsSthanaMaxRupas =
      (R.MAXIMA.uchcha + R.MAXIMA.kendradi + R.MAXIMA.ojhayugmarasyamsa +
        R.MAXIMA.drekkana + R.MAXIMA.saptavargaja) / 60;
    expect(bphsSthanaMaxRupas).toBeCloseTo(7.75, 10);
    expect(ENGINE_CEILING.sthanaBala).toBeLessThan(bphsSthanaMaxRupas);
  });

  it('Dig, Naisargika and Cheshta ceilings do line up with BPHS at 1 Rupa = 60 virupas', () => {
    expect(ENGINE_CEILING.digBala * 60).toBe(R.MAXIMA.dig);
    expect(ENGINE_CEILING.naisargikaBala * 60).toBe(R.MAXIMA.naisargika);
    expect(ENGINE_CEILING.chestaBala * 60).toBe(R.MAXIMA.cheshta);
  });
});
