# Billing — Stripe rail

**Owner:** Revenue + Core Engineering · **Status:** active · **Rail:** Stripe

## 1. Why

Before this, `PricingPage` and `subscriptionService` were localStorage UI. No
payment rail existed, so no plan could be enforced and no invoice issued. This
documents the rail that closes that.

## 2. Flow

    PricingPage -> billing-checkout (plan, region) -> Stripe Checkout
        -> checkout.session.completed
        -> stripe-webhook (verify sig -> apply_subscription_event)
        -> user_entitlements  <-- the ONLY thing the app trusts
        -> tier-entitlement -> useEntitlement -> resolveTier

## 3. Invariants

1. **The client never sends a price id.** It sends `plan` + `region`; the server
   resolves the price. Otherwise a client picks its own currency and tier.
2. **The webhook is the only writer.** Nothing else sets `user_entitlements`
   except an operator.
3. **Every webhook is signature-verified** against the raw body, with a 300s
   tolerance to blunt replay.
4. **Every webhook is idempotent** on `event.id` (primary key of `billing_events`).
   A duplicate returns `{duplicate:true}` and does nothing.
5. **Out-of-order events never regress state.** `last_event_at` guards: an event
   older than the stored one is recorded and ignored.
6. **`past_due` keeps access.** A failed card must not lock out a paying user;
   only `customer.subscription.deleted` drops to `free`.

## 4. Event mapping

| Stripe event                                 | Effect                                              |
| -------------------------------------------- | --------------------------------------------------- |
| `customer.subscription.created` / `.updated` | upsert subscription, set tier from `price_tier_map` |
| `invoice.paid`                               | refresh `current_period_end`                        |
| `invoice.payment_failed`                     | keep tier, status `past_due` (grace)                |
| `customer.subscription.deleted`              | tier -> `free`, `expires_at = now()`                |

## 5. Price map

`public.price_tier_map` is server data. Adding a plan = inserting a row + a
`PRICES` entry in `billing-checkout`. No client release needed.

## 6. Dunning

Aligns with `docs/API_MONETIZATION_STRATEGY.md` §4: day 0 invoice, day 7 reminder,
day 14 grace, day 21 restricted, day 30 suspended. Stripe Smart Retries handles
the mechanical part; `past_due` gives the grace window for free.

## 7. India specifics

- **GST:** `automatic_tax` + `tax_id_collection` are on. Requires a Stripe Tax
  registration for the place of supply. SAC falls in the 9983 family — confirm
  the exact code with a CA before the first invoice.
- **Recurring mandates (RBI):** e-mandate needs AFA at registration; subsequent
  debits up to ₹15,000 proceed without AFA. The ₹499 Pro price is comfortably
  under that, so no extra flow is needed. Raising Pro above ₹15,000 later _will_
  require a re-auth flow — plan for it.
- **UPI Autopay** is supported by Stripe India and is the cheapest collection
  rail for the domestic base. Enable it in the dashboard.

## 8. Local development

    stripe login
    stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
    # copy the printed whsec_ into STRIPE_WEBHOOK_SECRET
    stripe trigger customer.subscription.created

Test cards: `4242...` success, `4000 0000 0000 0341` fails after attach,
`4000 0027 6000 3184` requires 3DS.

## 9. Required secrets

    STRIPE_SECRET_KEY
    STRIPE_WEBHOOK_SECRET

Both are edge-function secrets, never `VITE_`-prefixed (the browser must never
see the secret key).

## 10. STOP-THE-LAUNCH conditions

1. `bad_signature` on a replayed event.
2. A duplicate `event.id` mutating `user_entitlements` twice.
3. `user_entitlements.tier` differing from `price_tier_map` for an active sub.
4. A `deleted` subscription leaving a non-`free` tier after `expires_at`.
5. Any path other than `stripe-webhook` writing `user_entitlements`.

## Change log

- **2026-10-29** — Initial rail.
