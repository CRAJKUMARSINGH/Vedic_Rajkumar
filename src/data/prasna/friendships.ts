/**
 * ============================================================
 * PRASNA — NATURAL (NAISARGIKA) PLANETARY FRIENDSHIP
 * ============================================================
 *
 * Naisargika maitri is the *inherent*, chart-independent friendship between
 * two grahas. It is the relation the Adhipati Sutra (Prasna Marga Ch. VI
 * §60–65) uses: two lords that are mutual friends give the Jeeva thread,
 * mutual/any enemy gives Mrityu, everything else gives Roga.
 *
 * The table is the classical naisargika maitri (BPHS). It intentionally
 * differs from the simplified graha-maitri table in src/lib/vedic/kundliMatch.ts
 * for Sun–Mercury (Mercury is neutral, not an enemy, to the Sun in BPHS).
 * Rahu/Ketu rows are included for completeness and carry a "tradition"
 * provenance — the sutra itself only ever consults the seven sign lords.
 * ============================================================
 */

export type Graha =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

/** The natural relationship of A toward B. */
export type NaturalRelation = 'friend' | 'neutral' | 'enemy';

interface RelationRow {
  friends: readonly Graha[];
  enemies: readonly Graha[];
}

const NATURAL_FRIENDSHIP: Record<Graha, RelationRow> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
  Rahu: { friends: ['Venus', 'Saturn', 'Mercury'], enemies: ['Sun', 'Moon', 'Mars'] },
  Ketu: { friends: ['Mars', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon'] },
};

/**
 * Natural relationship of `a` toward `b`.
 * If the two names are equal the relation is `neutral` (a planet is neither
 * its own friend nor its own enemy); callers that treat a self-pair specially
 * must check equality first.
 */
export function naturalRelation(a: Graha, b: Graha): NaturalRelation {
  if (a === b) return 'neutral';
  const row = NATURAL_FRIENDSHIP[a];
  if (row.friends.includes(b)) return 'friend';
  if (row.enemies.includes(b)) return 'enemy';
  return 'neutral';
}

/** True when each planet counts the other as a natural friend. */
export function isMutualFriend(a: Graha, b: Graha): boolean {
  return a !== b && naturalRelation(a, b) === 'friend' && naturalRelation(b, a) === 'friend';
}

/** True when either planet counts the other as a natural enemy. */
export function hasEnmity(a: Graha, b: Graha): boolean {
  return naturalRelation(a, b) === 'enemy' || naturalRelation(b, a) === 'enemy';
}
