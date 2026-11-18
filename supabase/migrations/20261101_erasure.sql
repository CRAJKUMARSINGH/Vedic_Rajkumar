-- Erasure fan-out with an append-only, hash-chained ledger.
--
-- WHY: deleting a row in your own tables is not erasure. GDPR Art 17 and India's
-- DPDP require processors to forget too. This migration gives each request a
-- ledger an auditor can read, and each processor a retryable step.

create extension if not exists pgcrypto;

create table if not exists public.erasure_requests (
  id                 uuid primary key default gen_random_uuid(),
  subject_id         uuid not null,          -- auth.users id; NOT a FK, so the ledger outlives the user
  subject_ref        text not null,          -- sha256(email) — survives deletion, never raw PII
  requested_by       text not null default 'subject',
  reason             text,
  requested_at       timestamptz not null default now(),
  due_at             timestamptz not null,   -- GDPR: one month
  grace_until        timestamptz,            -- soft-delete window (30 days)
  status             text not null default 'open'
                     check (status in ('open','in_progress','completed','partial','failed')),
  completed_at       timestamptz,
  unique (subject_id, status) deferrable initially deferred
);
create index if not exists idx_erasure_due on public.erasure_requests (status, due_at);

create table if not exists public.erasure_steps (
  id              bigserial primary key,
  request_id      uuid not null references public.erasure_requests(id) on delete cascade,
  processor       text not null,
  ordinal         int  not null,             -- higher runs later; auth deletion is LAST
  status          text not null default 'pending' check (status in ('pending','ok','skipped','failed')),
  attempts        int  not null default 0,
  last_error      text,
  evidence        jsonb,
  next_attempt_at timestamptz not null default now(),
  finished_at     timestamptz,
  unique (request_id, processor)
);
create index if not exists idx_erasure_steps_claim on public.erasure_steps (status, next_attempt_at);

-- Append-only proof. hash = sha256(prev_hash || payload) — tamper-evident chain.
create table if not exists public.erasure_ledger (
  id         bigserial primary key,
  request_id uuid not null,
  at         timestamptz not null default now(),
  actor      text not null,
  action     text not null,
  detail     jsonb not null default '{}'::jsonb,
  prev_hash  text,
  hash       text not null
);
create index if not exists idx_erasure_ledger_req on public.erasure_ledger (request_id, id);

alter table public.erasure_requests enable row level security;
alter table public.erasure_steps    enable row level security;
alter table public.erasure_ledger   enable row level security;
create policy "owner reads own erasure" on public.erasure_requests for select using (auth.uid() = subject_id);
create policy "owner reads own steps"   on public.erasure_steps    for select using (true);
create policy "owner reads own ledger"  on public.erasure_ledger   for select using (true);

-- Processors, in run order. supabase_auth is LAST: deleting the auth user cascades
-- our own rows, so the processors that need the user id must run first.
create or replace function public.erasure_processors()
returns table (processor text, ordinal int) language sql immutable as $$
  select * from (values
    ('posthog', 10), ('sentry', 20), ('storage', 30), ('clerk', 40), ('supabase_auth', 100)
  ) as t(processor, ordinal);
$$;

-- ── ledger append (private) ─────────────────────────────────────────────────
create or replace function public._ledger_append(
  p_request uuid, p_actor text, p_action text, p_detail jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
declare v_prev text;
begin
  select hash into v_prev from public.erasure_ledger
   where request_id = p_request order by id desc limit 1;

  insert into public.erasure_ledger (request_id, actor, action, detail, prev_hash, hash)
  values (p_request, p_actor, p_action, p_detail, v_prev,
          encode(digest(coalesce(v_prev,'') || p_request::text || p_actor || p_action || p_detail::text, 'sha256'), 'hex'));
end $$;

-- ── open (idempotent) ───────────────────────────────────────────────────────
create or replace function public.open_erasure_request(
  p_subject uuid, p_email text, p_reason text default 'user_requested', p_grace_days int default 30
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_ref text; p record;
begin
  v_ref := encode(digest(lower(coalesce(p_email,'')), 'sha256'), 'hex');

  select id into v_id from public.erasure_requests
   where subject_id = p_subject and status in ('open','in_progress') limit 1;
  if v_id is not null then
    perform public._ledger_append(v_id, 'system', 'reopened', jsonb_build_object('reason', p_reason));
    return v_id;
  end if;

  insert into public.erasure_requests (subject_id, subject_ref, reason, due_at, grace_until)
  values (p_subject, v_ref, p_reason, now() + interval '1 month',
          case when p_grace_days > 0 then now() + make_interval(days => p_grace_days) else null end)
  returning id into v_id;

  for p in select * from public.erasure_processors() loop
    insert into public.erasure_steps (request_id, processor, ordinal) values (v_id, p.processor, p.ordinal);
  end loop;

  perform public._ledger_append(v_id, 'subject', 'opened',
    jsonb_build_object('reason', p_reason, 'grace_days', p_grace_days, 'due_at', now() + interval '1 month'));
  return v_id;
end $$;

-- ── claim work (safe under concurrent sweeps) ───────────────────────────────
create or replace function public.claim_erasure_steps(p_limit int default 10)
returns table (step_id bigint, request_id uuid, processor text, subject_id uuid, subject_ref text, attempts int)
language plpgsql security definer set search_path = public as $$
begin
  return query
  with due as (
    select s.id from public.erasure_steps s
      join public.erasure_requests r on r.id = s.request_id
     where s.status = 'pending'
       and s.next_attempt_at <= now()
       and (r.grace_until is null or r.grace_until <= now())
       and r.status in ('open','in_progress')
     order by s.ordinal, s.id
     limit p_limit
     for update of s skip locked
  )
  update public.erasure_steps s
     set attempts = s.attempts + 1
    from due, public.erasure_requests r
   where s.id = due.id and r.id = s.request_id
  returning s.id, s.request_id, s.processor, r.subject_id, r.subject_ref, s.attempts;
end $$;

-- ── record a result + backoff ───────────────────────────────────────────────
create or replace function public.record_erasure_step(
  p_step bigint, p_status text, p_evidence jsonb default null, p_error text default null
) returns void language plpgsql security definer set search_path = public as $$
declare v_req uuid; v_proc text; v_attempts int;
begin
  if p_status not in ('ok','skipped','failed','pending') then
    raise exception 'bad status %', p_status;
  end if;

  update public.erasure_steps
     set status = p_status,
         evidence = coalesce(p_evidence, evidence),
         last_error = p_error,
         finished_at = case when p_status in ('ok','skipped') then now() else null end,
         next_attempt_at = case
           when p_status = 'pending'
             then now() + make_interval(secs => least(3600, power(2, attempts)::int * 15))
           else next_attempt_at end
   where id = p_step
  returning request_id, processor, attempts into v_req, v_proc, v_attempts;

  perform public._ledger_append(v_req, 'worker', 'step_' || p_status,
    jsonb_build_object('processor', v_proc, 'attempt', v_attempts, 'error', p_error, 'evidence', p_evidence));

  perform public.finalize_erasure_request(v_req);
end $$;

create or replace function public.finalize_erasure_request(p_request uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_pending int; v_failed int; v_total int; v_status text;
begin
  select count(*) filter (where status = 'pending'),
         count(*) filter (where status = 'failed'),
         count(*)
    into v_pending, v_failed, v_total
    from public.erasure_steps where request_id = p_request;

  if v_pending > 0 then
    update public.erasure_requests set status = 'in_progress' where id = p_request;
    return 'in_progress';
  end if;

  v_status := case when v_failed = 0 then 'completed' else 'partial' end;
  update public.erasure_requests
     set status = v_status, completed_at = now()
   where id = p_request and status <> v_status;

  perform public._ledger_append(p_request, 'system', v_status,
    jsonb_build_object('steps', v_total, 'failed', v_failed));
  return v_status;
end $$;

/** Auditor-facing proof: the chain must verify. */
create or replace function public.verify_erasure_chain(p_request uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare r record; v_prev text := null; v_expect text;
begin
  for r in select * from public.erasure_ledger where request_id = p_request order by id loop
    v_expect := encode(digest(coalesce(v_prev,'') || r.request_id::text || r.actor || r.action || r.detail::text, 'sha256'), 'hex');
    if r.hash <> v_expect or coalesce(r.prev_hash,'') <> coalesce(v_prev,'') then
      return false;
    end if;
    v_prev := r.hash;
  end loop;
  return true;
end $$;

-- ── retention as data, not prose ────────────────────────────────────────────
create table if not exists public.retention_policies (
  name        text primary key,
  table_name  text not null,
  time_column text not null,
  retain_days int  not null,
  basis       text not null,
  enabled     boolean not null default true
);
insert into public.retention_policies (name, table_name, time_column, retain_days, basis) values
  ('edge_samples',    'edge_request_samples', 'at', 14,  'operational'),
  ('rum_samples',     'rum_samples',          'at', 14,  'operational'),
  ('slo_snapshots',   'slo_snapshots',        'computed_at', 90, 'operational'),
  ('api_usage_rows',  'api_usage',            'day', 400,  'billing_dispute_window'),
  ('audit_logs',      'audit_logs',           'created_at', 365, 'SOC2_CC7'),
  ('rate_buckets',    'rate_limit_buckets',   'updated_at', 1, 'operational')
on conflict (name) do nothing;

create or replace function public.apply_retention()
returns table (policy text, deleted bigint) language plpgsql security definer set search_path = public as $$
declare p record; d bigint;
begin
  for p in select * from public.retention_policies where enabled loop
    execute format('delete from public.%I where %I < now() - make_interval(days => $1)',
                   p.table_name, p.time_column) using p.retain_days;
    get diagnostics d = row_count;
    return query select p.name, d;
  end loop;
end $$;
