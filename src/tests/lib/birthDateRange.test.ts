/**
 * birthDateRange.test.ts — Patch 03 guard.
 *
 * Edge and out-of-range birth dates used to fail silently: the form rejected
 * them but never surfaced a message, so the submit button stayed disabled with
 * zero feedback (robotic advanced tier: 29/02/1900, 01/01/1899, 31/12/2099).
 *
 * checkBirthDate() is the shared verdict — range first, then real calendar
 * arithmetic (so 29 Feb on a non-leap year is rejected explicitly).
 */

import { describe, it, expect } from 'vitest';
import {
  checkBirthDate,
  localizeDateMessage,
  MIN_YEAR,
  MAX_YEAR,
} from '@/lib/birthDateRange';

describe('checkBirthDate — accepted formats', () => {
  it('accepts DD/MM/YYYY and returns ISO', () => {
    expect(checkBirthDate('15/09/1963')).toEqual({ ok: true, iso: '1963-09-15' });
  });

  it('accepts ISO YYYY-MM-DD verbatim', () => {
    expect(checkBirthDate('1963-09-15')).toEqual({ ok: true, iso: '1963-09-15' });
  });

  it('accepts a Date instance', () => {
    expect(checkBirthDate(new Date(1963, 8, 15))).toEqual({ ok: true, iso: '1963-09-15' });
  });

  it('accepts the supported-range boundaries', () => {
    expect(checkBirthDate(`${MIN_YEAR}-01-01`)).toEqual({ ok: true, iso: '1900-01-01' });
    expect(checkBirthDate(`${MAX_YEAR}-12-31`)).toEqual({ ok: true, iso: '2099-12-31' });
  });
});

describe('checkBirthDate — leap years', () => {
  it('accepts 29 Feb in a leap year', () => {
    expect(checkBirthDate('29/02/2000')).toEqual({ ok: true, iso: '2000-02-29' });
  });

  it('rejects 29 Feb in a non-leap year with an explicit message', () => {
    const check = checkBirthDate('29/02/1900');
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.message).toMatch(/Invalid calendar date/i);
  });
});

describe('checkBirthDate — out of range', () => {
  it('rejects a year below the supported range', () => {
    const check = checkBirthDate('01/01/1899');
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.message).toMatch(/outside supported range/i);
  });

  it('rejects a year above the supported range', () => {
    const check = checkBirthDate('31/12/2100');
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.message).toMatch(/outside supported range/i);
  });
});

describe('checkBirthDate — malformed input', () => {
  it('reports an unusable format', () => {
    const check = checkBirthDate('not-a-date');
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.message).toMatch(/DD\/MM\/YYYY/);
  });

  it('reports an invalid Date instance', () => {
    const check = checkBirthDate(new Date('nope'));
    expect(check.ok).toBe(false);
    if (!check.ok) expect(check.message).toMatch(/Invalid date/i);
  });
});

describe('localizeDateMessage', () => {
  it('returns the original message for en', () => {
    expect(localizeDateMessage('Invalid date', 'en')).toBe('Invalid date');
  });

  it('translates a known message for hi', () => {
    expect(localizeDateMessage('Invalid date', 'hi')).toBe('अमान्य तिथि');
  });

  it('falls back to the original for an unknown message', () => {
    expect(localizeDateMessage('Something else', 'hi')).toBe('Something else');
  });
});
