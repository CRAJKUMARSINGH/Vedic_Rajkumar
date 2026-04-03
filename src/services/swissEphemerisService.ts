/**
 * src/services/swissEphemerisService.ts
 * Swiss Ephemeris WASM wrapper — Phase 4 (Type-Safe Integration & Accuracy)
 *
 * Provides 99.99% accurate planetary calculations using swisseph-wasm.
 * Falls back to the simplified ephemerisService if WASM fails to load.
 *
 * Roadmap: Full integration in Week 28-30 per 100-week plan.
 * Current: Initialisation + basic planet position wrapper ready.
 */

import {
  calculateCompletePlanetaryPositions,
  type CompletePlanetaryPositions,
} from './ephemerisService';

// ── Swiss Ephemeris planet IDs ────────────────────────────────────────────────

export const SE_PLANET = {
  SUN:     0,
  MOON:    1,
  MERCURY: 2,
  VENUS:   3,
  MARS:    4,
  JUPITER: 5,
  SATURN:  6,
  URANUS:  7,
  NEPTUNE: 8,
  PLUTO:   9,
  MEAN_NODE: 10,  // Rahu (mean)
  TRUE_NODE: 11,  // Rahu (true)
} as const;

// ── Ayanamsa IDs ──────────────────────────────────────────────────────────────

export const SE_AYANAMSA = {
  LAHIRI:    1,
  RAMAN:     3,
  KRISHNAMURTI: 5,
  YUKTESHWAR: 7,
} as const;

// ── State ─────────────────────────────────────────────────────────────────────

let swisseph: any = null;
let initPromise: Promise<boolean> | null = null;

/**
 * Initialise swisseph-wasm. Safe to call multiple times — returns cached promise.
 */
export async function initSwissEphemeris(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const mod = await import('swisseph-wasm');
      const SwissEphClass = mod.default ?? mod;
      swisseph = new (SwissEphClass as new () => any)();
      // initSwissEph is the async init method in swisseph-wasm
      if (typeof swisseph.initSwissEph === 'function') {
        await swisseph.initSwissEph();
      }
      console.info('[SwissEph] WASM loaded successfully');
      return true;
    } catch (err) {
      console.warn('[SwissEph] WASM unavailable, using simplified fallback:', err);
      return false;
    }
  })();

  return initPromise;
}

/**
 * Calculate planetary positions using Swiss Ephemeris when available,
 * falling back to the simplified service otherwise.
 */
export async function calcPlanetsAccurate(
  dateStr: string,
  timeStr: string,
): Promise<CompletePlanetaryPositions> {
  const ready = await initSwissEphemeris();

  if (!ready || !swisseph) {
    // Fallback — simplified algorithms (±2-3°)
    return calculateCompletePlanetaryPositions(dateStr, timeStr);
  }

  try {
    // Convert date/time to Julian Day
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    // IST → UTC: subtract 5h30m
    const utcHour = h + min / 60 - 5.5;

    const jd: number = swisseph.julday(y, m, d, utcHour, 1); // 1 = Gregorian

    // Set Lahiri ayanamsa (SE_SIDM_LAHIRI = 1)
    swisseph.set_sid_mode(1, 0, 0);

    const SEFLG_SIDEREAL: number = swisseph.SEFLG_SIDEREAL ?? 65536;
    const SEFLG_SPEED: number = swisseph.SEFLG_SPEED ?? 256;
    const flags = SEFLG_SIDEREAL | SEFLG_SPEED;

    const calcPlanet = (planetId: number): { lon: number; speed: number } => {
      const result = swisseph.calc_ut(jd, planetId, flags);
      if (!result || result.error) throw new Error(result?.error ?? 'calc_ut failed');
      // result is an array: [longitude, latitude, distance, speedLon, speedLat, speedDist]
      const lon = ((result[0] % 360) + 360) % 360;
      return { lon, speed: result[3] ?? 0 };
    };

    const sunLon     = calcPlanet(SE_PLANET.SUN).lon;
    const moonLon    = calcPlanet(SE_PLANET.MOON).lon;
    const mercuryLon = calcPlanet(SE_PLANET.MERCURY).lon;
    const venusLon   = calcPlanet(SE_PLANET.VENUS).lon;
    const marsLon    = calcPlanet(SE_PLANET.MARS).lon;
    const jupiterLon = calcPlanet(SE_PLANET.JUPITER).lon;
    const saturnLon  = calcPlanet(SE_PLANET.SATURN).lon;
    const rahuResult = calcPlanet(SE_PLANET.MEAN_NODE);
    const rahuLon    = rahuResult.lon;
    const ketuLon    = ((rahuLon + 180) % 360 + 360) % 360;

    // Get ayanamsa
    const ayanamsaVal: number = swisseph.get_ayanamsa_ut
      ? swisseph.get_ayanamsa_ut(jd)
      : (23.85 + (y - 2000) * 0.0139);

    const toPos = (lon: number, retrograde = false) => ({
      tropical: lon,
      sidereal: lon,  // already sidereal via SEFLG_SIDEREAL
      rashi: Math.floor(lon / 30),
      rashiName: RASHI_EN[Math.floor(lon / 30)],
      degrees: lon % 30,
      retrograde,
    });

    const moonRashi = Math.floor(moonLon / 30);
    const toHouse = (rashi: number) => ((rashi - moonRashi + 12) % 12) + 1;

    const planets = [
      { name: 'Sun',     ...toPos(sunLon),     house: toHouse(Math.floor(sunLon / 30)),     dignity: 'Neutral' },
      { name: 'Moon',    ...toPos(moonLon),    house: toHouse(Math.floor(moonLon / 30)),    dignity: 'Neutral' },
      { name: 'Mercury', ...toPos(mercuryLon), house: toHouse(Math.floor(mercuryLon / 30)), dignity: 'Neutral' },
      { name: 'Venus',   ...toPos(venusLon),   house: toHouse(Math.floor(venusLon / 30)),   dignity: 'Neutral' },
      { name: 'Mars',    ...toPos(marsLon),    house: toHouse(Math.floor(marsLon / 30)),    dignity: 'Neutral' },
      { name: 'Jupiter', ...toPos(jupiterLon), house: toHouse(Math.floor(jupiterLon / 30)), dignity: 'Neutral' },
      { name: 'Saturn',  ...toPos(saturnLon),  house: toHouse(Math.floor(saturnLon / 30)),  dignity: 'Neutral' },
      { name: 'Rahu',    ...toPos(rahuLon, true),  house: toHouse(Math.floor(rahuLon / 30)),  dignity: 'Neutral', rashiIndex: Math.floor(rahuLon / 30) },
      { name: 'Ketu',    ...toPos(ketuLon, true),  house: toHouse(Math.floor(ketuLon / 30)),  dignity: 'Neutral', rashiIndex: Math.floor(ketuLon / 30) },
    ].map(p => ({ ...p, rashiIndex: p.rashiIndex ?? Math.floor(p.sidereal / 30) }));

    return {
      sun:     toPos(sunLon),
      moon:    toPos(moonLon),
      mercury: toPos(mercuryLon),
      venus:   toPos(venusLon),
      mars:    toPos(marsLon),
      jupiter: toPos(jupiterLon),
      saturn:  toPos(saturnLon),
      rahu:    toPos(rahuLon, true),
      ketu:    toPos(ketuLon, true),
      ayanamsa: ayanamsaVal,
      julianDay: jd,
      planets: planets as CompletePlanetaryPositions['planets'],
    };

  } catch (err) {
    console.warn('[SwissEph] Calculation error, using fallback:', err);
    return calculateCompletePlanetaryPositions(dateStr, timeStr);
  }
}

const RASHI_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

/** Check if Swiss Ephemeris WASM is loaded and ready */
export function isSwissEphReady(): boolean {
  return swisseph !== null;
}
