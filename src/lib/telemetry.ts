/**
 * telemetry.ts — Week 7 Observability
 *
 * Unified observability service wrapping PostHog (product analytics + feature
 * usage) and Sentry (error tracking + accuracy degradation alerts).
 *
 * Boot:
 *   Call initTelemetry() once in main.tsx before createRoot().
 *   It is safe to call captureException / trackFeature before init —
 *   events queue until PostHog is ready, and Sentry falls back to console.
 *
 * Usage:
 *   telemetry.trackFeature('kundli', { chartStyle: 'north-indian' });
 *   telemetry.trackCalculation({ type: 'dasha', durationMs: 142, accuracyScore: 0.98 });
 *   telemetry.captureException(error, { context: 'KundliPage' });
 *   telemetry.identifyUser(userId, { tier: 'premium' });
 */

import posthog from 'posthog-js';
import { captureException as sentryCaptureException, captureMessage } from '@/lib/errorMonitoring';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalculationMetrics {
  /** Calculation type key, e.g. 'kundli', 'dasha', 'ashtakavarga' */
  type: string;
  /** Wall-clock duration in milliseconds */
  durationMs: number;
  /**
   * Accuracy score 0–1 vs Swiss Ephemeris reference.
   * Values below 0.95 trigger a Sentry warning.
   */
  accuracyScore?: number;
  /** Arbitrary key-value metadata included in the PostHog event. */
  metadata?: Record<string, unknown>;
}

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

let _posthogReady = false;

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Initialise PostHog analytics.
 * Safe to call multiple times — idempotent.
 * No-op when VITE_POSTHOG_KEY is absent (dev/offline mode).
 */
export function initTelemetry(): void {
  if (_posthogReady) return;

  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com';

  if (!key || key.trim() === '') {
    console.info('[Telemetry] PostHog key not configured — analytics disabled.');
    return;
  }

  posthog.init(key, {
    api_host: host,
    // Respect user consent — disable auto-capture until user accepts
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    loaded: () => {
      _posthogReady = true;
      console.info('[Telemetry] PostHog initialised.');
    },
    // Opt out of capturing in dev unless explicitly enabled
    opt_out_capturing_by_default: import.meta.env.DEV && !import.meta.env.VITE_POSTHOG_FORCE_ENABLE,
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

class TelemetryService {
  // In-memory event buffer — last 50 events, useful for debug panel
  private readonly _events: TelemetryEvent[] = [];

  // ── Errors ──────────────────────────────────────────────────────────────────

  /**
   * Capture an exception.
   * Forwards to Sentry (or console fallback) AND records a PostHog event.
   */
  captureException(error: Error, context?: Record<string, unknown>): void {
    sentryCaptureException(error, {
      context: context?.context as string | undefined,
      extra: context,
    });

    if (_posthogReady) {
      posthog.capture('exception', {
        error_message: error.message,
        error_name: error.name,
        ...context,
      });
    }
  }

  // ── Feature usage ────────────────────────────────────────────────────────────

  /**
   * Track feature usage (page view, button click, feature toggle).
   *
   * @example
   * telemetry.trackFeature('kundli_generate', { ayanamsa: 'Lahiri', chartStyle: 'north-indian' });
   */
  trackFeature(feature: string, properties?: Record<string, unknown>): void {
    const event: TelemetryEvent = {
      name: `feature_${feature}`,
      properties,
      timestamp: new Date().toISOString(),
    };
    this._buffer(event);

    if (_posthogReady) {
      posthog.capture(`feature_used`, { feature, ...properties });
    } else if (import.meta.env.DEV) {
      console.debug('[Telemetry] feature:', feature, properties);
    }
  }

  // ── Calculation performance ──────────────────────────────────────────────────

  /**
   * Record a completed calculation with duration and optional accuracy score.
   * If accuracyScore < 0.95, fires a Sentry warning — useful for catching
   * ephemeris regressions before users notice.
   *
   * @example
   * telemetry.trackCalculation({ type: 'kundli', durationMs: 82, accuracyScore: 0.99 });
   */
  trackCalculation(metrics: CalculationMetrics): void {
    const event: TelemetryEvent = {
      name: 'calculation_complete',
      properties: { ...metrics },
      timestamp: new Date().toISOString(),
    };
    this._buffer(event);

    if (_posthogReady) {
      posthog.capture('calculation_complete', {
        calculation_type: metrics.type,
        duration_ms: metrics.durationMs,
        accuracy_score: metrics.accuracyScore ?? null,
        ...metrics.metadata,
      });
    } else if (import.meta.env.DEV) {
      console.debug(
        `[Telemetry] calc: ${metrics.type} — ${metrics.durationMs}ms` +
        (metrics.accuracyScore !== undefined ? ` acc=${metrics.accuracyScore}` : '')
      );
    }

    // Accuracy degradation alert — fires even without PostHog
    if (metrics.accuracyScore !== undefined && metrics.accuracyScore < 0.95) {
      captureMessage(
        `Accuracy degradation: ${metrics.type} = ${(metrics.accuracyScore * 100).toFixed(1)}% ` +
        `(threshold 95%)`,
        'warning'
      );
    }
  }

  // ── User identity ────────────────────────────────────────────────────────────

  /**
   * Identify the signed-in user in PostHog.
   * Call after sign-in. Traits are stored as person properties in PostHog.
   *
   * @example
   * telemetry.identifyUser(clerkUserId, { tier: 'premium', orgId });
   */
  identifyUser(
    userId: string,
    traits?: Record<string, string | number | boolean | null>
  ): void {
    if (_posthogReady) {
      posthog.identify(userId, traits ?? {});
    }
  }

  /**
   * Reset PostHog identity on sign-out.
   */
  resetUser(): void {
    if (_posthogReady) {
      posthog.reset();
    }
  }

  // ── Page tracking ────────────────────────────────────────────────────────────

  /**
   * Manually capture a page view (for SPA navigation not caught by PostHog's
   * `capture_pageview` auto-mode).
   */
  trackPageView(path: string, properties?: Record<string, unknown>): void {
    if (_posthogReady) {
      posthog.capture('$pageview', { $current_url: path, ...properties });
    }
  }

  // ── Feature flags (PostHog) ──────────────────────────────────────────────────

  /**
   * Check if a PostHog feature flag is enabled.
   * Returns false when PostHog is not configured.
   */
  isFeatureEnabled(flag: string): boolean {
    if (!_posthogReady) return false;
    return posthog.isFeatureEnabled(flag) === true;
  }

  // ── Debug ────────────────────────────────────────────────────────────────────

  /** Returns up to 50 most recent telemetry events (in-memory only). */
  getRecentEvents(): readonly TelemetryEvent[] {
    return this._events.slice(-50);
  }

  private _buffer(event: TelemetryEvent): void {
    this._events.push(event);
    // Keep buffer bounded
    if (this._events.length > 200) this._events.shift();
  }
}

export const telemetry = new TelemetryService();
export default telemetry;
