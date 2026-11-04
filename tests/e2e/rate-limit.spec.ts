/**
 * rate-limit.spec.ts — robotic proof that the limit is enforced and that headers
 * are present. Runs against the deployed/preview edge; skipped when unreachable.
 */
import { test, expect } from '@playwright/test';

const EDGE = process.env.EDGE_URL ?? '';
const endpoint = `${EDGE}/functions/v1/tier-entitlement`;

test.describe('rate limit headers', () => {
  test.skip(!EDGE, 'set EDGE_URL to run');

  test('advertises the policy on every response', async ({ request }) => {
    const res = await request.get(endpoint);
    expect(res.headers()['x-ratelimit-policy']).toMatch(/w=60/);
    expect(res.headers()['x-ratelimit-limit']).toBeTruthy();
  });

  test('burst then 429 with Retry-After', async ({ request }) => {
    let sawLimit = false;
    for (let i = 0; i < 60; i++) {
      const res = await request.get(endpoint);
      if (res.status() === 429) {
        sawLimit = true;
        expect(res.headers()['retry-after']).toBeTruthy();
        expect((await res.json()).error).toMatch(/rate_limited|quota_exceeded/);
        break;
      }
    }
    expect(sawLimit, 'expected a 429 within 60 sequential requests').toBe(true);
  });
});
