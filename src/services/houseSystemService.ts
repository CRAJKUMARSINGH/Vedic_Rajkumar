/**
 * House System Calculations (Week 4 — initial implementation).
 * Whole-sign by default.
 * Placidus is APPROXIMATE; upgrade path → Swiss Ephemeris swe_houses later (Week 0+).
 */

import type { HouseCusp, Sign, Planet, HouseSystem } from '@/features/kundli/types';

export interface AscendantResult {
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  degreeInSign: number;
  gmstDeg: number;
  lstDeg: number;
}

const SIGNS: Sign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_LORDS: Planet[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

function toRad(d: number): number { return d * Math.PI / 180; }
function toDeg(r: number): number { return r * 180 / Math.PI; }
function normalize360(d: number): number { return ((d % 360) + 360) % 360; }

function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000.0;
  return normalize360(gmst);
}

function getObliquityEps(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const epsArcsec = 23 * 3600 + 26 * 60 + 21.448
    - 46.8150 * T
    - 0.00059 * T * T
    + 0.001813 * T * T * T;
  return epsArcsec / 3600;
}

export function calculateAscendant(
  jd: number,
  lat: number,
  lon: number,
  ayanamsaValue: number,
): AscendantResult {
  const gmstDeg = getGMST(jd);
  const lstDeg = normalize360(gmstDeg + lon);

  const epsRad = toRad(getObliquityEps(jd));
  const lstRad = toRad(lstDeg);
  const latRad = toRad(lat);

  // Meeus Ch.13: tan(Asc) = cos(RAMC) / -(sin(RAMC)·cos ε + tan φ·sin ε).
  // The negated form returns the descendant (180° off) — verified against
  // Swiss Ephemeris houses_ex; see src/tests/ascendantProof.test.ts.
  const numerator = Math.cos(lstRad);
  const denominator = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  let ascTrop = toDeg(Math.atan2(numerator, denominator));
  ascTrop = normalize360(ascTrop);

  const ascSid = normalize360(ascTrop - ayanamsaValue);
  const rashiIndex = Math.floor(ascSid / 30);
  const degreeInSign = ascSid % 30;

  return {
    tropicalLongitude: ascTrop,
    siderealLongitude: ascSid,
    rashiIndex,
    degreeInSign,
    gmstDeg,
    lstDeg,
  };
}

function calculateMC(jd: number, lat: number, lon: number): number {
  const gmstDeg = getGMST(jd);
  const lstDeg = normalize360(gmstDeg + lon);
  const epsRad = toRad(getObliquityEps(jd));
  const lstRad = toRad(lstDeg);

  const mcTrop = toDeg(Math.atan2(
    -Math.sin(lstRad),
    Math.cos(lstRad) / Math.cos(epsRad),
  ));
  return normalize360(mcTrop);
}

function buildHouseCusp(houseNum: number, siderealDeg: number): HouseCusp {
  const signIndex = Math.floor(siderealDeg / 30) % 12;
  return {
    house: houseNum,
    longitude: siderealDeg,
    sign: SIGNS[signIndex],
    lord: SIGN_LORDS[signIndex],
  };
}

export function calculateWholeSignHouses(
  lagnaSidDeg: number,
  ayanamsaValue: number,
): HouseCusp[] {
  const lagnaRashiIndex = Math.floor(normalize360(lagnaSidDeg) / 30);
  const houses: HouseCusp[] = [];

  for (let i = 0; i < 12; i++) {
    const houseRashiIndex = (lagnaRashiIndex + i) % 12;
    const houseSidDeg = houseRashiIndex * 30;
    houses.push(buildHouseCusp(i + 1, houseSidDeg));
  }

  return houses;
}

export function calculateEqualHouses(
  ascendantSidDeg: number,
  ayanamsaValue: number,
): HouseCusp[] {
  const ascSid = normalize360(ascendantSidDeg);
  const houses: HouseCusp[] = [];

  for (let i = 0; i < 12; i++) {
    const cuspSid = normalize360(ascSid + i * 30);
    houses.push(buildHouseCusp(i + 1, cuspSid));
  }

  return houses;
}

export function calculatePlacidusHouses(
  jd: number,
  lat: number,
  lon: number,
  ayanamsaValue: number,
): HouseCusp[] {
  if (Math.abs(lat) > 66 || !isFinite(jd) || jd <= 0) {
    const asc = calculateAscendant(jd, lat, lon, ayanamsaValue);
    return calculateEqualHouses(asc.siderealLongitude, ayanamsaValue);
  }

  const asc = calculateAscendant(jd, lat, lon, ayanamsaValue);
  const ascTrop = asc.tropicalLongitude;
  const mcTrop = calculateMC(jd, lat, lon);

  const dscTrop = normalize360(ascTrop + 180);
  const icTrop = normalize360(mcTrop + 180);

  const latRad = toRad(lat);
  const epsRad = toRad(getObliquityEps(jd));

  function trisectCusp(
    startTrop: number,
    endTrop: number,
    fraction: number,
    mcOrIcTrop: number,
  ): number {
    let delta = endTrop - startTrop;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    const step = delta / 3;
    return normalize360(startTrop + step * fraction);
  }

  const cusp11Trop = trisectCusp(mcTrop, ascTrop, 1, mcTrop);
  const cusp12Trop = trisectCusp(mcTrop, ascTrop, 2, mcTrop);
  const cusp2Trop = trisectCusp(ascTrop, icTrop, 1, icTrop);
  const cusp3Trop = trisectCusp(ascTrop, icTrop, 2, icTrop);

  const cuspsTrop: number[] = [
    ascTrop,
    cusp2Trop,
    cusp3Trop,
    icTrop,
    normalize360(cusp12Trop + 180),
    normalize360(cusp11Trop + 180),
    dscTrop,
    normalize360(cusp2Trop + 180),
    normalize360(cusp3Trop + 180),
    mcTrop,
    cusp11Trop,
    cusp12Trop,
  ];

  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const cuspSid = normalize360(cuspsTrop[i] - ayanamsaValue);
    houses.push(buildHouseCusp(i + 1, cuspSid));
  }

  let valid = true;
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    let diff = houses[next].longitude - houses[i].longitude;
    if (diff < 0) diff += 360;
    if (diff <= 0 || diff >= 60) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    return calculateEqualHouses(asc.siderealLongitude, ayanamsaValue);
  }

  return houses;
}

export function calculateHouseSystem(
  kind: HouseSystem,
  jd: number,
  lat: number,
  lon: number,
  ayanamsaValue: number,
  ascendantSidDeg?: number,
): HouseCusp[] {
  const ascSid = ascendantSidDeg ?? calculateAscendant(jd, lat, lon, ayanamsaValue).siderealLongitude;

  switch (kind) {
    case 'whole-sign':
      return calculateWholeSignHouses(ascSid, ayanamsaValue);
    case 'equal':
      return calculateEqualHouses(ascSid, ayanamsaValue);
    case 'placidus':
      return calculatePlacidusHouses(jd, lat, lon, ayanamsaValue);
    case 'koch':
      return calculateEqualHouses(ascSid, ayanamsaValue);
    default:
      return calculateWholeSignHouses(ascSid, ayanamsaValue);
  }
}

// ─── Bhava Chalit (cusp-based house placement) ────────────────────────────────

/**
 * Return the Bhava Chalit house number [1–12] for a sidereal longitude, given
 * the 12 ordered house cusps.
 *
 * Bhava Chalit differs from the Rashi (whole-sign) chart: a planet's *sign* may
 * stay the same while its *house* shifts, because houses are bounded by the
 * actual cusps rather than by sign boundaries. A planet is placed in the house
 * whose cusp-to-next-cusp arc contains it. Works for any cusp scheme
 * (whole-sign, equal, Placidus).
 */
export function getBhavaChalitHouse(
  planetSiderealDeg: number,
  cusps: HouseCusp[],
): number {
  if (cusps.length !== 12) {
    throw new Error('getBhavaChalitHouse: expected exactly 12 cusps');
  }
  const lon = normalize360(planetSiderealDeg);

  for (let i = 0; i < 12; i++) {
    const start = normalize360(cusps[i].longitude);
    const end = normalize360(cusps[(i + 1) % 12].longitude);
    const arc = normalize360(end - start);
    const offset = normalize360(lon - start);
    if (offset < arc) return cusps[i].house;
  }

  // Numerically unreachable for a well-formed cusp set (arcs sum to 360°),
  // but keeps the contract total if a degenerate cusp set is passed.
  return cusps[0].house;
}

/**
 * Map an array of planet sidereal longitudes to their Bhava Chalit houses.
 * Index order of the result matches the input order.
 */
export function calculateBhavaChalit(
  planetSiderealDeg: number[],
  cusps: HouseCusp[],
): number[] {
  return planetSiderealDeg.map(lon => getBhavaChalitHouse(lon, cusps));
}
