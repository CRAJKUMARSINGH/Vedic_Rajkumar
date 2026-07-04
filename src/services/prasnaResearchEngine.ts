/**
 * prasnaResearchEngine.ts
 *
 * Universal Research Engine — Prasna Marga Integration
 * Based on: Prasna Marga (Parts I & II) by B.V. Raman
 * Supporting: The Astrological Magazine (esp. September 1978 Special Issue)
 * Methodology: Kerala-style horary (Prasna) techniques
 *
 * This module is the TypeScript equivalent of the Python prasna_engine.py
 * described in PRASNA_MARG_TASK01.MD. It acts as a "logic gate" that:
 *   1. Classifies the user's question into a Prasna Marga chapter focus
 *   2. Captures the Prasna Moment (timestamp) and Querent's direction
 *   3. Derives Pranakshara (first letter of query)
 *   4. Builds a structured research payload for the AI / analysis layer
 *   5. Provides Parihara (remedial) guidance when afflictions are detected
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Direction = 'North' | 'South' | 'East' | 'West' | 'NE' | 'NW' | 'SE' | 'SW';

export type PrasnaQueryType =
  | 'health'
  | 'marriage'
  | 'progeny'
  | 'career'
  | 'property'
  | 'travel'
  | 'litigation'
  | 'longevity'
  | 'spirituality'
  | 'general';

export interface PrasnaMetadata {
  /** Exact moment the query was submitted — the sacred Prasna Moment */
  timestamp: Date;
  /** Direction the querent is facing (optional; defaults to East) */
  direction: Direction;
  /** First letter of the query — Pranakshara */
  pranakshara: string;
  /** Derived from timestamp: day of week */
  dayName: string;
  /** Derived from timestamp: hora number (0-23) */
  horaNumber: number;
}

export interface PrasnaChapterFocus {
  queryType: PrasnaQueryType;
  chapterRef: string;
  chapterHint: string;
  pancha_sutra: string;
  requiresParihara: boolean;
}

export interface PariharaAdvice {
  mantra?: string;
  deity?: string;
  day?: string;
  gem?: string;
  ritual?: string;
  note: string;
}

export interface UniversalResearchPayload {
  /** The original user question */
  question: string;
  /** Prasna metadata captured at submission time */
  metadata: PrasnaMetadata;
  /** Chapter focus derived from question classification */
  chapterFocus: PrasnaChapterFocus;
  /** Parihara advice (only populated when requiresParihara = true) */
  parihara?: PariharaAdvice;
  /** The formatted research prompt ready for the AI layer */
  researchPrompt: string;
  /** Source attribution */
  source: string;
  /** Magazine cross-reference note */
  magazineNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Pranakshara → Rashi mapping (classical Kerala system) */
const PRANAKSHARA_RASHI: Record<string, string> = {
  A: 'Aries',
  B: 'Taurus',
  C: 'Gemini',
  D: 'Cancer',
  E: 'Leo',
  F: 'Virgo',
  G: 'Libra',
  H: 'Scorpio',
  I: 'Sagittarius',
  J: 'Capricorn',
  K: 'Aquarius',
  L: 'Pisces',
  M: 'Aries',
  N: 'Taurus',
  O: 'Gemini',
  P: 'Cancer',
  Q: 'Leo',
  R: 'Virgo',
  S: 'Libra',
  T: 'Scorpio',
  U: 'Sagittarius',
  V: 'Capricorn',
  W: 'Aquarius',
  X: 'Pisces',
  Y: 'Aries',
  Z: 'Taurus',
};

/** Direction → Arudha Lagna hint (Prasna Marga Ch. 23-24) */
const DIRECTION_ARUDHA: Record<Direction, string> = {
  East: 'Lagna or 1st house — self, vitality, new beginnings',
  West: '7th house — partnerships, marriage, opponents',
  North: '10th house — career, status, authority',
  South: '4th house — home, mother, property, vehicles',
  NE: '9th house — fortune, dharma, father, long journeys',
  NW: '11th house — gains, income, friends, fulfilment',
  SE: '3rd house — siblings, courage, short journeys',
  SW: '6th house — enemies, disease, debt, service',
};

// ─────────────────────────────────────────────────────────────────────────────
// Chapter classification — Pancha Sutra router
// ─────────────────────────────────────────────────────────────────────────────

const CHAPTER_MAP: {
  type: PrasnaQueryType;
  keywords: string[];
  chapterRef: string;
  chapterHint: string;
  pancha_sutra: string;
  requiresParihara: boolean;
}[] = [
  {
    type: 'health',
    keywords: [
      'sick',
      'health',
      'disease',
      'illness',
      'fever',
      'pain',
      'hospital',
      'doctor',
      'medicine',
      'cure',
      'recovery',
      'रोग',
      'स्वास्थ्य',
      'बीमारी',
    ],
    chapterRef: 'Prasna Marga Part I, Chapters XII–XV',
    chapterHint:
      'Rogi Prasna (Patient Query) — assess 1st, 6th, 8th lords; Gulika position; Moon affliction.',
    pancha_sutra: 'Tatkalakshana → Arudha → Gulika → Pranakshara → Parihara',
    requiresParihara: true,
  },
  {
    type: 'longevity',
    keywords: [
      'death',
      'longevity',
      'lifespan',
      'accident',
      'danger',
      'survive',
      'आयु',
      'मृत्यु',
      'दुर्घटना',
    ],
    chapterRef: 'Prasna Marga Part I, Chapters XIV–XVI',
    chapterHint:
      'Mrityu Prasna — judge 8th house, 8th lord, Maraka planets (2nd/7th lords), Gulika.',
    pancha_sutra: 'Tatkalakshana → Arudha → Gulika → Maraka → Parihara',
    requiresParihara: true,
  },
  {
    type: 'marriage',
    keywords: [
      'marry',
      'marriage',
      'wedding',
      'wife',
      'husband',
      'spouse',
      'partner',
      'relationship',
      'love',
      'विवाह',
      'पति',
      'पत्नी',
      'शादी',
      'प्रेम',
    ],
    chapterRef: 'Prasna Marga Part II, Chapter XVIII (Vivaha Prasna)',
    chapterHint:
      'Vivaha Prasna — 7th house, 7th lord, Venus, Navamsha; Arudha Lagna from querent direction.',
    pancha_sutra: 'Tatkalakshana → Arudha → 7th lord → Venus → Timing',
    requiresParihara: false,
  },
  {
    type: 'progeny',
    keywords: [
      'child',
      'children',
      'baby',
      'pregnancy',
      'conceive',
      'progeny',
      'son',
      'daughter',
      'birth',
      'संतान',
      'बच्चा',
      'गर्भ',
      'पुत्र',
      'पुत्री',
    ],
    chapterRef: 'Prasna Marga Part II, Chapter XVIII (Santhana Prasna)',
    chapterHint:
      'Santhana Prasna — 5th house (male) / 9th house (female); Beeja-Kshetra; Gulika; Rahu affliction.',
    pancha_sutra: 'Tatkalakshana → Beeja/Kshetra → Gulika → Rahu → Timing',
    requiresParihara: false,
  },
  {
    type: 'career',
    keywords: [
      'job',
      'career',
      'promotion',
      'business',
      'work',
      'office',
      'profession',
      'success',
      'money',
      'wealth',
      'income',
      'salary',
      'profit',
      'नौकरी',
      'व्यवसाय',
      'पदोन्नति',
      'धन',
      'आय',
      'सफलता',
    ],
    chapterRef: 'Prasna Marga Part II, Chapters XXI–XXII (Bhagyoday & Karma Prasna)',
    chapterHint:
      'Karma/Bhagya Prasna — 10th house, 10th lord, 2nd house, 11th house; Dasha support.',
    pancha_sutra: 'Tatkalakshana → Arudha → 10th lord → 11th lord → Dasha',
    requiresParihara: false,
  },
  {
    type: 'property',
    keywords: [
      'home',
      'house',
      'property',
      'land',
      'vehicle',
      'car',
      'buy',
      'sell',
      'real estate',
      'गृह',
      'मकान',
      'भूमि',
      'वाहन',
      'खरीद',
      'बेच',
    ],
    chapterRef: 'Prasna Marga Part I, Chapters IX–X',
    chapterHint:
      '4th house Prasna — 4th lord, Moon, Mars (for land); direction of property from querent.',
    pancha_sutra: 'Tatkalakshana → Arudha → 4th lord → Moon → Direction',
    requiresParihara: false,
  },
  {
    type: 'travel',
    keywords: [
      'travel',
      'journey',
      'abroad',
      'foreign',
      'trip',
      'visa',
      'immigration',
      'यात्रा',
      'विदेश',
      'प्रवास',
    ],
    chapterRef: 'Prasna Marga Part II, Chapter XX (Pravasa Prasna)',
    chapterHint: 'Pravasa Prasna — 3rd (short), 9th (long), 12th (foreign); direction of travel.',
    pancha_sutra: 'Tatkalakshana → Arudha → 9th/12th lord → Direction → Timing',
    requiresParihara: false,
  },
  {
    type: 'litigation',
    keywords: [
      'court',
      'case',
      'lawsuit',
      'legal',
      'litigation',
      'enemy',
      'dispute',
      'मुकदमा',
      'अदालत',
      'शत्रु',
      'विवाद',
    ],
    chapterRef: 'Prasna Marga Part I, Chapter XI',
    chapterHint: '6th house Prasna — 6th lord, Mars, Saturn; strength of querent vs opponent.',
    pancha_sutra: 'Tatkalakshana → Arudha → 6th lord → Mars → Verdict',
    requiresParihara: false,
  },
  {
    type: 'spirituality',
    keywords: [
      'spiritual',
      'mantra',
      'puja',
      'temple',
      'pilgrimage',
      'moksha',
      'guru',
      'dharma',
      'meditation',
      'आध्यात्म',
      'मंत्र',
      'पूजा',
      'तीर्थ',
      'मोक्ष',
    ],
    chapterRef: 'Prasna Marga Part I, Chapters I–III',
    chapterHint:
      '9th/12th house Prasna — Jupiter, Ketu; auspiciousness of the Prasna moment itself.',
    pancha_sutra: 'Tatkalakshana → Pranakshara → Jupiter → 9th lord → Muhurta',
    requiresParihara: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Parihara (Remedial) database — keyed by query type
// ─────────────────────────────────────────────────────────────────────────────

const PARIHARA_DB: Record<string, PariharaAdvice> = {
  health: {
    deity: 'Lord Dhanvantari / Maha Mrityunjaya',
    mantra: 'Om Tryambakam Yajamahe (Maha Mrityunjaya Japa — 108 times daily)',
    day: 'Sunday (Sun) or Monday (Moon)',
    gem: 'Pearl (Moon) or Ruby (Sun) — consult a qualified astrologer',
    ritual: "Donate medicines or food to the needy on the afflicted planet's day",
    note: 'Per Prasna Marga Part II Remedial sections: Parihara for Rogi Prasna involves propitiation of the 6th/8th lord and Gulika.',
  },
  longevity: {
    deity: 'Lord Shiva (Maha Mrityunjaya form)',
    mantra: 'Om Tryambakam Yajamahe — 1008 times; Mrityunjaya Homa recommended',
    day: 'Saturday (Saturn) — fast and donate sesame seeds',
    ritual: 'Ayushya Homa; Navagraha Shanti for afflicted planets',
    note: 'Per Prasna Marga: Maraka Parihara requires propitiation of 2nd and 7th lords along with Saturn.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Captures the Prasna Moment metadata at the exact time of query submission.
 * This is the "Vow of Silence" moment described in PRASNA_MARG_TASK01.MD.
 */
export function capturePrasnaMetadata(
  question: string,
  direction: Direction = 'East',
  at: Date = new Date()
): PrasnaMetadata {
  return {
    timestamp: at,
    direction,
    pranakshara: question.trim()[0]?.toUpperCase() ?? 'A',
    dayName: DAY_NAMES[at.getDay()],
    horaNumber: at.getHours(),
  };
}

/**
 * Classifies the question into a Prasna Marga chapter focus.
 * Implements the Pancha Sutra router from PRASNA_MARG_TASK01.MD Section 4.
 */
export function classifyPrasnaQuery(question: string): PrasnaChapterFocus {
  const q = question.toLowerCase();
  let best: (typeof CHAPTER_MAP)[0] | null = null;
  let bestScore = 0;

  for (const entry of CHAPTER_MAP) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (!best) {
    // General fallback — Chapters I–X
    return {
      queryType: 'general',
      chapterRef: 'Prasna Marga Part I, Chapters I–X',
      chapterHint: 'General Prasna — Arudha Lagna, Hora Lord, Moon position, Pranakshara analysis.',
      pancha_sutra: 'Tatkalakshana → Arudha → Hora Lord → Moon → Pranakshara',
      requiresParihara: false,
    };
  }

  return {
    queryType: best.type,
    chapterRef: best.chapterRef,
    chapterHint: best.chapterHint,
    pancha_sutra: best.pancha_sutra,
    requiresParihara: best.requiresParihara,
  };
}

/**
 * Derives Parihara (remedial) advice for afflicted queries.
 */
export function getPariharaAdvice(queryType: PrasnaQueryType): PariharaAdvice | undefined {
  return PARIHARA_DB[queryType];
}

/**
 * Returns the Arudha Lagna hint based on the querent's direction.
 * Per Prasna Marga Chapters 23–24 (Direction occupied by the Querist).
 */
export function getArudhaHint(direction: Direction): string {
  return DIRECTION_ARUDHA[direction];
}

/**
 * Returns the Rashi associated with the Pranakshara (first letter of query).
 * Per Prasna Marga Chapter 24.
 */
export function getPranaksharaRashi(letter: string): string {
  return PRANAKSHARA_RASHI[letter.toUpperCase()] ?? 'Aries';
}

/**
 * Main entry point — builds the complete Universal Research Payload.
 *
 * Usage:
 *   const payload = buildUniversalResearchPayload(userQuestion, 'East');
 *   // Pass payload.researchPrompt to your AI/analysis layer
 */
export function buildUniversalResearchPayload(
  question: string,
  direction: Direction = 'East',
  at: Date = new Date()
): UniversalResearchPayload {
  const metadata = capturePrasnaMetadata(question, direction, at);
  const chapterFocus = classifyPrasnaQuery(question);
  const parihara = chapterFocus.requiresParihara
    ? getPariharaAdvice(chapterFocus.queryType)
    : undefined;

  const arudhaHint = getArudhaHint(direction);
  const pranaksharaRashi = getPranaksharaRashi(metadata.pranakshara);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const ts = metadata.timestamp;
  const timestampStr = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())} ${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`;

  const researchPrompt = [
    `ACT AS: An expert in Prasna Marga (B.V. Raman) and The Astrological Magazine.`,
    ``,
    `USER QUESTION: "${question}"`,
    ``,
    `PRASNA MOMENT (Timestamp): ${timestampStr} (${metadata.dayName})`,
    `QUERENT'S DIRECTION: ${direction}`,
    `ARUDHA LAGNA HINT: ${arudhaHint}`,
    `PRANAKSHARA: "${metadata.pranakshara}" → Rashi: ${pranaksharaRashi}`,
    `HORA NUMBER: ${metadata.horaNumber}`,
    ``,
    `CHAPTER FOCUS: ${chapterFocus.chapterRef}`,
    `METHODOLOGY: ${chapterFocus.chapterHint}`,
    `PANCHA SUTRA SEQUENCE: ${chapterFocus.pancha_sutra}`,
    ``,
    `MANDATORY ANALYSIS STEPS (Per Kerala Prasna Tradition):`,
    `1. TATKALAKSHANA — Note omens/signs at the Prasna Moment (${timestampStr}).`,
    `2. ARUDHA — Querent faces ${direction}; Arudha points to: ${arudhaHint}.`,
    `3. GULIKA — Assess Gulika's position for affliction or support.`,
    `4. PRANAKSHARA — First letter "${metadata.pranakshara}" maps to ${pranaksharaRashi}; use this as a secondary lagna indicator.`,
    `5. PANCHA SUTRAS — Apply the five threads: ${chapterFocus.pancha_sutra}.`,
    ...(parihara
      ? [
          ``,
          `PARIHARA (REMEDIAL) REQUIRED:`,
          `  Deity: ${parihara.deity ?? 'N/A'}`,
          `  Mantra: ${parihara.mantra ?? 'N/A'}`,
          `  Day: ${parihara.day ?? 'N/A'}`,
          `  Ritual: ${parihara.ritual ?? 'N/A'}`,
          `  Note: ${parihara.note}`,
        ]
      : []),
    ``,
    `OUTPUT FORMAT:`,
    `  Section 1 — Brief Astro-Logic Summary (1–3 lines)`,
    `  Section 2 — Core Method (structured bullets, Prasna Marga framework)`,
    `  Section 3 — Predictive / Advisory Answer (plain, ethical, non-fatalistic)`,
    ``,
    `CROSS-REFERENCE: Check The Astrological Magazine (September 1978 Special Issue)`,
    `for modern research parallels to this specific question type.`,
    ``,
    `TONE: Authoritative & scholarly — mirror Dr. B.V. Raman's analytical style.`,
    `CITATIONS: Reference chapter and methodology (e.g., "Per Prasna Marga Ch. XVIII...").`,
  ].join('\n');

  return {
    question,
    metadata,
    chapterFocus,
    parihara,
    researchPrompt,
    source: 'Prasna Marga (Parts I & II) — B.V. Raman, Motilal Banarsidass',
    magazineNote:
      'Cross-reference: The Astrological Magazine (B.V. Raman, Editor) — September 1978 Special Issue on Prasna Marga.',
  };
}
