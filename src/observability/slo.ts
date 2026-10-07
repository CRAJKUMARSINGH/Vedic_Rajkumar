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
