import { GRAHAS, MEAN_DAILY_MOTION, type Graha } from './constants';
import { calculateCompletePlanetaryPositions } from '@/services/ephemerisService';

export interface PlanetPosition {
  graha: Graha;
  longitude: number;   // sidereal (Lahiri ayanamsa), 0–360
  speed: number;       // deg/day, negative = retrograde
  retrograde: boolean;
}

export interface EphemerisEngine {
  positions(jd: number): Promise<PlanetPosition[]>;
}

interface RemotePositionsPayload {
  positions?: PlanetPosition[];
}

const GRAHA_KEYS: Array<{ graha: Graha; key: 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu' }> = [
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
export const toJulianDay = (date: Date): number =>
  date.getTime() / 86400000 + 2440587.5;

export const fromJulianDay = (jd: number): Date =>
  new Date((jd - 2440587.5) * 86400000);

/** J2000 mean-motion fallback when the local Lahiri calculator cannot run. */
function meanMotionPositions(jd: number): PlanetPosition[] {
  const epochJd = 2451545.0;
  const days = jd - epochJd;
  const epochLong: Record<Graha, number> = {
    Sun: 280, Moon: 218, Mars: 355, Mercury: 250,
    Jupiter: 34, Venus: 181, Saturn: 42, Rahu: 67, Ketu: 247,
  };
  return GRAHAS.map((graha) => {
    const speed = MEAN_DAILY_MOTION[graha];
    const longitude = (((epochLong[graha] + speed * days) % 360) + 360) % 360;
    return { graha, longitude, speed, retrograde: speed < 0 };
  });
}

function localSiderealPositions(jd: number): PlanetPosition[] {
  try {
    const date = fromJulianDay(jd);
    const dateStr = date.toISOString().slice(0, 10);
    const timeStr = date.toISOString().slice(11, 16) || '12:00';
    const chart = calculateCompletePlanetaryPositions(dateStr, timeStr);

    return GRAHA_KEYS.map(({ graha, key }) => {
      const pos = chart[key];
      const retrograde = Boolean(pos.retrograde) || MEAN_DAILY_MOTION[graha] < 0;
      const speed = retrograde && MEAN_DAILY_MOTION[graha] > 0
        ? -MEAN_DAILY_MOTION[graha]
        : MEAN_DAILY_MOTION[graha];
      return {
        graha,
        longitude: ((pos.sidereal % 360) + 360) % 360,
        speed,
        retrograde,
      };
    });
  } catch {
    return meanMotionPositions(jd);
  }
}

/**
 * Pluggable ephemeris. Prefers an edge endpoint when configured, then
 * falls back to the in-repo Lahiri sidereal calculator.
 */
export class SwissEphemerisEngine implements EphemerisEngine {
  constructor(private endpoint?: string) {}

  async positions(jd: number): Promise<PlanetPosition[]> {
    if (this.endpoint) {
      try {
        const res = await fetch(`${this.endpoint}/ephemeris`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd, ayanamsa: 'LAHIRI', zodiac: 'SIDEREAL' }),
        });
        if (res.ok) {
          const data = (await res.json()) as RemotePositionsPayload;
          const remote = (data.positions ?? []).filter((p) => GRAHAS.includes(p.graha));
          if (remote.length > 0) return remote;
        }
      } catch {
        // Fall through to local sidereal engine.
      }
    }
    return localSiderealPositions(jd);
  }
}
