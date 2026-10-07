/**
 * useTrackCalculation — Week 7 Observability
 *
 * A timing wrapper for astrological calculations.
 * Measures wall-clock duration and forwards the result to the telemetry
 * service (PostHog + Sentry accuracy alert) without touching the caller.
 *
 * Usage — wrap any async calculation:
 *
 *   const tracked = useTrackCalculation();
 *
 *   const chart = await tracked('kundli', () =>
 *     calculateKundli(birthData)
 *   );
 *
 * Usage — with optional accuracy score (0–1) for Swiss Ephemeris comparison:
 *
 *   const result = await tracked('ashtakavarga', () => runAshtakavarga(chart), {
 *     accuracyScore: 0.97,
 *     metadata: { chartId: chart.id },
 *   });
 */

import { useCallback } from 'react';
import { telemetry } from '@/lib/telemetry';
import { captureException } from '@/lib/errorMonitoring';

export interface TrackOptions {
  /** Accuracy score vs reference (Swiss Ephemeris). 0–1. Triggers Sentry alert < 0.95. */
  accuracyScore?: number;
  /** Arbitrary key-value metadata included in the PostHog event. */
  metadata?: Record<string, unknown>;
}

export type TrackedCalculation = <T>(
  type: string,
  fn: () => T | Promise<T>,
  options?: TrackOptions
) => Promise<T>;

/**
 * Returns a `tracked()` function that times `fn`, emits a telemetry event,
 * and re-throws any error after capturing it.
 */
export function useTrackCalculation(): TrackedCalculation {
  return useCallback(async <T>(
    type: string,
    fn: () => T | Promise<T>,
    options: TrackOptions = {}
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);

      telemetry.trackCalculation({
        type,
        durationMs,
        accuracyScore: options.accuracyScore,
        metadata: options.metadata,
      });

      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      captureException(err instanceof Error ? err : new Error(String(err)), {
        context: `useTrackCalculation:${type}`,
        extra: { durationMs, ...options.metadata },
      });
      throw err;
    }
  }, []);
}
