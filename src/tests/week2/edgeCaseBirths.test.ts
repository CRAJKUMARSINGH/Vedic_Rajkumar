/**
 * Week 2: Edge-Case Birth Scenario Tests (R6)
 *
 * Validates that the precision engine handles:
 *  - Southern hemisphere births (negative latitude)
 *  - Historical births (1863 CE — Vivekananda)
 *  - Midnight birth (00:00 local time)
 *  - Late-night birth (23:59 local time)
 *  - UTC offset edge cases (±0, ±12, ±5.5)
 */

import { describe, it, expect } from 'vitest';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { calculateChart } from '@/features/kundli/engine';
import type { BirthData } from '@/features/kundli/types';

// ─── Southern hemisphere ──────────────────────────────────────────────────────

describe('Edge case: Southern hemisphere birth', () => {
  const lat = -33.87;  // Sydney, Australia
  const lon = 151.21;

  it('engine does not throw for southern hemisphere', () => {
    expect(() => calculatePreciseChart('1985-06-15', '12:00', lat, lon, 10.0)).not.toThrow();
  });

  it('ascendant rashi is valid (0–11)', () => {
    const chart = calculatePreciseChart('1985-06-15', '12:00', lat, lon, 10.0);
    expect(chart.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.rashiIndex).toBeLessThanOrEqual(11);
  });

  it('Moon nakshatra is a valid Nakshatra string', () => {
    const chart = calculatePreciseChart('1985-06-15', '12:00', lat, lon, 10.0);
    expect(chart.nakshatra.name).toBeTruthy();
    expect(typeof chart.nakshatra.name).toBe('string');
  });

  it('all 9 planets are returned', () => {
    const chart = calculatePreciseChart('1985-06-15', '12:00', lat, lon, 10.0);
    expect(chart.planets).toHaveLength(9);
  });

  it('kundli engine also works for southern hemisphere', () => {
    const bd: BirthData = {
      name: 'Test', date: '1985-06-15', time: '12:00',
      timezone: 'Australia/Sydney', latitude: lat, longitude: lon, place: 'Sydney',
    };
    expect(() => calculateChart(bd)).not.toThrow();
  });
});

// ─── Historical birth (1863 CE — Vivekananda) ────────────────────────────────

describe('Edge case: Historical birth (Swami Vivekananda, 1863)', () => {
  // 1863-01-12, 06:12 IST, Kolkata (22.57°N, 88.36°E)
  const chart = calculatePreciseChart('1863-01-12', '06:12', 22.57, 88.36, 5.5);

  it('engine does not throw for 1863 CE birth', () => {
    expect(() => calculatePreciseChart('1863-01-12', '06:12', 22.57, 88.36, 5.5)).not.toThrow();
  });

  it('ayanamsa is approximately 21.94° for 1863 CE', () => {
    expect(chart.ayanamsa).toBeGreaterThan(21.5);
    expect(chart.ayanamsa).toBeLessThan(22.5);
  });

  it('all planet rashis are valid (0–11)', () => {
    for (const p of chart.planets) {
      expect(p.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(p.rashiIndex).toBeLessThanOrEqual(11);
    }
  });

  it('Moon nakshatra lord is a valid planet name', () => {
    const validLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    expect(validLords).toContain(chart.nakshatra.lord);
  });
});

// ─── Midnight birth ───────────────────────────────────────────────────────────

describe('Edge case: Midnight birth (00:00 IST)', () => {
  it('engine does not throw for 00:00 birth time', () => {
    expect(() => calculatePreciseChart('2000-01-01', '00:00', 22.72, 75.86, 5.5)).not.toThrow();
  });

  it('Julian Day is computed correctly at midnight IST', () => {
    const chart = calculatePreciseChart('2000-01-01', '00:00', 22.72, 75.86, 5.5);
    // JD for 1999-12-31 18:30 UTC = ~2451545.27
    expect(chart.julianDay).toBeGreaterThan(2451544);
    expect(chart.julianDay).toBeLessThan(2451546);
  });

  it('ascendant rashi is valid', () => {
    const chart = calculatePreciseChart('2000-01-01', '00:00', 22.72, 75.86, 5.5);
    expect(chart.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.rashiIndex).toBeLessThanOrEqual(11);
  });
});

// ─── Late-night birth (23:59) ─────────────────────────────────────────────────

describe('Edge case: Late-night birth (23:59 IST)', () => {
  it('engine does not throw for 23:59 birth time', () => {
    expect(() => calculatePreciseChart('1990-06-15', '23:59', 22.72, 75.86, 5.5)).not.toThrow();
  });

  it('Julian Day is correctly after 18:29 UTC (midnight IST = 18:30 UTC)', () => {
    const chart = calculatePreciseChart('1990-06-15', '23:59', 22.72, 75.86, 5.5);
    const chartMidnight = calculatePreciseChart('1990-06-16', '00:00', 22.72, 75.86, 5.5);
    // 23:59 IST should be just before midnight — JD slightly less than midnight
    expect(chart.julianDay).toBeLessThan(chartMidnight.julianDay);
  });

  it('all 9 planets computed correctly', () => {
    const chart = calculatePreciseChart('1990-06-15', '23:59', 22.72, 75.86, 5.5);
    expect(chart.planets).toHaveLength(9);
  });
});

// ─── UTC offset edge cases ────────────────────────────────────────────────────

describe('Edge case: UTC offset variations', () => {
  it('UTC+0 (UK birth) computes without error', () => {
    expect(() => calculatePreciseChart('1900-03-14', '11:30', 51.5, -0.12, 0.0)).not.toThrow();
  });

  it('UTC-5 (US Eastern birth) computes without error', () => {
    expect(() => calculatePreciseChart('1985-07-04', '09:00', 40.71, -74.0, -5.0)).not.toThrow();
  });

  it('UTC+12 (New Zealand birth) computes without error', () => {
    expect(() => calculatePreciseChart('2000-01-01', '12:00', -36.86, 174.77, 12.0)).not.toThrow();
  });

  it('same UTC moment gives same planet positions regardless of offset', () => {
    // 12:00 UTC+0 at 0°, 0° = 17:30 UTC+5.5 at 0°, 0°
    const chartUTC0 = calculatePreciseChart('2000-06-15', '12:00', 0, 0, 0);
    const chartIST  = calculatePreciseChart('2000-06-15', '17:30', 0, 0, 5.5);
    // Sun should be at the same longitude (same Julian Day)
    const sunDiff = Math.abs(
      chartUTC0.planets.find(p => p.name === 'Sun')!.siderealLongitude -
      chartIST.planets.find(p => p.name === 'Sun')!.siderealLongitude
    );
    expect(sunDiff).toBeLessThan(0.01);
  });
});

// ─── Equatorial birth (0° latitude) ──────────────────────────────────────────

describe('Edge case: Equatorial birth (0° latitude)', () => {
  it('engine does not throw at equator', () => {
    expect(() => calculatePreciseChart('2000-06-15', '12:00', 0, 0, 0)).not.toThrow();
  });

  it('ascendant rashi valid at equator', () => {
    const chart = calculatePreciseChart('2000-06-15', '12:00', 0, 0, 0);
    expect(chart.ascendant.rashiIndex).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.rashiIndex).toBeLessThanOrEqual(11);
  });
});

// ─── Rahu/Ketu always retrograde ─────────────────────────────────────────────

describe('Engine invariants: Rahu and Ketu', () => {
  it('Rahu is always retrograde', () => {
    const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
    const rahu = chart.planets.find(p => p.name === 'Rahu')!;
    expect(rahu.isRetrograde).toBe(true);
  });

  it('Ketu is always retrograde', () => {
    const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
    const ketu = chart.planets.find(p => p.name === 'Ketu')!;
    expect(ketu.isRetrograde).toBe(true);
  });

  it('Rahu + Ketu longitudinal difference is ~180°', () => {
    const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
    const rahu = chart.planets.find(p => p.name === 'Rahu')!;
    const ketu = chart.planets.find(p => p.name === 'Ketu')!;
    const diff = Math.abs(
      ((rahu.siderealLongitude - ketu.siderealLongitude + 360) % 360) - 180
    );
    expect(diff).toBeLessThan(1.0);
  });
});
