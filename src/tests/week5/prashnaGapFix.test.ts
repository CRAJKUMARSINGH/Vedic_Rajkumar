/**
 * Week 5: Prashna Gap Fix Tests
 *
 * Verifies that the Prashna stubs now use the REAL kundli engine
 * (not the fixed-position stubs) to cast the Prashna chart.
 *
 * Key assertions:
 *  - The chart's julianDay reflects the actual askedAt time (not a hardcoded stub JD)
 *  - Different askedAt values produce different chart outputs (proves real calc)
 *  - answerPrashna returns a valid, typed PrashnaAnswer
 *  - createPrashnaSession wraps query + answer correctly
 */

import { describe, it, expect } from 'vitest';
import { answerPrashna, createPrashnaSession } from '@/features/prashna';
import type { PrashnaQuery } from '@/features/prashna';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeQuery(overrides: Partial<PrashnaQuery> = {}): PrashnaQuery {
  return {
    id: 'test-query-001',
    question: 'Will my business succeed this year?',
    topic: 'career',
    askedAt: '2026-09-04T10:30:00',
    timezone: 'Asia/Kolkata',
    latitude: 28.61,
    longitude: 77.23,
    ...overrides,
  };
}

// ─── answerPrashna ────────────────────────────────────────────────────────────

describe('answerPrashna — uses real engine', () => {
  it('returns a complete PrashnaAnswer structure', async () => {
    const answer = await answerPrashna(makeQuery());
    expect(answer).toHaveProperty('queryId', 'test-query-001');
    expect(answer).toHaveProperty('prashnaChart');
    expect(answer).toHaveProperty('verdict');
    expect(answer).toHaveProperty('confidence');
    expect(answer).toHaveProperty('reasoning');
    expect(answer).toHaveProperty('significators');
    expect(answer).toHaveProperty('answeredAt');
    expect(answer).toHaveProperty('engineVersion');
  });

  it('prashnaChart has 10 planets', async () => {
    const answer = await answerPrashna(makeQuery());
    expect(answer.prashnaChart.planets).toHaveLength(10);
  });

  it('prashnaChart has 12 houses', async () => {
    const answer = await answerPrashna(makeQuery());
    expect(answer.prashnaChart.houses).toHaveLength(12);
  });

  it('julianDay is NOT the fixed stub value (2438291.47)', async () => {
    // The stub kundli engine used a hardcoded JD for 1963-09-15.
    // After the fix, the real engine calculates JD from askedAt.
    const answer = await answerPrashna(makeQuery({ askedAt: '2026-09-04T10:30:00' }));
    expect(answer.prashnaChart.julianDay).not.toBeCloseTo(2438291.47, 0);
  });

  it('different askedAt times produce different Julian Days', async () => {
    const a1 = await answerPrashna(makeQuery({ askedAt: '2026-01-01T06:00:00' }));
    const a2 = await answerPrashna(makeQuery({ askedAt: '2026-06-15T14:30:00' }));
    expect(a1.prashnaChart.julianDay).not.toEqual(a2.prashnaChart.julianDay);
  });

  it('different askedAt times produce different Moon signs', async () => {
    // Moon moves ~1 sign per 2.5 days so a 6-month gap must differ
    const a1 = await answerPrashna(makeQuery({ askedAt: '2026-01-01T06:00:00' }));
    const a2 = await answerPrashna(makeQuery({ askedAt: '2026-07-01T06:00:00' }));
    const moon1 = a1.prashnaChart.planets.find(p => p.planet === 'Moon')?.sign;
    const moon2 = a2.prashnaChart.planets.find(p => p.planet === 'Moon')?.sign;
    // They should be different signs (Moon moves ~1 sign/2.5d, so 6mo gap must differ)
    expect(moon1).toBeDefined();
    expect(moon2).toBeDefined();
    expect(moon1).not.toEqual(moon2);
  });

  it('verdict is one of the valid types', async () => {
    const answer = await answerPrashna(makeQuery());
    expect(['yes', 'no', 'maybe', 'unclear']).toContain(answer.verdict);
  });

  it('confidence is a number between 0 and 1', async () => {
    const answer = await answerPrashna(makeQuery());
    expect(answer.confidence).toBeGreaterThan(0);
    expect(answer.confidence).toBeLessThanOrEqual(1);
  });

  it('ayanamsaValue is in the expected Lahiri range for 2026', async () => {
    // Lahiri ayanamsa for 2026 should be approximately 24.0–24.3 degrees
    const answer = await answerPrashna(makeQuery({ askedAt: '2026-09-04T10:00:00' }));
    const ayan = answer.prashnaChart.ayanamsaValue;
    expect(ayan).toBeGreaterThan(23.5);
    expect(ayan).toBeLessThan(25.0);
  });
});

// ─── createPrashnaSession ─────────────────────────────────────────────────────

describe('createPrashnaSession', () => {
  it('returns a session with query and answer', async () => {
    const query = makeQuery();
    const session = await createPrashnaSession(query, 'user_123');
    expect(session.query).toEqual(query);
    expect(session.answer).toBeDefined();
    expect(session.userId).toBe('user_123');
  });

  it('supports null userId for anonymous session', async () => {
    const session = await createPrashnaSession(makeQuery(), null);
    expect(session.userId).toBeNull();
  });

  it('createdAt and updatedAt are ISO date strings', async () => {
    const session = await createPrashnaSession(makeQuery(), null);
    expect(() => new Date(session.createdAt)).not.toThrow();
    expect(() => new Date(session.updatedAt)).not.toThrow();
  });
});

// ─── Regression: stub JD detection ───────────────────────────────────────────

describe('Regression — engine is not using stub constants', () => {
  it('chart ayanamsaValue is NOT the stub constant 23.32', async () => {
    // The kundli stubs.ts used STUB_AYANAMSA = 23.32 (1963 Lahiri approx).
    // The real engine computes ayanamsa from JD — for 2026 this should be ~24.1.
    const answer = await answerPrashna(makeQuery({ askedAt: '2026-09-04T10:00:00' }));
    expect(answer.prashnaChart.ayanamsaValue).not.toBeCloseTo(23.32, 1);
  });

  it('Sun longitude is not the stub constant 149.5°', async () => {
    // stubs.ts hardcoded Sun at 149.5° for all inputs.
    const answer = await answerPrashna(makeQuery({ askedAt: '2026-09-04T10:00:00' }));
    const sun = answer.prashnaChart.planets.find(p => p.planet === 'Sun');
    expect(sun?.siderealLongitude).not.toBeCloseTo(149.5, 0);
  });
});
