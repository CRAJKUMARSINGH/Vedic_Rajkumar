/**
 * src/tests/validation/wasmPathAccuracy.test.ts
 *
 * N1 · Satya (Data Truth) — Swiss Ephemeris WASM-path accuracy coverage.
 *
 * The Week-1/2 accuracy suite (accuracySuite.test.ts) validates the *fallback*
 * precision engine (precisionEphemerisService). It does NOT exercise the WASM
 * path (swissEphemerisService.calcPlanetsAccurate / calcHousesAccurate), which is
 * the path actually consumed at runtime by useChartCalculation, dynamicTransit,
 * prashna and randomQuestions services.
 *
 * DEF-003 (double ayanamsa subtraction in the WASM path) slipped past the suite
 * precisely because this path was untested. This file closes that gap with:
 *   - an ayanamsa lock (Lahiri) at known epochs,
 *   - a tropical−sidereal internal-consistency guard (directly catches DEF-003),
 *   - a physics-based Mesha Sankranti anchor,
 *   - Rahu/Ketu exact opposition,
 *   - a 100%-rashi agreement check against all 15 validated reference charts,
 *   - a source flag so callers/tests know the true data origin (WASM vs fallback).
 *
 * Run: npx vitest run src/tests/validation/wasmPathAccuracy.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  initSwissEphemeris,
  isSwissEphReady,
  calcPlanetsAccurate,
  calcHousesAccurate,
} from '../../services/swissEphemerisService';
import { REFERENCE_CHARTS } from './referenceCharts';

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const PLANET_KEYS = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu',
] as const;

/** Shortest angular distance between two longitudes, in degrees (0–180). */
function angularDiff(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return Math.min(d, 360 - d);
}

describe('N1 — WASM-path accuracy (swissEphemerisService)', () => {
  let wasmReady = false;

  beforeAll(async () => {
    wasmReady = await initSwissEphemeris();
  });

  // ── Source flag integrity ──────────────────────────────────────────────────

  describe('Ephemeris source flag', () => {
    it('flags results as "swiss-wasm" when WASM is loaded', async () => {
      const p = await calcPlanetsAccurate('2026-04-14', '06:00');
      expect(p.ephemerisSource).toBeDefined();
      // The flag must tell the truth about which engine actually produced the data.
      expect(p.ephemerisSource).toBe(isSwissEphReady() ? 'swiss-wasm' : 'fallback');
    });

    it('fallback engine self-identifies as "fallback"', async () => {
      const { calculateCompletePlanetaryPositions } = await import('../../services/ephemerisService');
      const p = calculateCompletePlanetaryPositions('2026-04-14', '06:00');
      expect(p.ephemerisSource).toBe('fallback');
    });
  });

  // ── Ayanamsa lock (Lahiri) ─────────────────────────────────────────────────

  describe('Lahiri ayanamsa lock', () => {
    it('J2000.0 (2000-01-01 12:00 UT) ≈ 23.85°', async () => {
      // IST 17:30 == 12:00 UTC on 2000-01-01.
      const p = await calcPlanetsAccurate('2000-01-01', '17:30');
      expect(p.ayanamsa).toBeGreaterThan(23.80);
      expect(p.ayanamsa).toBeLessThan(23.91);
    });

    it('2026 ≈ 24.22°, and advances monotonically with the year', async () => {
      const y2000 = (await calcPlanetsAccurate('2000-01-01', '12:00')).ayanamsa;
      const y2026 = (await calcPlanetsAccurate('2026-04-14', '12:00')).ayanamsa;
      expect(y2026).toBeGreaterThan(24.15);
      expect(y2026).toBeLessThan(24.30);
      expect(y2026).toBeGreaterThan(y2000);
      // Lahiri precesses ~50.29"/yr ≈ 0.01397°/yr → ~0.36° over 26 years.
      expect(y2026 - y2000).toBeGreaterThan(0.30);
      expect(y2026 - y2000).toBeLessThan(0.45);
    });
  });

  // ── Internal consistency: tropical − sidereal = ayanamsa (DEF-003 guard) ────

  describe('tropical − sidereal ≡ ayanamsa (guards DEF-003)', () => {
    for (const ref of [REFERENCE_CHARTS[0], REFERENCE_CHARTS[4], REFERENCE_CHARTS[14]]) {
      it(`${ref.id} — every planet satisfies the identity`, async () => {
        const p = await calcPlanetsAccurate(ref.date, ref.time);
        for (const key of PLANET_KEYS) {
          const pos = p[key];
          // If ayanamsa were subtracted twice, this difference would be ~2× ayanamsa.
          expect(angularDiff(pos.tropical, pos.sidereal)).toBeCloseTo(p.ayanamsa, 1);
        }
      });
    }
  });

  // ── Rashi indexing correctness ─────────────────────────────────────────────

  describe('Rashi indexing', () => {
    it('top-level position: rashi == floor(sidereal/30) and degrees == sidereal%30', async () => {
      const p = await calcPlanetsAccurate('2026-04-14', '12:00');
      for (const key of PLANET_KEYS) {
        const pos = p[key];
        expect(pos.rashi).toBe(Math.floor(pos.sidereal / 30));
        expect(pos.rashiName).toBe(RASHI_NAMES[Math.floor(pos.sidereal / 30)]);
        expect(pos.degrees).toBeCloseTo(pos.sidereal % 30, 6);
      }
    });

    it('runtime planets[] array: rashiIndex agrees with rashiName', async () => {
      // useChartCalculation consumes precise.planets[i].rashiIndex directly.
      const p = await calcPlanetsAccurate('2026-04-14', '12:00');
      expect(p.planets).toHaveLength(9);
      for (const pl of p.planets) {
        expect(pl.rashiIndex).toBe(RASHI_NAMES.indexOf(pl.rashiName));
        expect(pl.rashiIndex).toBeGreaterThanOrEqual(0);
        expect(pl.rashiIndex).toBeLessThan(12);
      }
    });
  });

  // ── Physics anchor: Mesha Sankranti 2026 ───────────────────────────────────

  describe('Mesha Sankranti 2026 (physics anchor)', () => {
    it('Sun is in late Pisces at 06:00 IST and early Aries at 12:00 IST on 14-Apr-2026', async () => {
      const early = await calcPlanetsAccurate('2026-04-14', '06:00');
      const noon = await calcPlanetsAccurate('2026-04-14', '12:00');

      // Before ingress: last degrees of sidereal Pisces.
      expect(early.sun.rashiName).toBe('Pisces');
      expect(early.sun.degrees).toBeGreaterThan(29.0);

      // After ingress: first degrees of sidereal Aries.
      expect(noon.sun.rashiName).toBe('Aries');
      expect(noon.sun.degrees).toBeLessThan(1.0);
    });
  });

  // ── Rahu / Ketu exact opposition ───────────────────────────────────────────

  describe('Rahu–Ketu opposition', () => {
    it('Ketu is exactly 180° from Rahu', async () => {
      const p = await calcPlanetsAccurate('2026-04-14', '12:00');
      expect(angularDiff(p.ketu.sidereal, p.rahu.sidereal)).toBeCloseTo(180, 3);
    });
  });

  // ── WASM vs 15 validated reference charts ──────────────────────────────────

  describe('Agreement with validated reference charts', () => {
    it('all 9 planet rashis match expected for all 15 charts (100%)', async () => {
      const mismatches: string[] = [];
      let total = 0;
      let agree = 0;

      for (const ref of REFERENCE_CHARTS) {
        const p = await calcPlanetsAccurate(ref.date, ref.time);
        for (const key of PLANET_KEYS) {
          const got = RASHI_NAMES[Math.floor(p[key].sidereal / 30)];
          const exp = ref.expected.planets[key];
          total++;
          if (got === exp) agree++;
          else mismatches.push(`${ref.id} ${key}: got ${got}, expected ${exp}`);
        }
      }

      if (mismatches.length > 0) {
        console.error('WASM rashi mismatches vs reference charts:\n' + mismatches.join('\n'));
      }
      expect(agree).toBe(total);
    });
  });

  // ── Houses / ascendant path ────────────────────────────────────────────────

  describe('calcHousesAccurate', () => {
    it('returns a valid ascendant and 12 in-range house cusps', async () => {
      if (!wasmReady) return; // houses path requires WASM; skip if unavailable
      const h = await calcHousesAccurate('2026-04-14', '12:00', 22.72, 75.86);

      expect(h.ascendant).toBeGreaterThanOrEqual(0);
      expect(h.ascendant).toBeLessThan(360);
      expect(h.houses).toHaveLength(12);
      for (const cusp of h.houses) {
        expect(cusp).toBeGreaterThanOrEqual(0);
        expect(cusp).toBeLessThan(360);
      }
      // Equal-house ('E'): the 1st cusp coincides with the ascendant.
      expect(angularDiff(h.houses[0], h.ascendant)).toBeLessThan(0.01);
    });
  });
});
