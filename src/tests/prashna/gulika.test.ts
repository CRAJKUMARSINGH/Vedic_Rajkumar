/**
 * Rule tests — Gulika part table and the Vedic weekday (Prasnalove.txt §9).
 * Prasna Marga Ch. V §54. All inputs are synthetic.
 */
import { describe, it, expect } from 'vitest';
import {
  DAY_GULIKA_PART,
  NIGHT_GULIKA_PART,
  gulikaWindow,
  vedicWeekday,
} from '@/features/prashna/kernel/timeline';

// Synthetic clock: sunrise 06:00 UTC, sunset 18:00 UTC on 2026-01-04.
const sunrise = new Date(Date.UTC(2026, 0, 4, 6, 0, 0));
const sunset = new Date(Date.UTC(2026, 0, 4, 18, 0, 0));
const nextSunrise = new Date(Date.UTC(2026, 0, 5, 6, 0, 0));
const noon = new Date(Date.UTC(2026, 0, 4, 12, 0, 0));
const night = new Date(Date.UTC(2026, 0, 4, 20, 0, 0));

describe('Gulika part table (PM Ch. V §54)', () => {
  it('day: Sun..Sat → 7,6,5,4,3,2,1', () => {
    expect([...DAY_GULIKA_PART]).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it('night: Sun..Sat → 3,2,1,7,6,5,4', () => {
    expect([...NIGHT_GULIKA_PART]).toEqual([3, 2, 1, 7, 6, 5, 4]);
  });

  it('day window start = sunrise + (part-1)·part, for every weekday', () => {
    const segment = (sunset.getTime() - sunrise.getTime()) / 8; // 1.5h
    for (let vw = 0; vw < 7; vw++) {
      const win = gulikaWindow(noon, sunrise, sunset, nextSunrise, vw);
      const expected = sunrise.getTime() + (DAY_GULIKA_PART[vw] - 1) * segment;
      expect(win.isDay).toBe(true);
      expect(win.start.getTime()).toBe(expected);
      expect(win.end.getTime() - win.start.getTime()).toBe(segment);
    }
  });

  it('night window uses the night table and ends at the next sunrise span', () => {
    const segment = (nextSunrise.getTime() - sunset.getTime()) / 8; // 1.5h
    for (let vw = 0; vw < 7; vw++) {
      const win = gulikaWindow(night, sunrise, sunset, nextSunrise, vw);
      const expected = sunset.getTime() + (NIGHT_GULIKA_PART[vw] - 1) * segment;
      expect(win.isDay).toBe(false);
      expect(win.start.getTime()).toBe(expected);
    }
  });

  it('concrete: Sunday daytime Gulika is the 7th part (15:00–16:30)', () => {
    const win = gulikaWindow(noon, sunrise, sunset, nextSunrise, 0);
    expect(win.start.toISOString()).toBe(new Date(Date.UTC(2026, 0, 4, 15, 0)).toISOString());
    expect(win.end.toISOString()).toBe(new Date(Date.UTC(2026, 0, 4, 16, 30)).toISOString());
  });
});

describe('Vedic weekday counted from sunrise (PM Ch. V §54)', () => {
  const sunriseMonday = new Date(Date.UTC(2026, 0, 5, 6, 0, 0));
  const civilWeekdayMonday = 1; // 2026-01-05 is a Monday

  it('before sunrise → previous civil weekday', () => {
    const preDawn = new Date(Date.UTC(2026, 0, 5, 3, 0, 0));
    expect(vedicWeekday(preDawn, sunriseMonday, civilWeekdayMonday)).toBe(0); // Sunday
  });

  it('at/after sunrise → the civil weekday of that day', () => {
    const morning = new Date(Date.UTC(2026, 0, 5, 7, 0, 0));
    expect(vedicWeekday(morning, sunriseMonday, civilWeekdayMonday)).toBe(1); // Monday
  });

  it('wraps Sunday→Saturday when the previous day is Saturday', () => {
    const sunriseSunday = new Date(Date.UTC(2026, 0, 11, 6, 0, 0));
    const preDawnSunday = new Date(Date.UTC(2026, 0, 11, 4, 0, 0));
    expect(vedicWeekday(preDawnSunday, sunriseSunday, 0)).toBe(6); // Saturday
  });
});
