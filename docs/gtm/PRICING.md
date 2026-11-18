# Pricing — one source, checked against Stripe

**Owner:** Founder · **Verified by:** `npm run gtm:audit`

The landing page quotes a price. Stripe charges a price. If those two ever differ,
the audit fails the build rather than letting a visitor read a number the checkout
does not honour.

## Price keys

The audit parses this table. These two rows are the only place the amounts live in
copy — a change here is a change everywhere.

| Price key | Amount |
| --------- | ------ |
| pro_inr   | 499    |
| pro_usd   | 9      |

## Plans

| Plan                | Channel  | Price key          | Billing                                     |
| ------------------- | -------- | ------------------ | ------------------------------------------- |
| Free                | web      | —                  | weekly question allowance, no card required |
| Pro (India)         | web      | `pro_inr`          | monthly, cancel from the portal             |
| Pro (international) | web      | `pro_usd`          | monthly, cancel from the portal             |
| Enterprise          | contract | invoice (`net-30`) | per contract, not this table                |

## Where the values come from

`STRIPE_PRICE_PRO_INR` / `STRIPE_PRICE_PRO_USD` are repository **variables**, not
secrets — a price id is public and CI needs it to audit. The same ids are exposed
to the build as `VITE_PRICE_PRO_INR` / `VITE_PRICE_PRO_USD`, which the pricing page
renders.

- Prices are set in the Stripe dashboard, then recorded here.
- Never hardcode an amount in a component; read it from the env pair above.
- A price change is a two-step release: update Stripe, then update this file, and
  let the audit confirm the two agree.

## What is out of scope

Refunds, credit notes and seat-based enterprise invoicing are not modelled here.
Enterprise is invoice-based and priced per contract.
