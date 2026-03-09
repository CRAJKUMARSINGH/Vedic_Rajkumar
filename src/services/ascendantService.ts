/**
 * Ascendant (Lagna) Calculation Service
 * Calculates rising sign and house cusps for Vedic astrology
 */

import {
  dateToJulianDay,
  localToUTC,
  calculateAyanamsa,
  tropicalToSidereal,
  longitudeToRashi,
  degreesInRashi,
} from './ephemerisService';

/**
 * Calculate Local Sidereal Time (LST)
 */
export function calculateLST(jd: number, longitude: number): number {
  // Greenwich Sidereal Time at 0h UT
  const T = (jd - 2451545.0) / 36525;
  const GST0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
               0.000387933 * T * T - T * T * T / 38710000;
  
  // Local Sidereal Time
  const LST = GST0 + longitude;
  
  // Normalize to 0-360
  return ((LST % 360) + 360) % 360;
}

/**
 * Calculate Ascendant (Rising Sign) - Simplified method
 * Uses the formula: tan(Ascendant) = -cos(LST) / (sin(LST) * cos(obliquity) + tan(latitude) * sin(obliquity))
 */
export function calculateAscendant(
  jd: number,
  latitude: number,
  longitude: number
): number {
  // Calculate Local Sidereal Time
  const lst = calculateLST(jd, longitude);
  const lstRad = lst * Math.PI / 180;
  
  // Obliquity of ecliptic (approximately 23.44°)
  const obliquity = 23.44;
  const oblRad = obliquity * Math.PI / 180;
  
  // Latitude in radians
  const latRad = latitude * Math.PI / 180;
  
  // Calculate Ascendant using simplified formula
  // This is an approximation - for exact calculations, use Swiss Ephemeris
  const numerator = -Math.cos(lstRad);
  const denominator = Math.sin(lstRad) * Math.cos(oblRad) + 
                      Math.tan(latRad) * Math.sin(oblRad);
  
  let ascendant = Math.atan2(numerator, denominator) * 180 / Math.PI;
  
  // Normalize to 0-360
  ascendant = ((ascendant % 360) + 360) % 360;
  
  return ascendant;
}

/**
 * Calculate all 12 house cusps using Equal House system
 * In Equal House system, each house is exactly 30° from the Ascendant
 */
export function calculateHouseCusps(ascendantLongitude: number): number[] {
  const cusps: number[] = [];
  
  for (let i = 0; i < 12; i++) {
    const cusp = (ascendantLongitude + i * 30) % 360;
    cusps.push(cusp);
  }
  
  return cusps;
}

/**
 * Determine house lords (Bhava Adhipati) based on house cusps
 */
export function getHouseLords(houseCusps: number[]): number[] {
  // Each rashi has a lord:
  // 0-Aries: Mars, 1-Taurus: Venus, 2-Gemini: Mercury, 3-Cancer: Moon
  // 4-Leo: Sun, 5-Virgo: Mercury, 6-Libra: Venus, 7-Scorpio: Mars
  // 8-Sagittarius: Jupiter, 9-Capricorn: Saturn, 10-Aquarius: Saturn, 11-Pisces: Jupiter
  
  const rashiLords = [
    3, // Aries - Mars
    5, // Taurus - Venus
    2, // Gemini - Mercury
    1, // Cancer - Moon
    0, // Leo - Sun
    2, // Virgo - Mercury
    5, // Libra - Venus
    3, // Scorpio - Mars
    4, // Sagittarius - Jupiter
    6, // Capricorn - Saturn
    6, // Aquarius - Saturn
    4, // Pisces - Jupiter
  ];
  
  return houseCusps.map(cusp => {
    const rashi = Math.floor(cusp / 30);
    return rashiLords[rashi];
  });
}

/**
 * Get planet name from index
 */
export function getPlanetName(index: number): string {
  const planets = ['Sun', 'Moon', 'Mercury', 'Mars', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  return planets[index] || 'Unknown';
}

/**
 * Complete Ascendant calculation with all details
 */
export interface AscendantData {
  ascendant: {
    tropical: number;
    sidereal: number;
    rashi: number;
    degrees: number;
    rashiName: string;
  };
  houseCusps: {
    house: number;
    cusp: number;
    rashi: number;
    rashiName: string;
    lord: string;
  }[];
  ayanamsa: number;
  lst: number;
}

export function calculateCompleteAscendant(
  dateStr: string,
  timeStr: string,
  latitude: number,
  longitude: number
): AscendantData {
  // Convert to UTC
  const utcDate = localToUTC(dateStr, timeStr);
  
  // Calculate Julian Day
  const jd = dateToJulianDay(utcDate);
  
  // Calculate Ayanamsa
  const ayanamsa = calculateAyanamsa(utcDate);
  
  // Calculate LST
  const lst = calculateLST(jd, longitude);
  
  // Calculate tropical Ascendant
  const ascendantTropical = calculateAscendant(jd, latitude, longitude);
  
  // Convert to sidereal
  const ascendantSidereal = tropicalToSidereal(ascendantTropical, ayanamsa);
  
  // Get rashi and degrees
  const ascendantRashi = longitudeToRashi(ascendantSidereal);
  const ascendantDegrees = degreesInRashi(ascendantSidereal);
  
  // Calculate house cusps (sidereal)
  const cusps = calculateHouseCusps(ascendantSidereal);
  
  // Get house lords
  const lords = getHouseLords(cusps);
  
  // Rashi names
  const rashiNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Format house cusps data
  const houseCuspsData = cusps.map((cusp, index) => ({
    house: index + 1,
    cusp: cusp,
    rashi: longitudeToRashi(cusp),
    rashiName: rashiNames[longitudeToRashi(cusp)],
    lord: getPlanetName(lords[index]),
  }));
  
  return {
    ascendant: {
      tropical: ascendantTropical,
      sidereal: ascendantSidereal,
      rashi: ascendantRashi,
      degrees: ascendantDegrees,
      rashiName: rashiNames[ascendantRashi],
    },
    houseCusps: houseCuspsData,
    ayanamsa,
    lst,
  };
}

/**
 * Format Ascendant for display
 */
export function formatAscendant(data: AscendantData): string {
  const deg = Math.floor(data.ascendant.degrees);
  const min = Math.floor((data.ascendant.degrees - deg) * 60);
  
  return `${data.ascendant.rashiName} ${deg}°${min}'`;
}

/**
 * Note: This implementation uses simplified algorithms.
 * Accuracy: ±2-3 degrees for Ascendant
 * 
 * For production accuracy, consider:
 * 1. Swiss Ephemeris (most accurate)
 * 2. Professional astrology API
 * 3. Placidus or other house systems
 */
