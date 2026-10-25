/**
 * Regression tests for `isoMonth`.
 *
 * The Shadbala Paksha-Bala path used `new Date('YYYY-MM-DD').getMonth()`. A
 * date-only ISO string parses as **UTC** midnight, so `.getMonth()` returns the
 * month in the runtime's *local* zone — for the 1st of a month in any zone west
 * of UTC that is the previous month. `isoMonth` must be zone-independent.
 */
import { describe, it, expect } from 'vitest';
import { isoMonth } from '@/lib/astroUtils';

describe('isoMonth', () => {
  it('returns the 1-based month encoded in the string', () => {
    expect(isoMonth('1990-06-15')).toBe(6);
    expect(isoMonth('2025-01-01')).toBe(1);
    expect(isoMonth('2024-12-01')).toBe(12);
    expect(isoMonth('2000-02-29')).toBe(2);
  });

  it('is independent of the runtime time zone (matches the UTC month)', () => {
    for (const d of ['2025-01-01', '2025-03-01', '2025-07-01', '2025-11-01']) {
      const expected = new Date(`${d}T00:00:00Z`).getUTCMonth() + 1;
      expect(isoMonth(d)).toBe(expected);
    }
  });
});
