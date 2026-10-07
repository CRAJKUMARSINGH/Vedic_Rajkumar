import posthog from 'posthog-js';
import { getCorrelationId } from '../logging/correlation';
import { hashUserId, scrubPII } from '../privacy-scrubber';

export const initAnalytics = () => {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;

  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,       // we control routing
    autocapture: false,            // explicit events only
    persistence: 'localStorage',
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug();
    },
  });
};

export const identifyUser = (userId: string, traits?: Record<string, unknown>) =>
  posthog.identify(hashUserId(userId), traits ? scrubPII(traits) : undefined);

export const resetAnalytics = () => posthog.reset();

export const trackEvent = (event: string, props?: Record<string, unknown>) => {
  try {
    posthog.capture(event, scrubPII({ ...props, correlationId: getCorrelationId() }));
  } catch {
    // PostHog not initialised (tests / offline)
  }
};

export const trackPageview = (path: string) => {
  try {
    posthog.capture('$pageview', { path, correlationId: getCorrelationId() });
  } catch {
    // PostHog not initialised (tests / offline)
  }
};
