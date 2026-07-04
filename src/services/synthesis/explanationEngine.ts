import { WeightedSignal, ScoreVector, TraceNode, SynthesisDomain } from './signalTypes';
import { ContradictionResolution } from './contradictionResolver';

export function buildExplanation(
  signals: WeightedSignal[],
  scores: ScoreVector,
  resolution: ContradictionResolution,
  domain: SynthesisDomain
): {
  topSupportingFactors: string[];
  topObstructingFactors: string[];
  explanationTrace: TraceNode[];
  conciseExplanation: string;
} {
  // Sort signals by impact (effective magnitude)
  const sortedSignals = [...signals].sort(
    (a, b) => Math.abs(b.effectiveMagnitude) - Math.abs(a.effectiveMagnitude)
  );

  const topSupporting = sortedSignals.filter(s => s.polarity === 'positive').slice(0, 3);
  const topObstructing = sortedSignals.filter(s => s.polarity === 'negative').slice(0, 3);

  const explanationTrace: TraceNode[] = sortedSignals.map(sig => ({
    signalId: sig.id,
    layer: sig.layer,
    category: sig.category,
    signedContribution: sig.effectiveMagnitude,
    explanation: sig.description,
  }));

  const topSupportingFactors = topSupporting.map(s => s.description);
  const topObstructingFactors = topObstructing.map(s => s.description);

  // Narrative summary builder
  let conciseExplanation = `The analysis for ${domain} reveals a net probability of ${scores.netProbability}%. `;

  if (topSupporting.length > 0) {
    conciseExplanation += `Key supporting factors include: ${topSupporting[0].description} `;
  }

  if (topObstructing.length > 0) {
    conciseExplanation += `However, it faces friction from: ${topObstructing[0].description} `;
  }

  conciseExplanation += resolution.verdictSummary;

  return {
    topSupportingFactors,
    topObstructingFactors,
    explanationTrace,
    conciseExplanation,
  };
}
