import type { PlanetName, HouseNumber, ZodiacSign, Dignity } from '../../types/astrology';
import type { PlanetData, ShadabalaResult, ShadabalaAnalysis } from '../shadabalaService';
import type { DashaResult } from '../dashaService';
import type { YogaAnalysis } from '../yogaService';
import type { JaiminiAnalysis } from '../jaiminiService';

export type SynthesisDomain = 'career' | 'marriage' | 'wealth' | 'children' | 'fame';

export interface SynthesisRequest {
  chartId?: string;
  domain: SynthesisDomain;
  queryContext?: string; // Optional user question
}

export interface TransitMinimal {
  planet: string;
  house: number;
  aspectsHouses: number[];
}

export interface AspectMinimal {
  fromPlanet: string;
  toHouse: number;
}

export interface AstrologicalContext {
  planets: PlanetData[];
  lagnaRashiIdx: number;
  shadabala: ShadabalaResult[];
  shadabalaAnalysis: ShadabalaAnalysis;
  dasha: DashaResult;
  yogaAnalysis: YogaAnalysis;
  jaiminiAnalysis: JaiminiAnalysis;
  transits: TransitMinimal[];
  aspects: AspectMinimal[];
  tenthLordName: string;
  divisional: {
    d9_strong?: boolean;
    d10_strong?: boolean;
    d60_strong?: boolean;
  };
}

export type SignalLayer =
  | 'D1'
  | 'BHAVA'
  | 'D10'
  | 'D9'
  | 'DASHA'
  | 'TRANSIT'
  | 'YOGA'
  | 'SHADBALA'
  | 'ASHTAKAVARGA'
  | 'ARUDHA'
  | 'DIVISIONAL';
export type SignalCategory =
  | 'promise'
  | 'activation'
  | 'obstruction'
  | 'delay'
  | 'stability'
  | 'visibility';

export interface DomainSignal {
  id: string; // e.g. "D1_10TH_LORD_EXALTED"
  domain: SynthesisDomain;
  layer: SignalLayer;
  category: SignalCategory;
  polarity: 'positive' | 'negative' | 'neutral';
  magnitude: number; // -1.0 to 1.0
  reliability: number; // 0.0 to 1.0 (confidence in this signal)
  timingApplicability: number; // 0.0 to 1.0 (is it active now?)
  description: string; // Human readable explanation
}

export interface WeightedSignal extends DomainSignal {
  relevanceWeight: number; // Applied based on domain config
  effectiveMagnitude: number; // magnitude * reliability * relevanceWeight
}

export interface ScoreVector {
  promise: number; // 0-100
  activation: number; // 0-100
  obstruction: number; // 0-100
  delay: number; // 0-100
  stability: number; // 0-100
  visibility: number; // 0-100
  netProbability: number; // 0-100
  confidence: number; // 0-100
}

export type ContradictionClass =
  | 'promised_not_activated'
  | 'supportive_but_delayed'
  | 'temporary_activation'
  | 'mixed_friction'
  | 'weak_foundation'
  | 'strong_now'
  | 'karmic_battleground';

export interface TraceNode {
  signalId: string;
  layer: SignalLayer;
  category: SignalCategory;
  signedContribution: number;
  explanation: string;
}

export type DashaLevel = 1 | 2 | 3 | 4 | 5;

export interface SynthesisVerdict {
  domain: SynthesisDomain;
  verdictSummary: string; // The "Therefore:" clause
  timingClass: ContradictionClass;
  scores: ScoreVector;
  dashaLevel: DashaLevel;
  levelTag: string;
  topSupportingFactors: string[];
  topObstructingFactors: string[];
  explanationTrace: TraceNode[];
  conciseExplanation: string; // Narrative summary
}
