/**
 * src/tests/validation/natalCoreN2.test.ts
 *
 * N2 · Kundli (Natal Chart Core) — verification + the two gaps N2 closed:
 *   (A) Dignity on the WASM runtime path was hardcoded 'Neutral' for all nine
 *       planets — it now uses the classical getPlanetDignity() table.
 *   (B) Bhava Chalit (cusp-based house placement) did not exist — a pure
 *       calculation layer was added in houseSystemService.
 * Also asserts the already-present Nakshatra/Pada and Navamsha (D9)/Dashamsha
 * (D10) outputs so N2 has concrete, regression-guarded coverage.
 *
 * Run: npx vitest run src/tests/validation/natalCoreN2.test.ts
 */

import { describe, it, expect } from 'vitest';
import { calcPlanetsAccurate } from '../../services/swissEphemerisService';
import { calculateCompletePlanetaryPositions, getCombustionStatus, COMBUSTION_ORBS } from '../../services/ephemerisService';
import {
  calculateWholeSignHouses,
  calculateEqualHouses,
  getBhavaChalitHouse,
  calculateBhavaChalit,
} from '../../services/houseSystemService';
import type { HouseCusp } from '../../features/kundli/types';
import { getNakshatraInfo } from '../../services/nakshatraService';
import { calculateShodashVarga } from '../../services/divisionalChartsService';
import { buildNatalChart, rashiNameOf } from '../../services/natalChartService';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** Minimal HouseCusp factory for pure unit tests. */
function cusp(house: number, longitude: number): HouseCusp {
  const lon = ((longitude % 360) + 360) % 360;
  const signIdx = Math.floor(lon / 30);
  return { house, longitude: lon, sign: SIGNS[signIdx], lord: 'Sun' };
}

const RAJKUMAR = { date: '1963-09-15', time: '06:00' };

// ─── A. Dignity on the WASM runtime path ──────────────────────────────────────

describe('N2-A — Planet dignity (WASM path)', () => {
  it('computes real dignity instead of the old hardcoded "Neutral"', async () => {
    const p = await calcPlanetsAccurate(RAJKUMAR.date, RAJKUMAR.time);
    const allNeutral = p.planets.every(pl => pl.dignity === 'Neutral');
    expect(allNeutral).toBe(false);
  });

  it('Rajkumar: Sun in Leo → Moolatrikona; Moon in Cancer → Own Sign', async () => {
    const p = await calcPlanetsAccurate(RAJKUMAR.date, RAJKUMAR.time);
    const byName = Object.fromEntries(p.planets.map(pl => [pl.name, pl]));
    expect(byName['Sun'].rashiName).toBe('Leo');
    expect(byName['Sun'].dignity).toBe('Moolatrikona');
    expect(byName['Moon'].rashiName).toBe('Cancer');
    expect(byName['Moon'].dignity).toBe('Own Sign');
  });

  it('applies the classical dignity table correctly (the table the WASM path now uses)', async () => {
    // Sign indices: Aries 0 … Cancer 3 … Leo 4 … Virgo 5 … Libra 6 … Pisces 11.
    const { getPlanetDignity } = await import('../../services/ephemerisService');
    expect(getPlanetDignity('Jupiter', 3)).toBe('Exalted');       // Jupiter exalted in Cancer
    expect(getPlanetDignity('Saturn', 0)).toBe('Debilitated');    // Saturn debilitated in Aries
    expect(getPlanetDignity('Mars', 0)).toBe('Moolatrikona');     // Mars owns Aries (MT sign)
    expect(getPlanetDignity('Venus', 2)).toBe('Friend Sign');     // Venus friend in Gemini
    expect(getPlanetDignity('Mercury', 2)).toBe('Own Sign');      // Mercury owns Gemini (MT = Virgo)
  });

  it('WASM and fallback engines agree on dignity for the same chart', async () => {
    const wasm = await calcPlanetsAccurate(RAJKUMAR.date, RAJKUMAR.time);
    const fallback = calculateCompletePlanetaryPositions(RAJKUMAR.date, RAJKUMAR.time);
    const fbByName = Object.fromEntries(fallback.planets.map(pl => [pl.name, pl]));
    for (const pl of wasm.planets) {
      expect(pl.dignity).toBe(fbByName[pl.name].dignity);
    }
  });
});

// ─── B. Bhava Chalit (pure calculation) ───────────────────────────────────────

describe('N2-B — Bhava Chalit placement', () => {
  it('whole-sign cusps from Aries Lagna place planets by sign', () => {
    const cusps = calculateWholeSignHouses(0, 0); // Lagna 0° Aries
    expect(getBhavaChalitHouse(5, cusps)).toBe(1);    // 5° Aries
    expect(getBhavaChalitHouse(35, cusps)).toBe(2);   // 5° Taurus
    expect(getBhavaChalitHouse(355, cusps)).toBe(12); // 25° Pisces
  });

  it('equal-house cusps shift a near-boundary planet into a neighbouring house (chalit ≠ rashi)', () => {
    const cusps = calculateEqualHouses(15, 0); // Lagna 15° Aries → cusp1 = 15°
    // 5° Aries is rashi-house 1, but in the chalit chart it falls in house 12.
    expect(getBhavaChalitHouse(5, cusps)).toBe(12);
    // 20° Aries sits inside cusp1 (15°–45°).
    expect(getBhavaChalitHouse(20, cusps)).toBe(1);
    // 44° (14° Taurus) is still inside house 1 in chalit; rashi would be house 2.
    expect(getBhavaChalitHouse(44, cusps)).toBe(1);
  });

  it('calculateBhavaChalit maps an array in order and always yields 1–12', () => {
    const cusps = calculateWholeSignHouses(200, 0); // Lagna 20° Libra
    const houses = calculateBhavaChalit([0, 45, 90, 359], cusps);
    expect(houses).toHaveLength(4);
    for (const h of houses) {
      expect(h).toBeGreaterThanOrEqual(1);
      expect(h).toBeLessThanOrEqual(12);
    }
  });

  it('rejects a malformed cusp set', () => {
    expect(() => getBhavaChalitHouse(10, [cusp(1, 0), cusp(2, 30)])).toThrow();
  });
});

// ─── C. Nakshatra / Pada and Navamsha / Dashamsha present ─────────────────────

describe('N2-C — Nakshatra/Pada and D9/D10 coverage', () => {
  it('Moon nakshatra is resolved with a valid pada (1–4)', async () => {
    const p = await calcPlanetsAccurate(RAJKUMAR.date, RAJKUMAR.time);
    const moonLon = p.moon.sidereal;
    const nak = getNakshatraInfo(RAJKUMAR.date, RAJKUMAR.time, moonLon);
    expect(nak.nakshatra).toBeGreaterThanOrEqual(1);
    expect(nak.nakshatra).toBeLessThanOrEqual(27);
    expect(nak.pada).toBeGreaterThanOrEqual(1);
    expect(nak.pada).toBeLessThanOrEqual(4);
    expect(nak.nameEn.length).toBeGreaterThan(0);
  });

  it('Shodash Varga includes Navamsha (D9) and Dashamsha (D10)', async () => {
    const p = await calcPlanetsAccurate(RAJKUMAR.date, RAJKUMAR.time);
    const longitudes = Object.fromEntries(
      p.planets.map(pl => [pl.name, pl.rashiIndex * 30 + pl.degrees]),
    );
    const ascLon = p.moon.sidereal; // ascendant not needed for the D9/D10 presence check
    const varga = calculateShodashVarga(longitudes, ascLon);
    const names = varga.charts.map(c => c.name);
    expect(names.some(n => n.includes('D9'))).toBe(true);
    expect(names.some(n => n.includes('D10'))).toBe(true);
  });
});

// ─── D. Combustion (classical Parashari orbs) ─────────────────────────────────

describe('N2-D — Combustion flags', () => {
  it('the Sun and the lunar nodes can never be combust', () => {
    expect(getCombustionStatus('Sun', 10, 10).isCombust).toBe(false);
    expect(getCombustionStatus('Rahu', 10, 10).orb).toBe(0);
    expect(getCombustionStatus('Ketu', 10, 10).isCombust).toBe(false);
  });

  it('flags a planet inside its orb and clears it beyond the orb (Venus orb 10°)', () => {
    expect(getCombustionStatus('Venus', 5, 0).isCombust).toBe(true);   // 5° < 10°
    expect(getCombustionStatus('Venus', 15, 0).isCombust).toBe(false); // 15° > 10°
  });

  it('uses the shortest circular arc across the 0°/360° wrap', () => {
    // Planet at 2°, Sun at 358° → 4° elongation (not 356°).
    const s = getCombustionStatus('Venus', 2, 358);
    expect(s.sunDistance).toBeCloseTo(4, 6);
    expect(s.isCombust).toBe(true);
  });

  it('exposes the classical orbs and a valid distance for every orb-bearing body', () => {
    expect(COMBUSTION_ORBS.Mars).toBeGreaterThan(COMBUSTION_ORBS.Venus);
    for (const name of Object.keys(COMBUSTION_ORBS)) {
      const s = getCombustionStatus(name, 100, 90);
      expect(s.sunDistance).toBeGreaterThanOrEqual(0);
      expect(s.sunDistance).toBeLessThanOrEqual(180);
    }
  });
});

// ─── E. Unified typed NatalChart façade ───────────────────────────────────────

describe('N2-E — buildNatalChart façade', () => {
  const INPUT = { date: '1963-09-15', time: '06:00', latitude: 28.61, longitude: 77.21, timezoneOffsetHours: 5.5 };

  it('exposes Lagna, all nine planets and the twelve bhavas', () => {
    const chart = buildNatalChart(INPUT);
    expect(chart.planets).toHaveLength(9);
    expect(chart.houses).toHaveLength(12);
    expect(chart.houses.map(h => h.house)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(chart.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.rashiIndex).toBeLessThanOrEqual(11);
    expect(chart.moonRashiIndex).toBeGreaterThanOrEqual(0);
  });

  it('fills rashi, nakshatra/pada, dignity, retrograde, combustion and chalit for every planet', () => {
    const chart = buildNatalChart(INPUT);
    for (const p of chart.planets) {
      expect(p.rashiName).toBe(rashiNameOf(p.rashiIndex));
      expect(p.nakshatraIndex).toBeGreaterThanOrEqual(1);
      expect(p.nakshatraIndex).toBeLessThanOrEqual(27);
      expect(p.pada).toBeGreaterThanOrEqual(1);
      expect(p.pada).toBeLessThanOrEqual(4);
      expect(p.dignity.length).toBeGreaterThan(0);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
      expect(p.bhavaChalitHouse).toBeGreaterThanOrEqual(1);
      expect(p.bhavaChalitHouse).toBeLessThanOrEqual(12);
      expect(p.navamshaRashiIndex).toBeGreaterThanOrEqual(0);
      expect(p.navamshaRashiIndex).toBeLessThanOrEqual(11);
      expect(p.dashamshaRashiIndex).toBeGreaterThanOrEqual(0);
      expect(p.dashamshaRashiIndex).toBeLessThanOrEqual(11);
    }
    // Degrees within a sign are always [0, 30)
    for (const p of chart.planets) {
      expect(p.degrees).toBeGreaterThanOrEqual(0);
      expect(p.degrees).toBeLessThan(30);
    }
  });

  it('keeps whole-sign house counted from the Lagna degree and chalit bhava consistent', () => {
    const chart = buildNatalChart(INPUT);
    // Whole-sign house = the 30° arc counted from the Lagna's exact degree.
    for (const p of chart.planets) {
      const expected = Math.floor(((p.siderealLongitude - chart.ascendant.siderealLongitude + 360) % 360) / 30) + 1;
      expect(p.house).toBe(expected);
    }
    // Chalit house = equal-bhava placement from the same Lagna degree.
    const cusps = calculateEqualHouses(chart.ascendant.siderealLongitude, chart.ayanamsa);
    expect(getBhavaChalitHouse(chart.ascendant.siderealLongitude, cusps)).toBe(1);
    for (const p of chart.planets) {
      expect(p.bhavaChalitHouse).toBe(getBhavaChalitHouse(p.siderealLongitude, cusps));
    }
  });

  it('is deterministic and marks the Sun and nodes as never combust', () => {
    const a = buildNatalChart(INPUT);
    const b = buildNatalChart(INPUT);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    const byName = Object.fromEntries(a.planets.map(p => [p.name, p]));
    expect(byName['Sun'].isCombust).toBe(false);
    expect(byName['Rahu'].isCombust).toBe(false);
    expect(byName['Ketu'].isCombust).toBe(false);
  });
});
