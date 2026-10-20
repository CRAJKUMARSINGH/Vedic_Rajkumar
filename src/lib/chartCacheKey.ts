/**
 * chartCacheKey.ts — Cache keys for birth charts MUST include the timezone offset.
 *
 * Problem: a cache keyed only on date + time + coordinates cannot distinguish an
 * IST chart from a wartime chart for the same birth moment.  Same key → wrong
 * cached result served silently.
 *
 * Solution: include offsetHours in every key.  Use chartCacheKeyForBirth when the
 * offset comes from the resolved birth timezone store; use chartCacheKey when you
 * have an explicit offset.
 */

export interface ChartKeyInput {
  date:         string;  // YYYY-MM-DD
  time:         string;  // HH:MM
  lat:          number;
  lon:          number;
  offsetHours:  number;
}

export function chartCacheKey(input: ChartKeyInput): string {
  return [
    input.date,
    input.time,
    input.lat.toFixed(4),
    input.lon.toFixed(4),
    input.offsetHours.toFixed(4),
  ].join('|');
}

/**
 * The pre-migration key (no offset) — kept so a test can demonstrate the
 * collision rather than merely assert it doesn't happen.
 */
export function legacyChartCacheKey(date: string, time: string, lat: number, lon: number): string {
  return [date, time, lat.toFixed(4), lon.toFixed(4)].join('|');
}

/**
 * Builds a cache key resolving the offset from the provided value.
 * Falls back to IST (5.5) when no offset is supplied.
 */
export function chartCacheKeyForBirth(
  date: string,
  time: string,
  lat: number,
  lon: number,
  offsetHours = 5.5,
): string {
  return chartCacheKey({ date, time, lat, lon, offsetHours });
}
