# ADR-002 — Stripe as the payment rail, no SDK

**Date:** 2026-10-29 · **Status:** Accepted

## Context

`docs/SOC2_PREPARATION_CHECKLIST.md` already lists Stripe as a vendor with a
signed DPA — but there was no `stripe` dependency and no checkout. Options were
Stripe, Razorpay (India-first), or a domestic gateway.

## Decision

Stripe, with a **hand-rolled REST client over `fetch`** instead of the SDK.

## Rationale

- Diaspora customers pay in USD/EUR; Razorpay's international story is weaker.
- Stripe-hosted Checkout + Customer Portal means near-zero UI to build and audit.
- The SDK adds a pin to babysit inside a Deno edge function for ~5 endpoints.
  `fetch` + form-encoding + WebCrypto HMAC is ~60 lines and auditable.
- Signature verification is done with `crypto.subtle`, so it works on the edge
  runtime without Node polyfills.

## Consequences

- We own webhook verification and idempotency. Both are tested and documented.
- If the SDK ever becomes worth it, swapping is localised to `_shared/stripe.ts`.
- Razorpay can be added later behind the same `user_entitlements` writer — the
  entitlement layer does not care which rail produced the event.
