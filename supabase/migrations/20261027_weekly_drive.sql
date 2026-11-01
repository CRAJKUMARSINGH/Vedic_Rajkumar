-- weekly_drive_grants: one row per (user, ISO week). Server-authoritative.
-- Grants are idempotent (on conflict do nothing); consumption is atomic.

create table if not exists public.weekly_drive_grants (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  week_key           text not null,                       -- '2026-W44'
  week_start         timestamptz not null,
  week_end           timestamptz not null,
  questions_granted  int  not null,                       -- -1 = unlimited
  questions_consumed int  not null default 0 check (questions_consumed >= 0),
  feature_grants     jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint weekly_drive_grants_user_week_unique unique (user_id, week_key)
);

create index if not exists idx_weekly_drive_grants_user_week
  on public.weekly_drive_grants (user_id, week_key);

alter table public.weekly_drive_grants enable row level security;

-- Deny by default: only the owner reads their own row. Writes go through RPC.
create policy "owner reads own weekly grants"
  on public.weekly_drive_grants for select
  using (auth.uid() = user_id);

-- Idempotent grant: safe to call on every request; never double-grants.
create or replace function public.grant_weekly_drive(
  p_user uuid, p_week_key text, p_start timestamptz, p_end timestamptz,
  p_questions int, p_features jsonb
) returns public.weekly_drive_grants
language plpgsql security definer set search_path = public as $$
declare r public.weekly_drive_grants;
begin
  insert into public.weekly_drive_grants
    (user_id, week_key, week_start, week_end, questions_granted, feature_grants)
  values (p_user, p_week_key, p_start, p_end, p_questions, p_features)
  on conflict (user_id, week_key) do nothing;

  select * into r from public.weekly_drive_grants
   where user_id = p_user and week_key = p_week_key;
  return r;
end $$;

-- Atomic consume: no double-spend under concurrency. Raises when exhausted.
create or replace function public.consume_weekly_drive(p_user uuid, p_week_key text)
returns public.weekly_drive_grants
language plpgsql security definer set search_path = public as $$
declare r public.weekly_drive_grants;
begin
  update public.weekly_drive_grants
     set questions_consumed = questions_consumed + 1, updated_at = now()
   where user_id = p_user and week_key = p_week_key
     and (questions_granted = -1 or questions_consumed < questions_granted)
  returning * into r;

  if r is null then
    raise exception 'weekly_drive_exhausted' using errcode = 'P0001';
  end if;
  return r;
end $$;
