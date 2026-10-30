/**
 * algorithm.ts — THE token-bucket math. Pure, no store, no clock, no env.
 *
 * Shared by the browser (UX preview) and the edge (enforcement) via the import
 * map added in ADR-003. The SQL function public.admit_request() implements the
 * same math; rateLimit.test.ts pins the TS side so a divergence is visible.
 *
 * A client-side limit is UX. Only the shared store is enforcement.
 */

export interface BucketState {
  tokens: number;
  lastRefillMs: number;
}

export interface BucketDecision {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterMs: number;
  next: BucketState;
}

export interface BucketParams {
  /** requests per minute */
  rpm: number;
  /** max burst (bucket capacity) */
  burst: number;
  /** tokens to spend (default 1; a swiss-ephemeris chart costs more) */
  cost?: number;
}

const MINUTE_MS = 60_000;

export const refillPerMs = (rpm: number): number => rpm / MINUTE_MS;

/** Refill without exceeding capacity. Never moves time backwards. */
export function refill(state: BucketState, nowMs: number, capacity: number, ratePerMs: number): BucketState {
  const elapsed = Math.max(0, nowMs - state.lastRefillMs);
  return {
    tokens: Math.min(capacity, state.tokens + elapsed * ratePerMs),
    lastRefillMs: nowMs,
  };
}

/** A fresh, full bucket. */
export function freshBucket(nowMs: number, capacity: number): BucketState {
  return { tokens: capacity, lastRefillMs: nowMs };
}

/**
 * Consume `cost` tokens. Returns the decision plus the state to persist.
 * `state === null` means "first request for this key" -> start full (burst).
 */
export function consume(
  state: BucketState | null,
  nowMs: number,
  { rpm, burst, cost = 1 }: BucketParams,
): BucketDecision {
  const rate = refillPerMs(rpm);
  const current = refill(state ?? freshBucket(nowMs, burst), nowMs, burst, rate);
  const spend = Math.max(1, cost);

  if (current.tokens >= spend) {
    const next = { tokens: current.tokens - spend, lastRefillMs: nowMs };
    return { allowed: true, remaining: Math.floor(next.tokens), limit: rpm, retryAfterMs: 0, next };
  }

  const deficit = spend - current.tokens;
  const retryAfterMs = rate > 0 ? Math.ceil(deficit / rate) : MINUTE_MS;
  return { allowed: false, remaining: 0, limit: rpm, retryAfterMs, next: current };
}

/** Standard headers. `Retry-After` is only meaningful on a 429. */
export function rateLimitHeaders(d: Pick<BucketDecision, 'limit' | 'remaining' | 'retryAfterMs'>, policy?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(d.limit),
    'X-RateLimit-Remaining': String(Math.max(0, d.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(d.retryAfterMs / 1000)),
  };
  if (d.retryAfterMs > 0) headers['Retry-After'] = String(Math.ceil(d.retryAfterMs / 1000));
  if (policy) headers['X-RateLimit-Policy'] = policy;
  return headers;
}
