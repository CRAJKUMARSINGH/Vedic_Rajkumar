/**
 * Rule tests — Ashtamangala (Prasnalove.txt §9; PM Ch. IV §46–47, Ch. VII).
 * Synthetic inputs only.
 */
import { describe, it, expect } from 'vitest';
import { ashtamangala, ashtamangalaDigit } from '@/features/prashna/kernel/ashtamangala';

describe('ashtamangalaDigit', () => {
  it('16 → 8 and 9 → 1 (spec examples)', () => {
    expect(ashtamangalaDigit(16)).toBe(8);
    expect(ashtamangalaDigit(9)).toBe(1);
  });

  it('8 → 8, 7 → 7, 1 → 1', () => {
    expect(ashtamangalaDigit(8)).toBe(8);
    expect(ashtamangalaDigit(7)).toBe(7);
    expect(ashtamangalaDigit(1)).toBe(1);
  });

  it('is stable across full 8-cycles', () => {
    for (let n = 0; n <= 64; n++) {
      expect(ashtamangalaDigit(n)).toBeGreaterThanOrEqual(1);
      expect(ashtamangalaDigit(n)).toBeLessThanOrEqual(8);
      expect(ashtamangalaDigit(n)).toBe(ashtamangalaDigit(n + 8));
    }
  });
});

describe('ashtamangala — the three-figure number', () => {
  it('left/front/right → hundreds/tens/units', () => {
    const r = ashtamangala(16, 9, 10);
    expect(r.number).toBe(812); // 8 · 1 · 2
    expect(r.past.digit).toBe(8);
    expect(r.present.digit).toBe(1);
    expect(r.future.digit).toBe(2);
    expect(r.future.planet).toBe('Mars');
    expect(r.present.planet).toBe('Sun');
  });

  it('body zones are past/present/future from head to feet', () => {
    const r = ashtamangala(1, 2, 3);
    expect(r.past.bodyZone).toBe('above neck');
    expect(r.present.bodyZone).toBe('neck to waist');
    expect(r.future.bodyZone).toBe('below waist');
  });

  it('even digits mark the disorder zones', () => {
    const r = ashtamangala(16, 9, 10); // digits 8, 1, 2 → even at index 0 and 2
    expect(r.disorderZones).toEqual([0, 2]);
  });
});
