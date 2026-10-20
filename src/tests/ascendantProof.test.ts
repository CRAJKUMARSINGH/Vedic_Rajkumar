/**
 * ascendantProof.test.ts — the ascendant, proved from outside the engines.
 *
 * Every ascendant implementation in this repo is checked against two
 * independent authorities:
 *
 *   1. The definition.  The ascendant is the ecliptic degree crossing the
 *      eastern horizon, i.e. the longitude λ where altitude(λ) = 0 with the
 *      hour angle H = LST − α(λ) negative (east of the meridian).  The test
 *      brute-forces that root from GMST + obliquity, with no engine code.
 *
 *   2. Swiss Ephemeris (swisseph-wasm), houses_ex in Lahiri sidereal mode.
 *
 * History: a negated atan2 convention (y = −cos RAMC, x = +[…]) makes every
 * ascendant come out 180° off — the descendant — for every latitude.  It was
 * live in features/kundli/engine.ts, houseSystemService.ts and
 * lib/mtss/vedicEngine.ts; the corpus gate only compared the *precision*
 * engine, so nothing caught it.  The quadrant assertions below exist so that
 * a re-introduction fails here instead of on the user's Lagna.
 */
import { describe, it, expect } from 'vitest';
import SwissEph from 'swisseph-wasm';
import { dateTimeToJD, calculatePreciseChart } from '@/services/precisionEphemerisService';
import { calculateAscendant as houseSvcAscendant } from '@/services/houseSystemService';
import { calcAscendant as mtssAscendant } from '@/lib/mtss/vedicEngine';
import { calculateChart as kundliEngineChart } from '@/features/kundli/engine';

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const norm360 = (d: number) => ((d % 360) + 360) % 360;
const arcsec = (a: number, b: number) => {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d) * 3600;
};

const SEFLG_SIDEREAL = 0x10000;
const SIDM_LAHIRI = 1;

interface Fixture {
  id: string;
  date: string;
  time: string;
  tz: string;
  offsetHours: number;
  lat: number;
  lon: number;
}

const FIXTURES: Fixture[] = [
  { id: 'IST-morning', date: '1990-05-15', time: '10:30', tz: 'Asia/Kolkata', offsetHours: 5.5, lat: 28.61, lon: 77.23 },
  { id: 'IST-noon', date: '2000-06-15', time: '12:00', tz: 'Asia/Kolkata', offsetHours: 5.5, lat: 28.61, lon: 77.23 },
  { id: 'IST-pre-dawn', date: '1975-11-02', time: '04:15', tz: 'Asia/Kolkata', offsetHours: 5.5, lat: 19.07, lon: 72.87 },
  { id: 'London-evening', date: '2010-02-20', time: '18:45', tz: 'Europe/London', offsetHours: 0, lat: 51.48, lon: 0.0 },
  { id: 'equator', date: '1988-08-08', time: '08:08', tz: 'Asia/Kolkata', offsetHours: 5.5, lat: 0.0, lon: 72.0 },
  { id: 'high-latitude', date: '1965-12-21', time: '15:00', tz: 'Europe/London', offsetHours: 0, lat: 64.0, lon: -21.9 },
];

function gmstDeg(jdUT: number): number {
  const T = (jdUT - 2451545.0) / 36525.0;
  return norm360(
    280.46061837 + 360.98564736629 * (jdUT - 2451545.0) +
    0.000387933 * T * T - (T * T * T) / 38710000,
  );
}

function obliquityDeg(jdUT: number): number {
  const T = (jdUT - 2451545.0) / 36525.0;
  return 23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T;
}

/**
 * Ecliptic longitude of the rising point, from the definition only.
 * Solves altitude(λ) = 0 and keeps the root east of the meridian (H < 0).
 */
function ascendantFromDefinition(jdUT: number, lat: number, lon: number): number {
  const lst = norm360(gmstDeg(jdUT) + lon);
  const eps = obliquityDeg(jdUT) * D2R;
  const phi = lat * D2R;

  const hourAngle = (lambdaDeg: number): number => {
    const ra = Math.atan2(Math.sin(lambdaDeg * D2R) * Math.cos(eps), Math.cos(lambdaDeg * D2R)) * R2D;
    return norm360(lst - ra + 180) - 180; // (−180, +180]; negative = east
  };
  const altitude = (lambdaDeg: number): number => {
    const dec = Math.asin(Math.sin(eps) * Math.sin(lambdaDeg * D2R));
    return Math.asin(
      Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle(lambdaDeg) * D2R),
    ) * R2D;
  };

  // The ecliptic meets the horizon at exactly two antipodal points: the
  // ascendant (east, H < 0) and the descendant (west, H > 0).  The crossing
  // direction in λ is irrelevant — the H < 0 filter alone selects the east
  // root.  (Requiring an upward crossing finds nothing: on this ecliptic the
  // rising point is a downward λ-crossing.)
  for (let lam = 0; lam < 360; lam += 0.0005) {
    const a0 = altitude(lam);
    const a1 = altitude(lam + 0.0005);
    if (a0 * a1 < 0 && hourAngle(lam) < 0) {
      const frac = Math.abs(a0) / (Math.abs(a0) + Math.abs(a1));
      return norm360(lam + 0.0005 * frac);
    }
  }
  throw new Error(`no rising root found at jd=${jdUT} lat=${lat}`);
}

const enginesTropical = (f: Fixture): Record<string, number> => {
  const jdUT = dateTimeToJD(f.date, f.time, f.offsetHours);
  const precise = calculatePreciseChart(f.date, f.time, f.lat, f.lon, f.offsetHours);
  const kundli = kundliEngineChart({
    name: 'native', date: f.date, time: f.time, timezone: f.tz,
    latitude: f.lat, longitude: f.lon, place: 'test',
  });
  const kundliAsc = kundli.planets.find((p) => p.planet === 'Ascendant')!;

  return {
    precision: precise.ascendant.tropicalLongitude,
    kundli: kundliAsc.tropicalLongitude,
    houseSystemService: houseSvcAscendant(jdUT, f.lat, f.lon, precise.ayanamsa).tropicalLongitude,
    mtss: mtssAscendant(jdUT, f.lat, f.lon),
  };
};

describe('ascendant — proved from the definition (rising root of the ecliptic)', () => {
  for (const f of FIXTURES) {
    it(`${f.id}: every engine matches the bruted-forced rising point`, () => {
      const jdUT = dateTimeToJD(f.date, f.time, f.offsetHours);
      const definition = ascendantFromDefinition(jdUT, f.lat, f.lon);

      for (const [name, value] of Object.entries(enginesTropical(f))) {
        expect(arcsec(value, definition), `${name} ascendant vs definition`).toBeLessThan(30);
      }
    });

    it(`${f.id}: no engine returns the descendant`, () => {
      const jdUT = dateTimeToJD(f.date, f.time, f.offsetHours);
      const definition = ascendantFromDefinition(jdUT, f.lat, f.lon);

      for (const [name, value] of Object.entries(enginesTropical(f))) {
        expect(arcsec(value, definition + 180), `${name} is 180° off`).toBeGreaterThan(179 * 3600);
      }
    });
  }
});

describe('ascendant — formats like every other position', () => {
  it('reports whole arcseconds in range', () => {
    const a = calculatePreciseChart('2000-06-15', '12:00', 28.61, 77.23, 5.5).ascendant;
    expect(Number.isInteger(a.seconds)).toBe(true);
    expect(a.seconds).toBeGreaterThanOrEqual(0);
    expect(a.seconds).toBeLessThan(60);
    expect(Number.isInteger(a.minutes)).toBe(true);
    expect(a.minutes).toBeGreaterThanOrEqual(0);
    expect(a.minutes).toBeLessThan(60);
  });
});

describe('ascendant — agreed with Swiss Ephemeris (Lahiri sidereal)', () => {
  it('all engines stay within 30 arcsec of houses_ex', async () => {
    const swe = new SwissEph();
    await swe.initSwissEph();
    swe.set_sid_mode(SIDM_LAHIRI, 0, 0);

    for (const f of FIXTURES) {
      const jdUT = dateTimeToJD(f.date, f.time, f.offsetHours);
      const houses = swe.houses_ex(jdUT, SEFLG_SIDEREAL, f.lat, f.lon, 'E') as { ascmc: Float64Array };
      const swissSidereal = norm360(houses.ascmc[0]);

      const precise = calculatePreciseChart(f.date, f.time, f.lat, f.lon, f.offsetHours);
      const kundli = kundliEngineChart({
        name: 'native', date: f.date, time: f.time, timezone: f.tz,
        latitude: f.lat, longitude: f.lon, place: 'test',
      });
      const kundliSidereal = kundli.planets.find((p) => p.planet === 'Ascendant')!.siderealLongitude;
      const houseSvcTropical = houseSvcAscendant(jdUT, f.lat, f.lon, precise.ayanamsa).tropicalLongitude;

      expect(arcsec(precise.ascendant.siderealLongitude, swissSidereal), `${f.id} precision`).toBeLessThan(30);
      expect(arcsec(kundliSidereal, swissSidereal), `${f.id} kundli engine`).toBeLessThan(30);
      expect(
        arcsec(houseSvcTropical - precise.ayanamsa, swissSidereal),
        `${f.id} houseSystemService`,
      ).toBeLessThan(30);
      expect(
        arcsec(mtssAscendant(jdUT, f.lat, f.lon) - precise.ayanamsa, swissSidereal),
        `${f.id} mtss`,
      ).toBeLessThan(30);
    }
  });
});
