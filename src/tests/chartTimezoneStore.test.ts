/**
 * chartTimezoneStore.test.ts
 *
 * Proves the store actually changes chart output, and that an explicit offset
 * still wins. Without this, a refactor can quietly drop the offset and every
 * chart silently reverts to flat IST with nothing failing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateChartForBirth, offsetForChart } from '@/services/chartWithTimezone';
import { calculatePreciseChart } from '@/services/precisionEphemerisService';
import { currentOffsetHours, getBirthTimezone, setBirthTimezone } from '@/hooks/use-birth-timezone';
import { resolveBirthTimezone } from '@/lib/birthTimezone';

const WARTIME = { date: '1943-06-15', time: '04:27', lat: 19.076, lon: 72.8777 };

function separation(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

beforeEach(() => setBirthTimezone(null));

describe('birth timezone store', () => {
  it('starts empty', () => {
    expect(getBirthTimezone()).toBeNull();
    expect(currentOffsetHours()).toBeNull();
  });

  it('exposes the resolved offset once set', () => {
    setBirthTimezone(resolveBirthTimezone({ date: '1943-06-15', location: 'Mumbai' }));
    expect(currentOffsetHours()).toBe(6.5);
  });

  it('can be cleared', () => {
    setBirthTimezone(resolveBirthTimezone({ date: '1943-06-15', location: 'Mumbai' }));
    setBirthTimezone(null);
    expect(currentOffsetHours()).toBeNull();
  });
});

describe('offsetForChart', () => {
  it('prefers an explicit offset', () => {
    setBirthTimezone(resolveBirthTimezone({ date: '1943-06-15', location: 'Mumbai' }));
    expect(offsetForChart(5.5)).toBe(5.5);
  });

  it('falls back to the store, then to IST', () => {
    expect(offsetForChart()).toBe(5.5);
    setBirthTimezone(resolveBirthTimezone({ date: '1943-06-15', location: 'Mumbai' }));
    expect(offsetForChart()).toBe(6.5);
  });
});

describe('calculateChartForBirth', () => {
  it('uses the resolved wartime offset, not flat IST', () => {
    setBirthTimezone(resolveBirthTimezone({ date: WARTIME.date, location: 'Mumbai' }));

    const wired = calculateChartForBirth(WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon);
    const flat = calculatePreciseChart(WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, 5.5);

    const ascendantDelta = separation(wired.ascendant.siderealLongitude, flat.ascendant.siderealLongitude);
    expect(ascendantDelta, 'one hour of offset should move the ascendant by roughly 15 degrees')
      .toBeGreaterThan(10);
  });

  it('lets an explicit offset override the store', () => {
    setBirthTimezone(resolveBirthTimezone({ date: WARTIME.date, location: 'Mumbai' }));

    const explicit = calculateChartForBirth(WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, 5.5);
    const flat = calculatePreciseChart(WARTIME.date, WARTIME.time, WARTIME.lat, WARTIME.lon, 5.5);

    expect(explicit.julianDay).toBeCloseTo(flat.julianDay, 9);
    expect(explicit.ayanamsa).toBeCloseTo(flat.ayanamsa, 9);
  });

  it('is identical to the engine call when the store agrees', () => {
    setBirthTimezone(resolveBirthTimezone({ date: '2000-10-26', location: 'Indore' }));

    const wired = calculateChartForBirth('2000-10-26', '00:50', 22.72, 75.86);
    const direct = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);

    expect(wired.julianDay).toBeCloseTo(direct.julianDay, 9);
    expect(wired.ayanamsa).toBeCloseTo(direct.ayanamsa, 9);
    expect(wired.ascendant.rashiIndex).toBe(direct.ascendant.rashiIndex);
  });
});
