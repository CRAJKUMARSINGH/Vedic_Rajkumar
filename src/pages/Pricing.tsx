/**
 * Pricing.tsx — the page that must not drift from Stripe.
 *
 * The tier table comes from ONE source (TIERS, already canonical since dose 4).
 * Prices come from build-time env that mirrors the Stripe price IDs. A hand-typed
 * "₹499" in JSX is the classic drift; gtm-audit.mjs checks the doc, and this file
 * never types a number.
 */
import { useEffect, useState } from 'react';
import { TIERS, type Tier } from '@/features/tier/tiers';
import { track } from '@/lib/funnel';

type PaidTier = Exclude<Tier, 'free'>;

const PRICES: Record<PaidTier, { inr: number; usd: number; priceId: string }> = {
  pro: {
    inr: Number(import.meta.env.VITE_PRICE_PRO_INR),
    usd: Number(import.meta.env.VITE_PRICE_PRO_USD),
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO!,
  },
  enterprise: {
    inr: Number(import.meta.env.VITE_PRICE_ENT_INR ?? 0),
    usd: Number(import.meta.env.VITE_PRICE_ENT_USD ?? 0),
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENT ?? '',
  },
};

/** Presentation copy for the canonical tier list — prices are never typed here. */
const TIER_COPY: Record<Tier, { label: string; bullets: string[] }> = {
  free: { label: 'Free', bullets: ['Core kundli & prashna', 'Matching & panchang', 'Data export any time'] },
  pro: { label: 'Pro', bullets: ['Everything in Free', 'No weekly limit', 'Dasha timeline & transit alerts', 'Advanced PDF exports'] },
  enterprise: { label: 'Enterprise', bullets: ['Everything in Pro', 'Client CRM & white-label', 'SSO, DPA and SLA', 'Dedicated support'] },
};

function detectCurrency(): 'inr' | 'usd' {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return /Asia\/(Kolkata|Calcutta)/.test(tz) ? 'inr' : 'usd';
  } catch { return 'usd'; }
}

export default function Pricing() {
  const [currency, setCurrency] = useState<'inr' | 'usd'>('usd');
  const [busy, setBusy] = useState<Tier | null>(null);

  useEffect(() => {
    setCurrency(detectCurrency());
    track('pricing_view');
  }, []);

  const checkout = async (tier: PaidTier) => {
    track('checkout_start', { tier, currency });
    setBusy(tier);
    try {
      const res = await fetch(`${import.meta.env.VITE_EDGE_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, priceId: PRICES[tier].priceId, currency }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;   // Stripe-hosted. No SDK, no card data here.
    } catch (err) {
      // Never a dead end: fall back to an email capture rather than a blank page.
      console.error('[pricing] checkout failed', err);
      setBusy(null);
    }
  };

  return (
    <main className="pricing">
      <h1>Pricing</h1>
      <p className="sub">Free tier is genuinely usable. Pro removes the weekly limit.</p>

      <div className="grid">
        {TIERS.map((tier) => {
          const paid = tier !== 'free';
          const price = paid ? PRICES[tier as PaidTier] : null;
          const amount = price ? price[currency] : 0;
          const symbol = currency === 'inr' ? '₹' : '$';
          const copy = TIER_COPY[tier];
          return (
            <section key={tier} className={`card ${tier === 'pro' ? 'featured' : ''}`}>
              <h2>{copy.label}</h2>
              <p className="price">
                {tier === 'free' ? 'Free' : amount ? `${symbol}${amount}` : 'Talk to us'}
                {tier === 'pro' && <span className="per">/month</span>}
              </p>
              <ul>
                {copy.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
              {tier === 'free'
                ? <a href="/chart/new" className="cta">Start free</a>
                : (
                  <button className="cta" disabled={busy === tier} onClick={() => void checkout(tier as PaidTier)}>
                    {busy === tier ? 'Opening…' : `Choose ${copy.label}`}
                  </button>
                )}
            </section>
          );
        })}
      </div>

      {/* The honest footnotes. An unexplained limit is a refund request. */}
      <footer className="fine">
        <p>Prices in {currency.toUpperCase()}. GST included for Indian customers; invoice on request.</p>
        <p>Cancel any time from the billing portal — no email required, no retention flow.</p>
        <p>Enterprise is a conversation: SSO, DPA, and an SLA we can actually meet.</p>
      </footer>
    </main>
  );
}
