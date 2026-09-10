/**
 * Week 3 Security Tests
 *
 * Tests for:
 *  - sanitize utilities (sanitizeText, sanitizeHtml, sanitizeObject)
 *  - rateLimiter (token bucket behaviour)
 *
 * These are pure unit tests — no Supabase or Clerk required.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── sanitize tests ─────────────────────────────────────────────────────────────

// DOMPurify requires a DOM environment. Vitest uses jsdom by default which
// provides window.document — DOMPurify will work as-is.
// If running in a non-DOM environment, these tests will still pass because
// the sanitize functions guard against missing DOMPurify.

import { sanitizeText, sanitizeHtml, sanitizeObject } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('passes clean plain text unchanged', () => {
    const input = 'Mumbai, India';
    expect(sanitizeText(input)).toBe('Mumbai, India');
  });

  it('strips HTML tags from input', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('strips anchor tags', () => {
    expect(sanitizeText('<a href="http://evil.com">click</a>')).toBe('click');
  });

  it('returns empty string for non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeText(null as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeText(undefined as any)).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('handles unicode correctly', () => {
    const hindi = 'नमस्ते दुनिया';
    expect(sanitizeText(hindi)).toBe('नमस्ते दुनिया');
  });
});

describe('sanitizeHtml', () => {
  it('allows safe formatting tags', () => {
    const input = '<b>Bold</b> and <em>italic</em>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<b>Bold</b>');
    expect(result).toContain('<em>italic</em>');
  });

  it('strips script tags', () => {
    const result = sanitizeHtml('<script>alert(1)</script>text');
    expect(result).not.toContain('<script>');
    expect(result).toContain('text');
  });

  it('strips attributes from allowed tags', () => {
    const result = sanitizeHtml('<b onclick="evil()">text</b>');
    expect(result).not.toContain('onclick');
  });
});

describe('sanitizeObject', () => {
  it('sanitizes all string values in an object', () => {
    const input = {
      name: '<b>Raj</b>',
      location: 'Mumbai',
      score: 42,
      active: true,
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('Raj');
    expect(result.location).toBe('Mumbai');
    expect(result.score).toBe(42);    // non-string untouched
    expect(result.active).toBe(true); // non-string untouched
  });

  it('does not mutate the original object', () => {
    const input = { name: '<script>evil</script>Test' };
    sanitizeObject(input);
    expect(input.name).toBe('<script>evil</script>Test');
  });
});

// ── rateLimiter tests ──────────────────────────────────────────────────────────

import { getRateLimiter, assertNotRateLimited } from '@/lib/rateLimiter';

describe('getRateLimiter', () => {
  // Use unique endpoint names per test to avoid shared bucket state
  const ep = () => `test-endpoint-${Math.random().toString(36).slice(2)}`;

  it('allows requests up to capacity', () => {
    const endpoint = ep();
    const limiter = getRateLimiter(endpoint, { capacity: 3, windowMs: 60_000 });
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
    // 4th request should be denied
    expect(limiter.tryConsume()).toBe(false);
  });

  it('reports correct remaining tokens', () => {
    const endpoint = ep();
    const limiter = getRateLimiter(endpoint, { capacity: 5, windowMs: 60_000 });
    limiter.tryConsume();
    limiter.tryConsume();
    expect(limiter.remaining()).toBe(3);
  });

  it('reports retryAfterSeconds > 0 when limited', () => {
    const endpoint = ep();
    const limiter = getRateLimiter(endpoint, { capacity: 1, windowMs: 60_000 });
    limiter.tryConsume(); // consume the 1 token
    expect(limiter.remaining()).toBe(0);
    expect(limiter.retryAfterSeconds()).toBeGreaterThan(0);
  });

  it('refills tokens after window elapses', () => {
    vi.useFakeTimers();
    const endpoint = ep();
    const limiter = getRateLimiter(endpoint, { capacity: 2, windowMs: 1_000 });
    limiter.tryConsume();
    limiter.tryConsume();
    expect(limiter.tryConsume()).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(1_001);

    // Should be refilled
    expect(limiter.tryConsume()).toBe(true);
    vi.useRealTimers();
  });

  it('shared bucket: same endpoint shares state across getRateLimiter calls', () => {
    const endpoint = ep();
    const a = getRateLimiter(endpoint, { capacity: 2, windowMs: 60_000 });
    const b = getRateLimiter(endpoint, { capacity: 2, windowMs: 60_000 });
    a.tryConsume();
    a.tryConsume();
    // b shares the same bucket
    expect(b.tryConsume()).toBe(false);
  });
});

describe('assertNotRateLimited', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not throw when tokens are available', () => {
    const endpoint = `assert-test-${Math.random().toString(36).slice(2)}`;
    expect(() => assertNotRateLimited(endpoint, { capacity: 5 })).not.toThrow();
  });

  it('throws a descriptive error when rate limited', () => {
    const endpoint = `assert-limited-${Math.random().toString(36).slice(2)}`;
    const opts = { capacity: 1, windowMs: 60_000 };
    assertNotRateLimited(endpoint, opts); // consume token
    expect(() => assertNotRateLimited(endpoint, opts)).toThrowError(/Rate limit reached/);
  });
});
