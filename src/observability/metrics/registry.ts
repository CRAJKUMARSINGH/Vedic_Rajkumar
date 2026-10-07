/**
 * registry.ts — Week 9 Observability
 * In-memory counters and histograms for client-side metrics.
 * Values are read by the AnalyticsDashboard and exported via PostHog spans.
 * Bounded memory: counters are unlimited; histograms keep the last 1000 values.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Counter {
  inc: (n?: number) => void;
  value: () => number;
  reset: () => void;
}

export interface Histogram {
  observe: (v: number) => void;
  percentile: (p: number) => number;
  count: () => number;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const counters   = new Map<string, number>();
const histograms = new Map<string, number[]>();

// ─── Factory functions ────────────────────────────────────────────────────────

export const counter = (name: string): Counter => ({
  inc:   (n = 1) => counters.set(name, (counters.get(name) ?? 0) + n),
  value: ()      => counters.get(name) ?? 0,
  reset: ()      => counters.set(name, 0),
});

export const histogram = (name: string): Histogram => ({
  observe: (v: number) => {
    const arr = histograms.get(name) ?? [];
    arr.push(v);
    if (arr.length > 1000) arr.shift();
    histograms.set(name, arr);
  },
  percentile: (p: number) => {
    const arr = Array.from(histograms.get(name) ?? []).sort((a, b) => a - b);
    if (!arr.length) return 0;
    const idx = Math.min(arr.length - 1, Math.floor((p / 100) * arr.length));
    return arr[idx];
  },
  count: () => (histograms.get(name) ?? []).length,
});

// ─── Snapshot (for debug panel / dashboard) ───────────────────────────────────

export const snapshot = () => ({
  counters: Object.fromEntries(counters),
  histograms: Object.fromEntries(
    Array.from(histograms.keys()).map((k) => [
      k,
      {
        p50: histogram(k).percentile(50),
        p95: histogram(k).percentile(95),
        p99: histogram(k).percentile(99),
        count: histogram(k).count(),
      },
    ])
  ),
});

// ─── Pre-registered business metrics ─────────────────────────────────────────

export const metrics = {
  chartCalculated: counter('chart_calculated_total'),
  chartFailed:     counter('chart_failed_total'),
  accuracyScore:   histogram('chart_accuracy_score'),
  calcLatency:     histogram('chart_calc_latency_ms'),
  dataExports:     counter('data_exports_total'),
  cacheHits:       counter('cache_hits_total'),
  cacheMisses:     counter('cache_misses_total'),
};
