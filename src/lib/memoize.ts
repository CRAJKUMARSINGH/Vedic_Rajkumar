/**
 * memoize.ts — Week 8 Performance Optimization
 *
 * Typed memoization utilities for pure calculation functions.
 * Keeps results in a bounded in-memory LRU-style cache so hot paths
 * (e.g. repeated ayanamsa lookups, nakshatra lookups) don't recalculate.
 *
 * Usage — synchronous:
 *   import { memoize } from '@/lib/memoize';
 *   const getAyanamsa = memoize((year: number) => calculateAyanamsa(year));
 *   getAyanamsa(2026); // calculated
 *   getAyanamsa(2026); // from cache
 *
 * Usage — async:
 *   import { memoizeAsync } from '@/lib/memoize';
 *   const fetchPanchang = memoizeAsync(async (date: string) => api.getPanchang(date));
 *   await fetchPanchang('2026-10-07'); // fetched
 *   await fetchPanchang('2026-10-07'); // from cache
 */

// ─── Key serialisation ────────────────────────────────────────────────────────

/**
 * Converts function arguments into a stable string cache key.
 * Handles primitives, plain objects, and arrays.
 */
function makeKey(args: unknown[]): string {
  return args
    .map((a) => {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      if (typeof a !== 'object') return String(a);
      // Deterministic JSON for plain objects/arrays
      return JSON.stringify(a, Object.keys(a as object).sort());
    })
    .join('::');
}

// ─── LRU eviction ────────────────────────────────────────────────────────────

function evictIfNeeded<V>(cache: Map<string, V>, maxSize: number): void {
  if (cache.size >= maxSize) {
    // Evict the oldest insertion (Map preserves insertion order)
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

// ─── Synchronous memoize ──────────────────────────────────────────────────────

export interface MemoizeOptions {
  /**
   * Maximum number of entries to keep. Oldest entry is evicted on overflow.
   * Default: 256
   */
  maxSize?: number;
  /**
   * Custom key function. Receives the same args as the memoized function.
   * Useful when default JSON serialisation is too slow or unstable.
   */
  keyFn?: (...args: unknown[]) => string;
}

/**
 * Memoize a pure synchronous function.
 *
 * @param fn    The function to memoize
 * @param opts  Optional config (maxSize, custom keyFn)
 * @returns     A memoized version of fn
 */
export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  opts: MemoizeOptions = {}
): (...args: Args) => R {
  const maxSize = opts.maxSize ?? 256;
  const keyFn   = opts.keyFn as ((...args: Args) => string) | undefined;
  const cache   = new Map<string, R>();

  const memoized = (...args: Args): R => {
    const key = keyFn ? keyFn(...args) : makeKey(args as unknown[]);

    if (cache.has(key)) {
      // Move to end (refresh recency) by delete+re-insert
      const hit = cache.get(key) as R;
      cache.delete(key);
      cache.set(key, hit);
      return hit;
    }

    evictIfNeeded(cache, maxSize);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  /** Inspect or clear the underlying cache (useful in tests). */
  memoized.cache  = cache;
  memoized.clear  = () => cache.clear();
  memoized.delete = (...args: Args) => cache.delete(
    keyFn ? keyFn(...args) : makeKey(args as unknown[])
  );

  return memoized;
}

// ─── Async memoize ────────────────────────────────────────────────────────────

/**
 * Memoize an async function.
 * Concurrent calls with the same key share the same in-flight Promise —
 * the underlying function is called only once, regardless of how many
 * callers are awaiting it simultaneously.
 * Failed promises are removed from the cache so they can be retried.
 */
export function memoizeAsync<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  opts: MemoizeOptions = {}
): (...args: Args) => Promise<R> {
  const maxSize = opts.maxSize ?? 128;
  const keyFn   = opts.keyFn as ((...args: Args) => string) | undefined;
  const cache   = new Map<string, Promise<R>>();

  const memoized = (...args: Args): Promise<R> => {
    const key = keyFn ? keyFn(...args) : makeKey(args as unknown[]);

    if (cache.has(key)) {
      return cache.get(key) as Promise<R>;
    }

    evictIfNeeded(cache, maxSize);

    const promise = fn(...args).catch((err) => {
      // Remove failed entries so the next call retries
      cache.delete(key);
      throw err;
    });

    cache.set(key, promise);
    return promise;
  };

  memoized.cache  = cache;
  memoized.clear  = () => cache.clear();
  memoized.delete = (...args: Args) => cache.delete(
    keyFn ? keyFn(...args) : makeKey(args as unknown[])
  );

  return memoized;
}

// ─── Convenience: memoize with explicit TTL ───────────────────────────────────

/**
 * Like `memoize`, but cached values expire after `ttlMs` milliseconds.
 * Useful for calculations that are deterministic within a time window
 * (e.g. daily panchang, current transit snapshot).
 */
export function memoizeWithTTL<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  ttlMs: number,
  opts: Omit<MemoizeOptions, 'keyFn'> & { keyFn?: (...args: Args) => string } = {}
): (...args: Args) => R {
  const maxSize = opts.maxSize ?? 256;
  const keyFn   = opts.keyFn;
  const cache   = new Map<string, { value: R; expiresAt: number }>();

  return (...args: Args): R => {
    const key = keyFn ? keyFn(...args) : makeKey(args as unknown[]);
    const now = Date.now();

    const entry = cache.get(key);
    if (entry && entry.expiresAt > now) {
      return entry.value;
    }

    // Evict stale/overflow entries
    if (cache.size >= maxSize) {
      for (const [k, v] of cache) {
        if (v.expiresAt <= now) cache.delete(k);
        if (cache.size < maxSize) break;
      }
      if (cache.size >= maxSize) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
    }

    const result = fn(...args);
    cache.set(key, { value: result, expiresAt: now + ttlMs });
    return result;
  };
}
