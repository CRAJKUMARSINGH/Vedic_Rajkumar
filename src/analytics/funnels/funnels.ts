import { trackEvent } from '@/observability/analytics/posthog';

/** Core activation funnel: visit → signup → chart → insight → return. */
export const FUNNEL_STEPS = [
  'page_view',
  'signup',
  'chart_created',
  'insight_viewed',
  'session_return',
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const funnelEvent = (step: FunnelStep, props?: Record<string, unknown>) =>
  trackEvent(`funnel:${step}`, props);

export const trackUpgradeClick = (from: string) => trackEvent('upgrade_click', { from });
export const trackExport = (format: string) => trackEvent('export', { format });
export const trackShare = (channel: string) => trackEvent('share', { channel });
