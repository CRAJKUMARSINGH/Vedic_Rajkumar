import { ScoreVector, ContradictionClass, WeightedSignal } from './signalTypes';

export interface ContradictionResolution {
  timingClass: ContradictionClass;
  verdictSummary: string;
}

export function resolveContradictions(
  scores: ScoreVector,
  signals: WeightedSignal[]
): ContradictionResolution {
  const p = scores.promise;
  const a = scores.activation;
  const o = scores.obstruction;
  const d = scores.delay;

  let timingClass: ContradictionClass = 'mixed_friction';
  let verdictSummary = '';

  if (p >= 70 && a < 45) {
    timingClass = 'promised_not_activated';
    verdictSummary =
      'The promise exists. The bank is full, but the door is currently locked by the Dasha.';
  } else if (p >= 70 && o >= 60 && d >= 50) {
    timingClass = 'supportive_but_delayed';
    verdictSummary =
      'The domain is highly promised but heavily delayed. You will earn this, not receive it.';
  } else if (a >= 70 && p < 50) {
    timingClass = 'temporary_activation';
    verdictSummary =
      'The engine is running, but the chassis is weak. This is a temporary window, not structural permanence.';
  } else if (p >= 70 && a >= 65 && o < 35) {
    timingClass = 'strong_now';
    verdictSummary =
      'Peak manifestation window. The promise is strong, the Dasha is active, and obstruction is low.';
  } else if (p < 40 && a < 45) {
    timingClass = 'weak_foundation';
    verdictSummary =
      "The natal promise is weak and current periods offer no support. The native's energy is better channeled elsewhere.";
  } else if (o > 80) {
    timingClass = 'karmic_battleground';
    verdictSummary =
      'This domain operates under unrelieved malefic pressure. Manifestation requires surgical behavioral intervention.';
  } else {
    timingClass = 'mixed_friction';
    verdictSummary =
      'The indicators are mixed. The promise exists but conditional delivery means it requires active management.';
  }

  // Inject specific factors if needed
  verdictSummary = `Therefore: ${verdictSummary}`;

  return {
    timingClass,
    verdictSummary,
  };
}
