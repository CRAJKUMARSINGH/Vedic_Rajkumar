import { SynthesisRequest, AstrologicalContext, SynthesisVerdict } from './signalTypes';
import { extractSignals } from './signalExtractor';
import { applyDomainWeights, computeScores } from './scoringEngine';
import { resolveContradictions } from './contradictionResolver';
import { computeConfidence } from './confidenceEngine';
import { buildExplanation } from './explanationEngine';
import { determineDashaLevel } from './timingEngine';

/**
 * MASTER SYNTHESIS ORCHESTRATOR
 * Consumes raw astrological context and produces a structured convergence verdict.
 */
export async function runSynthesis(
  request: SynthesisRequest,
  context: AstrologicalContext
): Promise<SynthesisVerdict> {
  // 1. Extract signals from raw context
  const signals = extractSignals(context, request);

  // 2. Apply domain-specific weights
  const weightedSignals = applyDomainWeights(signals, request.domain);

  // 3. Compute orthogonal scores
  const scores = computeScores(weightedSignals, request.domain);

  // 4. Resolve contradictions into named classes
  const contradiction = resolveContradictions(scores, weightedSignals);

  // 5. Compute confidence
  scores.confidence = computeConfidence(weightedSignals, scores, contradiction);

  // 6. Build explanation trace
  const explanation = buildExplanation(weightedSignals, scores, contradiction, request.domain);

  // 7. Timing Level
  const timing = determineDashaLevel(context, request.domain);

  // 8. Assemble verdict
  const verdict: SynthesisVerdict = {
    domain: request.domain,
    verdictSummary: contradiction.verdictSummary,
    timingClass: contradiction.timingClass,
    scores,
    dashaLevel: timing.dashaLevel,
    levelTag: timing.levelTag,
    topSupportingFactors: explanation.topSupportingFactors,
    topObstructingFactors: explanation.topObstructingFactors,
    explanationTrace: explanation.explanationTrace,
    conciseExplanation: explanation.conciseExplanation,
  };

  return verdict;
}
