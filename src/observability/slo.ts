export interface SLO {
  name: string;
  target: number; // e.g. 0.999 = 99.9%
  windowDays: number;
  indicator: string;
  errorBudgetMinutes: number;
}

/** Error budget = (1 - target) * window in minutes */
const budget = (target: number, windowDays: number) =>
  Math.round((1 - target) * windowDays * 24 * 60);

export const SLOS: SLO[] = [
  { name: 'API Availability', target: 0.999, windowDays: 30, indicator: 'http_success_rate', errorBudgetMinutes: budget(0.999, 30) },
  { name: 'API Latency p95 < 500ms', target: 0.99, windowDays: 30, indicator: 'latency_p95', errorBudgetMinutes: budget(0.99, 30) },
  { name: 'Chart Accuracy >= 99%', target: 0.999, windowDays: 30, indicator: 'accuracy_ratio', errorBudgetMinutes: budget(0.999, 30) },
  { name: 'Export Success', target: 0.995, windowDays: 30, indicator: 'export_success_rate', errorBudgetMinutes: budget(0.995, 30) },
];

export const computeErrorBudget = (slo: SLO, currentAvailability: number) => {
  const allowed = 1 - slo.target;
  const consumed = Math.max(0, allowed - (1 - currentAvailability));
  return {
    slo: slo.name,
    allowedMinutes: slo.errorBudgetMinutes,
    remainingRatio: allowed === 0 ? 1 : consumed / allowed,
    healthy: currentAvailability >= slo.target,
  };
};

/**
 * PURE SLO math. Shared by the client and the edge (ADR-003 import map).
 *
 * The AUTHORITY is public.evaluate_slos() on the server; this module exists so the
 * client can render a status badge without a round trip, and so the math has one
 * test surface instead of two.
 */
export interface SloWindow {
  total: number;
  good: number;
}

export interface SloEvaluation {
  sli: number | null;
  burnRate: number;
  breached: boolean;
}

/** Standard error-budget burn. burn >= 1 means the window has spent its budget. */
export function evaluate(def: Pick<SLO, 'target'>, w: SloWindow): SloEvaluation {
  if (w.total === 0) return { sli: null, burnRate: 0, breached: false };
  const sli = w.good / w.total;
  if (def.target >= 1) return { sli, burnRate: 0, breached: false };
  const burnRate = (1 - sli) / (1 - def.target);
  return { sli, burnRate, breached: burnRate >= 1 };
}

/** Remaining budget as a fraction: 1 = untouched, 0 = exhausted. */
export function budgetRemaining(burnRate: number): number {
  return Math.max(0, 1 - burnRate);
}

/** How long until the budget is gone at this burn rate (ms). */
export function timeToExhaustionMs(burnRate: number, windowMs: number): number | null {
  if (burnRate <= 0) return null;
  return burnRate >= 1 ? 0 : Math.round((windowMs * (1 - burnRate)) / burnRate);
}
