/**
 * POST /functions/v1/billing-checkout  { plan, region } -> { url }
 * The server owns the price id: the client picks a plan NAME, not a price.
 */
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { stripePost } from '../_shared/stripe.ts';
import { withTelemetry } from '../_shared/observability.ts';

/** plan:region -> Stripe price id. Replace with real ids. */
const PRICES: Record<string, string> = {
  'pro:in': 'price_REPLACE_pro_monthly_inr',
  'pro:intl': 'price_REPLACE_pro_monthly_usd',
  'enterprise:intl': 'price_REPLACE_ent_monthly_usd',
};

Deno.serve(withTelemetry('billing-checkout', async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405, corsHeaders);

  const auth = await authenticateRequest(req);
  if (!auth.userId) return jsonResponse({ error: 'unauthorized' }, 401, corsHeaders);

  const { plan = 'pro', region = 'intl' } = await req.json().catch(() => ({}));
  const price = PRICES[`${plan}:${region}`];
  if (!price) return jsonResponse({ error: 'unknown_plan_region', plan, region }, 400, corsHeaders);

  const origin = req.headers.get('origin') ?? 'https://vedic-rajkumar.netlify.app';

  try {
    const session = await stripePost<{ id: string; url: string }>('/checkout/sessions', {
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      client_reference_id: auth.userId,
      subscription_data: { metadata: { user_id: auth.userId } },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },   // GST / VAT
      tax_id_collection: { enabled: true },
      customer_creation: 'always',
      success_url: `${origin}/pricing?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });
    return jsonResponse({ url: session.url, sessionId: session.id }, 200, corsHeaders);
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'stripe_error' }, 502, corsHeaders);
  }
}));
