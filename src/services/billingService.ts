/**
 * billingService.ts — thin client over the billing edge functions.
 * The client never sends a price id, only a plan name and a region.
 */
import { supabase } from '@/integrations/supabase/client';

export type BillingPlan = 'pro' | 'enterprise';
export type BillingRegion = 'in' | 'intl';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function post(path: string, body: unknown): Promise<{ url?: string; error?: string }> {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${base}/functions/v1/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({ error: 'bad_response' }));
}

/** Redirects to Stripe Checkout. Server resolves the price id. */
export async function startCheckout(plan: BillingPlan = 'pro', region: BillingRegion = 'intl'): Promise<void> {
  const { url, error } = await post('billing-checkout', { plan, region });
  if (error || !url) throw new Error(error ?? 'checkout_failed');
  window.location.assign(url);
}

/** Opens the Stripe customer portal (cancel / card / invoices). */
export async function openBillingPortal(): Promise<void> {
  const { url, error } = await post('billing-portal', {});
  if (error || !url) throw new Error(error ?? 'portal_failed');
  window.location.assign(url);
}

export function inferRegion(): BillingRegion {
  try {
    return (Intl.DateTimeFormat().resolvedOptions().timeZone ?? '').includes('Kolkata') ? 'in' : 'intl';
  } catch {
    return 'intl';
  }
}
