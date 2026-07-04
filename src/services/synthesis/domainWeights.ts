import { SignalLayer, SignalCategory, SynthesisDomain } from './signalTypes';

export const SYNTHESIS_ENGINE_VERSION = 'mvp-0.1.0';

// Weight given to a signal based on which chart layer it comes from.
export const LAYER_WEIGHTS: Record<SynthesisDomain, Record<SignalLayer, number>> = {
  career: {
    D1: 0.24,
    BHAVA: 0.1,
    D10: 0.2,
    D9: 0.08,
    DASHA: 0.16,
    TRANSIT: 0.1,
    YOGA: 0.05,
    SHADBALA: 0.04,
    ASHTAKAVARGA: 0.03,
    ARUDHA: 0.05,
    DIVISIONAL: 0.2,
  },
  marriage: {
    D1: 0.25,
    BHAVA: 0.1,
    D10: 0.0,
    D9: 0.25,
    DASHA: 0.15,
    TRANSIT: 0.1,
    YOGA: 0.05,
    SHADBALA: 0.05,
    ASHTAKAVARGA: 0.03,
    ARUDHA: 0.02,
    DIVISIONAL: 0.25,
  },
  wealth: {
    D1: 0.24,
    BHAVA: 0.1,
    D10: 0.05,
    D9: 0.1,
    DASHA: 0.15,
    TRANSIT: 0.1,
    YOGA: 0.12,
    SHADBALA: 0.06,
    ASHTAKAVARGA: 0.05,
    ARUDHA: 0.03,
    DIVISIONAL: 0.1,
  },
  children: {
    D1: 0.25,
    BHAVA: 0.1,
    D10: 0.0,
    D9: 0.15,
    DASHA: 0.15,
    TRANSIT: 0.1,
    YOGA: 0.05,
    SHADBALA: 0.05,
    ASHTAKAVARGA: 0.05,
    ARUDHA: 0.0,
    DIVISIONAL: 0.15,
  },
  fame: {
    D1: 0.2,
    BHAVA: 0.05,
    D10: 0.15,
    D9: 0.05,
    DASHA: 0.15,
    TRANSIT: 0.1,
    YOGA: 0.15,
    SHADBALA: 0.05,
    ASHTAKAVARGA: 0.02,
    ARUDHA: 0.15,
    DIVISIONAL: 0.15,
  },
};

// Intrinsic relevance multipliers based on signal category
export const CATEGORY_WEIGHTS: Record<SignalCategory, number> = {
  promise: 1.0,
  activation: 1.0,
  obstruction: 1.2, // Obstructions hit harder than supports
  delay: 0.8,
  stability: 0.7,
  visibility: 0.6,
};
