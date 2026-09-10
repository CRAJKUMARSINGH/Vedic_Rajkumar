/**
 * Week 2: Dasha Rule Validation Tests
 *
 * Validates core Vimshottari Dasha rules (R4, R5):
 *  - Total cycle = 120 years
 *  - Antardasha sums = parent mahadasha duration
 *  - Consecutive dates have no gaps
 *  - Nakshatra-lord sequence is classical
 *  - Dasha balance from precision engine within ±30 days (REF-001)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateVimshottariDasha,
  DASHA_PERIODS,
  DASHA_SEQUENCE,
  NAKSHATRA_LORDS,
} from '@/services/dashaService';
import { calculateChart, calculateVimshottariDasha as engineDasha } from '@/features/kundli/engine';
import type { BirthData } from '@/features/kundli/types';

// ─── Classical sequence constants ─────────────────────────────────────────────

const CLASSICAL_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// ─── Total cycle = 120 years ──────────────────────────────────────────────────

describe('Vimshottari total cycle', () => {
  it('all 9 dasha periods sum to exactly 120 years', () => {
    const total = Object.values(DASHA_PERIODS).reduce((a, b) => a + b, 0);
    expect(total).toBe(120);
  });

  it('dasha sequence has exactly 9 planets', () => {
    expect(DASHA_SEQUENCE).toHaveLength(9);
  });

  it('dasha sequence contains exactly the classical 9 planets', () => {
    expect([...DASHA_SEQUENCE].sort()).toEqual([...CLASSICAL_SEQUENCE].sort());
  });

  it('dasha sequence starts with Ketu', () => {
    expect(DASHA_SEQUENCE[0]).toBe('Ketu');
  });

  it('dasha sequence follows classical order', () => {
    for (let i = 0; i < CLASSICAL_SEQUENCE.length; i++) {
      expect(DASHA_SEQUENCE[i]).toBe(CLASSICAL_SEQUENCE[i]);
    }
  });
});

// ─── Nakshatra lord sequence ──────────────────────────────────────────────────

describe('Nakshatra lord sequence', () => {
  it('has exactly 27 entries (one per nakshatra)', () => {
    expect(NAKSHATRA_LORDS).toHaveLength(27);
  });

  it('first nakshatra (Ashwini) lord is Ketu', () => {
    expect(NAKSHATRA_LORDS[0]).toBe('Ketu');
  });

  it('9th nakshatra (Ashlesha) lord is Mercury', () => {
    expect(NAKSHATRA_LORDS[8]).toBe('Mercury');
  });

  it('10th nakshatra (Magha) lord is Ketu (cycle repeats)', () => {
    expect(NAKSHATRA_LORDS[9]).toBe('Ketu');
  });

  it('each planet appears exactly 3 times', () => {
    const counts: Record<string, number> = {};
    for (const lord of NAKSHATRA_LORDS) {
      counts[lord] = (counts[lord] ?? 0) + 1;
    }
    for (const planet of CLASSICAL_SEQUENCE) {
      expect(counts[planet]).toBe(3);
    }
  });
});

// ─── Antardasha duration sums ─────────────────────────────────────────────────

describe('Antardasha sums within Mahadasha', () => {
  const result = calculateVimshottariDasha('1990-01-15', '10:30');

  it('each full mahadasha: antardasha durations sum to parent (±1 day)', () => {
    for (const maha of result.mahadashas) {
      if (maha.durationYears === DASHA_PERIODS[maha.planet]) {
        // Full (non-partial) mahadasha
        const antarTotal = maha.antardashas.reduce((s, a) => s + a.durationDays, 0);
        const mahaTotal  = maha.durationYears * 365.25;
        expect(Math.abs(antarTotal - mahaTotal)).toBeLessThan(1);
      }
    }
  });

  it('each mahadasha has exactly 9 antardashas', () => {
    for (const maha of result.mahadashas) {
      expect(maha.antardashas).toHaveLength(9);
    }
  });

  it('antardasha start/end dates are consecutive within each mahadasha', () => {
    for (const maha of result.mahadashas) {
      for (let i = 1; i < maha.antardashas.length; i++) {
        const prev = maha.antardashas[i - 1];
        const curr = maha.antardashas[i];
        const gapMs = Math.abs(curr.startDate.getTime() - prev.endDate.getTime());
        expect(gapMs).toBeLessThan(24 * 60 * 60 * 1000); // < 1 day gap
      }
    }
  });
});

// ─── Consecutive mahadasha dates ──────────────────────────────────────────────

describe('Consecutive Mahadasha dates — no gaps', () => {
  const result = calculateVimshottariDasha('1963-09-15', '06:00', 3, 96.3);

  it('mahadasha end[i] = start[i+1] (within 1 day)', () => {
    for (let i = 1; i < result.mahadashas.length; i++) {
      const prev = result.mahadashas[i - 1];
      const curr = result.mahadashas[i];
      const gapMs = Math.abs(curr.startDate.getTime() - prev.endDate.getTime());
      expect(gapMs).toBeLessThan(24 * 60 * 60 * 1000);
    }
  });

  it('first mahadasha starts on or near birth date', () => {
    const first = result.mahadashas[0];
    const birthDate = new Date('1963-09-15');
    const diff = Math.abs(first.startDate.getTime() - birthDate.getTime());
    // Within 2 days
    expect(diff).toBeLessThan(2 * 24 * 60 * 60 * 1000);
  });
});

// ─── Dasha balance accuracy — REF-001 ────────────────────────────────────────

describe('Dasha balance from precision engine — REF-001 (Priyansh)', () => {
  // Use the kundli engine (Meeus) calculateVimshottariDasha for REF-001
  const birthData: BirthData = {
    name:      'Priyansh Singh Chauhan',
    date:      '2000-10-26',
    time:      '00:50',
    timezone:  'Asia/Kolkata',
    latitude:  22.72,
    longitude: 75.86,
    place:     'Indore',
  };

  it('dasha seed lord from precision engine is Moon', () => {
    const chart = calculateChart(birthData);
    const dasha = engineDasha(chart);
    // Moon is Hasta nakshatra → Moon lord
    expect(dasha.birthDashaBalance.planet).toBe('Moon');
  });

  it('dasha balance is within ±30 days of 960 days reference', () => {
    const chart = calculateChart(birthData);
    const dasha = engineDasha(chart);
    const balanceDays = dasha.birthDashaBalance.yearsRemaining * 365.25;
    const expected = 960;
    const delta = Math.abs(balanceDays - expected);
    // Tolerance: ±30 days accounts for Schlyter Moon ±1° → ~27-day uncertainty
    expect(delta).toBeLessThan(30);
  });

  it('Moon nakshatra is Hasta', () => {
    const chart = calculateChart(birthData);
    const moonPos = chart.planets.find(p => p.planet === 'Moon');
    expect(moonPos).toBeDefined();
    expect(moonPos!.nakshatra).toBe('Hasta');
  });
});

// ─── Dasha sequence after seed planet ────────────────────────────────────────

describe('Dasha sequence ordering — correct rotation after seed', () => {
  it('sequence after Moon seed follows classical order', () => {
    const result = calculateVimshottariDasha('2000-10-26', '00:50');
    const mahaLords = result.mahadashas.map(m => m.planet);
    // First maha = Moon (seed), then Mars, Rahu, Jupiter, Saturn, Mercury, Ketu, Venus, Sun, Moon...
    expect(mahaLords[0]).toBe('Moon');
    const moonIdx = CLASSICAL_SEQUENCE.indexOf('Moon');
    const expected = [
      ...CLASSICAL_SEQUENCE.slice(moonIdx),
      ...CLASSICAL_SEQUENCE.slice(0, moonIdx),
    ];
    for (let i = 0; i < expected.length && i < mahaLords.length; i++) {
      expect(mahaLords[i]).toBe(expected[i]);
    }
  });
});
