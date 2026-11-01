/**
 * POST /functions/v1/billing-portal -> { url }
 * Stripe-hosted customer portal: cancel, update card, download invoices.
 * Cheaper than building any of it.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { stripePost } from '../_shared/stripe.ts';
import { withTelemetry } from '../_shared/observability.ts';

Deno.serve(withTelemetry('billing-portal', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const auth = await authenticateRequest(req);
  if (!auth.userId) return jsonResponse({ error: 'unauthorized' }, 401, corsHeaders);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (!sub?.stripe_customer_id) return jsonResponse({ error: 'no_customer' }, 404, corsHeaders);

  const origin = req.headers.get('origin') ?? 'https://vedic-rajkumar.netlify.app';
  try {
    const session = await stripePost<{ url: string }>('/billing_portal/sessions', {
      customer: sub.stripe_customer_id,
      return_url: `${origin}/pricing`,
    });
    return jsonResponse({ url: session.url }, 200, corsHeaders);
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'stripe_error' }, 502, corsHeaders);
  }
}));
