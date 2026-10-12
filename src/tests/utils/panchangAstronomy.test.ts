/**
 * panchangAstronomy.test.ts
 *
 * Vitest tests for the NOAA solar and simplified Meeus lunar calculators.
 * Tolerances: ±5 minutes for sunrise/sunset/solarNoon timing.
 */

import { describe, it, expect } from 'vitest';
import {
  getTimezoneOffsetMinutes,
  localTodayISO,
  calculateSunriseSunset,
} from '../../utils/panchangAstronomy';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a UTC Date to local clock HH:MM by adding tzOffsetMinutes. */
function toLocalHHMM(date: Date, tzOffsetMinutes: number): { h: number; m: number } {
  const localMs = date.getTime() + tzOffsetMinutes * 60000;
  const totalMinutes = Math.floor(localMs / 60000);
  const minutesOfDay = ((totalMinutes % 1440) + 1440) % 1440;
  return { h: Math.floor(minutesOfDay / 60), m: minutesOfDay % 60 };
}

/** Returns total minutes since midnight for a { h, m } object. */
function toMinutes(hm: { h: number; m: number }): number {
  return hm.h * 60 + hm.m;
}

const TOLERANCE = 5; // ±5 minutes

function expectTimeNear(
  utcDate: Date | null,
  tzOffsetMinutes: number,
  expectedH: number,
  expectedM: number,
  label: string
): void {
  expect(utcDate, `${label} should not be null`).not.toBeNull();
  if (!utcDate) return;

  const actual = toMinutes(toLocalHHMM(utcDate, tzOffsetMinutes));
  const expected = expectedH * 60 + expectedM;

  const diff = Math.abs(actual - expected);
  // Handle wrap-around midnight
  const wrappedDiff = Math.min(diff, 1440 - diff);

  expect(wrappedDiff, `${label}: actual ${Math.floor(actual / 60)}:${String(actual % 60).padStart(2, '0')} vs expected ${expectedH}:${String(expectedM).padStart(2, '0')} (diff ${wrappedDiff} min)`).toBeLessThanOrEqual(TOLERANCE);
}

// ── Timezone offset tests ─────────────────────────────────────────────────────

describe('getTimezoneOffsetMinutes', () => {
  it('Asia/Kolkata is always +330', () => {
    expect(getTimezoneOffsetMinutes('2024-08-15', 'Asia/Kolkata')).toBe(330);
  });

  it('America/New_York in summer (EDT) is -240', () => {
    expect(getTimezoneOffsetMinutes('2024-08-15', 'America/New_York')).toBe(-240);
  });

  it('America/New_York in winter (EST) is -300', () => {
    expect(getTimezoneOffsetMinutes('2024-12-25', 'America/New_York')).toBe(-300);
  });
});

// ── localTodayISO tests ───────────────────────────────────────────────────────

describe('localTodayISO', () => {
  it('returns a valid YYYY-MM-DD string', () => {
    const result = localTodayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the device local calendar date', () => {
    const now = new Date();
    const expected = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    expect(localTodayISO()).toBe(expected);
  });
});

// ── Sunrise/Sunset tests ──────────────────────────────────────────────────────

describe('calculateSunriseSunset — New Delhi (IST +330)', () => {
  const IST = 330;
  const LAT = 28.61;
  const LON = 77.23;

  // Reference times verified against sunrise-sunset.org for New Delhi:
  // Aug 15 2024: sunrise 05:50 IST, sunset 19:00 IST
  // Dec 25 2024: sunrise 07:11 IST
  it('2024-08-15: sunrise ≈ 05:50 IST', () => {
    const result = calculateSunriseSunset('2024-08-15', LAT, LON, IST);
    expect(result.noRiseSet).toBeFalsy();
    expectTimeNear(result.sunrise, IST, 5, 50, 'Delhi Aug sunrise');
  });

  it('2024-08-15: sunset ≈ 19:00 IST', () => {
    const result = calculateSunriseSunset('2024-08-15', LAT, LON, IST);
    expectTimeNear(result.sunset, IST, 19, 0, 'Delhi Aug sunset');
  });

  it('2024-12-25: sunrise ≈ 07:11 IST', () => {
    const result = calculateSunriseSunset('2024-12-25', LAT, LON, IST);
    expect(result.noRiseSet).toBeFalsy();
    expectTimeNear(result.sunrise, IST, 7, 11, 'Delhi Dec sunrise');
  });
});

describe('calculateSunriseSunset — Sydney (AEST +600)', () => {
  const AEST = 600;
  const LAT = -33.87;
  const LON = 151.21;

  // Reference times verified against sunrise-sunset.org for Sydney:
  // Jun 21 2024: sunrise 07:00 AEST, sunset 16:54 AEST
  it('2024-06-21: sunrise ≈ 07:00 AEST', () => {
    const result = calculateSunriseSunset('2024-06-21', LAT, LON, AEST);
    expect(result.noRiseSet).toBeFalsy();
    expectTimeNear(result.sunrise, AEST, 7, 0, 'Sydney Jun sunrise');
  });

  it('2024-06-21: sunset ≈ 16:54 AEST', () => {
    const result = calculateSunriseSunset('2024-06-21', LAT, LON, AEST);
    expectTimeNear(result.sunset, AEST, 16, 54, 'Sydney Jun sunset');
  });
});

describe('calculateSunriseSunset — Polar edge case (Svalbard, summer)', () => {
  it('2024-06-21 at 78°N returns noRiseSet: true (polar day)', () => {
    const result = calculateSunriseSunset('2024-06-21', 78.0, 15.0, 120);
    expect(result.sunrise).toBeNull();
    expect(result.sunset).toBeNull();
    expect(result.noRiseSet).toBe(true);
  });
});
