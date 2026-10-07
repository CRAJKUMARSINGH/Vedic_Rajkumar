import { describe, it, expect } from 'vitest';
import { scoreWindow } from '@/astrology/muhurta/windows';
import { toJulianDay } from '@/astrology/core/ephemeris';

describe('Muhurta windows', () => {
  it('scores a window between 0 and 100', () => {
    const jd = toJulianDay(new Date('2026-10-07T06:00:00Z'));
    const w = scoreWindow(180, 200, jd, 'travel');
    expect(w.score).toBeGreaterThanOrEqual(0);
    expect(w.score).toBeLessThanOrEqual(100);
    expect(w.activity).toBe('travel');
    expect(w.reason.length).toBeGreaterThan(0);
  });
});
