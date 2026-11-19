/**
 * chartFacts.ts — read-only projection of ChartData into the narrow fact
 * set the answer composer needs. Per c3 Phase 1:
 *  - validates indices (sign 0-11, house 1-12), SAV enum, finite values
 *  - never invents defaults for missing data
 *  - reuses canonical getPlanetDignity — no second source of truth
 * Pure & deterministic: same ChartData in, same ChartFacts out.
 */
import type { ChartData } from '@/hooks/useChartCalculation';
import { getPlanetDignity } from '@/services/ephemerisService';

export type Planet =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

export type Dignity =
  | 'exalted' | 'own' | 'friend' | 'neutral'
  | 'enemy' | 'debilitated' | 'unknown';

export type HouseStrength = 'excellent' | 'good' | 'average' | 'weak' | 'very-weak';

export interface Placement {
  planet: Planet;
  /** 1..12, whole-sign. */
  house: number;
  /** 0..11 rashi index. */
  sign: number;
  retrograde: boolean;
  dignity: Dignity;
}

export interface HouseFact {
  strength: HouseStrength;
  savPoints: number;
}

export interface ChartFacts {
  /** 0..11, or null when the ascendant did not calculate. */
  ascSign: number | null;
  placements: Placement[];
  /** Keyed 1..12; absent key = no Ashtakavarga row for that house. */
  houses: Partial<Record<number, HouseFact>>;
}

const PLANETS: readonly Planet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter',
  'Venus', 'Saturn', 'Rahu', 'Ketu',
] as const;

const HOUSE_STRENGTHS: readonly HouseStrength[] = [
  'excellent', 'good', 'average', 'weak', 'very-weak',
] as const;

const isPlanet = (v: string): v is Planet =>
  (PLANETS as readonly string[]).includes(v);

const isInt = (v: unknown, lo: number, hi: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;

const isFiniteNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Map the canonical dignity string to the composer's enum; unknown → 'unknown'. */
function toDignity(raw: string | undefined): Dignity {
  switch ((raw ?? '').toLowerCase()) {
    case 'exalted': return 'exalted';
    case 'moolatrikona':
    case 'own sign': return 'own';
    case 'friend sign': return 'friend';
    case 'neutral': return 'neutral';
    case 'enemy sign': return 'enemy';
    case 'debilitated': return 'debilitated';
    default: return 'unknown';
  }
}

/**
 * Project ChartData → ChartFacts. Returns null when planetary positions are
 * absent — callers must treat null as "no chart", never as zeros.
 * Invalid entries are dropped (never coerced); a fully-invalid input yields
 * an empty placements array, not fabricated positions.
 */
export function buildChartFacts(data: ChartData | null | undefined): ChartFacts | null {
  const pos = data?.planetaryPositions;
  if (!pos?.planets?.length) return null;

  // Ascendant: validate integer 0..11; anything else → null (unknown, not 0).
  const rawAsc = data?.ascendant?.ascendant?.rashiIndex;
  const ascSign = isInt(rawAsc, 0, 11) ? rawAsc : null;

  const placements: Placement[] = [];
  const seen = new Set<Planet>();
  for (const p of pos.planets) {
    if (!isPlanet(p.name)) continue;
    if (seen.has(p.name)) continue; // duplicate planet record → keep first, documented
    if (!isInt(p.rashiIndex, 0, 11)) continue;
    if (!isInt(p.house, 1, 12)) continue;
    seen.add(p.name);
    placements.push({
      planet: p.name,
      house: p.house,
      sign: p.rashiIndex,
      retrograde: p.retrograde === true,
      // Prefer canonical dignity when the normalized entry lacks one.
      dignity: toDignity(p.dignity || getPlanetDignity(p.name, p.rashiIndex)),
    });
  }

  // Ashtakavarga: only well-formed rows become facts; bad values are omitted.
  const houses: Partial<Record<number, HouseFact>> = {};
  for (const h of data?.ashtakavarga?.houseStrengths ?? []) {
    if (!isInt(h.house, 1, 12)) continue;
    if (!HOUSE_STRENGTHS.includes(h.strength)) continue;
    if (!isFiniteNum(h.savPoints) || h.savPoints < 0) continue;
    houses[h.house] = { strength: h.strength, savPoints: h.savPoints };
  }

  return { ascSign, placements, houses };
}

/** Rashi lords, 0..11 (Aries..Pisces) — whole-sign house system. */
export const SIGN_LORD: readonly (Planet | null)[] = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
] as const;

/** Lord of the house counted from ascSign (whole-sign). Null if asc unknown. */
export function houseLord(ascSign: number | null, house: number): Planet | null {
  if (ascSign === null || !isInt(house, 1, 12)) return null;
  return SIGN_LORD[(ascSign + house - 1) % 12];
}

/** Planets placed in the given whole-sign house. */
export function placementsIn(facts: ChartFacts, house: number): Placement[] {
  return facts.placements.filter(p => p.house === house);
}

/** First placement for a planet, or undefined. */
export function placementOf(facts: ChartFacts, planet: Planet): Placement | undefined {
  return facts.placements.find(p => p.planet === planet);
}
