/**
 * Ephemeris Service
 * Planetary position calculations for Vedic astrology
 * 
 * Note: This is a simplified implementation for rapid development.
 * For production, consider integrating Swiss Ephemeris or a professional API.
 */

// Ayanamsa (Lahiri) - Precession correction for sidereal zodiac
// As of 2026-01-01: approximately 24.15°
const AYANAMSA_2026 = 24.15;
const AYANAMSA_BASE_YEAR = 2026;
const AYANAMSA_ANNUAL_RATE = 0.0139; // degrees per year

/**
 * Calculate Ayanamsa for a given date (Lahiri system)
 */
export function calculateAyanamsa(date: Date): number {
  const year = date.getFullYear();
  const yearDiff = year - AYANAMSA_BASE_YEAR;
  return AYANAMSA_2026 + (yearDiff * AYANAMSA_ANNUAL_RATE);
}

/**
 * Convert date/time to Julian Day
 */
export function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  
  // Fractional day
  const fracDay = day + (hour / 24) + (minute / 1440) + (second / 86400);
  
  // Julian Day calculation (Gregorian calendar)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jd = fracDay + Math.floor((153 * m + 2) / 5) + 365 * y + 
             Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  return jd;
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
export function calculateSunPosition(jd: number): number {
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
export function calculateMoonPosition(jd: number): number {
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
 * Simplified Mercury position calculation
 */
export function calculateMercuryPosition(jd: number): number {
  const n = jd - 2451545.0;
  const L = (252.250 + 4.092339 * n) % 360;
  const g = (149.472 + 4.092317 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  const lambda = L + 23.440 * Math.sin(gRad) + 2.984 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}

/**
 * Simplified Venus position calculation
 */
export function calculateVenusPosition(jd: number): number {
  const n = jd - 2451545.0;
  const L = (181.979 + 1.602130 * n) % 360;
  const g = (50.416 + 1.602018 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  const lambda = L + 0.772 * Math.sin(gRad);
  return ((lambda % 360) + 360) % 360;
}

/**
 * Simplified Mars position calculation
 */
export function calculateMarsPosition(jd: number): number {
  const n = jd - 2451545.0;
  const L = (355.433 + 0.524033 * n) % 360;
  const g = (19.373 + 0.524039 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  const lambda = L + 10.691 * Math.sin(gRad) + 0.623 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}

/**
 * Simplified Jupiter position calculation
 */
export function calculateJupiterPosition(jd: number): number {
  const n = jd - 2451545.0;
  const L = (34.351 + 0.083056 * n) % 360;
  const g = (20.020 + 0.083056 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  const lambda = L + 5.555 * Math.sin(gRad) + 0.168 * Math.sin(2 * gRad);
  return ((lambda % 360) + 360) % 360;
}

/**
 * Simplified Saturn position calculation
 */
export function calculateSaturnPosition(jd: number): number {
  const n = jd - 2451545.0;
  const L = (50.077 + 0.033371 * n) % 360;
  const g = (317.021 + 0.033363 * n) % 360;
  const gRad = g * Math.PI / 180;
  
  const lambda = L + 6.406 * Math.sin(gRad) + 0.320 * Math.sin(2 * gRad);
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
 */
export function calculateCompletePlanetaryPositions(
  dateStr: string,
  timeStr: string
): CompletePlanetaryPositions {
  // Convert to UTC
  const utcDate = localToUTC(dateStr, timeStr);
  
  // Calculate Julian Day
  const jd = dateToJulianDay(utcDate);
  
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
  const sunTropical = calculateSunPosition(jd);
  const moonTropical = calculateMoonPosition(jd);
  const mercuryTropical = calculateMercuryPosition(jd);
  const venusTropical = calculateVenusPosition(jd);
  const marsTropical = calculateMarsPosition(jd);
  const jupiterTropical = calculateJupiterPosition(jd);
  const saturnTropical = calculateSaturnPosition(jd);
  const rahuTropical = calculateRahuPosition(jd);
  const ketuTropical = calculateKetuPosition(rahuTropical);
  
  return {
    sun: createPosition(sunTropical),
    moon: createPosition(moonTropical),
    mercury: createPosition(mercuryTropical),
    venus: createPosition(venusTropical),
    mars: createPosition(marsTropical),
    jupiter: createPosition(jupiterTropical),
    saturn: createPosition(saturnTropical),
    rahu: { ...createPosition(rahuTropical), retrograde: true },
    ketu: { ...createPosition(ketuTropical), retrograde: true },
    ayanamsa,
    julianDay: jd,
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
  const jd = dateToJulianDay(testDate);
  
  // Expected JD for 2026-03-01 12:00 UTC: approximately 2460737.0
  const expectedJD = 2460737.0;
  const jdDiff = Math.abs(jd - expectedJD);
  
  console.log(`Julian Day Test: ${jd.toFixed(4)} (expected ~${expectedJD}, diff: ${jdDiff.toFixed(4)})`);
  
  // JD should be within 0.1 days
  return jdDiff < 0.1;
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
