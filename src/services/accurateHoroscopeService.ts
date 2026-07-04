import { calcPlanetsAccurate, calcHousesAccurate } from '../services/swissEphemerisService.ts';
import { generateHoroscope } from '../services/horoscopeService.ts';
import { generateComprehensiveHoroscope } from '../services/horoscopeService.ts';

/**
 * Generate a fully accurate horoscope using Swiss Ephemeris for planetary positions.
 * This function replaces the simplified JS fallback and provides high‑precision data.
 */
export async function generateAccurateHoroscope(birthDate: string, birthTime: string, lat: number, lon: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
  // Calculate precise planetary positions via Swiss Ephemeris (fallback to JS only if unavailable)
  const precisePositions = await calcPlanetsAccurate(birthDate, birthTime);
  // Calculate houses/ascendant
  const houses = await calcHousesAccurate(birthDate, birthTime, lat, lon);

  // Prepare a minimal data structure compatible with existing horoscope generation
  // The horoscopeService expects only birthDate for moon sign; we can still use it.
  const horoscope = generateHoroscope(birthDate, period, 'career');

  // Return enriched data
  return {
    precisePositions,
    houses,
    horoscope,
  };
}
