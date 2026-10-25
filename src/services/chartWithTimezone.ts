/**
 * chartWithTimezone.ts — Timezone-aware wrapper for calculatePreciseChart.
 *
 * Why this exists:
 *   calculatePreciseChart(date, time, lat, lon, tzOffsetHours = 5.5) silently
 *   defaults to modern IST.  For 1943 Mumbai that is 1 hour wrong → ~15° of
 *   ascendant error → wrong rashi entirely.
 *
 * This wrapper:
 *   1. Reads the resolved birth timezone from the store
 *   2. Falls back to an explicit offset if provided
 *   3. Falls back to IST (5.5) as a last resort
 *   4. Passes the correct offset into the engine
 *
 * Production code should call calculateChartForBirth, not calculatePreciseChart.
 * See docs/CHART_TZ_MIGRATION.md for the migration guide.
 */

import {
  calculatePreciseChart,
  calculatePrecisePlanetaryPositions,
  type PreciseChart,
} from '@/services/precisionEphemerisService';
import { currentOffsetHours } from '@/hooks/use-birth-timezone';

/** IST default, used only as last resort. */
const IST_OFFSET = 5.5;

/**
 * Resolve the offset to use, in priority order:
 *   1. explicit override from caller
 *   2. resolved birth timezone in the store
 *   3. IST default
 */
export function offsetForChart(explicitOffsetHours?: number): number {
  if (explicitOffsetHours !== undefined) return explicitOffsetHours;
  return currentOffsetHours() ?? IST_OFFSET;
}

/**
 * Calculate a birth chart with the historically-correct UTC offset.
 *
 * @param date              YYYY-MM-DD
 * @param time              HH:MM
 * @param lat               decimal degrees
 * @param lon               decimal degrees
 * @param explicitOffset    override the store (optional, for tests / API calls)
 */
export function calculateChartForBirth(
  date: string,
  time: string,
  lat: number,
  lon: number,
  explicitOffset?: number,
): PreciseChart {
  const offset = offsetForChart(explicitOffset);
  return calculatePreciseChart(date, time, lat, lon, offset);
}

/**
 * Calculate planetary positions (planets-only) with the historically-correct
 * UTC offset.  Route every planets-only caller here instead of calling
 * calculatePrecisePlanetaryPositions directly, so the resolved birth timezone
 * from the store is always honoured.
 *
 * @param explicitOffset    override the store (optional, for tests / API calls)
 */
export function calculatePlanetsForBirth(date: string, time: string, explicitOffset?: number) {
  return calculatePrecisePlanetaryPositions(date, time, offsetForChart(explicitOffset));
}
