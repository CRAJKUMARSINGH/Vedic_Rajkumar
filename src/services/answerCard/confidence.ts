/**
 * confidence.ts — honest confidence for a verdict.
 *
 * Every deduction traces to a string or a number the engine already emits, so
 * nothing here is invented. The ceiling is 0.90: a deterministic engine should
 * never claim to be certain.
 *
 * v2 §3: image-gap adjustments are additive to the existing substance score
 * but AL can never push the composite above the existing 0.90 ceiling. Floor
 * is 0.20.
 */

import type { ConclusiveJatakJudgment } from '@/services/conclusiveJatakJudgmentService';

const BOUNDARIES = [40, 56, 75] as const;

/** v2 §3 — optional image-axis modifiers. Pass null/undefined to skip. */
export interface ImageGapInput {
  /** Computed gap (imageScore − substanceScore). null = axis uncomputable. */
  gap: number | null;
  /** true when the AL lord could not be resolved from the chart. */
  alLordUnresolved: boolean;
}

export function deriveConfidence(
  j: ConclusiveJatakJudgment,
  imageGap?: ImageGapInput | null,
): number {
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

  // v2 §3 — image-gap adjustments (additive; AL can never push above ceiling).
  if (imageGap != null) {
    if (imageGap.gap === null) {
      // A10 uncomputable → omit axis (signalled to caller) + small penalty.
      c -= 0.04;
    } else if (Math.abs(imageGap.gap) >= 20) {
      // Extreme gap: image and substance strongly disagree → less certainty.
      c -= 0.05;
    } else if (Math.abs(imageGap.gap) <= 7) {
      // Aligned image: modest confidence boost.
      c += 0.03;
    }
    if (imageGap.alLordUnresolved) {
      // AL lord missing → no image claim at all → structural gap.
      c -= 0.06;
    }
  }

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

// ─── WS-2: input-quality confidence caps (g2 Phase-2 spec, adapted) ──────────
// The additive score above is unchanged; caps apply AFTER it. Only signals the
// canonical engine actually emits are used — nothing is invented.

export interface ConfidenceFlags {
  savCertified: boolean;
  ashtakavargaAvailable: boolean;
  dedicatedMoonTransit: boolean;
}

export interface ConfidenceInputs {
  judgment: ConclusiveJatakJudgment;
  /** 'fallback' ephemeris = degraded engine (±2–3°), the mean-motion analogue. */
  degradedEphemeris: boolean;
  flags: ConfidenceFlags;
  imageGap?: ImageGapInput | null;
}

const CAPS: Array<{ id: string; cap: number; when: (i: ConfidenceInputs) => boolean }> = [
  { id: 'C1', cap: 0.40, when: i => i.degradedEphemeris },
  { id: 'C11', cap: 0.62, when: i => i.judgment.conflictResolution.length >= 3 },
  { id: 'C8', cap: 0.72, when: i => !i.flags.savCertified },
  { id: 'C9', cap: 0.75, when: i => !i.flags.ashtakavargaAvailable },
  { id: 'C10', cap: 0.80, when: i => !i.flags.dedicatedMoonTransit },
];

export interface ConfidenceResult { value: number; cappedBy: string | null; cap: number }

export function deriveConfidenceV2(i: ConfidenceInputs): ConfidenceResult {
  const raw = deriveConfidence(i.judgment, i.imageGap ?? null);
  const hit = CAPS.find(c => c.when(i));
  const cap = hit?.cap ?? 0.90;
  return { value: Math.max(0.2, Math.min(cap, raw)), cappedBy: hit?.id ?? null, cap };
}
