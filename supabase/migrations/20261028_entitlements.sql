-- user_entitlements: the SERVER authority for tier. Deny by default.
--
-- Dose 2 (enforcement parity). The client may render from a cached entitlement,
-- but every privileged call must re-derive it here. See docs/adr/ADR-001-tier-taxonomy.md.

create table if not exists public.user_entitlements (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  tier       text not null default 'free' check (tier in ('free','pro','enterprise')),
  source     text not null default 'default',
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

-- Deny by default: only the owner reads their own row. Writes are operator/rail-only.
create policy "owner reads own entitlement"
  on public.user_entitlements for select
  using (auth.uid() = user_id);

-- Honours expiry; unknown/expired user resolves to 'free'.
create or replace function public.resolve_entitlement(p_user uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  select tier into t from public.user_entitlements
   where user_id = p_user and (expires_at is null or expires_at > now());
  return jsonb_build_object('tier', coalesce(t, 'free'));
end $$;
