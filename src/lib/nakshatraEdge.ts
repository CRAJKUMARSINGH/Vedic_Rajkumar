/**
 * nakshatraEdge.ts — nakshatra index, name, and boundary exposure.
 *
 * A body's nakshatra is decided by its sidereal longitude alone. When that
 * longitude carries an error bar, the only charts whose nakshatra is genuinely
 * in doubt are those whose longitude sits within the bar of a boundary. This
 * module makes that "distance to the nearest edge" a first-class quantity, so
 * exposure and possible flips are computed rather than eyeballed.
 *
 * 27 nakshatras of 13°20′ each. Index 0 = Ashwini.
 */

export const NAKSHATRA_COUNT = 27;
export const NAKSHATRA_SPAN_DEG = 360 / NAKSHATRA_COUNT; // 13.3333…

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

export function norm360(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

/** 0-based nakshatra index from a sidereal longitude in degrees. */
export function nakshatraIndex(siderealLongitude: number): number {
  return Math.min(NAKSHATRA_COUNT - 1, Math.floor(norm360(siderealLongitude) / NAKSHATRA_SPAN_DEG));
}

export function nakshatraName(siderealLongitude: number): string {
  return NAKSHATRA_NAMES[nakshatraIndex(siderealLongitude)];
}

/** Angular distance from a longitude to the nearest nakshatra boundary, arcsec. */
export function distanceToNakshatraEdgeArcsec(siderealLongitude: number): number {
  const within = norm360(siderealLongitude) % NAKSHATRA_SPAN_DEG;
  const toEdge = Math.min(within, NAKSHATRA_SPAN_DEG - within);
  return toEdge * 3600;
}

/** True if an error of ±errorArcsec could move this longitude into another nakshatra. */
export function nakshatraCouldFlip(siderealLongitude: number, errorArcsec: number): boolean {
  return distanceToNakshatraEdgeArcsec(siderealLongitude) <= errorArcsec;
}

/**
 * The nakshatra indices a longitude could occupy given ±errorArcsec of error.
 * One entry well inside a nakshatra, two or three when it sits near an edge.
 */
export function nakshatraReach(siderealLongitude: number, errorArcsec: number): number[] {
  const within = norm360(siderealLongitude) % NAKSHATRA_SPAN_DEG; // degrees into the nakshatra
  const errDeg = errorArcsec / 3600;
  const base = nakshatraIndex(siderealLongitude);
  const reach = new Set<number>([base]);
  if (within - errDeg <= 0) reach.add((base + NAKSHATRA_COUNT - 1) % NAKSHATRA_COUNT);
  if (within + errDeg >= NAKSHATRA_SPAN_DEG) reach.add((base + 1) % NAKSHATRA_COUNT);
  return [...reach].sort((a, b) => a - b);
}
