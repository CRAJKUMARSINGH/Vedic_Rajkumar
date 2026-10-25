/**
 * AnswerCard.types.ts — the strict-TS schema for a precomputed answer card.
 *
 * Design rule, non-negotiable: `direct_answer` is field #1. An AI (or a
 * consumer) reads the verdict and stops; `provenance` explains how the app
 * arrived there without being forced into the reply.
 */

import type { VerdictType } from '@/services/conclusiveJatakJudgmentService';

export type Topic = 'health' | 'house_construction' | 'career' | 'marriage' | 'finance';
export type Lang = 'hi' | 'en';
export type Band = 'excellent' | 'good' | 'average' | 'caution' | 'avoid';

export const ALL_TOPICS: readonly Topic[] = [
  'health',
  'house_construction',
  'career',
  'marriage',
  'finance',
] as const;

/** 1:1 from the engine's VerdictType — no meaning invented. */
export const BAND_FROM_VERDICT: Record<VerdictType, Band> = {
  DELIVERING: 'good',
  CONDITIONAL: 'average',
  DELAYED: 'caution',
  BLOCKED: 'avoid',
};

export const BAND_WORD: Record<Band, { en: string; hi: string }> = {
  excellent: { en: 'excellent', hi: 'उत्तम' },
  good: { en: 'good', hi: 'अनुकूल' },
  average: { en: 'average', hi: 'सामान्य' },
  caution: { en: 'caution', hi: 'सावधानी' },
  avoid: { en: 'avoid', hi: 'प्रतिकूल' },
};

export const TOPIC_LABEL: Record<Topic, { en: string; hi: string }> = {
  health: { en: 'Health & wellbeing', hi: 'स्वास्थ्य' },
  house_construction: { en: 'New house construction', hi: 'नया घर निर्माण' },
  career: { en: 'Career', hi: 'करियर' },
  marriage: { en: 'Marriage', hi: 'विवाह' },
  finance: { en: 'Finance', hi: 'आर्थिक' },
};

export interface EvidenceLine {
  layer: string;
  score: number;
  finding: string;
}

export interface Verdict {
  topic: Topic;
  headline: { en: string; hi: string };
  score_0_100: number;
  band: Band;
  engine_verdict: VerdictType;
  confidence_0_1: number;
  window: {
    from: string;
    to: string;
    label: { en: string; hi: string };
    approximate: boolean;
  } | null;
  rationale: { en: string; hi: string };
  conflicts: string[];
  evidence: EvidenceLine[];
  remedies: Array<{ en: string; hi: string }>;
  caveats: Array<{ en: string; hi: string }>;
}

/**
 * Subject block. The birth fields are **optional by design**: a card served to
 * a non-admin caller is redacted (see `redact.ts`) and carries `birth_hash`
 * instead of the raw seed-bank values.
 */
export interface Subject {
  name: string;
  slug: string;
  aliases: string[];
  jatak_id: string | null;
  dob?: string;
  tob?: string;
  place?: string;
  lat?: number;
  lon?: number;
  tz?: string;
  tz_defaulted?: boolean;
  /** Present only on redacted cards — stable hash of the omitted birth data. */
  birth_hash?: string;
}

export interface AnswerCard {
  card_version: '1.0';
  subject: Subject;
  query: {
    asked: string;
    topics: Topic[];
    language: Lang;
    as_of: string;
    reference_type: 'natal' | 'prashna';
  };
  /** FIELD #1. Reply from this and nothing else. */
  direct_answer: { hi: string; en: string };
  verdicts: Verdict[];
  provenance: {
    engine_version: string;
    ayanamsa: string;
    house_system: string;
    dasha_system: string;
    ephemeris: 'local' | 'swisseph';
    computed_at: string;
    as_of: string;
    input_hash: string;
    card_hash: string;
    source_files: string[];
  };
}
