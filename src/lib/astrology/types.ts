/**
 * Core Vedic Astrology TypeScript Types
 * Integrated from Vedic-Rajkumar-Enhance master instructions.
 * Covers all chart types, dasha, transit, Arudha, SubjectiveReading,
 * remedies, failure-modes, and psychological archetypes.
 */

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DivisionalChartType =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

export type PlanetDignity =
  | 'Exalted'
  | 'Debilitated'
  | 'OwnSign'
  | 'Friend'
  | 'Neutral'
  | 'Enemy'
  | 'MoolaTrikona';

export type PlanetAvastha = 'Bala' | 'Kumara' | 'Yuva' | 'Vriddha' | 'Mrita';

export type NakshatraName =
  | 'Ashwini'
  | 'Bharani'
  | 'Krittika'
  | 'Rohini'
  | 'Mrigashira'
  | 'Ardra'
  | 'Punarvasu'
  | 'Pushya'
  | 'Ashlesha'
  | 'Magha'
  | 'PurvaPhalguni'
  | 'UttaraPhalguni'
  | 'Hasta'
  | 'Chitra'
  | 'Swati'
  | 'Vishakha'
  | 'Anuradha'
  | 'Jyeshtha'
  | 'Moola'
  | 'PurvaAshadha'
  | 'UttaraAshadha'
  | 'Shravana'
  | 'Dhanishtha'
  | 'Shatabhisha'
  | 'PurvaBhadrapada'
  | 'UttaraBhadrapada'
  | 'Revati';

// ─── Planetary Position ───────────────────────────────────────────────────────

export interface PlanetPosition {
  planet: PlanetName;
  sign: ZodiacSign;
  degree: number; // 0–29.999
  house: HouseNumber;
  retrograde: boolean;
  nakshatra?: NakshatraName;
  nakshatraPada?: 1 | 2 | 3 | 4;
  dignity?: PlanetDignity;
  avastha?: PlanetAvastha;
  vargottama?: boolean;
  combusted?: boolean;
  shadbalaScore?: number; // 0–100
  inGrahaYuddha?: boolean; // Planetary war
  grahaYuddhaWinner?: boolean;
}

// ─── Aspects ─────────────────────────────────────────────────────────────────

export interface Aspect {
  planet: PlanetName;
  house: HouseNumber;
  type: 'Full' | 'Special' | 'Drishti';
  strength: number; // 0–100
}

// ─── House ───────────────────────────────────────────────────────────────────

export interface House {
  number: HouseNumber;
  sign: ZodiacSign;
  lord: PlanetName;
  planets: PlanetPosition[];
  aspects: Aspect[];
  argala?: number; // Net Argala strength
  bindus?: number; // Ashtakavarga bindus
}

// ─── Birth Chart ─────────────────────────────────────────────────────────────

export interface BirthChart {
  lagna: PlanetPosition;
  houses: House[];
  planets: PlanetPosition[];
  chartType: 'D1';
  dateTime: string; // ISO 8601
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
    place: string;
  };
  ayanamsha?: number; // Lahiri ayanamsha value used
  sunrise?: string; // ISO 8601
  sunset?: string; // ISO 8601
  gulikaPosition?: { sign: ZodiacSign; degree: number; house: HouseNumber };
  mandiPosition?: { sign: ZodiacSign; degree: number; house: HouseNumber };
}

// ─── Divisional Chart ────────────────────────────────────────────────────────

export interface DivisionalChart extends Omit<BirthChart, 'chartType'> {
  chartType: DivisionalChartType;
  division: number;
  parentChartReference?: BirthChart;
}

// ─── Arudha Pada ─────────────────────────────────────────────────────────────

export interface BhavaArudha {
  sign: ZodiacSign;
  houseFromLagna: HouseNumber;
  planets: PlanetPosition[];
  signification: string;
}

export interface ArudhaPada {
  arudhaLagna: BhavaArudha;
  bhavaArudhas: Partial<Record<HouseNumber, BhavaArudha>>;
  upapadaLagna?: { sign: ZodiacSign; houseFromLagna: HouseNumber };
  neechaBhanga?: boolean;
}

// ─── Dasha ───────────────────────────────────────────────────────────────────

export interface DashaPeriod {
  mahadasha: PlanetName;
  antardasha?: PlanetName;
  pratyantardasha?: PlanetName;
  startDate: string; // ISO 8601
  endDate: string;
  remainingYears: number;
  dashaLord?: PlanetName;
  isActive?: boolean;
}

// ─── Transit ─────────────────────────────────────────────────────────────────

export interface Transit {
  planet: PlanetName;
  currentSign: ZodiacSign;
  degree: number;
  date: string;
  effect: 'Favorable' | 'Challenging' | 'Neutral';
  bindusInHouse?: number; // Ashtakavarga bindus for transit house
  vedha?: boolean; // Obstruction by another transit planet
}

// ─── Conflict Resolution ─────────────────────────────────────────────────────

export interface ConflictResolution {
  id: string;
  charts: Array<'D1' | 'D9' | 'D10' | 'Arudha' | 'Dasha' | 'Transit' | 'D2' | 'D7'>;
  conflictDescription: string;
  classicalBasis: string;
  synthesis: string;
  practicalAdvice: string;
  confidence: number; // 0–100
}

// ─── Temporal Layering ───────────────────────────────────────────────────────

export interface TemporalLayer {
  lifeArea:
    | 'Marriage'
    | 'Career'
    | 'Wealth'
    | 'Health'
    | 'Spirituality'
    | 'PublicImage'
    | 'Children'
    | 'Education'
    | string;
  timeWindow: string; // e.g. "2028–2030"
  ageRange?: string; // e.g. "Age 34–38"
  dashaActivation: string; // e.g. "Jupiter Mahadasha / Venus Antardasha"
  divisionalTrigger: string;
  transitTrigger?: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
}

// ─── Psychological Archetype ─────────────────────────────────────────────────

export interface PsychologicalArchetype {
  name: string;
  coreTheme: string;
  chartCombination: string; // e.g. "D1 Leo + D9 Scorpio + AL Libra"
  strengths: string[];
  shadow: string;
  growthPath: string;
  culturalResonance: string;
  coreFear: string; // Moon Nakshatra–derived
  coreMotivation: string; // Sun + AK + 10th lord derived
  rahuKetuAxis: string;
  saturnWound: string;
}

// ─── Prescriptive Remedy ──────────────────────────────────────────────────────

export interface PersonalizedRemedy {
  issue: string;
  planetOrHouse: string;
  standardRemedy: string;
  behavioralRemedy: string;
  psychologicalRemedy: string;
  spiritualRemedy: string;
  practicalRemedy: string;
  karmicRemedy?: string;
  ritualRemedy?: string;
  lifestyleRemedy?: string;
  actionItems: string[];
  duration: string;
  expectedOutcome: string;
  spiritualBasis: string;
}

// ─── Failure Mode ────────────────────────────────────────────────────────────

export interface FailureMode {
  risk: string;
  probability: number; // 0–100
  triggers: string[];
  earlyWarningSigns: string[];
  mitigationStrategy: string;
  recoveryStrategy: string;
  opportunityInRisk: string;
}

// ─── Subjective Reading ──────────────────────────────────────────────────────

export interface SubjectiveReading {
  chartId: string;
  generatedAt: string; // ISO 8601
  referenceType?: 'natal' | 'prashna';
  contextNote?: string;
  summary: string;
  overallTone: 'Empowering' | 'Cautionary' | 'Transformative' | 'Balanced';
  confidenceScore: number; // 0–100
  confidenceBand: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  narrative: string;
  conflicts: ConflictResolution[];
  temporalInsights: TemporalLayer[];
  archetype: PsychologicalArchetype;
  remedies: PersonalizedRemedy[];
  risksAndMitigation: FailureMode[];
  keyTakeaways: string[];
  focusAreas: string[];
  recommendedNextSteps: string[];
  classicalReferences: string[];
  chartsUsed: DivisionalChartType[];
}

// ─── Prashna Context ─────────────────────────────────────────────────────────

export interface PrashnaSubjectiveContext {
  question: string;
  classification: string;
  confidence: number;
  suggestedDivisionalFocus: DivisionalChartType[];
  domainHouse: HouseNumber;
  karaka: PlanetName;
  isAmbiguous: boolean;
  clarificationNeeded?: string;
}

// ─── Question Category (enhanced) ────────────────────────────────────────────

export type QuestionDomain =
  | 'marriage'
  | 'relationship'
  | 'career'
  | 'finance'
  | 'health'
  | 'spirituality'
  | 'education'
  | 'travel'
  | 'legal'
  | 'children'
  | 'property'
  | 'timing'
  | 'business'
  | 'inheritance'
  | 'foreign';

export interface AstrologyQuestion {
  id: string;
  question: string;
  question_hi: string;
  answer?: string;
  answer_hi?: string;
  category: QuestionDomain;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedQuestions?: string[];
  followUpPrompts?: string[];
  source?: string; // Classical text reference
  canonicalSlug?: string;
}

// ─── Compatibility (Synastry) ─────────────────────────────────────────────────

export interface SynastryReport {
  personA: string;
  personB: string;
  upapada_compatibility: string;
  darakaraka_compatibility: string;
  nakshatra_compatibility: { taraA: string; taraB: string; score: number };
  rahu_ketu_axis: string;
  psychological_harmony: string;
  friction_areas: string[];
  harmony_areas: string[];
  dasha_asymmetry?: string;
  overall_narrative: string;
  confidence: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface VedicAnalyzeResponse {
  directAnswer: string;
  reasoning: string;
  strongestSupport: string[];
  strongestObstruction: string[];
  manifestationStyle: string;
  timingWindow: string;
  confidence: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  confidenceScore: number;
  remedy: string;
  archetype: string;
  narrative: string;
  classicalReferences: string[];
}

export interface VedicClassifyResponse {
  primaryDomain: QuestionDomain;
  secondaryDomain: QuestionDomain | null;
  confidence: number;
  chartStack: DivisionalChartType[];
  houseFocus: HouseNumber[];
  keywords: string[];
  isAmbiguous: boolean;
  clarificationNeeded: string | null;
  intent: string;
}
