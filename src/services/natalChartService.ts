/**
 * natalChartService.ts — the single typed `NatalChart` façade (N2 · Kundli).
 *
 * Why this exists:
 *   The app computed the natal map across several loose payloads
 *   (`CompletePlanetaryPositions`, `AscendantData`, `NakshatraInfo`, a separate
 *   houses array, a separate divisional result). Consumers had to re-assemble
 *   the same chart by hand and could disagree on a detail (dignity, house
 *   system, which longitude is sidereal).
 *
 *   `buildNatalChart()` composes ONE typed object from the shared Lahiri
 *   (sidereal) engine and fills the classical N2 fields that were previously
 *   missing or scattered:
 *     - Rashi + Nakshatra + Pada per planet
 *     - planetary dignity (exalt / debil / own / moolatrikona / friend / neutral)
 *     - combustion (classical Parashari orbs)
 *     - retrograde
 *     - 12 whole-sign bhavas AND the separate Bhava-Chalit placement
 *     - divisional charts D1 / D9 (Navamsha) / D10 (Dashamsha)
 *
 * Sidereal (Lahiri) only — this façade never exposes tropical longitudes.
 */

import { calculateChartForBirth } from './chartWithTimezone';
import { RASHI_NAMES_EN } from './precisionEphemerisService';
import { getPlanetDignity, getCombustionStatus } from './ephemerisService';
import { calculateEqualHouses, getBhavaChalitHouse } from './houseSystemService';
import { calculateNakshatra } from './nakshatraService';
import { calculateShodashVarga, getVargaChart } from './divisionalChartsService';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface NatalChartInput {
  /** Local calendar date YYYY-MM-DD. */
  date: string;
  /** Local clock time HH:MM. */
  time: string;
  latitude: number;
  longitude: number;
  /**
   * UTC offset in hours. Omit to use the resolved birth timezone (the module
   * store populated by the birth form) and fall back to IST when none is set.
   */
  timezoneOffsetHours?: number;
}

export interface NatalPlanet {
  name: string;
  /** Sidereal (nirayana) longitude in degrees [0, 360). */
  siderealLongitude: number;
  rashiIndex: number;
  rashiName: string;
  /** Degree within the sign [0, 30). */
  degrees: number;
  /** Whole-sign (rashi) house, 1–12. */
  house: number;
  /** Bhava-Chalit house, 1–12 (cusp-bounded, equal-bhava cusps from the Lagna). */
  bhavaChalitHouse: number;
  nakshatra: string;
  /** 1-based nakshatra number (1–27). */
  nakshatraIndex: number;
  nakshatraLord: string;
  pada: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  /** Classical combustion orb applied (degrees); 0 for the Sun and the nodes. */
  combustionOrb: number;
  /** Circular elongation from the Sun in degrees [0, 180]. */
  sunDistance: number;
  /** D9 — Navamsha rashi index (0–11). */
  navamshaRashiIndex: number;
  /** D10 — Dashamsha rashi index (0–11). */
  dashamshaRashiIndex: number;
}

export interface NatalHouse {
  house: number;
  rashiIndex: number;
  rashiName: string;
  /** Sidereal longitude of the whole-sign cusp (start of the rashi). */
  cuspLongitude: number;
  lord: string;
}

export interface NatalChart {
  input: NatalChartInput;
  julianDay: number;
  ayanamsa: number;
  ascendant: {
    rashiIndex: number;
    rashiName: string;
    siderealLongitude: number;
    degrees: number;
  };
  moonRashiIndex: number;
  planets: NatalPlanet[];
  houses: NatalHouse[];
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Build the canonical typed natal chart from the shared Lahiri engine.
 * Deterministic: identical input → identical output.
 */
export function buildNatalChart(input: NatalChartInput): NatalChart {
  const { date, time, latitude, longitude, timezoneOffsetHours } = input;
  const chart = calculateChartForBirth(date, time, latitude, longitude, timezoneOffsetHours);
  const ascSid = chart.ascendant.siderealLongitude;

  // Bhava-Chalit cusps: equal bhavas anchored on the exact Lagna degree, so a
  // planet near a sign boundary shifts house versus the whole-sign rashi chart.
  const chalitCusps = calculateEqualHouses(ascSid, chart.ayanamsa);

  // Divisional charts (D1/D9/D10) from the same sidereal longitudes.
  const longitudes = Object.fromEntries(
    chart.planets.map(p => [p.name, p.siderealLongitude]),
  );
  const varga = calculateShodashVarga(longitudes, ascSid);
  const d9 = getVargaChart(varga, 9);
  const d10 = getVargaChart(varga, 10);
  const d9ByPlanet = new Map((d9?.positions ?? []).map(p => [p.planet, p.vargaRashi]));
  const d10ByPlanet = new Map((d10?.positions ?? []).map(p => [p.planet, p.vargaRashi]));

  const sunLon = chart.planets.find(p => p.name === 'Sun')?.siderealLongitude ?? 0;

  const planets: NatalPlanet[] = chart.planets.map(p => {
    const nak = calculateNakshatra(p.siderealLongitude);
    const combust = getCombustionStatus(p.name, p.siderealLongitude, sunLon);
    return {
      name: p.name,
      siderealLongitude: p.siderealLongitude,
      rashiIndex: p.rashiIndex,
      rashiName: p.rashiName,
      degrees: p.degrees,
      house: p.house,
      bhavaChalitHouse: getBhavaChalitHouse(p.siderealLongitude, chalitCusps),
      nakshatra: nak.nameEn,
      nakshatraIndex: nak.nakshatra,
      nakshatraLord: nak.lord,
      pada: nak.pada,
      dignity: p.dignity ?? getPlanetDignity(p.name, p.rashiIndex),
      isRetrograde: p.isRetrograde,
      isCombust: combust.isCombust,
      combustionOrb: combust.orb,
      sunDistance: combust.sunDistance,
      navamshaRashiIndex: d9ByPlanet.get(p.name) ?? p.rashiIndex,
      dashamshaRashiIndex: d10ByPlanet.get(p.name) ?? p.rashiIndex,
    };
  });

  const houses: NatalHouse[] = chart.houses.map(h => ({
    house: h.house,
    rashiIndex: h.rashiIndex,
    rashiName: h.rashiName,
    cuspLongitude: h.rashiIndex * 30,
    lord: h.lord,
  }));

  return {
    input: { date, time, latitude, longitude, timezoneOffsetHours },
    julianDay: chart.julianDay,
    ayanamsa: chart.ayanamsa,
    ascendant: {
      rashiIndex: chart.ascendant.rashiIndex,
      rashiName: chart.ascendant.rashiName,
      siderealLongitude: ascSid,
      degrees: chart.ascendant.degrees,
    },
    moonRashiIndex: chart.moonRashiIndex,
    planets,
    houses,
  };
}

/** Human-readable rashi name for a 0-based index (Aries = 0). */
export function rashiNameOf(rashiIndex: number): string {
  return RASHI_NAMES_EN[((rashiIndex % 12) + 12) % 12];
}
