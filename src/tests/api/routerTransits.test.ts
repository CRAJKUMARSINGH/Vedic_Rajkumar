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
    scopes: ['transits:read', 'charts:write'],
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

  it.each(['/v1/transits/c1', '/v1/transits/c1?asOf=2025-01-01'])('fails closed for %s without verified natal positions', async (path) => {
    const res = await api.request(path);
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe('chart_not_computed');
    expect(snapshot).not.toHaveBeenCalled();
  });

  it('does not return a fabricated chart on creation', async () => {
    const res = await api.request('/v1/charts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2000-01-01', time: '12:00', latitude: 0, longitude: 0, timezone: 'UTC' }),
    });
    expect(res.status).toBe(503);
    expect((await res.json()).error.code).toBe('compute_unavailable');
  });
});
