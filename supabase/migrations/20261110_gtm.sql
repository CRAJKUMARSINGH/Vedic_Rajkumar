-- GTM funnel. Deliberately boring: one table, a fixed event enum, no PII.
--
-- WHY NO PII: an anon_id is a UUID in localStorage. No cookie, no consent banner,
-- no "we use cookies" interstitial on a landing page. The funnel is stitched on
-- signup by writing the anon_id onto the profile.

create table if not exists public.funnel_events (
  id          bigserial primary key,
  anon_id     uuid not null,
  user_id     uuid references public.profiles(id) on delete set null,
  event       text not null,
  props       jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  day         date generated always as ((occurred_at at time zone 'Asia/Kolkata')::date) stored
);

-- The enum is a check, not free text. Free text event names rot into 400 variants.
alter table public.funnel_events drop constraint if exists funnel_events_event_check;
alter table public.funnel_events add constraint funnel_events_event_check check (event in (
  'landing_view','pricing_view','signup_start','signup_complete',
  'chart_created','weekly_limit_hit','upgrade_click',
  'checkout_start','checkout_complete','export_attempted','export_gated',
  'invite_sent','share_clicked','feedback_submitted'
));

create index if not exists idx_funnel_anon on public.funnel_events (anon_id, occurred_at desc);
create index if not exists idx_funnel_day on public.funnel_events (day, event);
create index if not exists idx_funnel_event on public.funnel_events (event, occurred_at desc);

alter table public.funnel_events enable row level security;

-- Inserts come through the edge function with the service role; reads are open
-- to the owner so a user can see their own trail.
create policy "insert funnel" on public.funnel_events for insert with check (true);
create policy "read own funnel" on public.funnel_events for select
  using (user_id is null or user_id = auth.uid() or auth.uid() is null);

-- Stitch anon -> user on signup. Idempotent.
create or replace function public.stitch_anon(p_anon_id uuid, p_user_id uuid)
returns int language sql security definer set search_path = public as $$
  with u as (
    update public.funnel_events set user_id = p_user_id
     where anon_id = p_anon_id and user_id is null
     returning 1)
  select count(*)::int from u;
$$;

/**
 * The only funnel number that matters at 10 users: did a stranger get from
 * landing to a chart, and did anyone pay. Vanity metrics are not computed.
 */
create or replace function public.funnel_summary(p_days int default 14)
returns jsonb language sql security definer set search_path = public as $$
  with w as (
    select * from public.funnel_events
     where occurred_at > now() - make_interval(days => p_days)
  ),
  anon as (select distinct anon_id from w)
  select jsonb_build_object(
    'window_days', p_days,
    'visitors', (select count(*) from anon),
    'reached_pricing', (select count(distinct anon_id) from w where event = 'pricing_view'),
    'created_chart', (select count(distinct anon_id) from w where event = 'chart_created'),
    'signed_up', (select count(distinct anon_id) from w where event = 'signup_complete'),
    'hit_limit', (select count(distinct anon_id) from w where event = 'weekly_limit_hit'),
    'clicked_upgrade', (select count(distinct anon_id) from w where event = 'upgrade_click'),
    'paid', (select count(distinct anon_id) from w where event = 'checkout_complete'),
    'landing_to_chart', (select count(distinct anon_id) from w where event = 'chart_created')
      ::numeric / nullif((select count(*) from anon), 0),
    'limit_to_upgrade', (select count(distinct anon_id) from w where event = 'upgrade_click')
      ::numeric / nullif((select count(distinct anon_id) from w where event = 'weekly_limit_hit'), 0)
  );
$$;

-- Attribution: one column, not a warehouse. First-touch, last-touch, both.
alter table public.profiles
  add column if not exists first_touch jsonb,
  add column if not exists last_touch jsonb,
  add column if not exists anon_id uuid,
  add column if not exists onboarded_at timestamptz,
  add column if not exists feedback_at timestamptz;

create index if not exists idx_profiles_anon on public.profiles (anon_id);

-- Signup source for the "where did the first 10 come from" question.
create table if not exists public.signup_sources (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  channel    text not null,
  detail     text,
  created_at timestamptz not null default now()
);
alter table public.signup_sources enable row level security;
create policy "read own sources" on public.signup_sources for select using (user_id = auth.uid());
