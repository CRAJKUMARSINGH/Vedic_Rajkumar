/**
 * ============================================================
 * PRASNA KERNEL — THE FIVE SUTRAS (Prasnalove.txt §5.6)
 * ============================================================
 *
 * Prasna Marga Ch. VI §60–65. Each sutra returns one of the three
 * "threads": Jeeva (life / auspicious), Roga (disease / mixed),
 * Mrityu (death / inauspicious).
 *
 * Guardrail (Prasnalove.txt §7): the Mrityu thread is never shown to a
 * user verbatim. It is reworded downstream as "a period that calls for
 * care and support".
 * ============================================================
 */

import { naturalRelation } from '@/data/prasna/friendships';
import type { Graha } from '@/data/prasna/friendships';

/** The three threads a sutra can return. */
export type Sutra = 'Jeeva' | 'Roga' | 'Mrityu';

/** The nature of a rasi, counted cyclically from Aries. */
export type SignNature = 'movable' | 'fixed' | 'common';

/** Names of the five sutras (Ch. VI §60–65). */
export type SutraName = 'samanya' | 'adhipati' | 'amsaka' | 'nakshatra' | 'maha';

const mod3 = (n: number): number => ((n % 3) + 3) % 3;

/**
 * Movable / fixed / common by 0-based rasi index.
 * Aries(0), Cancer(3), Libra(6), Capricorn(9) → movable; and so on.
 */
export function signNature(rasiIndex: number): SignNature {
  return (['movable', 'fixed', 'common'] as const)[mod3(rasiIndex)];
}

/**
 * The core stanza pair (PM Ch. VI stanzas 5–8), shared by all the
 * rasi-based sutras:
 *   Jeeva  = both movable | common+fixed
 *   Mrityu = both fixed   | common+movable
 *   Roga   = both common  | movable+fixed
 */
export function pairSutra(a: number, b: number): Sutra {
  const s = [signNature(a), signNature(b)].sort().join('+');
  if (s === 'movable+movable' || s === 'common+fixed') return 'Jeeva';
  if (s === 'fixed+fixed' || s === 'common+movable') return 'Mrityu';
  return 'Roga';
}

/** Samanya sutra: the Arudha rasi against the Udaya Lagna rasi. */
export const samanyaSutra = (arudhaRasi: number, lagnaRasi: number): Sutra =>
  pairSutra(arudhaRasi, lagnaRasi);

/** Amsaka sutra: the Arudha navamsa against the Lagna navamsa. */
export const amsakaSutra = (arudhaNavamsa: number, lagnaNavamsa: number): Sutra =>
  pairSutra(arudhaNavamsa, lagnaNavamsa);

/**
 * Adhipati sutra: the two ruling lords.
 *   same lord, or mutual natural friends → Jeeva
 *   either lord an enemy of the other     → Mrityu
 *   otherwise                             → Roga
 *
 * Raman's notes record a disagreement about "mixed" (one-way) friendship;
 * the one-way-friend case is exposed as a future setting, so here it
 * falls through to Roga.
 */
export function adhipatiSutra(lordA: Graha, lordB: Graha): Sutra {
  if (lordA === lordB) return 'Jeeva';
  const aToB = naturalRelation(lordA, lordB);
  const bToA = naturalRelation(lordB, lordA);
  if (aToB === 'friend' && bToA === 'friend') return 'Jeeva';
  if (aToB === 'enemy' || bToA === 'enemy') return 'Mrityu';
  return 'Roga';
}

/**
 * Nakshatra sutra: count from the Udaya Lagna nakshatra to the querent's
 * Janma nakshatra; the remainder on ÷3 selects the thread.
 *   1 → Jeeva, 2 → Roga, 0 → Mrityu
 *
 * Inputs are 1-based nakshatra numbers (1..27).
 */
export function nakshatraSutra(lagnaNak: number, janmaNak: number): Sutra {
  const count = ((janmaNak - lagnaNak + 27) % 27) + 1;
  return (['Mrityu', 'Jeeva', 'Roga'] as const)[count % 3];
}

/**
 * Maha sutra: the Arudha rasi and the 10th from it.
 *
 * NOTE: Prasnalove.txt §5.6 says to "encode after reading Ch. VI in full".
 * This is a provisional encoding of the documented relation (Arudha and
 * the 10th from it) and is flagged as such until the stanza is confirmed.
 */
export function mahaSutra(arudhaRasi: number): Sutra {
  const tenthFromArudha = (((arudhaRasi + 9) % 12) + 12) % 12;
  return pairSutra(arudhaRasi, tenthFromArudha);
}
