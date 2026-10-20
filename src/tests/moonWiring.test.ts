/**
 * Proves the engine's Moon now comes from moonSeries, and tells you exactly what
 * went wrong if it does not.
 *
 * Three failure modes are named rather than left as a bare mismatch:
 *   - still on the old series        (delta ~0.01-0.05 deg)
 *   - returning radians, not degrees (delta ~57x)
 *   - returning an object, not a number
 */
import { describe, it, expect } from 'vitest';
import { calculatePreciseChart, dateTimeToJD } from '@/services/precisionEphemerisService';
import { moonLongitudeTrue } from '@/services/moonSeries';

const CASES = [
  { date: '2000-10-26', time: '00:50', lat: 22.72, lon: 75.86, tz: 5.5 },
  { date: '1943-06-15', time: '04:27', lat: 19.076, lon: 72.8777, tz: 6.5 },
  { date: '1890-06-15', time: '04:27', lat: 19.076, lon: 72.8777, tz: 4.85 },
];

function separationDeg(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

describe('engine Moon is wired to moonSeries', () => {
  for (const c of CASES) {
    it('agrees within 1 arcsec on ' + c.date, () => {
      const chart = calculatePreciseChart(c.date, c.time, c.lat, c.lon, c.tz);
      const moon = chart.planets.find((p) => p.name === 'Moon');
      expect(moon, 'the chart has no Moon at all').toBeDefined();

      // dateTimeToJD returns a UT Julian Day, which is what moonSeries expects —
      // it applies delta-T itself. Deriving TT here as well would double-count.
      const jd = dateTimeToJD(c.date, c.time, c.tz);
      const seriesSidereal = (moonLongitudeTrue(jd) - chart.ayanamsa + 360) % 360;
      const deltaArcsec = separationDeg(moon!.siderealLongitude, seriesSidereal) * 3600;

      console.log(c.date + ' delta: ' + deltaArcsec.toFixed(3) + ' arcsec');

      expect(
        deltaArcsec,
        'engine Moon does not match moonSeries. If the delta is 0.01-0.05 deg the ' +
          'old truncated series is still in place; if it is ~57x, the new function is ' +
          'returning radians; if the chart has no Moon, the delegation returned the ' +
          'wrong shape. See docs/MOON_ACCURACY.md.',
      ).toBeLessThan(1);
    });
  }

  it('reports whole arcseconds, like every other body', () => {
    const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    expect(Number.isInteger(moon.seconds)).toBe(true);
    expect(moon.seconds).toBeGreaterThanOrEqual(0);
    expect(moon.seconds).toBeLessThan(60);
  });
});
