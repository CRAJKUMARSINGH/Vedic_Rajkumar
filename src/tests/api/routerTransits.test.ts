/**
 * Regression tests for the `/v1/transits/:chartId` route's `asOf` handling.
 *
 * The route previously passed the raw query string straight into `new Date()`.
 * An unparseable value then produced an `Invalid Date`, silently propagating
 * `NaN` Julian days into the transit engine instead of a 422 to the caller.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/api/v1/router';

const snapshot = vi.fn(async (_natal: unknown, asOf: Date) => ({ asOf }));

vi.mock('@/api/v1/middleware/auth', () => ({
  authenticate: vi.fn(async () => ({
    keyId: 'k1',
    userId: 'u1',
    tier: 'free',
    scopes: ['transits:read'],
  })),
  requireScope: (ctx: { scopes: string[] }, scope: string) => ctx.scopes.includes(scope),
}));

vi.mock('@/services/transits/transitService', () => ({
  transitService: { snapshot: (natal: unknown, asOf: Date) => snapshot(natal, asOf) },
}));

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

describe('GET /v1/transits/:chartId — asOf validation', () => {
  beforeEach(() => snapshot.mockClear());

  it('rejects a malformed asOf with 422 instead of feeding NaN into the engine', async () => {
    const res = await api.request('/v1/transits/c1?asOf=not-a-date');
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_input');
    expect(snapshot).not.toHaveBeenCalled();
  });

  it('defaults to now when asOf is omitted', async () => {
    const res = await api.request('/v1/transits/c1');
    expect(res.status).toBe(200);
    const asOf = snapshot.mock.calls[0][1];
    expect(Number.isNaN(asOf.getTime())).toBe(false);
  });

  it('anchors a date-only asOf to UTC midnight (deterministic instant)', async () => {
    const res = await api.request('/v1/transits/c1?asOf=2025-01-01');
    expect(res.status).toBe(200);
    const asOf = snapshot.mock.calls[0][1];
    expect(asOf.toISOString().slice(0, 10)).toBe('2025-01-01');
    expect(asOf.getUTCHours()).toBe(0);
  });
});
