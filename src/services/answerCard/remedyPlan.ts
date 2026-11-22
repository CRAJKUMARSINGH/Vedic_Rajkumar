/**
 * remedyPlan.ts — graha-keyed remedies, not generic advice.
 *
 * c3 Phase 4 corrections applied:
 *  - mantra uses MANTRA[planet] directly (the v1 shorthand was a TDZ bug)
 *  - candidates are deduplicated
 *  - planets with 'unknown' dignity are NOT treated as verified-weak:
 *    they are excluded from "weakest" selection; if nothing verified-weak
 *    exists the remedy is omitted rather than guessed
 *  - lunar-day claim softened to scheduling practice, not ineffectiveness
 *  - presented as optional traditional practice; never tied to outcomes
 * Pure.
 */
import type { ChartFacts, Planet, Dignity } from './chartFacts';
import { houseLord, placementsIn } from './chartFacts';
import type { Topic } from './AnswerCard.types';
import type { Bi } from './bilingual';

const TOPIC_HOUSES: Record<Topic, readonly number[]> = {
  career: [10, 1, 6],
  finance: [2, 11, 9],
  marriage: [7, 2, 5],
  health: [1, 6, 8],
  house_construction: [4, 2, 11],
  business: [7, 10, 3, 11],
};

const DIGNITY_RANK: Record<Exclude<Dignity, 'unknown'>, number> = {
  debilitated: 0, enemy: 1, neutral: 2, friend: 3, own: 4, exalted: 5,
};

const PLANET_HI: Record<Planet, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const WEEKDAY: Record<Planet, Bi> = {
  Sun: { en: 'Sunday', hi: 'रविवार' },
  Moon: { en: 'Monday', hi: 'सोमवार' },
  Mars: { en: 'Tuesday', hi: 'मंगलवार' },
  Mercury: { en: 'Wednesday', hi: 'बुधवार' },
  Jupiter: { en: 'Thursday', hi: 'गुरुवार' },
  Venus: { en: 'Friday', hi: 'शुक्रवार' },
  Saturn: { en: 'Saturday', hi: 'शनिवार' },
  Rahu: { en: 'Saturday', hi: 'शनिवार' },
  Ketu: { en: 'Tuesday', hi: 'मंगलवार' },
};

const MANTRA: Record<Planet, string> = {
  Sun: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
  Moon: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः',
  Mars: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
  Mercury: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
  Jupiter: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
  Venus: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
  Saturn: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
  Rahu: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
  Ketu: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
};

const DAAN: Record<Planet, Bi> = {
  Sun: { en: 'wheat, jaggery, copper', hi: 'गेहूँ, गुड़, ताम्र' },
  Moon: { en: 'rice, milk, white cloth', hi: 'चावल, दूध, श्वेत वस्त्र' },
  Mars: { en: 'red lentils, jaggery, copper', hi: 'मसूर, गुड़, ताम्र' },
  Mercury: { en: 'green gram, green cloth', hi: 'मूंग, हरा वस्त्र' },
  Jupiter: { en: 'chana dal, turmeric, yellow cloth', hi: 'चना दाल, हल्दी, पीला वस्त्र' },
  Venus: { en: 'white rice, curd, white cloth', hi: 'श्वेत चावल, दही, श्वेत वस्त्र' },
  Saturn: { en: 'black sesame, mustard oil, iron', hi: 'काला तिल, सरसों तेल, लोहा' },
  Rahu: { en: 'black gram, coconut', hi: 'उड़द, नारियल' },
  Ketu: { en: 'multi-coloured grain, blanket', hi: 'मिश्रित अनाज, कंबल' },
};

export interface Remedy {
  planet: Planet;
  weekday: Bi;
  mantra: string;
  daan: Bi;
  /** Scheduling note — framed as tradition, not an efficacy claim. */
  avoid: Bi;
  why: Bi;
  /** Explicit optional-practice framing required by c3. */
  optional: Bi;
}

const AVOID: Bi = {
  en: 'Traditional scheduling note: many practitioners prefer to perform such practices outside Amavasya, Chaturthi and eclipse periods.',
  hi: 'पारंपरिक समय-नोट: कई परंपराएँ ऐसे उपाय अमावस्या, चतुर्थी और ग्रहण काल से बाहर करना पसंद करती हैं।',
};

const OPTIONAL: Bi = {
  en: 'This is an optional traditional practice — it is not a substitute for professional, medical or financial advice, and no outcome depends on it.',
  hi: 'यह एक वैकल्पिक पारंपरिक उपाय है — यह व्यावसायिक, चिकित्सा या वित्तीय सलाह का विकल्प नहीं है, और कोई परिणाम इस पर निर्भर नहीं है।',
};

/**
 * Weakest VERIFIED-dignity planet touching the topic's houses.
 * 'unknown' dignity is excluded — unverified weakness is not weakness.
 * Returns null when no verified candidate exists (remedy omitted, not guessed).
 */
export function pickRemedyTarget(facts: ChartFacts, topic: Topic): Planet | null {
  const candidates = new Set<Planet>();
  for (const house of TOPIC_HOUSES[topic]) {
    const lord = houseLord(facts.ascSign, house);
    if (lord) candidates.add(lord);
    for (const p of placementsIn(facts, house)) candidates.add(p.planet);
  }
  if (candidates.size === 0) return null;

  const scored: { planet: Planet; rank: number }[] = [];
  for (const planet of candidates) {
    const d = facts.placements.find(p => p.planet === planet)?.dignity;
    if (d === undefined || d === 'unknown') continue; // not verified → not eligible
    scored.push({ planet, rank: DIGNITY_RANK[d] });
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => a.rank - b.rank || a.planet.localeCompare(b.planet));
  return scored[0].planet;
}

export function buildRemedy(facts: ChartFacts, topic: Topic): Remedy | null {
  const planet = pickRemedyTarget(facts, topic);
  if (!planet) return null;
  const name = PLANET_HI[planet];

  return {
    planet,
    weekday: WEEKDAY[planet],
    mantra: MANTRA[planet],
    daan: DAAN[planet],
    avoid: AVOID,
    optional: OPTIONAL,
    why: {
      en: `Optional traditional practice: ${planet} is the weakest-verified planet touching this matter, so the practice is addressed to ${planet} only.`,
      hi: `वैकल्पिक पारंपरिक उपाय: ${name} इस विषय से जुड़ा सबसे निर्बल सत्यापित ग्रह है, अतः उपाय केवल ${name} के लिए है।`,
    },
  };
}
