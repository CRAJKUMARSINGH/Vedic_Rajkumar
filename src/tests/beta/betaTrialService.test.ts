/**
 * betaTrialService.test.ts
 *
 * Deterministic cover for the /beta redeem path: the invite code reaches the
 * `redeem-invite` edge function, and each server outcome (including the ones
 * carried on a non-2xx body) maps to the right typed result the page renders.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { redeemBetaInvite } from '@/services/betaTrialService';

vi.mock('@/lib/rateLimiter');

type Invoke = ReturnType<typeof vi.fn>;
const client = () => ({ functions: { invoke: vi.fn() as Invoke } });

/** A stand-in for supabase-js FunctionsHttpError: the body sits behind `.context`. */
const httpError = (body: unknown) => ({
  name: 'FunctionsHttpError',
  context: { json: async () => body },
});

describe('betaTrialService.redeemBetaInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the trimmed code and returns the granted window on success', async () => {
    const supabase = client();
    supabase.functions.invoke.mockResolvedValue({
      data: { outcome: 'ok', cohort: 'intermediate', expiresAt: '2026-11-07T10:00:00.000Z' },
      error: null,
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, '  VR-BETA-12345  ');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('redeem-invite', {
      body: { code: 'VR-BETA-12345' },
    });
    expect(result).toEqual({
      outcome: 'ok',
      cohort: 'intermediate',
      expiresAt: '2026-11-07T10:00:00.000Z',
    });
  });

  it('reads the outcome from a non-2xx body (already_redeemed / 409)', async () => {
    const supabase = client();
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: httpError({ outcome: 'already_redeemed' }),
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, 'VR-BETA-12345');

    expect(result).toEqual({ outcome: 'already_redeemed' });
  });

  it('maps a 404 body to not_found', async () => {
    const supabase = client();
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: httpError({ outcome: 'not_found' }),
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, 'VR-NOPE-000000');

    expect(result.outcome).toBe('not_found');
  });

  it('maps a 400 { error: invalid_code } body to invalid_code', async () => {
    const supabase = client();
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: httpError({ error: 'invalid_code' }),
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, 'short');

    expect(result.outcome).toBe('invalid_code');
  });

  it('collapses an opaque transport failure to error', async () => {
    const supabase = client();
    // supabase-js resolves (never rejects) for a network failure: FunctionsFetchError
    // carries no readable JSON body, so there is no outcome to trust.
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { name: 'FunctionsFetchError' },
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, 'VR-BETA-12345');

    expect(result).toEqual({ outcome: 'error' });
  });

  it('never trusts an unknown outcome from the server', async () => {
    const supabase = client();
    supabase.functions.invoke.mockResolvedValue({
      data: { outcome: 'root_access_granted' },
      error: null,
    });

    const result = await redeemBetaInvite(supabase as unknown as SupabaseClient<Database>, 'VR-BETA-12345');

    expect(result.outcome).toBe('error');
  });
});
