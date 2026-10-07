/** Detect routes whose p75 LCP regressed vs the previous release baseline. */
export interface VitalSample {
  route: string;
  lcp: number;
  release: string;
}

export interface RegressionResult {
  route: string;
  currentP75: number;
  baseline: number;
  deltaPct: number;
}

export const findRegressions = (
  current: VitalSample[],
  baseline: Record<string, number>,
  thresholdPct = 20,
): RegressionResult[] => {
  const byRoute = new Map<string, number[]>();
  for (const sample of current) {
    const arr = byRoute.get(sample.route) ?? [];
    arr.push(sample.lcp);
    byRoute.set(sample.route, arr);
  }

  const out: RegressionResult[] = [];
  for (const [route, vals] of byRoute) {
    vals.sort((a, b) => a - b);
    const p75 = vals[Math.floor(vals.length * 0.75)] ?? 0;
    const base = baseline[route];
    if (base && (p75 - base) / base > thresholdPct / 100) {
      out.push({
        route,
        currentP75: p75,
        baseline: base,
        deltaPct: Math.round(((p75 - base) / base) * 100),
      });
    }
  }
  return out.sort((a, b) => b.deltaPct - a.deltaPct);
};
