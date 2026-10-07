/**
 * useChartCache — Week 8 Performance Optimization
 *
 * React hook that wraps a chart calculation function with an IndexedDB
 * cache layer. On the first call it runs the calculation and stores the
 * result. On subsequent calls with the same inputs it returns the cached
 * value immediately without recalculating.
 *
 * Usage:
 *   const { calculate, isLoading, data, error, cacheHit } = useChartCache();
 *
 *   // In an event handler:
 *   await calculate(birthData, async (bd) => {
 *     return await vedicApi.calculateKundli(bd);
 *   });
 */

import { useState, useCallback } from 'react';
import {
  cacheChart,
  getCachedChart,
  type ChartCacheKey,
} from '@/lib/cache';
import { telemetry } from '@/lib/telemetry';

export interface UseChartCacheResult<T> {
  /** Trigger a (possibly cached) calculation */
  calculate: (
    key: ChartCacheKey,
    fn: (key: ChartCacheKey) => Promise<T>
  ) => Promise<T | null>;
  /** True while fn is running */
  isLoading: boolean;
  /** Most recent result (cached or fresh) */
  data: T | null;
  /** Error from the last failed calculation */
  error: Error | null;
  /** True if the last result came from cache */
  cacheHit: boolean;
  /** Clear current state */
  reset: () => void;
}

export function useChartCache<T = unknown>(): UseChartCacheResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData]           = useState<T | null>(null);
  const [error, setError]         = useState<Error | null>(null);
  const [cacheHit, setCacheHit]   = useState(false);

  const calculate = useCallback(
    async (
      key: ChartCacheKey,
      fn: (key: ChartCacheKey) => Promise<T>
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // ── 1. Cache look-up ─────────────────────────────────────────────
        const cached = await getCachedChart(key);
        if (cached !== null) {
          setData(cached as T);
          setCacheHit(true);
          telemetry.trackFeature('chart_cache_hit', {
            ayanamsa: key.ayanamsa ?? 'Lahiri',
          });
          return cached as T;
        }

        // ── 2. Fresh calculation ─────────────────────────────────────────
        setCacheHit(false);
        const start = performance.now();
        const result = await fn(key);
        const durationMs = Math.round(performance.now() - start);

        // ── 3. Store in cache ────────────────────────────────────────────
        await cacheChart(key, result);

        telemetry.trackCalculation({
          type: 'kundli',
          durationMs,
          metadata: { cached: false, ayanamsa: key.ayanamsa ?? 'Lahiri' },
        });

        setData(result);
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setCacheHit(false);
    setIsLoading(false);
  }, []);

  return { calculate, isLoading, data, error, cacheHit, reset };
}
