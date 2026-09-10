/**
 * Week 7: Dasha–Transit Correlation Service Tests
 *
 * Tests for:
 *  - computeCorrelation() — full result structure
 *  - computeMonthlyOutlook() — 12-month array
 *  - Type guards and field constraints
 *
 * Uses the real Kundli engine (no mocks) with a known reference chart
 * (Rajkumar — 1963-09-15, 06:00 IST, Aspur, Rajasthan).
 */

import { describe, it, expect } from 'vitest';
import {
  computeCorrelation,
  computeMonthlyOutlook,
  type DashaTransitCorrelationResult,
  type MonthlyOutlookItem,
  type ActivationLevel,
} from '@/services/dashaTransitCorrelationService';
import type { BirthData } from '@/features/kundli/types';

// ─── Reference birth data ─────────────────────────────────────────────────────

const RAJKUMAR: BirthData = {
  name:      'Rajkumar',
  date:      '1963-09-15',
  time:      '06:00',
  timezone:  'Asia/Kolkata',
  latitude:  23.5,
  longitude: 74.32,
  place:     'Aspur, Rajasthan',
};

const TARGET_DATE = '2026-09-04';

// ─── computeCorrelation ───────────────────────────────────────────────────────

describe('computeCorrelation — result structure', () => {
  let result: DashaTransitCorrelationResult;

  // Run once for the describe block
  it('returns a result without throwing', () => {
    result = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(result).toBeTruthy();
  });

  it('result has a valid calculatedAt ISO timestamp', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(new Date(res.calculatedAt).getTime()).toBeGreaterThan(0);
  });

  it('targetDate matches input', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.targetDate).toBe(TARGET_DATE);
  });

  it('moonSign is a valid zodiac sign string', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const validSigns = [
      'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
      'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
    ];
    expect(validSigns).toContain(res.moonSign);
  });

  it('moonHouse is 1–12', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.moonHouse).toBeGreaterThanOrEqual(1);
    expect(res.moonHouse).toBeLessThanOrEqual(12);
  });
});

describe('computeCorrelation — activeDasha', () => {
  it('mahaLord is a known planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
    expect(planets).toContain(res.activeDasha.mahaLord);
  });

  it('antarLord is a known planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
    expect(planets).toContain(res.activeDasha.antarLord);
  });

  it('mahaStart and mahaEnd are valid YYYY-MM-DD strings', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.activeDasha.mahaStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.activeDasha.mahaEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('mahaStart is before mahaEnd', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(new Date(res.activeDasha.mahaStart).getTime())
      .toBeLessThan(new Date(res.activeDasha.mahaEnd).getTime());
  });

  it('moonNakshatra is a non-empty string', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.activeDasha.moonNakshatra).toBeTruthy();
  });

  it('balanceDays is a positive number', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.activeDasha.balanceDays).toBeGreaterThan(0);
  });
});

describe('computeCorrelation — transitPositions', () => {
  it('returns exactly 9 transit planets', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.transitPositions).toHaveLength(9);
  });

  it('all 9 canonical planets are present', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const planets = res.transitPositions.map((tp) => tp.planet);
    const expected = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
    expected.forEach((p) => expect(planets).toContain(p));
  });

  it('houseFromMoon is 1–12 for every planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    res.transitPositions.forEach((tp) => {
      expect(tp.houseFromMoon).toBeGreaterThanOrEqual(1);
      expect(tp.houseFromMoon).toBeLessThanOrEqual(12);
    });
  });

  it('degrees are within 0–30 for every planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    res.transitPositions.forEach((tp) => {
      expect(tp.degrees).toBeGreaterThanOrEqual(0);
      expect(tp.degrees).toBeLessThan(30);
    });
  });

  it('isFavorable is a boolean for every planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    res.transitPositions.forEach((tp) => {
      expect(typeof tp.isFavorable).toBe('boolean');
    });
  });

  it('nakshatra is a non-empty string for every planet', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    res.transitPositions.forEach((tp) => {
      expect(tp.nakshatra).toBeTruthy();
    });
  });
});

describe('computeCorrelation — correlation result', () => {
  it('activationLevel is High, Medium, or Low', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    const valid: ActivationLevel[] = ['High', 'Medium', 'Low'];
    expect(valid).toContain(res.correlation.activationLevel);
  });

  it('score is 0–100', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.correlation.score).toBeGreaterThanOrEqual(0);
    expect(res.correlation.score).toBeLessThanOrEqual(100);
  });

  it('prediction has en and hi strings', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.correlation.prediction.en).toBeTruthy();
    expect(res.correlation.prediction.hi).toBeTruthy();
  });

  it('timing has en and hi strings', () => {
    const res = computeCorrelation(RAJKUMAR, TARGET_DATE);
    expect(res.correlation.timing.en).toBeTruthy();
    expect(res.correlation.timing.hi).toBeTruthy();
  });
});

// ─── computeMonthlyOutlook ────────────────────────────────────────────────────

describe('computeMonthlyOutlook', () => {
  let outlook: MonthlyOutlookItem[];

  it('returns exactly 12 items', () => {
    outlook = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    expect(outlook).toHaveLength(12);
  });

  it('each item has a valid month string', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    items.forEach((item) => {
      expect(item.month).toBeTruthy();
      expect(typeof item.month).toBe('string');
    });
  });

  it('each item has a valid monthKey YYYY-MM format', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    items.forEach((item) => {
      expect(item.monthKey).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  it('monthKeys are sequential — each month is the next calendar month', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    for (let i = 1; i < items.length; i++) {
      const prev = new Date(items[i - 1].monthKey + '-01T00:00:00Z');
      const curr = new Date(items[i].monthKey + '-01T00:00:00Z');
      // curr must be exactly one month after prev
      const prevNextMonth = new Date(prev);
      prevNextMonth.setUTCMonth(prevNextMonth.getUTCMonth() + 1);
      expect(curr.getUTCFullYear()).toBe(prevNextMonth.getUTCFullYear());
      expect(curr.getUTCMonth()).toBe(prevNextMonth.getUTCMonth());
    }
  });

  it('score is 0–100 for every month', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    items.forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
    });
  });

  it('activationLevel is always High, Medium, or Low', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    const valid: ActivationLevel[] = ['High', 'Medium', 'Low'];
    items.forEach((item) => {
      expect(valid).toContain(item.activationLevel);
    });
  });

  it('mahaLord and antarLord are known planets', () => {
    const items = computeMonthlyOutlook(RAJKUMAR, TARGET_DATE);
    const planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu','Unknown'];
    items.forEach((item) => {
      expect(planets).toContain(item.mahaLord);
      expect(planets).toContain(item.antarLord);
    });
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('computeCorrelation — edge cases', () => {
  it('handles southern hemisphere birth (negative latitude)', () => {
    const southernBirth: BirthData = {
      name: 'Test South',
      date: '1985-06-15',
      time: '12:00',
      timezone: 'Australia/Sydney',
      latitude: -33.87,
      longitude: 151.21,
      place: 'Sydney, Australia',
    };
    expect(() => computeCorrelation(southernBirth, TARGET_DATE)).not.toThrow();
  });

  it('handles historical birth date (1869)', () => {
    const gandhi: BirthData = {
      name: 'Gandhi',
      date: '1869-10-02',
      time: '07:20',
      timezone: 'Asia/Kolkata',
      latitude: 21.64,
      longitude: 70.08,
      place: 'Porbandar',
    };
    expect(() => computeCorrelation(gandhi, TARGET_DATE)).not.toThrow();
  });

  it('handles a target date far in the future (2040)', () => {
    expect(() => computeCorrelation(RAJKUMAR, '2040-01-01')).not.toThrow();
  });

  it('result for different target dates differs in transitPositions', () => {
    const res1 = computeCorrelation(RAJKUMAR, '2026-09-04');
    const res2 = computeCorrelation(RAJKUMAR, '2026-10-04');
    // Transit positions for different dates should differ (at least Moon moves)
    const moon1 = res1.transitPositions.find((p) => p.planet === 'Moon');
    const moon2 = res2.transitPositions.find((p) => p.planet === 'Moon');
    expect(moon1).toBeDefined();
    expect(moon2).toBeDefined();
    // Moon moves ~1 sign per 2.5 days, so a month apart they'll differ
    // (sign or house from Moon or degrees will be different)
    const diff = moon1!.houseFromMoon !== moon2!.houseFromMoon ||
                 moon1!.sign !== moon2!.sign ||
                 Math.abs(moon1!.degrees - moon2!.degrees) > 0.1;
    expect(diff).toBe(true);
  });
});
