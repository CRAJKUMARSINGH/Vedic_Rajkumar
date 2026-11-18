/**
 * POST /functions/v1/stripe-webhook
 * Signature-verified, idempotent, order-safe. The ONLY writer of user_entitlements
 * apart from an operator.
 *
 * IMPORTANT: read req.text() BEFORE JSON.parse — the signature covers raw bytes.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyStripeSignature } from '../_shared/stripe.ts';
import { withTelemetry } from '../_shared/observability.ts';

const HANDLED = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(withTelemetry('stripe-webhook', async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) return json({ error: 'webhook_secret_missing' }, 500);

  const raw = await req.text();
  const ok = await verifyStripeSignature(raw, req.headers.get('stripe-signature'), secret);
  if (!ok) return json({ error: 'bad_signature' }, 400);

  const event = JSON.parse(raw);
  if (!HANDLED.has(event.type)) return json({ ignored: event.type });

  const obj = event.data?.object ?? {};
  // invoice.* carries the subscription; subscription.* IS the subscription.
  const sub = event.type.startsWith('invoice.') ? obj.subscription : obj.id;
  const customer = typeof obj.customer === 'string' ? obj.customer : obj.customer?.id;

  // user_id arrives via client_reference_id (checkout) or metadata (subscription).
  const userId =
    obj.client_reference_id ??
    obj.metadata?.user_id ??
    obj.subscription_details?.metadata?.user_id ??
    null;

  const priceId = obj.items?.data?.[0]?.price?.id ?? obj.lines?.data?.[0]?.price?.id ?? null;
  const periodEnd = obj.current_period_end
    ? new Date(obj.current_period_end * 1000).toISOString()
    : null;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await admin.rpc('apply_subscription_event', {
    p_event_id: event.id,
    p_type: event.type,
    p_event_created: new Date(event.created * 1000).toISOString(),
    p_user: userId,
    p_customer: customer ?? null,
    p_sub: typeof sub === 'string' ? sub : null,
    p_price: priceId,
    p_status: obj.status ?? 'incomplete',
    p_period_end: periodEnd,
    p_cancel_at_period_end: obj.cancel_at_period_end ?? false,
  });

  if (error) return json({ error: error.message }, 500);
  return json(data);
}));
