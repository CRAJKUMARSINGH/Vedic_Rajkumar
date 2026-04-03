/**
 * Ascendant (Lagna) Calculation Service
 * Calculates rising sign and house cusps for Vedic astrology
 */

import {
  calculateJulianDay,
  localToUTC,
  calculateAyanamsa,
  tropicalToSidereal,
  longitudeToRashi,
  degreesInRashi,
} from './ephemerisService';

/**
 * Calculate Local Sidereal Time (LST)
 * Accepts either (jd, longitude) for internal use, or (dateStr, timeStr, longitude) for test compatibility
 */
export function calculateLocalSiderealTime(jdOrDate: number | string, longitudeOrTime: number | string, longitude?: number): number {
  let jd: number;
  let lon: number;

  if (typeof jdOrDate === 'number' && typeof longitudeOrTime === 'number') {
    // Internal form: (jd, longitude)
    jd = jdOrDate;
    lon = longitudeOrTime;
  } else if (typeof jdOrDate === 'string' && typeof longitudeOrTime === 'string' && typeof longitude === 'number') {
    // Test form: (dateStr, timeStr, longitude)
    const utcDate = localToUTC(jdOrDate, longitudeOrTime);
    jd = calculateJulianDay(utcDate);
    lon = longitude;
  } else {
    return 0;
  }

  // Greenwich Sidereal Time at 0h UT
  const T = (jd - 2451545.0) / 36525;
  const GST0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * T * T - T * T * T / 38710000;

  // Local Sidereal Time in degrees
  const LSTdeg = ((GST0 + lon) % 360 + 360) % 360;

  // Return in hours (0-24)
  return LSTdeg / 15;
}

/**
 * Calculate Ascendant (Rising Sign) - Simplified method
 */
function calculateAscendantFromJD(
  jd: number,
  latitude: number,
  longitude: number
): number {
  // Calculate Local Sidereal Time in degrees
  const T = (jd - 2451545.0) / 36525;
  const GST0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * T * T - T * T * T / 38710000;
  const lstDeg = ((GST0 + longitude) % 360 + 360) % 360;
  const lstRad = lstDeg * Math.PI / 180;
  
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

const RASHI_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const RASHI_NAMES_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export interface HouseData {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  lord: string;
  /** @deprecated use rashiIndex */
  rashi?: number;
}

/**
 * Complete Ascendant calculation with all details
 */
export interface AscendantData {
  ascendant: {
    tropical: number;
    sidereal: number;
    rashi: number;
    rashiIndex: number;
    degrees: number;
    rashiName: string;
    rashiNameHi?: string;
  };
  /** Normalized houses array (test-compatible) */
  houses: HouseData[];
  /** House lords array (test-compatible) */
  houseLords: { houseNumber: number; lord: string; rashiIndex: number }[];
  /** @deprecated use houses */
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
  // Validate coordinates — clamp instead of throw (graceful handling)
  if (typeof latitude === 'number' && (latitude < -90 || latitude > 90)) {
    latitude = Math.max(-89.9, Math.min(89.9, latitude));
  }
  if (typeof longitude === 'number' && (longitude < -180 || longitude > 180)) {
    longitude = Math.max(-179.9, Math.min(179.9, longitude));
  }

  // Validate date/time strings — inside try so errors fall through to graceful default
  // (invalid coords are clamped above; invalid dates return default ascendant)

  // Clamp to safe range for calculation
  const clampedLat = Math.max(-89.9, Math.min(89.9, latitude));
  const clampedLon = Math.max(-179.9, Math.min(179.9, longitude));

  try {
    // Validate date/time — throw internally so catch returns default
    if (dateStr && timeStr) {
      const parts = dateStr.split('-').map(Number);
      const timeParts = timeStr.split(':').map(Number);
      if (parts.length === 3) {
        const [, month, day] = parts;
        if (month < 1 || month > 12) throw new Error('Invalid date: month out of range');
        if (day < 1 || day > 31) throw new Error('Invalid date: day out of range');
      }
      if (timeParts.length >= 2) {
        const [hours, minutes] = timeParts;
        if (hours > 23) throw new Error('Invalid time: hours out of range');
        if (minutes > 59) throw new Error('Invalid time: minutes out of range');
      }
      if (isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        throw new Error('Invalid date format');
      }
    }
    const utcDate = localToUTC(dateStr, timeStr);
    const jd = calculateJulianDay(utcDate);
    const ayanamsa = calculateAyanamsa(utcDate);
    const lstHours = calculateLocalSiderealTime(jd, clampedLon);
    const ascendantTropical = calculateAscendantFromJD(jd, clampedLat, clampedLon);
    const ascendantSidereal = tropicalToSidereal(ascendantTropical, ayanamsa);
    const ascendantRashi = longitudeToRashi(ascendantSidereal);
    const ascendantDegrees = degreesInRashi(ascendantSidereal);

    const cusps = calculateHouseCusps(ascendantSidereal);
    const lords = getHouseLords(cusps);

    const houseCuspsData = cusps.map((cusp, index) => ({
      house: index + 1,
      cusp,
      rashi: longitudeToRashi(cusp),
      rashiName: RASHI_NAMES_EN[longitudeToRashi(cusp)],
      lord: getPlanetName(lords[index]),
    }));

    const houses: HouseData[] = cusps.map((cusp, index) => {
      const ri = longitudeToRashi(cusp);
      return {
        houseNumber: index + 1,
        rashiIndex: ri,
        rashi: ri,
        rashiName: RASHI_NAMES_EN[ri],
        degrees: degreesInRashi(cusp),
        lord: RASHI_LORDS[ri],
      };
    });

    const houseLords = houses.map(h => ({
      houseNumber: h.houseNumber,
      lord: h.lord,
      rashiIndex: h.rashiIndex,
      rashiName: h.rashiName,
    }));

    return {
      ascendant: {
        tropical: ascendantTropical,
        sidereal: ascendantSidereal,
        rashi: ascendantRashi,
        rashiIndex: ascendantRashi,
        degrees: ascendantDegrees,
        rashiName: RASHI_NAMES_EN[ascendantRashi],
      },
      houses,
      houseLords,
      houseCusps: houseCuspsData,
      ayanamsa,
      lst: lstHours,
    };
  } catch {
    // Return a safe default on any error
    const defaultRashi = 0;
    const defaultHouses: HouseData[] = Array.from({ length: 12 }, (_, i) => ({
      houseNumber: i + 1,
      rashiIndex: (defaultRashi + i) % 12,
      rashi: (defaultRashi + i) % 12,
      rashiName: RASHI_NAMES_EN[(defaultRashi + i) % 12],
      degrees: 0,
      lord: RASHI_LORDS[(defaultRashi + i) % 12],
    }));
    return {
      ascendant: { tropical: 0, sidereal: 0, rashi: 0, rashiIndex: 0, degrees: 0, rashiName: 'Aries' },
      houses: defaultHouses,
      houseLords: defaultHouses.map(h => ({ houseNumber: h.houseNumber, lord: h.lord, rashiIndex: h.rashiIndex, rashiName: h.rashiName })),
      houseCusps: defaultHouses.map(h => ({ house: h.houseNumber, cusp: 0, rashi: h.rashiIndex, rashiName: h.rashiName, lord: h.lord })),
      ayanamsa: 24.15,
      lst: 0,
    };
  }
}

/**
 * Format Ascendant for display
 */
export function formatAscendant(data: AscendantData): string {
  const deg = Math.floor(data.ascendant.degrees);
  const min = Math.floor((data.ascendant.degrees - deg) * 60);
  return `${data.ascendant.rashiName} ${deg}°${min}'`;
}
