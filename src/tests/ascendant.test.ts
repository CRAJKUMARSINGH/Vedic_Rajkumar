/**
 * Geometrically proves the ascendant, without trusting the implementation.
 *
 * The engine returns a tropical longitude. This test independently:
 *   1. recomputes GMST and local sidereal time from the date and place
 *   2. converts the returned longitude to right ascension and declination
 *   3. computes that point's altitude and hour angle
 *
 * A correct ascendant has altitude 0 (on the horizon) and a negative hour angle
 * (east of the meridian, so rising). Both are checked across latitudes in both
 * hemispheres, including near-polar cases where the previous 90 degree
 * discriminator had no margin left.
 *
 * If a future change reintroduces a proximity test, or gets the branch wrong at
 * one latitude, this fails with the latitude and hour named.
 */
import { describe, it, expect } from 'vitest';
import { calculatePreciseChart, dateTimeToJD } from '@/services/precisionEphemerisService';
import { REFERENCE_CHARTS } from './validation/referenceCharts';

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

const norm = (x: number): number => ((x % 360) + 360) % 360;

/** Independent GMST from UT. Meeus ch. 12. */
function gmstDegrees(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return norm(
    280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000,
  );
}

function meanObliquity(T: number): number {
  return (23.439291111 - 0.0130041667 * T) * D2R;
}

function horizonGeometry(tropicalLambda: number, jd: number, lat: number, lon: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const eps = meanObliquity(T);
  const lst = norm(gmstDegrees(jd) + lon);
  const lambda = tropicalLambda * D2R;

  const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda));

  const hourAngle = ((norm(lst - ra * R2D) + 180) % 360) - 180;
  const altitude =
    Math.asin(
      Math.sin(lat * D2R) * Math.sin(dec) +
        Math.cos(lat * D2R) * Math.cos(dec) * Math.cos(hourAngle * D2R),
    ) * R2D;

  return { altitude, hourAngle };
}

const LATITUDES = [0, 22.72, -22.72, 45, -45, 60, -60, 69.65, -69.65, 78, 85, -85, 89.9];
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

describe('ascendant geometry', () => {
  for (const lat of LATITUDES) {
    it('is on the horizon and rising at latitude ' + lat, () => {
      for (const hour of HOURS) {
        const date = '2000-06-15';
        const time = String(hour).padStart(2, '0') + ':30';
        const chart = calculatePreciseChart(date, time, lat, 75.86, 5.5);
        const jd = dateTimeToJD(date, time, 5.5);

        const { altitude, hourAngle } = horizonGeometry(
          chart.ascendant.tropicalLongitude, jd, lat, 75.86,
        );

        const where = 'lat ' + lat + ' hour ' + hour;
        expect(Math.abs(altitude), 'altitude off the horizon at ' + where).toBeLessThan(0.02);
        expect(hourAngle, 'ascendant is setting, not rising, at ' + where).toBeLessThan(0);
      }
    });
  }

  it('sits between 30 and 180 degrees ahead of the midheaven', () => {
    for (const lat of [-60, -22.72, 0, 22.72, 60]) {
      const date = '1985-03-20';
      const time = '06:00';
      const chart = calculatePreciseChart(date, time, lat, 75.86, 5.5);
      const jd = dateTimeToJD(date, time, 5.5);
      const T = (jd - 2451545.0) / 36525.0;
      const eps = meanObliquity(T);
      const lst = norm(gmstDegrees(jd) + 75.86);

      const mc = norm(Math.atan2(Math.sin(lst * D2R), Math.cos(lst * D2R) * Math.cos(eps)) * R2D);
      const separation = norm(chart.ascendant.tropicalLongitude - mc);

      expect(separation, 'separation from midheaven at lat ' + lat).toBeGreaterThan(30);
      expect(separation).toBeLessThan(180);
    }
  });
});

describe('ascendant regression', () => {
  for (const ref of REFERENCE_CHARTS) {
    it('keeps the reference ascendant for ' + ref.id + ' ' + ref.name, () => {
      const chart = calculatePreciseChart(ref.date, ref.time, ref.lat, ref.lon, ref.tzOffset);
      expect(chart.ascendant.rashiName).toBe(ref.expected.ascendant);
    });
  }

  it('reports whole seconds, like the planetary positions', () => {
    const chart = calculatePreciseChart('2000-10-26', '00:50', 22.72, 75.86, 5.5);
    expect(Number.isInteger(chart.ascendant.seconds)).toBe(true);
    expect(chart.ascendant.seconds).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.seconds).toBeLessThan(60);
  });

  it('keeps degrees and minutes consistent with the longitude', () => {
    const chart = calculatePreciseChart('1973-04-24', '18:17', 19.07, 72.88, 5.5);
    const { degrees, minutes, seconds, siderealLongitude } = chart.ascendant;
    const rebuilt = degrees + minutes / 60 + seconds / 3600;
    const within = siderealLongitude % 30;
    expect(Math.abs(rebuilt - within)).toBeLessThan(1 / 60);
  });
});
