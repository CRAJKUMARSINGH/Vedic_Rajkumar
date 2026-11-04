import { describe, it, expect } from 'vitest';
import { consume, refill, freshBucket, refillPerMs, rateLimitHeaders } from '@/api/rateLimit/algorithm';
import { RATE_LIMITS } from '@/api/v1/scopes';

describe('rate limit algorithm — token bucket', () => {
  const now = 1_700_000_000_000;

  it('starts full so the first burst is allowed', () => {
    const d = consume(null, now, { rpm: 60, burst: 5 });
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(4);
  });

  it('exhausts after burst requests and reports retry', () => {
    let state = null;
    for (let i = 0; i < 5; i++) state = consume(state, now, { rpm: 60, burst: 5 }).next;
    const denied = consume(state, now, { rpm: 60, burst: 5 });
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it('refills at exactly rpm per minute', () => {
    const rate = refillPerMs(60); // 1 token / second
    const drained = { tokens: 0, lastRefillMs: now };
    expect(refill(drained, now + 1_000, 5, rate).tokens).toBeCloseTo(1);
    expect(refill(drained, now + 60_000, 5, rate).tokens).toBeCloseTo(5);
  });

  it('never exceeds capacity on a long idle gap', () => {
    const state = { tokens: 0, lastRefillMs: now };
    expect(refill(state, now + 10 * 60_000, 5, refillPerMs(60)).tokens).toBe(5);
  });

  it('never moves time backwards', () => {
    const state = { tokens: 2, lastRefillMs: now };
    expect(refill(state, now - 5_000, 5, refillPerMs(60)).tokens).toBe(2);
  });

  it('charges a weighted cost atomically (or not at all)', () => {
    const full = freshBucket(now, 5);
    const ok = consume(full, now, { rpm: 60, burst: 5, cost: 3 });
    expect(ok.allowed).toBe(true);
    expect(ok.remaining).toBe(2);

    const no = consume(full, now, { rpm: 60, burst: 5, cost: 9 });
    expect(no.allowed).toBe(false);
    expect(no.next.tokens).toBe(5); // unchanged, not partially spent
  });

  it('emits headers, Retry-After only when denied', () => {
    expect(rateLimitHeaders({ limit: 20, remaining: 3, retryAfterMs: 0 })).not.toHaveProperty('Retry-After');
    expect(rateLimitHeaders({ limit: 20, remaining: 0, retryAfterMs: 2500 })['Retry-After']).toBe('3');
  });
});

describe('rate limit tiers are monotonic', () => {
  it('every paid tier is at least as generous as the one below it', () => {
    const order = ['free', 'developer', 'business', 'enterprise'] as const;
    for (let i = 1; i < order.length; i++) {
      expect(RATE_LIMITS[order[i]].rpm).toBeGreaterThan(RATE_LIMITS[order[i - 1]].rpm);
      expect(RATE_LIMITS[order[i]].dailyQuota).toBeGreaterThan(RATE_LIMITS[order[i - 1]].dailyQuota);
    }
  });
});
