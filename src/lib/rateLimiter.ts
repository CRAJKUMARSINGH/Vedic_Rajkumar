/**
 * rateLimiter.ts
 *
 * Client-side token-bucket rate limiter for expensive endpoints.
 *
 * Prevents a single user session from hammering AI or computation-heavy
 * Supabase edge functions. State is kept in memory (per page session) so
 * it resets on page refresh — the server-side rate_limit_log table is the
 * authoritative source for cross-session enforcement.
 *
 * Usage:
 *   const limiter = getRateLimiter('prashna-ai');
 *   if (!limiter.tryConsume()) {
 *     throw new Error(`Rate limit: retry in ${limiter.retryAfterSeconds()}s`);
 *   }
 */

interface BucketState {
  tokens: number;
  lastRefillAt: number; // Date.now() ms
}

interface RateLimiterOptions {
  /** Max tokens in the bucket (= max burst). Default: 10 */
  capacity?: number;
  /** How many tokens are restored per window. Default: capacity */
  refillAmount?: number;
  /** Window duration in milliseconds. Default: 60_000 (1 minute) */
  windowMs?: number;
}

const DEFAULT_CAPACITY = 10;
const DEFAULT_WINDOW_MS = 60_000;

// Singleton map of endpoint → bucket state
const buckets = new Map<string, BucketState>();

function getBucket(endpoint: string, opts: Required<RateLimiterOptions>): BucketState {
  if (!buckets.has(endpoint)) {
    buckets.set(endpoint, {
      tokens: opts.capacity,
      lastRefillAt: Date.now(),
    });
  }
  return buckets.get(endpoint)!;
}

function refill(bucket: BucketState, opts: Required<RateLimiterOptions>): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefillAt;
  if (elapsed >= opts.windowMs) {
    const windows = Math.floor(elapsed / opts.windowMs);
    bucket.tokens = Math.min(opts.capacity, bucket.tokens + windows * opts.refillAmount);
    bucket.lastRefillAt = now;
  }
}

export interface RateLimiter {
  /** Try to consume 1 token. Returns true if allowed, false if rate-limited. */
  tryConsume(): boolean;
  /** Remaining tokens before the next refill. */
  remaining(): number;
  /** Seconds until the bucket refills. */
  retryAfterSeconds(): number;
}

/**
 * Get (or create) a named rate limiter.
 * Multiple calls with the same `endpoint` return limiters sharing the same bucket.
 */
export function getRateLimiter(endpoint: string, options: RateLimiterOptions = {}): RateLimiter {
  const opts: Required<RateLimiterOptions> = {
    capacity: options.capacity ?? DEFAULT_CAPACITY,
    refillAmount: options.refillAmount ?? (options.capacity ?? DEFAULT_CAPACITY),
    windowMs: options.windowMs ?? DEFAULT_WINDOW_MS,
  };

  return {
    tryConsume(): boolean {
      const bucket = getBucket(endpoint, opts);
      refill(bucket, opts);
      if (bucket.tokens > 0) {
        bucket.tokens -= 1;
        return true;
      }
      return false;
    },

    remaining(): number {
      const bucket = getBucket(endpoint, opts);
      refill(bucket, opts);
      return bucket.tokens;
    },

    retryAfterSeconds(): number {
      const bucket = getBucket(endpoint, opts);
      const elapsed = Date.now() - bucket.lastRefillAt;
      const remaining = opts.windowMs - elapsed;
      return Math.max(0, Math.ceil(remaining / 1000));
    },
  };
}

/**
 * Convenience wrapper: throws a descriptive error if rate limited.
 * Use in service functions before calling expensive edge functions.
 */
export function assertNotRateLimited(
  endpoint: string,
  options?: RateLimiterOptions,
): void {
  const limiter = getRateLimiter(endpoint, options);
  if (!limiter.tryConsume()) {
    const wait = limiter.retryAfterSeconds();
    throw new Error(
      `Rate limit reached for "${endpoint}". ` +
      `Please wait ${wait} second${wait !== 1 ? 's' : ''} before trying again.`,
    );
  }
}
