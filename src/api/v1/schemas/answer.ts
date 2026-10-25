import { z } from 'zod';
import { ALL_TOPICS, type Topic } from '@/services/answerCard/AnswerCard.types';

export const TOPIC_VALUES = ['health', 'house_construction', 'career', 'marriage', 'finance'] as const;

/** `YYYY-MM-DD`. Shared by the zod schemas and the hand-validated routes. */
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const AnswerQuery = z.object({
  person: z.string().min(1).max(120),
  /** Comma-separated topic csv; absent = every topic. */
  topics: z.string().optional(),
  lang: z.enum(['hi', 'en']).default('en'),
  asOf: z.string().regex(ISO_DATE_RE).optional(),
  asked: z.string().max(240).optional(),
});

const BiText = z.object({ en: z.string(), hi: z.string() });

const Window = z.object({
  from: z.string(),
  to: z.string(),
  label: BiText,
  approximate: z.boolean(),
});

const EvidenceLine = z.object({
  layer: z.string(),
  score: z.number(),
  finding: z.string(),
});

const Verdict = z.object({
  topic: z.enum(TOPIC_VALUES),
  headline: BiText,
  score_0_100: z.number(),
  band: z.enum(['excellent', 'good', 'average', 'caution', 'avoid']),
  engine_verdict: z.enum(['DELIVERING', 'CONDITIONAL', 'DELAYED', 'BLOCKED']),
  confidence_0_1: z.number(),
  window: Window.nullable(),
  rationale: BiText,
  conflicts: z.array(z.string()),
  evidence: z.array(EvidenceLine),
  remedies: z.array(BiText),
  caveats: z.array(BiText),
});

/**
 * Subject block. Birth fields are optional: a card served to a non-admin is
 * redacted to `birth_hash` (see `src/services/answerCard/redact.ts`).
 */
const Subject = z.object({
  name: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()),
  jatak_id: z.string().nullable(),
  dob: z.string().optional(),
  tob: z.string().optional(),
  place: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  tz: z.string().optional(),
  tz_defaulted: z.boolean().optional(),
  birth_hash: z.string().optional(),
});

export const AnswerCardSchema = z.object({
  card_version: z.literal('1.0'),
  subject: Subject,
  query: z.object({
    asked: z.string(),
    topics: z.array(z.enum(TOPIC_VALUES)),
    language: z.enum(['hi', 'en']),
    as_of: z.string(),
    reference_type: z.enum(['natal', 'prashna']),
  }),
  direct_answer: BiText,
  verdicts: z.array(Verdict),
  provenance: z.object({
    engine_version: z.string(),
    ayanamsa: z.string(),
    house_system: z.string(),
    dasha_system: z.string(),
    ephemeris: z.enum(['local', 'swisseph']),
    computed_at: z.string(),
    as_of: z.string(),
    input_hash: z.string(),
    card_hash: z.string(),
    source_files: z.array(z.string()),
  }),
});

/** csv → Topic[]; unknown tokens are dropped, empty csv → all topics. */
export function parseTopics(csv?: string): Topic[] {
  if (!csv) return [...ALL_TOPICS];
  const wanted = csv
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
  const valid = ALL_TOPICS.filter(t => wanted.includes(t));
  return valid.length ? valid : [...ALL_TOPICS];
}

export type AnswerCardResponse = z.infer<typeof AnswerCardSchema>;
