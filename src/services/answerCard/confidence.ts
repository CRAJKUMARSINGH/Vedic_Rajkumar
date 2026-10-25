/**
 * confidence.ts — honest confidence for a verdict.
 *
 * Every deduction traces to a string or a number the engine already emits, so
 * nothing here is invented. The ceiling is 0.90: a deterministic engine should
 * never claim to be certain.
 */

import type { ConclusiveJatakJudgment } from '@/services/conclusiveJatakJudgmentService';

const BOUNDARIES = [40, 56, 75] as const;

export function deriveConfidence(j: ConclusiveJatakJudgment): number {
  let c = 0.55;

  // Proximity to a band boundary: a 76 is shakier than an 88.
  const nearest = Math.min(...BOUNDARIES.map(b => Math.abs(j.score - b)));
  c += Math.min(nearest / 100, 0.18);

  // Inter-layer agreement: tight spread = confident.
  const scores = j.evidence.map(e => e.score);
  if (scores.length > 0) {
    const spread = Math.max(...scores) - Math.min(...scores);
    c += spread < 25 ? 0.12 : spread > 55 ? -0.1 : 0;
  }

  // Every unresolved conflict costs.
  c -= j.conflictResolution.length * 0.04;

  // The engine's own data-absence signals.
  if (/not SAV-certified|Ashtakavarga data is unavailable/i.test(j.houseVerdict)) c -= 0.1;
  if (/cannot be certified|no dedicated Moon double-transit/i.test(j.transitVerdict)) c -= 0.08;

  return Math.max(0.2, Math.min(0.9, Number(c.toFixed(2))));
}

export const confidenceWord = (c: number, lang: 'hi' | 'en'): string =>
  lang === 'hi'
    ? c >= 0.75
      ? 'उच्च'
      : c >= 0.55
        ? 'मध्यम'
        : 'सीमित'
    : c >= 0.75
      ? 'high'
      : c >= 0.55
        ? 'moderate'
        : 'limited';
