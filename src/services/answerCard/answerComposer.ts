/**
 * answerComposer.ts — turn verdicts into an answer a person can act on.
 *
 * Order: verdict → why → sequence → remedy → app links → closing question.
 * The 'direction' section from the v1 proposal is intentionally omitted:
 * c3 Phase 3 bars publishing kilometre ranges or rotated city pools as
 * calculated predictions — the chart does not establish distance,
 * feasibility or the user's location.
 *
 * Every sentence is generated from facts already in the card. No LLM calls,
 * so answers:check holds byte-for-byte.
 */
import type { ChartFacts, Planet } from './chartFacts';
import { houseLord, placementOf, placementsIn } from './chartFacts';
import type { Topic, Verdict, Band, Lang } from './AnswerCard.types';
import { classifyDepth, sectionBudget, type Depth } from './depth';
import { deriveSequencing } from './sequencing';
import { buildRemedy } from './remedyPlan';
import type { Bi } from './bilingual';

export interface ComposedSection {
  id: string;
  title: Bi;
  body: Bi;
  citations: Bi[];
}

export interface ComposedAnswer {
  verdict_line: Bi;
  depth: Depth;
  ranked: Array<{ topic: Topic; decision: Bi }>;
  sections: ComposedSection[];
  sequence: Bi | null;
  app_links: Array<{ label: Bi; path: string }>;
  closing_question: Bi;
}

const PLANET_HI: Record<Planet, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
  Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const SIGN_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
const SIGN_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
] as const;

const ORD_EN = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'] as const;
const ORD_HI = ['', 'प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश'] as const;

const TOPIC_HOUSES: Record<Topic, readonly number[]> = {
  career: [10, 1, 6],
  finance: [2, 11, 9],
  marriage: [7, 2, 5],
  health: [1, 6, 8],
  house_construction: [4, 2, 11],
};

const DECISION: Record<Band, Bi> = {
  excellent: { en: 'yes — go, and go early', hi: 'हाँ — करें, और जल्दी करें' },
  good: { en: 'yes — but clear the gate first', hi: 'हाँ — पर पहले अड़चन हटाएँ' },
  average: { en: 'yes, conditionally', hi: 'हाँ, शर्त के साथ' },
  caution: { en: 'not yet — fix the base first', hi: 'अभी नहीं — पहले आधार सुधारें' },
  avoid: { en: 'no, for now', hi: 'नहीं, अभी के लिए' },
};

const TOPIC_WORD: Record<Topic, Bi> = {
  career: { en: 'the job change', hi: 'नौकरी परिवर्तन' },
  finance: { en: 'the money decision', hi: 'आर्थिक निर्णय' },
  marriage: { en: 'the marriage step', hi: 'विवाह कदम' },
  health: { en: 'the health regimen', hi: 'स्वास्थ्य नियम' },
  house_construction: { en: 'the construction', hi: 'निर्माण कार्य' },
};

/** A citation for one planet's position — the "why" atom. */
function cite(planet: Planet, house: number, sign: number, retro: boolean, dignity: string): Bi {
  const signEn = SIGN_EN[sign];
  const signHi = SIGN_HI[sign];
  const nameHi = PLANET_HI[planet];

  const qualEn =
    dignity === 'exalted' ? ' — exalted, a clean promise'
    : dignity === 'own' ? ' — in its own sign, self-contained but slow to move'
    : dignity === 'debilitated' ? ' — debilitated, the promise needs repair'
    : dignity === 'enemy' ? ' — in an enemy sign, working against the grain'
    : '';
  const qualHi =
    dignity === 'exalted' ? ' — उच्च का, स्पष्ट प्रतिज्ञा'
    : dignity === 'own' ? ' — स्वराशि में, आत्मनिर्भर पर धीमा'
    : dignity === 'debilitated' ? ' — नीच का, प्रतिज्ञा की मरम्मत चाहिए'
    : dignity === 'enemy' ? ' — शत्रु राशि में, प्रतिकूल'
    : '';

  return {
    en: `${planet} in the ${ORD_EN[house]} (${signEn})${retro ? ', retrograde — the result arrives in re-runs' : ''}${qualEn}.`,
    hi: `${nameHi} ${ORD_HI[house]} भाव (${signHi}) में${retro ? ', वक्री — फल दोबारा आता है' : ''}${qualHi}।`,
  };
}

function citationsFor(facts: ChartFacts, topic: Topic, budget: number): Bi[] {
  const out: Bi[] = [];
  for (const house of TOPIC_HOUSES[topic]) {
    const lord = houseLord(facts.ascSign, house);
    if (lord) {
      const p = placementOf(facts, lord);
      if (p) {
        out.push(cite(p.planet, p.house, p.sign, p.retrograde, p.dignity));
      } else {
        out.push({
          en: `The ${ORD_EN[house]} lord is ${lord}; its position is not certified in this chart.`,
          hi: `${ORD_HI[house]} भाव का स्वामी ${PLANET_HI[lord]} है; स्थिति प्रमाणित नहीं।`,
        });
      }
    }
    for (const p of placementsIn(facts, house)) {
      out.push(cite(p.planet, p.house, p.sign, p.retrograde, p.dignity));
    }
    if (out.length >= budget) break;
  }
  return out.slice(0, budget);
}

/** All paths verified against src/routes/index.tsx. */
const APP_LINKS: Array<{ label: Bi; path: string }> = [
  { label: { en: 'Transit (gochar) overlay', hi: 'गोचर परत' }, path: '/transits' },
  { label: { en: 'Muhurat windows', hi: 'मुहूर्त' }, path: '/muhurat' },
  { label: { en: 'Kundli Milan', hi: 'कुंडली मिलान' }, path: '/matchmaking' },
  { label: { en: 'Dasha timeline', hi: 'दशा-क्रम' }, path: '/dasha' },
];

export interface ComposeInput {
  facts: ChartFacts;
  verdicts: Verdict[];
  asked: string;
  language: Lang;
}

export function composeAnswer({ facts, verdicts, asked, language }: ComposeInput): ComposedAnswer {
  void language; // links/citations are bilingual already; reserved for future locale shaping
  const depth = classifyDepth(asked);
  const budget = sectionBudget(depth);

  const ranked = [...verdicts]
    .sort((a, b) => b.score_0_100 - a.score_0_100 || a.topic.localeCompare(b.topic))
    .map(v => ({ topic: v.topic, decision: DECISION[v.band] }));

  const lead = [...verdicts].sort((a, b) =>
    b.score_0_100 - a.score_0_100 || a.topic.localeCompare(b.topic))[0];
  const verdict_line: Bi = lead
    ? {
        en: `${DECISION[lead.band].en} — ${TOPIC_WORD[lead.topic].en}.${ranked[1] ? ` ${TOPIC_WORD[ranked[1].topic].en}: ${ranked[1].decision.en}.` : ''}`,
        hi: `${DECISION[lead.band].hi} — ${TOPIC_WORD[lead.topic].hi}।${ranked[1] ? ` ${TOPIC_WORD[ranked[1].topic].hi}: ${ranked[1].decision.hi}।` : ''}`,
      }
    : { en: 'Not enough calculation data.', hi: 'पर्याप्त गणना डेटा नहीं।' };

  const sections: ComposedSection[] = [];

  if (lead && budget >= 2) {
    sections.push({
      id: 'why',
      title: { en: 'Why', hi: 'क्यों' },
      body: {
        en: 'The call rests on these placements, not on a general stanza:',
        hi: 'निर्णय सामान्य श्लोक पर नहीं, इन स्थितियों पर टिका है:',
      },
      citations: citationsFor(facts, lead.topic, Math.max(2, budget - 2)),
    });
  }

  const sequence = deriveSequencing(verdicts);
  if (sequence && budget >= 4) {
    sections.push({
      id: 'sequence',
      title: { en: 'Sequence', hi: 'क्रम' },
      body: sequence.line,
      citations: [],
    });
  }

  const remedy = lead ? buildRemedy(facts, lead.topic) : null;
  if (remedy && budget >= 6) {
    sections.push({
      id: 'remedy',
      title: { en: 'Remedy', hi: 'उपाय' },
      body: remedy.why,
      citations: [
        {
          en: `${remedy.weekday.en}: ${remedy.mantra} — 108 times; daan of ${remedy.daan.en}.`,
          hi: `${remedy.weekday.hi}: ${remedy.mantra} — १०८ बार; ${remedy.daan.hi} का दान।`,
        },
        remedy.avoid,
        remedy.optional,
      ],
    });
  }

  const weakest = lead && ranked[1] ? ranked[1].topic : null;
  const closing_question: Bi = weakest
    ? {
        en: `Which single variable do you want fixed first — ${TOPIC_WORD[weakest].en}, or the city? Say one and I will take it alone.`,
        hi: `पहले कौन-सा एक चर तय करें — ${TOPIC_WORD[weakest].hi}, या शहर? एक बताइए, उसे अकेले लेंगे।`,
      }
    : {
        en: 'Say the one thing you want tightened and I will take it alone.',
        hi: 'जो एक बात पक्की करनी है, बताइए — अकेले लेंगे।',
      };

  return {
    verdict_line,
    depth,
    ranked,
    sections,
    sequence: sequence?.line ?? null,
    app_links: APP_LINKS,
    closing_question,
  };
}
