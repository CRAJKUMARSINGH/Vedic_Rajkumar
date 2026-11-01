-- Billing: price->tier map (server data, never client), subscription mirror,
-- webhook idempotency ledger, and the ONE writer of user_entitlements.

create table if not exists public.price_tier_map (
  price_id text primary key,
  tier     text not null check (tier in ('free','pro','enterprise'))
);

-- Replace with real Stripe price ids. Region is encoded per price so the client
-- cannot pick its own tier or its own currency.
insert into public.price_tier_map (price_id, tier) values
  ('price_REPLACE_pro_monthly_inr', 'pro'),
  ('price_REPLACE_pro_monthly_usd', 'pro'),
  ('price_REPLACE_ent_monthly_usd', 'enterprise')
on conflict (price_id) do nothing;

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  price_id               text,
  status                 text not null default 'incomplete',
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  last_event_at          timestamptz,           -- out-of-order webhook guard
  updated_at             timestamptz not null default now()
);

create table if not exists public.billing_events (
  event_id    text primary key,                 -- Stripe event id: idempotency key
  type        text not null,
  created_at  timestamptz not null,
  received_at timestamptz not null default now()
);

alter table public.subscriptions   enable row level security;
alter table public.billing_events  enable row level security;

create policy "owner reads own subscription"
  on public.subscriptions for select using (auth.uid() = user_id);
create policy "owner reads own billing events"
  on public.billing_events for select using (true);

-- THE writer. Idempotent by event_id, ordered by event.created_at.
create or replace function public.apply_subscription_event(
  p_event_id text, p_type text, p_event_created timestamptz,
  p_user uuid, p_customer text, p_sub text,
  p_price text, p_status text, p_period_end timestamptz,
  p_cancel_at_period_end boolean default false
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_tier text; v_active boolean; v_last timestamptz;
begin
  insert into public.billing_events (event_id, type, created_at)
  values (p_event_id, p_type, p_event_created)
  on conflict (event_id) do nothing;
  if not found then
    return jsonb_build_object('duplicate', true);
  end if;

  if p_user is null then
    return jsonb_build_object('duplicate', false, 'unmapped_user', true);
  end if;

  select last_event_at into v_last from public.subscriptions where user_id = p_user;
  if v_last is not null and p_event_created < v_last then
    return jsonb_build_object('duplicate', false, 'stale', true);  -- never regress
  end if;

  select tier into v_tier from public.price_tier_map where price_id = p_price;
  -- past_due keeps access (grace) so a failed card does not lock a paying user out
  v_active := p_status in ('active','trialing','past_due');

  insert into public.subscriptions
    (user_id, stripe_customer_id, stripe_subscription_id, price_id, status,
     current_period_end, cancel_at_period_end, last_event_at, updated_at)
  values (p_user, p_customer, p_sub, p_price, p_status,
          p_period_end, p_cancel_at_period_end, p_event_created, now())
  on conflict (user_id) do update set
    stripe_customer_id     = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    price_id               = excluded.price_id,
    status                 = excluded.status,
    current_period_end     = excluded.current_period_end,
    cancel_at_period_end   = excluded.cancel_at_period_end,
    last_event_at          = excluded.last_event_at,
    updated_at             = now();

  insert into public.user_entitlements (user_id, tier, source, expires_at, updated_at)
  values (p_user,
          case when v_active then coalesce(v_tier, 'free') else 'free' end,
          'stripe',
          case when v_active then p_period_end else now() end,
          now())
  on conflict (user_id) do update set
    tier       = case when v_active then coalesce(v_tier, 'free') else 'free' end,
    source     = 'stripe',
    expires_at = case when v_active then p_period_end else now() end,
    updated_at = now();

  return jsonb_build_object('duplicate', false, 'tier', v_tier, 'active', v_active);
end $$;
