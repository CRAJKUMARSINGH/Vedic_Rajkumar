import { describe, it, expect } from 'vitest';
import { computeDrishti, computeConjunctions } from '@/astrology/transits/aspects';
import { isVedhaActive, getVedha } from '@/astrology/transits/vedha';
import { computePanchang } from '@/astrology/panchang/panchang';
import { BENEFICS } from '@/astrology/core/constants';

const benefics = new Set<string>(BENEFICS);

describe('drishti and conjunctions', () => {
  it('Sun in Aries aspects 7th sign Libra (whole-sign)', () => {
    const natalSigns = { Lagna: 0, Moon: 6 };
    const aspects = computeDrishti('Sun', 10, natalSigns, benefics);
    expect(aspects.some((a) => a.natalTarget === 'Moon' && a.sign === 'Libra')).toBe(true);
  });

  it('conjunctions fire within 3 degrees', () => {
    const hits = computeConjunctions('Jupiter', 121, { Moon: 122 }, benefics, 3);
    expect(hits).toHaveLength(1);
    expect(hits[0].orb).toBeLessThanOrEqual(3);
  });
});

describe('vedha', () => {
  it('cancels a benefic Sun 3rd-from-Moon when 9th is occupied', () => {
    expect(getVedha('Sun', 3)).toBe(9);
    expect(isVedhaActive('Sun', 3, new Set([9]))).toBe(true);
    expect(isVedhaActive('Sun', 3, new Set([2]))).toBe(false);
  });
});

describe('panchang', () => {
  it('computes tithi from moon-sun elongation', () => {
    const p = computePanchang(0, 20, 2460000);
    expect(p.tithi.paksha).toBe('Shukla');
    expect(p.nakshatra.name).toBeTruthy();
    expect(p.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(p.nakshatra.pada).toBeLessThanOrEqual(4);
  });
});
