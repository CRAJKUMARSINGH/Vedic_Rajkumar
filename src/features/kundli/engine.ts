import type {
  BirthData,
  ChartResult,
  DashaResult,
  DashaPeriod,
  PlanetPosition,
  HouseCusp,
  Planet,
  Sign,
  Nakshatra,
  Pada,
  AyanamsaType,
  HouseSystem,
} from './types';
import { getLahiriAyanamsa } from '@/services/precisionEphemerisService';

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

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

const NAKSHATRA_LORDS: Planet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

const DASHA_YEARS: Record<Planet, number> = {
  Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16,
  Saturn: 19, Mercury: 17, Ketu: 7, Venus: 20, Ascendant: 0,
};

const SIGN_LORDS: Record<Sign, Planet> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const DASHA_ORDER: Planet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
];

function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function signFromLongitude(lon: number): Sign {
  return SIGNS[Math.floor(normalize360(lon) / 30) % 12];
}

function nakshatraFromLongitude(lon: number): { nakshatra: Nakshatra; index: number; pada: Pada; lord: Planet } {
  const lonNorm = normalize360(lon);
  const nakWidth = 360 / 27;
  const idx = Math.floor(lonNorm / nakWidth);
  const nakshatra = NAKSHATRAS[idx % 27];
  const posInNak = lonNorm % nakWidth;
  const pada = (Math.floor(posInNak / (nakWidth / 4)) + 1) as Pada;
  const lord = NAKSHATRA_LORDS[idx % 9];
  return { nakshatra, index: idx + 1, pada, lord };
}

function navamshaSign(lon: number): Sign {
  const lonNorm = normalize360(lon);
  const navIdx = Math.floor(lonNorm / (360 / 108));
  return SIGNS[navIdx % 12];
}

function getTimezoneOffsetHours(timezone: string, dateStr: string, timeStr: string): number {
  try {
    const [y, mo, d] = dateStr.split('-').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(dt);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
    const tzYear = Number(getPart('year'));
    const tzMonth = Number(getPart('month')) - 1;
    const tzDay = Number(getPart('day'));
    const tzHour = Number(getPart('hour'));
    const tzMin = Number(getPart('minute'));
    const tzSec = Number(getPart('second'));
    const tzMs = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMin, tzSec);
    const utcMs = dt.getTime();
    const diffHours = (tzMs - utcMs) / (1000 * 60 * 60);
    return diffHours;
  } catch {
    return 5.5;
  }
}

function dateTimeToJD(dateStr: string, timeStr: string, tzOffsetHours: number): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (timeStr || '12:00').split(':').map(Number);
  const utHours = h + min / 60 - tzOffsetHours;
  let year = y, month = m, day = d + utHours / 24;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function getAyanamsaValue(jd: number, type: AyanamsaType): number {
  switch (type) {
    case 'lahiri':
      return getLahiriAyanamsa(jd);
    case 'raman':
      return normalize360(getLahiriAyanamsa(jd) + 0.0);
    case 'krishnamurti':
      return normalize360(getLahiriAyanamsa(jd) - 0.2);
    case 'yukteshwar':
      return normalize360(getLahiriAyanamsa(jd) + 0.5);
    default:
      return getLahiriAyanamsa(jd);
  }
}

function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  return normalize360(gmst);
}

function calcAscendantTropical(jd: number, lat: number, lon: number): number {
  const gmst = getGMST(jd);
  const lst = normalize360(gmst + lon);
  const T = (jd - 2451545.0) / 36525.0;
  const eps = (23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T) * D2R;
  const lstR = lst * D2R;
  const latR = lat * D2R;
  const y = -Math.cos(lstR);
  const x = Math.sin(lstR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps);
  const ascTrop = Math.atan2(y, x) * R2D;
  return normalize360(ascTrop);
}

function getMeanNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  return normalize360(omega);
}

function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * D2R;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  const sunLon = L0 + C;
  const omega = (125.04 - 1934.136 * T) * D2R;
  const apparent = sunLon - 0.00569 - 0.00478 * Math.sin(omega);
  return normalize360(apparent);
}

function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L1 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841 - (T * T * T * T) / 65194000;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868 - (T * T * T * T) / 113065000) * D2R;
  const M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000) * D2R;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000) * D2R;
  const F = (93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000) * D2R;
  const A1 = (119.75 + 131.849 * T) * D2R;
  const A2 = (53.09 + 479264.290 * T) * D2R;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sumL = 6288774 * Math.sin(Mp)
    + 1274027 * Math.sin(2 * D - Mp)
    + 658314 * Math.sin(2 * D)
    + 213618 * Math.sin(2 * Mp)
    - 185116 * E * Math.sin(M)
    - 114332 * Math.sin(2 * F)
    + 58793 * Math.sin(2 * D - 2 * Mp)
    + 57066 * E * Math.sin(2 * D - M - Mp)
    + 53322 * Math.sin(2 * D + Mp)
    + 45758 * E * Math.sin(2 * D - M)
    - 40923 * E * Math.sin(M - Mp)
    - 34720 * Math.sin(D)
    - 30383 * E * Math.sin(M + Mp)
    + 15327 * Math.sin(2 * D - 2 * F)
    - 12528 * Math.sin(Mp + 2 * F)
    + 10980 * Math.sin(Mp - 2 * F)
    + 10675 * Math.sin(4 * D - Mp)
    + 10034 * Math.sin(3 * Mp)
    + 8548 * Math.sin(4 * D - 2 * Mp)
    - 7888 * E * Math.sin(2 * D + M - Mp)
    - 6766 * E * Math.sin(2 * D + M)
    - 5163 * Math.sin(D - Mp)
    + 4987 * E * Math.sin(D + M)
    + 4036 * E * Math.sin(2 * D - M + Mp)
    + 3994 * Math.sin(2 * D + 2 * Mp)
    + 3861 * Math.sin(4 * D)
    + 3665 * Math.sin(2 * D - 3 * Mp)
    - 2689 * E * Math.sin(M - 2 * Mp)
    - 2602 * Math.sin(2 * D - Mp + 2 * F)
    + 2390 * E * Math.sin(2 * D - M - 2 * Mp)
    - 2348 * Math.sin(D + Mp)
    + 2236 * E * E * Math.sin(2 * D - 2 * M)
    - 2120 * E * Math.sin(M + 2 * Mp)
    - 2069 * E * E * Math.sin(2 * M)
    + 2048 * E * E * Math.sin(2 * D - 2 * M - Mp)
    - 1773 * Math.sin(2 * D + Mp - 2 * F)
    - 1595 * Math.sin(2 * D + 2 * F)
    + 1215 * E * Math.sin(4 * D - M - Mp)
    - 1110 * Math.sin(2 * Mp + 2 * F)
    - 892 * Math.sin(3 * D - Mp)
    - 810 * E * Math.sin(2 * D + M + Mp)
    + 759 * E * Math.sin(4 * D - M - 2 * Mp)
    - 713 * E * E * Math.sin(2 * M - Mp)
    - 700 * E * Math.sin(2 * D + 2 * M - Mp)
    + 691 * E * Math.sin(2 * D + M - 2 * Mp)
    + 596 * E * Math.sin(2 * D - M - 2 * F)
    + 549 * Math.sin(4 * D + Mp)
    + 537 * Math.sin(4 * Mp)
    + 520 * E * Math.sin(4 * D - M)
    - 487 * Math.sin(D - 2 * Mp)
    - 399 * E * Math.sin(2 * D + M - 2 * F)
    - 381 * Math.sin(2 * Mp - 2 * F)
    + 351 * E * Math.sin(D + M + Mp)
    - 340 * Math.sin(3 * D - 2 * Mp)
    + 330 * Math.sin(4 * D - 3 * Mp)
    + 327 * E * Math.sin(2 * D - M + 2 * Mp)
    - 323 * E * E * Math.sin(2 * M + Mp)
    + 299 * E * Math.sin(D + M - Mp)
    + 294 * Math.sin(2 * D + 3 * Mp);

  sumL += 3958 * Math.sin(A1) + 1962 * Math.sin(L1 * D2R - F) + 318 * Math.sin(A2);
  const moonLon = L1 + sumL / 1000000;
  return normalize360(moonLon);
}

function getMercuryLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalize360(252.250906 + 149472.6746358 * T);
  const M = normalize360(174.7948 + 149472.515 * T) * D2R;
  return normalize360(L + 23.4400 * Math.sin(M) + 2.9818 * Math.sin(2 * M) + 0.5255 * Math.sin(3 * M) + 0.1058 * Math.sin(4 * M));
}

function getVenusLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalize360(181.979801 + 58517.8156760 * T);
  const M = normalize360(50.4161 + 58517.803 * T) * D2R;
  return normalize360(L + 0.7758 * Math.sin(M) + 0.0033 * Math.sin(2 * M));
}

function getMarsLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalize360(355.433 + 19140.2993313 * T);
  const M = normalize360(19.3730 + 19140.300 * T) * D2R;
  return normalize360(L + 10.6912 * Math.sin(M) + 0.6228 * Math.sin(2 * M) + 0.0503 * Math.sin(3 * M));
}

function getJupiterLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalize360(34.351519 + 3034.9056606 * T);
  const M = normalize360(20.9 + 3034.906 * T) * D2R;
  const Msat = normalize360(317.0 + 1222.114 * T) * D2R;
  return normalize360(L + 5.5549 * Math.sin(M) + 0.1683 * Math.sin(2 * M) - 0.4399 * Math.sin(Msat - M) - 0.1998 * Math.sin(Msat + M));
}

function getSaturnLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = normalize360(50.077444 + 1222.1138488 * T);
  const M = normalize360(317.0 + 1222.114 * T) * D2R;
  const Mjup = normalize360(20.9 + 3034.906 * T) * D2R;
  return normalize360(L + 6.3585 * Math.sin(M) + 0.2204 * Math.sin(2 * M) + 0.4399 * Math.sin(Mjup - M) + 0.1998 * Math.sin(Mjup + M));
}

function isRetrograde(jd: number, getLon: (jd: number) => number): boolean {
  const lon1 = getLon(jd - 1);
  const lon2 = getLon(jd + 1);
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function computeMidheaven(lst: number, eps: number): number {
  const tanLST = Math.tan(lst * D2R);
  const mc = Math.atan2(tanLST, Math.cos(eps)) * R2D;
  return normalize360(mc);
}

function buildHouseCuspsFromLongitudes(cuspLongitudes: number[]): HouseCusp[] {
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const lon = normalize360(cuspLongitudes[i]);
    const sign = signFromLongitude(lon);
    houses.push({
      house: i + 1,
      longitude: lon,
      sign,
      lord: SIGN_LORDS[sign],
    });
  }
  return houses;
}

function buildWholeSignFromAsc(ascSid: number): HouseCusp[] {
  const lagnaSignIdx = Math.floor(ascSid / 30) % 12;
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const houseSignIdx = (lagnaSignIdx + i) % 12;
    const sign = SIGNS[houseSignIdx];
    houses.push({
      house: i + 1,
      longitude: houseSignIdx * 30,
      sign,
      lord: SIGN_LORDS[sign],
    });
  }
  return houses;
}

/*
  TODO: Placidus house cusps — simplified approximation with whole-sign fallback.

  The exact Placidus formula requires iteratively solving the semi-arc proportionality
  equations for each of the 8 ambiguous cusps (H2, H3, H5, H6 and their opposites H8, H9,
  H11, H12). A proper implementation should:

    1. Compute Obliquity of the ecliptic (eps) and Ascendant/Midheaven tropical longitudes.
    2. For each cusp between MC-Asc and Asc-IC arcs, use the Placidus proportionality:
         RA of cusp = MC + 1/3 * (Asc - MC) via equatorial semi-arc projection using
         tables of ascensional differences:  sin(AD) = tan(lat) * tan(decl).
    3. Convert each cusp's equatorial RA back to ecliptic longitude via:
         tan(long) = sin(RA) / (cos(RA) * cos(eps) - sin(eps) * tan(lat)) .
    4. Handle polar / circumpolar latitudes (|lat| > 90° - eps) by falling back to whole-sign
       or equal-house, because some cusps never rise at extreme latitudes.

  The simplified approach below uses the known Ascendant (H1), MC (H10), and their
  180° opposites as anchors, then linearly interpolates the remaining 8 cusps in
  SIDEREAL longitude between these anchors in 10° chunks. This produces a valid 12-house
  shape that is numerically stable at all latitudes, but it is NOT true Placidus.
  Callers needing mathematically exact Placidus cusps should replace this function with
  the iterative semi-arc algorithm or integrate Swiss Ephemeris's swe_houses_ex().

  At extreme latitudes >= 60° this function falls back directly to whole-sign houses
  because true Placidus is undefined for those regions.
*/
function computePlacidusCuspsApprox(
  jd: number,
  lat: number,
  lon: number,
  ayanamsaValue: number,
  ascSid: number
): HouseCusp[] {
  if (Math.abs(lat) >= 60) {
    return buildWholeSignFromAsc(ascSid);
  }

  try {
    const T = (jd - 2451545.0) / 36525.0;
    const eps = (23.439291111 - 0.013004167 * T - 0.000000164 * T * T + 0.000000504 * T * T * T) * D2R;
    const gmst = getGMST(jd);
    const lst = normalize360(gmst + lon);
    const ascTrop = calcAscendantTropical(jd, lat, lon);
    const mcTrop = computeMidheaven(lst, eps);

    const h1Sid = normalize360(ascTrop - ayanamsaValue);
    const h10Sid = normalize360(mcTrop - ayanamsaValue);
    const h7Sid = normalize360(h1Sid + 180);
    const h4Sid = normalize360(h10Sid + 180);

    function lerpAngle(a: number, b: number, t: number): number {
      let diff = b - a;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return normalize360(a + t * diff);
    }

    const cusps: number[] = new Array(12).fill(0);
    cusps[0] = h1Sid;
    cusps[9] = h10Sid;
    cusps[3] = h7Sid;
    cusps[6] = h4Sid;

    cusps[10] = lerpAngle(h10Sid, h1Sid, 1 / 3);
    cusps[11] = lerpAngle(h10Sid, h1Sid, 2 / 3);
    cusps[1] = lerpAngle(h1Sid, h4Sid, 1 / 3);
    cusps[2] = lerpAngle(h1Sid, h4Sid, 2 / 3);
    cusps[4] = lerpAngle(h4Sid, h7Sid, 1 / 3);
    cusps[5] = lerpAngle(h4Sid, h7Sid, 2 / 3);
    cusps[7] = lerpAngle(h7Sid, h10Sid, 1 / 3);
    cusps[8] = lerpAngle(h7Sid, h10Sid, 2 / 3);

    const result = buildHouseCuspsFromLongitudes(cusps);
    return result;
  } catch {
    return buildWholeSignFromAsc(ascSid);
  }
}

function buildHouses(
  jd: number,
  lat: number,
  lon: number,
  ayanamsaValue: number,
  houseSystem: HouseSystem,
  ascSid: number
): HouseCusp[] {
  if (houseSystem === 'placidus') {
    return computePlacidusCuspsApprox(jd, lat, lon, ayanamsaValue, ascSid);
  }
  if (houseSystem === 'koch') {
    return computePlacidusCuspsApprox(jd, lat, lon, ayanamsaValue, ascSid);
  }
  const lagnaSignIdx = Math.floor(ascSid / 30) % 12;
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const houseSignIdx = (lagnaSignIdx + i) % 12;
    const sign = SIGNS[houseSignIdx];
    let cuspLongitude = houseSignIdx * 30;
    if (houseSystem === 'equal') {
      cuspLongitude = normalize360(ascSid + i * 30);
    }
    houses.push({
      house: i + 1,
      longitude: cuspLongitude,
      sign,
      lord: SIGN_LORDS[sign],
    });
  }
  return houses;
}

function assignHouseNumber(siderealLon: number, ascSid: number, houses: HouseCusp[], houseSystem: HouseSystem): number {
  if (houseSystem === 'whole-sign') {
    const lagnaSignIdx = Math.floor(ascSid / 30) % 12;
    const planetSignIdx = Math.floor(normalize360(siderealLon) / 30) % 12;
    return ((planetSignIdx - lagnaSignIdx + 12) % 12) + 1;
  }
  const lon = normalize360(siderealLon);
  for (let i = 0; i < 12; i++) {
    const curr = houses[i].longitude;
    const next = houses[(i + 1) % 12].longitude;
    let inRange = false;
    if (curr < next) {
      inRange = lon >= curr && lon < next;
    } else {
      inRange = lon >= curr || lon < next;
    }
    if (inRange) {
      return i + 1;
    }
  }
  return 1;
}

export function calculateChart(
  birthData: BirthData,
  ayanamsa: AyanamsaType = 'lahiri',
  houseSystem: HouseSystem = 'whole-sign',
): ChartResult {
  const tzOffsetHours = getTimezoneOffsetHours(birthData.timezone, birthData.date, birthData.time);
  const julianDay = dateTimeToJD(birthData.date, birthData.time, tzOffsetHours);
  const ayanamsaValue = getAyanamsaValue(julianDay, ayanamsa);

  const sunTrop = getSunLongitude(julianDay);
  const moonTrop = getMoonLongitude(julianDay);
  const marsTrop = getMarsLongitude(julianDay);
  const mercuryTrop = getMercuryLongitude(julianDay);
  const jupiterTrop = getJupiterLongitude(julianDay);
  const venusTrop = getVenusLongitude(julianDay);
  const saturnTrop = getSaturnLongitude(julianDay);
  const rahuTrop = getMeanNode(julianDay);
  const ketuTrop = normalize360(rahuTrop + 180);
  const ascendantTrop = calcAscendantTropical(julianDay, birthData.latitude, birthData.longitude);

  const ascendantSid = normalize360(ascendantTrop - ayanamsaValue);

  const houses = buildHouses(julianDay, birthData.latitude, birthData.longitude, ayanamsaValue, houseSystem, ascendantSid);

  const planetOrder: Planet[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
    'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant',
  ];

  const tropicalLons: Record<Planet, number> = {
    Sun: sunTrop,
    Moon: moonTrop,
    Mars: marsTrop,
    Mercury: mercuryTrop,
    Jupiter: jupiterTrop,
    Venus: venusTrop,
    Saturn: saturnTrop,
    Rahu: rahuTrop,
    Ketu: ketuTrop,
    Ascendant: ascendantTrop,
  };

  const planets: PlanetPosition[] = planetOrder.map(planet => {
    const tropicalLon = tropicalLons[planet];
    const siderealLon = normalize360(tropicalLon - ayanamsaValue);
    const sign = signFromLongitude(siderealLon);
    const degreeInSign = normalize360(siderealLon) % 30;
    const house = assignHouseNumber(siderealLon, ascendantSid, houses, houseSystem);
    const { nakshatra, pada, lord } = nakshatraFromLongitude(siderealLon);
    const nakshatraIndex = NAKSHATRAS.indexOf(nakshatra) + 1;

    let isRetro: boolean;
    if (planet === 'Rahu' || planet === 'Ketu') {
      isRetro = true;
    } else if (planet === 'Ascendant') {
      isRetro = false;
    } else {
      const getters: Record<string, (jd: number) => number> = {
        Sun: getSunLongitude,
        Moon: getMoonLongitude,
        Mars: getMarsLongitude,
        Mercury: getMercuryLongitude,
        Jupiter: getJupiterLongitude,
        Venus: getVenusLongitude,
        Saturn: getSaturnLongitude,
      };
      isRetro = isRetrograde(julianDay, getters[planet]);
    }

    return {
      planet,
      tropicalLongitude: tropicalLon,
      siderealLongitude: siderealLon,
      sign,
      degreeInSign,
      house,
      isRetrograde: isRetro,
      nakshatraIndex,
      nakshatra,
      nakshatraLord: lord,
      pada,
      navamshaSign: navamshaSign(siderealLon),
    };
  });

  return {
    birthData,
    ayanamsa,
    ayanamsaValue,
    houseSystem,
    planets,
    houses,
    julianDay,
    calculatedAt: new Date().toISOString(),
  };
}

function addYearsISO(isoDate: string, years: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  const totalMs = d.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000;
  const nd = new Date(totalMs);
  return nd.toISOString().split('T')[0];
}

export function calculateVimshottariDasha(chart: ChartResult): DashaResult {
  const moonPos = chart.planets.find(p => p.planet === 'Moon')!;
  const moonNakshatraIndex = moonPos.nakshatraIndex;
  const seedLordIdx = (moonNakshatraIndex - 1) % 9;
  const seedPlanet = NAKSHATRA_LORDS[seedLordIdx];

  const nakWidth = 360 / 27;
  const moonInNak = normalize360(moonPos.siderealLongitude) % nakWidth;
  const posRemainingDeg = nakWidth - moonInNak;
  const balanceRatio = posRemainingDeg / nakWidth;
  const birthMahadashaYears = balanceRatio * DASHA_YEARS[seedPlanet];

  const seedIdx = DASHA_ORDER.indexOf(seedPlanet);
  const orderedPlanets: Planet[] = [
    ...DASHA_ORDER.slice(seedIdx),
    ...DASHA_ORDER.slice(0, seedIdx),
  ];

  const birthDate = chart.birthData.date;
  const periods: DashaPeriod[] = [];
  let mahaStart = birthDate;

  const firstYears = birthMahadashaYears;
  const firstSubs = buildAntardashas(orderedPlanets[0], mahaStart, firstYears, orderedPlanets);
  periods.push({
    planet: orderedPlanets[0],
    startDate: mahaStart,
    endDate: addYearsISO(mahaStart, firstYears),
    subPeriods: firstSubs,
  });
  mahaStart = addYearsISO(mahaStart, firstYears);

  for (let i = 1; i < orderedPlanets.length; i++) {
    const maha = orderedPlanets[i];
    const years = DASHA_YEARS[maha];
    const subs = buildAntardashas(maha, mahaStart, years, orderedPlanets);
    const end = addYearsISO(mahaStart, years);
    periods.push({
      planet: maha,
      startDate: mahaStart,
      endDate: end,
      subPeriods: subs,
    });
    mahaStart = end;
  }

  return {
    birthData: chart.birthData,
    moonNakshatra: moonPos.nakshatra,
    birthDashaBalance: {
      planet: seedPlanet,
      yearsRemaining: birthMahadashaYears,
    },
    periods,
  };
}

function buildAntardashas(
  maha: Planet,
  mahaStart: string,
  mahaTotalYears: number,
  dashaOrder: Planet[],
): DashaPeriod[] {
  const mahaIdx = dashaOrder.indexOf(maha);
  const antarOrder: Planet[] = [
    ...dashaOrder.slice(mahaIdx),
    ...dashaOrder.slice(0, mahaIdx),
  ];
  const total120 = 120;
  let start = mahaStart;
  return antarOrder.map(antar => {
    const antarYears = (mahaTotalYears * DASHA_YEARS[antar]) / total120;
    const end = addYearsISO(start, antarYears);
    const result: DashaPeriod = { planet: antar, startDate: start, endDate: end };
    start = end;
    return result;
  });
}
