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

/**
 * The failure message for a rejected date. `tsconfig.tests.json` runs with
 * `strict: false`, where a boolean discriminant does not narrow the union, so
 * read `.message` through an `in` guard rather than `if (!check.ok)`.
 */
function failureMessage(input: string | Date): string {
  const check = checkBirthDate(input);
  expect(check.ok, `expected ${String(input)} to be rejected`).toBe(false);
  if (!('message' in check)) throw new Error('rejected date has no message');
  return check.message;
}

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
    expect(failureMessage('29/02/1900')).toMatch(/Invalid calendar date/i);
  });
});

describe('checkBirthDate — out of range', () => {
  it('rejects a year below the supported range', () => {
    expect(failureMessage('01/01/1899')).toMatch(/outside supported range/i);
  });

  it('rejects a year above the supported range', () => {
    expect(failureMessage('31/12/2100')).toMatch(/outside supported range/i);
  });
});

describe('checkBirthDate — malformed input', () => {
  it('reports an unusable format', () => {
    expect(failureMessage('not-a-date')).toMatch(/DD\/MM\/YYYY/);
  });

  it('reports an invalid Date instance', () => {
    expect(failureMessage(new Date('nope'))).toMatch(/Invalid date/i);
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
