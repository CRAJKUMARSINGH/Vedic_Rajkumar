// This module adapts the synthesis output into the strict narrative templates required by INTERPRETATION.md

import { SynthesisVerdict, ContradictionClass } from './signalTypes';

export function formatNarrative(verdict: SynthesisVerdict): string {
  const { scores, timingClass, conciseExplanation } = verdict;

  let narrative = '';

  if (scores.confidence > 80) {
    narrative += `[${verdict.domain.toUpperCase()}] Probability: ${scores.netProbability}% — Layers strictly converge. `;
  } else if (scores.confidence >= 60) {
    narrative += `[${verdict.domain.toUpperCase()}] Probability: ${scores.netProbability}% — Layers show support but introduce friction. `;
  } else {
    narrative += `[${verdict.domain.toUpperCase()}] Probability: ${scores.netProbability}% — Layers are divided. This domain represents a KARMIC BATTLEGROUND. `;
  }

  narrative += `${conciseExplanation}\n\n`;

  // Apply specific phrasing based on contradiction class
  switch (timingClass) {
    case 'promised_not_activated':
      narrative +=
        "This yoga is your inheritance — it belongs to you, but the bank hasn't opened yet. Prepare now.";
      break;
    case 'supportive_but_delayed':
      narrative +=
        'Duty and delay are built into this house. The person will earn this, not receive it. Karmic price: perseverance over time.';
      break;
    case 'temporary_activation':
      narrative +=
        "The transit is knocking on a door the radix hasn't built. Small movement now; substantial result requires structural remedy.";
      break;
    case 'weak_foundation':
      narrative += `The natal chart does not structurally support ${verdict.domain}. No transit or Dasha can manufacture what the radix denies.`;
      break;
  }

  return narrative;
}
