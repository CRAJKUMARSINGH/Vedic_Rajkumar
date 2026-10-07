import { RATE_LIMITS, type Tier } from '../v1/scopes';

export interface BucketState {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * In-memory token bucket. In production, back this with Redis (Upstash)
 * keyed by API key so it survives across edge isolates.
 */
export const consume = (
  key: string,
  tier: Tier,
  store: Map<string, BucketState>,
  now = Date.now(),
): RateLimitResult => {
  const { rpm, burst } = RATE_LIMITS[tier] ?? RATE_LIMITS.free;
  const refillRate = rpm / 60000; // tokens per ms
  const state = store.get(key) ?? { tokens: burst, lastRefill: now };

  const elapsed = now - state.lastRefill;
  state.tokens = Math.min(burst, state.tokens + elapsed * refillRate);
  state.lastRefill = now;

  const allowed = state.tokens >= 1;
  if (allowed) state.tokens -= 1;
  store.set(key, state);

  const resetMs = Math.ceil((burst - state.tokens) / refillRate);
  return { allowed, remaining: Math.floor(state.tokens), limit: rpm, resetMs };
};

/** Standard rate-limit response headers. */
export const rateLimitHeaders = (r: RateLimitResult): Record<string, string> => ({
  'X-RateLimit-Limit': String(r.limit),
  'X-RateLimit-Remaining': String(Math.max(0, r.remaining)),
  'X-RateLimit-Reset': String(Math.ceil(r.resetMs / 1000)),
});
