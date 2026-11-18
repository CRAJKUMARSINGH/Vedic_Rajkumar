import { describe, it, expect } from 'vitest';
import { SLOS, computeErrorBudget } from '@/observability/slo';
import { metrics } from '@/observability/metrics/registry';

describe('Week 9 SLO and metrics', () => {
  it('defines four launch SLOs with error budgets', () => {
    expect(SLOS).toHaveLength(4);
    expect(SLOS.every((s) => s.errorBudgetMinutes > 0)).toBe(true);
  });

  it('marks SLO healthy when availability meets target', () => {
    const status = computeErrorBudget(SLOS[0], 0.9995);
    expect(status.healthy).toBe(true);
  });

  it('increments chart counters', () => {
    const before = metrics.chartCalculated.value();
    metrics.chartCalculated.inc();
    expect(metrics.chartCalculated.value()).toBe(before + 1);
  });
});
