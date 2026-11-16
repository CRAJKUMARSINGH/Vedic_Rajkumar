/**
 * dateValidation.test.ts
 *
 * PATCH 3 evidence — covers the mandatory date/time cases from the robotic
 * remediation brief. Verifies strict DD/MM/YYYY parsing rejects impossible
 * calendar dates (no `Date` constructor normalisation), applies Gregorian
 * leap-year rules, enforces the documented supported range, and keeps the
 * "calendar-valid" and "allowed as a birth date" policies separate.
 */
import { describe, it, expect } from 'vitest';
import {
  parseDdMmYyyy,
  parseHhMm,
  isCalendarValidDate,
  isLeapYear,
  isFutureDate,
  isWithinSupportedRange,
  SUPPORTED_DATE_RANGE,
} from '@/lib/dateValidation';

describe('parseDdMmYyyy — mandatory calendar cases', () => {
  it('accepts 29/02/2000 (leap year, divisible by 400)', () => {
    const r = parseDdMmYyyy('29/02/2000');
    expect(r.ok).toBe(true);
    expect(r.iso).toBe('2000-02-29');
  });

  it('rejects 29/02/1900 (century year not divisible by 400)', () => {
    const r = parseDdMmYyyy('29/02/1900');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('impossible');
    expect(r.iso).toBeNull();
  });

  it('accepts 29/02/2024 (leap year)', () => {
    const r = parseDdMmYyyy('29/02/2024');
    expect(r.ok).toBe(true);
    expect(r.iso).toBe('2024-02-29');
  });

  it('rejects 31/04/2020 (April has 30 days)', () => {
    const r = parseDdMmYyyy('31/04/2020');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('impossible');
  });

  it('accepts 01/01/1900 as a valid calendar date inside the supported range', () => {
    const r = parseDdMmYyyy('01/01/1900');
    expect(r.ok).toBe(true);
    expect(r.iso).toBe('1900-01-01');
    expect(isWithinSupportedRange('1900-01-01')).toBe(true);
  });

  it('accepts 31/12/2099 as a valid calendar date but flags it as a future date', () => {
    const r = parseDdMmYyyy('31/12/2099');
    expect(r.ok).toBe(true);
    expect(r.iso).toBe('2099-12-31');
    // Future-birth policy is a separate concern from calendar validity.
    expect(isFutureDate('2099-12-31', '2026-11-15')).toBe(true);
  });
});

describe('parseDdMmYyyy — strictness', () => {
  it('rejects malformed input without normalising it', () => {
    for (const bad of ['', '2024-02-29', '29-02-2024', '29/2/2024', 'aa/bb/cccc', '31/13/2020', '00/00/0000']) {
      const r = parseDdMmYyyy(bad);
      expect(r.ok, `expected ${JSON.stringify(bad)} to be rejected`).toBe(false);
    }
  });

  it('rejects dates outside the documented supported range', () => {
    const r = parseDdMmYyyy('01/01/1700');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('out-of-range');
  });

  it('optionally accepts an already-ISO date', () => {
    expect(parseDdMmYyyy('1990-03-14').ok).toBe(false);
    expect(parseDdMmYyyy('1990-03-14', { allowIso: true }).iso).toBe('1990-03-14');
  });
});

describe('Gregorian leap-year rules', () => {
  it('classifies years correctly', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
  });

  it('isCalendarValidDate has no Date-constructor normalisation', () => {
    expect(isCalendarValidDate('1900-02-29')).toBe(false);
    expect(isCalendarValidDate('2000-02-29')).toBe(true);
    expect(isCalendarValidDate('2020-04-31')).toBe(false);
  });
});

describe('parseHhMm — mandatory time cases', () => {
  it('accepts 00:00', () => {
    expect(parseHhMm('00:00').ok).toBe(true);
  });

  it('accepts 23:59', () => {
    expect(parseHhMm('23:59').ok).toBe(true);
  });

  it('rejects 24:00', () => {
    expect(parseHhMm('24:00').ok).toBe(false);
  });

  it('rejects other malformed times', () => {
    for (const bad of ['', '6:00', '06:0', '06:60', '23:60', '-1:00']) {
      expect(parseHhMm(bad).ok, `expected ${bad} to be rejected`).toBe(false);
    }
  });
});

describe('timezone independence', () => {
  it('compares date-only values lexicographically (no timezone shift)', () => {
    // A UTC-midnight Date would land on the previous local day west of UTC.
    expect(isFutureDate('2026-11-16', '2026-11-15')).toBe(true);
    expect(isFutureDate('2026-11-15', '2026-11-15')).toBe(false);
    expect(isFutureDate('2026-11-14', '2026-11-15')).toBe(false);
  });

  it('exposes a documented supported range', () => {
    expect(SUPPORTED_DATE_RANGE.min).toBe('1800-01-01');
    expect(SUPPORTED_DATE_RANGE.max).toBe('2100-12-31');
  });
});
