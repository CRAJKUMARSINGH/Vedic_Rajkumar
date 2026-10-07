import { describe, it, expect } from 'vitest';
import { consume } from '@/api/rateLimit/bucket';

describe('Rate limiter', () => {
  it('allows up to burst then blocks', () => {
    const store = new Map();
    let allowed = 0;
    for (let i = 0; i < 50; i++) {
      if (consume('k', 'free', store).allowed) allowed++;
    }
    expect(allowed).toBeLessThanOrEqual(40); // burst cap for free tier
  });

  it('reports correct remaining and headers metadata', () => {
    const store = new Map();
    const res = consume('test_key', 'developer', store);
    expect(res.allowed).toBe(true);
    expect(res.limit).toBe(120);
    expect(res.remaining).toBeLessThan(240);
  });
});
