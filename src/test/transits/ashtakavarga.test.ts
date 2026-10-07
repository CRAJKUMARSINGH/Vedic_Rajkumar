import { describe, it, expect } from 'vitest';
import { computeBAV, computeSAV } from '@/astrology/ashtakavarga/bhinnashtakavarga';

const natalSigns = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6, Lagna: 0 };

describe('Ashtakavarga', () => {
  it('BAV total matches sum of benefic rows', () => {
    const bav = computeBAV('Sun', natalSigns);
    expect(bav.total).toBeGreaterThan(0);
    expect(bav.points).toHaveLength(12);
    expect(bav.points.reduce((a, b) => a + b, 0)).toBe(bav.total);
  });
  it('SAV sums all grahas', () => {
    const sav = computeSAV(natalSigns);
    expect(sav).toHaveLength(12);
    expect(sav.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
  });
});
