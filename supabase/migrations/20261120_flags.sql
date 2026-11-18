-- Flags. A table, not a config file, because flipping one must not need a deploy.

create table if not exists public.flags (
  key        text primary key,
  enabled    boolean not null default false,
  rollout    int not null default 100 check (rollout between 0 and 100),
  owner      text not null,
  note       text,
  expires_at date,
  updated_at timestamptz not null default now()
);

alter table public.flags enable row level security;
create policy "read flags" on public.flags for select using (true);

-- Seed from docs/flags.yaml by hand (or gen-flags.mjs --sync).
insert into public.flags (key, enabled, rollout, owner, note) values
  ('kill_checkout',    false, 100, 'billing',  'hide every pay button'),
  ('kill_funnel',      false, 100, 'growth',   'analytics only'),
  ('kill_pdf_export',  false, 100, 'growth',   'hide export rather than 500'),
  ('new_landing',      true,  100, 'founder',  null),
  ('new_dasha_timeline', false, 0, 'core',     'risky render path'),
  ('strict_erasure_copy', true, 100, 'security','explicit delete copy')
on conflict (key) do nothing;

-- Every flip is auditable. A flag changed at 3am must be attributable.
create table if not exists public.flag_changes (
  id         bigserial primary key,
  key        text not null,
  from_state boolean,
  to_state   boolean,
  rollout    int,
  actor      text not null default 'manual',
  reason     text,
  changed_at timestamptz not null default now()
);

create or replace function public.flip_flag(p_key text, p_enabled boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.flag_changes (key, from_state, to_state, actor, reason)
  select p_key, f.enabled, p_enabled, current_user, p_reason from public.flags f where f.key = p_key;

  update public.flags set enabled = p_enabled, updated_at = now() where key = p_key;
end $$;
