/**
 * varshaphalService.test.ts — regression for DEF-009 (+ follow-up).
 *
 * The solar-return planetary positions used to be Math.random() placeholders.
 * They must now be real sidereal positions and be fully deterministic.
 * Follow-up: the solar-return *instant* is now solved from the shared Lahiri
 * ephemeris and Muntha is anchored on the real natal ascendant.
 */
import { describe, it, expect } from 'vitest';
import { calculateVarshaphal } from '@/services/varshaphalService';
import { calculateChartForBirth } from '@/services/chartWithTimezone';
import { RASHI_NAMES_EN } from '@/services/precisionEphemerisService';

const BIRTH = new Date('1990-06-15T04:30:00Z');
const LAT = 19.076;
const LON = 72.8777;
const YEAR = 2025;

/** Natal chart for the birth instant, treated as UTC (offset 0) — same as the service. */
function natalChart() {
  return calculateChartForBirth('1990-06-15', '04:30', LAT, LON, 0);
}

describe('varshaphalService — deterministic solar-return positions (DEF-009)', () => {
  it('returns identical positions on repeated calls (no Math.random)', () => {
    const a = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    const b = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    expect(a.planetaryPositions).toEqual(b.planetaryPositions);
  });

  it('places all seven classical planets at real sidereal longitudes', () => {
    const { planetaryPositions } = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    expect(planetaryPositions.map((p) => p.planet)).toEqual([
      'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
    ]);
    for (const p of planetaryPositions) {
      expect(Number.isFinite(p.longitude)).toBe(true);
      expect(p.longitude).toBeGreaterThanOrEqual(0);
      expect(p.longitude).toBeLessThan(360);
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
  });
});

describe('varshaphalService — true solar return (DEF-009 follow-up)', () => {
  it('solves the instant where the Sun returns to its natal sidereal longitude', () => {
    const natalSun = natalChart().planets.find((p) => p.name === 'Sun')!.siderealLongitude;
    const { planetaryPositions } = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    const returnSun = planetaryPositions.find((p) => p.planet === 'Sun')!.longitude;
    expect(Math.abs(returnSun - natalSun)).toBeLessThan(0.02);
  });

  it('returns a solar-return date within a few days of the birthday anniversary', () => {
    const { solarReturnDate } = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    const t = new Date(solarReturnDate).getTime();
    const anniversary = Date.UTC(YEAR, 5, 15, 4, 30); // 15 June of the target year
    const driftDays = Math.abs(t - anniversary) / (24 * 60 * 60 * 1000);
    expect(driftDays).toBeLessThan(3);
  });
});

describe('varshaphalService — Muntha on the real natal ascendant', () => {
  it('starts in the natal Lagna sign at the birth year (age 0)', () => {
    const natalLagna = natalChart().ascendant.rashiName;
    const { muntha } = calculateVarshaphal(BIRTH, LAT, LON, BIRTH.getUTCFullYear());
    expect(muntha.sign).toBe(natalLagna);
  });

  it('advances exactly one sign per completed year', () => {
    const y = BIRTH.getUTCFullYear();
    const a = calculateVarshaphal(BIRTH, LAT, LON, y).muntha.sign;
    const b = calculateVarshaphal(BIRTH, LAT, LON, y + 1).muntha.sign;
    const ai = RASHI_NAMES_EN.indexOf(a);
    const bi = RASHI_NAMES_EN.indexOf(b);
    expect(bi).toBe((ai + 1) % 12);
  });

  it('counts the Muntha house from the annual (solar-return) ascendant', () => {
    const { muntha } = calculateVarshaphal(BIRTH, LAT, LON, YEAR);
    expect(muntha.house).toBeGreaterThanOrEqual(1);
    expect(muntha.house).toBeLessThanOrEqual(12);
  });
});
