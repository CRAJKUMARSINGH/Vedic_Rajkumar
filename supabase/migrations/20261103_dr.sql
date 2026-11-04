-- DR: backup freshness tracking + drill evidence + post-restore erasure re-apply.
--
-- The point is that RTO and RPO become NUMBERS, measured by a drill that actually
-- runs, instead of adjectives in a document.

create table if not exists public.dr_drill_runs (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in ('restore','failover','pitr')),
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  status         text not null default 'running' check (status in ('running','passed','failed')),
  backup_taken_at timestamptz,
  measured_rto_sec int,
  measured_rpo_sec int,
  target_rto_sec int not null default 3600,
  target_rpo_sec int not null default 900,
  rows_expected bigint,
  rows_restored bigint,
  erasure_reapplied int default 0,
  checks         jsonb not null default '[]'::jsonb,
  failure_reason text,
  actor          text not null default 'dr-drill'
);
create index if not exists idx_dr_drill_recent on public.dr_drill_runs (started_at desc);

alter table public.dr_drill_runs enable row level security;
create policy "read dr drills" on public.dr_drill_runs for select using (true);

/**
 * reopen_erasure_after_restore — THE trap from dose 7, closed.
 *
 * A 30-day rolling backup still contains subjects deleted after the backup date.
 * Restoring makes them alive again in our tables, while the processor adapters
 * already forgot them. This re-opens their erasure steps so the sweep finishes the
 * job again — and the ledger records that it happened.
 */
create or replace function public.reopen_erasure_after_restore(p_restored_to timestamptz)
returns int language plpgsql security definer set search_path = public as $$
declare r record; v_count int := 0;
begin
  for r in
    select id, subject_id from public.erasure_requests
     where status in ('completed','partial')
       and completed_at is not null
       and completed_at > p_restored_to     -- deleted AFTER the backup was taken
  loop
    -- reset the processor steps that ran after the restore point
    update public.erasure_steps
       set status = 'pending', next_attempt_at = now(), finished_at = null
     where request_id = r.id and processor <> 'supabase_auth';

    update public.erasure_steps
       set status = 'pending', next_attempt_at = now(), finished_at = null
     where request_id = r.id and processor = 'supabase_auth';

    update public.erasure_requests
       set status = 'open', completed_at = null
     where id = r.id;

    perform public._ledger_append(r.id, 'dr-drill', 'reopened_after_restore',
      jsonb_build_object('restored_to', p_restored_to));
    v_count := v_count + 1;
  end loop;

  return v_count;
end $$;

/** Backup freshness. RPO is a lie without this. */
create or replace function public.backup_health(p_max_age_min int default 1440)
returns table (latest_at timestamptz, age_min int, stale boolean)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select b.latest_at,
         (extract(epoch from (now() - b.latest_at)) / 60)::int,
         b.latest_at is null or now() - b.latest_at > make_interval(mins => p_max_age_min)
  from (select max(started_at) as latest_at from public.dr_drill_runs where kind in ('restore','pitr')) b;
end $$;

/** RTO/RPO trend for the status page and the audit pack. */
create or replace function public.dr_readiness()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_last record; v_pass_rate numeric; v_rto int; v_rpo int;
begin
  select * into v_last from public.dr_drill_runs where kind = 'restore' order by started_at desc limit 1;

  select coalesce(
    count(*) filter (where status = 'passed')::numeric / nullif(count(*), 0), 0)
    into v_pass_rate
    from public.dr_drill_runs
   where kind = 'restore' and started_at > now() - interval '90 days';

  v_rto := coalesce(v_last.measured_rto_sec, 0);
  v_rpo := coalesce(v_last.measured_rpo_sec, 0);

  return jsonb_build_object(
    'last_drill_at', v_last.started_at,
    'last_drill_status', coalesce(v_last.status, 'never_run'),
    'measured_rto_sec', v_rto,
    'measured_rpo_sec', v_rpo,
    'target_rto_sec', coalesce(v_last.target_rto_sec, 3600),
    'target_rpo_sec', coalesce(v_last.target_rpo_sec, 900),
    'within_target', (v_rto > 0 and v_rto <= coalesce(v_last.target_rto_sec, 3600))
                     and (v_rpo >= 0 and v_rpo <= coalesce(v_last.target_rpo_sec, 900)),
    'drills_90d', (select count(*) from public.dr_drill_runs where started_at > now() - interval '90 days'),
    'pass_rate_90d', round(v_pass_rate, 3),
    'ever_tested', exists (select 1 from public.dr_drill_runs where kind = 'restore' and status = 'passed')
  );
end $$;

create or replace function public.record_dr_drill(
  p_kind text, p_status text, p_backup_taken_at timestamptz default null,
  p_rto int default null, p_rpo int default null, p_rows_expected bigint default null,
  p_rows_restored bigint default null, p_checks jsonb default '[]'::jsonb, p_failure text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.dr_drill_runs
    (kind, status, finished_at, backup_taken_at, measured_rto_sec, measured_rpo_sec,
     rows_expected, rows_restored, checks, failure_reason)
  values (p_kind, p_status, now(), p_backup_taken_at, p_rto, p_rpo,
          p_rows_expected, p_rows_restored, p_checks, p_failure)
  returning id into v_id;
  return v_id;
end $$;
