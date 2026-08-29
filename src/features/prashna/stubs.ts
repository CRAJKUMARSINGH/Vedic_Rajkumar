/**
 * ============================================================
 * PRASHNA CALCULATION STUBS
 * ============================================================
 *
 * These stubs stand in for the real Prashna engine until Week 4/5,
 * when the chart-casting + rule-based + LLM layers are implemented.
 *
 * CONTRACT GUARANTEES:
 *   - Returns structurally valid PrashnaAnswer (all required fields present)
 *   - Verdict is deterministic given the same input (hashed from question text)
 *   - isAIGenerated = false (stub is rule-based, not LLM)
 *   - Clearly marked as STUB so no production code relies on the values
 *
 * HOW TO REPLACE (Week 4–5):
 *   1. Implement castPrashnaChart() using Swiss Ephemeris for askedAt moment
 *   2. Implement significatorDetection() using house-topic mapping
 *   3. Implement verdictRules() applying classical Prashna rules
 *   4. Integrate LLM for reasoning text (set isAIGenerated = true)
 *   5. Replace stub exports with real engine exports
 * ============================================================
 */

import type {
  PrashnaQuery,
  PrashnaAnswer,
  PrashnaSession,
  PrashnaRemedy,
  PrashnaSignificator,
  PrashnaTiming,
  PrashnaVerdict,
} from './types';
import { calculateChart } from '@/features/kundli/stubs';

// ─── Deterministic helpers ────────────────────────────────────────────────────

/** Simple djb2 hash for deterministic stub output. */
function hashString(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash) ^ s.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash;
}

const VERDICTS: PrashnaVerdict[] = ['yes', 'no', 'maybe', 'unclear'];

function stubVerdict(question: string): PrashnaVerdict {
  return VERDICTS[hashString(question) % VERDICTS.length];
}

function stubConfidence(verdict: PrashnaVerdict): number {
  switch (verdict) {
    case 'yes':    return 0.78;
    case 'no':     return 0.72;
    case 'maybe':  return 0.55;
    case 'unclear': return 0.41;
  }
}

// ─── Stub remedy bank ─────────────────────────────────────────────────────────

const STUB_REMEDIES: PrashnaRemedy[] = [
  {
    type: 'mantra',
    instruction: 'Chant "Om Shukraya Namah" 108 times on Fridays.',
    targetPlanet: 'Venus',
    duration: '11 Fridays',
  },
  {
    type: 'fast',
    instruction: 'Observe a fast on Mondays for 11 weeks.',
    targetPlanet: 'Moon',
    duration: '11 Mondays',
  },
  {
    type: 'charity',
    instruction: 'Donate yellow clothes and turmeric to a temple on Thursdays.',
    targetPlanet: 'Jupiter',
    duration: 'Ongoing',
  },
];

// ─── Stub significators ───────────────────────────────────────────────────────

const STUB_SIGNIFICATORS: PrashnaSignificator[] = [
  {
    planet: 'Moon',
    sign: 'Cancer',
    house: 1,
    role: 'Moon as Lagna lord occupies the Lagna in the Prashna chart, indicating the querent\'s strong personal involvement in the matter.',
    supportive: true,
  },
  {
    planet: 'Venus',
    sign: 'Leo',
    house: 2,
    role: 'Venus as natural significator of relationships aspects the 7th house, supporting the query topic.',
    supportive: true,
  },
  {
    planet: 'Saturn',
    sign: 'Aquarius',
    house: 8,
    role: 'Saturn in the 8th introduces delays and obstacles that must be addressed.',
    supportive: false,
  },
];

// ─── Public stub ─────────────────────────────────────────────────────────────

/**
 * STUB: answerPrashna
 *
 * Returns a structurally valid PrashnaAnswer with deterministic stub values.
 * The Prashna chart is generated using the Kundli stub (same fixed positions).
 * The verdict is deterministically derived from the question text via hashing.
 *
 * @param query   PrashnaQuery containing the question, askedAt, location.
 * @returns       A complete PrashnaAnswer typed object with STUB content.
 */
export async function answerPrashna(query: PrashnaQuery): Promise<PrashnaAnswer> {
  // Cast a Prashna chart at the moment of asking
  // STUB: uses fixed longitude values, not real ephemeris for askedAt
  const prashnaChart = calculateChart({
    name: 'Prashna Chart',
    date: query.askedAt.split('T')[0],
    time: query.askedAt.split('T')[1]?.substring(0, 5) ?? '12:00',
    timezone: query.timezone,
    latitude: query.latitude,
    longitude: query.longitude,
    place: 'Prashna Location (stub)',
  });

  const verdict = stubVerdict(query.question);
  const confidence = stubConfidence(verdict);

  // Build timing only for 'yes' verdict
  const timing: PrashnaTiming | undefined =
    verdict === 'yes'
      ? {
          earliest: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // ~2 months out
          latest: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // ~6 months out
          description:
            'STUB: Indicative timing — within 2–6 months based on Venus transit into the 7th house.',
        }
      : undefined;

  const reasoning = buildStubReasoning(query, verdict, confidence);

  return {
    queryId: query.id,
    prashnaChart,
    verdict,
    confidence,
    reasoning,
    significators: STUB_SIGNIFICATORS.slice(0, 3),
    timing,
    remedies: verdict !== 'yes' ? STUB_REMEDIES.slice(0, 2) : [],
    isAIGenerated: false,
    answeredAt: new Date().toISOString(),
    engineVersion: '0.0.1-stub',
  };
}

function buildStubReasoning(
  query: PrashnaQuery,
  verdict: PrashnaVerdict,
  confidence: number,
): string {
  const verdictMap: Record<PrashnaVerdict, string> = {
    yes: 'The Prashna chart shows **favourable** indications.',
    no: 'The Prashna chart shows **unfavourable** indications.',
    maybe: 'The Prashna chart shows **mixed** indications.',
    unclear: 'The Prashna chart shows **contradictory** indications.',
  };

  return `## Prashna Analysis — STUB\n\n` +
    `> ⚠️ This is a placeholder response. Real ephemeris-based analysis is coming in Week 4.\n\n` +
    `**Question:** "${query.question}"\n\n` +
    `**Topic category:** ${query.topic}\n\n` +
    `### Chart Overview\n` +
    `Prashna Lagna: **Cancer** (Moon as Lagna lord)\n` +
    `Moon is in Cancer in the 1st house — strong position for the querent.\n` +
    `Venus (natural karaka for ${query.topic === 'marriage' || query.topic === 'relationship' ? 'relationships' : 'the queried matter'}) ` +
    `is in Leo in the 2nd house.\n\n` +
    `### Verdict Reasoning\n` +
    `${verdictMap[verdict]} ` +
    `The Moon-Venus relationship suggests ${verdict === 'yes' || verdict === 'maybe' ? 'a positive outcome is possible' : 'significant obstacles exist'}. ` +
    `Saturn in the 8th introduces delays. Confidence: **${Math.round(confidence * 100)}%**.\n\n` +
    `### Note for Querent\n` +
    `This analysis is a system-generated stub. A full Prashna reading requires ` +
    `the actual positions of all planets at the exact moment of asking, ` +
    `applied to the classical rules of Prashna Marg and Nashta Jataka.`;
}

/**
 * STUB: createPrashnaSession
 *
 * Creates a PrashnaSession with query and a stub answer.
 * In production this would persist to Supabase first, then trigger the engine.
 */
export async function createPrashnaSession(
  query: PrashnaQuery,
  userId: string | null,
): Promise<PrashnaSession> {
  const answer = await answerPrashna(query);
  const now = new Date().toISOString();
  return {
    query,
    answer,
    userId,
    createdAt: now,
    updatedAt: now,
  };
}
