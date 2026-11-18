-- Beta trials + feedback inbox: the server-authoritative 7-day test window.
--
-- Pre-launch beta plumbing (source: CODE-JUNCTION/Vedic vence.txt, Phase 3).
-- Same shape as weekly_drive_grants: the DB is the authority, the client is only
-- a mirror, and the privileged transition is a single guarded statement so it is
-- atomic under concurrency.
--
-- CONFIDENTIALITY (AGENTS.md standing order): a feedback row carries a chart_id
-- and nothing else. Never dob/tob/place/lat/lon. The invite *code* is never
-- stored — only its sha256.
--
-- Requires pgcrypto (gen_random_uuid, digest) — present since
-- 20241007000007_public_api.sql.

create extension if not exists pgcrypto;

-- ── types ───────────────────────────────────────────────────────────────────
do $$ begin
  create type public.beta_cohort as enum ('nascent', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.beta_status as enum ('invited', 'active', 'expired', 'revoked', 'converted');
exception when duplicate_object then null; end $$;

-- ── tester registry ─────────────────────────────────────────────────────────
-- user_id cascades so account erasure removes the tester row (and via it the
-- feedback) — see 20261101_erasure.sql. Invite-only rows (never signed in) have
-- no user_id and are purged on revoke.
create table if not exists public.beta_testers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  email        text not null,
  cohort       public.beta_cohort not null,
  invite_hash  text not null unique,               -- sha256(code); never the code
  status       public.beta_status not null default 'invited',
  invited_at   timestamptz not null default now(),
  started_at   timestamptz,
  expires_at   timestamptz,                        -- started_at + interval '7 days'
  revoked_at   timestamptz,
  notes        text,
  constraint beta_testers_email_lower check (email = lower(email)),
  constraint beta_testers_active_has_window
    check (status <> 'active' or (started_at is not null and expires_at is not null))
);

create unique index if not exists idx_beta_testers_email
  on public.beta_testers (lower(email));
create index if not exists idx_beta_testers_status on public.beta_testers (status);
create index if not exists idx_beta_testers_user   on public.beta_testers (user_id);

-- ── feedback inbox ──────────────────────────────────────────────────────────
create table if not exists public.beta_feedback (
  id          uuid primary key default gen_random_uuid(),
  tester_id   uuid not null references public.beta_testers(id) on delete cascade,
  chart_id    text,                                -- id only; never birth fields
  area        text not null,
  severity    smallint not null check (severity between 1 and 4),
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_beta_feedback_tester
  on public.beta_feedback (tester_id, created_at desc);

-- ── RLS: deny by default ────────────────────────────────────────────────────
alter table public.beta_testers  enable row level security;
alter table public.beta_feedback enable row level security;

drop policy if exists "tester reads own row"          on public.beta_testers;
drop policy if exists "owner or admin manages testers" on public.beta_testers;
drop policy if exists "tester inserts own feedback"   on public.beta_feedback;
drop policy if exists "tester reads own feedback"     on public.beta_feedback;
drop policy if exists "owner or admin reads feedback" on public.beta_feedback;

create policy "tester reads own row" on public.beta_testers
  for select using (user_id = auth.uid());

create policy "owner or admin manages testers" on public.beta_testers
  for all using (exists (
    select 1 from public.user_roles r
     where r.user_id = auth.uid() and r.role in ('owner', 'admin')
  ));

create policy "tester inserts own feedback" on public.beta_feedback
  for insert with check (tester_id in (
    select id from public.beta_testers where user_id = auth.uid()
  ));

create policy "tester reads own feedback" on public.beta_feedback
  for select using (tester_id in (
    select id from public.beta_testers where user_id = auth.uid()
  ));

create policy "owner or admin reads feedback" on public.beta_feedback
  for select using (exists (
    select 1 from public.user_roles r
     where r.user_id = auth.uid() and r.role in ('owner', 'admin')
  ));

-- ── claim (atomic, single-use) ──────────────────────────────────────────────
-- One guarded UPDATE decides everything: only an 'invited' row claimed by the
-- matching email can start a trial, so two concurrent redeems cannot both win.
-- Returns a discriminated jsonb so the edge function maps to distinct HTTP
-- codes without opening a second race window. Never echoes the code or email.
create or replace function public.claim_beta_invite(
  p_hash text, p_user uuid, p_email text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.beta_testers;
begin
  if exists (select 1 from public.beta_testers where user_id = p_user and status = 'active') then
    select * into r from public.beta_testers
     where user_id = p_user and status = 'active' limit 1;
    return jsonb_build_object('code', 'avoid_dup', 'tester', jsonb_build_object(
      'id', r.id, 'cohort', r.cohort, 'status', r.status,
      'startedAt', r.started_at, 'expiresAt', r.expires_at));
  end if;

  update public.beta_testers
     set status     = 'active',
         user_id    = p_user,
         started_at = now(),
         expires_at = now() + interval '7 days'
   where invite_hash = p_hash
     and status = 'invited'
     and lower(email) = lower(p_email)
  returning * into r;

  if r.id is not null then
    insert into public.user_entitlements (user_id, tier, source, expires_at, updated_at)
    values (p_user, 'pro', 'beta_trial', r.expires_at, now())
    on conflict (user_id) do update
      set tier = 'pro', source = 'beta_trial',
          expires_at = excluded.expires_at, updated_at = now();

    return jsonb_build_object('code', 'ok', 'tester', jsonb_build_object(
      'id', r.id, 'cohort', r.cohort, 'status', r.status,
      'startedAt', r.started_at, 'expiresAt', r.expires_at));
  end if;

  -- Diagnose why nothing matched. Read-only: a concurrent claim would already
  -- have flipped this row to 'active', which we report as already_redeemed.
  select * into r from public.beta_testers where invite_hash = p_hash;
  if r.id is null then
    return jsonb_build_object('code', 'not_found');
  end if;
  if lower(r.email) <> lower(p_email) then
    return jsonb_build_object('code', 'email_mismatch');
  end if;
  return jsonb_build_object('code', 'already_redeemed');
end $$;

-- ── expiry ──────────────────────────────────────────────────────────────────
-- Called hourly by the guarded cron below. resolve_entitlement() already
-- honours expires_at, but this keeps the stored rows honest.
create or replace function public.expire_beta_trials()
returns integer
language plpgsql security definer set search_path = public as $$
declare n integer := 0;
begin
  with expired as (
    update public.beta_testers
       set status = 'expired'
     where status = 'active' and expires_at < now()
    returning 1
  )
  select count(*) into n from expired;

  update public.user_entitlements
     set tier = 'free', source = 'default', expires_at = null, updated_at = now()
   where source = 'beta_trial'
     and expires_at is not null
     and expires_at < now();

  return n;
end $$;

-- ── kill switch ─────────────────────────────────────────────────────────────
-- Flip enabled=true to disable all beta redemption/surfaces in one statement.
insert into public.kill_switches (feature, enabled) values ('kill_beta_trial', false)
on conflict (feature) do nothing;

-- ── schedule ────────────────────────────────────────────────────────────────
-- Guarded so it is safe to re-apply and harmless where pg_cron is absent.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('beta-trial-expiry')
      where exists (select 1 from cron.job where jobname = 'beta-trial-expiry');
    perform cron.schedule('beta-trial-expiry', '5 * * * *', $cron$
      select public.expire_beta_trials();
    $cron$);
  end if;
end $$;

comment on table public.beta_testers is
  'Pre-launch beta roster. invite_hash is sha256(code) — the code itself is never stored.';
comment on table public.beta_feedback is
  'Beta bug inbox. Carries chart_id only; birth fields are never stored (AGENTS.md confidentiality order).';
comment on function public.claim_beta_invite(text, uuid, text) is
  'Single-use, atomic invite redemption + 7-day trial grant. Returns {code: ok|not_found|email_mismatch|already_redeemed|avoid_dup}.';
