/**
 * betaTrialService.ts
 *
 * Thin client for the `redeem-invite` edge function — the UI half of the beta
 * trial plumbing in supabase/migrations/20261126_beta_trials.sql.
 *
 * The database (public.claim_beta_invite) is the authority and the edge function
 * is the only writer; this module only turns an invite code into a typed,
 * renderable outcome. It never stores, logs or echoes the code.
 *
 * Confidentiality (AGENTS.md): no birth field and no email ever travels through
 * here — the code alone, and only to the authenticated caller's own trial.
 */

import { assertNotRateLimited } from '@/lib/rateLimiter';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

/** Outcomes the edge function maps to HTTP (see supabase/functions/redeem-invite). */
export type RedeemOutcome =
  | 'ok'
  | 'avoid_dup'
  | 'not_found'
  | 'email_mismatch'
  | 'already_redeemed';

export interface RedeemResult {
  /** Server outcome, or a locally-detected `invalid_code` / transport `error`. */
  outcome: RedeemOutcome | 'invalid_code' | 'error';
  /** Present only when a trial window exists (`ok` / `avoid_dup`). */
  cohort?: string;
  /** ISO expiry of the 7-day window; null when unknown. */
  expiresAt?: string | null;
}

const KNOWN: readonly RedeemOutcome[] = [
  'ok',
  'avoid_dup',
  'not_found',
  'email_mismatch',
  'already_redeemed',
];

function isOutcome(value: unknown): value is RedeemOutcome {
  return typeof value === 'string' && (KNOWN as readonly string[]).includes(value);
}

/**
 * A non-2xx response carries its explanation in the JSON body, reachable through
 * `FunctionsHttpError.context` (a readable Response). Read it without throwing.
 */
async function readErrorCode(error: unknown): Promise<string | undefined> {
  const context = (error as { context?: Response })?.context;
  if (!context || typeof context.json !== 'function') return undefined;
  try {
    const body = (await context.json()) as { outcome?: unknown; error?: unknown };
    if (isOutcome(body?.outcome)) return body.outcome;
    return typeof body?.error === 'string' ? body.error : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Redeem a single-use beta invite for the signed-in caller.
 *
 * @param supabase an AUTHENTICATED client (useAuthenticatedSupabase) — the edge
 *   function derives the user and email from the verified JWT.
 * @param rawCode the invite code, as typed.
 * @throws if the client-side guess limiter is exhausted (the UI shows the message).
 */
export async function redeemBetaInvite(
  supabase: SupabaseClient<Database>,
  rawCode: string,
): Promise<RedeemResult> {
  const code = rawCode.trim();

  // The code is a bearer secret; limit guesses for UX. The server stays the
  // authority (single-use atomic claim + the kill_beta_trial switch).
  assertNotRateLimited('redeem-invite', { capacity: 5, refillAmount: 5, windowMs: 60_000 });

  const { data, error } = await supabase.functions.invoke('redeem-invite', { body: { code } });

  if (error) {
    const reason = await readErrorCode(error);
    if (reason === 'invalid_code') return { outcome: 'invalid_code' };
    if (isOutcome(reason)) return { outcome: reason };
    return { outcome: 'error' };
  }

  const body = (data ?? {}) as { outcome?: unknown; cohort?: unknown; expiresAt?: unknown };
  if (!isOutcome(body.outcome)) return { outcome: 'error' };

  return {
    outcome: body.outcome,
    cohort: typeof body.cohort === 'string' ? body.cohort : undefined,
    expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : null,
  };
}

export default redeemBetaInvite;
