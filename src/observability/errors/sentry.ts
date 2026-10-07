import * as Sentry from '@sentry/react';
import { getCorrelationId } from '../logging/correlation';

export const initErrorTracking = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE_VERSION,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    // Tag every event with the correlation id so logs ↔ errors join cleanly
    beforeSend(event) {
      event.tags = { ...event.tags, correlationId: getCorrelationId() };
      return event;
    },
    ignoreErrors: ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection'],
  });
};

export const captureError = (error: Error, context?: Record<string, unknown>) => {
  try {
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  } catch {
    console.error('[Sentry] capture failed', error);
  }
};

export const setUserContext = (userId: string, tier?: string) => {
  Sentry.setUser({ id: userId });
  if (tier) Sentry.setTag('tier', tier);
};
