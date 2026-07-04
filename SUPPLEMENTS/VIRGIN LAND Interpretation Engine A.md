You are the Core Interpretation Engine Architects of Vedic Rajkumar v2.1 — the elite team building the first true synthesis engine in Vedic Astrology software.
Mission (The Virgin Land)
While Jagannath Hora, Parashara Light, Kala, and others excel at data presentation (charts, positions, raw calculations), no software yet delivers genuine interpretive synthesis.
Your job is to conquer this untouched territory:
Convert oceans of classical data — Yogas, Bhavas, Graha Drishti, Shadbala, Arudha Padas, Varga Charts (D1–D60), Transits, Vimshottari Dasha (all levels), Rekhas — into one cumulative, concise, highly accurate, and resolved human verdict for any specific Jatak and query.
Core Differentiator:
We do not show “Jupiter in 5th in D9 and Saturn in 12th in D10.”
We deliver:
“Career in authority roles has 73% probability. 9 of 13 convergence layers strongly support Karma Sthana. However, Saturn’s obstruction in D10 Navamsha delays peak results until after age 42. Single weakest link is Shadbala of 10th lord at 0.68 rupas. Therefore: Mid-life rise after disciplined inner work [Level 4: Jupiter MD 2029–2036].”
Non-Negotiable Principles

Synthesis over Description: Never list possibilities. Always resolve into one forced verdict using strict hierarchical layers.
Cumulative & Concise: Combine Shadbala + Dasha + Divisional + Arudha + Yogas + Aspects + Transits into weighted, multiplicative conclusions.
Honest & Probabilistic: Every major prediction must carry calibrated % probability (without remedy / with remedy) and clear failure mode.
Zero Hedging: Replace “may”, “possible”, “depends” with precise Layer-backed verdicts and “Therefore:” clauses.
Surgical Precision: Always identify the single weakest planet in the promise chain.

The 13-Layer Convergence Architecture (Strict Sequential Order)
Implement strict layered processing (lower layers cannot override higher ones). Build interpretationEngine.ts as the central orchestrator.

Layer 0: Virgin World Fame Filter (0–100 score) — Gate for all fame/legacy queries.
Layer 1: Natal Promise (D1 seed check) — If absent, stop manufacturing hope.
Layer 2: Shadbala Gate — Apply tiers + modifiers (Vargottama, Combustion, Neecha Bhanga) to every planet/yoga. Strength = weakest planet’s modified rupas.
Layer 3: Yoga Activation Status — ACTIVE / EMERGING / LATENT / BROKEN (Shadbala first, then Dasha cross-check).
Layer 4: Divisional Synthesis — Force single verdict (D9/D10/D60 priority). No “both sides” output.
Layer 5: Weighted Aspects (Saturn 1.2×, Jupiter 1.1×, etc.).
Layer 6: Dasha Level 1–5 Tagging — Every sentence gets [Level X: MD/AD/PD detail, timeline].
Layer 7: Double Transit Protocol (Jupiter + Saturn).
Layer 8: Arudha Psychology (AL + UL + A4 + A10 narratives + mask/gap analysis).
Layer 9: “Therefore:” Conflict Resolution — Single unambiguous conclusion.
Layer 10: Failure Mode & Probability Engine — Single weakest planet + X%/Y% calculation.
Layer 11: Psychological Profile (Nakshatra fears + Rahu/Ketu karma + Saturn wound + 3-sentence synthesis).
Layer 12: 6-Layer Diagnostic Remedy Stack (Behavioral → Psychological → Mantra → Practical → Karmic → Ritual) tied to weakest planet.

Layer 13: Virgin World Fame Verdict (only if Layer 0 ≥ 60).
Technical Requirements

Extend existing services (shadabalaService.ts, yogaService.ts, dashaService.ts, jaiminiService.ts, divisionalChartsService.ts, classicalAnswerEngine.ts, etc.) exactly as per INTERPRETATION.md.
Create interpretationEngine.ts as orchestrator.
All outputs must be structured JSON + beautiful rendered Markdown.
Replace all hardcoded tables in aiPredictionService.ts with dynamic Shadbala + Layer-driven logic.
Ensure full integration with current chart data model.

Mandatory Output Structure (Every Reading)

Executive Verdict (2–3 sentences — direct answer + key probabilities)
Layer-by-Layer Convergence Analysis (brief, labeled)
Psychological Profile Object
Virgin World Fame Analysis (if relevant)
Failure Mode & Probabilities (single weakest planet focus)
Six-Layer Remedy Stack (highly specific, not generic)
Dasha Timeline (with Level tags + Double Transit windows)

Tone & Quality Standards

Authoritative, compassionate, unflinching.
Classical depth with modern clarity.
Difficulty = curriculum, not curse.
Always end with actionable path.


Team Directive:
This is the real product — the soul of Vedic Rajkumar. Build this synthesis engine so powerfully that users feel they finally have a wise Guru + master astrologer in their pocket, not just another chart viewer.
You are not implementing features.
You are colonizing the virgin land of true Jyotish interpretation.
Start by creating the interpretationEngine.ts orchestrator that enforces the 13 layers, then enhance each service accordingly.
Now go build it.
xxxxxxxxxxxxxxxxxxxxxxx
ENHANCED classicalAnswerEngine.ts IMPLEMENTATION TEMPLATE
TypeScript// src/services/classicalAnswerEngine.ts
// Vedic Rajkumar v2.1 — Enhanced Classical Answer Engine
// Author: Interpretation Engine Architects
// Status: 13-Layer Convergence Ready

import { ChartData, QueryContext, PlanetPosition, HouseData } from '../types/chartTypes';
import { ShadabalaResult } from './shadabalaService';
import { ActiveDashaSequence } from './dashaService';
import { YogaResult } from './yogaService';
import { PadaLagnaResult } from './jaiminiService';
import { DivisionalSynthesisVerdict } from './divisionalChartsService';
import { DoubleTransitResult } from './dynamicTransitService';

export interface EnhancedTimingWindow {
  label: string;
  dashaLevel: 1 | 2 | 3 | 4 | 5;
  mdLord: string;
  adLord: string;
  pdLord?: string;
  levelTag: string;                    // "[Level 4: Jupiter MD / Saturn AD, 2028–2032]"
  confidence: number;
  doubleTransit?: DoubleTransitResult;
}

export interface ThereforeClause {
  conflict: string;
  weightingLayer: string;
  verdict: string;
  dashaLevel: 1 | 2 | 3 | 4 | 5;
  levelTag: string;
  convergenceScore: number;            // 0–100
}

export interface EnhancedClassicalAnswer {
  directAnswer: string;
  reasoning: string;
  timing: EnhancedTimingWindow[];
  risks: string;
  remediesSummary: string;
  thereforeClause: ThereforeClause;
  psychologicalProfile?: any;          // from Layer 11
  failureMode?: {
    weakestPlanet: string;
    rupas: number;
    tier: string;
    obstruction: string;
    probabilityWithout: number;
    probabilityWith: number;
  };
  convergenceLayers: string[];         // e.g. ["Layer 2: Strong", "Layer 4: Confirmed", ...]
  virginWorldFame?: any;               // if applicable
}

/**
 * MAIN ORCHESTRATOR — Enhanced Classical Answer
 */
export async function generateClassicalAnswer(
  chartData: ChartData,
  queryContext: QueryContext,
  shadabala: ShadabalaResult,
  activeDasha: ActiveDashaSequence,
  yogas: YogaResult[],
  divisionalSynthesis: DivisionalSynthesisVerdict,
  padaLagna: PadaLagnaResult,
  doubleTransit: DoubleTransitResult
): Promise<EnhancedClassicalAnswer> {

  // === LAYER 1–9 PROCESSING (Enforced Hierarchy) ===
  const natalPromise = checkNatalPromise(chartData, queryContext);
  const shadabalaGate = applyShadabalaGate(shadabala, queryContext.domain);
  const yogaStatus = analyzeYogaActivation(yogas, activeDasha, shadabala);
  const divisionalVerdict = divisionalSynthesis.forcedVerdict; // single resolved
  const aspectWeighted = applyAspectWeights(chartData);

  // Layer 9: Therefore Clause (Conflict Resolution)
  const therefore = resolveThereforeClause({
    natalPromise,
    shadabalaGate,
    yogaStatus,
    divisionalVerdict,
    aspectWeighted,
    activeDasha,
    queryContext
  });

  // === BUILD OUTPUT ===
  const answer: EnhancedClassicalAnswer = {
    directAnswer: buildDirectAnswer(queryContext, therefore, shadabalaGate, activeDasha),
    
    reasoning: buildReasoningSection(natalPromise, shadabalaGate, yogaStatus, divisionalVerdict, aspectWeighted),
    
    timing: generateTimingWindows(activeDasha, therefore, doubleTransit),
    
    risks: buildRisksSection(shadabala.weakestPlanet, yogaStatus.brokenYogas),
    
    remediesSummary: "See full 6-Layer Diagnostic Remedy Stack (targeted at " + shadabala.weakestPlanet.name + ")",
    
    thereforeClause: therefore,
    
    failureMode: buildFailureMode(shadabala),
    
    convergenceLayers: generateConvergenceSummary([natalPromise, shadabalaGate, yogaStatus, divisionalVerdict]),
    
    ...(queryContext.domain === 'fame' && { virginWorldFame: calculateVirginFameVerdict(chartData, shadabala, padaLagna) })
  };

  return answer;
}

/* ====================== HELPER FUNCTIONS ====================== */

function checkNatalPromise(chart: ChartData, query: QueryContext) {
  // Implement domain-specific logic (marriage, career, fame, etc.)
  return {
    promised: true,
    confidence: 85,
    reason: "Strong 10th lord in kendra with Jupiter aspect"
  };
}

function applyShadabalaGate(shadabala: ShadabalaResult, domain: string) {
  const keyPlanet = getKeyPlanetForDomain(domain, shadabala);
  return {
    tier: getShadabalaTier(keyPlanet.totalRupas),
    rupas: keyPlanet.totalRupas,
    modifiedRupas: applyModifiers(keyPlanet), // Vargottama, Combustion, etc.
    weakestPlanet: shadabala.weakestPlanet
  };
}

function resolveThereforeClause(inputs: any): ThereforeClause {
  // Layer 9 Core Logic
  let conflict = "";
  let verdict = "";

  if (!inputs.natalPromise.promised) {
    conflict = "Natal promise absent";
    verdict = `The natal chart does not promise this outcome. No Dasha or transit can override the radix.`;
  } else if (inputs.shadabalaGate.modifiedRupas < 0.4) {
    conflict = `Weak Shadbala (${inputs.shadabalaGate.modifiedRupas.toFixed(2)} rupas)`;
    verdict = `${inputs.shadabalaGate.weakestPlanet.name} is too weak to deliver.`;
  } else {
    conflict = "Multiple factors present with minor obstructions";
    verdict = `Strong convergence achieved. Full delivery expected in active Dasha window.`;
  }

  return {
    conflict,
    weightingLayer: "Layer 2 (Shadbala) + Layer 4 (Divisional Synthesis)",
    verdict: `${verdict} Therefore: ${verdict}`,
    dashaLevel: determineDashaLevel(inputs),
    levelTag: `[Level ${determineDashaLevel(inputs)}: ${inputs.activeDasha.mdLord} MD / ${inputs.activeDasha.adLord} AD]`,
    convergenceScore: calculateConvergenceScore(inputs)
  };
}

function generateTimingWindows(
  activeDasha: ActiveDashaSequence,
  therefore: ThereforeClause,
  doubleTransit: DoubleTransitResult
): EnhancedTimingWindow[] {
  return [{
    label: "Primary Activation Window",
    dashaLevel: therefore.dashaLevel,
    mdLord: activeDasha.mdLord,
    adLord: activeDasha.adLord,
    levelTag: therefore.levelTag,
    confidence: 82,
    doubleTransit: doubleTransit
  }];
}

function buildFailureMode(shadabala: ShadabalaResult) {
  const wp = shadabala.weakestPlanet;
  return {
    weakestPlanet: wp.name,
    rupas: wp.totalRupas,
    tier: getShadabalaTier(wp.totalRupas),
    obstruction: `Low Shadbala of ${wp.name} creates friction in the promise chain`,
    probabilityWithout: Math.max(25, Math.round(wp.totalRupas * 35)),
    probabilityWith: Math.min(92, Math.round(wp.totalRupas * 35) + 28)
  };
}

function getShadabalaTier(rupas: number): string {
  if (rupas >= 2.0) return "EXTREMELY STRONG";
  if (rupas >= 1.25) return "STRONG";
  if (rupas >= 0.75) return "MODERATE";
  if (rupas >= 0.40) return "WEAK";
  return "EXTREMELY WEAK";
}

function applyModifiers(planet: any): number {
  let score = planet.totalRupas;
  if (planet.isVargottama) score *= 1.25;
  if (planet.isCombust) score *= 0.70;
  // Neecha Bhanga logic...
  return Math.min(3.5, score);
}

function determineDashaLevel(inputs: any): 1 | 2 | 3 | 4 | 5 {
  // Implement full logic based on Layer 6 criteria
  if (inputs.shadabalaGate.modifiedRupas >= 1.25 && inputs.doubleTransit?.type?.includes('DOUBLE')) 
    return 5;
  if (inputs.shadabalaGate.modifiedRupas >= 0.75) return 4;
  return 3;
}

function calculateConvergenceScore(inputs: any): number {
  let score = 60;
  if (inputs.natalPromise.promised) score += 15;
  if (inputs.shadabalaGate.modifiedRupas >= 1.0) score += 15;
  // ... more factors
  return Math.min(98, score);
}

// Additional builders (directAnswer, reasoning, etc.) — implement similarly with rich templates

export default {
  generateClassicalAnswer
};

Key Enhancements Included:

Full ThereforeClause with conflict resolution (Layer 9)
EnhancedTimingWindow with Dasha Level tags (Layer 6)
Failure Mode block with probabilities and weakest planet (Layer 10)
Integration points for all other services
Strict Layer enforcement
Ready for interpretationEngine.ts to call as the final synthesizer


Next Steps Recommendation:
Would you like me to now provide:

The full interpretationEngine.ts orchestrator (the brain that calls everything in sequence)?
virginWorldFameService.ts (Layer 0 + 13)?
TypeScript interfaces / types file?
Or the 6-Layer Remedy Stack implementation in remediesService.ts?
xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
THE GRAND PROMPT
PROJECT: COGNITIVE JYOTISH SYNTHESIS ENGINE (CJSE)
Mission

Build the world’s first multi-layer Jyotish synthesis intelligence engine that does NOT merely display astrological data, but produces:

cumulative convergence analysis,
weighted interpretive synthesis,
contradiction resolution,
probabilistic forecasting,
temporal unfolding,
confidence scoring,
and concise human-readable verdicts.

The engine must emulate how a great Jyotishi thinks — not how software lists data.

CORE PHILOSOPHY

Current astrology software behaves like:

“Database viewers.”

We are building:

“A reasoning organism.”

Existing software shows:

planets,
houses,
yogas,
dashas,
divisional charts,
strengths.

But NO software truly answers:

“Among 11,000 possible indications, what ACTUALLY dominates this native’s lived reality?”

That is our problem statement.

THE REAL CHALLENGE

Jyotish interpretation is NOT additive.

It is:

hierarchical,
contextual,
recursive,
contradictory,
time-sensitive,
and probabilistic.

Example:

A strong Raja Yoga:

may fail due to weak Navamsha,
revive in D10,
delay through Saturn,
activate only in Jupiter-Saturn period,
manifest after Arudha reinforcement,
and produce recognition without happiness due to afflicted Moon.

Traditional software cannot synthesize this.

We must.

OBJECTIVE

Create an engine that can answer questions like:

Example Output
Career Verdict

Probability Strength: 78%

Convergence Layers:

D1 Karma Bhava strong
D10 Lagna reinforced
Saturn exalted in karma axis
Amatyakaraka powerful
Jupiter aspects 10th
Arudha A10 elevated

Obstruction Layers:

Saturn delays materialization
Dasha activation postponed until age 41
Weak Moon reduces satisfaction despite status

Temporal Conclusion:

Rise begins: 36–38
Recognition phase: 42–56
Peak authority after Saturn maturity

Confidence Score:
82%

Dominant Archetype:
“Late-rise institutional authority.”

THIS is the engine.

SYSTEM REQUIREMENTS

The engine must synthesize across:

Foundational Layers
D1
All divisional charts (D2–D60)
Bhava analysis
Yogas
Avasthas
Ashtakavarga
Shadbala
Ishta/Kashta
Rekhas
Arudha
Jaimini Karakas
Argala
Aspects
Combustion
Retrogression
Planetary war
Nakshatra
Pada
Dasha systems
Transits
Annual charts
Tajika if needed
MOST IMPORTANT PRINCIPLE
EVERY FACTOR MUST HAVE:
1. DOMAIN

Example:

career,
marriage,
spirituality,
wealth,
children,
authority,
renunciation.
2. WEIGHT

Not all factors are equal.

Example:

D10 stronger than D7 for career.
Mahadasha stronger than transit.
Karaka stronger than minor yoga.

Weights must be dynamic.

3. RELIABILITY SCORE

Some combinations are noisy.

Example:

small yoga from one text = weak reliability
repeated convergence across D1+D9+D10 = high reliability
4. ACTIVATION CONDITION

A yoga existing is NOT enough.

It must activate through:

dasha,
transit,
maturity,
divisional resonance,
age windows,
trigger combinations.
ENGINE ARCHITECTURE
LAYER 1 — RAW COMPUTATION ENGINE

Generate:

all charts,
all yogas,
all strengths,
all classical combinations.

NO interpretation yet.

LAYER 2 — SEMANTIC TAGGING ENGINE

Every factor gets tagged.

Example:

{
  "factor": "Saturn exalted in D10",
  "domains": ["career", "authority", "institution"],
  "strength": 0.82,
  "nature": "delayed_positive",
  "activation_age": [36, 42],
  "confidence": 0.91
}
LAYER 3 — CONVERGENCE ENGINE

This is the real invention.

The engine asks:

Which themes repeat MOST?

Not:

“How many yogas exist?”

But:

“Which life outcome receives the highest multi-layer reinforcement?”

This layer detects:

reinforcement,
contradiction,
cancellation,
delay,
mutation,
transformation.
CRITICAL RULE

Five weak indicators ≠ one dominant indicator.

But:

repeated independent confirmations
across unrelated systems
create high confidence.

This is “cross-system convergence.”

LAYER 4 — CONTRADICTION RESOLUTION

Example:

Raja Yoga exists
but Moon weak
Saturn obstructs
D9 damaged

Conclusion should NOT be:
“Great king.”

Instead:
“Capable of status, but psychological fulfillment compromised.”

This layer separates:

achievement,
happiness,
visibility,
wealth,
inner satisfaction.

No existing software truly does this.

LAYER 5 — TEMPORAL ENGINE

Life unfolds in time.

The engine must determine:

WHEN results manifest,
WHEN blocked,
WHEN reversed,
WHEN peak periods occur.

Time synthesis combines:

dasha,
transit,
maturity,
divisional activation,
age cycles.
LAYER 6 — NARRATIVE SYNTHESIS ENGINE

Convert machine convergence into:

concise,
non-generic,
high-density interpretive language.

BAD:

“You may face some ups and downs.”

GOOD:

“Authority rises slowly through institutional structures; recognition comes later than effort.”

The output must sound:

precise,
insightful,
compressed,
psychologically intelligent.
KEY SCIENTIFIC GOAL

We are NOT predicting fate.

We are calculating:

“Symbolic probability convergence.”

The engine estimates:

likelihood,
timing,
intensity,
stability,
and contradiction.
EXTREMELY IMPORTANT

The engine must avoid:

Barnum statements,
vague generic astrology,
mystical fluff,
deterministic absolutism.

Instead:

measurable convergence,
explainable reasoning,
transparent synthesis.
NEXT-GENERATION FEATURES
1. Confidence Index

How reliable is the interpretation?

2. Contradiction Meter

How internally conflicted is the chart?

3. Destiny Dominance Map

Which domains dominate the incarnation?

4. Karma Compression Index

How concentrated is life purpose?

5. Timeline Graph

Visual rise/fall probability over life.

6. Yogas That Actually Matter

Not all yogas should be shown.

Rank them by:

activation,
strength,
reinforcement,
relevance.
AI REQUIREMENT

Large Language Models must NOT hallucinate.

LLMs should ONLY:

verbalize,
summarize,
explain.

Core logic MUST remain:

deterministic,
auditable,
rule-based.

AI is the narrator.

NOT the astrologer.

THE VIRGIN LAND

The unsolved problem in Jyotish software is:

“How do thousands of symbolic indicators collapse into one lived human reality?”

That is the frontier.

That is the research problem.

That is the invention.

FINAL VISION

Build a system that can eventually say:

“Among 18,000 computed astrological factors, 71 converge toward institutional authority, delayed rise, intellectual karma, and public respect after midlife. Emotional fulfillment remains secondary to duty.”

If your engine can do THAT consistently,

you will have created:

the first true synthesis-based Jyotish intelligence system in history.
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
You are not building another Vedic astrology dashboard.

You are building the first serious Jyotish Synthesis Engine.

The existing ecosystem—Jagannath Hora, Kala, Parashara Light, and most modern apps—already calculates and displays positions, charts, dashas, yogas, strengths, aspects, and transits. That problem is solved. Display is solved. Calculation is solved.

The unsolved problem is synthesis.

A real astrologer does not read one placement at a time. A real astrologer mentally integrates:
- Rashi chart
- Divisional charts
- Arudha layers
- Bhava shifts
- Yogas and yoga cancellations
- Graha bala / shadbala
- Ashtakavarga / rekha / bindu support
- Dasha + antardasha + pratyantardasha
- Transit triggers
- Planetary maturity / timing windows
- Functional benefic/malefic behavior
- House lordship logic
- Argala / aspects / avasthas / dignity / combustion / retrogression
- Context of the specific question about the specific jatak

Current software shows ingredients.
We must build the verdict engine.

MISSION
Create a cumulative, concise, explainable, and accuracy-oriented methodology that transforms multi-layer Jyotish data into a single convergence verdict for a given life domain, event, or timing question.

The product must answer questions like:
- Career rise probability: 73%
- Marriage realization window: medium-high probability between age 31.4 and 34.2
- Wealth growth: strong accumulation potential, but cashflow instability during Saturn-Mercury
- Children prospects: supportive promise in natal and saptamsha but delayed by transit and dasha friction
- Spirituality vs worldly success: strong moksha pull, but karma axis dominates until midlife

This is not generic text generation.
This is structured astrological reasoning.

CORE PRODUCT THESIS
We are creating the “convergence layer” that no Jyotish software currently delivers:
1. Aggregate signals from many astrological layers
2. Weight them by relevance, reliability, and timing
3. Detect reinforcement, contradiction, cancellation, and delay
4. Produce a confidence score and explanatory chain
5. Separate natal promise from timing activation
6. Show not just what is present, but what is dominant
7. Output a verdict that is concise enough for users and rigorous enough for advanced astrologers

NON-NEGOTIABLE PRINCIPLES
1. No black-box mysticism.
Every verdict must be explainable.

2. No shallow LLM fluff.
Language generation happens only after structured reasoning.

3. No equal weighting of all layers.
Different questions need different chart hierarchies.

4. No single-indicator conclusions.
No “Jupiter in 5th therefore good” nonsense.

5. No confusion between promise and trigger.
Natal promise, supportive periods, and event manifestation must be separately modeled.

6. No verbosity as a substitute for intelligence.
The engine must be cumulative and concise.

THE GRAND CHALLENGE
Design a formal methodology for cumulative Jyotish synthesis.

We need a system that, for any query domain such as career, marriage, children, health, wealth, status, spirituality, foreign settlement, litigation, or education, can do the following:

STEP 1 — QUESTION NORMALIZATION
Convert user query into a structured interpretation target.

Example:
“Will this native achieve major career rise?”
becomes:
- domain: career
- outcome types: rise, stability, authority, recognition, income, delay, obstruction
- primary houses: 10, 6, 2, 11, 1
- secondary houses: 5, 9, 7
- negative houses/factors: 8, 12, affliction to 10th lord, Saturnine delay, Rahu distortion, dasha mismatch

STEP 2 — RELEVANCE MAP
For each domain, define relevance across:
- Rashi
- Bhava chart
- D9
- D10
- D7
- D12
- D24
- D60 if used
- Arudha / AL / A10 / relevant padas
- Shadbala / Ishta-Kashta
- Ashtakavarga
- Yogas
- Dasha layers
- Transit layers
- Special classical conditions

This must not be static across all questions.
Career should privilege D10 and A10 more than marriage.
Marriage should privilege 7th, Venus/Jupiter, D9, UL, and timing convergence.
Children should privilege 5th, Jupiter, D7, putrakaraka logic, and supportive activation periods.

STEP 3 — SIGNAL EXTRACTION
For each layer, extract atomic signals such as:
- house strength
- lord strength
- karaka strength
- occupancy and aspect quality
- dignity
- conjunction effect
- cancellation or redemption
- benefic/malefic pressure
- yoga support
- avastha or special state
- shadbala support
- ashtakavarga support
- dasha resonance
- transit activation or obstruction

Each signal must have:
- label
- source layer
- polarity: positive / negative / mixed
- strength score
- reliability score
- timing applicability
- interpretive note
- explainability trace

STEP 4 — CONVERGENCE ENGINE
Build a weighted synthesis model.

The engine must determine:
- how many layers support the proposition
- how many oppose it
- how many delay rather than deny it
- which layers are primary vs secondary
- which signals are redundant and should be merged
- which signals dominate due to question context
- whether contradictions are true contradictions or time-separated effects

This engine should output:
- base promise score
- activation score
- obstruction score
- delay score
- volatility score
- net convergence score
- confidence score
- explanation chain

Example:
Career success:
- Natal promise: 81/100
- Timing activation: 64/100
- Obstruction/delay: 52/100
- Net manifestation probability next 5 years: 72/100
- Confidence: high
- Interpretation: strong promise, moderate delay, late consolidation, recognition after repeated Saturn filtering

STEP 5 — PROMISE VS TIMING MODEL
Separate three layers:
A. Natal potential
B. Period activation
C. Real-world manifestation window

This is essential.
Many charts show promise without timing.
Many periods activate weak promise but produce temporary events.
The engine must distinguish:
- promised
- activated
- manifested
- delayed
- denied
- partially realized
- realized after obstruction

STEP 6 — CONTRADICTION RESOLUTION
If D1 is strong but D10 is weak, or if yogas support success while dasha does not activate, the system must resolve the contradiction intelligently.

Possible resolution classes:
- strong promise, weak timing
- weak promise, temporary rise
- success with delay
- success with instability
- public success, private strain
- material gain, emotional loss
- event happens but below expected scale
- result after age threshold / maturity threshold

Do not average contradictions blindly.
Model them.

STEP 7 — EXPLAINABLE OUTPUT LAYER
Final output must be human-usable.

For each question, produce:
1. one-line verdict
2. probability score
3. confidence score
4. supportive factors
5. obstructive factors
6. delay/cancellation notes
7. timing window
8. why this verdict was chosen over alternatives
9. what would need to improve for verdict confidence to rise

OUTPUT STYLE EXAMPLE
Verdict:
High probability of meaningful career rise, but not smooth rise.

Probability:
73%

Confidence:
High

Why:
9 of 13 relevant layers support a strong karma outcome.
D10, 10th lord dignity, and A10 visibility are favorable.
However, Saturn-linked obstruction appears repeatedly in timing layers and divisional reinforcement, showing delay, pressure, or slower recognition rather than denial.

Timing:
Best activation windows occur when dasha resonance and transit to the karma axis coincide.
Before that, effort may exceed visible reward.

Interpretive class:
Promised strongly. Activated moderately. Manifested gradually.

METHODOLOGY DELIVERABLES REQUIRED
The team must produce the following:

1. A formal scoring ontology
Define all score types, ranges, meanings, and interaction rules.

2. A domain ontology
Career, marriage, health, wealth, children, education, spirituality, foreign residence, litigation, fame, property, siblings, parents, longevity.

3. A chart-priority matrix
Which charts/layers matter most for which domain.

4. A contradiction-resolution framework
A deterministic method for reconciling conflicting signals.

5. A timing framework
How dasha, transit, and natal promise interact.

6. A confidence framework
Confidence must reflect data convergence, not model ego.

7. An explanation graph
Every verdict must be traceable to source factors.

8. A concise report grammar
Outputs must be sharp, not bloated.

TECHNICAL ARCHITECTURE DIRECTION
Recommended pipeline:

Layer 1: Calculation Engine
Raw planetary data, charts, dignities, aspects, houses, dashas, transits, yogas, strengths.

Layer 2: Signal Engine
Convert raw computed states into structured astrological signals.

Layer 3: Domain Mapper
Map signals to question-specific domains.

Layer 4: Synthesis Engine
Aggregate, weight, resolve, rank, and score.

Layer 5: Explanation Engine
Generate reason chains and evidence traces.

Layer 6: Narrative Generator
Convert structured verdict into polished but concise human language.

Important:
Narrative generation must never invent reasoning.
It may only verbalize structured synthesis outputs.

SCORE DESIGN REQUIREMENTS
Do not use a single monolithic score.
Use multiple orthogonal scores:
- promise score
- support score
- obstruction score
- delay score
- activation score
- stability score
- visibility score
- sustainability score
- confidence score

Then derive a final verdict score from these.

We are not building a horoscope chatbot.
We are building a disciplined astrological inference engine.

USER TRUST REQUIREMENT
The engine must be able to show:
- which factors mattered most
- which factors were ignored or downweighted
- why one factor overruled another
- whether the result is stable or fragile
- whether the outcome is denied, delayed, partial, cyclical, or strong

This is the difference between software display and software judgment.

RESEARCH REQUIREMENT
Team must ground methodology in:
- classical Jyotish logic
- practical astrologer reasoning patterns
- repeatable scoring methods
- falsifiable test cases
- known chart examples across domains

Create benchmark sets:
- clear success charts
- delayed success charts
- denied marriage charts
- late marriage charts
- wealth with stress charts
- spiritual rise with material compromise charts
- foreign settlement with return charts

Test whether the engine’s verdicts match expert human synthesis.

SUCCESS CONDITION
We succeed only if an experienced astrologer says:
“This does not merely show me chart data. It actually reasons across layers and reaches a defensible cumulative conclusion.”

FAILURE CONDITION
We fail if:
- outputs are just prettier summaries
- scores are untraceable
- contradictory layers are flattened into mush
- timing is mixed with natal promise
- explanations sound intelligent but cannot be audited

YOUR TASK
Design the complete methodology, architecture, scoring logic, data structures, contradiction handling, and output schema for this Jyotish Synthesis Engine.

Do not give generic product advice.
Do not give motivational language.
Do not give UI suggestions first.

Start with:
1. the conceptual model
2. the scoring framework
3. the domain-to-chart priority matrix
4. the synthesis algorithm
5. the contradiction-resolution strategy
6. the explainability model
7. the MVP scope
8. the testing framework
9. the phased roadmap from MVP to world-class engine

Build the system that finally answers:
“Given all relevant layers for this specific jatak, what is the most likely real-world verdict, with what confidence, why, and when?”
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# PRD: Jyotish Synthesis Engine MVP for [Vedic Rajkumar](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar)

## 1. Product Summary

[Vedic Rajkumar](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar) already claims strong astrological breadth: birth chart analysis, divisional charts, multiple dasha systems, 500+ yogas, Ashtakavarga, Varshaphal, transit calculations, Swiss Ephemeris accuracy, AI-powered insights, and report export. That means the next product leap should not be “more data shown,” but “better judgment from the data.” [Source](https://raw.githubusercontent.com/CRAJKUMARSINGH/Vedic_Rajkumar/main/README.md)

This PRD defines an MVP for a **Jyotish Synthesis Engine**: a layer that converts multi-chart, multi-factor astrological inputs into a single explainable verdict for a specific question such as career, marriage, wealth, or children.

---

## 2. Problem Statement

Current astrology software is good at:
- calculating planetary positions
- rendering charts
- listing yogas
- showing dasha and transit data
- generating descriptive reports

But it is weak at:
- weighing conflicting signals
- separating natal promise from timing
- identifying delay vs denial
- explaining why one factor matters more than another
- giving a cumulative domain verdict with confidence

Users and astrologers are forced to mentally synthesize many fragments themselves.

### Core problem
The system shows **ingredients**, but not a **defensible convergence verdict**.

---

## 3. Product Vision

Build the first practical, explainable **Jyotish convergence engine** that answers:

> “Given all relevant layers for this specific jatak and this specific question, what is the most likely real-world verdict, with what confidence, why, and when?”

---

## 4. Goal of the MVP

Deliver a usable first version that can produce structured, explainable synthesis for a small set of high-value domains using existing calculation modules.

### MVP Goal
For a selected life domain, the engine should:
1. collect relevant signals from existing astrological layers
2. score support, obstruction, delay, and activation
3. output a concise verdict
4. provide confidence and explanation trace
5. distinguish promise from timing

---

## 5. Non-Goals for MVP

The MVP will **not** aim to:
- cover every house, yoga, varga, or classical rule
- fully automate expert-level freeform consultation
- support every user question in open-ended natural language
- replace astrologers in edge-case or rare-rule situations
- deliver “accuracy” claims without benchmark validation
- generate long narrative reports by default

---

## 6. Target Users

### Primary users
- serious Jyotish learners
- practicing astrologers
- advanced astrology software users comparing multiple tools
- power users who want judgment, not just display

### Secondary users
- curious end users who want a clear answer to one question
- internal research/testing team validating engine quality

---

## 7. MVP Scope

### In scope
The MVP will support:
- **4 domains only**:
  1. Career
  2. Marriage
  3. Wealth
  4. Children

- **Core input layers**:
  - D1 / Rashi
  - Bhava / house logic
  - D9
  - D10 for career
  - D7 for children
  - major dasha + antardasha
  - current transit layer
  - yoga support
  - basic planetary strength inputs
  - Ashtakavarga support where available

- **Output structure**:
  - verdict
  - probability score
  - confidence score
  - promise score
  - activation score
  - obstruction/delay notes
  - top supporting factors
  - top obstructing factors
  - timing window
  - short explanation

### Out of scope for MVP
- D60-heavy interpretation
- Arudha-based advanced synthesis across all domains
- Tajika/Varshaphal integration into main engine
- remedial recommendations
- voice consultation mode
- multilingual reasoning parity
- event-date precision claims

---

## 8. Product Principles

1. **Explainability first**  
   Every verdict must be traceable to chart factors.

2. **Structure before language**  
   Scoring and reasoning happen before text generation.

3. **Domain-specific weighting**  
   Career and marriage cannot use the same weighting model.

4. **Promise ≠ timing**  
   Natal potential and current activation must remain separate.

5. **Delay is not denial**  
   Contradictions must be classified, not flattened.

6. **Concise by design**  
   Output should be sharp and cumulative, not bloated.

---

## 9. User Jobs to Be Done

- “I want the software to tell me the overall career picture, not dump 20 scattered indicators.”
- “I want to know whether marriage is promised, delayed, obstructed, or denied.”
- “I want a confidence-backed verdict instead of vague positive/negative language.”
- “I want to see why the engine reached that conclusion.”
- “I want timing windows linked to dasha and transit, not random optimism.”

---

## 10. Core Features

## Feature 1: Domain-Based Synthesis Query
User selects a domain such as Career, Marriage, Wealth, or Children and receives a domain-specific verdict.

### Why it matters
Removes generic report sprawl and forces focused interpretation.

---

## Feature 2: Signal Extraction Layer
System converts raw astrological data into normalized signals such as:
- strong 10th lord
- afflicted 7th house
- D9 reinforcement
- dasha mismatch
- transit activation
- Ashtakavarga support

Each signal includes:
- source layer
- polarity
- strength
- relevance
- timing applicability

---

## Feature 3: Weighted Convergence Scoring
System computes:
- Promise Score
- Activation Score
- Obstruction Score
- Delay Score
- Net Verdict Score
- Confidence Score

---

## Feature 4: Contradiction Resolution
System identifies patterns such as:
- strong promise, weak timing
- event likely, but delayed
- event possible, but unstable
- temporary rise without long-term support

---

## Feature 5: Explainable Verdict Output
Every result includes:
- one-line verdict
- score
- confidence
- top 3 supportive factors
- top 3 obstructive factors
- timing interpretation
- explanation trace

---

## Feature 6: Evidence Panel
Advanced users can expand a section to see:
- which charts contributed
- which factors were downweighted
- why one layer overruled another

---

## 11. MVP Functional Requirements

### FR1. Domain selection
The user must be able to choose one supported interpretation domain.

### FR2. Domain-specific relevance map
The system must load a domain-specific weighting template.

### FR3. Signal normalization
The system must transform raw chart logic into structured signals.

### FR4. Weighted scoring
The system must calculate separate sub-scores rather than one monolithic score.

### FR5. Verdict generation
The system must generate a concise final verdict from structured scores.

### FR6. Timing interpretation
The system must output whether the result is currently activated, delayed, or not well-supported in present periods.

### FR7. Explanation trace
The system must show at least the top supporting and obstructing reasons.

### FR8. Graceful uncertainty
When convergence is weak, the system must say confidence is low instead of fabricating certainty.

---

## 12. User Stories with Acceptance Criteria

## Epic A: Ask a focused life-domain question

### User Story A1
As a user, I want to choose a life domain so that the engine interprets only relevant layers.

**Acceptance Criteria**
- User can select Career, Marriage, Wealth, or Children.
- The selected domain changes the weighting logic.
- The output title clearly reflects the chosen domain.
- Irrelevant domain commentary is excluded from the top-level verdict.

---

## Epic B: Get a cumulative verdict

### User Story B1
As a user, I want one clear verdict so I do not have to synthesize multiple chart fragments myself.

**Acceptance Criteria**
- The result includes a one-line verdict.
- The result includes a numeric probability or score.
- The result includes a confidence label.
- The verdict is concise, under a defined character/word limit for the summary line.

### User Story B2
As a user, I want the system to distinguish promise from timing.

**Acceptance Criteria**
- Output displays Promise Score and Activation Score separately.
- If natal promise is strong but timing is weak, the narrative reflects that distinction.
- If activation is strong but underlying promise is weak, the narrative reflects temporary/unstable manifestation.

---

## Epic C: Understand why the engine concluded that

### User Story C1
As an advanced user, I want to see the main supportive factors.

**Acceptance Criteria**
- At least 3 top positive factors are listed when available.
- Each factor references its source layer, such as D1, D9, D10, dasha, or transit.
- Factors are phrased in user-readable language.

### User Story C2
As an advanced user, I want to see the main obstructive factors.

**Acceptance Criteria**
- At least 3 top negative or delaying factors are listed when available.
- Factors differentiate obstruction, delay, and instability where possible.
- Contradictory factors are not hidden.

### User Story C3
As an advanced user, I want a trace view so I can audit the reasoning.

**Acceptance Criteria**
- A trace/evidence section is available.
- It lists contributing layers and their relative impact.
- It shows if a factor was downweighted or overridden.

---

## Epic D: Get timing insight

### User Story D1
As a user, I want to know whether the outcome is currently activated.

**Acceptance Criteria**
- Output includes a timing section.
- Timing references current dasha/antardasha and transit contribution.
- Timing is expressed as favorable / mixed / weak / delayed or equivalent structured classes.
- If precise timing is not supported, the system avoids false specificity.

---

## Epic E: Trust the system more

### User Story E1
As a user, I want a confidence score so I know whether the result is strongly convergent or weakly inferred.

**Acceptance Criteria**
- Output includes a confidence score or class.
- Confidence is based on signal convergence, not only total positive score.
- High contradiction reduces confidence.
- Sparse data or missing supporting layers lower confidence.

---

## 13. Example MVP Output Schema

```json
{
  "domain": "career",
  "verdict_summary": "High probability of meaningful career rise, but with delay and pressure.",
  "probability_score": 73,
  "confidence_score": 81,
  "promise_score": 84,
  "activation_score": 62,
  "obstruction_score": 49,
  "delay_score": 58,
  "timing_class": "supportive_but_delayed",
  "top_supporting_factors": [
    "10th lord strong in D1",
    "D10 reinforces karma potential",
    "Current dasha partially activates career houses"
  ],
  "top_obstructing_factors": [
    "Saturn influence delays recognition",
    "Transit creates slower visible payoff",
    "One divisional layer weakens immediate consolidation"
  ],
  "explanation_trace": [
    {
      "layer": "D1",
      "signal": "10th lord strong",
      "impact": "high",
      "polarity": "positive"
    }
  ]
}
```

---

## 14. Core UX Requirements for MVP

- User selects one domain.
- System returns one compact card plus expandable evidence.
- Summary must be readable in under 20 seconds.
- Advanced trace must be available in under 2 clicks/taps.
- The engine must never dump raw calculation tables as the default result.

---

## 15. Acceptance Criteria for the MVP Release

The MVP is considered launch-ready only if all below are true:

1. It supports all 4 selected domains.
2. It uses domain-specific weighting.
3. It outputs separate promise and activation scores.
4. It surfaces supportive and obstructive factors.
5. It gives a confidence label or score.
6. It avoids hallucinated certainty under weak convergence.
7. Internal reviewers can inspect evidence trace for each verdict.
8. Benchmark charts show materially better synthesis usefulness than raw display-only output.

---

## 16. Success Metrics

## Product Metrics
- **Interpretation completion rate**: % of users who finish a synthesis query after opening it
- **Repeat usage rate**: % of users who run 2+ synthesis queries in one session
- **Feature adoption**: % of chart users who open synthesis mode
- **Evidence panel open rate**: % of users who inspect reasoning trace

## Quality Metrics
- **Expert agreement rate**: % of MVP verdicts judged directionally correct by human astrologers
- **Contradiction handling score**: reviewer rating on whether delay/denial/partial manifestation was handled well
- **Explainability score**: reviewer rating that reasons are understandable and auditable
- **Narrative precision score**: % of outputs rated “concise and not bloated”

## Business Metrics
- **Upgrade/conversion lift** from synthesis-enabled users
- **Retention lift** among advanced astrology users
- **Reduction in support questions** like “What does all this mean together?”

## Recommended initial targets
- 40%+ of active chart users try synthesis mode
- 25%+ of synthesis users run a second query in same session
- 70%+ expert directional agreement on benchmark charts
- 80%+ reviewer agreement that outputs are “more useful than display-only reports”

---

## 17. Benchmarking and Validation Plan

Before public launch, test the MVP on curated chart sets:

- clear career success
- delayed career success
- weak marriage timing
- late marriage with eventual realization
- wealth growth with instability
- children promise with delay

### Validation process
- Have 2–3 expert astrologers rate each output on:
  - directional correctness
  - handling of contradiction
  - clarity
  - usefulness
- Compare against baseline display-only report flow.
- Track whether synthesis reduces interpretation effort.

---

## 18. Risks

### Risk 1: False precision
Users may interpret scores as scientific certainty.

**Mitigation**  
Use confidence framing and avoid over-specific predictions.

### Risk 2: Overweighting one chart
The engine may become simplistic if D1 or one divisional chart dominates too often.

**Mitigation**  
Use domain-specific weighting and benchmark contradictions.

### Risk 3: Verbose AI output
Narrative layer may dilute structured reasoning.

**Mitigation**  
Generate from strict schema only.

### Risk 4: Expert disagreement
Astrology experts may disagree on weighting rules.

**Mitigation**  
Start with explicit methodology versioning and benchmark reviews.

---

## 19. Dependencies

This MVP assumes the existing platform already provides the calculation backbone for:
- planetary positions
- chart generation
- divisional chart logic
- dasha logic
- transit logic
- yoga identification
- strength-related inputs
- report/rendering capabilities [Source](https://raw.githubusercontent.com/CRAJKUMARSINGH/Vedic_Rajkumar/main/README.md)

---

## 20. MVP Release Plan

### Phase 1: Internal prototype
- one domain only: Career
- manual weight tables
- fixed output schema
- internal benchmark testing

### Phase 2: MVP beta
- add Marriage, Wealth, Children
- evidence panel
- confidence scoring
- contradiction classes

### Phase 3: Public MVP
- polished UI
- benchmark-backed methodology notes
- feedback capture
- prompt/logic refinement

---

## 21. Final Product Requirement Statement

The MVP must prove one thing:

> [Vedic Rajkumar](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar) can move from “showing astrological data” to “delivering explainable cumulative judgment” on top of its existing calculation stack. The product already claims broad astrological modules and AI-powered insights; the MVP should convert those assets into a focused synthesis layer that is domain-specific, explainable, auditable, and genuinely useful. [Source](https://raw.githubusercontent.com/CRAJKUMARSINGH/Vedic_Rajkumar/main/README.md)

$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
Absolutely — here is **Option B + C**: a **system prompt for the AI interpretation engine** plus a **technical architecture spec** designed to fit your current Vedic Rajkumar codebase.

Your repo already looks ideal for this leap because it is not missing calculations; it already has deep service modularity across dasha, divisional charts, ashtakavarga, shadbala, yogas, transit correlation, AI prediction, question analysis, and interpretation, while the UI layer is clearly extensive through dashboards, cards, and report pages. That strongly suggests the product gap is not “feature breadth,” but a new synthesis layer above the existing services. [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/services) [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/components)

Your current stack also supports this direction cleanly: React + TypeScript + Vite on the frontend, Supabase for data, React Query for orchestration, and `swisseph-wasm` plus astronomy libraries for calculations. That makes a typed, explainable scoring engine very feasible without rewriting the platform. [Source](https://raw.githubusercontent.com/CRAJKUMARSINGH/Vedic_Rajkumar/main/package.json)

---

# B. System Prompt for the Jyotish Interpretation Engine

Use this as the **core system prompt** for the engine that sits above your existing astrology services.

```text
You are the Jyotish Synthesis Engine for Vedic Rajkumar.

Your role is not to display astrological data and not to generate generic horoscope text.
Your role is to convert structured astrological signals into a cumulative, concise, explainable verdict for a specific life domain and timing question.

## Mission
Given a specific jatak and a specific question, determine:
1. what is promised in the natal structure
2. what is activated in the current period
3. what is obstructed, delayed, unstable, or cancelled
4. what the most likely real-world verdict is
5. how confident the system should be
6. why that verdict was selected over competing interpretations

## Golden Rule
Never infer from a single placement when the question requires multi-layer synthesis.
Always reason cumulatively.

## What You Must Do
For each interpretation:
- read all provided structured inputs
- identify relevant layers for the selected domain
- weight those layers according to domain relevance
- separate natal promise from timing activation
- distinguish delay from denial
- distinguish temporary activation from durable manifestation
- resolve contradictions explicitly
- produce a concise verdict with evidence

## What You Must Not Do
Do not:
- dump raw chart data
- produce fluffy spiritual language without evidence
- give equal importance to all layers
- confuse D1 indication with final event manifestation
- treat transit alone as destiny
- hide contradictions
- fabricate certainty when convergence is weak
- invent rules not present in the structured input or rule base

## Interpretation Domains
Supported domains may include:
- career
- marriage
- wealth
- children
- health
- education
- spirituality
- foreign settlement
- status/fame
- property

Always interpret within the selected domain. Do not broaden unless explicitly asked.

## Required Reasoning Order
Follow this exact order:

### Step 1: Normalize the question
Convert the user’s question into:
- domain
- target outcome
- primary houses
- secondary houses
- key karakas
- key divisional charts
- key timing factors
- key negative/obstructive factors

### Step 2: Establish relevance hierarchy
Rank the input layers for this question.
Example:
- career: D1, 10th house/lord, 6th, 2nd, 11th, D10, A10, dasha, transit
- marriage: 7th, Venus/Jupiter, D9, UL if available, dasha, transit
- children: 5th, Jupiter, D7, putra-related factors, dasha, transit
- wealth: 2nd, 11th, 9th, 5th, D1, D9, relevant dashas, transit, yoga support

### Step 3: Extract signal meaning
For each provided signal:
- classify polarity: supportive, obstructive, mixed, neutral
- estimate interpretive strength: low, medium, high, very high
- estimate timing applicability: natal-only, active-now, future-active, background-only
- estimate reliability: strong, moderate, weak based on convergence and source importance

### Step 4: Score separately
Maintain separate internal score tracks:
- promise_score
- activation_score
- obstruction_score
- delay_score
- stability_score
- visibility_score
- confidence_score

Never collapse everything into a single score too early.

### Step 5: Resolve contradictions
When factors conflict, classify the contradiction into one of these:
- strong promise, weak timing
- weak promise, temporary activation
- success with delay
- success with instability
- public success, private strain
- partial realization
- denial despite some support
- mixed outcome across phases of life

Explain which stronger factors overruled weaker ones.

### Step 6: Produce final verdict
Your final answer must include:
1. verdict_summary
2. probability_score
3. confidence_score
4. promise_assessment
5. timing_assessment
6. top_supporting_factors
7. top_obstructing_factors
8. contradiction_resolution
9. timing_window_or_class
10. concise_explanation

## Scoring Semantics
Use these meanings:
- promise_score: how strongly the natal structure supports the outcome
- activation_score: how strongly current or queried timing factors activate the outcome
- obstruction_score: how strongly friction, affliction, or mismatch resists manifestation
- delay_score: how strongly timing indicates postponement rather than denial
- stability_score: how durable the outcome is once manifested
- visibility_score: how externally noticeable or socially recognized the outcome is
- confidence_score: how strongly the layers converge on one interpretation

## Confidence Logic
High confidence requires:
- multiple relevant layers converging
- low ambiguity in contradiction resolution
- timing factors consistent with natal promise
- no major gaps in required data

Lower confidence when:
- key layers are missing
- major layers conflict sharply
- support depends on too few signals
- timing contradicts natal promise without resolution

## Style Requirements
Your answer must be:
- concise
- cumulative
- specific
- explainable
- free of repetitive astrology jargon

Avoid long essay form.
Prioritize sharp synthesis over verbosity.

## Output Schema
Return output in this structure:

{
  "domain": "",
  "verdict_summary": "",
  "probability_score": 0,
  "confidence_score": 0,
  "promise_score": 0,
  "activation_score": 0,
  "obstruction_score": 0,
  "delay_score": 0,
  "stability_score": 0,
  "visibility_score": 0,
  "timing_class": "",
  "promise_assessment": "",
  "timing_assessment": "",
  "contradiction_resolution": "",
  "top_supporting_factors": [
    {
      "factor": "",
      "layer": "",
      "impact": "high|medium|low",
      "reason": ""
    }
  ],
  "top_obstructing_factors": [
    {
      "factor": "",
      "layer": "",
      "impact": "high|medium|low",
      "reason": ""
    }
  ],
  "explanation_trace": [
    {
      "layer": "",
      "signal_id": "",
      "polarity": "",
      "weight": 0,
      "effect_on": ["promise", "activation", "delay", "obstruction", "stability", "visibility"],
      "reason": ""
    }
  ],
  "concise_explanation": ""
}

## Final Behavioral Rule
If the chart shows support but timing is weak, say “promised but not strongly activated.”
If timing is active but natal support is weak, say “possible temporary manifestation but not strongly sustained.”
If obstruction is high but support exists, prefer “delayed” over “denied” unless denial is strongly indicated by convergence.
If convergence is poor, reduce confidence instead of sounding confident.
```

---

# C. Technical Architecture Spec for the Jyotish Synthesis Engine

## 1. Architecture Objective

Build a **new reasoning layer** above the current calculation and display stack. The repo already contains many relevant service modules such as `interpretationEngine.ts`, `aiPredictionService.ts`, `dashaGocharaCorrelationService.ts`, `questionAnalysisService.ts`, `ashtakavargaService.ts`, `shadabalaService.ts`, `divisionalChartsService.ts`, `vimshottariDashaService.ts`, `yogaService.ts`, and `classicalAnswerEngine.ts`, which means the architecture should **reuse and normalize** rather than replace existing logic. [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/services)

## 2. Design Principle

The correct architecture is:

**Calculation Services → Signal Extraction → Domain Weighting → Scoring → Contradiction Resolution → Explanation Trace → Narrative Rendering**

That is the missing step between your current engine and a true synthesis product.

---

## 3. Proposed Module Layout

Create a new folder:

```text
src/services/synthesis/
```

Recommended files:

```text
src/services/synthesis/
  synthesisEngine.ts
  domainOntology.ts
  domainWeights.ts
  signalExtractor.ts
  signalTypes.ts
  scoringEngine.ts
  contradictionResolver.ts
  timingEngine.ts
  confidenceEngine.ts
  explanationEngine.ts
  narrativeAdapter.ts
  verdictSchema.ts
  benchmarkEngine.ts
```

### Why this structure
Your repo is already highly service-oriented, so the synthesis layer should stay consistent with the existing pattern instead of introducing a separate architectural style. [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/services)

---

## 4. Integration with Existing Codebase

## 4.1 Existing services to reuse

Use existing modules as upstream providers:

- `divisionalChartsService.ts`
- `dashaService.ts`
- `vimshottariDashaService.ts`
- `dynamicTransitService.ts`
- `dashaGocharaCorrelationService.ts`
- `ashtakavargaService.ts`
- `enhancedAshtakavargaService.ts`
- `shadabalaService.ts`
- `aspectsService.ts`
- `yogaService.ts`
- `yogaExtendedService.ts`
- `interpretationEngine.ts`
- `questionAnalysisService.ts`
- `aiPredictionService.ts`
- `careerAstrologyService.ts`
- `marriageService.ts`
- `financialAstrologyService.ts`
- `progenyRules.ts` [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/services)

## 4.2 Existing UI surfaces to integrate into

Best candidates:
- `AIPredictionsPage.tsx`
- `ComprehensiveReportPage.tsx`
- possibly domain pages such as `CareerAstrology.tsx`, `VedicMarriagePage.tsx`, `FinancialAstrologyPage.tsx`, `MahadashaChildrenPage.tsx` [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/pages)

### Recommendation
For MVP, mount the synthesis workflow in:
1. **AIPredictionsPage** for discovery
2. **ComprehensiveReportPage** for deep result presentation

---

## 5. Core Data Contracts

## 5.1 Input Context

```ts
export type SynthesisDomain =
  | "career"
  | "marriage"
  | "wealth"
  | "children";

export interface SynthesisRequest {
  userId?: string;
  chartId: string;
  domain: SynthesisDomain;
  question?: string;
  birthContext: {
    date: string;
    time: string;
    location: string;
    ayanamsa?: string;
  };
  queryContext: {
    currentDate?: string;
    timeHorizon?: "current" | "1y" | "3y" | "5y";
  };
}
```

## 5.2 Unified Astrological Context

```ts
export interface AstrologicalContext {
  d1: ChartSnapshot;
  bhava: BhavaSnapshot;
  divisionalCharts: Partial<Record<"D7" | "D9" | "D10", ChartSnapshot>>;
  dasha: DashaSnapshot;
  transit: TransitSnapshot;
  yogas: YogaHit[];
  ashtakavarga?: AshtakavargaSnapshot;
  shadbala?: ShadbalaSnapshot;
  aspects?: AspectSnapshot[];
  arudha?: Partial<ArudhaSnapshot>;
}
```

## 5.3 Normalized Signal

```ts
export interface DomainSignal {
  id: string;
  domain: SynthesisDomain;
  layer:
    | "D1"
    | "BHAVA"
    | "D7"
    | "D9"
    | "D10"
    | "DASHA"
    | "TRANSIT"
    | "YOGA"
    | "ASHTAKAVARGA"
    | "SHADBALA"
    | "ARUDHA";
  category:
    | "house_strength"
    | "lord_strength"
    | "karaka_strength"
    | "timing_activation"
    | "obstruction"
    | "delay"
    | "stability"
    | "visibility"
    | "yoga_support"
    | "cancellation";
  polarity: "positive" | "negative" | "mixed" | "neutral";
  magnitude: number;      // -1.0 to +1.0
  reliability: number;    // 0.0 to 1.0
  timingApplicability: number; // 0.0 to 1.0
  relevanceWeight: number; // filled later by domain mapper
  description: string;
  ruleRef?: string;
  metadata?: Record<string, unknown>;
}
```

## 5.4 Score Vector

```ts
export interface ScoreVector {
  promise: number;      // 0-100
  activation: number;   // 0-100
  obstruction: number;  // 0-100
  delay: number;        // 0-100
  stability: number;    // 0-100
  visibility: number;   // 0-100
  confidence: number;   // 0-100
  netProbability: number; // 0-100
}
```

## 5.5 Verdict Object

```ts
export interface SynthesisVerdict {
  domain: SynthesisDomain;
  verdictSummary: string;
  timingClass:
    | "strong_now"
    | "supportive_but_delayed"
    | "promised_not_activated"
    | "temporary_activation"
    | "mixed"
    | "weak";
  scores: ScoreVector;
  contradictionResolution: string;
  promiseAssessment: string;
  timingAssessment: string;
  topSupportingFactors: VerdictFactor[];
  topObstructingFactors: VerdictFactor[];
  explanationTrace: TraceNode[];
  conciseExplanation: string;
}
```

---

## 6. Domain Ontology for MVP

## 6.1 Career

Primary houses: 10, 6, 2, 11, 1  
Secondary houses: 5, 9, 7  
Important charts: D1, D10, D9  
Important indicators: 10th lord, Saturn, Sun, Mercury, karma yogas, visibility indicators, dasha activation, transit to 10th axis

## 6.2 Marriage

Primary houses: 7, 2, 11  
Secondary houses: 1, 5, 8, 12  
Important charts: D1, D9  
Important indicators: 7th lord, Venus, Jupiter, affliction patterns, sustaining factors, dasha resonance, transit to relationship axis

## 6.3 Wealth

Primary houses: 2, 11, 9, 5  
Secondary houses: 1, 10, 8  
Important charts: D1, D9  
Important indicators: dhan yogas, 2nd/11th lord strength, stability vs volatility, dasha, transit, ashtakavarga support

## 6.4 Children

Primary houses: 5, 2, 9  
Secondary houses: 1, 7, 11  
Important charts: D1, D7, D9  
Important indicators: 5th lord, Jupiter, progeny rules, supportive dasha, transit to putra axis, obstruction/delay factors

---

## 7. Domain Weight Matrix

These are **MVP defaults**. They should be config-driven, not hard-coded in logic.

```ts
export const DOMAIN_WEIGHTS = {
  career: {
    D1: 0.24,
    BHAVA: 0.10,
    D10: 0.20,
    D9: 0.08,
    DASHA: 0.16,
    TRANSIT: 0.10,
    YOGA: 0.05,
    SHADBALA: 0.04,
    ASHTAKAVARGA: 0.03
  },
  marriage: {
    D1: 0.25,
    BHAVA: 0.10,
    D9: 0.22,
    DASHA: 0.16,
    TRANSIT: 0.10,
    YOGA: 0.06,
    SHADBALA: 0.05,
    ASHTAKAVARGA: 0.03,
    ARUDHA: 0.03
  },
  wealth: {
    D1: 0.24,
    BHAVA: 0.10,
    D9: 0.10,
    DASHA: 0.16,
    TRANSIT: 0.10,
    YOGA: 0.10,
    SHADBALA: 0.08,
    ASHTAKAVARGA: 0.08,
    D10: 0.04
  },
  children: {
    D1: 0.24,
    BHAVA: 0.10,
    D7: 0.22,
    D9: 0.08,
    DASHA: 0.16,
    TRANSIT: 0.10,
    YOGA: 0.05,
    SHADBALA: 0.03,
    ASHTAKAVARGA: 0.02
  }
} as const;
```

### Why config-driven weights
Expert disagreement is inevitable in Jyotish. Putting weights in configuration allows research iteration without rewriting core logic.

---

## 8. Signal Extraction Layer

This is the most important layer after calculations.

### Input
Raw outputs from existing services.

### Output
A flat list of normalized `DomainSignal` objects.

### Example extraction rules

#### Career examples
- strong 10th lord in D1 → positive promise
- strong D10 karma lord → positive promise + stability
- current dasha connected to 10/6/11 → activation
- Saturn obstructing karma axis → delay
- 10th-house ashtakavarga strength → support
- public visibility yoga → visibility

#### Marriage examples
- afflicted 7th lord → obstruction
- strong D9 spouse axis → promise
- favorable Venus/Jupiter period → activation
- transit obstruction with natal support → delay, not denial

### Pseudocode

```ts
const signals: DomainSignal[] = [];

if (isStrongTenthLord(d1)) {
  signals.push(makeSignal({
    domain: "career",
    layer: "D1",
    category: "lord_strength",
    polarity: "positive",
    magnitude: 0.82,
    reliability: 0.85,
    timingApplicability: 0.55,
    description: "10th lord is strong in natal framework"
  }));
}
```

---

## 9. Scoring Engine

Do not use one score. Use a vector.

## 9.1 Per-signal weighted contribution

For each signal:

```ts
effectiveWeight =
  domainLayerWeight *
  signal.reliability *
  signal.timingApplicabilityAdjusted *
  categoryWeight;
```

Where `timingApplicabilityAdjusted` depends on whether the score being computed is promise, activation, delay, etc.

## 9.2 Core equations

### Promise
Measures natal support independent of current timing.

```ts
promise =
  normalize(
    positiveNatalSupport
    - negativeNatalDamage * 0.7
    - cancellationPenalty * 0.5
  );
```

### Activation
Measures current/near-term manifestation potential.

```ts
activation =
  normalize(
    dashaActivation * 0.55 +
    transitActivation * 0.30 +
    timingResonance * 0.15
  );
```

### Obstruction
Measures direct resistance.

```ts
obstruction =
  normalize(
    afflictionSignals +
    mismatchSignals +
    cancellationSignals
  );
```

### Delay
Measures postponement rather than denial.

```ts
delay =
  normalize(
    saturnineDelay +
    timingMismatch +
    repeatedDeferredManifestationIndicators
  );
```

### Stability
Measures sustainability after manifestation.

```ts
stability =
  normalize(
    enduringSupport +
    repetitionAcrossLayers -
    volatilityFactors
  );
```

### Visibility
Measures public recognizability.

```ts
visibility =
  normalize(
    arudhaSupport +
    10th/11th/public-axis support +
    recognition yogas
  );
```

## 9.3 Net probability formula

Use a derived formula, not a raw sum:

```ts
netProbability =
  clamp(
    promise * 0.38 +
    activation * 0.27 +
    stability * 0.12 +
    visibility * 0.08 -
    obstruction * 0.10 -
    delay * 0.05,
    0,
    100
  );
```

This gives promise the highest importance while still preventing false optimism when timing and obstruction disagree.

---

## 10. Contradiction Resolver

This module is what makes the engine special.

### Input
Score vector + top contradictory signals

### Output
A contradiction class + narrative explanation

## Resolver logic

### Case A
`promise >= 70` and `activation < 45`
→ **promised_not_activated**

### Case B
`promise >= 70` and `obstruction >= 60` and `delay >= 55`
→ **supportive_but_delayed**

### Case C
`activation >= 70` and `promise < 50`
→ **temporary_activation**

### Case D
`promise between 50-70` and `obstruction between 45-65`
→ **mixed**

### Case E
`promise < 40` and `activation < 45`
→ **weak**

### Output examples
- “Strong natal promise, but current timing is not sufficiently supportive.”
- “Outcome is supported, but repeated Saturn-linked friction suggests delay rather than denial.”
- “Current activation exists, but long-term structural support is limited.”

---

## 11. Confidence Engine

Confidence must be computed separately from probability.

## Confidence factors
- number of independent layers supporting same conclusion
- consistency between D1 and key varga
- coherence between natal promise and timing layers
- magnitude gap between top conclusion and second-best interpretation
- signal coverage completeness

### Example formula

```ts
confidence =
  clamp(
    convergenceScore * 0.40 +
    dataCoverageScore * 0.20 +
    contradictionClarityScore * 0.20 +
    layerAgreementScore * 0.20,
    0,
    100
  );
```

### Important rule
A chart can have:
- **high probability, moderate confidence**
- **moderate probability, high confidence**
- **good promise, low confidence**

That separation builds trust.

---

## 12. Timing Engine

This engine should not try to do exact dates in MVP.

### MVP timing outputs
- strong_now
- supportive_but_delayed
- building_phase
- activation_window_opening
- weak_current_support
- temporary_spike

### Timing inputs
- current mahadasha / antardasha
- relevant house/lord resonance
- transit activation to domain houses/lords/karakas
- dasha-gochara correlation service outputs

Your repo already appears to include dedicated correlation logic, which is an excellent upstream input for this module. [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/services)

---

## 13. Explanation Engine

This module turns machine scoring into auditable reasoning.

### Responsibilities
- select top 3 support signals
- select top 3 obstruction signals
- explain overridden factors
- expose evidence trace
- produce concise human-readable sentences from structured logic

### Trace node example

```ts
export interface TraceNode {
  signalId: string;
  layer: string;
  category: string;
  signedContribution: number;
  impactedScores: Array<
    "promise" | "activation" | "obstruction" | "delay" | "stability" | "visibility"
  >;
  explanation: string;
}
```

---

## 14. Narrative Adapter

This is not the reasoning engine. It is the verbalizer.

### Input
Only structured verdict object.

### Output
Human-readable result card.

### Rule
The narrative adapter may **rephrase**, but may not invent new astrological logic.

---

## 15. Service Orchestration Flow

```text
Synthesis Request
   ↓
Question Analyzer
   ↓
Astrological Context Aggregator
   ↓
Signal Extractor
   ↓
Domain Weight Mapper
   ↓
Scoring Engine
   ↓
Contradiction Resolver
   ↓
Confidence Engine
   ↓
Explanation Engine
   ↓
Narrative Adapter
   ↓
Synthesis Verdict
```

---

## 16. Example Orchestrator

```ts
export async function runSynthesis(
  request: SynthesisRequest
): Promise<SynthesisVerdict> {
  const normalizedQuestion = normalizeQuestion(request);

  const context = await buildAstrologicalContext(request);

  const signals = extractSignals(context, normalizedQuestion);

  const weightedSignals = applyDomainWeights(
    signals,
    normalizedQuestion.domain
  );

  const scores = computeScores(weightedSignals, normalizedQuestion);

  const contradiction = resolveContradictions(scores, weightedSignals);

  const confidence = computeConfidence(weightedSignals, scores, contradiction);

  const explanation = buildExplanation(weightedSignals, scores, contradiction);

  return buildVerdict({
    domain: normalizedQuestion.domain,
    scores: { ...scores, confidence },
    contradiction,
    explanation
  });
}
```

---

## 17. API Surface

If you want to keep MVP simple, this can remain a frontend service call chain in TypeScript. But the better medium-term architecture is to expose it via a single orchestrated service interface.

### Option 1: Frontend service orchestration
Pros:
- fastest MVP
- matches current repo style

Cons:
- harder to benchmark centrally
- more difficult to version logic

### Option 2: Supabase Edge Function / backend orchestration
Pros:
- centralized scoring versions
- easier benchmarking
- cleaner audit trail
- easier premium API later

### Recommendation
Start with **frontend TypeScript orchestration**, but design all contracts as if they will later move to a backend function.

---

## 18. Persistence Model

Add a `synthesis_runs` table in Supabase.

### Suggested schema

```sql
create table synthesis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  chart_id text not null,
  domain text not null,
  question text null,
  engine_version text not null,
  request_json jsonb not null,
  context_json jsonb not null,
  signals_json jsonb not null,
  scores_json jsonb not null,
  verdict_json jsonb not null,
  created_at timestamptz default now()
);
```

### Why persist
This gives you:
- benchmarkability
- explainability audits
- regression testing
- “why did the verdict change?” analysis

---

## 19. UI Contract

Given your current page inventory, the cleanest UI is:

### Entry point
`AIPredictionsPage.tsx`

### Full result surface
`ComprehensiveReportPage.tsx`

### Result widgets
Create:
- `SynthesisVerdictCard.tsx`
- `SynthesisScorePanel.tsx`
- `SynthesisEvidencePanel.tsx`
- `SynthesisTimingCard.tsx`
- `SynthesisTraceDrawer.tsx`

Your repo already leans heavily on cards and dashboards, so this will fit naturally with the existing UX language. [Source](https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar/tree/main/src/components)

---

## 20. MVP Build Order

## Phase 1
Career-only synthesis
- D1
- D10
- dasha
- transit
- yoga
- shadbala
- ashtakavarga
- manual weight table

## Phase 2
Add marriage and wealth

## Phase 3
Add children

## Phase 4
Benchmarking, calibration, confidence tuning

---

## 21. Test Strategy

Your package already includes Vitest and test scripts, so the synthesis engine should be introduced with strict typed tests and benchmark fixtures. [Source](https://raw.githubusercontent.com/CRAJKUMARSINGH/Vedic_Rajkumar/main/package.json)

### Test categories

#### Unit tests
- signal extraction rules
- scoring formulas
- contradiction classes
- confidence calculation

#### Fixture tests
Use curated charts with expected direction:
- strong career rise
- delayed marriage
- unstable wealth
- progeny promise with delay

#### Regression tests
For each engine version:
- same input must produce stable output unless rule version changes

#### Expert review tests
Export verdict + trace for astrologer review

---

## 22. Versioning Strategy

Version the methodology explicitly:

```ts
export const SYNTHESIS_ENGINE_VERSION = "mvp-0.1.0";
```

Every saved run should store:
- engine version
- domain weights version
- rule set version

This is crucial because astrology logic tuning will evolve.

---

## 23. What Makes This Architecture Different

Most astrology software has:
- chart engine
- report engine
- display engine

This architecture adds:
- signal normalization
- domain weighting
- contradiction modeling
- confidence computation
- explainable convergence verdict

That is the actual product moat.

---

# My blunt recommendation

If your team wants maximum leverage, build in this order:

**1. `signalExtractor.ts`**  
**2. `domainWeights.ts`**  
**3. `scoringEngine.ts`**  
**4. `contradictionResolver.ts`**  
**5. `explanationEngine.ts`**  
**6. UI integration**

If you get those six right, the rest is polish.

---

If you want, I can do the next two artifacts immediately:

### 1. **Jira-ready engineering breakdown**
Epics, stories, subtasks, dependencies, and sprint sequence.

### 2. **Concrete TypeScript starter package**
I can draft the actual code skeletons for:
- `signalTypes.ts`
- `domainWeights.ts`
- `scoringEngine.ts`
- `contradictionResolver.ts`
- `synthesisEngine.ts`

$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$