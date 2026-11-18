/**
 * ACC-08 — Panchanga five-limb acceptance gate.
 *
 * This is a regression/acceptance suite (not a feature) that locks the five
 * Panchanga limbs — Vara, Tithi, Nakshatra, Yoga, Karana — plus sunrise /
 * day-boundary, location and timezone conventions.
 *
 * Transition points are covered EXPLICITLY so a value cannot silently roll into
 * the adjacent day or limb: every boundary test probes the exact edge and one
 * step either side.
 *
 * Determinism: limb functions are driven with pure numeric inputs; astronomical
 * functions are driven with fixed dated inputs. No network access.
 *
 * Where the current implementation differs from a classical expectation the
 * CURRENT behaviour is asserted, with an inline comment naming the observation.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateTithi,
  calculateNakshatra,
  calculateYoga,
  calculateKarana,
  getVarDetails,
  calculatePanchangForDate,
} from '@/services/panchangService';
import { calculateSunriseSunset } from '@/utils/panchangAstronomy';

// Exact degrees-per-limb constants used by panchangService (mirrored here so the
// boundary intent is visible at the assertion site).
const NAK_SPAN = 13.333333333; // one nakshatra / one yoga
const PADA_SPAN = 3.333333333; // one pada (quarter nakshatra)

// ── 1. Vara (weekday) ─────────────────────────────────────────────────────────
describe('ACC-08 · Vara — weekday index and name', () => {
  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  it('2024-01-07 is a Sunday with index 0', () => {
    // Local-date constructor: independent of the host timezone (unlike new Date('YYYY-MM-DD')).
    const vara = getVarDetails(new Date(2024, 0, 7));
    expect(vara.number).toBe(0);
    expect(vara.day).toBe('Sunday');
  });

  it('covers the full Sunday→Saturday week without wraparound drift', () => {
    for (let i = 0; i < 7; i++) {
      const vara = getVarDetails(new Date(2024, 0, 7 + i));
      expect(vara.number).toBe(i);
      expect(vara.day).toBe(DAY_NAMES[i]);
    }
  });

  it('wraps Saturday (6) back to Sunday (0) across the week boundary', () => {
    const saturday = getVarDetails(new Date(2024, 0, 13));
    const sunday = getVarDetails(new Date(2024, 0, 14));
    expect(saturday.number).toBe(6);
    expect(saturday.day).toBe('Saturday');
    expect(sunday.number).toBe(0);
    expect(sunday.day).toBe('Sunday');
  });
});

// ── 2. Tithi ──────────────────────────────────────────────────────────────────
describe('ACC-08 · Tithi — paksha boundary and 1..30 range', () => {
  it('diff exactly 180° crosses into Krishna paksha (number 16, Pratipada)', () => {
    const tithi = calculateTithi(180, 0);
    expect(tithi.number).toBe(16);
    expect(tithi.paksha).toBe('Krishna');
    expect(tithi.name).toBe('Pratipada');
  });

  it('diff just below 180° stays in Shukla paksha (number 15, Purnima)', () => {
    const tithi = calculateTithi(179.999, 0);
    expect(tithi.number).toBe(15);
    expect(tithi.paksha).toBe('Shukla');
    expect(tithi.name).toBe('Purnima');
  });

  it('diff just above 180° remains Krishna (number 16)', () => {
    const tithi = calculateTithi(180.001, 0);
    expect(tithi.number).toBe(16);
    expect(tithi.paksha).toBe('Krishna');
  });

  it('diff just below 360° stays in Krishna paksha (number 30, Amavasya)', () => {
    const tithi = calculateTithi(359.999, 0);
    expect(tithi.number).toBe(30);
    expect(tithi.paksha).toBe('Krishna');
    expect(tithi.name).toBe('Amavasya');
  });

  it('probes stay within 1..30 with paksha consistent with the number', () => {
    const diffs = [0, 5.999, 6, 12, 90, 174, 179.999, 180, 180.001, 354, 359.9, 359.999];
    for (const diff of diffs) {
      const tithi = calculateTithi(diff, 0);
      expect(tithi.number).toBeGreaterThanOrEqual(1);
      expect(tithi.number).toBeLessThanOrEqual(30);
      expect(tithi.paksha).toBe(tithi.number <= 15 ? 'Shukla' : 'Krishna');
      expect(typeof tithi.name).toBe('string');
    }
  });
});

// ── 3. Nakshatra ──────────────────────────────────────────────────────────────
describe('ACC-08 · Nakshatra — number, pada transitions and range', () => {
  it('flips number exactly at the 13°20′ edge (Ashwini → Bharani)', () => {
    expect(calculateNakshatra(0).number).toBe(1);
    expect(calculateNakshatra(0).name).toBe('Ashwini');
    expect(calculateNakshatra(NAK_SPAN).number).toBe(2);
    expect(calculateNakshatra(NAK_SPAN).name).toBe('Bharani');
    // One step below the edge must remain in the previous nakshatra.
    expect(calculateNakshatra(NAK_SPAN - 0.001).number).toBe(1);
  });

  it('flips pada exactly at the 3°20′ steps within a nakshatra', () => {
    expect(calculateNakshatra(0).pada).toBe(1);
    expect(calculateNakshatra(PADA_SPAN).pada).toBe(2);
    expect(calculateNakshatra(2 * PADA_SPAN).pada).toBe(3);
    expect(calculateNakshatra(3 * PADA_SPAN).pada).toBe(4);
    // One step below the first pada edge stays in pada 1.
    expect(calculateNakshatra(PADA_SPAN - 0.001).pada).toBe(1);
  });

  it('keeps number within 1..27 across a representative sweep', () => {
    for (let i = 0; i < 360; i += 7.3) {
      const nak = calculateNakshatra(i);
      expect(nak.number).toBeGreaterThanOrEqual(1);
      expect(nak.number).toBeLessThanOrEqual(27);
    }
    expect(calculateNakshatra(359.9).number).toBe(27);
  });
});

// ── 4. Yoga ───────────────────────────────────────────────────────────────────
describe('ACC-08 · Yoga — (sun+moon) edge flip and range', () => {
  it('flips number exactly at the 13°20′ edge of (sun+moon)', () => {
    expect(calculateYoga(0, 0).number).toBe(1);
    expect(calculateYoga(NAK_SPAN, 0).number).toBe(2);
    // One step below the edge must remain in Yoga 1.
    expect(calculateYoga(NAK_SPAN - 0.001, 0).number).toBe(1);
  });

  it('keeps number within 1..27 across a representative sweep', () => {
    for (let sum = 0; sum < 360; sum += 11.7) {
      const yoga = calculateYoga(sum / 2, sum / 2);
      expect(yoga.number).toBeGreaterThanOrEqual(1);
      expect(yoga.number).toBeLessThanOrEqual(27);
    }
  });
});

// ── 5. Karana ─────────────────────────────────────────────────────────────────
describe('ACC-08 · Karana — movable/fixed partition and range', () => {
  // Linear position p (0..59) => tithi floor(p/2)+1, first half when p is even.
  const karanaAt = (p: number) =>
    calculateKarana(Math.floor(p / 2) + 1, p % 2 === 0);

  it('repeats the 7 movable karanas for the first 57 positions', () => {
    for (let p = 0; p < 57; p++) {
      const karana = karanaAt(p);
      expect(karana.number).toBe((p % 7) + 1);
      expect(karana.type).toBe('movable');
    }
  });

  it('emits only fixed karanas at the trailing positions', () => {
    // Observed behaviour: with tithi capped at 30 the last reachable position is
    // p=59, so only three fixed karanas are emitted (Shakuni=8, Chatushpada=9,
    // Naga=10). Kimstughna (11) is unreachable through this API.
    for (let p = 57; p <= 59; p++) {
      const karana = karanaAt(p);
      expect(karana.number).toBe(p - 57 + 8);
      expect(karana.type).toBe('fixed');
    }
    expect(karanaAt(57).name).toBe('Shakuni');
    expect(karanaAt(59).name).toBe('Naga');
  });

  it('keeps number within 1..11 across all 60 padas of the lunar month', () => {
    const seen = new Set<number>();
    for (let p = 0; p < 60; p++) {
      const karana = karanaAt(p);
      expect(karana.number).toBeGreaterThanOrEqual(1);
      expect(karana.number).toBeLessThanOrEqual(11);
      expect(karana.type).toBe(karana.number <= 7 ? 'movable' : 'fixed');
      seen.add(karana.number);
    }
    expect(seen.size).toBeGreaterThan(0);
  });
});

// ── 6. Sunrise / day boundary ─────────────────────────────────────────────────
describe('ACC-08 · Sunrise and day boundary', () => {
  const panchang = calculatePanchangForDate('2024-08-15', 28.61, 77.23, 'Asia/Kolkata');

  it('sunrise precedes sunset on an ordinary mid-latitude date', () => {
    expect(panchang.sunrise.getTime()).toBeLessThan(panchang.sunset.getTime());
  });

  it('preserves the input local date stamp', () => {
    expect(panchang.date.getFullYear()).toBe(2024);
    expect(panchang.date.getMonth()).toBe(7); // August (0-based)
    expect(panchang.date.getDate()).toBe(15);
  });

  it('produces no NaN in any limb or Date field', () => {
    expect(Number.isFinite(panchang.sunrise.getTime())).toBe(true);
    expect(Number.isFinite(panchang.sunset.getTime())).toBe(true);

    expect(panchang.tithi).toBeDefined();
    expect(panchang.nakshatra).toBeDefined();
    expect(panchang.yoga).toBeDefined();
    expect(panchang.karana).toBeDefined();
    expect(panchang.var).toBeDefined();

    for (const n of [
      panchang.tithi.number,
      panchang.nakshatra.number,
      panchang.yoga.number,
      panchang.karana.number,
      panchang.var.number,
    ]) {
      expect(Number.isFinite(n)).toBe(true);
      expect(Number.isInteger(n)).toBe(true);
    }
  });
});

// ── 7. Location ───────────────────────────────────────────────────────────────
describe('ACC-08 · Location affects sunrise instant', () => {
  it('different latitudes at the same date/timezone give different sunrise', () => {
    const equator = calculatePanchangForDate('2024-03-21', 0, 77.23, 'Asia/Kolkata');
    const mid = calculatePanchangForDate('2024-03-21', 50, 77.23, 'Asia/Kolkata');
    expect(equator.sunrise.getTime()).not.toBe(mid.sunrise.getTime());
  });

  it('different longitudes at the same date/latitude give different sunrise', () => {
    const east = calculatePanchangForDate('2024-03-21', 28.61, 77.23, 'Asia/Kolkata');
    const west = calculatePanchangForDate('2024-03-21', 28.61, -0.13, 'Asia/Kolkata');
    expect(east.sunrise.getTime()).not.toBe(west.sunrise.getTime());
  });
});

// ── 8. Timezone ───────────────────────────────────────────────────────────────
describe('ACC-08 · Timezone affects sunrise instant but not the local stamp', () => {
  const kolkata = calculatePanchangForDate('2024-03-21', 28.61, 77.23, 'Asia/Kolkata');
  const newYork = calculatePanchangForDate('2024-03-21', 28.61, 77.23, 'America/New_York');

  it('same date/coords in two timezones yield different sunrise epoch ms', () => {
    expect(kolkata.sunrise.getTime()).not.toBe(newYork.sunrise.getTime());
  });

  it('the local-date stamp is preserved for each timezone', () => {
    for (const panchang of [kolkata, newYork]) {
      expect(panchang.date.getFullYear()).toBe(2024);
      expect(panchang.date.getMonth()).toBe(2); // March
      expect(panchang.date.getDate()).toBe(21);
    }
  });
});

// ── 9. Extreme latitude / polar ───────────────────────────────────────────────
describe('ACC-08 · Extreme latitude / polar night-day', () => {
  it('calculateSunriseSunset reports noRiseSet with a valid solarNoon fallback', () => {
    // Observed behaviour on 2024-06-21 at 70°N: cos(HA) < -1 (polar day), so
    // sunrise/sunset are null and noRiseSet is true; solarNoon is still a valid
    // finite Date and is used as the position/fallback instant.
    const result = calculateSunriseSunset('2024-06-21', 70, 15, 120);
    expect(result.noRiseSet).toBe(true);
    expect(result.sunrise).toBeNull();
    expect(result.sunset).toBeNull();
    expect(Number.isFinite(result.solarNoon.getTime())).toBe(true);
  });

  it('calculatePanchangForDate does not throw or produce NaN at polar latitude', () => {
    const panchang = calculatePanchangForDate('2024-06-21', 70, 15, 'Asia/Kolkata');
    // Falls back to solarNoon, which must be a finite Date.
    expect(Number.isFinite(panchang.sunrise.getTime())).toBe(true);
    expect(Number.isFinite(panchang.sunset.getTime())).toBe(true);
    expect(panchang.date.getFullYear()).toBe(2024);
    expect(panchang.date.getMonth()).toBe(5); // June
    expect(panchang.date.getDate()).toBe(21);
    expect(Number.isInteger(panchang.tithi.number)).toBe(true);
    expect(Number.isInteger(panchang.nakshatra.number)).toBe(true);
    expect(Number.isInteger(panchang.yoga.number)).toBe(true);
    expect(Number.isInteger(panchang.karana.number)).toBe(true);
  });
});
