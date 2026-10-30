/**
 * GET /functions/v1/tier-entitlement -> canonical server entitlement for the caller.
 * Anonymous callers get 'free' with 200 (not 401) so the client never blocks on it.
 */
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { resolveEntitlement } from '../_shared/entitlements.ts';
import { withTelemetry } from '../_shared/observability.ts';

Deno.serve(withTelemetry('tier-entitlement', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const auth = await authenticateRequest(req);
  if (!auth.userId) return jsonResponse({ tier: 'free', anonymous: true }, 200, corsHeaders);

  const ent = await resolveEntitlement(auth.client, auth.userId);
  return jsonResponse(ent, 200, { ...corsHeaders, 'cache-control': 'private, max-age=60' });
}));
