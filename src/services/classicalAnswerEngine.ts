/**
 * classicalAnswerEngine.ts  (ENHANCED — v2.1)
 *
 * Classical Answer Engine — 5-Section Response Generator
 * ENHANCED with 13-Layer Convergence Architecture integration.
 *
 * Two entry points:
 *   generateClassicalAnswer()         → original 5-section Prasna response (backward-compatible)
 *   generateEnhancedClassicalAnswer() → 13-layer wired version with thereforeClause,
 *                                       dashaLevel tags, psychological profile, 6-layer remedies
 *
 * Original 5-section structure (preserved):
 *   1. Direct Answer         (probability framing)
 *   2. Astrological Reasoning (classical source citations)
 *   3. Timing Windows        (transit + dasha indicators)
 *   4. Risks & Cautions      (anti-harm, non-fatalistic)
 *   5. Practical Actions & Optional Remedies
 *
 * New in v2.1:
 *   6. thereforeClause       (Layer 9 — forced single verdict from 5-layer hierarchy)
 *   7. dashaLevel + levelTag (Layer 6 — every timing window tagged [Level 1–5])
 *   8. psychologicalProfile  (Layer 11 — Nakshatra fear + Rahu/Ketu + Saturn wound)
 *   9. sixLayerRemedy        (Layer 12 — diagnostically targeted, not generic)
 *  10. convergenceScore      (overall confidence 0–100, Shadbala-driven)
 *
 * Primary Sources:
 *   - Prasna Marga (Parts I & II)     — B.V. Raman / Panakkattu Nambudiripad
 *   - Brihat Parashara Hora Shastra (BPHS)
 *   - Brihat Jataka                   — Varahamihira
 *   - Saravali                        — Kalyana Varma
 *   - Phaladeepika                    — Mantreswara
 *   - Uttara Kalamrita                — Kalidasa
 *   - The Astrological Magazine       — B.V. Raman (Editor)
 *
 * Anti-Harm Rules (built-in, unchanged):
 *   - Never predict guaranteed death dates
 *   - Never cause fear or encourage dependency
 *   - Always use probability / tendency language
 *   - Never give medical/legal certainty
 */

import { classifyPrasnaQuery, type PrasnaQueryType } from './prasnaResearchEngine';
import {
  runInterpretationEngine,
  checkDoubleTransit,
  type QueryContext,
  type InterpretationInput,
  type ThereforeClause,
  type DashaLevel,
  type SixLayerRemedyStack,
  type DoubleTransitResult,
} from './interpretationEngine';
import type { ShadabalaResult, ShadabalaAnalysis } from './shadabalaService';
import type { DashaResult } from './dashaService';
import type { YogaAnalysis } from './yogaService';
import type { JaiminiAnalysis } from './jaiminiService';
import type { PsychologicalProfile } from './psychologicalProfileService';

// ═════════════════════════════════════════════════════════════════════════════
// ORIGINAL TYPES (preserved verbatim — backward-compatible)
// ═════════════════════════════════════════════════════════════════════════════

export type AnswerConfidence = 'strong' | 'moderate' | 'weak' | 'unclear';
export type AnswerOutcome    = 'favorable' | 'mixed' | 'unfavorable';

export interface ClassicalRule {
  source:      string;   // e.g. "Prasna Marga Part II, Ch. XVIII"
  rule:        string;   // The classical principle
  application: string;   // How it applies to this question
}

export interface TimingWindow {
  label:      string;             // e.g. "Aug–Oct 2025"
  basis:      string;             // e.g. "Jupiter transit over 7th house"
  confidence: AnswerConfidence;
}

export interface ClassicalAnswer {
  directAnswer: {
    en: string; hi: string;
    confidence: AnswerConfidence;
    outcome:    AnswerOutcome;
    probabilityLabel: { en: string; hi: string };
  };
  reasoning: {
    en: string; hi: string;
    classicalRules:      ClassicalRule[];
    houseSignificators:  string[];
    planetaryFactors:    string[];
  };
  timing: {
    en: string; hi: string;
    windows:       TimingWindow[];
    avoidPeriods:  string[];
  };
  risks: {
    en: string; hi: string;
    cautions:     string[];
    antiHarmNote: string;
  };
  remedies: {
    en: string; hi: string;
    actions:          string[];
    optionalRemedies: OptionalRemedy[];
    disclaimer:       string;
  };
  queryType:    PrasnaQueryType;
  chapterRef:   string;
  prasnaNumber?: number;
  direction?:   string;
  urgency?:     string;
}

export interface OptionalRemedy {
  type:        'mantra' | 'gem' | 'charity' | 'ritual' | 'lifestyle';
  description: string;
  source:      string;
}

export interface ClassicalAnswerInput {
  question:      string;
  queryType?:    PrasnaQueryType;
  prasnaNumber?: number;
  direction?:    string;
  urgency?:      'low' | 'medium' | 'high' | 'critical';
  verdict?: {
    outcome: 'favorable' | 'mixed' | 'unfavorable';
    score:   number;
  };
  horaLord?:     string;
  moonRashi?:    number;
  prashnaLagna?: number;
  isHi?:         boolean;
}

// ═════════════════════════════════════════════════════════════════════════════
// V2.1 ENHANCED TYPES
// ═════════════════════════════════════════════════════════════════════════════

/** TimingWindow enhanced with Dasha Level tag (Layer 6) */
export interface EnhancedTimingWindow extends TimingWindow {
  dashaLevel: DashaLevel;
  mdLord:     string;
  adLord:     string;
  levelTag:   string;   // "[Level 4: Jupiter MD / Saturn AD, 2027–2029]"
}

/** Full enhanced ClassicalAnswer — extends original with all 13-layer outputs */
export interface EnhancedClassicalAnswer extends Omit<ClassicalAnswer, 'timing' | 'remedies'> {
  // ── Override timing to use enhanced windows ────────────────────────────────
  timing: {
    en: string; hi: string;
    windows:             EnhancedTimingWindow[];
    avoidPeriods:        string[];
    doubleTransit:       DoubleTransitResult;
  };
  // ── Override remedies to use 6-layer stack ─────────────────────────────────
  remedies: {
    en: string; hi: string;
    actions:             string[];
    optionalRemedies:    OptionalRemedy[];
    disclaimer:          string;
    sixLayerStack:       SixLayerRemedyStack;    // Layer 12 — diagnostic
  };
  // ── New Layer 9: Therefore Clause ──────────────────────────────────────────
  thereforeClause:       ThereforeClause;
  // ── New Layer 11: Psychological Profile ───────────────────────────────────
  psychologicalProfile:  PsychologicalProfile;
  // ── New meta ──────────────────────────────────────────────────────────────
  convergenceScore:      number;    // 0–100 overall confidence
  dashaLevel:            DashaLevel;
  levelTag:              string;
  natalPromise:          { promised: boolean; confidence: number; reason: string };
  executiveVerdict:      string;
  fullReport:            string;
}

/** Input for the enhanced generator — extends base with all service outputs */
export interface EnhancedClassicalAnswerInput extends ClassicalAnswerInput {
  questionTime?: Date;
  lat?: number;
  lon?: number;
}

interface PlanetMinimal {
  name:        string;
  house:       number;
  rashiIndex:  number;
  degrees:     number;
  isRetrograde?: boolean;
  longitude?:  number;
  nakshatra?:  string;
}

interface TransitMinimal {
  planet:         string;
  house:          number;
  aspectsHouses:  number[];
}

interface AspectMinimal {
  fromPlanet: string;
  toHouse:    number;
}

// ═════════════════════════════════════════════════════════════════════════════
// CLASSICAL RULES DATABASE (verbatim from original — not modified)
// ═════════════════════════════════════════════════════════════════════════════

const CLASSICAL_RULES: Record<PrasnaQueryType, ClassicalRule[]> = {
  marriage: [
    {
      source: 'Prasna Marga Part II, Ch. XVII (Vivaha Prasna)',
      rule: 'If the 7th house and its lord are strong and unafflicted, and Venus is well-placed, marriage is indicated. The Navamsha of the 7th lord shows the nature of the spouse.',
      application: 'Assess 7th house, 7th lord, Venus, and Navamsha for marriage prospects.',
    },
    {
      source: 'Prasna Marga Part II, Ch. XVII',
      rule: 'When the Prasna Lagna lord and 7th lord are in mutual aspect or conjunction, marriage is imminent. Moon in 7th or aspecting 7th lord is also auspicious.',
      application: 'Check mutual relationship between Lagna lord and 7th lord in Prasna chart.',
    },
    {
      source: 'BPHS, Ch. 18 (Vivaha Adhyaya)',
      rule: 'Venus as karaka of marriage should be in a kendra or trikona, free from malefic aspect. Saturn in 7th delays marriage; Mars in 7th (Mangal Dosha) requires matching.',
      application: 'Venus placement and freedom from malefic influence determines marriage timing.',
    },
    {
      source: 'Brihat Jataka, Ch. 6',
      rule: 'The 7th house from Lagna and Moon both should be examined. If both are afflicted, marriage faces obstacles. If one is strong, partial success is indicated.',
      application: 'Dual examination of 7th from Lagna and Moon gives balanced assessment.',
    },
    {
      source: 'Saravali, Ch. 28',
      rule: 'Jupiter aspecting the 7th house or its lord confers a virtuous and compatible spouse. Venus-Jupiter conjunction or mutual aspect is highly auspicious for marriage.',
      application: 'Jupiter\'s benefic influence on 7th house is a strong positive indicator.',
    },
  ],
  progeny: [
    {
      source: 'Prasna Marga Part II, Ch. XVIII (Santhana Prasna)',
      rule: 'The 5th house (Putra Bhava) and its lord, along with Jupiter (natural karaka of children), determine progeny. Beeja (male seed) and Kshetra (female womb) sphuta must be examined.',
      application: 'Assess 5th house, 5th lord, Jupiter, and Beeja-Kshetra sphuta for progeny.',
    },
    {
      source: 'Prasna Marga Part II, Ch. XVIII',
      rule: 'Gulika in the 5th house or afflicting the 5th lord indicates difficulty in conception. Rahu in 5th can cause miscarriage or delay. Moon in 5th from Prasna Lagna is auspicious.',
      application: 'Gulika and Rahu affliction of 5th house are key obstacles to progeny.',
    },
    {
      source: 'BPHS, Ch. 14 (Putra Bhava)',
      rule: 'If Jupiter is in the 5th, 9th, or 1st house, or aspects the 5th lord, children are indicated. The 9th house (from female perspective) also governs progeny.',
      application: 'Jupiter\'s strength and placement relative to 5th house is primary indicator.',
    },
  ],
  career: [
    {
      source: 'Prasna Marga Part II, Ch. XXI–XXII (Bhagyoday & Karma Prasna)',
      rule: 'The 10th house (Karma Bhava) and its lord, along with the 2nd (wealth) and 11th (gains) houses, determine career success. Sun as karaka of authority and status must be strong.',
      application: 'Assess 10th, 2nd, 11th houses and their lords for career prospects.',
    },
    {
      source: 'Prasna Marga Part II, Ch. XXII',
      rule: 'Saturn in the 10th house (own sign or exalted) gives a long and stable career, though with delays. Jupiter in 10th gives honour and recognition. Rahu in 10th gives unconventional success.',
      application: 'Planetary occupants of 10th house shape the nature and timing of career success.',
    },
    {
      source: 'BPHS, Ch. 24 (Karma Bhava)',
      rule: 'When the 10th lord is in a kendra or trikona, career flourishes. When in dusthana (6th, 8th, 12th), obstacles arise. Dasha of 10th lord or planets in 10th activates career events.',
      application: 'Position of 10th lord and active Dasha determine career timing.',
    },
    {
      source: 'Uttara Kalamrita, Ch. 4',
      rule: 'The Arudha Lagna (AL) and its lord show the public image and career reputation. Planets in the 10th from AL indicate the nature of profession and public recognition.',
      application: 'Arudha Lagna analysis supplements 10th house for career reputation.',
    },
  ],
  litigation: [
    {
      source: 'Prasna Marga Part I, Ch. XI (Rana Prasna / Litigation)',
      rule: 'The 6th house governs enemies and litigation. Compare the strength of the 6th lord (querent\'s side) against the 7th lord (opponent). The stronger party wins.',
      application: 'Relative strength of 6th vs 7th lord determines litigation outcome.',
    },
    {
      source: 'Prasna Marga Part I, Ch. XI',
      rule: 'Mars and Saturn afflicting the 6th house indicate prolonged litigation. Jupiter aspecting the 6th lord or Lagna lord gives victory. Moon in 6th from Prasna Lagna indicates anxiety but eventual success.',
      application: 'Benefic influence on Lagna lord vs malefic influence on 6th determines verdict.',
    },
    {
      source: 'BPHS, Ch. 11 (Shatru Bhava)',
      rule: 'If the Lagna lord is stronger than the 6th lord, the querent wins. If the 6th lord is in the 6th, 8th, or 12th from Lagna, the enemy is weakened.',
      application: 'Lagna lord strength relative to 6th lord is the primary litigation indicator.',
    },
  ],
  health: [
    {
      source: 'Prasna Marga Part I, Ch. XII–XV (Rogi Prasna)',
      rule: 'The 1st house (body), 6th house (disease), and 8th house (chronic illness/longevity) are the primary health indicators. Gulika\'s position is critical — Gulika in Lagna or 8th is serious.',
      application: 'Assess 1st, 6th, 8th houses and Gulika position for health prognosis.',
    },
    {
      source: 'Prasna Marga Part I, Ch. XIII',
      rule: 'Moon afflicted by Saturn or Rahu in Prasna chart indicates mental distress. Sun afflicted indicates vitality issues. Mars affliction indicates fever, inflammation, or surgery.',
      application: 'Nature of afflicting planet indicates the type of health issue.',
    },
    {
      source: 'BPHS, Ch. 8 (Roga Bhava)',
      rule: 'The 6th lord in the 6th house (own house) can indicate chronic disease. Benefics in 6th reduce disease severity. Malefics in 8th without benefic aspect indicate serious illness.',
      application: 'Benefic vs malefic influence on 6th and 8th houses determines severity.',
    },
  ],
  longevity: [
    {
      source: 'Prasna Marga Part I, Ch. XIV–XVI (Mrityu Prasna)',
      rule: 'The 8th house and its lord govern longevity. Maraka planets (lords of 2nd and 7th) in Dasha/Antardasha during Saturn transit over natal Moon indicate critical periods.',
      application: 'Assess 8th house, Maraka planets, and Saturn transit for longevity concerns.',
    },
    {
      source: 'Brihat Jataka, Ch. 8',
      rule: 'Longevity is classified as short (0–32 years), medium (32–64 years), or long (64–100 years) based on the strength of Lagna, Moon, and Saturn. All three must be assessed.',
      application: 'Strength of Lagna, Moon, and Saturn together determines longevity category.',
    },
  ],
  property: [
    {
      source: 'Prasna Marga Part I, Ch. IX–X (Griha/Bhumi Prasna)',
      rule: 'The 4th house governs home, property, and land. Mars is the karaka for land and real estate. Moon governs the home environment. The 4th lord\'s strength determines property acquisition.',
      application: 'Assess 4th house, 4th lord, Mars, and Moon for property matters.',
    },
    {
      source: 'BPHS, Ch. 10 (Sukha Bhava)',
      rule: 'Jupiter aspecting the 4th house or its lord gives a comfortable home. Saturn in 4th delays property acquisition but gives eventual stability. Rahu in 4th indicates foreign property or unusual circumstances.',
      application: 'Planetary influence on 4th house shapes property acquisition timing and nature.',
    },
  ],
  travel: [
    {
      source: 'Prasna Marga Part II, Ch. XX (Pravasa Prasna)',
      rule: 'The 3rd house governs short journeys; 9th house governs long journeys; 12th house governs foreign travel. The direction of travel is indicated by the sign of the 9th lord.',
      application: 'Assess 3rd, 9th, 12th houses based on journey type for travel prospects.',
    },
    {
      source: 'Prasna Marga Part II, Ch. XX',
      rule: 'If the 9th lord is strong and in a kendra or trikona, the journey is successful. Saturn afflicting the 9th lord delays travel. Rahu in 9th or 12th indicates foreign travel.',
      application: '9th lord strength and freedom from Saturn affliction determines travel success.',
    },
  ],
  spirituality: [
    {
      source: 'Prasna Marga Part I, Ch. I–III',
      rule: 'The 9th house (Dharma Bhava) and its lord, along with Jupiter (Guru) and Ketu (moksha karaka), govern spiritual matters. The auspiciousness of the Prasna moment itself is a key indicator.',
      application: 'Assess 9th house, Jupiter, and Ketu for spiritual progress and guidance.',
    },
    {
      source: 'BPHS, Ch. 15 (Dharma Bhava)',
      rule: 'Jupiter in the 9th house or aspecting the 9th lord gives strong spiritual inclination and guru\'s grace. Ketu in 9th or 12th indicates past-life spiritual merit.',
      application: 'Jupiter and Ketu placement relative to 9th house indicates spiritual path.',
    },
  ],
  general: [
    {
      source: 'Prasna Marga Part I, Ch. I–X (General Prasna)',
      rule: 'For general queries, assess the Prasna Lagna, its lord, Moon\'s position, and the Hora Lord. A benefic Hora Lord and Moon in kendra/trikona from Lagna indicates a favorable outcome.',
      application: 'General Prasna uses Lagna, Moon, and Hora Lord as primary indicators.',
    },
    {
      source: 'Prasna Marga Part I, Ch. IV (Tatkalakshana)',
      rule: 'Omens at the time of the question (Tatkalakshana) — sounds heard, objects seen, direction of approach — all modify the basic Prasna verdict. Auspicious omens strengthen favorable indications.',
      application: 'Environmental omens at question time provide supplementary indicators.',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// HELPER DATA
// ═════════════════════════════════════════════════════════════════════════════

const CHAPTER_REFS: Record<PrasnaQueryType, string> = {
  marriage:    'Prasna Marga Part II, Ch. XVII (Vivaha Prasna)',
  progeny:     'Prasna Marga Part II, Ch. XVIII (Santhana Prasna)',
  career:      'Prasna Marga Part II, Ch. XXI–XXII (Karma Prasna)',
  litigation:  'Prasna Marga Part I, Ch. XI (Rana Prasna)',
  health:      'Prasna Marga Part I, Ch. XII–XV (Rogi Prasna)',
  longevity:   'Prasna Marga Part I, Ch. XIV–XVI (Mrityu Prasna)',
  property:    'Prasna Marga Part I, Ch. IX–X (Griha/Bhumi Prasna)',
  travel:      'Prasna Marga Part II, Ch. XX (Pravasa Prasna)',
  spirituality:'Prasna Marga Part I, Ch. I–III (Dharma Prasna)',
  general:     'Prasna Marga Part I, Ch. I–X (General Prasna)',
};

const HOUSE_SIGNIFICATORS: Record<PrasnaQueryType, string[]> = {
  marriage:    ['7th house (spouse)', '7th lord', 'Venus (karaka)', '2nd house (family)', 'Upapada Lagna'],
  progeny:     ['5th house (children)', '5th lord', 'Jupiter (karaka)', '9th house (fortune)', 'Putra Karaka'],
  career:      ['10th house (karma)', '10th lord', 'Sun (authority)', '2nd house (wealth)', '11th house (gains)', 'Arudha Lagna'],
  litigation:  ['6th house (enemies)', '6th lord', '7th lord (opponent)', 'Mars (conflict)', 'Saturn (justice)'],
  health:      ['1st house (body)', '6th house (disease)', '8th house (chronic illness)', 'Moon (mind)', 'Gulika'],
  longevity:   ['8th house (longevity)', '8th lord', 'Lagna', 'Moon', 'Saturn', '2nd/7th lords (Maraka)'],
  property:    ['4th house (property)', '4th lord', 'Mars (land)', 'Moon (home)', 'Venus (comforts)'],
  travel:      ['3rd house (short journey)', '9th house (long journey)', '12th house (foreign)', '9th lord'],
  spirituality:['9th house (dharma)', '9th lord', 'Jupiter (guru)', 'Ketu (moksha)', '12th house (liberation)'],
  general:     ['Lagna (self)', 'Lagna lord', 'Moon (mind)', 'Hora lord', 'Current MD/AD lord'],
};

const PROBABILITY_LABELS: Record<AnswerOutcome, { en: string; hi: string }> = {
  favorable:   { en: 'High probability (70–85%)', hi: 'उच्च संभावना (70–85%)' },
  mixed:       { en: 'Conditional probability (40–60%)', hi: 'सशर्त संभावना (40–60%)' },
  unfavorable: { en: 'Low probability (15–30%)', hi: 'निम्न संभावना (15–30%)' },
};

const CONFIDENCE_FROM_SCORE = (score: number): AnswerConfidence => {
  if (score >= 70) return 'strong';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'weak';
  return 'unclear';
};

const HORA_LORD_NOTES: Record<string, string> = {
  Sun:     'Sun hora — favorable for government, authority, and career queries.',
  Moon:    'Moon hora — favorable for property, relationships, and emotional matters.',
  Mars:    'Mars hora — mixed for most; favorable for litigation and courage-related queries.',
  Mercury: 'Mercury hora — favorable for business, education, and communication queries.',
  Jupiter: 'Jupiter hora — most auspicious hora; favorable for all spiritual, marriage, and progeny queries.',
  Venus:   'Venus hora — favorable for marriage, comfort, and financial queries.',
  Saturn:  'Saturn hora — delays are likely; outcomes come through sustained effort.',
};

// ═════════════════════════════════════════════════════════════════════════════
// QUERY TYPE → QUERY CONTEXT MAP (for interpretationEngine)
// ═════════════════════════════════════════════════════════════════════════════

const PRASNA_TO_CONTEXT: Record<PrasnaQueryType, QueryContext> = {
  marriage:    'marriage',
  progeny:     'children',
  career:      'career',
  litigation:  'general',
  health:      'health',
  longevity:   'health',
  property:    'wealth',
  travel:      'general',
  spirituality:'spirituality',
  general:     'general',
};

// ═════════════════════════════════════════════════════════════════════════════
// ORIGINAL GENERATOR — generateClassicalAnswer()
// Backward-compatible 5-section response. Does NOT require Shadbala/Dasha data.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generate a 5-section classical Prasna answer.
 *
 * This is the base, backward-compatible generator.
 * For full 13-layer output, use generateEnhancedClassicalAnswer() instead.
 *
 * @example
 * const answer = generateClassicalAnswer({
 *   question: 'Will I get married this year?',
 *   verdict:  { outcome: 'favorable', score: 72 },
 *   horaLord: 'Jupiter',
 * });
 */
export function generateClassicalAnswer(input: ClassicalAnswerInput): ClassicalAnswer {
  const queryType   = input.queryType ?? classifyPrasnaQuery(input.question).queryType;
  const outcome     = input.verdict?.outcome ?? 'mixed';
  const score       = input.verdict?.score   ?? 50;
  const confidence  = CONFIDENCE_FROM_SCORE(score);
  const rules       = CLASSICAL_RULES[queryType] ?? CLASSICAL_RULES.general;
  const significators = HOUSE_SIGNIFICATORS[queryType] ?? HOUSE_SIGNIFICATORS.general;
  const horaNote    = input.horaLord ? (HORA_LORD_NOTES[input.horaLord] ?? '') : '';
  const isHi        = input.isHi ?? false;

  // ── Section 1: Direct Answer ─────────────────────────────────────────────
  const outcomeText: Record<AnswerOutcome, { en: string; hi: string }> = {
    favorable:   {
      en: `Based on classical Prasna analysis, the indicators are predominantly favorable for your ${queryType} query. ${horaNote}`,
      hi: `शास्त्रीय प्रश्न विश्लेषण के आधार पर, आपके ${queryType} प्रश्न के संकेतक अनुकूल हैं। ${horaNote}`,
    },
    mixed:       {
      en: `The indicators are mixed for your ${queryType} query — some planetary factors support and others create obstacles. ${horaNote}`,
      hi: `आपके ${queryType} प्रश्न के संकेतक मिश्रित हैं — कुछ ग्रह अनुकूल, कुछ बाधक। ${horaNote}`,
    },
    unfavorable: {
      en: `The current indicators present challenges for your ${queryType} query. However, planetary conditions change — this is a tendency, not a certainty. ${horaNote}`,
      hi: `वर्तमान संकेतक आपके ${queryType} प्रश्न में चुनौतियां दर्शाते हैं। परंतु ग्रह स्थितियां बदलती हैं। ${horaNote}`,
    },
  };

  // ── Section 2: Reasoning ─────────────────────────────────────────────────
  const topRules     = rules.slice(0, 3);
  const planetaryFactors = [
    input.horaLord ? `Hora Lord: ${input.horaLord} — ${HORA_LORD_NOTES[input.horaLord] ?? 'active at time of question'}` : null,
    input.moonRashi !== undefined ? `Moon in rashi ${input.moonRashi} — emotional/mental state of querent` : null,
    input.prashnaLagna !== undefined ? `Prasna Lagna: ${input.prashnaLagna} — the question's ascending sign` : null,
  ].filter(Boolean) as string[];

  // ── Section 3: Timing Windows ────────────────────────────────────────────
  const timingWindows: TimingWindow[] = [];

  if (outcome !== 'unfavorable') {
    timingWindows.push({
      label:      'Next 3–6 months',
      basis:      input.horaLord === 'Jupiter' || input.horaLord === 'Venus'
        ? `${input.horaLord} hora at the time of question — auspicious timing initiated`
        : 'Monitor Jupiter and Saturn transits over relevant houses',
      confidence: confidence === 'strong' ? 'moderate' : 'weak',
    });

    if (confidence === 'strong') {
      timingWindows.push({
        label:      'Current Dasha period',
        basis:      "The active Mahadasha lord's relationship to the query significators determines the primary activation window",
        confidence: 'strong',
      });
    }
  }

  const avoidPeriods: string[] = [];
  if (outcome === 'unfavorable' || outcome === 'mixed') {
    avoidPeriods.push(
      'Saturn transit over natal Moon or Lagna — avoid forcing decisions during this period',
      'Rahu/Ketu transit over the 7th/1st axis — unstable decisions during nodal influence'
    );
  }

  // ── Section 4: Risks ─────────────────────────────────────────────────────
  const cautions: string[] = [];
  if (queryType === 'marriage')    cautions.push('Do not make irrevocable decisions during retrograde Venus or Mercury');
  if (queryType === 'career')      cautions.push('Avoid job changes during Saturn retrograde or Sun transit through 12th');
  if (queryType === 'health')      cautions.push('Consult a qualified medical professional — astrology indicates tendencies, not medical certainty');
  if (queryType === 'litigation')  cautions.push('Do not settle or escalate during Mars retrograde; outcomes flip easily');
  if (queryType === 'property')    cautions.push('Avoid property decisions during Mercury retrograde or 4th lord transit through dusthana');
  if (outcome === 'unfavorable') {
    cautions.push('Current period requires patience — the same chart will show different windows in 12–18 months');
  }

  const antiHarmNote = 'This reading uses classical Prasna methodology from Prasna Marga and BPHS to indicate tendencies and timing windows — not guaranteed outcomes. Astrology supports awareness; it does not override human agency or medical/legal professional advice.';

  // ── Section 5: Remedies ──────────────────────────────────────────────────
  const actionMap: Record<PrasnaQueryType, string[]> = {
    marriage:    ['Strengthen Venus through white clothing, white foods, and Friday observance', 'Perform Navagrah puja with emphasis on Venus and Jupiter', 'Recite Venus mantra 108× on Fridays'],
    progeny:     ['Strengthen Jupiter through yellow sapphire (consult an expert) or yellow foods on Thursdays', 'Perform Santana Gopala puja', 'Recite Jupiter mantra 108× on Thursdays'],
    career:      ['Strengthen the 10th lord and Sun through appropriate Dasha-period remedies', 'Daily solar prayer before 8 AM', 'Donate wheat and copper on Sundays'],
    litigation:  ['Strengthen the 6th lord through Mars-related remedies on Tuesdays', 'Hanuman puja for protection from enemies', 'Recite Durga Saptashati for adversity'],
    health:      ['Strengthen the Lagna lord and Moon', 'Shiva abhisheka on Mondays', 'Moon mantra 108× on Mondays — consult a physician for medical treatment'],
    longevity:   ['Strengthen the 8th lord and Lagna lord', 'Mahamrityunjaya mantra 108× daily', 'Consult a physician for medical assessment'],
    property:    ['Strengthen Mars (4th house karaka for land) on Tuesdays', 'Vastu alignment of home', 'Grah Shanti puja for 4th house'],
    travel:      ['Strengthen the 9th lord and Mercury', 'Hanuman Chalisa before journey', 'Lord Ganesha puja on Wednesday before travel'],
    spirituality:['Strengthen Jupiter and Ketu through meditation and service', 'Daily mantra practice at dawn', 'Guru seva — serve a living or lineage teacher'],
    general:     ['Recite the Navagrah mantra sequence daily', 'Observe the weekday fast of the current Dasha lord', 'Donate to charity relevant to the query domain'],
  };

  const optionalRemedies: OptionalRemedy[] = [
    {
      type:        'mantra',
      description: `Recite the ${queryType === 'marriage' ? 'Venus' : queryType === 'career' ? 'Sun' : 'Jupiter'} beeja mantra 108× daily at sunrise`,
      source:      'Prasna Marga, Ch. XXXIV (Parihara Adhyaya)',
    },
    {
      type:        'charity',
      description: `Donate ${queryType === 'marriage' ? 'white cloth and sweets to a married woman' : queryType === 'career' ? 'wheat and copper to a temple' : 'yellow cloth and turmeric to a Brahmin'}`,
      source:      'BPHS, Ch. 86 (Remedial Measures)',
    },
  ];

  return {
    directAnswer: {
      en:          outcomeText[outcome].en,
      hi:          outcomeText[outcome].hi,
      confidence,
      outcome,
      probabilityLabel: PROBABILITY_LABELS[outcome],
    },
    reasoning: {
      en:          `${topRules.map(r => r.rule).join(' ')}`,
      hi:          `शास्त्रोक्त नियमों के अनुसार: ${topRules.map(r => r.application).join(' ')}`,
      classicalRules:     topRules,
      houseSignificators: significators,
      planetaryFactors,
    },
    timing: {
      en:          timingWindows.length > 0 ? `Favorable windows: ${timingWindows.map(w => w.label).join(', ')}.` : 'No immediate favorable window — patience required.',
      hi:          timingWindows.length > 0 ? `अनुकूल समय: ${timingWindows.map(w => w.label).join(', ')}.` : 'अभी अनुकूल समय नहीं — धैर्य आवश्यक है।',
      windows:     timingWindows,
      avoidPeriods,
    },
    risks: {
      en:          cautions.length > 0 ? `Key cautions: ${cautions[0]}` : 'No major risk factors identified at present.',
      hi:          cautions.length > 0 ? `सावधानी: ${cautions[0]}` : 'इस समय कोई बड़ा जोखिम नहीं।',
      cautions,
      antiHarmNote,
    },
    remedies: {
      en:          `Classical remedies for ${queryType}: ${(actionMap[queryType] ?? actionMap.general)[0]}`,
      hi:          `${queryType} के लिए शास्त्रीय उपाय: ग्रह बल वृद्धि और मंत्र जप।`,
      actions:          actionMap[queryType] ?? actionMap.general,
      optionalRemedies,
      disclaimer:  'Remedies are traditional recommendations from Prasna Marga and BPHS. Gemstones should be selected only after proper astrological evaluation of the full natal chart.',
    },
    queryType,
    chapterRef:   CHAPTER_REFS[queryType],
    prasnaNumber: input.prasnaNumber,
    direction:    input.direction,
    urgency:      input.urgency,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// ENHANCED GENERATOR — generateEnhancedClassicalAnswer()
// Full 13-layer integration. Requires Shadbala + Dasha + Yoga + Jaimini data.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generate a full 13-layer Prasna response.
 *
 * Runs the base 5-section generator first, then overlays:
 *   - Layer 6: [Level X: Dasha detail] tags on every timing window
 *   - Layer 7: Double Transit Protocol check
 *   - Layer 9: thereforeClause — forced single verdict
 *   - Layer 10: Failure mode + probability X% / Y%
 *   - Layer 11: Psychological profile object
 *   - Layer 12: Six-Layer Remedy Stack (replaces generic Section 5 remedies)
 *
 * The base 5 sections are preserved — the new layers add fields on top.
 *
 * @example
 * const answer = generateEnhancedClassicalAnswer({
 *   question:          'Will I get married this year?',
 *   verdict:           { outcome: 'favorable', score: 72 },
 *   horaLord:          'Jupiter',
 *   planets:           planetPositions,
 *   lagnaRashiIdx:     3,
 *   shadabala:         shadabalaResult.planets,
 *   shadabalaAnalysis: shadabalaResult,
 *   dasha:             dashaResult,
 *   yogaAnalysis:      yogaResult,
 *   jaiminiAnalysis:   jaiminiResult,
 *   psychologicalProfile: psychProfile,
 *   transits:          transitPositions,
 *   aspects:           aspectList,
 *   tenthLordName:     'Jupiter',
 * });
 *
 * console.log(answer.thereforeClause.verdict);
 * // → "Therefore: The marriage promise exists and is Dasha-activated..."
 *
 * console.log(answer.timing.windows[0].levelTag);
 * // → "[Level 4: Jupiter MD / Venus AD — until Dec 2027]"
 */
export async function generateEnhancedClassicalAnswer(
  input: EnhancedClassicalAnswerInput
): Promise<EnhancedClassicalAnswer> {

  // ── Step 1: Generate base 5-section answer ────────────────────────────────
  const base = generateClassicalAnswer(input);

  // ── Step 2: Map PrasnaQueryType → QueryContext ────────────────────────────
  const queryContext: QueryContext = PRASNA_TO_CONTEXT[base.queryType];

  // ── Step 2b: Assemble Engine Data dynamically ──────────────────────────────
  const { assembleEngineData } = await import('./engineDataAssembler');
  const engineData = assembleEngineData(
    input.questionTime ?? new Date(),
    input.lat,
    input.lon
  );

  // ── Step 3: Run 13-layer interpretation engine ────────────────────────────
  const engineInput: InterpretationInput = {
    queryContext,
    planets:              engineData.planets,
    lagnaRashiIdx:        engineData.lagnaRashiIdx,
    shadabala:            engineData.shadabala,
    shadabalaAnalysis:    engineData.shadabalaAnalysis,
    dasha:                engineData.dasha,
    yogaAnalysis:         engineData.yogaAnalysis,
    jaiminiAnalysis:      engineData.jaiminiAnalysis,
    transits:             engineData.transits,
    aspects:              engineData.aspects,
    divisional:           {},
    tenthLordName:        engineData.tenthLordName,
    psychologicalProfile: engineData.psychologicalProfile,
  };

  const engine = runInterpretationEngine(engineInput);

  // ── Step 4: Determine Double Transit target house ─────────────────────────
  const TARGET_HOUSE: Record<QueryContext, number> = {
    career: 10, marriage: 7, fame: 10, children: 5,
    health: 1,  wealth: 2,   spirituality: 9, general: 1,
  };
  const doubleTransit = checkDoubleTransit(
    TARGET_HOUSE[queryContext],
    engineData.transits,
    queryContext
  );

  // ── Step 5: Build enhanced timing windows (Layer 6 — Level tags) ─────────
  const md      = engineData.dasha.currentMahadasha;
  const ad      = engineData.dasha.currentAntardasha;
  const mdLabel = md?.planet ?? 'Unknown MD';
  const adLabel = ad?.planet ?? 'Unknown AD';
  const mdEnd   = md?.endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) ?? '';
  const adEnd   = ad?.endDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) ?? '';

  const enhancedWindows: EnhancedTimingWindow[] = base.timing.windows.map(w => ({
    ...w,
    dashaLevel: engine.dashaLevel,
    mdLord:     mdLabel,
    adLord:     adLabel,
    levelTag:   `[Level ${engine.dashaLevel}: ${mdLabel} MD / ${adLabel} AD — until ${adLabel === 'Unknown AD' ? mdEnd : adEnd}]`,
  }));

  // Add Double Transit window if certified
  if (doubleTransit.certifies) {
    enhancedWindows.push({
      label:      `Double Transit Window — ${TARGET_HOUSE[queryContext]}th house`,
      basis:      doubleTransit.description,
      confidence: 'strong',
      dashaLevel: Math.min(5, engine.dashaLevel + 1) as DashaLevel,
      mdLord:     mdLabel,
      adLord:     adLabel,
      levelTag:   `[Level ${Math.min(5, engine.dashaLevel + 1)}: ${doubleTransit.label} — ${mdLabel} MD / ${adLabel} AD]`,
    });
  }

  // Add latent/future window if current level is low
  if (engine.dashaLevel <= 2) {
    const futureMDs = engineData.dasha.mahadashas.filter(
      m => !m.isActive && m.startDate > new Date()
    );
    const nextFutureMD = futureMDs[0];
    if (nextFutureMD) {
      const startYear = nextFutureMD.startDate.getFullYear();
      const endYear   = nextFutureMD.endDate.getFullYear();
      enhancedWindows.push({
        label:      `${nextFutureMD.planet} MD, ${startYear}–${endYear}`,
        basis:      `Current Dasha blocks manifestation. Next major window opens when ${nextFutureMD.planet} MD begins — watch for AD of a ${queryContext} significator within that MD.`,
        confidence: 'moderate',
        dashaLevel: 2,
        mdLord:     nextFutureMD.planet,
        adLord:     'TBD — depends on AD sequence',
        levelTag:   `[Level 2: ${nextFutureMD.planet} MD, ${startYear}–${endYear} — current MD blocks until then]`,
      });
    }
  }

  // ── Step 6: Upgrade remedies to 6-layer stack (Layer 12) ─────────────────
  const { sixLayerRemedy } = engine;
  const upgradedRemedies = {
    ...base.remedies,
    en: `Six-layer remedy stack targeting ${sixLayerRemedy.planet} (weakest planet in this promise chain):`,
    hi: `${sixLayerRemedy.planet} (इस प्रतिज्ञा श्रृंखला का सबसे कमज़ोर ग्रह) के लिए षड्-स्तरीय उपाय:`,
    actions: [
      `Layer 1 (Behavioral): ${sixLayerRemedy.layer1_behavioral}`,
      `Layer 2 (Psychological): ${sixLayerRemedy.layer2_psychological}`,
      `Layer 4 (Practical): ${sixLayerRemedy.layer4_practical}`,
      `Layer 5 (Karmic): ${sixLayerRemedy.layer5_karmic}`,
    ],
    optionalRemedies: [
      {
        type:        'mantra' as const,
        description: `Layer 3 (Spiritual): ${sixLayerRemedy.layer3_spiritual}`,
        source:      'Prasna Marga, Ch. XXXIV (Parihara Adhyaya) + Graha Stotra tradition',
      },
      {
        type:        'ritual' as const,
        description: `Layer 6 (Ritual): ${sixLayerRemedy.layer6_ritual}`,
        source:      'BPHS, Ch. 86 (Remedial Measures) + traditional weekday observances',
      },
    ],
    disclaimer: base.remedies.disclaimer,
    sixLayerStack: sixLayerRemedy,
  };

  // ── Step 7: Compute convergence score ─────────────────────────────────────
  const convergenceScore = Math.round(
    engine.failureMode.probabilityWithout * 0.7 +
    engine.dashaLevel * 5 +
    (doubleTransit.certifies ? 15 : 0)
  );

  // ── Step 8: Assemble EnhancedClassicalAnswer ──────────────────────────────
  return {
    // Preserve all base sections
    directAnswer:     base.directAnswer,
    reasoning:        base.reasoning,
    risks:            base.risks,
    queryType:        base.queryType,
    chapterRef:       base.chapterRef,
    prasnaNumber:     base.prasnaNumber,
    direction:        base.direction,
    urgency:          base.urgency,

    // Override timing with enhanced windows + double transit
    timing: {
      en:           upgradeTimingText(engine.thereforeClause.verdict, doubleTransit),
      hi:           `दोहरा ट्रांज़िट ${doubleTransit.certifies ? 'सक्रिय — घटना प्रमाणित' : 'निष्क्रिय — एकल ट्रांज़िट अस्थायी'}। ${engine.levelTag}`,
      windows:      enhancedWindows,
      avoidPeriods: base.timing.avoidPeriods,
      doubleTransit,
    },

    // Override remedies with 6-layer stack
    remedies: upgradedRemedies,

    // New Layer 9: Therefore Clause
    thereforeClause: engine.thereforeClause,

    // New Layer 11: Psychological Profile
    psychologicalProfile: engine.psychologicalProfile,

    // New meta
    convergenceScore,
    dashaLevel:   engine.dashaLevel,
    levelTag:     engine.levelTag,
    natalPromise: engine.natalPromise,
    executiveVerdict: buildEnhancedExecutiveVerdict(engine.thereforeClause, engine.failureMode, doubleTransit),
    fullReport:   engine.fullReport,
  };
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function upgradeTimingText(verdict: string, dt: DoubleTransitResult): string {
  const transitLine = dt.certifies
    ? `Double Transit is ACTIVE — this is a certified delivery window, not a temporary opportunity.`
    : dt.activePlanet
    ? `Single ${dt.activePlanet} transit only — temporary window. Without Double Transit, the event may come and go without structural permanence.`
    : `No major transit ignition at present. Wait for next Jupiter-Saturn convergence on the relevant house.`;

  return `${transitLine} ${verdict}`;
}

function buildEnhancedExecutiveVerdict(
  tc:  ThereforeClause,
  fm:  { probabilityWithout: number; probabilityWith: number; interventionTarget: string },
  dt:  DoubleTransitResult
): string {
  return [
    tc.verdict,
    `Probability: ${fm.probabilityWithout}% without remedy → ${fm.probabilityWith}% with targeted ${fm.interventionTarget} strengthening.`,
    dt.certifies ? `Double Transit: CERTIFIED — event window is structurally supported.` : `Double Transit: INACTIVE — ${dt.activePlanet ? `${dt.activePlanet} alone creates a temporary window only` : 'no transit ignition'}.`,
    tc.levelTag,
  ].join(' ');
}

// ═════════════════════════════════════════════════════════════════════════════
// CONVENIENCE: Format enhanced answer as markdown string
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Render the enhanced answer as a structured markdown string.
 * Ready for display in QuestionPage.tsx or any React component.
 */
export function renderEnhancedAnswer(answer: EnhancedClassicalAnswer): string {
  const lines: string[] = [];

  lines.push(`# ${answer.queryType.toUpperCase()} — Classical Analysis`);
  lines.push(`*${answer.chapterRef}*`);
  lines.push('');

  lines.push('## Direct Answer');
  lines.push(answer.directAnswer.en);
  lines.push(`**Confidence**: ${answer.directAnswer.confidence.toUpperCase()} | **Probability**: ${answer.directAnswer.probabilityLabel.en}`);
  lines.push('');

  lines.push('## Executive Verdict (13-Layer Convergence)');
  lines.push(`> ${answer.executiveVerdict}`);
  lines.push('');

  lines.push('## Astrological Reasoning');
  lines.push(answer.reasoning.en);
  lines.push('');
  lines.push('**Classical Sources:**');
  answer.reasoning.classicalRules.slice(0, 3).forEach(r => {
    lines.push(`- *${r.source}*: ${r.application}`);
  });
  lines.push('');
  lines.push(`**House Significators**: ${answer.reasoning.houseSignificators.join(' | ')}`);
  lines.push('');

  lines.push('## Timing Windows (with Dasha Level Tags)');
  answer.timing.windows.forEach(w => {
    lines.push(`- **${w.label}** — ${w.basis} ${w.levelTag}`);
  });
  if (answer.timing.avoidPeriods.length > 0) {
    lines.push('');
    lines.push('**Avoid:**');
    answer.timing.avoidPeriods.forEach(p => lines.push(`- ${p}`));
  }
  lines.push('');
  lines.push(`**Double Transit**: ${answer.timing.doubleTransit.label} — ${answer.timing.doubleTransit.description}`);
  lines.push('');

  lines.push('## Conflict Resolution');
  lines.push(`**Conflict**: ${answer.thereforeClause.conflict}`);
  lines.push(`**Weighing**: ${answer.thereforeClause.weightingLayer}`);
  lines.push(`**${answer.thereforeClause.verdict}**`);
  lines.push('');

  lines.push('## Psychological Profile');
  lines.push(`**Core Fear (Nakshatra)**: ${answer.psychologicalProfile.nakshatra_fear.coreFear}`);
  lines.push(`**Manifestation**: ${answer.psychologicalProfile.nakshatra_fear.manifestation}`);
  lines.push(`**Reframe**: ${answer.psychologicalProfile.nakshatra_fear.reframe}`);
  lines.push('');
  lines.push(`**Rahu/Ketu Karmic Statement**: ${answer.psychologicalProfile.rahu_ketu_karmic_statement.paragraph}`);
  lines.push('');
  lines.push(`**Saturn Wound**: ${answer.psychologicalProfile.saturn_wound_statement.paragraph}`);
  lines.push('');
  lines.push(`**Synthesis**: ${answer.psychologicalProfile.synthesis_narrative}`);
  lines.push('');

  lines.push('## Risks & Cautions');
  answer.risks.cautions.forEach(c => lines.push(`- ${c}`));
  lines.push(`\n*${answer.risks.antiHarmNote}*`);
  lines.push('');

  lines.push('## Six-Layer Remedy Stack');
  lines.push(`*Targeting ${answer.remedies.sixLayerStack.planet} (weakest planet in this promise chain)*`);
  lines.push('');
  lines.push(`**Layer 1 — Behavioral** *(Primary)*: ${answer.remedies.sixLayerStack.layer1_behavioral}`);
  lines.push('');
  lines.push(`**Layer 2 — Psychological**: ${answer.remedies.sixLayerStack.layer2_psychological}`);
  lines.push('');
  lines.push(`**Layer 3 — Spiritual**: ${answer.remedies.sixLayerStack.layer3_spiritual}`);
  lines.push('');
  lines.push(`**Layer 4 — Practical**: ${answer.remedies.sixLayerStack.layer4_practical}`);
  lines.push('');
  lines.push(`**Layer 5 — Karmic**: ${answer.remedies.sixLayerStack.layer5_karmic}`);
  lines.push('');
  lines.push(`**Layer 6 — Ritual**: ${answer.remedies.sixLayerStack.layer6_ritual}`);
  lines.push('');
  lines.push(`*${answer.remedies.disclaimer}*`);
  lines.push('');

  lines.push(`---`);
  lines.push(`**Convergence Score**: ${answer.convergenceScore}/100 | **${answer.levelTag}**`);

  return lines.join('\n');
}
