/**
 * src/astrology/core/ephemeris.ts
 *
 * PHASE 1 · fail-loud, source-tagged ephemeris.
 *
 * Three defects are fixed here:
 *
 * 1. DOUBLE TIME-ZONE. The old `localSiderealPositions()` turned a Julian Day
 *    back into a `Date`, sliced `toISOString()` (UTC), and handed that UTC clock
 *    to `calculateCompletePlanetaryPositions(dateStr, timeStr)`, which converts
 *    its input from IST to UTC (`localToUTC`). Every chart was therefore shifted
 *    by 5h30m — 0.22 deg of lunar motion, more than a pada.
 *    Fix: call `calculateCompletePlanetaryPositionsAtUTC(date)`, the export that
 *    already exists for exactly this purpose (ephemerisService.ts:622).
 *
 * 2. SILENT DEGRADATION. `catch { return meanMotionPositions(jd) }` returned a
 *    table of straight lines when the calculator threw. Mean motion is not an
 *    ephemeris: Mercury never retrogrades in it, the Moon drifts by degrees in a
 *    day. A card built on it looked exactly like a real one.
 *    Fix: `EphemerisUnavailableError` by default; mean motion only when the
 *    caller passes `allowMeanMotionFallback: true`, and then every position is
 *    tagged `source: 'mean-motion'`.
 *
 * 3. FABRICATED SPEED. `speed` came from `MEAN_DAILY_MOTION`, and `retrograde`
 *    was `MEAN_DAILY_MOTION[graha] < 0` — true only for the nodes. So Mercury
 *    could never be reported retrograde.
 *    Fix: `speedBasis` states whether the speed is computed or mean, and the
 *    retrograde flag comes from the engine when the engine reports it.
 */

import { GRAHAS, MEAN_DAILY_MOTION, type Graha } from './constants';
import { calculateCompletePlanetaryPositionsAtUTC } from '@/services/ephemerisService';

export interface PlanetPosition {
  graha: Graha;
  /** Sidereal longitude, Lahiri, 0-360. */
  longitude: number;
  /** Degrees per day; negative = retrograde. */
  speed: number;
  retrograde: boolean;
  /** NEW — which engine produced this row. */
  source: PositionSource;
  /** NEW — is `speed` a real derivative or a mean-motion constant? */
  speedBasis: 'computed' | 'mean';
}

export interface EphemerisEngine {
  positions(jd: number): Promise<PlanetPosition[]>;
}

export type PositionSource = 'swisseph-endpoint' | 'local-sidereal' | 'mean-motion';

export class EphemerisUnavailableError extends Error {
  constructor(
    public readonly jd: number,
    public readonly reason: string,
  ) {
    super(`ephemeris unavailable at JD ${jd}: ${reason}`);
    this.name = 'EphemerisUnavailableError';
  }
}

interface RemotePositionsPayload {
  positions?: Array<Partial<PlanetPosition> & { graha?: Graha }>;
  source?: string;
}

const GRAHA_KEYS: ReadonlyArray<{
  graha: Graha;
  key: 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';
}> = [
  { graha: 'Sun', key: 'sun' },
  { graha: 'Moon', key: 'moon' },
  { graha: 'Mars', key: 'mars' },
  { graha: 'Mercury', key: 'mercury' },
  { graha: 'Jupiter', key: 'jupiter' },
  { graha: 'Venus', key: 'venus' },
  { graha: 'Saturn', key: 'saturn' },
  { graha: 'Rahu', key: 'rahu' },
  { graha: 'Ketu', key: 'ketu' },
];

/** Julian Day from a UTC Date. */
export const toJulianDay = (date: Date): number => date.getTime() / 86400000 + 2440587.5;

export const fromJulianDay = (jd: number): Date => new Date((jd - 2440587.5) * 86400000);

const normalise = (deg: number): number => ((deg % 360) + 360) % 360;

const meanMotion = (graha: Graha): number => {
  const v = MEAN_DAILY_MOTION[graha];
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
};

/**
 * J2000 mean-motion table. Retained ONLY for the explicitly-flagged fallback and
 * for regression tests that pin "what the fallback used to return".
 */
function meanMotionPositions(jd: number): PlanetPosition[] {
  const epochLong: Record<Graha, number> = {
    Sun: 280,
    Moon: 218,
    Mars: 355,
    Mercury: 250,
    Jupiter: 34,
    Venus: 181,
    Saturn: 42,
    Rahu: 67,
    Ketu: 247,
  } as Record<Graha, number>;
  const days = jd - 2451545.0;
  return GRAHAS.map((graha) => {
    const speed = meanMotion(graha);
    return {
      graha,
      longitude: normalise(epochLong[graha] + speed * days),
      speed,
      retrograde: speed < 0,
      source: 'mean-motion' as const,
      speedBasis: 'mean' as const,
    };
  });
}

/** In-repo Lahiri sidereal calculator, fed a UTC instant (no double conversion). */
function localSiderealPositions(jd: number): PlanetPosition[] {
  const date = fromJulianDay(jd);
  if (Number.isNaN(date.getTime())) throw new EphemerisUnavailableError(jd, 'Julian Day is not a valid instant');

  let chart: ReturnType<typeof calculateCompletePlanetaryPositionsAtUTC>;
  try {
    chart = calculateCompletePlanetaryPositionsAtUTC(date);
  } catch (err) {
    throw new EphemerisUnavailableError(jd, `local calculator threw: ${(err as Error).message}`);
  }

  return GRAHA_KEYS.map(({ graha, key }) => {
    const pos = chart[key] as { sidereal?: number; retrograde?: boolean; speed?: number } | undefined;
    if (!pos || typeof pos.sidereal !== 'number' || !Number.isFinite(pos.sidereal)) {
      throw new EphemerisUnavailableError(jd, `local calculator returned no sidereal longitude for ${graha}`);
    }
    const computedSpeed = typeof pos.speed === 'number' && Number.isFinite(pos.speed) ? pos.speed : undefined;
    const speed = computedSpeed ?? meanMotion(graha);
    // Only trust an engine-reported retrograde flag; otherwise derive it from the
    // speed we actually have, and never from a static table.
    const retrograde = typeof pos.retrograde === 'boolean' ? pos.retrograde : speed < 0;
    return {
      graha,
      longitude: normalise(pos.sidereal),
      speed,
      retrograde,
      source: 'local-sidereal' as const,
      speedBasis: computedSpeed === undefined ? ('mean' as const) : ('computed' as const),
    };
  });
}

export interface SwissEphemerisOptions {
  endpoint?: string;
  /**
   * Return the J2000 mean-motion table when no real engine is reachable.
   * Defaults to FALSE — silent degradation is what let bad cards ship.
   */
  allowMeanMotionFallback?: boolean;
  /** Request timeout for the edge endpoint, ms. Default 4000. */
  timeoutMs?: number;
}

/**
 * Pluggable ephemeris. Prefers an edge endpoint when configured, then the
 * in-repo Lahiri calculator, and throws rather than inventing positions unless
 * the caller has explicitly opted into the mean-motion table.
 */
export class SwissEphemerisEngine implements EphemerisEngine {
  private readonly options: SwissEphemerisOptions;

  constructor(endpointOrOptions?: string | SwissEphemerisOptions) {
    this.options = typeof endpointOrOptions === 'string' ? { endpoint: endpointOrOptions } : (endpointOrOptions ?? {});
  }

  async positions(jd: number): Promise<PlanetPosition[]> {
    const { endpoint, allowMeanMotionFallback = false, timeoutMs = 4000 } = this.options;
    const failures: string[] = [];

    if (endpoint) {
      const controller = typeof AbortController === 'function' ? new AbortController() : undefined;
      const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
      try {
        const res = await fetch(`${endpoint}/ephemeris`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd, ayanamsa: 'LAHIRI', zodiac: 'SIDEREAL' }),
          signal: controller?.signal,
        });
        if (!res.ok) {
          failures.push(`endpoint HTTP ${res.status}`);
        } else {
          const data = (await res.json()) as RemotePositionsPayload;
          const remote = (data.positions ?? []).filter(
            (p): p is PlanetPosition =>
              Boolean(p) &&
              typeof p.graha === 'string' &&
              GRAHAS.includes(p.graha as Graha) &&
              typeof p.longitude === 'number' &&
              Number.isFinite(p.longitude),
          );
          // A partial answer is worse than none: require every graha.
          if (remote.length === GRAHAS.length) {
            return remote.map((p) => ({ ...p, source: 'swisseph-endpoint', speedBasis: p.speedBasis ?? 'computed' }));
          }
          failures.push(`endpoint returned ${remote.length}/${GRAHAS.length} grahas`);
        }
      } catch (err) {
        failures.push(`endpoint unreachable: ${(err as Error).message}`);
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    try {
      return localSiderealPositions(jd);
    } catch (err) {
      failures.push((err as Error).message);
    }

    if (allowMeanMotionFallback) {
      return meanMotionPositions(jd);
    }
    throw new EphemerisUnavailableError(jd, failures.join('; ') || 'no ephemeris engine configured');
  }
}
