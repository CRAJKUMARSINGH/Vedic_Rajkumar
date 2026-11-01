/**
 * _shared/tierGate.ts — server-side gate helpers.
 *
 * Usage in any edge function:
 *   const ent = await resolveEntitlement(auth.client, auth.userId);
 *   const denied = requireFeature(ent, 'white_label');
 *   if (denied) return denied;
 */
import type { ResolvedEntitlement } from './entitlements.ts';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

/** 402 Payment Required when the tier lacks the flag. */
export function requireFeature(ent: ResolvedEntitlement, flag: string): Response | null {
  if (ent.features.includes(flag)) return null;
  return json({ error: 'feature_not_in_tier', feature: flag, tier: ent.tier }, 402);
}

/** 429 Too Many Requests when the quota is spent. `limit === -1` is unlimited. */
export function requireQuota(used: number, limit: number, what: string): Response | null {
  if (limit === -1 || used < limit) return null;
  return json({ error: 'quota_exceeded', quota: what, limit }, 429);
}
