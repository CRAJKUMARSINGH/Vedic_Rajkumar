import { ScoreVector, WeightedSignal } from './signalTypes';
import { ContradictionResolution } from './contradictionResolver';

export function computeConfidence(
  signals: WeightedSignal[],
  scores: ScoreVector,
  resolution: ContradictionResolution
): number {
  // 1. Data Coverage Score (Do we have signals from multiple layers?)
  const activeLayers = new Set(signals.filter(s => s.reliability > 0.5).map(s => s.layer));
  const dataCoverageScore = Math.min(100, (activeLayers.size / 6) * 100);

  // 2. Convergence Score (Do layers agree?)
  // High promise + high activation = high convergence.
  // High promise + high obstruction = mixed convergence.
  const convergenceScore = 100 - Math.abs(scores.promise - scores.activation) * 0.5;

  // 3. Contradiction Clarity (Is the resolution definitive?)
  let contradictionClarity = 70;
  if (['strong_now', 'weak_foundation', 'karmic_battleground'].includes(resolution.timingClass)) {
    contradictionClarity = 95; // Very clear situations
  } else if (
    ['promised_not_activated', 'supportive_but_delayed'].includes(resolution.timingClass)
  ) {
    contradictionClarity = 85; // Clear but nuanced
  } else {
    contradictionClarity = 60; // Mixed friction is inherently lower confidence
  }

  // Weight the final confidence
  const confidence = Math.round(
    convergenceScore * 0.4 + dataCoverageScore * 0.3 + contradictionClarity * 0.3
  );

  return Math.max(0, Math.min(100, confidence));
}
