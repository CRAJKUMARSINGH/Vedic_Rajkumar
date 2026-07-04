/**
 * Vedic Astrology Calculation Engine
 * Uses Jean Meeus "Astronomical Algorithms" (2nd ed.) methods
 * Implements Lahiri (Chitrapaksha) ayanamsa
 */

export type RashiName = string;

export const RASHIS_HI = [
  'मेष',
  'वृषभ',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुम्भ',
  'मीन',
];

export const RASHIS_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const PLANETS_HI = [
  'सूर्य',
  'चन्द्र',
  'मंगल',
  'बुध',
  'गुरु',
  'शुक्र',
  'शनि',
  'राहु',
  'केतु',
];
export const PLANETS_EN = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'सू',
  Moon: 'चं',
  Mars: 'मं',
  Mercury: 'बु',
  Jupiter: 'गु',
  Venus: 'शु',
  Saturn: 'श',
  Rahu: 'रा',
  Ketu: 'के',
};

export const RASHI_LORDS: Record<number, string> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter',
};

export const RASHI_LORDS_HI: Record<number, string> = {
  1: 'मंगल',
  2: 'शुक्र',
  3: 'बुध',
  4: 'चन्द्र',
  5: 'सूर्य',
  6: 'बुध',
  7: 'शुक्र',
  8: 'मंगल',
  9: 'गुरु',
  10: 'शनि',
  11: 'शनि',
  12: 'गुरु',
};

export const DIRECTIONS: Record<number, string> = {
  1: 'पूर्व',
  2: 'आग्नेय',
  3: 'दक्षिण',
  4: 'नैऋत्य',
  5: 'पश्चिम',
  6: 'वायव्य',
  7: 'उत्तर',
  8: 'ईशान',
  9: 'पूर्व',
  10: 'आग्नेय',
  11: 'दक्षिण',
  12: 'नैऋत्य',
};

export const DIRECTIONS_EN: Record<number, string> = {
  1: 'East',
  2: 'South-East',
  3: 'South',
  4: 'South-West',
  5: 'West',
  6: 'North-West',
  7: 'North',
  8: 'North-East',
  9: 'East',
  10: 'South-East',
  11: 'South',
  12: 'South-West',
};

export interface PlanetPosition {
  name: string;
  nameHi: string;
  longitude: number; // 0-360 sidereal
  rashi: number; // 1-12
  rashiName: string;
  rashiNameHi: string;
  degree: number; // degree within rashi 0-29.99
  retrograde: boolean;
  house: number; // 1-12 from lagna
}

export interface ChartData {
  lagna: number; // 1-12 rashi
  lagnaLongitude: number; // exact degree
  planets: PlanetPosition[];
  houseRashis: number[]; // houseRashis[0] = lagna rashi, etc.
}

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}
function toDeg(r: number): number {
  return (r * 180) / Math.PI;
}
function normalize(d: number): number {
  return ((d % 360) + 360) % 360;
}

/** Calculate Julian Day Number */
export function julianDay(year: number, month: number, day: number, hour: number): number {
  if (month <= 2) {
    year--;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    hour / 24 +
    B -
    1524.5
  );
}

/** Lahiri ayanamsa calculation - Improved accuracy */
function lahiriAyanamsa(jde: number): number {
  const T = (jde - 2451545.0) / 36525.0;
  // Standard high-precision formula for Lahiri (Chitrapaksha) ayanamsa
  // 23.85472 is the value for J2000.0
  return 23.85472 + 0.0139601 * T * 100 - 0.000308 * T * T;
}

/** Sun longitude - Meeus Chapter 25 */
function sunLongitudeTropical(T: number): number {
  const L0 = normalize(280.46646 + 36000.76983 * T);
  const M = normalize(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = toRad(M);
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  const sunLon = L0 + C;
  // Apparent longitude
  const omega = 125.04 - 1934.136 * T;
  return normalize(sunLon - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
}

/** Sun Radius Vector (Distance) */
function sunRadiusVector(T: number): number {
  const M = normalize(357.52911 + 35999.05029 * T);
  const e = 0.016708634 - 0.000042037 * T;
  const Mrad = toRad(M);
  return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(Mrad));
}

/** Moon longitude - Meeus Chapter 47 (More terms for accuracy) */
function moonLongitudeTropical(T: number): number {
  const L = normalize(218.316447 + 481267.881234 * T);
  const D = normalize(297.850192 + 445267.111403 * T);
  const M = normalize(357.529109 + 35999.050291 * T);
  const Mp = normalize(134.963396 + 477198.867505 * T);
  const F = normalize(93.272095 + 483202.017523 * T);

  const SigmaL =
    6288774 * Math.sin(toRad(Mp)) +
    1274027 * Math.sin(toRad(2 * D - Mp)) +
    658314 * Math.sin(toRad(2 * D)) +
    213618 * Math.sin(toRad(2 * Mp)) -
    185116 * Math.sin(toRad(M)) -
    114332 * Math.sin(toRad(2 * F)) +
    58793 * Math.sin(toRad(2 * D - 2 * Mp)) +
    57066 * Math.sin(toRad(2 * D - M - Mp)) +
    53322 * Math.sin(toRad(2 * D + Mp)) +
    45758 * Math.sin(toRad(2 * D - M)) -
    40923 * Math.sin(toRad(M - Mp)) -
    34720 * Math.sin(toRad(D)) -
    30383 * Math.sin(toRad(M + Mp)) +
    15327 * Math.sin(toRad(2 * D - 2 * F)) -
    12528 * Math.sin(toRad(Mp + 2 * F)) +
    10980 * Math.sin(toRad(Mp - 2 * F)) +
    10675 * Math.sin(toRad(4 * D - Mp)) +
    10034 * Math.sin(toRad(3 * Mp)) +
    8548 * Math.sin(toRad(4 * D - 2 * Mp));

  return normalize(L + SigmaL / 1000000);
}

/** Geocentric correction for planets */
function toGeocentric(Lp: number, Rp: number, Le: number, Re: number): number {
  const x = Rp * Math.cos(toRad(Lp)) - Re * Math.cos(toRad(Le));
  const y = Rp * Math.sin(toRad(Lp)) - Re * Math.sin(toRad(Le));
  return normalize(toDeg(Math.atan2(y, x)));
}

/** Mercury geocentric longitude */
function mercuryLongitudeGeocentric(T: number, sunLon: number, Re: number): number {
  const L = normalize(252.25084 + 149472.67411 * T);
  const M = normalize(174.79479 + 149472.51529 * T);
  const Mrad = toRad(M);
  const e = 0.20563593 + 0.00001906 * T;
  const C = (23.44 - 0.109 * T) * Math.sin(Mrad) + (2.994 - 0.017 * T) * Math.sin(2 * Mrad);
  const Lp = normalize(L + C);
  const Rp = (0.38709893 * (1 - e * e)) / (1 + e * Math.cos(toRad(M + C)));
  const Le = normalize(sunLon + 180);
  return toGeocentric(Lp, Rp, Le, Re);
}

/** Venus geocentric longitude */
function venusLongitudeGeocentric(T: number, sunLon: number, Re: number): number {
  const L = normalize(181.97973 + 58517.81538 * T);
  const M = normalize(50.41611 + 58517.80387 * T);
  const Mrad = toRad(M);
  const e = 0.00677323 - 0.00004935 * T;
  const C = 0.7758 * Math.sin(Mrad) + 0.0033 * Math.sin(2 * Mrad);
  const Lp = normalize(L + C);
  const Rp = (0.72333199 * (1 - e * e)) / (1 + e * Math.cos(toRad(M + C)));
  const Le = normalize(sunLon + 180);
  return toGeocentric(Lp, Rp, Le, Re);
}

/** Mars geocentric longitude */
function marsLongitudeGeocentric(T: number, sunLon: number, Re: number): number {
  const L = normalize(355.43328 + 19140.29931 * T);
  const M = normalize(19.3731 + 19140.3026 * T);
  const Mrad = toRad(M);
  const e = 0.093405 + 0.00009 * T;
  const C = 10.691 * Math.sin(Mrad) + 0.623 * Math.sin(2 * Mrad) + 0.05 * Math.sin(3 * Mrad);
  const Lp = normalize(L + C);
  const Rp = (1.52366231 * (1 - e * e)) / (1 + e * Math.cos(toRad(M + C)));
  const Le = normalize(sunLon + 180);
  return toGeocentric(Lp, Rp, Le, Re);
}

/** Jupiter geocentric longitude */
function jupiterLongitudeGeocentric(T: number, sunLon: number, Re: number): number {
  const L = normalize(34.35148 + 3034.90567 * T);
  const M = normalize(20.02021 + 3034.69202 * T);
  const Mrad = toRad(M);
  const e = 0.048498 - 0.00016 * T;
  const C = 5.555 * Math.sin(Mrad) + 0.168 * Math.sin(2 * Mrad) + 0.007 * Math.sin(3 * Mrad);
  const Lp = normalize(L + C);
  const Rp = (5.20336301 * (1 - e * e)) / (1 + e * Math.cos(toRad(M + C)));
  const Le = normalize(sunLon + 180);
  return toGeocentric(Lp, Rp, Le, Re);
}

/** Saturn geocentric longitude */
function saturnLongitudeGeocentric(T: number, sunLon: number, Re: number): number {
  const L = normalize(50.07747 + 1222.11379 * T);
  const M = normalize(317.02068 + 1222.11366 * T);
  const Mrad = toRad(M);
  const e = 0.055549 - 0.00035 * T;
  const C = 6.359 * Math.sin(Mrad) + 0.22 * Math.sin(2 * Mrad) + 0.011 * Math.sin(3 * Mrad);
  const Lp = normalize(L + C);
  const Rp = (9.53707032 * (1 - e * e)) / (1 + e * Math.cos(toRad(M + C)));
  const Le = normalize(sunLon + 180);
  return toGeocentric(Lp, Rp, Le, Re);
}

/** Rahu (mean north node) */
function rahuLongitude(T: number): number {
  return normalize(125.0445 - 1934.1362 * T + 0.0020708 * T * T);
}

/** Check if planet is retrograde */
function isRetrograde(planet: string, T: number, sunLon: number, Re: number): boolean {
  const dt = 0.01;
  let lon1: number, lon2: number;
  switch (planet) {
    case 'Mercury':
      lon1 = mercuryLongitudeGeocentric(T - dt, sunLon, Re);
      lon2 = mercuryLongitudeGeocentric(T + dt, sunLon, Re);
      break;
    case 'Venus':
      lon1 = venusLongitudeGeocentric(T - dt, sunLon, Re);
      lon2 = venusLongitudeGeocentric(T + dt, sunLon, Re);
      break;
    case 'Mars':
      lon1 = marsLongitudeGeocentric(T - dt, sunLon, Re);
      lon2 = marsLongitudeGeocentric(T + dt, sunLon, Re);
      break;
    case 'Jupiter':
      lon1 = jupiterLongitudeGeocentric(T - dt, sunLon, Re);
      lon2 = jupiterLongitudeGeocentric(T + dt, sunLon, Re);
      break;
    case 'Saturn':
      lon1 = saturnLongitudeGeocentric(T - dt, sunLon, Re);
      lon2 = saturnLongitudeGeocentric(T + dt, sunLon, Re);
      break;
    default:
      return false;
  }
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

/** Ascendant calculation */
function calcAscendant(jde: number, lat: number, lon: number): number {
  const T = (jde - 2451545.0) / 36525.0;
  const theta0 = normalize(
    280.46061837 +
      360.98564736629 * (jde - 2451545.0) +
      0.000387933 * T * T -
      (T * T * T) / 38710000
  );
  const lst = normalize(theta0 + lon);
  const RAMC = toRad(lst);
  const eps = toRad(23.4392911 - (46.815 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600);
  const latRad = toRad(lat);
  const y = Math.cos(RAMC);
  const x = -Math.sin(eps) * Math.tan(latRad) - Math.cos(eps) * Math.sin(RAMC);
  const asc = toDeg(Math.atan2(y, x));
  return normalize(asc);
}

/** Main chart calculation */
export function calculateChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lat: number,
  lon: number,
  timezone: number = 5.5
): ChartData {
  const utcHour = hour + minute / 60 - timezone;
  let utcDay = day;
  const utcMonth = month;
  const utcYear = year;
  let h = utcHour;
  if (h < 0) {
    h += 24;
    utcDay--;
  }
  if (h >= 24) {
    h -= 24;
    utcDay++;
  }

  const jde = julianDay(utcYear, utcMonth, utcDay, h);
  const T = (jde - 2451545.0) / 36525.0;
  const ayanamsa = lahiriAyanamsa(jde);
  const sunTrop = sunLongitudeTropical(T);
  const Re = sunRadiusVector(T);

  const rahuSid = normalize(rahuLongitude(T) - ayanamsa);
  const ketuSid = normalize(rahuSid + 180);

  const ascTrop = calcAscendant(jde, lat, lon);
  const ascSid = normalize(ascTrop - ayanamsa);
  const lagnaRashi = Math.floor(ascSid / 30) + 1;

  const houseRashis: number[] = [];
  for (let i = 0; i < 12; i++) {
    houseRashis.push(((lagnaRashi - 1 + i) % 12) + 1);
  }

  function makePlanet(name: string, lon: number): PlanetPosition {
    const rashi = Math.floor(lon / 30) + 1;
    return {
      name,
      nameHi: PLANETS_HI[name as keyof typeof PLANETS_HI],
      longitude: lon,
      rashi,
      rashiName: RASHIS_EN[rashi - 1],
      rashiNameHi: RASHIS_HI[rashi - 1],
      degree: lon % 30,
      retrograde: isRetrograde(name, T, sunTrop, Re),
      house: ((rashi - lagnaRashi + 12) % 12) + 1,
    };
  }

  const planets: PlanetPosition[] = [
    makePlanet('Sun', normalize(sunTrop - ayanamsa)),
    makePlanet('Moon', normalize(moonLongitudeTropical(T) - ayanamsa)),
    makePlanet('Mercury', normalize(mercuryLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Venus', normalize(venusLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Mars', normalize(marsLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Jupiter', normalize(jupiterLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Saturn', normalize(saturnLongitudeGeocentric(T, sunTrop, Re) - ayanamsa)),
    makePlanet('Rahu', rahuSid),
    makePlanet('Ketu', ketuSid),
  ];

  return {
    lagna: lagnaRashi,
    lagnaLongitude: ascSid,
    planets,
    houseRashis,
  };
}

/** Calculate D-9 (Navamsa) chart */
export function calculateNavamsa(chart: ChartData): ChartData {
  function navamsaRashi(lon: number): number {
    const rashiNum = Math.floor(lon / 30); // 0-11
    const degInRashi = lon - rashiNum * 30; // 0-29.99
    const navamsaNum = Math.floor(degInRashi / (30 / 9)); // 0-8
    // Navamsa starting rashis: Fire signs start from Aries, Earth from Cap, Air from Libra, Water from Cancer
    const elementStart = [1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7, 4]; // per rashi
    const start = elementStart[rashiNum];
    return ((start - 1 + navamsaNum) % 12) + 1;
  }

  const lagnaRashi = navamsaRashi(chart.lagnaLongitude);
  const houseRashis: number[] = [];
  for (let i = 0; i < 12; i++) {
    houseRashis.push(((lagnaRashi - 1 + i) % 12) + 1);
  }

  const planets: PlanetPosition[] = chart.planets.map(p => {
    const rashi = navamsaRashi(p.longitude);
    let house = rashi - lagnaRashi + 1;
    if (house <= 0) house += 12;
    return {
      ...p,
      rashi,
      rashiName: RASHIS_EN[rashi - 1],
      rashiNameHi: RASHIS_HI[rashi - 1],
      degree: 0,
      house,
    };
  });

  return { lagna: lagnaRashi, lagnaLongitude: lagnaRashi * 30 - 15, planets, houseRashis };
}

/** Get 7th lord */
export function getSeventhLord(chart: ChartData): {
  planet: string;
  planetHi: string;
  house: number;
  rashi: number;
} {
  const seventhHouseRashi = chart.houseRashis[6]; // index 6 = 7th house
  const lordName = RASHI_LORDS[seventhHouseRashi];
  const lordNameHi = RASHI_LORDS_HI[seventhHouseRashi];
  const planet = chart.planets.find(p => p.name === lordName);
  return {
    planet: lordName,
    planetHi: lordNameHi,
    house: planet?.house ?? 1,
    rashi: planet?.rashi ?? 1,
  };
}

/** Get trines (1st, 5th, 9th) from a house */
export function getTrines(house: number): number[] {
  return [house, ((house - 1 + 4) % 12) + 1, ((house - 1 + 8) % 12) + 1];
}

/** Get 6th house rashi */
export function getSixthHouseRashi(chart: ChartData): {
  rashi: number;
  rashiName: string;
  rashiNameHi: string;
} {
  const rashi = chart.houseRashis[5];
  return { rashi, rashiName: RASHIS_EN[rashi - 1], rashiNameHi: RASHIS_HI[rashi - 1] };
}

/** Format degree string */
export function formatDegree(lon: number): string {
  const rashi = Math.floor(lon / 30);
  const deg = lon - rashi * 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m}'`;
}

/** Kanchi's birth data (pre-loaded) */
export const KANCHI_BIRTH = {
  name: 'काँची जैन',
  nameEn: 'Kanchi Jain',
  year: 2004,
  month: 9,
  day: 8,
  hour: 1,
  minute: 5,
  lat: 23.84,
  lon: 73.71,
  timezone: 5.5,
  place: 'असपुर, राजस्थान',
  placeEn: 'Aspur, Rajasthan, India',
  relationship: 'पुत्री',
  relationshipEn: 'Daughter',
};

/** Current transits for May 2026 (sidereal, Lahiri) */
export const CURRENT_TRANSITS_2026 = {
  date: 'मई २०२६',
  dateEn: 'May 2026',
  Jupiter: {
    rashi: 3, // Gemini (Mithuna)
    rashiHi: 'मिथुन',
    degree: "18°42'",
    retrograde: false,
    transitDate: 'मई १, २०२५ से मिथुन में',
    nextTransit: 'कर्क में: मई १४, २०२५',
    notes: 'गुरु मिथुन राशि में / बाल्य अवस्था से युवा',
  },
  Saturn: {
    rashi: 12, // Pisces (Meena)
    rashiHi: 'मीन',
    degree: "24°15'",
    retrograde: false,
    transitDate: 'मार्च २०२५ से मीन में',
    nextTransit: 'मेष में: मार्च २९, २०२५',
    notes: 'शनि मीन राशि में',
  },
  transitDates: [
    { planet: 'गुरु', event: 'वक्री आरम्भ', date: 'अक्तूबर ९, २०२५', rashi: 'मिथुन' },
    { planet: 'गुरु', event: 'मार्गी', date: 'फरवरी ४, २०२६', rashi: 'मिथुन' },
    { planet: 'गुरु', event: 'कर्क प्रवेश', date: 'जून १४, २०२६', rashi: 'कर्क' },
    { planet: 'शनि', event: 'मीन में प्रवेश', date: 'मार्च ३०, २०२५', rashi: 'मीन' },
    { planet: 'शनि', event: 'वक्री आरम्भ', date: 'जुलाई १३, २०२५', rashi: 'मीन' },
    { planet: 'शनि', event: 'मार्गी', date: 'नवम्बर २७, २०२५', rashi: 'मीन' },
    { planet: 'शनि', event: 'मेष प्रवेश', date: 'अप्रैल १२, २०२७', rashi: 'मेष' },
  ],
};

/** Vimshottari Dasha system */
const DASHA_ORDER = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};
const DASHA_YEARS_HI: Record<string, string> = {
  Ketu: 'केतु',
  Venus: 'शुक्र',
  Sun: 'सूर्य',
  Moon: 'चन्द्र',
  Mars: 'मंगल',
  Rahu: 'राहु',
  Jupiter: 'गुरु',
  Saturn: 'शनि',
  Mercury: 'बुध',
};

const NAKSHATRA_LORDS = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

export interface DashaPeriod {
  lord: string;
  lordHi: string;
  start: Date;
  end: Date;
  years: number;
  antarDashas: { lord: string; lordHi: string; start: Date; end: Date }[];
}

export function calculateDasha(birthDate: Date, moonLongitude: number): DashaPeriod[] {
  // Find nakshatra from moon longitude
  const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex];
  const degInNakshatra = moonLongitude - nakshatraIndex * (360 / 27);
  const nakshatraSpan = 360 / 27;
  const elapsed = degInNakshatra / nakshatraSpan; // fraction elapsed
  const lordIndex = DASHA_ORDER.indexOf(nakshatraLord);

  const dashas: DashaPeriod[] = [];
  let currentDate = new Date(birthDate);
  // Subtract elapsed portion of first dasha
  const firstDashaYears = DASHA_YEARS[nakshatraLord];
  const elapsedYears = elapsed * firstDashaYears;
  currentDate = new Date(birthDate.getTime() - elapsedYears * 365.25 * 24 * 3600 * 1000);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(lordIndex + i) % 9];
    const years = DASHA_YEARS[lord];
    const start = new Date(currentDate);
    const end = new Date(currentDate.getTime() + years * 365.25 * 24 * 3600 * 1000);

    // Antardashas
    const antarDashas: { lord: string; lordHi: string; start: Date; end: Date }[] = [];
    let aStart = new Date(start);
    for (let j = 0; j < 9; j++) {
      const aLord = DASHA_ORDER[(DASHA_ORDER.indexOf(lord) + j) % 9];
      const aYears = (DASHA_YEARS[lord] * DASHA_YEARS[aLord]) / 120;
      const aEnd = new Date(aStart.getTime() + aYears * 365.25 * 24 * 3600 * 1000);
      antarDashas.push({
        lord: aLord,
        lordHi: DASHA_YEARS_HI[aLord],
        start: new Date(aStart),
        end: aEnd,
      });
      aStart = aEnd;
    }

    dashas.push({ lord, lordHi: DASHA_YEARS_HI[lord], start, end, years, antarDashas });
    currentDate = end;
  }

  return dashas;
}

export function formatDate(d: Date): string {
  const months = [
    'जन',
    'फर',
    'मार्च',
    'अप्र',
    'मई',
    'जून',
    'जुल',
    'अग',
    'सित',
    'अक्त',
    'नव',
    'दिस',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateEn(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
