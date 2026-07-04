import { DomainSignal, WeightedSignal, SynthesisDomain, ScoreVector } from './signalTypes';
import { LAYER_WEIGHTS, CATEGORY_WEIGHTS } from './domainWeights';

export function applyDomainWeights(
  signals: DomainSignal[],
  domain: SynthesisDomain
): WeightedSignal[] {
  const layerWeights = LAYER_WEIGHTS[domain];

  return signals.map(sig => {
    const lWeight = layerWeights[sig.layer] || 0.1;
    const cWeight = CATEGORY_WEIGHTS[sig.category] || 1.0;
    const baseRelevance = lWeight * cWeight;

    // Polarity sign
    const sign = sig.polarity === 'negative' ? -1 : sig.polarity === 'positive' ? 1 : 0;

    return {
      ...sig,
      relevanceWeight: baseRelevance,
      effectiveMagnitude: sig.magnitude * sig.reliability * baseRelevance * sign,
    };
  });
}

export function computeScores(
  weightedSignals: WeightedSignal[],
  domain: SynthesisDomain
): ScoreVector {
  let promiseSum = 0;
  let activationSum = 0;
  let obstructionSum = 0;
  let delaySum = 0;
  let visibilitySum = 0;

  // Aggregate signals by category
  weightedSignals.forEach(sig => {
    const val = sig.effectiveMagnitude;
    const absVal = Math.abs(val);

    switch (sig.category) {
      case 'promise':
        promiseSum += val;
        break;
      case 'activation':
        activationSum += val;
        break;
      case 'obstruction':
        obstructionSum += absVal;
        break; // Always positive magnitude for obstruction score
      case 'delay':
        delaySum += absVal;
        break;
      case 'visibility':
        visibilitySum += val;
        break;
    }
  });

  // Normalize scores to 0-100 range.
  // We use a sigmoid-like or clamping function based on expected weight sums.
  const promise = normalizeScore(promiseSum, 1.5);
  const activation = normalizeScore(activationSum, 0.8);
  const obstruction = normalizeScore(obstructionSum, 1.0);
  const delay = normalizeScore(delaySum, 0.8);
  const visibility = normalizeScore(visibilitySum, 0.6);
  const stability = normalizeScore(promiseSum - obstructionSum, 1.5);

  // Net Probability formula based on spec
  let netProbability = Math.round(
    promise * 0.38 +
      activation * 0.27 +
      stability * 0.12 +
      visibility * 0.08 -
      obstruction * 0.1 -
      delay * 0.05
  );

  netProbability = Math.max(0, Math.min(100, netProbability));

  // Base confidence (will be refined in confidenceEngine)
  const confidence = 70;

  return {
    promise,
    activation,
    obstruction,
    delay,
    stability,
    visibility,
    netProbability,
    confidence,
  };
}

function normalizeScore(rawSum: number, expectedMax: number): number {
  // Convert an unbounded raw sum (positive or negative) to a 0-100 scale.
  // 0 sum = 50. Max positive = 100. Max negative = 0.
  // For obstruction/delay which are absolute, 0 = 0, Max = 100.

  // Simple clamping for MVP
  const ratio = rawSum / expectedMax;

  // If we expect positive/negative (promise, activation):
  // Let's just treat rawSum > 0 as positive scale 0-100
  // Actually, let's make it simple:
  let scaled = ratio * 100;

  // Cap at 100
  if (scaled > 100) scaled = 100;
  if (scaled < 0) scaled = 0; // For negative promise, we floor at 0 for the score vector.

  return Math.round(scaled);
}
