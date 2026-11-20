/**
 * Rule tests — Tajika yogas by degrees (Prasnalove.txt §9, §5.8).
 * Ithasala (applying) vs Ishrafa (separating), retrograde-safe. Synthetic.
 */
import { describe, it, expect } from 'vitest';
import {
  DEEPTAMSHA,
  aspectGap,
  isCombust,
  kamboola,
  radda,
  tajikaRelation,
} from '@/features/prashna/kernel/tajika';
import type { TajikaBody } from '@/features/prashna/kernel/tajika';

const sun = (longitude: number): TajikaBody => ({ name: 'Sun', longitude });
const moon = (longitude: number): TajikaBody => ({ name: 'Moon', longitude });

describe('aspectGap', () => {
  it('returns the distance to the nearest exact aspect', () => {
    expect(aspectGap(25, 20)).toBe(5); // near conjunction
    expect(aspectGap(40, 0)).toBe(20); // 40° → nearest is 60°, gap 20
    expect(aspectGap(90, 0)).toBe(0); // exact square
    expect(aspectGap(350, 0)).toBe(10); // wrap to conjunction
  });
});

describe('tajikaRelation — Ithasala vs Ishrafa', () => {
  it('applying within orb → Ithasala', () => {
    // Sun 350→352 (moving toward Moon at 0/360). Orb = (15+12)/2 = 13.5.
    expect(tajikaRelation(sun(350), moon(0), sun(352), moon(0))).toBe('Ithasala');
  });

  it('separating within orb → Ishrafa', () => {
    expect(tajikaRelation(sun(350), moon(0), sun(348), moon(0))).toBe('Ishrafa');
  });

  it('outside the combined orb → none', () => {
    expect(tajikaRelation(sun(40), moon(0), sun(41), moon(0))).toBe('none');
  });

  it('retrograde-safe: a retrograde flag does not change the classification', () => {
    const marsNow: TajikaBody = { name: 'Mars', longitude: 20, retrograde: true };
    const marsCloser: TajikaBody = { name: 'Mars', longitude: 21, retrograde: true };
    const marsAway: TajikaBody = { name: 'Mars', longitude: 19, retrograde: true };
    // Orb (Sun 15 + Mars 8)/2 = 11.5; now gap = 5.
    expect(tajikaRelation(sun(25), marsNow, sun(25), marsCloser)).toBe('Ithasala');
    expect(tajikaRelation(sun(25), marsNow, sun(25), marsAway)).toBe('Ishrafa');
  });

  it('orb is the mean of the two deeptamshas', () => {
    expect((DEEPTAMSHA.Sun + DEEPTAMSHA.Moon) / 2).toBe(13.5);
  });
});

describe('kamboola, radda, combustion', () => {
  it('Kamboola needs Moon in Ithasala with BOTH Lagna lord and Karyesh', () => {
    // L1 (Sun 100→102) and Karyesh (Mars 108→106) are in Ithasala with each
    // other; the Moon (200→197) applies to both, so Kamboola forms.
    const moonNow: TajikaBody = { name: 'Moon', longitude: 200 };
    const moonLater: TajikaBody = { name: 'Moon', longitude: 197 };
    const l1Now: TajikaBody = { name: 'Sun', longitude: 100 };
    const l1Later: TajikaBody = { name: 'Sun', longitude: 102 };
    const karyeshNow: TajikaBody = { name: 'Mars', longitude: 108 };
    const karyeshLater: TajikaBody = { name: 'Mars', longitude: 106 };
    expect(kamboola(moonNow, moonLater, l1Now, l1Later, karyeshNow, karyeshLater)).toBe(true);
  });

  it('Kamboola is false when the Lagna lord and Karyesh are only separating', () => {
    const moonNow: TajikaBody = { name: 'Moon', longitude: 200 };
    const moonLater: TajikaBody = { name: 'Moon', longitude: 197 };
    expect(
      kamboola(moonNow, moonLater, sun(102), sun(100), { name: 'Mars', longitude: 106 }, { name: 'Mars', longitude: 108 }),
    ).toBe(false);
  });

  it('Radda when the applying planet turns retrograde', () => {
    const before: TajikaBody = { name: 'Mercury', longitude: 100, retrograde: false };
    const after: TajikaBody = { name: 'Mercury', longitude: 99, retrograde: true };
    expect(radda(before, after, 250)).toBe(true);
  });

  it('combustion is judged by the planet-specific orb', () => {
    expect(isCombust({ name: 'Moon', longitude: 5 }, 0)).toBe(true); // ≤ 12°
    expect(isCombust({ name: 'Moon', longitude: 20 }, 0)).toBe(false);
  });
});
