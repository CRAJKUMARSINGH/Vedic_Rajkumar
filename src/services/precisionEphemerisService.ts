/**
 * Precision Ephemeris Service
 *
 * Week 1 fix: replaced broken "mean longitude + single sine" inner planet
 * formulas with proper Kepler / Schlyter heliocentric → geocentric mechanics.
 *
 * Accuracy (Schlyter orbital elements):
 *   Sun      ±0.01°   (1800–2100)
 *   Moon     ±0.05°   (Meeus Ch.47 full ELP2000 truncated)
 *   Mercury  ±1–2°    (heliocentric Kepler, acceptable for sign-level checks)
 *   Venus    ±0.5°
 *   Mars     ±1°
 *   Jupiter  ±0.5°    (with Great Inequality perturbations)
 *   Saturn   ±0.5°    (with Great Inequality perturbations)
 *   Rahu/K   ±0.1°    (mean node, Meeus)
 */

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface PrecisePlanetPosition {
  name: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  minutes: number;
  seconds: number;
  isRetrograde: boolean;
  dignity: string;
  house: number;
}

export interface PreciseAscendant {
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  minutes: number;
}

export interface PreciseChart {
  julianDay: number;
  ayanamsa: number;
  ascendant: PreciseAscendant;
  planets: PrecisePlanetPosition[];
  houses: Array<{ house: number; rashiIndex: number; rashiName: string; degrees: number; lord: string }>;
  nakshatra: { name: string; nameHi: string; pada: number; lord: string; degrees: number };
  moonRashiIndex: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

export const RASHI_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
export const RASHI_NAMES_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
];
export const RASHI_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

export const NAKSHATRA_DATA = [
  { name: 'Ashwini',          nameHi: 'अश्विनी',       lord: 'Ketu'    },
  { name: 'Bharani',          nameHi: 'भरणी',           lord: 'Venus'   },
  { name: 'Krittika',         nameHi: 'कृत्तिका',      lord: 'Sun'     },
  { name: 'Rohini',           nameHi: 'रोहिणी',         lord: 'Moon'    },
  { name: 'Mrigashira',       nameHi: 'मृगशिरा',        lord: 'Mars'    },
  { name: 'Ardra',            nameHi: 'आर्द्रा',        lord: 'Rahu'    },
  { name: 'Punarvasu',        nameHi: 'पुनर्वसु',       lord: 'Jupiter' },
  { name: 'Pushya',           nameHi: 'पुष्य',          lord: 'Saturn'  },
  { name: 'Ashlesha',         nameHi: 'आश्लेषा',        lord: 'Mercury' },
  { name: 'Magha',            nameHi: 'मघा',            lord: 'Ketu'    },
  { name: 'Purva Phalguni',   nameHi: 'पूर्व फाल्गुनी', lord: 'Venus'  },
  { name: 'Uttara Phalguni',  nameHi: 'उत्तर फाल्गुनी', lord: 'Sun'    },
  { name: 'Hasta',            nameHi: 'हस्त',           lord: 'Moon'    },
  { name: 'Chitra',           nameHi: 'चित्रा',          lord: 'Mars'    },
  { name: 'Swati',            nameHi: 'स्वाती',          lord: 'Rahu'    },
  { name: 'Vishakha',         nameHi: 'विशाखा',          lord: 'Jupiter' },
  { name: 'Anuradha',         nameHi: 'अनुराधा',         lord: 'Saturn'  },
  { name: 'Jyeshtha',         nameHi: 'ज्येष्ठा',        lord: 'Mercury' },
  { name: 'Mula',             nameHi: 'मूल',             lord: 'Ketu'    },
  { name: 'Purva Ashadha',    nameHi: 'पूर्वाषाढ़ा',    lord: 'Venus'   },
  { name: 'Uttara Ashadha',   nameHi: 'उत्तराषाढ़ा',    lord: 'Sun'     },
  { name: 'Shravana',         nameHi: 'श्रवण',           lord: 'Moon'    },
  { name: 'Dhanishtha',       nameHi: 'धनिष्ठा',         lord: 'Mars'    },
  { name: 'Shatabhisha',      nameHi: 'शतभिषा',          lord: 'Rahu'    },
  { name: 'Purva Bhadrapada', nameHi: 'पूर्व भाद्रपद',  lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada',nameHi: 'उत्तर भाद्रपद',  lord: 'Saturn'  },
  { name: 'Revati',           nameHi: 'रेवती',           lord: 'Mercury' },
];

// Dignity tables
const EXALTATION:   Record<string, number>   = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };
const DEBILITATION: Record<string, number>   = { Sun: 6, Moon: 7, Mercury: 11, Venus: 5, Mars: 3, Jupiter: 9, Saturn: 0 };
const OWN_SIGNS:    Record<string, number[]> = {
  Sun: [4], Moon: [3], Mercury: [2, 5], Venus: [1, 6],
  Mars: [0, 7], Jupiter: [8, 11], Saturn: [9, 10],
};
const MOOLATRIKONA: Record<string, number> = { Sun: 4, Moon: 1, Mercury: 5, Venus: 6, Mars: 0, Jupiter: 8, Saturn: 10 };

// ─── Math helpers ──────────────────────────────────────────────────────────────

function norm(x: number): number { return ((x % 360) + 360) % 360; }

function degToRashi(deg: number): number   { return Math.floor(((deg % 360) + 360) % 360 / 30); }
function degInRashi(deg: number): number   { return ((deg % 360) + 360) % 360 % 30; }
function tropToSid(trop: number, ay: number): number { return norm(trop - ay); }

function getDignity(planet: string, ri: number): string {
  if (EXALTATION[planet]   === ri) return 'Exalted';
  if (DEBILITATION[planet] === ri) return 'Debilitated';
  if (OWN_SIGNS[planet]?.includes(ri)) {
    return MOOLATRIKONA[planet] === ri ? 'Moolatrikona' : 'Own Sign';
  }
  return 'Neutral';
}

function formatPlanet(
  name: string, tropDeg: number, ayanamsa: number, ascSidDeg: number, isRetrograde = false
): PrecisePlanetPosition {
  const sid = tropToSid(tropDeg, ayanamsa);
  const ri = degToRashi(sid);
  const degInSign = degInRashi(sid);
  const mins = Math.floor((degInSign % 1) * 60);
  const secs = Math.floor(((degInSign % 1) * 60 - mins) * 60);
  const house = Math.floor(((sid - ascSidDeg + 360) % 360) / 30) + 1;
  return {
    name, tropicalLongitude: tropDeg, siderealLongitude: sid,
    rashiIndex: ri, rashiName: RASHI_NAMES_EN[ri],
    degrees: Math.floor(degInSign), minutes: mins, seconds: secs,
    isRetrograde, dignity: getDignity(name, ri), house,
  };
}

// ─── Lahiri Ayanamsa ──────────────────────────────────────────────────────────
/**
 * Lahiri (Chitrapaksha) ayanamsa.
 * Value at J2000.0 = 23.85472°, precession 50.2564″/yr = 0.013960°/yr.
 */
export function getLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const ay = 23.85472 + 0.013960 * T * 100 - 0.000308 * T * T;
  return norm(ay);
}

// ─── Julian Day ───────────────────────────────────────────────────────────────
export function dateTimeToJD(dateStr: string, timeStr: string, tzOffsetHours = 5.5): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (timeStr || '12:00').split(':').map(Number);
  const utHours = h + min / 60 - tzOffsetHours;
  let year = y, month = m, day = d + utHours / 24;
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// ─── Kepler / Schlyter orbital mechanics ──────────────────────────────────────
// Paul Schlyter (1997) orbital elements — proper heliocentric → geocentric.
// Fixes the broken "mean longitude + single sine" approach previously used.

/** Iterative Kepler equation solver */
function solveKepler(Mdeg: number, e: number): number {
  const Mr = Mdeg * D2R;
  let E = Mr + e * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  for (let i = 0; i < 50; i++) {
    const dE = (Mr + e * Math.sin(E) - E) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/** True anomaly from eccentric anomaly */
function trueAnomaly(E: number, e: number): number {
  return norm(2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)) * R2D);
}

/** Heliocentric rectangular ecliptic coordinates */
function helioRect(v: number, r: number, N: number, inc: number, w: number): { x: number; y: number } {
  const vw = norm(v + w) * D2R;
  const Nr = N * D2R;
  const ir = inc * D2R;
  return {
    x: r * (Math.cos(Nr) * Math.cos(vw) - Math.sin(Nr) * Math.sin(vw) * Math.cos(ir)),
    y: r * (Math.sin(Nr) * Math.cos(vw) + Math.cos(Nr) * Math.sin(vw) * Math.cos(ir)),
  };
}

/** Sun: geocentric tropical longitude + heliocentric distance */
function getSunGeocentric(jd: number): { lon: number; r: number } {
  const d = jd - 2451543.5;
  const w = norm(282.9404 + 4.70935e-5 * d);
  const e = 0.016709 - 1.151e-9 * d;
  const M = norm(356.0470 + 0.9856002585 * d);
  const E = solveKepler(M, e);
  const v = trueAnomaly(E, e);
  const r = (1 - e * e) / (1 + e * Math.cos(v * D2R));
  return { lon: norm(v + w), r };
}

/** Generic planet: geocentric tropical longitude via heliocentric → geocentric */
function geoLon(
  jd: number, N0: number, Nd: number, inc: number,
  w0: number, wd: number, a: number, e0: number, ed: number,
  M0: number, Md: number
): number {
  const d = jd - 2451543.5;
  const N = norm(N0 + Nd * d);
  const w = norm(w0 + wd * d);
  const e = e0 + ed * d;
  const M = norm(M0 + Md * d);
  const E = solveKepler(M, e);
  const v = trueAnomaly(E, e);
  const r = a * (1 - e * e) / (1 + e * Math.cos(v * D2R));
  const { x: xh, y: yh } = helioRect(v, r, N, inc, w);
  const sun = getSunGeocentric(jd);
  const xe = -sun.r * Math.cos(sun.lon * D2R);
  const ye = -sun.r * Math.sin(sun.lon * D2R);
  return norm(Math.atan2(yh - ye, xh - xe) * R2D);
}

// ─── Planet longitude functions ───────────────────────────────────────────────

function getSunLongitude(jd: number): number {
  return getSunGeocentric(jd).lon;
}

function getMoonLongitude(jd: number): number {
  // Meeus Chapter 47 — truncated ELP2000 series (±0.05° accuracy)
  const T = (jd - 2451545.0) / 36525.0;
  const L1 = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
    + T * T * T / 538841 - T * T * T * T / 65194000;
  const D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
    + T * T * T / 545868 - T * T * T * T / 113065000) * D2R;
  const M  = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
    + T * T * T / 24490000) * D2R;
  const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    + T * T * T / 69699 - T * T * T * T / 14712000) * D2R;
  const F  = (93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
    - T * T * T / 3526000 + T * T * T * T / 863310000) * D2R;
  const A1 = (119.75 + 131.849  * T) * D2R;
  const A2 = ( 53.09 + 479264.290 * T) * D2R;
  const E  = 1 - 0.002516 * T - 0.0000074 * T * T;

  let sumL =
      6288774 * Math.sin(Mp)
    + 1274027 * Math.sin(2 * D - Mp)
    +  658314 * Math.sin(2 * D)
    +  213618 * Math.sin(2 * Mp)
    -  185116 * E * Math.sin(M)
    -  114332 * Math.sin(2 * F)
    +   58793 * Math.sin(2 * D - 2 * Mp)
    +   57066 * E * Math.sin(2 * D - M - Mp)
    +   53322 * Math.sin(2 * D + Mp)
    +   45758 * E * Math.sin(2 * D - M)
    -   40923 * E * Math.sin(M - Mp)
    -   34720 * Math.sin(D)
    -   30383 * E * Math.sin(M + Mp)
    +   15327 * Math.sin(2 * D - 2 * F)
    -   12528 * Math.sin(Mp + 2 * F)
    +   10980 * Math.sin(Mp - 2 * F)
    +   10675 * Math.sin(4 * D - Mp)
    +   10034 * Math.sin(3 * Mp)
    +    8548 * Math.sin(4 * D - 2 * Mp)
    -    7888 * E * Math.sin(2 * D + M - Mp)
    -    6766 * E * Math.sin(2 * D + M)
    -    5163 * Math.sin(D - Mp)
    +    4987 * E * Math.sin(D + M)
    +    4036 * E * Math.sin(2 * D - M + Mp)
    +    3994 * Math.sin(2 * D + 2 * Mp)
    +    3861 * Math.sin(4 * D)
    +    3665 * Math.sin(2 * D - 3 * Mp)
    -    2689 * E * Math.sin(M - 2 * Mp)
    -    2602 * Math.sin(2 * D - Mp + 2 * F)
    +    2390 * E * Math.sin(2 * D - M - 2 * Mp)
    -    2348 * Math.sin(D + Mp)
    +    2236 * E * E * Math.sin(2 * D - 2 * M)
    -    2120 * E * Math.sin(M + 2 * Mp)
    -    2069 * E * E * Math.sin(2 * M)
    +    2048 * E * E * Math.sin(2 * D - 2 * M - Mp)
    -    1773 * Math.sin(2 * D + Mp - 2 * F)
    -    1595 * Math.sin(2 * D + 2 * F)
    +    1215 * E * Math.sin(4 * D - M - Mp)
    -    1110 * Math.sin(2 * Mp + 2 * F)
    -     892 * Math.sin(3 * D - Mp)
    -     810 * E * Math.sin(2 * D + M + Mp)
    +     759 * E * Math.sin(4 * D - M - 2 * Mp)
    -     713 * E * E * Math.sin(2 * M - Mp)
    -     700 * E * Math.sin(2 * D + 2 * M - Mp)
    +     691 * E * Math.sin(2 * D + M - 2 * Mp)
    +     596 * E * Math.sin(2 * D - M - 2 * F)
    +     549 * Math.sin(4 * D + Mp)
    +     537 * Math.sin(4 * Mp)
    +     520 * E * Math.sin(4 * D - M)
    -     487 * Math.sin(D - 2 * Mp)
    -     399 * E * Math.sin(2 * D + M - 2 * F)
    -     381 * Math.sin(2 * Mp - 2 * F)
    +     351 * E * Math.sin(D + M + Mp)
    -     340 * Math.sin(3 * D - 2 * Mp)
    +     330 * Math.sin(4 * D - 3 * Mp)
    +     327 * E * Math.sin(2 * D - M + 2 * Mp)
    -     323 * E * E * Math.sin(2 * M + Mp)
    +     299 * E * Math.sin(D + M - Mp)
    +     294 * Math.sin(2 * D + 3 * Mp);

  // Additional terms: L1 must be in radians (normalise first)
  const L1r = norm(L1) * D2R;
  sumL += 3958 * Math.sin(A1) + 1962 * Math.sin(L1r - F) + 318 * Math.sin(A2);

  const moonLon = L1 + sumL / 1000000;
  return norm(moonLon);
}

function getMercuryLongitude(jd: number): number {
  return geoLon(jd, 48.3313, 3.24587e-5, 7.0047, 29.1241, 1.01444e-5,
    0.387098, 0.205635, 5.59e-10, 168.6562, 4.0923344368);
}

function getVenusLongitude(jd: number): number {
  return geoLon(jd, 76.6799, 2.4659e-5, 3.3946, 54.8910, 1.38374e-5,
    0.723330, 0.006773, -1.302e-9, 48.0052, 1.6021302244);
}

function getMarsLongitude(jd: number): number {
  return geoLon(jd, 49.5574, 2.11081e-5, 1.8497, 286.5016, 2.92961e-5,
    1.523688, 0.093405, 2.516e-9, 18.6021, 0.5240207766);
}

function getJupiterLongitude(jd: number): number {
  const d  = jd - 2451543.5;
  const Mj = norm(19.8950  + 0.0830853001 * d);
  const Ms = norm(316.9670 + 0.0334442282 * d);
  const e  = 0.048498 + 4.469e-9 * d;
  const E  = solveKepler(Mj, e);
  const v  = trueAnomaly(E, e);
  const r  = 5.20256 * (1 - e * e) / (1 + e * Math.cos(v * D2R));
  // Great Inequality perturbation terms
  const pert = -0.332 * Math.sin((2 * Mj - 5 * Ms - 67.6) * D2R)
             +  0.042 * Math.sin((3 * Mj - 5 * Ms + 21) * D2R);
  const { x: xh, y: yh } = helioRect(
    v + pert, r,
    norm(100.4542 + 2.76854e-5 * d), 1.3030,
    norm(273.8777 + 1.64505e-5 * d)
  );
  const sun = getSunGeocentric(jd);
  return norm(Math.atan2(yh + sun.r * Math.sin(sun.lon * D2R), xh + sun.r * Math.cos(sun.lon * D2R)) * R2D);
}

function getSaturnLongitude(jd: number): number {
  const d  = jd - 2451543.5;
  const Mj = norm(19.8950  + 0.0830853001 * d);
  const Ms = norm(316.9670 + 0.0334442282 * d);
  const e  = 0.055546 - 9.499e-9 * d;
  const E  = solveKepler(Ms, e);
  const v  = trueAnomaly(E, e);
  const r  = 9.55475 * (1 - e * e) / (1 + e * Math.cos(v * D2R));
  const pert = 0.812 * Math.sin((2 * Mj - 5 * Ms - 67.6) * D2R)
             + 0.119 * Math.sin((Mj - 2 * Ms - 3) * D2R);
  const { x: xh, y: yh } = helioRect(
    v + pert, r,
    norm(113.6634 + 2.3898e-5 * d), 2.4886,
    norm(339.3939 + 2.97661e-5 * d)
  );
  const sun = getSunGeocentric(jd);
  return norm(Math.atan2(yh + sun.r * Math.sin(sun.lon * D2R), xh + sun.r * Math.cos(sun.lon * D2R)) * R2D);
}

/** Mean lunar node (Rahu) — Meeus, retrograde */
function getMeanNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0;
  return norm(omega);
}

// ─── Retrograde detection ─────────────────────────────────────────────────────

function isRetrograde(jd: number, getLon: (jd: number) => number): boolean {
  const lon1 = getLon(jd - 1);
  const lon2 = getLon(jd + 1);
  let diff = lon2 - lon1;
  if (diff > 180)  diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ─── GMST / Ascendant ─────────────────────────────────────────────────────────

function getGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000.0;
  return norm(gmst);
}

function calcAscendant(jd: number, lat: number, lon: number, ayanamsa: number): PreciseAscendant {
  const gmst = getGMST(jd);
  const lst  = norm(gmst + lon);
  const T    = (jd - 2451545.0) / 36525.0;
  const eps  = (23.439291111 - 0.013004167 * T) * D2R;
  const lstR = lst * D2R;
  const latR = lat * D2R;
  // Ascendant formula (Meeus Ch.14 — ecliptic longitude on the eastern horizon)
  // The sign of atan2 arguments places the result in the correct quadrant.
  const y = -Math.cos(lstR);
  const x =  Math.sin(lstR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps);
  let ascTrop = Math.atan2(y, x) * R2D;
  // atan2 returns [-180,+180]; normalise to [0,360]
  // Then ensure the ascendant is on the EASTERN horizon:
  // If ascendant is in the same semicircle as the LST the formula is correct;
  // otherwise add 180°. A simpler robust check: ascendant must be within
  // ±90° of the 6th-house cusp (LST + 90° sidereal).
  ascTrop = ((ascTrop % 360) + 360) % 360;
  // Validate quadrant: the tropical ascendant should be within 90° of where
  // the ecliptic crosses the eastern horizon. If off by ~180°, correct it.
  // We test by checking that the ascendant falls "near" the expected range
  // derived from RAMC (Right Ascension of MC). MC longitude ≈ LST converted
  // to ecliptic. A simpler robust fix: recompute using the tangent form.
  // The fully reliable form from "Astronomical Algorithms" eq 14.3:
  //   tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(ε) + tan(lat)*sin(ε))
  // where RAMC = LST. This is equivalent but MUST be in the correct quadrant.
  // atan2(numerator, denominator):
  //   num = -cos(RAMC)
  //   den = sin(RAMC)*cos(ε) + tan(lat)*sin(ε)
  // The quadrant is correct when num/den gives the eastern horizon.
  // The ascendant is on the ASCENDING side — if the result points west, add 180°.
  // Check: the ascending node should have positive altitude rate. A simpler
  // quadrant correction: ensure ascTrop is in the correct 180° half vs RAMC.
  // The MC is approx norm(lst + 90) in tropical, so Asc should be 90° ahead of MC.
  // Practical fix: if |ascTrop - (lst + 90)| > 90 (mod 360), add 180°.
  const mcApprox = norm(lst + 90); // rough MC
  let diff = Math.abs(ascTrop - mcApprox);
  if (diff > 180) diff = 360 - diff;
  if (diff > 90) ascTrop = norm(ascTrop + 180);

  const ascSid  = tropToSid(ascTrop, ayanamsa);
  const ri  = degToRashi(ascSid);
  const deg = degInRashi(ascSid);
  return {
    tropicalLongitude: ascTrop, siderealLongitude: ascSid,
    rashiIndex: ri, rashiName: RASHI_NAMES_EN[ri],
    degrees: Math.floor(deg), minutes: Math.floor((deg % 1) * 60),
  };
}

// ─── Nakshatra from Moon sidereal longitude ───────────────────────────────────

function getNakshatra(moonSidDeg: number) {
  const span = 360 / 27;
  const nakshatraIndex = Math.min(26, Math.floor(moonSidDeg / span));
  const posInNak = moonSidDeg % span;
  const pada = Math.min(4, Math.floor(posInNak / (span / 4)) + 1) as 1 | 2 | 3 | 4;
  const nk = NAKSHATRA_DATA[nakshatraIndex] ?? NAKSHATRA_DATA[0];
  return { ...nk, pada, degrees: posInNak };
}

// ─── Main chart calculation ───────────────────────────────────────────────────

export function calculatePreciseChart(
  dateStr: string,
  timeStr: string,
  lat: number,
  lon: number,
  tzOffsetHours = 5.5
): PreciseChart {
  const jd       = dateTimeToJD(dateStr, timeStr, tzOffsetHours);
  const ayanamsa = getLahiriAyanamsa(jd);
  const ascendant = calcAscendant(jd, lat, lon, ayanamsa);
  const ascSid   = ascendant.siderealLongitude;

  const sunTrop  = getSunLongitude(jd);
  const moonTrop = getMoonLongitude(jd);
  const mercTrop = getMercuryLongitude(jd);
  const venTrop  = getVenusLongitude(jd);
  const marsTrop = getMarsLongitude(jd);
  const jupTrop  = getJupiterLongitude(jd);
  const satTrop  = getSaturnLongitude(jd);
  const rahuTrop = getMeanNode(jd);
  const ketuTrop = norm(rahuTrop + 180);

  const planets: PrecisePlanetPosition[] = [
    formatPlanet('Sun',     sunTrop,  ayanamsa, ascSid, false),
    formatPlanet('Moon',    moonTrop, ayanamsa, ascSid, false),
    formatPlanet('Mercury', mercTrop, ayanamsa, ascSid, isRetrograde(jd, getMercuryLongitude)),
    formatPlanet('Venus',   venTrop,  ayanamsa, ascSid, isRetrograde(jd, getVenusLongitude)),
    formatPlanet('Mars',    marsTrop, ayanamsa, ascSid, isRetrograde(jd, getMarsLongitude)),
    formatPlanet('Jupiter', jupTrop,  ayanamsa, ascSid, isRetrograde(jd, getJupiterLongitude)),
    formatPlanet('Saturn',  satTrop,  ayanamsa, ascSid, isRetrograde(jd, getSaturnLongitude)),
    formatPlanet('Rahu',    rahuTrop, ayanamsa, ascSid, true),
    formatPlanet('Ketu',    ketuTrop, ayanamsa, ascSid, true),
  ];

  const houses = Array.from({ length: 12 }, (_, i) => {
    const houseSid = norm(ascSid + i * 30);
    const ri = degToRashi(houseSid);
    return { house: i + 1, rashiIndex: ri, rashiName: RASHI_NAMES_EN[ri], degrees: degInRashi(houseSid), lord: RASHI_LORDS[ri] };
  });

  const moonSid    = tropToSid(moonTrop, ayanamsa);
  const nakshatra  = getNakshatra(moonSid);
  const moonRashiIndex = degToRashi(moonSid);

  return { julianDay: jd, ayanamsa, ascendant, planets, houses, nakshatra, moonRashiIndex };
}

// ─── Legacy compatibility function ───────────────────────────────────────────
// Used by dashaService / verify_accuracy_fix etc. without lat/lon.

export function calculatePrecisePlanetaryPositions(dateStr: string, timeStr: string) {
  const jd       = dateTimeToJD(dateStr, timeStr, 5.5);
  const ayanamsa = getLahiriAyanamsa(jd);
  const ascendantRaw = calcAscendant(jd, 0, 0, ayanamsa);
  const ascendant = { ...ascendantRaw, sidereal: ascendantRaw.siderealLongitude };

  const sunTrop  = getSunLongitude(jd);
  const moonTrop = getMoonLongitude(jd);
  const moonSid  = tropToSid(moonTrop, ayanamsa);
  const moonRashi = degToRashi(moonSid);
  const toHouse = (sid: number) => Math.floor(norm(sid - moonSid) / 30) + 1;

  const makePlanet = (name: string, trop: number, retro = false) => {
    const sid = tropToSid(trop, ayanamsa);
    const ri  = degToRashi(sid);
    return {
      name, rashiIndex: ri, rashiName: RASHI_NAMES_EN[ri],
      degrees: degInRashi(sid), house: toHouse(sid),
      dignity: getDignity(name, ri), retrograde: retro, sidereal: sid,
    };
  };

  const rahuTrop = getMeanNode(jd);
  const ketuTrop = norm(rahuTrop + 180);

  return {
    planets: [
      makePlanet('Sun',     sunTrop),
      makePlanet('Moon',    moonTrop),
      makePlanet('Mercury', getMercuryLongitude(jd), isRetrograde(jd, getMercuryLongitude)),
      makePlanet('Venus',   getVenusLongitude(jd),   isRetrograde(jd, getVenusLongitude)),
      makePlanet('Mars',    getMarsLongitude(jd),     isRetrograde(jd, getMarsLongitude)),
      makePlanet('Jupiter', getJupiterLongitude(jd),  isRetrograde(jd, getJupiterLongitude)),
      makePlanet('Saturn',  getSaturnLongitude(jd),   isRetrograde(jd, getSaturnLongitude)),
      makePlanet('Rahu',    rahuTrop, true),
      makePlanet('Ketu',    ketuTrop, true),
    ],
    ayanamsa,
    julianDay: jd,
    ascendant,
    sun:  { sidereal: tropToSid(sunTrop,  ayanamsa), rashi: degToRashi(tropToSid(sunTrop,  ayanamsa)), degrees: degInRashi(tropToSid(sunTrop,  ayanamsa)) },
    moon: { sidereal: moonSid, rashi: moonRashi, degrees: degInRashi(moonSid) },
  };
}
