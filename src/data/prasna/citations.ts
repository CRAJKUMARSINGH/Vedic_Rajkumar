/**
 * ============================================================
 * PRASNA — SINGLE SOURCE OF BOOK REFERENCES (citations)
 * ============================================================
 *
 * Every piece of classical evidence produced by the Prasna Kernel must
 * carry a `citationId` that resolves here. No book reference may be
 * hard-coded anywhere else in the codebase (see Prasnalove.txt §1, §4).
 *
 * `verified` semantics
 *   true  — the chapter/section number is confirmed against Raman's own
 *           table of contents / printed edition (see Prasnalove.txt §2,
 *           "verified section numbers from Raman's table of contents").
 *   false — the topic does belong to a real source, but the exact
 *           stanza/page could not be independently confirmed. The UI must
 *           present these as "tradition", never as "Prasna Marga Ch. X".
 *
 * Corrections applied from Prasnalove.txt §2.1:
 *   • Tarabala / Chandra Bala are NOT a Prasna Marga chapter topic;
 *     they belong to Muhurtha (B.V. Raman).  → muhurtha.tarabala
 *   • Gulika position → PM I Ch. V §54; Pramana Gulika → Ch. X §109;
 *     Effects of Gulika → Ch. XIV §143.
 *   • Pranakshara → PM I Ch. II §24 (stanzas 104–108).
 *   • Remedies → PM I Ch. XIII §131–132, Ch. XV §153/§161/§186, Ch. XXIII.
 * ============================================================
 */

export interface Citation {
  /** Stable key referenced by EvidenceItem.citationId. */
  id: string;
  /** Book title. */
  book: string;
  /** Part / volume, when the book is multi-part. */
  part?: string;
  /** Chapter — often a Roman numeral in Raman's translation (e.g. 'VI'). */
  chapter: string;
  /** Section number within the chapter (Raman uses § markers). */
  section?: string;
  /** Stanza range, when known. */
  stanza?: string;
  /** Page reference, when physically verified. */
  page?: string;
  /** true only when independently confirmed. */
  verified: boolean;
  /** Free-text clarification surfaced next to the citation chip. */
  note?: string;
}

const PM1 = 'Prasna Marga, Part I (B.V. Raman, tr.)';
const PM2 = 'Prasna Marga, Part II (B.V. Raman, tr.)';
const MUHURTHA = 'Muhurtha (Electional Astrology) (B.V. Raman)';
const PRASNA_TANTRA = "Sri Neelakanta's Prasna Tantra (B.V. Raman, tr.)";

export const CITATIONS: Record<string, Citation> = {
  // ── Prasna Marga, Part I — verified TOC section numbers ────────────────────
  'pm.ch1.s1': {
    id: 'pm.ch1.s1',
    book: PM1,
    part: 'Part I',
    chapter: 'I',
    section: '1–11',
    verified: true,
    note: 'Qualifications of the astrologer; Prasna vs Jataka.',
  },
  'pm.ch2.s12': {
    id: 'pm.ch2.s12',
    book: PM1,
    part: 'Part I',
    chapter: 'II',
    section: '12–17',
    verified: true,
    note: 'Procedure for astrologer & querist; Arudha; things to note.',
  },
  'pm.ch2.s18': {
    id: 'pm.ch2.s18',
    book: PM1,
    part: 'Part I',
    chapter: 'II',
    section: '18–19',
    verified: true,
    note: 'Time & place factor — the moment the question arises is the chart.',
  },
  'pm.ch2.s23': {
    id: 'pm.ch2.s23',
    book: PM1,
    part: 'Part I',
    chapter: 'II',
    section: '22–23',
    verified: true,
    note: 'Sign & direction occupied by the querist.',
  },
  'pm.ch2.s24': {
    id: 'pm.ch2.s24',
    book: PM1,
    part: 'Part I',
    chapter: 'II',
    section: '24',
    stanza: '104–108',
    verified: true,
    note: 'Pranakshara: vowel = Life, consonant = Body; varga → Bhuta cycle.',
  },
  'pm.ch4.s46': {
    id: 'pm.ch4.s46',
    book: PM1,
    part: 'Part I',
    chapter: 'IV',
    section: '46–47',
    verified: true,
    note: 'Conducting the Prasna; the Ashtamangala number from three heaps.',
  },
  'pm.ch4.s47': {
    id: 'pm.ch4.s47',
    book: PM1,
    part: 'Part I',
    chapter: 'IV',
    section: '47',
    verified: true,
    note: 'The gold piece / Arudha placement.',
  },
  'pm.ch5.s54': {
    id: 'pm.ch5.s54',
    book: PM1,
    part: 'Part I',
    chapter: 'V',
    section: '54',
    verified: true,
    note: "Position of Gulika — Saturn's 1/8 part of day/night.",
  },
  'pm.ch5.s55': {
    id: 'pm.ch5.s55',
    book: PM1,
    part: 'Part I',
    chapter: 'V',
    section: '55–57',
    verified: true,
    note: 'Tri/Chatus/Panchasphuta and Prana/Deha/Mrityu sphutas.',
  },
  'pm.ch5.s59': {
    id: 'pm.ch5.s59',
    book: PM1,
    part: 'Part I',
    chapter: 'V',
    section: '59',
    verified: true,
    note: 'Arudha sphuta — Arudha sign carrying the Lagna degrees.',
  },
  'pm.ch6.s60': {
    id: 'pm.ch6.s60',
    book: PM1,
    part: 'Part I',
    chapter: 'VI',
    section: '60–65',
    verified: true,
    note: 'The Five Sutras: Samanya, Adhipati, Amsaka, Nakshatra, Maha.',
  },
  'pm.ch7.s71': {
    id: 'pm.ch7.s71',
    book: PM1,
    part: 'Part I',
    chapter: 'VII',
    section: '71–78',
    verified: true,
    note: 'Ashtamangala interpretation (planets, yonis, bhutas, tithi).',
  },
  'pm.ch10.s109': {
    id: 'pm.ch10.s109',
    book: PM1,
    part: 'Part I',
    chapter: 'X',
    section: '109',
    verified: true,
    note: 'Pramana Gulika.',
  },
  'pm.ch13.s131': {
    id: 'pm.ch13.s131',
    book: PM1,
    part: 'Part I',
    chapter: 'XIII',
    section: '131–132',
    verified: true,
    note: 'Remedial measures; Mrityunjaya Homa.',
  },
  'pm.ch14.s143': {
    id: 'pm.ch14.s143',
    book: PM1,
    part: 'Part I',
    chapter: 'XIV',
    section: '143',
    verified: true,
    note: 'Effects of Gulika in bhava judgement.',
  },
  'pm.ch15.s153': {
    id: 'pm.ch15.s153',
    book: PM1,
    part: 'Part I',
    chapter: 'XV',
    section: '153',
    verified: true,
    note: 'Palliatives for afflictions.',
  },
  'pm.ch15.s161': {
    id: 'pm.ch15.s161',
    book: PM1,
    part: 'Part I',
    chapter: 'XV',
    section: '161',
    verified: true,
    note: 'Remedial measures.',
  },
  'pm.ch15.s186': {
    id: 'pm.ch15.s186',
    book: PM1,
    part: 'Part I',
    chapter: 'XV',
    section: '186',
    verified: true,
    note: 'Who should perform the remedies.',
  },
  'pm.ch23': {
    id: 'pm.ch23',
    book: PM2,
    part: 'Part II',
    chapter: 'XXIII',
    verified: true,
    note: 'Diseases: causes & remedies (karma vipaka).',
  },

  // ── Sources whose exact stanza could not be verified → "tradition" ─────────
  'muhurtha.tarabala': {
    id: 'muhurtha.tarabala',
    book: MUHURTHA,
    chapter: 'Tarabala / Chandra Bala',
    verified: false,
    note: 'Tarabala and Chandra Bala belong to Muhurtha — NOT Prasna Marga Ch. III–IV. Exact page to be confirmed.',
  },
  'prasnaTantra.ithasala': {
    id: 'prasnaTantra.ithasala',
    book: PRASNA_TANTRA,
    chapter: 'Prashna Vichara',
    verified: false,
    note: 'Ithasala / Ishrafa / Kamboola by degree (deeptamsha). Stanza to be confirmed against the printed edition.',
  },
  'prasnaTantra.transfer': {
    id: 'prasnaTantra.transfer',
    book: PRASNA_TANTRA,
    chapter: 'Prashna Vichara',
    verified: false,
    note: 'Nakta / Yamaya (transfer of light) and Radda (obstruction). Stanza to be confirmed.',
  },
  'prasnaTantra.multiQuestion': {
    id: 'prasnaTantra.multiQuestion',
    book: PRASNA_TANTRA,
    chapter: 'Prashna Vichara',
    stanza: '5–6',
    verified: false,
    note: 'Multiple-question rule: 1st from Lagna, 2nd from the Moon, 3rd from the Sun, 4th from Jupiter, 5th from the stronger of Mercury/Venus.',
  },
};

/** All citation ids as a readonly list (handy for tests / validators). */
export const CITATION_IDS: readonly string[] = Object.keys(CITATIONS);

/** Resolve a citation id, throwing on unknown ids (fail loud, never fabricate). */
export function getCitation(id: string): Citation {
  const citation = CITATIONS[id];
  if (!citation) {
    throw new Error(`Unknown Prasna citation id: "${id}"`);
  }
  return citation;
}

/** True only when the citation is independently confirmed. */
export function isVerifiedCitation(id: string): boolean {
  return CITATIONS[id]?.verified === true;
}

/**
 * Human-readable label, e.g. "Prasna Marga, Part I (B.V. Raman, tr.) Ch. VI §60–65".
 * Unverified citations are prefixed with "tradition:" so the UI never
 * presents them as a confirmed Prasna Marga section.
 */
export function citationLabel(id: string): string {
  const c = getCitation(id);
  const section = c.section ? ` §${c.section}` : '';
  const stanza = c.stanza ? ` (st. ${c.stanza})` : '';
  const base = `${c.book} Ch. ${c.chapter}${section}${stanza}`;
  return c.verified ? base : `tradition: ${base}`;
}
