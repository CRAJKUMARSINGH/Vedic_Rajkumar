import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { trackEvent } from '../analytics/posthog';

const BUDGETS: Record<string, number> = {
  LCP: 2500,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 800,
  INP: 200,
};

const report = (metric: Metric) => {
  trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    budget_ms: BUDGETS[metric.name],
    over_budget: metric.value > (BUDGETS[metric.name] ?? Infinity),
  });
};

export const initWebVitals = () => {
  if (typeof window === 'undefined') return;
  onCLS(report);
  onLCP(report);
  onFCP(report);
  onTTFB(report);
  onINP(report);
};
