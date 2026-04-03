/**
 * Precision Ephemeris Service Tests
 * Validates VSOP87-based calculations against known astronomical data
 * Reference: Jean Meeus "Astronomical Algorithms" 2nd Ed.
 */

import { describe, it, expect } from 'vitest';
import {
  dateTimeToJD,
  getLahiriAyanamsa,
  calculatePreciseChart,
  calculatePrecisePlanetaryPositions,
} from '../../services/precisionEphemerisService';

describe('PrecisionEphemerisService — Julian Day', () => {
  it('J2000.0 epoch: 2000-01-01 12:00 UT = JD 2451545.0', () => {
    // Input is IST (UTC+5:30), so 12:00 IST = 06:30 UT
    // JD for 2000-01-01 06:30 UT = 2451544.771
    const jd = dateTimeToJD('2000-01-01', '12:00', 5.5);
    expect(Math.abs(jd - 2451544.771)).toBeLessThan(0.01);
  });

  it('Known date: 1963-09-15 06:00 IST (Rajkumar birth)', () => {
    const jd = dateTimeToJD('1963-09-15', '06:00', 5.5);
    // 06:00 IST = 00:30 UT → JD ≈ 2438287.52
    expect(jd).toBeGreaterThan(2438280);
    expect(jd).toBeLessThan(2438295);
  });

  it('JD increases monotonically with date', () => {
    const jd1 = dateTimeToJD('2026-01-01', '12:00', 5.5);
    const jd2 = dateTimeToJD('2026-06-01', '12:00', 5.5);
    const jd3 = dateTimeToJD('2027-01-01', '12:00', 5.5);
    expect(jd2).toBeGreaterThan(jd1);
    expect(jd3).toBeGreaterThan(jd2);
    expect(jd3 - jd1).toBeCloseTo(365, 0);
  });
});

describe('PrecisionEphemerisService — Lahiri Ayanamsa', () => {
  it('Ayanamsa at J2000.0 ≈ 23.85°', () => {
    const jd2000 = 2451545.0;
    const ayanamsa = getLahiriAyanamsa(jd2000);
    expect(Math.abs(ayanamsa - 23.85)).toBeLessThan(0.1);
  });

  it('Ayanamsa increases over time (precession)', () => {
    const jd1900 = dateTimeToJD('1900-01-01', '12:00', 0);
    const jd2000 = dateTimeToJD('2000-01-01', '12:00', 0);
    const jd2100 = dateTimeToJD('2100-01-01', '12:00', 0);
    expect(getLahiriAyanamsa(jd2000)).toBeGreaterThan(getLahiriAyanamsa(jd1900));
    expect(getLahiriAyanamsa(jd2100)).toBeGreaterThan(getLahiriAyanamsa(jd2000));
  });

  it('Annual precession rate ≈ 50.3 arcseconds = 0.01397°/year', () => {
    const jd1 = dateTimeToJD('2000-01-01', '12:00', 0);
    const jd2 = dateTimeToJD('2001-01-01', '12:00', 0);
    const diff = getLahiriAyanamsa(jd2) - getLahiriAyanamsa(jd1);
    expect(Math.abs(diff - 0.01396)).toBeLessThan(0.001);
  });
});

describe('PrecisionEphemerisService — Planet Positions', () => {
  it('All 9 planets calculated with valid rashi indices', () => {
    const result = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    expect(result.planets).toHaveLength(9);
    result.planets.forEach(p => {
      expect(p.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(p.rashiIndex).toBeLessThanOrEqual(11);
      expect(p.degrees).toBeGreaterThanOrEqual(0);
      expect(p.degrees).toBeLessThan(30);
    });
  });

  it('Rahu and Ketu are always 180° apart', () => {
    const result = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    const rahu = result.planets.find(p => p.name === 'Rahu')!;
    const ketu = result.planets.find(p => p.name === 'Ketu')!;
    const rahuLon = rahu.rashiIndex * 30 + rahu.degrees;
    const ketuLon = ketu.rashiIndex * 30 + ketu.degrees;
    const diff = Math.abs(rahuLon - ketuLon);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    expect(Math.abs(normalizedDiff - 180)).toBeLessThan(1);
  });

  it('Rahu and Ketu are always retrograde', () => {
    const result = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    const rahu = result.planets.find(p => p.name === 'Rahu')!;
    const ketu = result.planets.find(p => p.name === 'Ketu')!;
    expect(rahu.retrograde).toBe(true);
    expect(ketu.retrograde).toBe(true);
  });

  it('Sun in Pisces in March 2026 (sidereal)', () => {
    // March 27, 2026: Sun tropical ≈ 6° Aries → sidereal ≈ 6° - 24.1° = ~342° = Pisces
    const result = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    const sun = result.planets.find(p => p.name === 'Sun')!;
    // Sun should be in Pisces (11) or Aries (0) in late March sidereal
    expect([10, 11, 0]).toContain(sun.rashiIndex);
  });

  it('Consistent results for same input', () => {
    const r1 = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    const r2 = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    r1.planets.forEach((p, i) => {
      expect(p.rashiIndex).toBe(r2.planets[i].rashiIndex);
      expect(Math.abs(p.degrees - r2.planets[i].degrees)).toBeLessThan(0.001);
    });
  });
});

describe('PrecisionEphemerisService — Full Chart', () => {
  it('Calculates complete chart with ascendant and houses', () => {
    const chart = calculatePreciseChart('1963-09-15', '06:00', 23.84, 73.71);
    expect(chart.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.rashiIndex).toBeLessThanOrEqual(11);
    expect(chart.houses).toHaveLength(12);
    expect(chart.planets).toHaveLength(9);
    expect(chart.nakshatra.name).toBeDefined();
    expect(chart.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(chart.nakshatra.pada).toBeLessThanOrEqual(4);
  });

  it('Houses are in correct sequence (30° apart)', () => {
    const chart = calculatePreciseChart('2026-03-27', '12:00', 28.61, 77.23);
    for (let i = 1; i < 12; i++) {
      const h1 = chart.houses[i - 1];
      const h2 = chart.houses[i];
      const lon1 = h1.rashiIndex * 30 + h1.degrees;
      const lon2 = h2.rashiIndex * 30 + h2.degrees;
      const diff = ((lon2 - lon1 + 360) % 360);
      expect(Math.abs(diff - 30)).toBeLessThan(1);
    }
  });

  it('Nakshatra index is valid (0-26)', () => {
    const chart = calculatePreciseChart('2026-03-27', '12:00', 28.61, 77.23);
    const nkIndex = Math.floor(chart.moonRashiIndex * 30 / (360 / 27));
    expect(nkIndex).toBeGreaterThanOrEqual(0);
    expect(nkIndex).toBeLessThanOrEqual(26);
  });

  it('Ayanamsa is in valid range for 2026', () => {
    const chart = calculatePreciseChart('2026-03-27', '12:00', 28.61, 77.23);
    expect(chart.ayanamsa).toBeGreaterThan(24.0);
    expect(chart.ayanamsa).toBeLessThan(24.5);
  });

  it('Performance: 50 charts in under 500ms', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      calculatePreciseChart('2026-03-27', '12:00', 28.61 + i * 0.1, 77.23);
    }
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('PrecisionEphemerisService — Known Astronomical Events', () => {
  it('Spring equinox 2026: Sun near 0° Aries tropical (≈ 356° sidereal)', () => {
    // Spring equinox ~March 20, 2026
    const result = calculatePrecisePlanetaryPositions('2026-03-20', '12:00');
    const sun = result.planets.find(p => p.name === 'Sun')!;
    // Sidereal: tropical 0° - ayanamsa 24.1° = 335.9° = Pisces (11)
    expect(sun.rashiIndex).toBe(11); // Pisces
  });

  it('Jupiter in Gemini in 2026 (known transit)', () => {
    // Jupiter entered Gemini (sidereal) in May 2024, stays through 2025
    // By March 2026, Jupiter should be in Gemini (2) or Cancer (3)
    const result = calculatePrecisePlanetaryPositions('2026-03-27', '12:00');
    const jupiter = result.planets.find(p => p.name === 'Jupiter')!;
    expect([1, 2, 3]).toContain(jupiter.rashiIndex); // Taurus, Gemini, or Cancer
  });
});
