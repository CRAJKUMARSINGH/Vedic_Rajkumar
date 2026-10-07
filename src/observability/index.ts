export * from './logging/logger';
export * from './logging/correlation';
export * from './errors/sentry';
export * from './analytics/posthog';
export * from './metrics/webVitals';
export * from './metrics/registry';
export * from './tracing/tracer';
export * from './slo';

import { initErrorTracking } from './errors/sentry';
import { initAnalytics } from './analytics/posthog';
import { initWebVitals } from './metrics/webVitals';
import { logger } from './logging/logger';
import { withCorrelation } from './logging/correlation';

let initialized = false;

export const initObservability = () => {
  if (initialized) return;
  initialized = true;

  initErrorTracking();
  initAnalytics();
  initWebVitals();

  logger.info('observability_initialized', withCorrelation({
    release: import.meta.env.VITE_RELEASE_VERSION,
    env: import.meta.env.MODE,
  }));
};
