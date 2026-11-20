/**
 * ============================================================
 * PRASNA KERNEL — CHART WRAPPER (Prasnalove.txt §4, §5)
 * ============================================================
 *
 * A thin, typed adapter over the canonical client chart engine
 * (src/features/kundli/engine.calculateChart). It casts the chart for the
 * exact moment of asking and returns a `PrashnaChart` shape the rest of
 * the kernel can consume.
 *
 * Using the one canonical engine is the fix for defect §3.1 (two engines,
 * two Lagnas): the client and server must both go through calculateChart.
 *
 * `hash` is a deterministic digest of the canonical inputs so a client and
 * a server can prove they computed the same chart. It is a synchronous
 * 64-bit FNV-1a digest — non-cryptographic, DOM-free and deterministic;
 * the server is expected to re-verify with a cryptographic hash.
 * ============================================================
 */

import { calculateChart } from '@/features/kundli/engine';
import type { AyanamsaType, BirthData, Planet } from '@/features/kundli/types';

export interface PrashnaChartInput {
  /** Display name only — never used in calculation. */
  querent: string;
  /** The exact moment the question arose (UTC instant). */
  askedAt: Date;
  latitude: number;
  longitude: number;
  /** IANA timezone (e.g. 'Asia/Kolkata'). */
  timezone: string;
  ayanamsa?: AyanamsaType;
}

export interface PrashnaBody {
  planet: Planet;
  /** Sidereal longitude [0, 360). */
  longitude: number;
  /** 0-based rasi index [0, 11]. */
  signIndex: number;
  /** Degrees within the sign, [0, 30). */
  degreeInSign: number;
  house: number;
  retrograde: boolean;
  /** 1-based nakshatra number [1, 27]. */
  nakshatraIndex: number;
}

export interface PrashnaChart {
  querent: string;
  /** ISO 8601 UTC instant of asking. */
  askedAt: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa: AyanamsaType;
  ayanamsaValue: number;
  julianDay: number;
  /** Sidereal longitude of the Udaya Lagna [0, 360). */
  ascendant: number;
  ascendantSignIndex: number;
  lagnaNakshatraIndex: number;
  /** The nine grahas (excludes the Ascendant). */
  bodies: PrashnaBody[];
  /** Deterministic content hash of the inputs. */
  hash: string;
}

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/** Deterministic, synchronous 64-bit FNV-1a digest → 16 hex chars. */
export function contentHash(input: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
}

/** Split a UTC instant into local calendar date / clock time for a timezone. */
function localDateTimeParts(instant: Date, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(instant);
  const g = (t: string): string => parts.find((p) => p.type === t)?.value ?? '00';
  let hour = g('hour');
  if (hour === '24') hour = '00';
  return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${hour}:${g('minute')}` };
}

/** Cast the Prashna chart for the moment of asking. */
export function buildPrashnaChart(input: PrashnaChartInput): PrashnaChart {
  const ayanamsa: AyanamsaType = input.ayanamsa ?? 'lahiri';
  const { date, time } = localDateTimeParts(input.askedAt, input.timezone);

  const birthData: BirthData = {
    name: input.querent,
    date,
    time,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    place: '',
  };

  const result = calculateChart(birthData, ayanamsa, 'whole-sign');

  const asc = result.planets.find((p) => p.planet === 'Ascendant');

  const bodies: PrashnaBody[] = result.planets
    .filter((p) => p.planet !== 'Ascendant')
    .map((p) => ({
      planet: p.planet,
      longitude: norm360(p.siderealLongitude),
      signIndex: Math.floor(norm360(p.siderealLongitude) / 30) % 12,
      degreeInSign: p.degreeInSign,
      house: p.house,
      retrograde: p.isRetrograde,
      nakshatraIndex: p.nakshatraIndex,
    }));

  const ascLongitude = asc ? norm360(asc.siderealLongitude) : 0;
  const hash = contentHash(
    [
      input.askedAt.toISOString(),
      input.latitude.toFixed(6),
      input.longitude.toFixed(6),
      input.timezone,
      ayanamsa,
    ].join('|'),
  );

  return {
    querent: input.querent,
    askedAt: input.askedAt.toISOString(),
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    ayanamsa,
    ayanamsaValue: result.ayanamsaValue,
    julianDay: result.julianDay,
    ascendant: ascLongitude,
    ascendantSignIndex: asc ? Math.floor(ascLongitude / 30) % 12 : 0,
    lagnaNakshatraIndex: asc ? asc.nakshatraIndex : 1,
    bodies,
    hash,
  };
}
