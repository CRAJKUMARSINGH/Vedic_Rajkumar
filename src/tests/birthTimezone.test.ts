/**
 * birthTimezone.test.ts
 *
 * Verifies that resolveBirthTimezone returns the correct historical offset
 * for Indian birth dates across the known transition points.
 */
import { describe, it, expect } from 'vitest';
import { resolveBirthTimezone, lmtOffsetHours } from '@/lib/birthTimezone';

describe('resolveBirthTimezone — Indian offsets', () => {
  it('gives IST +5.5 for a modern birth', () => {
    const tz = resolveBirthTimezone({ date: '1990-03-14', location: 'Mumbai' });
    expect(tz?.offsetHours).toBe(5.5);
    expect(tz?.isHistorical).toBe(false);
  });

  it('gives wartime +6.5 for 1943-06-15 Mumbai (second wartime period)', () => {
    const tz = resolveBirthTimezone({ date: '1943-06-15', location: 'Mumbai' });
    expect(tz?.offsetHours).toBe(6.5);
    expect(tz?.isHistorical).toBe(true);
    expect(tz?.note).toMatch(/wartime/i);
  });

  it('gives wartime +6.5 for 1941-11-01 (first wartime period)', () => {
    const tz = resolveBirthTimezone({ date: '1941-11-01', location: 'Delhi' });
    expect(tz?.offsetHours).toBe(6.5);
  });

  it('gives IST +5.5 just after the final wartime revert (1945-10-16)', () => {
    const tz = resolveBirthTimezone({ date: '1945-10-16', location: 'Kolkata' });
    expect(tz?.offsetHours).toBe(5.5);
  });

  it('gives IST +5.5 for the gap between wartime periods (1942-05-20)', () => {
    const tz = resolveBirthTimezone({ date: '1942-05-20', location: 'Pune' });
    expect(tz?.offsetHours).toBe(5.5);
  });

  it('gives IST for 1910 Bombay (post-1906)', () => {
    const tz = resolveBirthTimezone({ date: '1910-01-01', location: 'Bombay' });
    expect(tz?.offsetHours).toBe(5.5);
  });

  it('gives approximate IST for pre-1906 Madras', () => {
    const tz = resolveBirthTimezone({ date: '1890-06-12', location: 'Madras' });
    expect(tz?.offsetHours).toBe(5.5); // approximate LMT
    expect(tz?.isHistorical).toBe(true);
  });

  it('returns null for an unknown location', () => {
    const tz = resolveBirthTimezone({ date: '1990-01-01', location: 'London' });
    expect(tz).toBeNull();
  });

  it('returns null for an invalid date', () => {
    const tz = resolveBirthTimezone({ date: 'not-a-date', location: 'Mumbai' });
    expect(tz).toBeNull();
  });
});

describe('lmtOffsetHours', () => {
  it('computes IST-equivalent for Mumbai longitude', () => {
    // Mumbai lon ≈ 72.88°, LMT = 72.88/15 = 4.859h (not IST)
    expect(lmtOffsetHours(72.8777)).toBeCloseTo(4.858, 2);
  });

  it('computes 0 for prime meridian', () => {
    expect(lmtOffsetHours(0)).toBe(0);
  });
});
