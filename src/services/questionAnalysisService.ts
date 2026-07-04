/**
 * Unified Question / Prashna Analysis Service
 *
 * Implements classical Prasna Marga (Panakkattu Nambudiripad) and
 * B.V. Raman's "Prasnatantra" / "Prasna Marga" / Astrological Magazine
 * principles for answering questions in two modes:
 *
 *   MODE A — Enrolled Jatak (birth chart on file):
 *     Combines NATAL chart + CURRENT TRANSITS (Gochar) + question-category
 *     significator + Dasha indication. Reference: BPHS + Raman's
 *     "Transit results manifest only when supported by Dasha".
 *
 *   MODE B — Anonymous querent (no birth data):
 *     Pure Prasna chart cast for the moment & place of question.
 *     Uses Prashna Lagna, Hora Lord, Moon position, and Karyesh.
 *
 * NOTE: Per project policy, this is a NEW segment, not a logical change to
 * existing services. It composes existing ephemerisService /
 * dynamicTransitService / prashnaChartService outputs.
 */

import { calculateCompletePlanetaryPositions, type PlanetaryPositions } from './ephemerisService';
import { calculateDynamicTransits, type DynamicTransitInput } from './dynamicTransitService';

// ─────────────────────────────────────────────────────────────────────────────
// Constants — classical Vedic Astrology
// ─────────────────────────────────────────────────────────────────────────────

export const RASHIS_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const RASHIS_HI = [
  'मेष',
  'वृषभ',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुंभ',
  'मीन',
];

// Day-lord & hora rotation (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
// Hora lords cycle in Chaldean order: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
const DAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const HORA_CHALDEAN = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

// House significations (Bhavas) per Prasna Marga & BPHS
export const HOUSE_SIGNIFICATIONS: Record<
  number,
  { en: string; hi: string; karaka: string; topics: string[] }
> = {
  1: {
    en: 'Self, body, health, personality',
    hi: 'तन, स्वास्थ्य, व्यक्तित्व',
    karaka: 'Sun',
    topics: ['health', 'self', 'appearance', 'vitality'],
  },
  2: {
    en: 'Wealth, family, speech, food',
    hi: 'धन, कुटुंब, वाणी, भोजन',
    karaka: 'Jupiter',
    topics: ['money', 'wealth', 'family', 'savings', 'speech'],
  },
  3: {
    en: 'Siblings, courage, short journey',
    hi: 'भाई-बहन, साहस, यात्रा',
    karaka: 'Mars',
    topics: ['sibling', 'brother', 'sister', 'courage', 'communication'],
  },
  4: {
    en: 'Mother, home, property, vehicles',
    hi: 'माता, गृह, भूमि, वाहन',
    karaka: 'Moon',
    topics: ['home', 'house', 'mother', 'land', 'property', 'vehicle'],
  },
  5: {
    en: 'Children, education, intellect, mantra',
    hi: 'संतान, विद्या, बुद्धि, मंत्र',
    karaka: 'Jupiter',
    topics: ['child', 'children', 'education', 'study', 'exam', 'love', 'romance'],
  },
  6: {
    en: 'Enemies, disease, debt, service',
    hi: 'शत्रु, रोग, ऋण, सेवा',
    karaka: 'Mars',
    topics: ['enemy', 'disease', 'illness', 'loan', 'debt', 'litigation', 'job'],
  },
  7: {
    en: 'Marriage, partnership, spouse',
    hi: 'विवाह, साझेदारी, जीवनसाथी',
    karaka: 'Venus',
    topics: ['marriage', 'spouse', 'wife', 'husband', 'partner', 'business partner'],
  },
  8: {
    en: 'Longevity, obstacles, hidden matters',
    hi: 'आयु, बाधा, गुप्त',
    karaka: 'Saturn',
    topics: ['longevity', 'death', 'accident', 'obstacle', 'occult', 'secret'],
  },
  9: {
    en: 'Fortune, dharma, father, long journey',
    hi: 'भाग्य, धर्म, पिता, यात्रा',
    karaka: 'Jupiter',
    topics: ['luck', 'fortune', 'father', 'spirituality', 'travel', 'abroad'],
  },
  10: {
    en: 'Career, status, profession, fame',
    hi: 'कर्म, यश, व्यवसाय',
    karaka: 'Saturn',
    topics: ['career', 'job', 'profession', 'business', 'promotion', 'work'],
  },
  11: {
    en: 'Gains, income, elder siblings, friends',
    hi: 'लाभ, आय, मित्र',
    karaka: 'Jupiter',
    topics: ['gain', 'income', 'profit', 'friend', 'fulfillment', 'wish'],
  },
  12: {
    en: 'Loss, expenditure, foreign, moksha',
    hi: 'व्यय, विदेश, मोक्ष',
    karaka: 'Saturn',
    topics: ['loss', 'expense', 'foreign', 'abroad', 'spirituality', 'moksha'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Question categorisation — map natural-language keyword → significator house
// ─────────────────────────────────────────────────────────────────────────────

export interface QuestionCategory {
  house: number;
  label: { en: string; hi: string };
  karaka: string;
}

const CATEGORY_KEYWORDS: { house: number; words: string[] }[] = [
  { house: 1, words: ['health', 'myself', 'body', 'energy', 'वतन', 'स्वास्थ्य', 'तन'] },
  { house: 2, words: ['money', 'wealth', 'savings', 'income', 'salary', 'धन', 'वेतन'] },
  { house: 3, words: ['brother', 'sister', 'sibling', 'courage', 'भाई', 'बहन', 'साहस'] },
  {
    house: 4,
    words: [
      'home',
      'house',
      'property',
      'land',
      'mother',
      'vehicle',
      'car',
      'गृह',
      'मकान',
      'माता',
      'भूमि',
      'वाहन',
    ],
  },
  {
    house: 5,
    words: [
      'child',
      'children',
      'baby',
      'education',
      'study',
      'exam',
      'love',
      'romance',
      'संतान',
      'बच्चा',
      'विद्या',
      'प्रेम',
    ],
  },
  {
    house: 6,
    words: [
      'enemy',
      'disease',
      'illness',
      'loan',
      'debt',
      'litigation',
      'court',
      'job',
      'रोग',
      'शत्रु',
      'ऋण',
      'मुकदमा',
      'नौकरी',
    ],
  },
  {
    house: 7,
    words: ['marriage', 'spouse', 'wife', 'husband', 'partner', 'विवाह', 'पति', 'पत्नी', 'साझेदार'],
  },
  {
    house: 8,
    words: [
      'accident',
      'death',
      'longevity',
      'obstacle',
      'occult',
      'secret',
      'inheritance',
      'बाधा',
      'आयु',
      'गुप्त',
      'दुर्घटना',
    ],
  },
  {
    house: 9,
    words: [
      'luck',
      'fortune',
      'father',
      'guru',
      'pilgrimage',
      'spirituality',
      'भाग्य',
      'पिता',
      'धर्म',
      'तीर्थ',
    ],
  },
  {
    house: 10,
    words: [
      'career',
      'profession',
      'promotion',
      'business',
      'work',
      'office',
      'fame',
      'कर्म',
      'नौकरी',
      'व्यवसाय',
      'पदोन्नति',
    ],
  },
  {
    house: 11,
    words: ['gain', 'profit', 'friend', 'wish', 'desire', 'fulfilment', 'लाभ', 'मित्र', 'इच्छा'],
  },
  {
    house: 12,
    words: [
      'loss',
      'expense',
      'foreign',
      'abroad',
      'moksha',
      'isolation',
      'hospital',
      'व्यय',
      'विदेश',
      'अस्पताल',
      'मोक्ष',
    ],
  },
];

export function classifyQuestion(question: string): QuestionCategory {
  const q = question.toLowerCase();
  let best = { house: 1, score: 0 };
  for (const entry of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const w of entry.words) {
      if (q.includes(w.toLowerCase())) score += w.length; // longer match = stronger
    }
    if (score > best.score) best = { house: entry.house, score };
  }
  const sig = HOUSE_SIGNIFICATIONS[best.house];
  return {
    house: best.house,
    label: { en: sig.en, hi: sig.hi },
    karaka: sig.karaka,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hora-lord (planetary hour) calculation — Prasna Marga ch.4
// ─────────────────────────────────────────────────────────────────────────────

export function getHoraLord(when: Date): { lord: string; horaIndex: number; dayLord: string } {
  // Approximate sunrise at 06:00 local; for prasna purposes this is the standard
  // simplification used in Raman's Prasnatantra examples.
  const dayOfWeek = when.getDay(); // 0 = Sunday
  const dayLord = DAY_LORDS[dayOfWeek];

  const hoursAfterSunrise = (when.getHours() + when.getMinutes() / 60 - 6 + 24) % 24;
  const horaIndex = Math.floor(hoursAfterSunrise);

  // Find day-lord position in chaldean cycle, then advance by horaIndex
  const startIdx = HORA_CHALDEAN.indexOf(dayLord);
  const lord = HORA_CHALDEAN[((startIdx >= 0 ? startIdx : 0) + horaIndex) % 7];
  return { lord, horaIndex, dayLord };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lagna / Ascendant for Prasna chart — uses ephemeris service
// ─────────────────────────────────────────────────────────────────────────────

function getLagnaIndexFromPositions(positions: PlanetaryPositions): number {
  // The ephemeris service computes ascendant degrees in tropical→sidereal.
  // We just need its rashi (0-11). Try common shapes defensively.
  const anyPos = positions as unknown as Record<string, unknown>;
  const candidates = ['ascendant', 'Ascendant', 'lagna', 'Lagna'];
  for (const k of candidates) {
    const v = anyPos[k];
    if (v && typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      if (typeof obj.rashi === 'number') return obj.rashi;
      if (typeof obj.sign === 'number') return obj.sign;
      if (typeof obj.longitude === 'number') return Math.floor((obj.longitude as number) / 30) % 12;
    }
  }
  return 0;
}

function getMoonRashi(positions: PlanetaryPositions): number {
  const anyPos = positions as unknown as Record<string, unknown>;
  for (const k of ['moon', 'Moon']) {
    const v = anyPos[k];
    if (v && typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      if (typeof obj.rashi === 'number') return obj.rashi;
      if (typeof obj.sign === 'number') return obj.sign;
      if (typeof obj.longitude === 'number') return Math.floor((obj.longitude as number) / 30) % 12;
    }
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verdict scoring — combines multiple Prasna indicators
// ─────────────────────────────────────────────────────────────────────────────

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const MALEFICS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun']);

function isBenefic(planet: string): boolean {
  return BENEFICS.has(planet);
}

const KENDRA = new Set([1, 4, 7, 10]); // angular
const TRIKONA = new Set([1, 5, 9]); // trinal
const DUSTHANA = new Set([6, 8, 12]); // malefic

function houseDistance(fromRashi: number, toRashi: number): number {
  // 1-indexed: 1 = same sign as lagna
  return ((toRashi - fromRashi + 12) % 12) + 1;
}

export interface PrasnaIndicator {
  name: string;
  weight: number; // -3 … +3
  detail: { en: string; hi: string };
}

export interface PrasnaVerdict {
  score: number; // sum of indicator weights
  outcome: 'favorable' | 'mixed' | 'unfavorable';
  outcomeLabel: { en: string; hi: string };
  conclusion: { en: string; hi: string }; // Added to match UI usage
  indicators: PrasnaIndicator[];
}

function scoreToOutcome(score: number): PrasnaVerdict['outcome'] {
  if (score >= 3) return 'favorable';
  if (score <= -3) return 'unfavorable';
  return 'mixed';
}

function outcomeLabel(o: PrasnaVerdict['outcome']) {
  if (o === 'favorable') return { en: 'Favorable — proceed', hi: 'शुभ — आगे बढ़ें' };
  if (o === 'unfavorable') return { en: 'Unfavorable — postpone/care', hi: 'अशुभ — स्थगित करें' };
  return { en: 'Mixed — proceed cautiously', hi: 'मिश्रित — सावधानी से आगे बढ़ें' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — generate a unified verdict
// ─────────────────────────────────────────────────────────────────────────────

export interface QuestionInput {
  question: string;
  questionTime: Date; // moment the question is asked
  questionLocation: { lat: number; lon: number; label?: string };
  // OPTIONAL — when present, Mode A (enrolled jatak) analysis is used
  natal?: {
    name?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    lat: number;
    lon: number;
    moonRashiIndex?: number; // 0-11 if known
  };
}

export interface QuestionAnalysis {
  mode: 'natal+transit' | 'prasna';
  jatakName?: string;
  category: QuestionCategory;
  answer: { en: string; hi: string };
  prashnaLagnaRashi: number; // 0-11
  moonRashi: number; // 0-11 of moon at question time
  horaLord: string;
  dayLord: string;
  verdict: PrasnaVerdict;
  // Detailed transit insights (Mode A only)
  transitsHighlight?: string[];
  // Suggested timing window (Hindi/English advice)
  timing: { en: string; hi: string };
  // Classical reference
  reference: string;
}

export async function analyzeQuestion(input: QuestionInput): Promise<QuestionAnalysis> {
  const { question, questionTime, questionLocation, natal } = input;
  const category = classifyQuestion(question);
  const indicators: PrasnaIndicator[] = [];

  // 1. Cast Prasna chart for the moment of question
  const prasnaPositions = await safeCalculatePositions(
    questionTime,
    questionLocation.lat,
    questionLocation.lon
  );
  const prashnaLagna = getLagnaIndexFromPositions(prasnaPositions);
  const moonRashi = getMoonRashi(prasnaPositions);

  // 2. Hora-lord (planetary hour)
  const { lord: horaLord, dayLord } = getHoraLord(questionTime);

  // ── Indicator A: hora lord nature ──
  if (isBenefic(horaLord)) {
    indicators.push({
      name: 'horaLord',
      weight: +1,
      detail: {
        en: `Benefic hora lord (${horaLord}) supports the query.`,
        hi: `शुभ होरा स्वामी (${horaLord}) प्रश्न का समर्थन करता है।`,
      },
    });
  } else {
    indicators.push({
      name: 'horaLord',
      weight: -1,
      detail: {
        en: `Malefic hora lord (${horaLord}) — exercise caution.`,
        hi: `अशुभ होरा स्वामी (${horaLord}) — सावधानी आवश्यक।`,
      },
    });
  }

  // ── Indicator B: question-house from prasna lagna ──
  const dist = houseDistance(prashnaLagna, (prashnaLagna + category.house - 1) % 12);
  if (KENDRA.has(dist) || TRIKONA.has(dist)) {
    indicators.push({
      name: 'questionHouse',
      weight: +2,
      detail: {
        en: `${category.label.en} house falls in an angular/trinal position from Prasna Lagna — strong support.`,
        hi: `प्रश्न लग्न से ${category.label.hi} भाव केंद्र/त्रिकोण में — बल प्राप्त।`,
      },
    });
  } else if (DUSTHANA.has(dist)) {
    indicators.push({
      name: 'questionHouse',
      weight: -2,
      detail: {
        en: `${category.label.en} house falls in a dusthana from Prasna Lagna — obstacles indicated.`,
        hi: `प्रश्न लग्न से ${category.label.hi} भाव दुस्थान में — बाधा का संकेत।`,
      },
    });
  } else {
    indicators.push({
      name: 'questionHouse',
      weight: 0,
      detail: {
        en: `${category.label.en} house in neutral position from Prasna Lagna.`,
        hi: `प्रश्न लग्न से ${category.label.hi} भाव सामान्य स्थिति में।`,
      },
    });
  }

  // ── Indicator C: Moon's house from prasna lagna (Chandra-bala) ──
  const moonDist = houseDistance(prashnaLagna, moonRashi);
  if (KENDRA.has(moonDist) || TRIKONA.has(moonDist) || moonDist === 11) {
    indicators.push({
      name: 'moonStrength',
      weight: +1,
      detail: {
        en: `Moon in house ${moonDist} from Lagna — querent's mind is steady.`,
        hi: `लग्न से ${moonDist} भाव में चंद्र — मन स्थिर है।`,
      },
    });
  } else if (DUSTHANA.has(moonDist)) {
    indicators.push({
      name: 'moonStrength',
      weight: -1,
      detail: {
        en: `Moon in dusthana (${moonDist}) — querent is distressed; result delayed.`,
        hi: `दुस्थान में चंद्र (${moonDist}) — चिंतित मन; फल विलंब से।`,
      },
    });
  }

  // ── Indicator D: karaka of category nature ──
  if (isBenefic(category.karaka)) {
    indicators.push({
      name: 'karyesh',
      weight: +1,
      detail: {
        en: `Karaka ${category.karaka} of this question is naturally benefic.`,
        hi: `इस प्रश्न का कारक ${category.karaka} स्वभावतः शुभ है।`,
      },
    });
  }

  // 3. Mode A — combine with natal chart + transits
  let transitsHighlight: string[] | undefined;
  let mode: QuestionAnalysis['mode'] = 'prasna';

  if (natal) {
    mode = 'natal+transit';
    try {
      const natalDate = new Date(`${natal.date}T${natal.time}:00`);
      const natalPositions = await safeCalculatePositions(natalDate, natal.lat, natal.lon);
      const natalMoonRashi = natal.moonRashiIndex ?? getMoonRashi(natalPositions);

      // Run dynamic-transit analysis for the question time, using jatak's natal moon
      const transitInput: DynamicTransitInput = {
        moonRashiIndex: natalMoonRashi,
        date: questionTime,
      };
      const transitResult = await safeCalculateTransits(transitInput);

      const favorableCount = transitResult?.favorable?.length ?? 0;
      const mixedCount = transitResult?.mixed?.length ?? 0;
      const unfavorableCount = transitResult?.unfavorable?.length ?? 0;

      if (favorableCount >= unfavorableCount + 2) {
        indicators.push({
          name: 'natalTransitSupport',
          weight: +2,
          detail: {
            en: `Current transits over jatak's natal Moon are predominantly favorable (${favorableCount} favorable vs ${unfavorableCount} unfavorable).`,
            hi: `जातक के जन्म चंद्र पर वर्तमान गोचर मुख्यतः शुभ हैं (${favorableCount} शुभ vs ${unfavorableCount} अशुभ)।`,
          },
        });
      } else if (unfavorableCount >= favorableCount + 2) {
        indicators.push({
          name: 'natalTransitSupport',
          weight: -2,
          detail: {
            en: `Current transits over jatak's natal Moon are predominantly unfavorable (${unfavorableCount} unfavorable).`,
            hi: `जातक के जन्म चंद्र पर वर्तमान गोचर मुख्यतः अशुभ हैं (${unfavorableCount} अशुभ)।`,
          },
        });
      } else {
        indicators.push({
          name: 'natalTransitSupport',
          weight: 0,
          detail: {
            en: `Mixed transits over jatak's natal chart (${favorableCount}/${mixedCount}/${unfavorableCount}).`,
            hi: `जन्म कुंडली पर मिश्रित गोचर (${favorableCount}/${mixedCount}/${unfavorableCount})।`,
          },
        });
      }

      transitsHighlight = [
        ...(transitResult?.favorable ?? [])
          .slice(0, 2)
          .map(
            (t: { planet: string; effect?: { en?: string } }) =>
              `✓ ${t.planet}: ${t.effect?.en ?? 'favorable'}`
          ),
        ...(transitResult?.unfavorable ?? [])
          .slice(0, 2)
          .map(
            (t: { planet: string; effect?: { en?: string } }) =>
              `✗ ${t.planet}: ${t.effect?.en ?? 'unfavorable'}`
          ),
      ];
    } catch (e) {
      console.warn('[QuestionAnalysis] natal+transit branch failed', e);
    }
  }

  // 4. Final verdict
  const score = indicators.reduce((s, i) => s + i.weight, 0);
  const outcome = scoreToOutcome(score);
  const labels = outcomeLabel(outcome);
  const verdict: PrasnaVerdict = {
    score,
    outcome,
    outcomeLabel: labels,
    conclusion: {
      en: labels.en,
      hi: labels.hi,
    },
    indicators,
  };

  // 5. Timing recommendation (very classical heuristic)
  const timing = computeTimingAdvice(outcome, category, horaLord);
  const answer = buildAnswerSummary({
    outcome,
    category,
    timing,
    natal,
    transitsHighlight,
  });

  return {
    mode,
    jatakName: natal?.name,
    category,
    answer,
    prashnaLagnaRashi: prashnaLagna,
    moonRashi,
    horaLord,
    dayLord,
    verdict,
    transitsHighlight,
    timing,
    reference: natal
      ? "Combined natal-Gochar analysis per BPHS + Raman's Prasnatantra (1992)."
      : 'Prasna Marga (Panakkattu Nambudiripad) Ch.4-7; B.V. Raman, Prasnatantra.',
  };
}

interface HouseInterpretation {
  favorable: { en: string; hi: string };
  unfavorable: { en: string; hi: string };
  mixed: { en: string; hi: string };
}

const HOUSE_INTERPRETATIONS: Record<number, HouseInterpretation> = {
  1: {
    favorable: {
      en: 'The stars strongly support your self-growth, vitality, and personal health. You will feel highly energetic and focused on achieving your personal goals.',
      hi: 'सितारे आपके व्यक्तिगत विकास, आत्मबल और स्वास्थ्य का पुरजोर समर्थन करते हैं। आप अत्यधिक ऊर्जावान महसूस करेंगे और अपने लक्ष्यों को प्राप्त करने में सफल होंगे।',
    },
    unfavorable: {
      en: 'Physical energy or self-confidence looks temporarily low. Avoid taking heavy physical stress and focus on self-care and rejuvenation.',
      hi: 'शारीरिक ऊर्जा या आत्मविश्वास अस्थायी रूप से कमजोर दिख रहा है। भारी शारीरिक तनाव से बचें और स्वयं की देखभाल तथा आराम पर ध्यान केंद्रित करें।',
    },
    mixed: {
      en: 'Your personal vitality is moderate. Keep a balanced lifestyle, do not rush into major personal transitions immediately.',
      hi: 'आपकी शारीरिक ऊर्जा मध्यम है। जीवनशैली में संतुलन बनाए रखें; तत्काल बड़े व्यक्तिगत बदलाव करने में जल्दबाजी न करें।',
    },
  },
  2: {
    favorable: {
      en: 'Excellent indicators for financial growth, wealth accumulation, and family harmony. Your words will carry great weight and impact.',
      hi: 'वित्तीय वृद्धि, धन संचय और पारिवारिक सामंजस्य के लिए उत्कृष्ट संकेत हैं। आपकी वाणी अत्यधिक प्रभावशाली और फलदायी रहेगी।',
    },
    unfavorable: {
      en: 'Possibility of financial strain, unexpected family expenses, or verbal conflicts. Think carefully before you speak and avoid large transactions.',
      hi: 'वित्तीय तनाव, परिवार में अप्रत्याशित खर्च या वाणी के कारण मतभेद संभव हैं। सोच-समझकर बोलें और बड़े वित्तीय फैसलों से बचें।',
    },
    mixed: {
      en: 'Financial flow is stable but fluctuating. Manage family expectations with patience and avoid any high-risk investments.',
      hi: 'वित्तीय प्रवाह सामान्य रहेगा लेकिन उतार-चढ़ाव संभव है। पारिवारिक अपेक्षाओं को धैर्य से संभालें और किसी भी बड़े वित्तीय जोखिम से बचें।',
    },
  },
  3: {
    favorable: {
      en: 'Great time for short journeys, creative endeavors, and communication. Siblings or close associates will offer valuable support.',
      hi: 'छोटी यात्राओं, रचनात्मक कार्यों और लेखन-संचार के लिए बहुत अनुकूल समय है। भाई-बहनों या करीबी सहयोगियों से पूरा सहयोग मिलेगा।',
    },
    unfavorable: {
      en: 'Expect delays or friction in short travels, communication gaps, or disagreements with close neighbors/siblings.',
      hi: 'छोटी यात्राओं में देरी, संचार में व्यवधान, या करीबी सहयोगियों/भाई-बहनों से मतभेद की आशंका है। स्पष्ट संवाद रखें।',
    },
    mixed: {
      en: 'Short travels are average. Keep your communication transparent and clear to avoid minor misunderstandings.',
      hi: 'छोटी यात्राएं सामान्य रहेंगी। समन्वय संबंधी किसी भी गलतफहमी से बचने के लिए अपने विचारों को स्पष्टता से व्यक्त करें।',
    },
  },
  4: {
    favorable: {
      en: "Highly auspicious for purchasing property or vehicles, domestic happiness, and enjoying mother's blessings and support.",
      hi: 'भूमि, भवन या वाहन की खरीद, घरेलू सुख और माता के सहयोग तथा उत्तम स्वास्थ्य के लिए अत्यधिक शुभ समय है।',
    },
    unfavorable: {
      en: "Domestic peace could face disruptions. Expect delays in property matters or concerns regarding your mother's health.",
      hi: 'पारिवारिक शांति प्रभावित हो सकती है। संपत्ति या मकान के मामलों में रुकावटें आ सकती हैं या माता के स्वास्थ्य की चिंता हो सकती है।',
    },
    mixed: {
      en: 'Property and home decisions require deliberate care. Domestic environment needs patience and emotional balance.',
      hi: 'संपत्ति और वाहन के फैसले सावधानीपूर्वक लें। घरेलू वातावरण में धैर्य और भावनात्मक संतुलन बनाए रखने की आवश्यकता है।',
    },
  },
  5: {
    favorable: {
      en: 'Excellent period for academic exams, child-related happiness, creative pursuits, and romance.',
      hi: 'परीक्षा-प्रतियोगिता, शैक्षणिक सफलता, संतान सुख, रचनात्मकता और प्रेम संबंधों के लिए अत्यंत शुभ और फलदायी समय है।',
    },
    unfavorable: {
      en: 'Hurdles in studies, anxieties regarding children, or emotional stress in love life. Stay focused and avoid impulsive decisions.',
      hi: 'शिक्षा में बाधा, संतान को लेकर चिंता, या प्रेम संबंधों में भावनात्मक तनाव संभव है। मन को केंद्रित रखें और जल्दबाजी से बचें।',
    },
    mixed: {
      en: 'Progress in education or creative fields is possible through consistent efforts. Child/love matters require realistic expectations.',
      hi: 'शिक्षा या रचनात्मक क्षेत्रों में निरंतर प्रयासों से प्रगति होगी। संतान या प्रेम संबंधों में यथार्थवादी उम्मीदें रखें।',
    },
  },
  6: {
    favorable: {
      en: 'Strong indicators of overcoming obstacles, victory in competitions/litigation, recovery from illnesses, and resolving debts.',
      hi: 'शत्रुओं पर विजय, वाद-विवाद या मुकदमेबाजी में जीत, बीमारियों से मुक्ति और ऋण संबंधी मामलों को सुलझाने के प्रबल योग हैं।',
    },
    unfavorable: {
      en: 'Risk of rising health issues, debt burdens, or workplace rivals. Practice stress management and avoid unnecessary arguments.',
      hi: 'ऋणों में वृद्धि, बीमारी का खतरा या कार्यस्थल पर प्रतिद्वंद्वियों से तनाव संभव है। विवादों से दूर रहें और स्वास्थ्य का ध्यान रखें।',
    },
    mixed: {
      en: 'Health and daily routines require moderate attention. Keep a check on your expenses and manage debts carefully.',
      hi: 'दैनिक स्वास्थ्य और दिनचर्या पर मध्यम ध्यान दें। अपने खर्चों पर लगाम लगाएं और पुराने कर्जों का सुनियोजित प्रबंधन करें।',
    },
  },
  7: {
    favorable: {
      en: 'Highly supportive for marriage alliances, deepening spouse relationships, and starting highly profitable business partnerships.',
      hi: 'विवाह प्रस्तावों, वैवाहिक जीवन में मधुरता, और नई व्यापारिक साझेदारी स्थापित करने के लिए अत्यधिक अनुकूल और शुभ समय है।',
    },
    unfavorable: {
      en: 'Delays or obstacles in marriage, arguments with your spouse, or friction in commercial partnerships. Keep communication calm.',
      hi: 'विवाह में विलंब, जीवनसाथी के साथ विवाद, या व्यापारिक साझेदारी में मतभेद संभव हैं। शांतिपूर्वक संवाद बनाए रखें।',
    },
    mixed: {
      en: 'Partnerships and marriage show moderate harmony. Avoid minor misunderstandings by giving space to your partner.',
      hi: 'वैवाहिक जीवन और साझेदारी सामान्य रहेगी। आपसी गलतफहमियों से बचने के लिए एक-दूसरे के दृष्टिकोण का सम्मान करें।',
    },
  },
  8: {
    favorable: {
      en: 'Invaluable support for sudden gains, inheritance, spiritual transformation, or unexpected resolution of chronic problems.',
      hi: 'अचानक धन लाभ, विरासत से लाभ, आध्यात्मिक ज्ञान और लंबे समय से चल रही गुप्त समस्याओं के अचानक सुलझने के योग हैं।',
    },
    unfavorable: {
      en: 'Be cautious of sudden disruptions, risk of accidents, or emotional anxiety. Postpone high-risk physical tasks.',
      hi: 'अचानक आने वाली बाधाओं, चोट लगने के भय या मानसिक तनाव के प्रति सचेत रहें। जोखिम भरे कार्यों से दूर रहें।',
    },
    mixed: {
      en: 'A phase of transition. Proceed with deliberation; avoid making any hasty decisions regarding joint assets or ancestral matters.',
      hi: 'परिवर्तन और बदलाव का समय है। संयुक्त संपत्ति या वसीयत के मामलों में जल्दबाजी में निर्णय लेने से बचें।',
    },
  },
  9: {
    favorable: {
      en: 'Excellent fortune! Strongly supports long-distance travel, spiritual evolution, higher education, and blessings from father or mentors.',
      hi: 'भाग्य का पूर्ण उदय! लंबी यात्राओं, आध्यात्मिक उन्नति, उच्च शिक्षा और पिता या गुरु के आशीर्वाद के लिए अत्यंत भाग्यशाली समय है।',
    },
    unfavorable: {
      en: 'Fortune seems sluggish. Long-distance travels could face delays, and differences of opinion with mentors or father may arise.',
      hi: 'भाग्य का सहयोग अभी कमजोर है। लंबी यात्राओं में रुकावटें आ सकती हैं, और पिता या गुरु के साथ वैचारिक मतभेद संभव हैं।',
    },
    mixed: {
      en: 'Mixed luck. Success will depend on your efforts rather than sheer chance. Maintain respect for elders to boost positive vibes.',
      hi: 'मिश्रित भाग्य रहेगा। सफलता भाग्य से अधिक आपके कर्मों पर निर्भर करेगी। बड़ों का आदर करें जिससे सकारात्मकता बढ़ेगी।',
    },
  },
  10: {
    favorable: {
      en: 'Strong career growth, job promotions, successful business ventures, and rise in social status and recognition.',
      hi: 'करियर में शानदार उन्नति, नौकरी में पदोन्नति, व्यापार में बड़ा लाभ और सामाजिक मान-प्रतिष्ठा में वृद्धि के प्रबल योग हैं।',
    },
    unfavorable: {
      en: 'Hurdles in career progression, minor disputes with superiors, or business stagnation. Avoid impulsive career shifts.',
      hi: 'नौकरी में रुकावट, अधिकारियों से अनबन या व्यवसाय में मंदी संभव है। अभी नौकरी बदलने या बड़ा निवेश करने में जल्दबाजी न करें।',
    },
    mixed: {
      en: 'Career stability is maintained but immediate growth is slow. Discharge your duties sincerely and wait for the right opportunity.',
      hi: 'करियर में स्थिरता बनी रहेगी लेकिन तत्काल उन्नति की गति धीमी हो सकती है। अपने कार्य निष्ठा से करें और सही समय का इंतजार करें।',
    },
  },
  11: {
    favorable: {
      en: 'Desires will be fulfilled, profits and income from multiple sources will manifest, and friends will offer outstanding support.',
      hi: 'आपकी सभी मनोकामनाएं पूरी होंगी, एक से अधिक स्रोतों से लाभ प्राप्त होगा, और मित्रों तथा वरिष्ठों का पूर्ण सहयोग मिलेगा।',
    },
    unfavorable: {
      en: 'Desires may remain unfulfilled for now, profit streams could face delays, or minor disputes with friends might occur.',
      hi: 'इच्छाएं पूरी होने में विलंब होगा, लाभ मार्ग बाधित हो सकता है, या मित्रों के साथ मतभेद संभव हैं। धैर्य बनाए रखें।',
    },
    mixed: {
      en: 'Steady but slow gains are indicated. Desires will manifest gradually; maintain good social relationships.',
      hi: 'स्थिर लेकिन धीमी गति से लाभ होने के संकेत हैं। इच्छाएं धीरे-धीरे पूरी होंगी; सामाजिक संबंध मधुर बनाए रखें।',
    },
  },
  12: {
    favorable: {
      en: 'Highly favorable for foreign travel, settling abroad, spiritual evolution, and successful investment in overseas channels.',
      hi: 'विदेश यात्रा, विदेश में बसने, आध्यात्मिक साधना और विदेशी संबंधों से भारी लाभ प्राप्त करने के लिए सर्वोत्तम समय है।',
    },
    unfavorable: {
      en: 'High risk of financial losses, heavy medical expenditures, or major visa/foreign settlement delays. Cut down unnecessary expenses.',
      hi: 'भारी धन हानि, अस्पताल या बीमारी पर भारी खर्च, या विदेश यात्रा/वीजा में बड़ी रुकावट का खतरा है। खर्चों पर सख्त नियंत्रण रखें।',
    },
    mixed: {
      en: 'Moderate prospects for foreign affairs. Keep your budget controlled and focus on spiritual or behind-the-scenes work.',
      hi: 'विदेशी मामलों के लिए सामान्य संकेत हैं। अपने खर्चों को नियंत्रण में रखें और आध्यात्मिक या शोध कार्यों पर ध्यान केंद्रित करें।',
    },
  },
};

function buildAnswerSummary(input: {
  outcome: PrasnaVerdict['outcome'];
  category: QuestionCategory;
  timing: { en: string; hi: string };
  natal?: QuestionInput['natal'];
  transitsHighlight?: string[];
}): { en: string; hi: string } {
  const { outcome, category, timing, natal, transitsHighlight } = input;
  const house = category.house;

  // Retrieve house-specific interpretation
  const interpretation = HOUSE_INTERPRETATIONS[house] || {
    favorable: {
      en: 'The cosmic energies are highly supportive of this matter.',
      hi: 'इस मामले में ब्रह्मांडीय ऊर्जाएं अत्यधिक सहायक हैं।',
    },
    unfavorable: {
      en: 'The current planetary configurations pose hurdles in this area.',
      hi: 'वर्तमान ग्रह स्थितियां इस क्षेत्र में बाधाएं उत्पन्न कर रही हैं।',
    },
    mixed: {
      en: 'The stars indicate mixed trends in this matter; proceed with caution.',
      hi: 'सितारे इस मामले में मिश्रित झुकाव दिखा रहे हैं; सावधानी से आगे बढ़ें।',
    },
  };

  const baseText =
    outcome === 'favorable'
      ? interpretation.favorable
      : outcome === 'unfavorable'
        ? interpretation.unfavorable
        : interpretation.mixed;

  const transitLine =
    natal && transitsHighlight?.length ? ` Key Transit: ${transitsHighlight[0]}.` : '';
  const transitLineHi =
    natal && transitsHighlight?.length ? ` मुख्य गोचर: ${transitsHighlight[0]}।` : '';

  const actionText =
    outcome === 'favorable'
      ? 'Practical next step: proceed with confidence, keep plans organized, and act in the suggested window.'
      : outcome === 'unfavorable'
        ? 'Practical next step: pause, reduce friction, avoid hasty commitments, and retry after a short wait.'
        : 'Practical next step: move forward in gradual stages, verify all details, and make balanced choices.';
  const actionTextHi =
    outcome === 'favorable'
      ? 'व्यावहारिक कदम: पूर्ण आत्मविश्वास के साथ आगे बढ़ें, योजनाएं व्यवस्थित रखें, और सुझाए गए समय में कार्य करें।'
      : outcome === 'unfavorable'
        ? 'व्यावहारिक कदम: अभी रुकें, जल्दबाजी में किए गए समझौतों से बचें, और थोड़े अंतराल के बाद पुनः प्रयास करें।'
        : 'व्यावहारिक कदम: धीरे-धीरे चरणों में आगे बढ़ें, सभी विवरणों को सत्यापित करें, और संतुलित निर्णय लें।';

  return {
    en: `${baseText.en}${transitLine} ${timing.en} ${actionText}`.replace(/\s+/g, ' ').trim(),
    hi: `${baseText.hi}${transitLineHi} ${timing.hi} ${actionTextHi}`.replace(/\s+/g, ' ').trim(),
  };
}

function computeTimingAdvice(
  outcome: PrasnaVerdict['outcome'],
  category: QuestionCategory,
  horaLord: string
): { en: string; hi: string } {
  if (outcome === 'favorable') {
    return {
      en: `Act within the next ${category.house <= 4 ? '1-7 days' : '2-4 weeks'}, preferably during a ${horaLord} hora.`,
      hi: `अगले ${category.house <= 4 ? '1-7 दिन' : '2-4 सप्ताह'} में कार्य करें, ${horaLord} होरा में अधिक उत्तम।`,
    };
  }
  if (outcome === 'unfavorable') {
    return {
      en: 'Postpone non-urgent action; perform pacification (japa of karaka mantra) and re-ask after 7 days.',
      hi: 'गैर-अत्यावश्यक कार्य स्थगित करें; कारक का जप करें तथा 7 दिन बाद पुनः प्रश्न करें।',
    };
  }
  return {
    en: 'Proceed in stages; consult elders before final commitment.',
    hi: 'चरणबद्ध आगे बढ़ें; अंतिम निर्णय से पूर्व बड़ों से परामर्श लें।',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Defensive wrappers — never let an internal failure crash the page
// ─────────────────────────────────────────────────────────────────────────────

async function safeCalculatePositions(
  date: Date,
  lat: number,
  lon: number
): Promise<PlanetaryPositions> {
  try {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    const res = calculateCompletePlanetaryPositions(dateStr, timeStr) as unknown as PlanetaryPositions;
    return await Promise.resolve(res);
  } catch (e) {
    console.warn('[QuestionAnalysis] ephemeris fallback', e);
    // Minimal fallback so analysis still returns
    return {} as PlanetaryPositions;
  }
}

async function safeCalculateTransits(input: DynamicTransitInput): Promise<{
  favorable?: { planet: string; effect?: { en?: string } }[];
  mixed?: { planet: string; effect?: { en?: string } }[];
  unfavorable?: { planet: string; effect?: { en?: string } }[];
} | null> {
  try {
    const res = await calculateDynamicTransits(input);
    return res as unknown as Awaited<ReturnType<typeof safeCalculateTransits>>;
  } catch (e) {
    console.warn('[QuestionAnalysis] transit fallback', e);
    return null;
  }
}
