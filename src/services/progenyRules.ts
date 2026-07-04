/**
 * progenyRules.ts
 *
 * Santhana Prasna — Progeny Rules
 * Based on: Prasna Marga Part II, Chapter 18 (Santhana Prasna)
 * Translated and annotated by B.V. Raman
 *
 * Implements:
 *   - Beeja (Seed) and Kshetra (Field) strength assessment
 *   - Serpent-god curse (Rahu affliction) detection
 *   - Karmic / manes-curse (Saturn + Gulika) detection
 *   - Progeny timing hints from Chapter 18 stanzas
 *   - Boolean yoga flags for UI display
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanetPosition {
  /** Rashi index 0–11 (0 = Aries) */
  rashi: number;
  /** Degree within rashi 0–29.99 */
  degree: number;
  /** Whether the planet is combust (within 6° of Sun) */
  combust?: boolean;
  /** Whether the planet is debilitated */
  debilitated?: boolean;
  /** Whether the planet is in a malefic sign */
  inMaleficSign?: boolean;
  /** Whether the planet receives a benefic aspect (Jupiter/Venus/Moon) */
  hasBeneficAspect?: boolean;
}

export interface ProgenyInput {
  /** true = male querent (5th house focus); false = female (9th house focus) */
  isMale: boolean;
  /** Prasna Lagna rashi index 0–11 */
  lagnaRashi: number;
  /** Arudha Lagna rashi index 0–11 */
  arudhaLagnaRashi: number;
  /** 5th house rashi index */
  fifthHouseRashi: number;
  /** 5th lord planet position */
  fifthLord: PlanetPosition;
  /** 9th house rashi index */
  ninthHouseRashi: number;
  /** 9th lord planet position */
  ninthLord: PlanetPosition;
  /** Gulika position */
  gulika: PlanetPosition;
  /** Rahu position */
  rahu: PlanetPosition;
  /** Saturn position */
  saturn: PlanetPosition;
  /** Mars position (for Mars-in-5th yoga) */
  mars?: PlanetPosition;
  /** Jupiter position (for benefic aspect check) */
  jupiter?: PlanetPosition;
  /** Lagna lord position (for Beeja strength) */
  lagnaLord?: PlanetPosition;
}

export interface ProgenyYogaFlags {
  /** Rahu in 5th or conjunct 5th lord without benefic aspect */
  hasSerpentCurse: boolean;
  /** Saturn + Gulika in 1st/5th/9th without benefic aspect */
  hasKarmicCurse: boolean;
  /** Weak/afflicted 9th lord (female) or combust 5th lord (male) */
  likelyBarrenness: boolean;
  /** Mars in 5th with Jupiter aspect — strong conception yoga */
  hasMarsConceptionYoga: boolean;
  /** Score >= 0.7 */
  strongProgeny: boolean;
  /** Score < 0.3 */
  weakProgeny: boolean;
}

export interface ProgenyTimingHint {
  /** Human-readable timing window */
  window: string;
  /** Basis for the timing (which stanza / rule) */
  basis: string;
  /** Chapter reference */
  chapterRef: string;
}

export interface ProgenyAnalysis {
  /** Numeric score 0.0–1.0 */
  score: number;
  /** Boolean yoga flags */
  flags: ProgenyYogaFlags;
  /** Timing hint from Chapter 18 stanzas */
  timing: ProgenyTimingHint;
  /** Plain-language summary */
  summary: string;
  /** Parihara note (if curses detected) */
  pariharaNotes: string[];
  /** Chapter reference */
  reference: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// House group constants (1-indexed house numbers)
// ─────────────────────────────────────────────────────────────────────────────

const KENDRA_HOUSES = new Set([1, 4, 7, 10]);
const KONA_HOUSES = new Set([1, 5, 9]);
const PANAPHARA = new Set([2, 5, 8, 11]);

function houseFromRashi(lagnaRashi: number, planetRashi: number): number {
  return ((planetRashi - lagnaRashi + 12) % 12) + 1;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─────────────────────────────────────────────────────────────────────────────
// Core scoring
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates progeny strength score (0.0–1.0) and yoga flags.
 * Based on Prasna Marga Chapter 18 (Santhana Prasna).
 *
 * @param input - Chart positions for the Prasna chart
 * @returns ProgenyAnalysis with score, flags, timing, and summary
 */
export function analyzeProgeny(input: ProgenyInput): ProgenyAnalysis {
  const {
    isMale,
    lagnaRashi,
    arudhaLagnaRashi,
    fifthHouseRashi,
    fifthLord,
    ninthHouseRashi,
    ninthLord,
    gulika,
    rahu,
    saturn,
    mars,
    jupiter,
  } = input;

  // Choose primary progeny house and lord by gender
  const progHouseRashi = isMale ? fifthHouseRashi : ninthHouseRashi;
  const progLord = isMale ? fifthLord : ninthLord;

  let score = 0.5; // neutral baseline

  // ── Beeja strength (male perspective: Lagna + 5th) ──────────────────────
  if (progHouseRashi === lagnaRashi || progHouseRashi === fifthHouseRashi) {
    if (!progLord.combust && !progLord.inMaleficSign) {
      score += 0.15;
    }
  }

  // ── Kshetra strength (female perspective: Arudha + 9th) ─────────────────
  if (progHouseRashi === arudhaLagnaRashi || progHouseRashi === ninthHouseRashi) {
    if (!progLord.combust && !progLord.inMaleficSign) {
      score += 0.15;
    }
  }

  // ── Benefic aspect on progeny lord ──────────────────────────────────────
  if (progLord.hasBeneficAspect) {
    score += 0.1;
  }

  // ── Debilitation / combustion penalty ───────────────────────────────────
  if (progLord.combust) score -= 0.15;
  if (progLord.debilitated) score -= 0.1;
  if (progLord.inMaleficSign) score -= 0.05;

  // ── Serpent-god curse: Rahu in 5th or conjunct 5th lord ─────────────────
  const rahuHouse = houseFromRashi(lagnaRashi, rahu.rashi);
  const rahuConjunct5thLord =
    Math.abs(rahu.rashi - fifthLord.rashi) === 0 && Math.abs(rahu.degree - fifthLord.degree) <= 5;
  const hasSerpentCurse = (rahuHouse === 5 || rahuConjunct5thLord) && !rahu.hasBeneficAspect;

  if (hasSerpentCurse) score -= 0.2;

  // ── Karmic / manes-curse: Saturn + Gulika in 1/5/9 ──────────────────────
  const saturnHouse = houseFromRashi(lagnaRashi, saturn.rashi);
  const gulikaHouse = houseFromRashi(lagnaRashi, gulika.rashi);
  const saturnGulikaConjunct =
    Math.abs(saturn.rashi - gulika.rashi) === 0 && Math.abs(saturn.degree - gulika.degree) <= 2;
  const hasKarmicCurse =
    [1, 5, 9].includes(saturnHouse) &&
    (saturnGulikaConjunct || [1, 5, 9].includes(gulikaHouse)) &&
    !saturn.hasBeneficAspect;

  if (hasKarmicCurse) score -= 0.25;

  // ── Barrenness indicator ─────────────────────────────────────────────────
  const likelyBarrenness = isMale
    ? (fifthLord.combust ?? false)
    : (ninthLord.debilitated ?? false) || (ninthLord.inMaleficSign ?? false);

  // ── Mars-in-5th conception yoga ──────────────────────────────────────────
  const marsHouse = mars ? houseFromRashi(lagnaRashi, mars.rashi) : 0;
  const hasMarsConceptionYoga =
    marsHouse === 5 && (mars?.hasBeneficAspect ?? false) && jupiter !== undefined;

  if (hasMarsConceptionYoga) score += 0.1;

  score = clamp(score, 0.0, 1.0);

  // ── Flags ────────────────────────────────────────────────────────────────
  const flags: ProgenyYogaFlags = {
    hasSerpentCurse,
    hasKarmicCurse,
    likelyBarrenness,
    hasMarsConceptionYoga,
    strongProgeny: score >= 0.7,
    weakProgeny: score < 0.3,
  };

  // ── Timing (Chapter 18 stanzas) ──────────────────────────────────────────
  const timing = computeProgenyTiming(input, flags, lagnaRashi);

  // ── Summary ──────────────────────────────────────────────────────────────
  const summary = buildSummary(score, flags, isMale);

  // ── Parihara notes ───────────────────────────────────────────────────────
  const pariharaNotes: string[] = [];
  if (hasSerpentCurse) {
    pariharaNotes.push(
      'Serpent-god curse detected (Rahu afflicting 5th). Recommended Parihara: Naga Pratishtha, Sarpa Dosha Shanti puja, and recitation of Rahu mantra (Om Rahave Namah) 108 times on Saturdays.'
    );
  }
  if (hasKarmicCurse) {
    pariharaNotes.push(
      'Karmic / manes-curse detected (Saturn + Gulika in 1/5/9). Recommended Parihara: Pitru Tarpana (ancestral rites), Navagraha Shanti for Saturn, and donation of sesame seeds on Saturdays.'
    );
  }

  return {
    score,
    flags,
    timing,
    summary,
    pariharaNotes,
    reference: 'Prasna Marga Part II, Chapter 18 (Santhana Prasna) — B.V. Raman.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Timing computation — Chapter 18 stanzas
// ─────────────────────────────────────────────────────────────────────────────

function computeProgenyTiming(
  input: ProgenyInput,
  flags: ProgenyYogaFlags,
  lagnaRashi: number
): ProgenyTimingHint {
  const { isMale, fifthLord, ninthLord, lagnaLord } = input;
  const progLord = isMale ? fifthLord : ninthLord;

  // Stanza-type 1: Strong progeny lord in own/exaltation with benefic aspect
  if (!progLord.combust && !progLord.debilitated && progLord.hasBeneficAspect) {
    return {
      window: '1–3 years (favorable, subject to Dasha)',
      basis: 'Strong 5th/9th lord with benefic aspect — Stanza-type 1, Ch. 18',
      chapterRef: 'Prasna Marga Part II, Chapter 18, Stanza-type 1',
    };
  }

  // Stanza-type 2: Mars-in-5th yoga
  if (flags.hasMarsConceptionYoga) {
    return {
      window: 'Strong yoga for conception — check current Dasha period',
      basis: 'Mars in 5th with Jupiter aspect — Stanza-type 2, Ch. 18 (stanzas 18.18–18.19)',
      chapterRef: 'Prasna Marga Part II, Chapter 18, Stanzas 18.18–18.19',
    };
  }

  // Lagna-lord position timing (Matrī-kāla method)
  if (lagnaLord) {
    const lagnaLordHouse = houseFromRashi(lagnaRashi, lagnaLord.rashi);
    if (KENDRA_HOUSES.has(lagnaLordHouse)) {
      return {
        window: 'Within 6–12 months',
        basis: 'Lagna-lord in Kendra — Mātrī-kāla method, Ch. 18',
        chapterRef: 'Prasna Marga Part II, Chapter 18 (Mātrī-kāla stanzas)',
      };
    }
    if (KONA_HOUSES.has(lagnaLordHouse)) {
      return {
        window: 'Within 1–2 years',
        basis: 'Lagna-lord in Kona — Mātrī-kāla method, Ch. 18',
        chapterRef: 'Prasna Marga Part II, Chapter 18 (Mātrī-kāla stanzas)',
      };
    }
    if (PANAPHARA.has(lagnaLordHouse)) {
      return {
        window: 'Within 2–3 years (if unafflicted)',
        basis: 'Lagna-lord in Panaphara — Mātrī-kāla method, Ch. 18',
        chapterRef: 'Prasna Marga Part II, Chapter 18 (Mātrī-kāla stanzas)',
      };
    }
  }

  // Afflicted / uncertain
  return {
    window: 'Uncertain — further chart analysis and Dasha timing required',
    basis: 'Progeny lord afflicted or in cadent house',
    chapterRef: 'Prasna Marga Part II, Chapter 18',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary builder
// ─────────────────────────────────────────────────────────────────────────────

function buildSummary(score: number, flags: ProgenyYogaFlags, isMale: boolean): string {
  const houseLabel = isMale ? '5th house (Beeja)' : '9th house (Kshetra)';
  const scoreLabel = score >= 0.7 ? 'strong' : score >= 0.4 ? 'moderate' : 'weak';

  const parts: string[] = [
    `Santhana Prasna analysis (Ch. 18): ${houseLabel} strength is ${scoreLabel} (score: ${score.toFixed(2)}).`,
  ];

  if (flags.hasMarsConceptionYoga) {
    parts.push('Mars-in-5th with Jupiter aspect — strong yoga for conception.');
  }
  if (flags.hasSerpentCurse) {
    parts.push('Serpent-god curse (Rahu afflicting 5th) detected — Parihara advised.');
  }
  if (flags.hasKarmicCurse) {
    parts.push('Karmic/manes-curse (Saturn + Gulika) detected — Pitru Tarpana advised.');
  }
  if (flags.likelyBarrenness) {
    parts.push(
      'Barrenness indicator present — consult a qualified astrologer for detailed analysis.'
    );
  }
  if (flags.strongProgeny) {
    parts.push('Overall: favorable for progeny.');
  } else if (flags.weakProgeny) {
    parts.push('Overall: unfavorable — remedies and re-analysis recommended.');
  }

  return parts.join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// UI caption helper — ready to render in the Progeny module
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a concise UI caption string for the progeny module.
 * Based on Prasna Marga Chapter 18 stanzas.
 */
export function getProgenyUiCaption(): string {
  return [
    'Prasna Marga Chapter 18 (Santhana Prasna) indicates:',
    '• Strong 5th/9th lord with benefic aspects → likely within 1–3 years.',
    "• Mars in 5th with Jupiter's aspect → strong yoga for conception.",
    '• Multiple benefics in 5th/9th → several children over many years.',
    '• Rahu in 5th without benefic aspect → Serpent-god curse; remedies advised.',
    '• Saturn + Gulika in 1/5/9 without benefic aspect → Karmic curse; Parihara required.',
  ].join('\n');
}
