/**
 * ============================================================
 * PRASNA KERNEL — SYNTHESIS (Prasnalove.txt §5.9)
 * ============================================================
 *
 * Turn a list of EvidenceItems into a verdict + confidence. The maths is
 * deliberately simple and transparent; the weights are the only tunable
 * part (tuned later from outcome data, §8).
 *
 *   score      = Σ sign(polarity) · weight
 *   norm       = score / Σ weight            (−1..1)
 *   confidence = min(1, |norm| · 1.4)
 *   verdict    = confidence < 0.5 ? (|norm| < 0.15 ? 'unclear' : 'maybe')
 *                                : (norm > 0 ? 'yes' : 'no')
 * ============================================================
 */

import type { EvidenceItem, Verdict } from './evidence';
import { polaritySign } from './evidence';

/**
 * Starting weights from Prasnalove.txt §5.9. They sum to 1.0. Topic
 * modules pick the relevant ones; the outcome loop will refine them.
 */
export const STARTING_WEIGHTS: Record<string, number> = {
  tajikaLagnaKaryesh: 0.25,
  moonCondition: 0.15,
  samanyaSutra: 0.10,
  adhipatiSutra: 0.10,
  arudhaCondition: 0.10,
  bhavaKarakStrength: 0.15,
  ashtamangalaFuture: 0.05,
  pranakshara: 0.05,
  gulikaTrisphuta: 0.05,
};

export interface SynthesisResult {
  verdict: Verdict;
  confidence: number;
  /** The normalised score in −1..1 (exposed for the "Why?" view). */
  score: number;
}

/** Combine evidence into a verdict + confidence. Empty input → unclear. */
export function synthesize(items: EvidenceItem[]): SynthesisResult {
  const score = items.reduce((s, e) => s + polaritySign(e.polarity) * e.weight, 0);
  const total = items.reduce((s, e) => s + e.weight, 0) || 1;
  const norm = score / total;
  const confidence = Math.min(1, Math.abs(norm) * 1.4);
  const verdict: Verdict =
    confidence < 0.5 ? (Math.abs(norm) < 0.15 ? 'unclear' : 'maybe') : norm > 0 ? 'yes' : 'no';
  return { verdict, confidence, score: norm };
}
