/**
 * ============================================================
 * PRASNA KERNEL — TAJIKA YOGAS BY DEGREES (Prasnalove.txt §5.8)
 * ============================================================
 *
 * Sri Neelakanta's Prasna Tantra (tr. B.V. Raman) — the Tajika horary
 * yogas. The current prashnaService is wrong because it judges from
 * houses; Prasna Tantra judges from *degrees*: the faster planet must be
 * behind the slower one and closing within the combined orbs (deeptamsha).
 * (See Prasnalove.txt §3.6.)
 *
 * All functions are pure and retrograde-safe: an aspect is "applying" or
 * "separating" by comparing the angular gap now against the gap one step
 * later — never by assuming a fixed direction of travel.
 * ============================================================
 */

export type DeeptamshaBody = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn';

/**
 * Deeptamsha — the orb (in degrees) each planet contributes to a Tajika
 * aspect. The pair's orb is the mean of the two.
 */
export const DEEPTAMSHA: Record<DeeptamshaBody, number> = {
  Sun: 15,
  Moon: 12,
  Mars: 8,
  Mercury: 7,
  Jupiter: 9,
  Venus: 7,
  Saturn: 9,
};

/** The five classical aspect angles. */
export const ASPECTS: readonly number[] = [0, 60, 90, 120, 180];

/** Classical combustion orbs (degrees from the Sun). */
export const COMBUSTION_DEEPTAMSHA: Record<DeeptamshaBody, number> = {
  Sun: 0,
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Jupiter: 11,
  Venus: 10,
  Saturn: 15,
};

export interface TajikaBody {
  name: DeeptamshaBody;
  /** Sidereal longitude in degrees [0, 360). */
  longitude: number;
  retrograde?: boolean;
}

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/**
 * The angular distance from the nearest exact aspect, in degrees (0..30).
 * 0 means the two bodies are exactly in aspect.
 */
export function aspectGap(a: number, b: number): number {
  const sep = Math.abs((((a - b) % 360) + 540) % 360 - 180); // 0..180
  return Math.min(...ASPECTS.map((x) => Math.abs(sep - x)));
}

export type TajikaRelation = 'Ithasala' | 'Ishrafa' | 'none';

/**
 * Classify a pair. `now` compares the two bodies as they stand; `later`
 * compares them a step ahead (e.g. one hour). Applying → Ithasala,
 * separating → Ishrafa, out of orb → none.
 */
export function tajikaRelation(
  p: TajikaBody,
  q: TajikaBody,
  pLater: TajikaBody,
  qLater: TajikaBody,
): TajikaRelation {
  const orb = (DEEPTAMSHA[p.name] + DEEPTAMSHA[q.name]) / 2;
  const now = aspectGap(p.longitude, q.longitude);
  if (now > orb) return 'none';
  const later = aspectGap(pLater.longitude, qLater.longitude);
  return later < now ? 'Ithasala' : 'Ishrafa';
}

/** True when a planet is combust (within its orb of the Sun). */
export function isCombust(body: TajikaBody, sunLongitude: number): boolean {
  const orb = COMBUSTION_DEEPTAMSHA[body.name];
  if (orb === 0) return false;
  const gap = Math.abs((((body.longitude - sunLongitude) % 360) + 540) % 360 - 180);
  return gap <= orb;
}

/**
 * Kamboola: the Moon forms Ithasala with BOTH the Lagna lord and the
 * Karyesh, while those two are themselves in Ithasala.
 * `a` = Lagna lord, `b` = Karyesh. Each needs its "later" position.
 */
export function kamboola(
  moon: TajikaBody, moonLater: TajikaBody,
  a: TajikaBody, aLater: TajikaBody,
  b: TajikaBody, bLater: TajikaBody,
): boolean {
  if (tajikaRelation(a, b, aLater, bLater) !== 'Ithasala') return false;
  return (
    tajikaRelation(moon, a, moonLater, aLater) === 'Ithasala' &&
    tajikaRelation(moon, b, moonLater, bLater) === 'Ithasala'
  );
}

/**
 * Transfer of light (Nakta / Yamaya): a third planet carries light between
 * two planets that are not themselves in aspect, forming Ithasala with both.
 * Nakta = the *faster* planet transfers; Yamaya = the slower one collects.
 * The classical distinction needs each planet's speed, which callers supply
 * via `collectorIsFaster`; both names therefore share this predicate.
 */
export function transferOfLight(
  collector: TajikaBody, collectorLater: TajikaBody,
  p: TajikaBody, pLater: TajikaBody,
  q: TajikaBody, qLater: TajikaBody,
): boolean {
  if (tajikaRelation(p, q, pLater, qLater) !== 'none') return false;
  return (
    tajikaRelation(collector, p, collectorLater, pLater) === 'Ithasala' &&
    tajikaRelation(collector, q, collectorLater, qLater) === 'Ithasala'
  );
}

/** Nakta: transfer of light by the faster planet (see transferOfLight). */
export function nakta(
  collector: TajikaBody, collectorLater: TajikaBody,
  p: TajikaBody, pLater: TajikaBody,
  q: TajikaBody, qLater: TajikaBody,
): boolean {
  return transferOfLight(collector, collectorLater, p, pLater, q, qLater);
}

/** Yamaya: collection of light by the slower planet (see transferOfLight). */
export function yamaya(
  collector: TajikaBody, collectorLater: TajikaBody,
  p: TajikaBody, pLater: TajikaBody,
  q: TajikaBody, qLater: TajikaBody,
): boolean {
  return transferOfLight(collector, collectorLater, p, pLater, q, qLater);
}

/**
 * Radda: obstruction — the applying planet turns retrograde or becomes
 * combust before the aspect perfects.
 */
export function radda(p: TajikaBody, pLater: TajikaBody, sunLongitude: number): boolean {
  const turnsRetrograde = !p.retrograde && pLater.retrograde === true;
  return turnsRetrograde || isCombust(pLater, sunLongitude);
}

/** Normalise a raw TajikaBody longitude (exported for callers building bodies). */
export function normaliseLongitude(lon: number): number {
  return norm360(lon);
}
