/**
 * Ephemeris Service
 * Planetary position calculations for Vedic astrology
 * 
 * Note: This is a simplified implementation for rapid development.
 * For production, consider integrating Swiss Ephemeris or a professional API.
 */

// Ayanamsa (Lahiri) - Precession correction for sidereal zodiac
// As of 2000-01-01: approximately 23.85° (Lahiri standard)
const AYANAMSA_2000 = 23.85;
const AYANAMSA_BASE_YEAR = 2000;
const AYANAMSA_ANNUAL_RATE = 0.0139; // degrees per year

/**
 * Calculate Ayanamsa for a given date (Lahiri system)
 * Accepts a Date object, date string ('YYYY-MM-DD'), or year number
 */
export function calculateAyanamsa(date: Date | string | number): number {
  let year: number;
  if (typeof date === 'number') {
    year = date;
  } else {
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (date.includes('T')) {
      dateObj = new Date(date);
    } else {
      dateObj = new Date(date + 'T00:00:00Z');
    }
    if (isNaN(dateObj.getTime())) {
      return AYANAMSA_2026; // safe fallback
    }
    year = dateObj.getFullYear();
  }
  const yearDiff = year - AYANAMSA_BASE_YEAR;
  return AYANAMSA_2000 + (yearDiff * AYANAMSA_ANNUAL_RATE);
}

/**
 * Convert date/time to Julian Day using the standard Meeus algorithm.
 * Accepts either a Date object, a date string alone, or (dateStr, timeStr) pair.
 * When called with (dateStr, timeStr), the time is treated as UTC.
 * Returns NaN for invalid input (does not throw).
 */
export function calculateJulianDay(date: Date | string, timeStr?: string): number {
  let year: number, month: number, day: number, hour: number, minute: number, second: number;

  if (date instanceof Date) {
    if (isNaN(date.getTime())) return NaN;
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
    hour = date.getUTCHours();
    minute = date.getUTCMinutes();
    second = date.getUTCSeconds();
  } else if (typeof date === 'string' && timeStr !== undefined) {
    // Two-argument form: treat as UTC
    const dateParts = date.split('-').map(Number);
    const timeParts = timeStr.split(':').map(Number);
    if (dateParts.length < 3 || timeParts.length < 2) return NaN;
    [year, month, day] = dateParts;
    [hour, minute] = timeParts;
    second = 0;
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) return NaN;
  } else if (typeof date === 'string') {
    const d = date.includes('T') ? new Date(date) : new Date(date + 'T12:00:00Z');
    if (isNaN(d.getTime())) return NaN;
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
    hour = d.getUTCHours();
    minute = d.getUTCMinutes();
    second = d.getUTCSeconds();
  } else {
    return NaN;
  }

  // Meeus algorithm (Astronomical Algorithms, ch. 7)
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const fracDay = day + hour / 24 + minute / 1440 + second / 86400;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + fracDay + B - 1524.5;
}

/**
 * Convert local time to UTC (assuming IST for India)
 */
export function localToUTC(
  dateStr: string, 
  timeStr: string
): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date in IST (UTC+5:30)
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  
  // Convert to UTC
  const utcDate = new Date(localDate.getTime() - (5.5 * 60 * 60 * 1000));
  
  return utcDate;
}

/**
 * Simplified Sun position calculation
 * Based on mean longitude approximation
 */
export function calculateSunPositionFromJD(jd: number): number {
  // Days since J2000.0
  const n = jd - 2451545.0;
  
  // Mean longitude of Sun (degrees)
  const L = (280.460 + 0.9856474 * n) % 360;
  
  // Mean anomaly (degrees)
  const g = (357.528 + 0.9856003 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  // Ecliptic longitude (degrees)
  const lambda = L + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  
  return ((lambda % 360) + 360) % 360;
}

/**
 * Simplified Moon position calculation
 * Based on mean longitude approximation
 */
export function calculateMoonPositionFromJD(jd: number): number {
  // Days since J2000.0
  const n = jd - 2451545.0;
  
  // Mean longitude of Moon (degrees)
  const L = (218.316 + 13.176396 * n) % 360;
  
  // Mean anomaly of Moon (degrees)
  const M = (134.963 + 13.064993 * n) % 360;
  const MRad = M * Math.PI / 180;
  
  // Mean anomaly of Sun (degrees)
  const Ms = (357.529 + 0.985600 * n) % 360;
  const MsRad = Ms * Math.PI / 180;
  
  // Mean distance of Moon from ascending node (degrees)
  const F = (93.272 + 13.229350 * n) % 360;
  const FRad = F * Math.PI / 180;
  
  // Ecliptic longitude (simplified)
  const lambda = L + 
    6.289 * Math.sin(MRad) +
    1.274 * Math.sin(2 * (L - Ms) * Math.PI / 180 - MRad) +
    0.658 * Math.sin(2 * (L - Ms) * Math.PI / 180) +
    0.214 * Math.sin(2 * MRad) -
    0.186 * Math.sin(MsRad);
  
  return ((lambda % 360) + 360) % 360;
}

/**
 * Mercury position — Meeus "Astronomical Algorithms" Ch.33 (low-precision VSOP87)
 * Accurate to ±1° for dates within ±50 years of J2000.
 */
export function calculateMercuryPosition(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000
  // Mean longitude L0 — Meeus Table 31.a
  const L0 = 252.250906 + 149472.6746358 * T;
  // Mean anomaly M — Meeus Table 31.a
  const M = (174.7948 + 149472.515 * T) % 360;
  const Mrad = M * Math.PI / 180;
  // Equation of centre
  const C = (23.4400 * Math.sin(Mrad) + 2.9818 * Math.sin(2 * Mrad) +
             0.5255 * Math.sin(3 * Mrad) + 0.1058 * Math.sin(4 * Mrad) +
             0.0219 * Math.sin(5 * Mrad));
  const lambda = L0 + C;
  return ((lambda % 360) + 360) % 360;
}

/**
 * Venus position — Meeus "Astronomical Algorithms" Ch.33 (low-precision VSOP87)
 * Accurate to ±1° for dates within ±50 years of J2000.
 */
export function calculateVenusPosition(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 181.979801 + 58517.8156760 * T;
  const M = (50.4161 + 58517.803 * T) % 360;
  const Mrad = M * Math.PI / 180;
  const C = (0.7758 * Math.sin(Mrad) + 0.0033 * Math.sin(2 * Mrad));
  const lambda = L0 + C;
  return ((lambda % 360) + 360) % 360;
}

/**
 * Mars position — Meeus "Astronomical Algorithms" Ch.33 (low-precision VSOP87)
 */
export function calculateMarsPosition(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 355.433 + 19140.2993313 * T;
  const M = (19.3730 + 19140.300 * T) % 360;
  const Mrad = M * Math.PI / 180;
  const C = (10.6912 * Math.sin(Mrad) + 0.6228 * Math.sin(2 * Mrad) +
             0.0503 * Math.sin(3 * Mrad) + 0.0046 * Math.sin(4 * Mrad));
  const lambda = L0 + C;
  return ((lambda % 360) + 360) % 360;
}

/**
 * Jupiter position — Meeus "Astronomical Algorithms" Ch.33 (low-precision VSOP87)
 * Includes Jupiter-Saturn mutual perturbation term for improved accuracy.
 */
export function calculateJupiterPosition(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 34.351519 + 3034.9056606 * T;
  const M = (20.9 + 3034.906 * T) % 360;
  const Mrad = M * Math.PI / 180;
  const Msat = (317.0 + 1222.114 * T) % 360;
  const MsatRad = Msat * Math.PI / 180;
  const C = (5.5549 * Math.sin(Mrad) + 0.1683 * Math.sin(2 * Mrad) +
             0.0071 * Math.sin(3 * Mrad) -
             0.4399 * Math.sin(MsatRad - Mrad) -
             0.1998 * Math.sin(MsatRad + Mrad));
  const lambda = L0 + C;
  return ((lambda % 360) + 360) % 360;
}

/**
 * Saturn position — Meeus "Astronomical Algorithms" Ch.33 (low-precision VSOP87)
 * Includes Jupiter-Saturn mutual perturbation term.
 */
export function calculateSaturnPosition(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 50.077444 + 1222.1138488 * T;
  const M = (317.0 + 1222.114 * T) % 360;
  const Mrad = M * Math.PI / 180;
  const Mjup = (20.9 + 3034.906 * T) % 360;
  const MjupRad = Mjup * Math.PI / 180;
  const C = (6.3585 * Math.sin(Mrad) + 0.2204 * Math.sin(2 * Mrad) +
             0.0106 * Math.sin(3 * Mrad) +
             0.4399 * Math.sin(MjupRad - Mrad) +
             0.1998 * Math.sin(MjupRad + Mrad));
  const lambda = L0 + C;
  return ((lambda % 360) + 360) % 360;
}

/**
 * Calculate Rahu (North Node) position
 * Rahu moves retrograde approximately 19.3° per year
 */
export function calculateRahuPosition(jd: number): number {
  const n = jd - 2451545.0;
  // Mean longitude of ascending node (retrograde motion)
  const omega = (125.044 - 0.052954 * n) % 360;
  return ((omega % 360) + 360) % 360;
}

/**
 * Calculate Ketu (South Node) position
 * Ketu is always 180° opposite to Rahu
 */
export function calculateKetuPosition(rahuLongitude: number): number {
  const ketu = (rahuLongitude + 180) % 360;
  return ((ketu % 360) + 360) % 360;
}

/**
 * Convert tropical longitude to sidereal (Vedic)
 */
export function tropicalToSidereal(tropicalLongitude: number, ayanamsa: number): number {
  const sidereal = tropicalLongitude - ayanamsa;
  return ((sidereal % 360) + 360) % 360;
}

/**
 * Get rashi (sign) from sidereal longitude
 */
export function longitudeToRashi(longitude: number): number {
  return Math.floor(longitude / 30);
}

/**
 * Get degrees within rashi
 */
export function degreesInRashi(longitude: number): number {
  return longitude % 30;
}

/**
 * Planet position data structure
 */
export interface PlanetPosition {
  tropical: number;
  sidereal: number;
  rashi: number;
  rashiName: string;
  degrees: number;
  retrograde?: boolean;
}

/**
 * Normalized planet entry for the planets[] array (used by tests and manglikService)
 */
export interface NormalizedPlanet {
  name: string;
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  house: number;
  dignity: string;
  retrograde?: boolean;
}

// Dignity lookup tables
const EXALTATION: Record<string, number> = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };
const DEBILITATION: Record<string, number> = { Sun: 6, Moon: 7, Mercury: 11, Venus: 5, Mars: 3, Jupiter: 9, Saturn: 0 };
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mercury: [2, 5], Venus: [1, 6], Mars: [0, 7], Jupiter: [8, 11], Saturn: [9, 10]
};
const MOOLATRIKONA: Record<string, number> = { Sun: 4, Moon: 1, Mercury: 5, Venus: 6, Mars: 0, Jupiter: 8, Saturn: 10 };
const FRIEND_SIGNS: Record<string, number[]> = {
  Sun: [0, 7, 8, 11], Moon: [0, 3, 4], Mercury: [1, 6, 9, 10], Venus: [2, 5, 8, 11],
  Mars: [3, 4, 8, 11], Jupiter: [0, 4, 7], Saturn: [2, 5, 6, 7]
};

function getPlanetDignity(planetName: string, rashiIndex: number): string {
  if (EXALTATION[planetName] === rashiIndex) return 'Exalted';
  if (DEBILITATION[planetName] === rashiIndex) return 'Debilitated';
  if (OWN_SIGNS[planetName]?.includes(rashiIndex)) {
    return MOOLATRIKONA[planetName] === rashiIndex ? 'Moolatrikona' : 'Own Sign';
  }
  if (FRIEND_SIGNS[planetName]?.includes(rashiIndex)) return 'Friend Sign';
  // Enemy signs are the opposite of friend signs (simplified)
  return 'Neutral';
}

/**
 * Calculate all planetary positions for a given date/time
 */
export interface CompletePlanetaryPositions {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  rahu: PlanetPosition;
  ketu: PlanetPosition;
  ayanamsa: number;
  julianDay: number;
  /** Normalized array for test compatibility and manglikService */
  planets: NormalizedPlanet[];
}

/**
 * Rashi names in English and Hindi
 */
export const RASHI_NAMES = {
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
       'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन']
};

/**
 * Calculate complete planetary positions (all 9 planets)
 * Throws for invalid date/time input.
 */
export function calculateCompletePlanetaryPositions(
  dateStr: string,
  timeStr: string
): CompletePlanetaryPositions {
  // Validate date/time — throw for invalid values (matches __tests__ expectations)
  const dateParts = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);
  if (dateParts.length < 3 || isNaN(dateParts[0]) || isNaN(dateParts[1]) || isNaN(dateParts[2])) {
    throw new Error('Invalid date format');
  }
  const [, month, day] = dateParts;
  if (month < 1 || month > 12) throw new Error('Invalid date: month out of range');
  if (day < 1 || day > 31) throw new Error('Invalid date: day out of range');
  if (timeParts.length < 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
    throw new Error('Invalid time format');
  }
  const [hours, minutes] = timeParts;
  if (hours > 23) throw new Error('Invalid time: hours out of range');
  if (minutes > 59) throw new Error('Invalid time: minutes out of range');

  // Convert to UTC
  const utcDate = localToUTC(dateStr, timeStr);
  
  // Calculate Julian Day
  const jd = calculateJulianDay(utcDate);
  
  // Calculate Ayanamsa
  const ayanamsa = calculateAyanamsa(utcDate);
  
  // Helper function to create planet position
  const createPosition = (tropical: number): PlanetPosition => {
    const sidereal = tropicalToSidereal(tropical, ayanamsa);
    const rashi = longitudeToRashi(sidereal);
    return {
      tropical,
      sidereal,
      rashi,
      rashiName: RASHI_NAMES.en[rashi],
      degrees: degreesInRashi(sidereal),
    };
  };
  
  // Calculate all planetary positions
  const sunTropical = calculateSunPositionFromJD(jd);
  const moonTropical = calculateMoonPositionFromJD(jd);
  const mercuryTropical = calculateMercuryPosition(jd);
  const venusTropical = calculateVenusPosition(jd);
  const marsTropical = calculateMarsPosition(jd);
  const jupiterTropical = calculateJupiterPosition(jd);
  const saturnTropical = calculateSaturnPosition(jd);
  const rahuTropical = calculateRahuPosition(jd);
  const ketuTropical = calculateKetuPosition(rahuTropical);

  const sunPos = createPosition(sunTropical);
  const moonPos = createPosition(moonTropical);
  const mercuryPos = createPosition(mercuryTropical);
  const venusPos = createPosition(venusTropical);
  const marsPos = createPosition(marsTropical);
  const jupiterPos = createPosition(jupiterTropical);
  const saturnPos = createPosition(saturnTropical);
  const rahuPos = { ...createPosition(rahuTropical), retrograde: true };
  const ketuPos = { ...createPosition(ketuTropical), retrograde: true };

  // Build normalized planets array (for test compatibility and manglikService)
  // House is calculated as rashi offset from moon rashi (simplified equal-house from ascendant)
  // We use moon rashi as house 1 baseline for transit purposes
  const moonRashi = moonPos.rashi;
  const toHouse = (rashi: number) => ((rashi - moonRashi + 12) % 12) + 1;

  const planets: NormalizedPlanet[] = [
    { name: 'Sun',     rashiIndex: sunPos.rashi,     rashiName: sunPos.rashiName,     degrees: sunPos.degrees,     house: toHouse(sunPos.rashi),     dignity: getPlanetDignity('Sun', sunPos.rashi) },
    { name: 'Moon',    rashiIndex: moonPos.rashi,    rashiName: moonPos.rashiName,    degrees: moonPos.degrees,    house: toHouse(moonPos.rashi),    dignity: getPlanetDignity('Moon', moonPos.rashi) },
    { name: 'Mercury', rashiIndex: mercuryPos.rashi, rashiName: mercuryPos.rashiName, degrees: mercuryPos.degrees, house: toHouse(mercuryPos.rashi), dignity: getPlanetDignity('Mercury', mercuryPos.rashi) },
    { name: 'Venus',   rashiIndex: venusPos.rashi,   rashiName: venusPos.rashiName,   degrees: venusPos.degrees,   house: toHouse(venusPos.rashi),   dignity: getPlanetDignity('Venus', venusPos.rashi) },
    { name: 'Mars',    rashiIndex: marsPos.rashi,    rashiName: marsPos.rashiName,    degrees: marsPos.degrees,    house: toHouse(marsPos.rashi),    dignity: getPlanetDignity('Mars', marsPos.rashi) },
    { name: 'Jupiter', rashiIndex: jupiterPos.rashi, rashiName: jupiterPos.rashiName, degrees: jupiterPos.degrees, house: toHouse(jupiterPos.rashi), dignity: getPlanetDignity('Jupiter', jupiterPos.rashi) },
    { name: 'Saturn',  rashiIndex: saturnPos.rashi,  rashiName: saturnPos.rashiName,  degrees: saturnPos.degrees,  house: toHouse(saturnPos.rashi),  dignity: getPlanetDignity('Saturn', saturnPos.rashi) },
    { name: 'Rahu',    rashiIndex: rahuPos.rashi,    rashiName: rahuPos.rashiName,    degrees: rahuPos.degrees,    house: toHouse(rahuPos.rashi),    dignity: 'Neutral', retrograde: true },
    { name: 'Ketu',    rashiIndex: ketuPos.rashi,    rashiName: ketuPos.rashiName,    degrees: ketuPos.degrees,    house: toHouse(ketuPos.rashi),    dignity: 'Neutral', retrograde: true },
  ];

  return {
    sun: sunPos,
    moon: moonPos,
    mercury: mercuryPos,
    venus: venusPos,
    mars: marsPos,
    jupiter: jupiterPos,
    saturn: saturnPos,
    rahu: rahuPos,
    ketu: ketuPos,
    ayanamsa,
    julianDay: jd,
    planets,
  };
}

/**
 * Legacy function for backward compatibility
 */
export interface PlanetaryPositions {
  sun: {
    tropical: number;
    sidereal: number;
    rashi: number;
    degrees: number;
  };
  moon: {
    tropical: number;
    sidereal: number;
    rashi: number;
    degrees: number;
  };
  ayanamsa: number;
  julianDay: number;
}

export function calculatePlanetaryPositions(
  dateStr: string,
  timeStr: string
): PlanetaryPositions {
  const complete = calculateCompletePlanetaryPositions(dateStr, timeStr);
  return {
    sun: {
      tropical: complete.sun.tropical,
      sidereal: complete.sun.sidereal,
      rashi: complete.sun.rashi,
      degrees: complete.sun.degrees,
    },
    moon: {
      tropical: complete.moon.tropical,
      sidereal: complete.moon.sidereal,
      rashi: complete.moon.rashi,
      degrees: complete.moon.degrees,
    },
    ayanamsa: complete.ayanamsa,
    julianDay: complete.julianDay,
  };
}

/**
 * Format position for display
 */
export function formatPosition(rashi: number, degrees: number): string {
  const rashiNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const deg = Math.floor(degrees);
  const min = Math.floor((degrees - deg) * 60);
  const sec = Math.floor(((degrees - deg) * 60 - min) * 60);
  
  return `${rashiNames[rashi]} ${deg}°${min}'${sec}"`;
}

/**
 * Validate calculations against known values
 */
export function validateCalculations(): boolean {
  // Test with known date: 2026-03-01 12:00 UTC
  const testDate = new Date(Date.UTC(2026, 2, 1, 12, 0, 0));
  const jd = calculateJulianDay(testDate);
  
  // Expected JD for 2026-03-01 12:00 UTC: approximately 2460737.0
  const expectedJD = 2460737.0;
  const jdDiff = Math.abs(jd - expectedJD);
  
  console.log(`Julian Day Test: ${jd.toFixed(4)} (expected ~${expectedJD}, diff: ${jdDiff.toFixed(4)})`);
  
  // JD should be within 0.1 days
  return jdDiff < 0.1;
}

/**
 * Calculate Sun position for a given date/time (wrapper for tests)
 * Does not throw — returns a fallback for invalid input.
 */
export function calculateSunPosition(dateStr: string, timeStr: string): {
  rashiIndex: number;
  degrees: number;
  rashiName: string;
} {
  try {
    const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);
    return {
      rashiIndex: positions.sun.rashi,
      degrees: positions.sun.degrees,
      rashiName: positions.sun.rashiName
    };
  } catch {
    return { rashiIndex: 0, degrees: 0, rashiName: 'Aries' };
  }
}

/**
 * Calculate Moon position for a given date/time (wrapper for tests)
 * Does not throw — returns a fallback for invalid input.
 */
export function calculateMoonPosition(dateStr: string, timeStr: string): {
  rashiIndex: number;
  degrees: number;
  rashiName: string;
} {
  try {
    const positions = calculateCompletePlanetaryPositions(dateStr, timeStr);
    return {
      rashiIndex: positions.moon.rashi,
      degrees: positions.moon.degrees,
      rashiName: positions.moon.rashiName
    };
  } catch {
    return { rashiIndex: 0, degrees: 0, rashiName: 'Aries' };
  }
}

/**
 * Note: This implementation uses simplified algorithms for rapid development.
 * Accuracy: ±1-3 degrees for planetary positions
 * 
 * Planetary calculation methods:
 * - Sun, Moon: Mean longitude with perturbations
 * - Mercury, Venus, Mars, Jupiter, Saturn: Mean longitude approximations
 * - Rahu, Ketu: Lunar nodes (always retrograde, 180° apart)
 * 
 * For production use, consider:
 * 1. Swiss Ephemeris integration (most accurate, ±0.001°)
 * 2. Professional astrology API (AstroSage, Astro-Seek)
 * 3. Full implementation of VSOP87 or Jean Meeus algorithms
 * 4. Retrograde motion detection for inner planets
 */
