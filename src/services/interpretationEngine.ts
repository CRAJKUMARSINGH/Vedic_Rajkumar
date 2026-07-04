/**
 * interpretationEngine.ts
 *
 * MASTER 13-LAYER CONVERGENCE ORCHESTRATOR
 *
 * Wires together all existing Vedic Rajkumar services through the
 * strict multi-layer hierarchy defined in INTERPRETATION.md.
 *
 * Layer execution order (mandatory — lower layers cannot override higher):
 *   0  → virginWorldFameService  (fame queries only)
 *   1  → Natal Promise check     (shadabalaService + divisionalChartsService)
 *   2  → Shadbala Gate           (shadabalaService)
 *   3  → Yoga Status Tagging     (yogaService + dashaService)
 *   4  → Divisional Synthesis    (divisionalChartsService)
 *   5  → Aspect Weighing         (aspectsService)
 *   6  → Dasha Level 1–5         (dashaService)
 *   7  → Double Transit Protocol (dynamicTransitService)
 *   8  → Arudha Psychology       (jaiminiService)
 *   9  → "Therefore:" Clause     (classicalAnswerEngine)
 *   10 → Failure Mode / Prob.    (shadabalaService + dashaService)
 *   11 → Psychological Profile   (psychologicalProfileService)
 *   12 → Six-Layer Remedy Stack  (remediesService)
 *   13 → Virgin World Fame Verdict (virginWorldFameService)
 *
 * Drop this file into src/services/ of the Vedic Rajkumar repo.
 */

import type { ShadabalaResult, ShadabalaAnalysis } from './shadabalaService';
import type { DashaResult, DashaPeriod, AntarDasha } from './dashaService';
import { getActiveDashaContext } from './dashaService';
import type { YogaResult, YogaAnalysis } from './yogaService';
import { enhanceYogaAnalysis } from './yogaService';
import type { EnhancedYogaResult as ServiceEnhancedYogaResult } from './yogaService';
import type { JaiminiAnalysis, PadaLagna, Karaka } from './jaiminiService';
import { buildArudhaPsychology as buildArudhaPsychologyFromService } from './jaiminiService';
import type { ArudhaPsychologyOutput as ServiceArudhaPsychologyOutput } from './jaiminiService';
import type { ClassicalAnswer } from './classicalAnswerEngine';
import type { PsychologicalProfile } from './psychologicalProfileService';
import type { VirginWorldFameScore, VirginWorldFameVerdict } from './virginWorldFameService';
import { calculateProbability as serviceCalculateProbability } from './aiPredictionService';
import { assembleSixLayerStack as serviceAssembleSixLayerStack } from './remediesService';
import type { SixLayerRemedyStack as ServiceSixLayerRemedyStack } from './remediesService';
import { checkDoubleTransit as serviceCheckDoubleTransit } from './dynamicTransitService';
import type { DoubleTransitResultV2, TransitData as ServiceTransitData } from './dynamicTransitService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QueryContext =
  | 'career'
  | 'marriage'
  | 'fame'
  | 'children'
  | 'health'
  | 'wealth'
  | 'spirituality'
  | 'general';

export type YogaStatus = 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';

export type DashaLevel = 1 | 2 | 3 | 4 | 5;

export interface EnhancedYogaResult extends YogaResult {
  status:           YogaStatus;
  shadabalaGated:   number;       // weakest planet's totalRupas
  activationDasha?: string;       // "Jupiter MD / Saturn AD"
  activationWindow?: string;      // "2027–2029"
  dashaLevel:       DashaLevel;
  thereforeVerdict: string;       // Single forced conclusion
}

export interface ThereforeClause {
  conflict:      string;         // "D10 shows X but D1 shows Y"
  weightingLayer: string;        // "Layer 3 (Shadbala): Mars at 0.55 rupas"
  verdict:       string;         // The forced conclusion
  dashaLevel:    DashaLevel;
  levelTag:      string;         // "[Level 4: Jupiter MD / Saturn AD, 2027–2029]"
}

export interface DoubleTransitResult {
  type:            'DOUBLE_TRANSIT_CERTIFIED' | 'DOUBLE_TRANSIT_SUPPORTED' | 'DOUBLE_TRANSIT_PEAK' | 'SINGLE_TRANSIT_TEMPORARY' | 'NO_TRANSIT_IGNITION';
  activePlanet?:   string;
  label:           string;
  certifies:       boolean;
  description:     string;
}

export interface ArudhaPsychologyOutput {
  alPosition:      number;        // AL from Lagna (1–12)
  alRashiName:     string;
  psychologicalMask: string;
  coreTension:     string;
  narrative:       string;        // Full "AL in Nth from Lagna..." paragraph
  ulAnalysis?:     string;        // Upapada Lagna
  a10Analysis?:    string;        // A10 career perception
  a4Analysis?:     string;        // A4 home/comfort perception
}

export interface FailureMode {
  obstruction:            string;
  probabilityWithout:     number;
  probabilityWith:        number;
  interventionTarget:     string;   // Single weakest planet name
  interventionRupas:      number;
  interventionRationale:  string;
}

export interface SixLayerRemedyStack {
  planet:         string;          // Weakest planet being targeted
  layer1_behavioral:   string;
  layer2_psychological: string;
  layer3_spiritual:    string;     // Mantra + count + mechanism
  layer4_practical:    string;
  layer5_karmic:       string;
  layer6_ritual:       string;
}

export interface InterpretationOutput {
  // ── Structure ─────────────────────────────────────────────────────────────
  queryContext:       QueryContext;
  timestamp:          string;

  // ── Layer 0 + 13 (fame only) ───────────────────────────────────────────────
  fameScore?:         VirginWorldFameScore;
  fameVerdict?:       VirginWorldFameVerdict;

  // ── Layer 1 ────────────────────────────────────────────────────────────────
  natalPromise:       { promised: boolean; confidence: number; reason: string };

  // ── Layer 2 ────────────────────────────────────────────────────────────────
  shadabalaGate:      { weakestPlanet: string; weakestRupas: number; tier: string };

  // ── Layer 3 ────────────────────────────────────────────────────────────────
  enhancedYogas:      EnhancedYogaResult[];

  // ── Layer 4 ────────────────────────────────────────────────────────────────
  divisionalSynthesis: string;   // Single forced verdict

  // ── Layer 5 ────────────────────────────────────────────────────────────────
  weightedAspects:    Array<{ planet: string; toHouse: number; weight: number; note: string }>;

  // ── Layer 6 ────────────────────────────────────────────────────────────────
  dashaLevel:         DashaLevel;
  levelTag:           string;

  // ── Layer 7 ────────────────────────────────────────────────────────────────
  doubleTransit:      DoubleTransitResult;

  // ── Layer 8 ────────────────────────────────────────────────────────────────
  arudhaPsychology:   ArudhaPsychologyOutput;

  // ── Layer 9 ────────────────────────────────────────────────────────────────
  thereforeClause:    ThereforeClause;

  // ── Layer 10 ───────────────────────────────────────────────────────────────
  failureMode:        FailureMode;

  // ── Layer 11 ───────────────────────────────────────────────────────────────
  psychologicalProfile: PsychologicalProfile;

  // ── Layer 12 ───────────────────────────────────────────────────────────────
  sixLayerRemedy:     SixLayerRemedyStack;

  // ── Formatted output ───────────────────────────────────────────────────────
  executiveVerdict:   string;
  fullReport:         string;
}

// ─── Planet + aspect minimal shapes ──────────────────────────────────────────

interface PlanetPosition {
  name:        string;
  house:       number;
  rashiIndex:  number;
  degrees:     number;
  isRetrograde?: boolean;
  nakshatra?:  string;
  longitude?:  number;
}

interface AspectData {
  fromPlanet: string;
  toHouse:    number;
  weight?:    number;
}

interface TransitPosition {
  planet:      string;
  house:       number;
  aspectsHouses: number[];
}

interface DivisionalConfirmation {
  d9_strong?:  boolean;
  d10_strong?: boolean;
  d60_strong?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES: Record<number, string> = {
  0:'Aries',1:'Taurus',2:'Gemini',3:'Cancer',4:'Leo',5:'Virgo',
  6:'Libra',7:'Scorpio',8:'Sagittarius',9:'Capricorn',10:'Aquarius',11:'Pisces',
};

const SHADBALA_TIERS: Array<{ min: number; max: number; tier: string; delivery: string }> = [
  { min: 2.0,  max: Infinity, tier: 'EXTREMELY_STRONG', delivery: 'Full yoga delivery; timing accelerates 25–40%' },
  { min: 1.25, max: 2.0,      tier: 'STRONG',            delivery: 'Standard delivery with confidence' },
  { min: 0.75, max: 1.25,     tier: 'MODERATE',          delivery: 'Conditional delivery; requires supporting factors' },
  { min: 0.40, max: 0.75,     tier: 'WEAK',              delivery: 'Diluted/frustrated; event may occur but disappoints' },
  { min: 0.0,  max: 0.40,     tier: 'EXTREMELY_WEAK',    delivery: 'Yoga broken; event unlikely without Neecha Bhanga or remedy' },
];

function getShadabalaTier(rupas: number): string {
  return SHADBALA_TIERS.find(t => rupas >= t.min && rupas < t.max)?.tier ?? 'EXTREMELY_WEAK';
}

function getShadabalaDelivery(rupas: number): string {
  return SHADBALA_TIERS.find(t => rupas >= t.min && rupas < t.max)?.delivery ?? 'Yoga broken';
}

// ─── LAYER 2: Shadbala modifier functions ─────────────────────────────────────

function applyVargottamaModifier(rupas: number, degrees: number): number {
  const isVargottama = degrees < 3.33 || degrees > 26.67;
  return isVargottama ? rupas * 1.25 : rupas;
}

function applyCombustionModifier(
  rupas: number,
  planet: PlanetPosition,
  sun: PlanetPosition | undefined
): number {
  if (!sun || planet.name === 'Sun') return rupas;
  const diff = Math.abs((planet.longitude ?? 0) - (sun.longitude ?? 0));
  const normalizedDiff = Math.min(diff, 360 - diff);
  const combustionThresholds: Record<string, number> = {
    Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
  };
  const threshold = combustionThresholds[planet.name] ?? 0;
  if (normalizedDiff < threshold) {
    // Within 1° in own/exalted sign → no penalty
    const isOwnOrExalt = false; // simplified — caller should pass this flag
    if (!isOwnOrExalt || normalizedDiff > 1) return rupas * 0.70;
  }
  return rupas;
}



// ─── LAYER 5: Aspect Weight Engine ────────────────────────────────────────────

const ASPECT_WEIGHTS: Record<string, number> = {
  Jupiter: 1.1,
  Saturn:  1.2,
  Rahu:    0.9,
  Ketu:    0.9,
  _graha:  0.8,   // Default Graha Drishti
  _jaimini: 1.0,  // Jaimini sign aspect
};

function getAspectNote(planet: string, toHouse: number, rupas: number): string {
  if (planet === 'Saturn') {
    return rupas >= 1.0
      ? `Saturn aspect on ${toHouse}th: CERTIFIES this house domain — will manifest, but hard-won and delayed.`
      : `Saturn aspect on ${toHouse}th: Delays and tests, but Saturn itself is weak (${rupas.toFixed(2)} rupas) — delays without the certification of eventual success.`;
  }
  if (planet === 'Jupiter') {
    return `Jupiter aspect on ${toHouse}th: Protective and expansive — stabilizes weak placements; confers grace even on afflicted houses.`;
  }
  if (planet === 'Rahu') {
    return `Rahu aspect on ${toHouse}th: Karmic intensity — amplifies obsessions; can create sudden events or viral quality in this domain.`;
  }
  if (planet === 'Ketu') {
    return `Ketu aspect on ${toHouse}th: Releases attachment in this domain — may feel like loss but is karmic completion.`;
  }
  return `${planet} aspect on ${toHouse}th: Standard graha drishti (0.8× weight), modified by planet's Shadbala (${rupas.toFixed(2)} rupas).`;
}

// ─── LAYER 6: Dasha Level Resolver ────────────────────────────────────────────

function resolveDashaLevel(
  shadabalaGated:         number,
  natalPromised:          boolean,
  divisionalConfirmed:    boolean,
  dashaActive:            boolean,
  adActive:               boolean,
  doubleTransitCertified: boolean
): DashaLevel {
  if (!natalPromised) return 1;

  if (dashaActive && adActive && divisionalConfirmed && doubleTransitCertified && shadabalaGated >= 1.25)
    return 5;
  if (dashaActive && adActive && divisionalConfirmed && shadabalaGated >= 1.0)
    return 4;
  if (dashaActive && divisionalConfirmed && shadabalaGated >= 0.75)
    return 3;
  if (natalPromised && !dashaActive)
    return 2;
  return 1;
}

// ─── LAYER 7: Double Transit Protocol ─────────────────────────────────────────

export function checkDoubleTransit(
  targetHouse:   number,
  transits:      TransitPosition[],
  queryContext?: QueryContext
): DoubleTransitResult {
  const jupiter = transits.find(t => t.planet === 'Jupiter');
  const saturn  = transits.find(t => t.planet === 'Saturn');

  const jupiterOnTarget = jupiter && (
    jupiter.house === targetHouse ||
    jupiter.aspectsHouses.includes(targetHouse)
  );
  const saturnOnTarget = saturn && (
    saturn.house === targetHouse ||
    saturn.aspectsHouses.includes(targetHouse)
  );

  if (jupiterOnTarget && saturnOnTarget) {
    const bothTransiting = jupiter?.house === targetHouse && saturn?.house === targetHouse;
    if (bothTransiting) {
      return {
        type: 'DOUBLE_TRANSIT_PEAK',
        label: 'PEAK DOUBLE TRANSIT',
        certifies: true,
        description: `Both Jupiter and Saturn are transiting the ${targetHouse}th house simultaneously — PEAK WINDOW. Maximum external pressure for manifestation. This is the highest-confidence timing signature. Events in this domain are not just possible — they are being actively pushed by cosmic structure.`,
      };
    }
    return {
      type: 'DOUBLE_TRANSIT_CERTIFIED',
      label: 'DOUBLE TRANSIT: CERTIFIED',
      certifies: true,
      description: `Jupiter and Saturn are simultaneously influencing the ${targetHouse}th house — the event is CERTIFIED. It will happen slowly and permanently. The structure is set; timing is in the next 6–18 months depending on AD.`,
    };
  }

  if (jupiterOnTarget && !saturnOnTarget) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Jupiter',
      label: 'SINGLE TRANSIT: TEMPORARY (Jupiter only)',
      certifies: false,
      description: `Jupiter alone transits the ${targetHouse}th — creates a temporary window of opportunity, blessings, and expansion. Without Saturn involvement, the event may come and go without structural permanence. ${queryContext === 'marriage' ? 'Dating opportunities and proposals may arrive — not a marriage decision window.' : 'Growth arrives but may not consolidate.'}`,
    };
  }

  if (saturnOnTarget && !jupiterOnTarget) {
    return {
      type: 'SINGLE_TRANSIT_TEMPORARY',
      activePlanet: 'Saturn',
      label: 'SINGLE TRANSIT: TEMPORARY (Saturn only)',
      certifies: false,
      description: `Saturn alone influences the ${targetHouse}th — pressure and testing without the expansive support of Jupiter. The test is real; the reward is not yet guaranteed. Without Jupiter, this is a crucible without a clear exit date.`,
    };
  }

  return {
    type: 'NO_TRANSIT_IGNITION',
    label: 'NO TRANSIT IGNITION',
    certifies: false,
    description: `Neither Jupiter nor Saturn is currently activating the ${targetHouse}th house. No transit ignition for this domain at present. Wait for the next Jupiter or Saturn transit convergence before expecting an event.`,
  };
}

// ─── LAYER 8: Arudha Psychology Narrative ─────────────────────────────────────
// @deprecated — Now delegated to jaiminiService.buildArudhaPsychology() in the
// orchestrator. Local copy kept only for ordinalSuffix helper.

function ordinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

// ─── LAYER 9: "Therefore:" Clause Builder ─────────────────────────────────────

function buildThereforeClause(
  queryContext:        QueryContext,
  natalPromised:       boolean,
  d1Analysis:          string,
  divisionalAnalysis:  string,
  shadabalaWeakest:    { name: string; rupas: number },
  dashaLevel:          DashaLevel,
  activeDasha:         { md: string; ad: string } | null,
  doubleTransit:       DoubleTransitResult
): ThereforeClause {

  if (!natalPromised) {
    return {
      conflict:       `D1 does not show a natal promise for ${queryContext}.`,
      weightingLayer: 'Layer 1 (Natal Promise) terminates the analysis: the radix has no seed for this domain.',
      verdict:        `The natal chart does not promise ${queryContext} in a structurally deliverable form. No transit, yoga, or Dasha can manufacture what the radix denies.`,
      dashaLevel:     1,
      levelTag:       '[Level 1: Natal promise absent — remedy and spiritual realignment required for any manifestation]',
    };
  }

  const conflict = divisionalAnalysis !== d1Analysis && divisionalAnalysis.length > 0
    ? `D1 shows ${d1Analysis}, but the divisional chart shows ${divisionalAnalysis}.`
    : `D1 shows ${d1Analysis}.`;

  const weightingLayer =
    `Layer 3 (Shadbala) casting vote: ${shadabalaWeakest.name} at ${shadabalaWeakest.rupas.toFixed(2)} rupas (${getShadabalaTier(shadabalaWeakest.rupas)}) — ${getShadabalaDelivery(shadabalaWeakest.rupas)}.`;

  const dashaLine = activeDasha
    ? `${activeDasha.md} MD / ${activeDasha.ad} AD is running.`
    : 'No relevant Dasha currently active.';

  const transitLine = doubleTransit.certifies
    ? 'Double Transit certifies this window.'
    : 'Single transit or no transit — temporary window only.';

  const levelTag = `[Level ${dashaLevel}: ${activeDasha ? `${activeDasha.md} MD / ${activeDasha.ad} AD` : 'Future Dasha required'}]`;

  // Build the forced verdict
  let verdict = '';
  if (dashaLevel >= 4 && doubleTransit.certifies) {
    verdict = `Therefore: This is a high-confidence delivery window. ${dashaLine} ${transitLine} The ${queryContext} domain is structurally promised, Dasha-activated, and transit-certified. Act within this window — it is not guaranteed to recur soon.`;
  } else if (dashaLevel >= 3) {
    verdict = `Therefore: The ${queryContext} promise exists and is Dasha-activated, but ${shadabalaWeakest.name} at ${shadabalaWeakest.rupas.toFixed(2)} rupas introduces conditional delivery — the event occurs but may not meet expectations without targeting this weakness. ${dashaLine}`;
  } else if (dashaLevel === 2) {
    verdict = `Therefore: The ${queryContext} promise exists in the natal chart, but the current Dasha sequence does not activate it. Wait for [specific future MD] before expecting manifestation. Use this window to build the platform; do not force the event.`;
  } else {
    verdict = `Therefore: The natal ${queryContext} promise is weak or absent. Without targeted remedy to the weakest planet (${shadabalaWeakest.name}), the probability of manifestation remains below 20%. This is curriculum for patience and inner development, not a window for outer pursuit.`;
  }

  return { conflict, weightingLayer, verdict, dashaLevel, levelTag };
}

// ─── LAYER 10: Failure Mode & Probability Engine ──────────────────────────────
// @deprecated — calculateProbabilities() replaced by aiPredictionService.calculateProbability()
// in the orchestrator (v2.1). Local function retained as dead code for reference only.
// DO NOT call this directly — use serviceCalculateProbability() instead.

// ─── LAYER 12: Six-Layer Remedy Stack ─────────────────────────────────────────
// @deprecated — All remedy data maps and assembleSixLayerStack() replaced by
// remediesService.assembleSixLayerStack() in the orchestrator (v2.1).
// Local copies retained as dead code for reference only.

/** @deprecated Use serviceAssembleSixLayerStack() via remediesService instead */
const PLANET_BEHAVIORAL_REMEDIES: Record<string, string> = {
  Sun:     'Take one visible public action daily before 8 AM (solar hour). Leadership is a muscle built through repeated public exposure — not private rehearsal. Speak first in every meeting this week.',
  Moon:    'Begin each day with 10 minutes of silent water-contact (touch flowing water, drink slowly, or bathe consciously). Practice naming one emotion accurately before acting on it. Emotional precision is the Moon\'s gift.',
  Mars:    'Commit to one physical discipline (not hobby — discipline) for 40 consecutive days. Cold shower at dawn. Mars strength is built through voluntary discomfort, not comfort-zone courage.',
  Mercury: 'Read one demanding text aloud for 20 minutes daily before 10 AM (Mercury hour). Record yourself. Review for clarity gaps. Mercury\'s power is precision of transmission, not volume of thought.',
  Jupiter: 'Teach one concept you know deeply to one person who knows nothing about it — weekly, for 12 weeks. Jupiter\'s strength is magnified by transmission, not by accumulation of wisdom.',
  Venus:   'Receive one form of beauty or pleasure daily without guilt or deflection — consciously, fully. Create something beautiful weekly and share it without seeking approval. Venus heals through giving and receiving without transaction.',
  Saturn:  'Commit publicly to one 90-day structured project with a measurable outcome. Report progress weekly to one accountability partner. Saturn\'s strength is earned through demonstrated delay tolerance and structure.',
  Rahu:    'Engage deliberately with one foreign or unconventional domain weekly — a language, a cuisine, a field outside your expertise. Rahu fame requires breaking your own categories, not polishing what already exists.',
  Ketu:    'Practice one conscious act of release daily — a possession, an opinion, a grudge. Ketu\'s strength comes from reducing attachment, not from accumulating spiritual credentials.',
};

const PLANET_PSYCHOLOGICAL_REMEDIES: Record<string, string> = {
  Sun:     'Your fear is that authority must be performed rather than inhabited. The reframe: you are not auditioning for leadership — you were already cast. Stop rehearsing. Start ruling.',
  Moon:    'Your fear is that your emotions will overwhelm or alienate. The reframe: emotional accuracy is not vulnerability — it is data. The people worth keeping will not leave because you feel.',
  Mars:    'Your fear is that aggression will destroy what you love. The reframe: your drive is not violence — it is direction. Anger is information. Redirect it; do not suppress it.',
  Mercury: 'Your fear is that precision will expose your ignorance. The reframe: you are not being evaluated for what you don\'t know — you are being respected for how clearly you say what you do know.',
  Jupiter: 'Your fear is that wisdom hoarded is wisdom protected. The reframe: the teacher grows fastest by teaching. Your knowledge is not diminished by sharing — it is amplified.',
  Venus:   'Your fear is that desire is dangerous or shameful. The reframe: your capacity to receive beauty is the measure of your capacity to give it. Self-permission is the prerequisite to generosity.',
  Saturn:  'Your fear is that structure is punishment. The reframe: Saturn\'s discipline is not imprisonment — it is the architecture of freedom. What you build slowly, you keep permanently.',
  Rahu:    'Your obsession with this domain is not weakness — it is compass. The reframe: the obsession is karmic direction. Pursue it consciously and it becomes purpose. Pursue it compulsively and it becomes prison.',
  Ketu:    'Your expertise in this area is real — but Ketu whispers that it is already over. The reframe: mastery from prior lives is a foundation, not a finish line. Build on it rather than abandoning it.',
};

const PLANET_MANTRAS: Record<string, { mantra: string; count: string; timing: string; mechanism: string }> = {
  Sun:     { mantra: 'Om Hraam Hreem Hroum Sah Suryaya Namah', count: '108× at sunrise', timing: 'Sunday, facing east at dawn', mechanism: 'Activates solar authority and the Anahata chakra — aligns personal will with cosmic purpose; rebuilds executive function and self-respect.' },
  Moon:    { mantra: 'Om Shraam Shreem Shroum Sah Chandraya Namah', count: '108× on Monday evenings or at moonrise', timing: 'Monday, facing north', mechanism: 'Stabilizes the emotional body and Swadhisthana chakra — reduces anxiety and builds receptive intelligence; improves sleep and emotional regulation.' },
  Mars:    { mantra: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah', count: '108× on Tuesday at sunrise', timing: 'Tuesday, facing south', mechanism: 'Channels Martian energy from aggression to directed will — strengthens Manipura chakra, courage, and physical vitality.' },
  Mercury: { mantra: 'Om Braam Breem Broum Sah Budhaya Namah', count: '108× on Wednesday morning', timing: 'Wednesday, Mercury hour after sunrise', mechanism: 'Activates Mercury\'s higher octave (Vishnu) — stabilizes nervous system, speech centers, and analytical precision.' },
  Jupiter: { mantra: 'Om Graam Greem Groum Sah Gurave Namah', count: '108× on Thursday at dawn', timing: 'Thursday, facing northeast', mechanism: 'Invokes Jupiter\'s protective and expansive quality — opens Sahasrara chakra, accelerates wisdom transmission, and activates dharmic fortune.' },
  Venus:   { mantra: 'Om Draam Dreem Droum Sah Shukraya Namah', count: '108× on Friday evening', timing: 'Friday at sunset, facing southeast', mechanism: 'Activates Venus as the vehicle of Lakshmi — opens capacity for abundance, beauty, and conscious pleasure; heals shame around desire.' },
  Saturn:  { mantra: 'Om Praam Preem Proum Sah Shanaischaraya Namah', count: '108× on Saturday at dawn', timing: 'Saturday, facing west', mechanism: 'Saturn\'s mantra accelerates karmic debt repayment — converts suffering into structure; builds the Muladhara foundation of permanent achievement.' },
  Rahu:    { mantra: 'Om Raam Rahave Namah', count: '108× on Saturday or Wednesday night', timing: 'At night, facing southwest', mechanism: 'Channels Rahu\'s foreign/viral energy consciously — transmutes obsession into disciplined ambition; reduces shadow compulsion.' },
  Ketu:    { mantra: 'Om Kem Ketave Namah', count: '108× on Tuesday or Saturday at dawn', timing: 'Facing northwest', mechanism: 'Activates Ketu\'s moksha quality — reduces attachment to past-life patterns; opens doorway to spiritual insight and conscious release.' },
};

const PLANET_PRACTICAL_REMEDIES: Record<string, string> = {
  Sun:     'Expose yourself to unfiltered sunlight for 15 minutes daily before 9 AM. Eliminate processed foods (pitta balance). Eat copper-vessel water. Schedule important leadership decisions on Sunday mornings.',
  Moon:    'Reduce sugar and dairy (Kapha aggravation). Sleep before 10 PM. Wear silver or white. Keep a dream journal. Avoid all screens for 30 minutes before sleep.',
  Mars:    'Increase protein intake (Mars needs physical fuel). Cold showers in the morning. Reduce alcohol (Mars imbalance amplifier). Schedule important decisions after physical exertion.',
  Mercury: 'Eliminate processed sugars (Mercury/pitta imbalance). Schedule all important communications before noon. Eat green foods. Reduce social media — Mercury weakens through information scatter.',
  Jupiter: 'Eat sattvik food — reduce rajasic (spicy/oily) and tamasic (stale) foods. Increase turmeric and yellow foods. Wake before sunrise. Donate to education. Avoid excess of everything.',
  Venus:   'Surround yourself with beauty deliberately — not as decoration but as environment. Reduce indulgence (paradoxically strengthens Venus by training conscious receptivity). Create beauty weekly.',
  Saturn:  'Establish a fixed sleep-wake schedule 6 days a week. Fast lightly on Saturdays. Reduce complaint (Saturn abhors verbal entropy). Physical labor or structured exercise 5× weekly.',
  Rahu:    'Reduce screen time before sleep (Rahu obsession amplifier). Engage with foreign culture or language weekly. Ground yourself through nature contact — Rahu needs anchoring in the physical.',
  Ketu:    'Reduce accumulation of possessions. Donate something valuable monthly. Meditate 20 minutes daily — Ketu responds to conscious emptiness. Avoid over-stimulation; embrace simplicity.',
};

const PLANET_KARMIC_SERVICES: Record<string, string> = {
  Sun:     'Serve one person in authority who has been abandoned or disrespected — a retired leader, a forgotten mentor. Sun\'s karmic debt is paid through restoring dignity to those the world has stopped recognizing.',
  Moon:    'Care for one child or elderly person who has no one. Moon\'s debt is paid through unconditional emotional nourishment — not professional care, but personal presence.',
  Mars:    'Teach one physically underprivileged person a skill that requires physical courage or discipline. Mars karma is discharged through enabling others\' strength, not just exercising your own.',
  Mercury: 'Teach literacy, writing, or a technical skill to one underprivileged student weekly. Mercury\'s karmic debt is paid through the dissemination of knowledge to those who cannot access it.',
  Jupiter: 'Offer free wisdom, mentorship, or education to one person weekly who cannot pay for it. Jupiter karma is discharged by giving the teacher\'s gift without transactional expectation.',
  Venus:   'Create beauty for others without recognition — anonymously paint, decorate, cook, or arrange something beautiful for a community space. Venus karma is paid through unconditional aesthetic generosity.',
  Saturn:  'Do physical service for the elderly, disabled, or marginalized — not donation but direct labor. Saturn\'s debt is paid through sweat, not money. One hour weekly minimum.',
  Rahu:    'Serve a community of people who are foreign to your identity — a different culture, religion, or socioeconomic group. Rahu karma is discharged by dissolving the foreign/familiar boundary in service.',
  Ketu:    'Serve in a hospice, grief group, or spiritual community — places of conscious release and transition. Ketu karma is paid through helping others let go.',
};

const PLANET_RITUALS: Record<string, string> = {
  Sun:     'Sunday: fast until noon (one meal after sunset). Offer red flowers and water to the Sun at sunrise. Visit a Sun or Vishnu temple on Sundays. Wear copper or gold.',
  Moon:    'Monday: fast or eat only white foods. Offer white flowers and milk to Shiva or the Moon. Wear silver. Visit a Shiva temple on Mondays.',
  Mars:    'Tuesday: fast (one meal). Offer red flowers and sweets to Hanuman or Kartikeya. Visit Hanuman temple on Tuesdays. Wear red coral only if tested appropriate for your lagna.',
  Mercury: 'Wednesday: fast or reduce food. Green cloth donation to a student. Visit a Vishnu or Budha temple on Wednesday. Avoid signing contracts on Wednesdays during Mercury retrograde.',
  Jupiter: 'Thursday: fast or eat only yellow foods. Offer yellow flowers, turmeric, and sweets to Guru/Vishnu. Visit a Vishnu or Brihaspati temple on Thursdays. Wear yellow.',
  Venus:   'Friday: fast from sunrise to sunset (optional). Offer white or pink flowers to Lakshmi or Devi. Visit a Devi temple on Fridays. Donate sweets or clothing to women.',
  Saturn:  'Saturday: fast or eat sesame-based foods. Offer black sesame and mustard oil to Shani. Visit a Shani temple or light a sesame lamp on Saturdays. Donate black cloth or iron items.',
  Rahu:    'Saturday (or Wednesday night): offer blue flowers and durva grass. Light a lamp of mustard oil. Feed crows (Rahu\'s carrier) on Saturdays. Avoid meat on Saturdays.',
  Ketu:    'Tuesday (or Saturday): offer grey or mixed-color flowers. Light incense of camphor. Donate to spiritual institutions or ashrams. Meditate in a temple or sacred space.',
};

function assembleSixLayerStack(
  weakestPlanet:   string,
  nakshatraFear:   string,
  saturnWound:     string
): SixLayerRemedyStack {
  const planet = weakestPlanet in PLANET_BEHAVIORAL_REMEDIES ? weakestPlanet : 'Saturn';
  const mantraData = PLANET_MANTRAS[planet];

  return {
    planet,
    layer1_behavioral:   PLANET_BEHAVIORAL_REMEDIES[planet] ?? 'Engage daily in the specific domain of the weakest planet with structured, trackable action.',
    layer2_psychological: PLANET_PSYCHOLOGICAL_REMEDIES[planet] ?? `Address the core fear tied to ${planet}'s Nakshatra placement — see Layer 11 Nakshatra fear reframe.`,
    layer3_spiritual:     mantraData
      ? `${mantraData.mantra} — ${mantraData.count}. Timing: ${mantraData.timing}. Mechanism: ${mantraData.mechanism}`
      : `Recite the ${planet} beeja mantra 108× daily at the planet's hora (hour of the day).`,
    layer4_practical:     PLANET_PRACTICAL_REMEDIES[planet] ?? 'Adjust diet, schedule, and environment to support this planet\'s element.',
    layer5_karmic:        PLANET_KARMIC_SERVICES[planet] ?? `Serve the domain governed by ${planet} to discharge karmic debt.`,
    layer6_ritual:        PLANET_RITUALS[planet] ?? `Follow the traditional weekday fast and temple protocol for ${planet}.`,
  };
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────

export interface InterpretationInput {
  queryContext:        QueryContext;
  planets:             PlanetPosition[];
  lagnaRashiIdx:       number;
  shadabala:           ShadabalaResult[];
  shadabalaAnalysis:   ShadabalaAnalysis;
  dasha:               DashaResult;
  yogaAnalysis:        YogaAnalysis;
  jaiminiAnalysis:     JaiminiAnalysis;
  transits:            TransitPosition[];
  aspects:             AspectData[];
  divisional:          DivisionalConfirmation;
  tenthLordName:       string;
  psychologicalProfile: PsychologicalProfile;
  // Optional pre-computed
  lagnaOrMoonNakshatra?: string;
  rahuNakshatra?:       string;
  ketuNakshatra?:       string;
  saturnNakshatra?:     string;
}

/**
 * MASTER ENTRY POINT — Run all 13 layers in strict order.
 *
 * @example
 * const output = runInterpretationEngine({
 *   queryContext: 'career',
 *   planets:      planetData,
 *   lagnaRashiIdx: 3,
 *   shadabala:    shadabalaResult.planets,
 *   ...
 * });
 * console.log(output.thereforeClause.verdict);
 * console.log(output.sixLayerRemedy.layer1_behavioral);
 */
export function runInterpretationEngine(
  input: InterpretationInput
): InterpretationOutput {
  const {
    queryContext, planets, lagnaRashiIdx, shadabala, shadabalaAnalysis,
    dasha, yogaAnalysis, jaiminiAnalysis, transits, aspects,
    divisional, tenthLordName, psychologicalProfile,
  } = input;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getShadabala = (name: string) =>
    shadabala.find(s => s.planet === name)?.totalRupas ?? 0;

  const getPlanet = (name: string) =>
    planets.find(p => p.name === name);

  // ── Layer 2: Shadbala Gate ──────────────────────────────────────────────────
  const weakestPlanet = shadabalaAnalysis.weakestPlanet;
  const weakestRupas  = getShadabala(weakestPlanet);
  const shadabalaGate = {
    weakestPlanet,
    weakestRupas,
    tier: getShadabalaTier(weakestRupas),
  };

  // ── Layer 1: Natal Promise ──────────────────────────────────────────────────
  const QUERY_HOUSES: Record<QueryContext, number[]> = {
    career:      [10, 6, 2, 11],
    marriage:    [7, 2, 8],
    fame:        [10, 11, 1],
    children:    [5, 9],
    health:      [1, 6, 8],
    wealth:      [2, 11, 5],
    spirituality: [9, 12, 8],
    general:     [1],
  };
  const relevantHouses = QUERY_HOUSES[queryContext];
  const relevantPlanets = planets.filter(p => relevantHouses.includes(p.house));
  const relevantShadbala = relevantPlanets.map(p => getShadabala(p.name));
  const avgRelevantStrength = relevantShadbala.length
    ? relevantShadbala.reduce((a,b) => a+b, 0) / relevantShadbala.length
    : 0;

  const natalPromise = {
    promised:   avgRelevantStrength >= 0.75 || relevantPlanets.length >= 2,
    confidence: Math.round(Math.min(100, avgRelevantStrength * 60)),
    reason:     avgRelevantStrength >= 0.75
      ? `${relevantPlanets.length} planet(s) active in ${queryContext} houses with average Shadbala ${avgRelevantStrength.toFixed(2)} rupas.`
      : `Weak planetary presence in ${queryContext} houses — average Shadbala only ${avgRelevantStrength.toFixed(2)} rupas.`,
  };

  // ── Layer 3: Enhanced Yoga Status (v2.1 — uses enhanceYogaAnalysis) ────────
  const { activeLords, label: dashaLabel } = getActiveDashaContext(dasha);
  const md = dasha.currentMahadasha;
  const ad = dasha.currentAntardasha;
  const pd = dasha.currentPratyantardasha;

  // Build Dasha input for enhanceYogaAnalysis
  const activeDashaForYoga = md && ad ? {
    mdLord: md.planet,
    adLord: ad.planet,
    pdLord: pd?.planet,
  } : null;

  // Build Shadbala input (totalRupas array)
  const shadbalaForYoga = shadabala.map(s => ({
    planet: s.planet,
    totalRupas: s.totalRupas,
  }));

  const enrichedYogaAnalysis = enhanceYogaAnalysis(
    yogaAnalysis,
    shadbalaForYoga,
    activeDashaForYoga,
    null // upcomingDashaChange — can be wired later
  );

  const enhancedYogas: EnhancedYogaResult[] = (enrichedYogaAnalysis.enhancedYogas || [])
    .map(yoga => ({
      ...yoga,
      activationDasha: yoga.activationDasha ?? dashaLabel,
    } as EnhancedYogaResult));

  // ── Layer 4: Divisional Synthesis ──────────────────────────────────────────
  const d1Strong  = natalPromise.promised;
  const divStrong = queryContext === 'career'    ? !!divisional.d10_strong :
                    queryContext === 'marriage'   ? !!divisional.d9_strong  :
                    queryContext === 'fame'       ? !!divisional.d10_strong :
                    !!divisional.d9_strong;

  let divisionalSynthesis: string;
  if (d1Strong && divStrong) {
    divisionalSynthesis = `Both D1 and the relevant divisional chart confirm the ${queryContext} promise — full delivery is structurally possible. Name the timing window.`;
  } else if (d1Strong && !divStrong) {
    const verdicts: Record<QueryContext, string> = {
      career:      'The ambition burns brightly, but this incarnation imposes a career ceiling — mastery comes through service to another\'s vision, not independent empire.',
      marriage:    'The wedding happens, but the marriage requires conscious spiritual maturity to survive.',
      fame:        'Visibility without lasting empire; fame arrives but stays regional or collapses without sustained inner work.',
      children:    'The desire for children is real, but conception or parenting requires targeted intervention — medical, spiritual, or both.',
      health:      'The body has reserves, but the divisional weakness signals a vulnerability that needs prevention, not just treatment.',
      wealth:      'The earning capacity exists, but sustainable wealth requires disciplined management that does not currently come naturally.',
      spirituality: 'Spiritual inclination is genuine, but the path needs a living teacher — self-study alone will not be sufficient.',
      general:     'D1 shows promise; divisional confirmation is weak — the event may occur but will require more effort than the natal promise suggests.',
    };
    divisionalSynthesis = `Therefore: ${verdicts[queryContext] ?? 'D1 shows strength, but divisional weakness creates conditional delivery.'}`;
  } else if (!d1Strong && divStrong) {
    const verdicts: Record<QueryContext, string> = {
      career:      'Late bloomer. Early career frustration builds the exact discipline required for mid-life authority.',
      marriage:    'Little early-life support for marriage, but the spouse arrives as a karmic teacher and the bond endures.',
      fame:        'Late fame — the world will find you after 40 or in the final Mahadasha window, not before.',
      children:    'Delayed parenthood — but when children arrive, they carry unusual karmic significance.',
      health:      'Early-life health challenges forge a body that becomes surprisingly resilient later.',
      wealth:      'Delayed financial arrival — the wealth comes, but only after the spiritual lesson of poverty is internalized.',
      spirituality: 'The spiritual path is blocked early by worldly obligations, but the final third of life opens a deep practice.',
      general:     'Late delivery — the event occurs, but not on the native\'s preferred timeline.',
    };
    divisionalSynthesis = `Therefore: ${verdicts[queryContext] ?? 'Divisional strength saves an otherwise weak D1 promise — late but real delivery.'}`;
  } else {
    divisionalSynthesis = `Therefore: Both D1 and the divisional chart are weak for ${queryContext}. The promise is redirected. The native's energy is better channeled toward ${queryContext === 'career' ? 'spiritual or creative service' : queryContext === 'marriage' ? 'self-development and chosen family' : 'an alternative life domain that the chart strongly supports'}.`;
  }

  // ── Layer 5: Weighted Aspects ───────────────────────────────────────────────
  const weightedAspects = aspects.map(a => {
    const planetRupas = getShadabala(a.fromPlanet);
    const baseWeight  = ASPECT_WEIGHTS[a.fromPlanet] ?? ASPECT_WEIGHTS._graha;
    const finalWeight = baseWeight * Math.min(1.5, Math.max(0.5, planetRupas));
    return {
      planet:  a.fromPlanet,
      toHouse: a.toHouse,
      weight:  parseFloat(finalWeight.toFixed(3)),
      note:    getAspectNote(a.fromPlanet, a.toHouse, planetRupas),
    };
  });

  // ── Layer 6: Dasha Level ────────────────────────────────────────────────────
  const mdPlanetIsRelevant = md && (
    relevantHouses.some(h => planets.find(p => p.name === md.planet)?.house === h) ||
    [tenthLordName, 'Jupiter', 'Saturn', 'Rahu'].includes(md.planet)
  );
  const adPlanetIsRelevant = ad && mdPlanetIsRelevant;

  // ── Layer 7: Double Transit Protocol (v2.1 — uses dynamicTransitService) ──
  // Build ServiceTransitData arrays for Jupiter and Saturn from transits
  const jupiterTransitData: ServiceTransitData[] = transits
    .filter(t => t.planet === 'Jupiter')
    .map(t => ({
      planet: t.planet,
      house: t.house,
      aspectsHouse: t.aspectsHouses?.[0],
      isRetrograde: false,
      degrees: 0,
    }));
  const saturnTransitData: ServiceTransitData[] = transits
    .filter(t => t.planet === 'Saturn')
    .map(t => ({
      planet: t.planet,
      house: t.house,
      aspectsHouse: t.aspectsHouses?.[0],
      isRetrograde: false,
      degrees: 0,
    }));

  const doubleTransitV2 = serviceCheckDoubleTransit(
    QUERY_HOUSES[queryContext][0],
    jupiterTransitData,
    saturnTransitData,
    `${queryContext} house (${QUERY_HOUSES[queryContext][0]}th)`
  );

  // Bridge to the local DoubleTransitResult interface for backwards compatibility
  const doubleTransit: DoubleTransitResult = {
    type: doubleTransitV2.type,
    activePlanet: doubleTransitV2.activePlanet,
    label: doubleTransitV2.label,
    certifies: doubleTransitV2.certifies,
    description: doubleTransitV2.description,
  };

  const dashaLevel = resolveDashaLevel(
    weakestRupas,
    natalPromise.promised,
    divStrong,
    !!mdPlanetIsRelevant,
    !!adPlanetIsRelevant,
    doubleTransit.certifies
  );

  const levelTag = `[Level ${dashaLevel}: ${md ? md.planet + ' MD' : 'No active MD'} / ${ad ? ad.planet + ' AD' : 'No active AD'}]`;

  // ── Layer 8: Arudha Psychology (v2.1 — uses jaiminiService) ────────────────
  const arudhaPsychologyRaw = buildArudhaPsychologyFromService(
    jaiminiAnalysis.padaLagna,
    lagnaRashiIdx,
    { currentMahadasha: md ? { planet: md.planet, startDate: md.startDate, endDate: md.endDate } : null }
  );
  const arudhaPsychology: ArudhaPsychologyOutput = {
    alPosition: arudhaPsychologyRaw.alPosition,
    alRashiName: arudhaPsychologyRaw.alRashiName,
    psychologicalMask: arudhaPsychologyRaw.psychologicalMask,
    coreTension: arudhaPsychologyRaw.coreTension,
    narrative: arudhaPsychologyRaw.narrative,
    ulAnalysis: jaiminiAnalysis.upapadaLagna ? `UL in ${jaiminiAnalysis.upapadaLagna.rashiName}: ${jaiminiAnalysis.narrative.relationshipManifestation}` : undefined,
    a10Analysis: jaiminiAnalysis.a10 ? `A10 in ${jaiminiAnalysis.a10.rashiName}: ${jaiminiAnalysis.narrative.careerPerception}` : undefined,
    a4Analysis: jaiminiAnalysis.a4 ? `A4 in ${jaiminiAnalysis.a4.rashiName}: Home/comfort perception through this sign's lens.` : undefined,
  };

  // ── Layer 9: Therefore Clause ───────────────────────────────────────────────
  const thereforeClause = buildThereforeClause(
    queryContext,
    natalPromise.promised,
    natalPromise.reason,
    divisionalSynthesis,
    { name: weakestPlanet, rupas: weakestRupas },
    dashaLevel,
    md && ad ? { md: md.planet, ad: ad.planet } : null,
    doubleTransit
  );

  // ── Layer 10: Failure Mode (v2.1 — uses aiPredictionService) ────────────────
  const neechaBhangaPresent = enhancedYogas.some(y =>
    y.name.toLowerCase().includes('neecha bhanga') && y.status === 'ACTIVE'
  );
  const probabilityResult = serviceCalculateProbability(
    weakestRupas,
    dashaLevel,
    divStrong,
    doubleTransit.certifies,
    neechaBhangaPresent,
    queryContext
  );

  const failureMode: FailureMode = {
    obstruction:           `${weakestPlanet} at ${weakestRupas.toFixed(2)} rupas (${getShadabalaTier(weakestRupas)}) is the single point of failure in this promise chain. ${getShadabalaDelivery(weakestRupas)}.`,
    probabilityWithout:    probabilityResult.withoutRemedy,
    probabilityWith:       probabilityResult.withRemedy,
    interventionTarget:    weakestPlanet,
    interventionRupas:     weakestRupas,
    interventionRationale: `${weakestPlanet} is the weakest link in the ${queryContext} promise chain. Strengthening any other planet will not compensate — this is the specific deficiency that must be targeted. Basis: ${probabilityResult.confidenceBasis}`,
  };

  // ── Layer 12: Six-Layer Remedy Stack (v2.1 — uses remediesService) ──────────
  const serviceRemedyStack = serviceAssembleSixLayerStack({
    weakestPlanet,
    weakestPlanetRupas: weakestRupas,
    nakshatraFear: {
      coreFear: psychologicalProfile.nakshatra_fear.coreFear,
      reframe: psychologicalProfile.nakshatra_fear.reframe,
    },
    saturnWound: psychologicalProfile.saturn_wound_statement.structuralWound,
    queryContext,
  });
  const sixLayerRemedy: SixLayerRemedyStack = {
    planet: serviceRemedyStack.planet,
    layer1_behavioral: serviceRemedyStack.layer1_behavioral,
    layer2_psychological: serviceRemedyStack.layer2_psychological,
    layer3_spiritual: serviceRemedyStack.layer3_spiritual,
    layer4_practical: serviceRemedyStack.layer4_practical,
    layer5_karmic: serviceRemedyStack.layer5_karmic,
    layer6_ritual: serviceRemedyStack.layer6_ritual,
  };

  // ── Executive Verdict ───────────────────────────────────────────────────────
  const executiveVerdict = [
    thereforeClause.verdict,
    `Probability: ${probabilityResult.withoutRemedy}% without remedy → ${probabilityResult.withRemedy}% with targeted ${weakestPlanet} strengthening.`,
    `Basis: ${probabilityResult.confidenceBasis}.`,
    thereforeClause.levelTag,
  ].join(' ');

  // ── Full Report ─────────────────────────────────────────────────────────────
  const fullReport = buildFullReport({
    queryContext, executiveVerdict, enhancedYogas, psychologicalProfile,
    arudhaPsychology, thereforeClause, failureMode, sixLayerRemedy,
    doubleTransit, levelTag, divisionalSynthesis, weightedAspects,
    natalPromise, shadabalaGate, probabilityConfidenceBasis: probabilityResult.confidenceBasis,
  });

  return {
    queryContext,
    timestamp:           new Date().toISOString(),
    natalPromise,
    shadabalaGate,
    enhancedYogas,
    divisionalSynthesis,
    weightedAspects,
    dashaLevel,
    levelTag,
    doubleTransit,
    arudhaPsychology,
    thereforeClause,
    failureMode,
    psychologicalProfile,
    sixLayerRemedy,
    executiveVerdict,
    fullReport,
  };
}

// ─── Full Report Formatter ─────────────────────────────────────────────────────

function buildFullReport(data: {
  queryContext:            QueryContext;
  executiveVerdict:        string;
  enhancedYogas:           EnhancedYogaResult[];
  psychologicalProfile:    PsychologicalProfile;
  arudhaPsychology:        ArudhaPsychologyOutput;
  thereforeClause:         ThereforeClause;
  failureMode:             FailureMode;
  sixLayerRemedy:          SixLayerRemedyStack;
  doubleTransit:           DoubleTransitResult;
  levelTag:                string;
  divisionalSynthesis:     string;
  weightedAspects:         Array<{ planet: string; toHouse: number; weight: number; note: string }>;
  natalPromise:            { promised: boolean; confidence: number; reason: string };
  shadabalaGate:           { weakestPlanet: string; weakestRupas: number; tier: string };
  probabilityConfidenceBasis: string;
}): string {
  const {
    queryContext, executiveVerdict, enhancedYogas, psychologicalProfile,
    arudhaPsychology, thereforeClause, failureMode, sixLayerRemedy,
    doubleTransit, levelTag, divisionalSynthesis, shadabalaGate,
    probabilityConfidenceBasis,
  } = data;

  const lines: string[] = [];

  lines.push(`# VEDIC INTERPRETATION REPORT — ${queryContext.toUpperCase()} [v2.1]`);
  lines.push(`*13-Layer Convergence Architecture | Zero Hedging Policy | "You do not describe charts. You resolve them."*`);
  lines.push(`\n## 1. EXECUTIVE VERDICT\n${executiveVerdict}`);

  lines.push('\n## 2. LAYER-BY-LAYER CONVERGENCE ANALYSIS');
  lines.push(`\n**Layer 1 — Natal Promise** [${data.natalPromise.promised ? '✓ PROMISED' : '✗ NOT PROMISED'}]: ${data.natalPromise.reason}`);
  lines.push(`\n**Layer 2 — Shadbala Gate**: Weakest planet: ${shadabalaGate.weakestPlanet} at ${shadabalaGate.weakestRupas.toFixed(2)} rupas [${shadabalaGate.tier}]`);
  lines.push(`\n**Layer 3 — Active Yogas** (${enhancedYogas.length} detected):`);
  if (enhancedYogas.length === 0) {
    lines.push('- No active yogas found for this query context.');
  } else {
    enhancedYogas.slice(0, 6).forEach(y => {
      lines.push(`- **${y.name}** [${y.status}${y.dashaLevel ? ` L${y.dashaLevel}` : ''}] — ${y.thereforeVerdict}`);
    });
  }
  lines.push(`\n**Layer 4 — Divisional Synthesis**: ${divisionalSynthesis}`);
  lines.push(`\n**Layer 6 — Dasha Level**: ${levelTag}`);
  lines.push(`\n**Layer 7 — Double Transit**: **${doubleTransit.label}** — ${doubleTransit.description}`);

  lines.push('\n## 3. PSYCHOLOGICAL PROFILE (Layer 11 + 8)');
  lines.push(`\n**Nakshatra Fear Architecture**`);
  lines.push(`- Core Fear: ${psychologicalProfile.nakshatra_fear.coreFear}`);
  lines.push(`- Manifestation: ${psychologicalProfile.nakshatra_fear.manifestation}`);
  lines.push(`- Reframe: **${psychologicalProfile.nakshatra_fear.reframe}**`);
  lines.push(`\n**Rahu/Ketu Karmic Statement**: ${psychologicalProfile.rahu_ketu_karmic_statement.paragraph}`);
  lines.push(`\n**Saturn Wound**: ${psychologicalProfile.saturn_wound_statement.paragraph}`);
  lines.push(`\n**Synthesis**: ${psychologicalProfile.synthesis_narrative}`);
  lines.push(`\n**Arudha Psychology (Layer 8)**: ${arudhaPsychology.narrative}`);
  if (arudhaPsychology.ulAnalysis) lines.push(`\n**UL (Marriage Manifestation)**: ${arudhaPsychology.ulAnalysis}`);
  if (arudhaPsychology.a10Analysis) lines.push(`\n**A10 (Career Perception)**: ${arudhaPsychology.a10Analysis}`);
  if (arudhaPsychology.a4Analysis) lines.push(`\n**A4 (Home/Comfort)**: ${arudhaPsychology.a4Analysis}`);

  lines.push('\n## 4. CONFLICT RESOLUTION (Layer 9 — "Therefore:" Clause)');
  lines.push(`**Conflict Identified**: ${thereforeClause.conflict}`);
  lines.push(`**Weighing Mechanism**: ${thereforeClause.weightingLayer}`);
  lines.push(`\n> **${thereforeClause.verdict}**`);

  lines.push('\n## 5. FAILURE MODE & PROBABILITIES (Layer 10)');
  lines.push(`- **Structural Bottleneck**: ${failureMode.obstruction}`);
  lines.push(`- **Probability without remedy**: **${failureMode.probabilityWithout}%**`);
  lines.push(`- **Probability with remedy**: **${failureMode.probabilityWith}%**`);
  lines.push(`- **Single Intervention Target**: ${failureMode.interventionTarget} (${failureMode.interventionRupas.toFixed(2)} rupas)`);
  lines.push(`- **Rationale**: ${failureMode.interventionRationale}`);
  lines.push(`- **Confidence Basis**: ${probabilityConfidenceBasis}`);

  lines.push('\n## 6. SIX-LAYER BEHAVIORAL REMEDY STACK (Layer 12)');
  lines.push(`*Targeting **${sixLayerRemedy.planet}** — the weakest planet in this promise chain. Every layer addresses a different dimension of the same deficiency.*\n`);
  lines.push(`### Layer 1 — Behavioral *(Primary — Do This First)*`);
  lines.push(sixLayerRemedy.layer1_behavioral);
  lines.push(`\n### Layer 2 — Psychological *(Inner Reframe)*`);
  lines.push(sixLayerRemedy.layer2_psychological);
  lines.push(`\n### Layer 3 — Spiritual *(Mantra + Mechanism)*`);
  lines.push(sixLayerRemedy.layer3_spiritual);
  lines.push(`\n### Layer 4 — Practical *(Diet, Lifestyle, Environment)*`);
  lines.push(sixLayerRemedy.layer4_practical);
  lines.push(`\n### Layer 5 — Karmic *(Service to discharge debt)*`);
  lines.push(sixLayerRemedy.layer5_karmic);
  lines.push(`\n### Layer 6 — Ritual *(Temple + Donation Protocol)*`);
  lines.push(sixLayerRemedy.layer6_ritual);

  lines.push('\n---');
  lines.push(`*Generated by Vedic Rajkumar Interpretation Engine v2.1 — 13-Layer Convergence Architecture*`);
  lines.push(`*Zero Hedging Policy | Every verdict is deterministic | "You do not describe charts. You resolve them."*`);

  return lines.join('\n');
}
