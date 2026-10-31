import { RATE_LIMITS, type Tier } from '../v1/scopes';
import { consume as consumeAlgo, rateLimitHeaders as headersAlgo, type BucketState } from './algorithm';

export type { BucketState };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * In-memory token bucket — the LOCAL PREVIEW path only.
 *
 * Kept for the browser (instant UI feedback) and for local dev. The authority is
 * the shared store; see supabase/functions/_shared/ratelimit.ts and
 * docs/api/RATE_LIMITS.md.
 */
export const consume = (
  key: string,
  tier: Tier,
  store: Map<string, BucketState>,
  now = Date.now(),
): RateLimitResult => {
  const { rpm, burst } = RATE_LIMITS[tier] ?? RATE_LIMITS.free;
  const decision = consumeAlgo(store.get(key) ?? null, now, { rpm, burst });
  store.set(key, decision.next);
  return {
    allowed: decision.allowed,
    remaining: decision.remaining,
    limit: decision.limit,
    resetMs: decision.retryAfterMs,
  };
};

/** Human-readable description of the policy, for the X-RateLimit-Policy header. */
export const policyFor = (tier: Tier): string => {
  const { rpm, burst, dailyQuota } = RATE_LIMITS[tier] ?? RATE_LIMITS.free;
  return `${rpm};w=60;burst=${burst};quota=${dailyQuota}/day`;
};

/** Strip local-only state when reporting headers. */
export const rateLimitHeaders = (
  r: RateLimitResult,
  policy?: string,
): Record<string, string> => headersAlgo({ limit: r.limit, remaining: r.remaining, retryAfterMs: r.resetMs }, policy);

