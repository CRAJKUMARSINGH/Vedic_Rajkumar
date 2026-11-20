/**
 * Rule tests — Sphutas (Prasnalove.txt §9, §5.3; PM Ch. V §55–57).
 * Worked arithmetic with synthetic longitudes.
 */
import { describe, it, expect } from 'vitest';
import {
  chatusphuta,
  computeSphutas,
  dehaSphuta,
  mrityuSphuta,
  panchasphuta,
  pranaSphuta,
  trisphuta,
} from '@/features/prashna/kernel/sphutas';

describe('composite sphutas', () => {
  it('trisphuta = lagna + moon + gulika (mod 360)', () => {
    expect(trisphuta(100, 50, 200)).toBe(350);
    expect(trisphuta(350, 20, 30)).toBe(40); // wraps
  });

  it('chatusphuta = trisphuta + sun', () => {
    expect(chatusphuta(350, 20)).toBe(10);
  });

  it('panchasphuta = chatusphuta + rahu', () => {
    expect(panchasphuta(10, 30)).toBe(40);
  });
});

describe('navamsa sphutas (×9)', () => {
  it('prana = lagna × 9', () => {
    expect(pranaSphuta(100)).toBe(180); // 900 mod 360
  });
  it('deha = moon × 9', () => {
    expect(dehaSphuta(50)).toBe(90); // 450 mod 360
  });
  it('mrityu = gulika × 9', () => {
    expect(mrityuSphuta(200)).toBe(0); // 1800 mod 360
  });
});

describe('computeSphutas — full worked example', () => {
  it('produces the six values from the six source longitudes', () => {
    const set = computeSphutas({ lagna: 100, moon: 50, gulika: 200, sun: 20, rahu: 30 });
    expect(set).toEqual({
      trisphuta: 350,
      chatusphuta: 10,
      panchasphuta: 40,
      prana: 180,
      deha: 90,
      mrityu: 0,
    });
  });

  it('always normalises into [0, 360)', () => {
    const set = computeSphutas({ lagna: 359, moon: 359, gulika: 359, sun: 359, rahu: 359 });
    for (const v of Object.values(set)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });
});
