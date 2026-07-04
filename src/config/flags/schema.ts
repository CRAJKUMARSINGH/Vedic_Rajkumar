/**
 * Feature Flag Schema
 * TRI-HYBRID MERGE v4.0 — Vedic_Rajkumar
 *
 * Every merged or new feature is toggleable here.
 * Default = BASE behaviour (safe fallback — "No Nuksan").
 *
 * Sources:
 *   BASE  — production system (Vedic_Rajkumar)
 *   APP00 — REFERENCE-APP00 (innovation set A)
 *   APP01 — REFERENCE-APP01 (innovation set B)
 *   NEW   — Vedic-Transit-Analysis (new features)
 *   HYBRID — best-of-all synthesis
 */

export type FlagType = 'boolean' | 'enum' | 'number';
export type FlagSource = 'BASE' | 'APP00' | 'APP01' | 'NEW' | 'HYBRID';

export interface FlagDefinition {
  type: FlagType;
  default: boolean | string | number;
  values?: string[]; // for enum type only
  description: string;
  source: FlagSource;
  rollbackTo?: string; // flag name to fall back to if this is disabled
}

export const FLAG_SCHEMA: Record<string, FlagDefinition> = {
  // NEW FEATURE: Question / Prashna Analysis
  ENABLE_QUESTION_ANALYSIS: {
    type: 'boolean',
    default: true,
    description: 'Enable Question/Prashna analysis page (classical Prasna Marga)',
    source: 'NEW',
    rollbackTo: undefined,
  },

  QUESTION_MODE: {
    type: 'enum',
    values: ['prasna', 'natal_transit', 'hybrid'],
    default: 'hybrid',
    description: 'Question analysis mode: pure Prasna | natal+transit | hybrid',
    source: 'NEW',
  },

  // HYBRID: Behavior learning (future)
  ENABLE_BEHAVIOR_LEARNING: {
    type: 'boolean',
    default: false,
    description: 'Enable behavior-based ranking improvements (experimental)',
    source: 'HYBRID',
  },

  BEHAVIOR_WEIGHT: {
    type: 'number',
    default: 0.2,
    description: 'Weight of behavior signals in ranking (0.0-0.3 max)',
    source: 'HYBRID',
  },

  // HYBRID: AI Reasoning
  ENABLE_AI_REASONING: {
    type: 'boolean',
    default: false,
    description: 'Enable AI-powered reasoning layer for predictions',
    source: 'HYBRID',
  },

  // APP00: Enhanced search
  ENABLE_APP00_SEARCH: {
    type: 'boolean',
    default: false,
    description: 'Use APP00 improved search/filter logic',
    source: 'APP00',
  },

  // APP01: Optimized API layer
  ENABLE_APP01_API: {
    type: 'boolean',
    default: false,
    description: 'Use APP01 optimized API patterns',
    source: 'APP01',
  },

  // HYBRID: Unified search mode
  SEARCH_MODE: {
    type: 'enum',
    values: ['base', 'app00', 'app01', 'hybrid'],
    default: 'base',
    description: 'Active search engine mode',
    source: 'HYBRID',
  },

  // ROLLOUT: Gradual feature release
  ROLLOUT_PERCENT: {
    type: 'number',
    default: 100,
    description: 'Percentage of users who see new features (0-100)',
    source: 'HYBRID',
  },
};
