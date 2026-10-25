/**
 * resolveJatak.ts — seed-bank lookup for the Answer Layer.
 *
 * The seed bank stores coordinates as strings ("23.84°N") and has no
 * `timezone` on most entries, so both are normalised here rather than in the
 * callers. The JSON is imported relatively (not via `@/`) so the same module
 * loads under Vite SSR in `scripts/emitAnswerCards.mjs`.
 */

import JATAKS_DATABASE from '../../data/jataks/JATAKS_DATABASE.json';

export interface JatakRecord {
  id: string;
  name: string;
  aliases?: string[];
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  state?: string;
  country?: string;
  coordinates?: { latitude?: string; longitude?: string };
  timezone?: string;
  relationship?: string;
  notes?: string;
}

export const slugify = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const normalizeName = (s: string): string => slugify(s);

/** Accepts "23.84°N" | "23.84N" | 23.84 → 23.84 */
export function parseCoordinateString(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isNaN(n)) return n;
  if (typeof value === 'string') {
    const m = value.match(/^([0-9.]+)\s*[NSEWnsew]?°/);
    if (m) {
      const p = parseFloat(m[1]);
      if (!Number.isNaN(p)) return p;
    }
  }
  return null;
}

export function allJataks(): JatakRecord[] {
  return (JATAKS_DATABASE as unknown as { jataks: JatakRecord[] }).jataks;
}

/** Exact match on name or any alias, case/punctuation-insensitive. */
export function resolveJatak(name: string): JatakRecord | null {
  const q = normalizeName(name);
  return (
    allJataks().find(j => [j.name, ...(j.aliases ?? [])].some(n => normalizeName(n) === q)) ?? null
  );
}

export interface ResolvedSubject {
  name: string;
  slug: string;
  aliases: string[];
  jatak_id: string | null;
  dob: string;
  tob: string;
  place: string;
  lat: number;
  lon: number;
  tz: string;
  tz_defaulted: boolean;
}

const DEFAULT_TZ = 'Asia/Kolkata';

export function toSubject(j: JatakRecord): ResolvedSubject {
  const lat = parseCoordinateString(j.coordinates?.latitude);
  const lon = parseCoordinateString(j.coordinates?.longitude);
  if (lat === null || lon === null) throw new Error(`No usable coordinates for ${j.name}`);
  return {
    name: j.name,
    slug: slugify(j.name),
    aliases: j.aliases ?? [],
    jatak_id: j.id,
    dob: j.dateOfBirth,
    tob: j.timeOfBirth,
    place: [j.placeOfBirth, j.state].filter(Boolean).join(', '),
    lat,
    lon,
    tz: j.timezone ?? DEFAULT_TZ,
    tz_defaulted: !j.timezone,
  };
}

/** Location string used to resolve the historical UTC offset. */
export function locationOf(j: JatakRecord): string {
  return [j.placeOfBirth, j.state, j.country].filter(Boolean).join(', ');
}
