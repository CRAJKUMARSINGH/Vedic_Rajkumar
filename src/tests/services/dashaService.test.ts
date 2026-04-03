/**
 * Tests for Vimshottari Dasha Service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateVimshottariDasha,
  formatDashaDate,
  getDashaInterpretation,
  getPlanetSymbol,
  DASHA_PERIODS,
  DASHA_SEQUENCE,
  NAKSHATRA_LORDS,
} from '../../services/dashaService';

describe('DASHA_PERIODS', () => {
  it('should sum to 120 years', () => {
    const total = Object.values(DASHA_PERIODS).reduce((a, b) => a + b, 0);
    expect(total).toBe(120);
  });

  it('should have 9 planets', () => {
    expect(Object.keys(DASHA_PERIODS)).toHaveLength(9);
  });
});

describe('DASHA_SEQUENCE', () => {
  it('should have 9 planets', () => {
    expect(DASHA_SEQUENCE).toHaveLength(9);
  });

  it('should start with Ketu', () => {
    expect(DASHA_SEQUENCE[0]).toBe('Ketu');
  });

  it('should contain all 9 planets exactly once', () => {
    const expected = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    expect(DASHA_SEQUENCE.sort()).toEqual(expected.sort());
  });
});

describe('NAKSHATRA_LORDS', () => {
  it('should have 27 entries', () => {
    expect(NAKSHATRA_LORDS).toHaveLength(27);
  });

  it('should cycle through 9 lords 3 times', () => {
    // Each lord appears exactly 3 times
    const counts: Record<string, number> = {};
    for (const lord of NAKSHATRA_LORDS) {
      counts[lord] = (counts[lord] || 0) + 1;
    }
    for (const lord of DASHA_SEQUENCE) {
      expect(counts[lord]).toBe(3);
    }
  });

  it('should start with Ketu (Ashwini)', () => {
    expect(NAKSHATRA_LORDS[0]).toBe('Ketu');
  });
});

describe('calculateVimshottariDasha', () => {
  const testDate = '1990-01-15';
  const testTime = '10:30';

  it('should return a valid DashaResult', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    expect(result).toBeDefined();
    expect(result.birthDate).toBeInstanceOf(Date);
    expect(result.mahadashas).toBeInstanceOf(Array);
    expect(result.mahadashas.length).toBeGreaterThan(0);
  });

  it('should have moonNakshatra between 1 and 27', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    expect(result.moonNakshatra).toBeGreaterThanOrEqual(1);
    expect(result.moonNakshatra).toBeLessThanOrEqual(27);
  });

  it('should have a valid moonNakshatraLord', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    expect(DASHA_SEQUENCE).toContain(result.moonNakshatraLord);
  });

  it('should have positive balanceDays', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    expect(result.balanceDays).toBeGreaterThan(0);
    expect(result.balanceDays).toBeLessThanOrEqual(20 * 365.25); // Max Venus dasha
  });

  it('should have mahadashas with valid start/end dates', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    for (const maha of result.mahadashas) {
      expect(maha.startDate).toBeInstanceOf(Date);
      expect(maha.endDate).toBeInstanceOf(Date);
      expect(maha.endDate.getTime()).toBeGreaterThan(maha.startDate.getTime());
    }
  });

  it('should have consecutive mahadasha dates', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    for (let i = 1; i < result.mahadashas.length; i++) {
      const prev = result.mahadashas[i - 1];
      const curr = result.mahadashas[i];
      // End of previous should equal start of current (within 1 day tolerance)
      const diff = Math.abs(curr.startDate.getTime() - prev.endDate.getTime());
      expect(diff).toBeLessThan(24 * 60 * 60 * 1000);
    }
  });

  it('should have exactly 9 antardashas per mahadasha', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    for (const maha of result.mahadashas) {
      expect(maha.antardashas).toHaveLength(9);
    }
  });

  it('should mark at most one mahadasha as active', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    const activeCount = result.mahadashas.filter(m => m.isActive).length;
    expect(activeCount).toBeLessThanOrEqual(1);
  });

  it('should have currentMahadasha if birth date is in the past', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    // Birth in 1990 — should have a current mahadasha
    expect(result.currentMahadasha).not.toBeNull();
  });

  it('should have antardasha durations sum to mahadasha duration', () => {
    const result = calculateVimshottariDasha(testDate, testTime);
    // Check a full mahadasha (not the first partial one)
    const fullMaha = result.mahadashas.find(m => m.durationYears === DASHA_PERIODS[m.planet]);
    if (fullMaha) {
      const antarTotal = fullMaha.antardashas.reduce((sum, a) => sum + a.durationDays, 0);
      const mahaTotal = fullMaha.durationYears * 365.25;
      expect(Math.abs(antarTotal - mahaTotal)).toBeLessThan(1); // within 1 day
    }
  });

  it('should work for a recent birth date', () => {
    const result = calculateVimshottariDasha('2010-06-15', '08:00');
    expect(result.mahadashas.length).toBeGreaterThan(0);
    expect(result.currentMahadasha).not.toBeNull();
  });
});

describe('formatDashaDate', () => {
  it('should return a non-empty string', () => {
    const result = formatDashaDate(new Date('2024-01-15'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include the year', () => {
    const result = formatDashaDate(new Date('2024-01-15'));
    expect(result).toContain('2024');
  });
});

describe('getDashaInterpretation', () => {
  it('should return interpretations for all 9 planets', () => {
    for (const planet of DASHA_SEQUENCE) {
      const interp = getDashaInterpretation(planet);
      expect(interp.en).toBeTruthy();
      expect(interp.hi).toBeTruthy();
    }
  });

  it('should return fallback for unknown planet', () => {
    const interp = getDashaInterpretation('Unknown');
    expect(interp.en).toBeTruthy();
  });
});

describe('getPlanetSymbol', () => {
  it('should return symbols for all 9 planets', () => {
    for (const planet of DASHA_SEQUENCE) {
      const symbol = getPlanetSymbol(planet);
      expect(typeof symbol).toBe('string');
      expect(symbol.length).toBeGreaterThan(0);
    }
  });

  it('should return fallback for unknown planet', () => {
    const symbol = getPlanetSymbol('Unknown');
    expect(symbol).toBe('⭐');
  });
});
