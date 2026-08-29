/**
 * ============================================================
 * KUNDLI CALCULATION STUBS
 * ============================================================
 *
 * These stubs stand in for the real Swiss Ephemeris engine until
 * Week 4, when the actual calculations are implemented.
 *
 * CONTRACT GUARANTEES these stubs satisfy:
 *   - Return value shapes match types.ts exactly (TypeScript enforced)
 *   - All required fields are present and non-null
 *   - Numeric ranges are realistic (longitudes 0–360, houses 1–12, etc.)
 *   - Clearly labelled STUB so no UI code accidentally relies on the values
 *
 * HOW TO REPLACE (Week 4):
 *   1. Install / load swiss-ephemeris WASM (swisseph-wasm@0.1.0)
 *   2. Implement real calculateChart() using swe_calc_ut
 *   3. Implement real calculateVimshottariDasha() from Moon nakshatra balance
 *   4. Delete or empty this file; export real functions from engine.ts
 *   5. Update index.ts barrel to re-export from engine.ts
 *
 * TESTING REQUIREMENT (Week 4):
 *   The real engine must match Jagannatha Hora within 1 arcminute
 *   for the test birth data supplied in src/tests/kundli/testCases.ts
 * ============================================================
 */

import type {
  BirthData,
  ChartResult,
  DashaResult,
  PlanetPosition,
  HouseCusp,
  Planet,
  Sign,
  Nakshatra,
  Pada,
  AyanamsaType,
  HouseSystem,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIGNS: Sign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS: Nakshatra[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
  'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

/** Nakshatra lords in Vimshottari order (repeating). */
const NAKSHATRA_LORDS: Planet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

/** Vimshottari dasha years per planet. */
const DASHA_YEARS: Record<Planet, number> = {
  Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
  Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20, Ascendant: 0,
};

/** Sign lords (traditional Vedic). */
const SIGN_LORDS: Record<Sign, Planet> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

function signFromLongitude(lon: number): Sign {
  return SIGNS[Math.floor(lon / 30) % 12];
}

function nakshatraFromLongitude(lon: number): { nakshatra: Nakshatra; index: number; pada: Pada; lord: Planet } {
  const idx = Math.floor(lon / (360 / 27));
  const nakshatra = NAKSHATRAS[idx % 27];
  const posInNak = lon % (360 / 27);
  const pada = (Math.floor(posInNak / ((360 / 27) / 4)) + 1) as Pada;
  const lord = NAKSHATRA_LORDS[idx % 9];
  return { nakshatra, index: idx + 1, pada, lord };
}

function navamshaSign(lon: number): Sign {
  // Each navamsha = 360/108 = 3.333° ; 108 navamshas total
  const navIdx = Math.floor(lon / (360 / 108));
  return SIGNS[navIdx % 12];
}

function addYears(isoDate: string, years: number): string {
  const d = new Date(isoDate);
  d.setFullYear(d.getFullYear() + Math.floor(years));
  const months = (years % 1) * 12;
  d.setMonth(d.getMonth() + Math.floor(months));
  return d.toISOString().split('T')[0];
}

// ─── Stub planetary data (representative positions, NOT real ephem values) ───

/**
 * Stub planetary longitudes (sidereal, Lahiri).
 * These are illustrative values only — NOT calculated from BirthData.
 * Replace entirely in Week 4 with real Swiss Ephemeris output.
 */
const STUB_SIDEREAL_LONGITUDES: Record<Planet, number> = {
  Sun:       149.5,   // Leo ~29°
  Moon:       96.3,   // Cancer ~6°
  Mars:       62.8,   // Gemini ~2°
  Mercury:   165.2,   // Virgo ~15°
  Jupiter:   108.4,   // Cancer ~18°
  Venus:     130.7,   // Leo ~10°
  Saturn:    303.1,   // Aquarius ~3°
  Rahu:      340.6,   // Pisces ~10°
  Ketu:      160.6,   // Virgo ~10° (Rahu + 180)
  Ascendant: 225.0,   // Scorpio ~15°
};

// ─── Public stubs ─────────────────────────────────────────────────────────────

/**
 * STUB: calculateChart
 *
 * Returns a structurally complete ChartResult with placeholder values.
 * The ayanamsaValue is a realistic Lahiri approximation for 1963 (~23.3°).
 * All planets use fixed longitudes — not derived from BirthData.
 *
 * @param birthData   Birth input (accepted but not used for calculation).
 * @param ayanamsa    Defaults to 'lahiri'.
 * @param houseSystem Defaults to 'whole-sign'.
 * @returns A valid ChartResult typed object with STUB values.
 */
export function calculateChart(
  birthData: BirthData,
  ayanamsa: AyanamsaType = 'lahiri',
  houseSystem: HouseSystem = 'whole-sign',
): ChartResult {
  const STUB_AYANAMSA = 23.32; // degrees — Lahiri ~1963 approx
  const lagnaLon = STUB_SIDEREAL_LONGITUDES.Ascendant;
  const lagnaSign = signFromLongitude(lagnaLon);
  const lagnaSignIdx = SIGNS.indexOf(lagnaSign);

  // Build planetary positions
  const planetOrder: Planet[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
    'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant',
  ];

  const planets: PlanetPosition[] = planetOrder.map(planet => {
    const siderealLon = STUB_SIDEREAL_LONGITUDES[planet];
    const tropicalLon = (siderealLon + STUB_AYANAMSA) % 360;
    const sign = signFromLongitude(siderealLon);
    const signIdx = SIGNS.indexOf(sign);
    const degreeInSign = siderealLon % 30;

    // Whole-sign house = count from lagna sign
    const house = ((signIdx - lagnaSignIdx + 12) % 12) + 1;

    const { nakshatra, pada, lord } = nakshatraFromLongitude(siderealLon);
    const nIdx = NAKSHATRAS.indexOf(nakshatra);

    return {
      planet,
      tropicalLongitude: tropicalLon,
      siderealLongitude: siderealLon,
      sign,
      degreeInSign,
      house,
      isRetrograde: planet === 'Rahu' || planet === 'Ketu' || planet === 'Saturn',
      nakshatraIndex: nIdx + 1,
      nakshatra,
      nakshatraLord: lord,
      pada,
      navamshaSign: navamshaSign(siderealLon),
    };
  });

  // Build 12 whole-sign houses
  const houses: HouseCusp[] = Array.from({ length: 12 }, (_, i) => {
    const houseSignIdx = (lagnaSignIdx + i) % 12;
    const sign = SIGNS[houseSignIdx];
    return {
      house: i + 1,
      longitude: houseSignIdx * 30,
      sign,
      lord: SIGN_LORDS[sign],
    };
  });

  return {
    birthData,
    ayanamsa,
    ayanamsaValue: STUB_AYANAMSA,
    houseSystem,
    planets,
    houses,
    julianDay: 2438291.47, // STUB: 1963-09-15 06:00 IST
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * STUB: calculateVimshottariDasha
 *
 * Generates a syntactically correct Vimshottari Dasha sequence.
 * The seed planet is derived from the Moon nakshatra in the stub chart,
 * giving consistent (though not astronomically accurate) output.
 *
 * Includes Mahadasha level with Antardasha sub-periods.
 * Pratyantardasha (sub-sub-periods) are NOT generated here — Week 4.
 *
 * @param chart   ChartResult from calculateChart.
 * @returns A DashaResult with the full 120-year Mahadasha sequence.
 */
export function calculateVimshottariDasha(chart: ChartResult): DashaResult {
  const moonPos = chart.planets.find(p => p.planet === 'Moon')!;

  // Stub: use Moon's nakshatra index to determine seed planet
  const seedLordIdx = (moonPos.nakshatraIndex - 1) % 9;
  const seedPlanet = NAKSHATRA_LORDS[seedLordIdx];

  // Balance remaining in birth Mahadasha (stub: use full period)
  const totalYears = DASHA_YEARS[seedPlanet];
  const balanceYears = totalYears * 0.6; // STUB: 60% balance — replace with exact calc

  const birthDate = chart.birthData.date; // YYYY-MM-DD
  const DASHA_ORDER: Planet[] = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
    'Rahu', 'Jupiter', 'Saturn', 'Mercury',
  ];

  // Start from seed planet in the Dasha sequence
  const seedIdx = DASHA_ORDER.indexOf(seedPlanet);
  const orderedPlanets = [
    ...DASHA_ORDER.slice(seedIdx),
    ...DASHA_ORDER.slice(0, seedIdx),
  ];

  let currentStart = birthDate;
  // First period: only the balance, not full years
  const periods = orderedPlanets.map((maha, i) => {
    const years = i === 0 ? balanceYears : DASHA_YEARS[maha];
    const start = currentStart;
    const end = addYears(start, years);
    currentStart = end;

    // Build Antardashas within this Mahadasha
    const subPeriods = buildAntardashas(maha, start, years, orderedPlanets, seedIdx);

    return {
      planet: maha,
      startDate: start,
      endDate: end,
      subPeriods,
    };
  });

  return {
    birthData: chart.birthData,
    moonNakshatra: moonPos.nakshatra,
    birthDashaBalance: {
      planet: seedPlanet,
      yearsRemaining: balanceYears,
    },
    periods,
  };
}

/** Build Antardasha sub-periods within one Mahadasha. */
function buildAntardashas(
  maha: Planet,
  mahaStart: string,
  mahaTotalYears: number,
  dashaOrder: Planet[],
  seedIdx: number,
): import('./types').DashaPeriod[] {
  // Antardasha order starts with the Mahadasha planet itself
  const mahaIdx = dashaOrder.indexOf(maha);
  const antarOrder: Planet[] = [
    ...dashaOrder.slice(mahaIdx),
    ...dashaOrder.slice(0, mahaIdx),
  ];

  const total120 = 120; // Total Vimshottari years
  let start = mahaStart;

  return antarOrder.map(antar => {
    // Antar years = (maha years × antar years) / 120
    const antarYears = (mahaTotalYears * DASHA_YEARS[antar]) / total120;
    const end = addYears(start, antarYears);
    const result = { planet: antar, startDate: start, endDate: end };
    start = end;
    return result;
  });
}
