/**
 * ============================================================
 * PRASNA KERNEL — PRANAKSHARA (Prasnalove.txt §5.4)
 * ============================================================
 *
 * Prasna Marga Ch. II §24 (stanzas 104–108).
 *
 *   • Vowel = "Life", consonant = "Body". A question that begins with a
 *     vowel is beneficial and any trouble is only physical; a question
 *     that begins with a consonant points to a concern about longevity.
 *   • In each consonant group (varga) of five, the letters are ruled in
 *     order by Vayu, Agni, Indra, Jala, Napumsaka.
 *   • y, r, l, v, ś, ṣ, s, h, ḷ and kṣ follow the same cycle.
 *   • Short vowels → Indra, long vowels → Jala.
 *   • Jala favourable, Indra neutral, Vayu/Agni evil, Napumsaka very bad.
 *
 * Traditional indicator with LOW weight — never the verdict (§5.4).
 * Callers pass the first *spoken* syllable, transliterated to Devanagari.
 * ============================================================
 */

export type Bhuta = 'Vayu' | 'Agni' | 'Indra' | 'Jala' | 'Napumsaka';

export type PranaksharaEffect = 'favourable' | 'neutral' | 'evil' | 'very-bad';

export type LifeBody = 'life' | 'body';

export interface PranaksharaResult {
  kind: 'vowel' | 'consonant';
  bhuta: Bhuta;
  effect: PranaksharaEffect;
  lifeBody: LifeBody;
  /** The syllable/letter actually matched. */
  matched: string;
}

/** The five-fold bhuta cycle applied to every varga and to the "others". */
export const CYCLE: readonly Bhuta[] = ['Vayu', 'Agni', 'Indra', 'Jala', 'Napumsaka'];

export const EFFECT: Record<Bhuta, PranaksharaEffect> = {
  Jala: 'favourable',
  Indra: 'neutral',
  Vayu: 'evil',
  Agni: 'evil',
  Napumsaka: 'very-bad',
};

/** The five consonant groups (vargas), five letters each. */
export const VARGAS: readonly (readonly string[])[] = [
  ['क', 'ख', 'ग', 'घ', 'ङ'], // ka-varga
  ['च', 'छ', 'ज', 'झ', 'ञ'], // cha-varga
  ['ट', 'ठ', 'ड', 'ढ', 'ण'], // tta-varga
  ['त', 'थ', 'द', 'ध', 'न'], // ta-varga
  ['प', 'फ', 'ब', 'भ', 'म'], // pa-varga
];

/** Semi-vowels / sibilants / ha / la / ksha — same cycle, repeated. */
export const OTHERS: readonly string[] = ['य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ', 'क्ष'];

/** Short vowels → Indra. (e/o classification to be confirmed with a pandit.) */
export const SHORT_VOWELS: readonly string[] = ['अ', 'इ', 'उ', 'ऋ', 'ऌ', 'ए', 'ओ'];

/** Long vowels → Jala. */
export const LONG_VOWELS: readonly string[] = ['आ', 'ई', 'ऊ', 'ॠ', 'ऐ', 'औ'];

/**
 * Classify the first spoken syllable of the question.
 * Returns null when the syllable is not a recognised Devanagari akshara.
 */
export function pranakshara(syllable: string): PranaksharaResult | null {
  const s = syllable.trim();
  if (!s) return null;

  const cp = Array.from(s)[0] ?? '';

  if (SHORT_VOWELS.includes(cp)) {
    return { kind: 'vowel', bhuta: 'Indra', effect: EFFECT.Indra, lifeBody: 'life', matched: cp };
  }
  if (LONG_VOWELS.includes(cp)) {
    return { kind: 'vowel', bhuta: 'Jala', effect: EFFECT.Jala, lifeBody: 'life', matched: cp };
  }

  // "Others" first so a conjunct such as क्ष is not mis-read as क.
  const otherIndex = OTHERS.findIndex((o) => s.startsWith(o));
  if (otherIndex >= 0) {
    const bhuta = CYCLE[otherIndex % 5];
    return { kind: 'consonant', bhuta, effect: EFFECT[bhuta], lifeBody: 'body', matched: OTHERS[otherIndex] };
  }

  for (const varga of VARGAS) {
    const i = varga.indexOf(cp);
    if (i >= 0) {
      const bhuta = CYCLE[i];
      return { kind: 'consonant', bhuta, effect: EFFECT[bhuta], lifeBody: 'body', matched: cp };
    }
  }

  return null;
}
