-- Observability that actually computes: server-side SLIs, error budgets, alerts.
--
-- Requires extensions: pg_cron (schedule) + pg_net (outbound HTTP).
-- Enable in Supabase -> Database -> Extensions before applying.

create table if not exists public.edge_request_samples (
  id          bigserial primary key,
  route       text not null,            -- normalised, no query string
  status      int  not null,
  duration_ms int  not null,
  tier        text,
  at          timestamptz not null default now()
);
create index if not exists idx_edge_samples_at    on public.edge_request_samples (at desc);
create index if not exists idx_edge_samples_route on public.edge_request_samples (route, at desc);

create table if not exists public.rum_samples (
  id        bigserial primary key,
  metric    text not null check (metric in ('LCP','INP','CLS','FCP','TTFB')),
  value     numeric not null,
  route     text not null,
  at        timestamptz not null default now()
);
create index if not exists idx_rum_at on public.rum_samples (at desc);

create table if not exists public.slo_definitions (
  id           text primary key,
  name         text not null,
  sli_kind     text not null check (sli_kind in ('availability','latency','rum')),
  route        text,                    -- null = all routes
  metric       text,                    -- rum only
  threshold_ms int,                     -- latency only
  target       numeric not null check (target > 0 and target < 1),
  window_min   int not null default 60,
  severity     text not null default 'warning' check (severity in ('warning','critical')),
  runbook_url  text not null,
  enabled      boolean not null default true
);

insert into public.slo_definitions (id, name, sli_kind, route, threshold_ms, target, window_min, severity, runbook_url)
values
  ('avail-api',    'API availability',        'availability', null,        null, 0.999, 60, 'critical', 'docs/observability/runbooks.md#high-error-rate'),
  ('latency-api',  'API p95 latency',         'latency',      null,         800, 0.950, 60, 'warning',  'docs/observability/runbooks.md#latency-degradation'),
  ('avail-charts', 'Chart calc availability', 'availability', 'calculate-kundli', null, 0.999, 60, 'critical', 'docs/observability/runbooks.md#accuracy-degradation'),
  ('rum-lcp',      'Web LCP budget',          'rum',          null,        2500, 0.900, 1440, 'warning', 'docs/observability/runbooks.md#web-vitals')
on conflict (id) do nothing;

create table if not exists public.slo_snapshots (
  id           bigserial primary key,
  slo_id       text not null references public.slo_definitions(id) on delete cascade,
  window_start timestamptz not null,
  window_end   timestamptz not null,
  total        bigint not null,
  good         bigint not null,
  sli          numeric,
  burn_rate    numeric,
  breached     boolean not null default false,
  computed_at  timestamptz not null default now()
);
create index if not exists idx_slo_snapshots_slo on public.slo_snapshots (slo_id, computed_at desc);

create table if not exists public.alert_events (
  id           bigserial primary key,
  slo_id       text not null references public.slo_definitions(id) on delete cascade,
  state        text not null check (state in ('firing','resolved')),
  severity     text not null,
  value        numeric,
  burn_rate    numeric,
  runbook_url  text not null,
  notified_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_alert_events_open on public.alert_events (slo_id, state);

alter table public.edge_request_samples enable row level security;
alter table public.rum_samples          enable row level security;
alter table public.slo_definitions      enable row level security;
alter table public.slo_snapshots        enable row level security;
alter table public.alert_events         enable row level security;

create policy "read samples"  on public.edge_request_samples for select using (true);
create policy "read rum"      on public.rum_samples          for select using (true);
create policy "read slos"     on public.slo_definitions      for select using (true);
create policy "read snaps"    on public.slo_snapshots        for select using (true);
create policy "read alerts"   on public.alert_events         for select using (true);

-- ── writers ─────────────────────────────────────────────────────────────────

create or replace function public.record_edge_sample(
  p_route text, p_status int, p_duration_ms int, p_tier text default null
) returns void language sql security definer set search_path = public as $$
  insert into public.edge_request_samples (route, status, duration_ms, tier)
  values (p_route, p_status, p_duration_ms, p_tier);
$$;

create or replace function public.record_rum(p_metric text, p_value numeric, p_route text)
returns void language sql security definer set search_path = public as $$
  insert into public.rum_samples (metric, value, route) values (p_metric, p_value, p_route);
$$;

-- ── the evaluator: computes SLI + burn rate, opens/resolves alerts ──────────

create or replace function public.evaluate_slos(p_now timestamptz default now())
returns table (slo_id text, sli numeric, burn_rate numeric, breached boolean, action text)
language plpgsql security definer set search_path = public as $$
declare d record; v_total bigint; v_good bigint; v_sli numeric; v_burn numeric;
        v_breached boolean; v_open boolean; v_start timestamptz;
begin
  for d in select * from public.slo_definitions where enabled loop
    v_start := p_now - make_interval(mins => d.window_min);

    if d.sli_kind = 'availability' then
      select count(*), count(*) filter (where status < 500)
        into v_total, v_good
        from public.edge_request_samples
       where at >= v_start and (d.route is null or route = d.route);
    elsif d.sli_kind = 'latency' then
      select count(*), count(*) filter (where duration_ms <= d.threshold_ms)
        into v_total, v_good
        from public.edge_request_samples
       where at >= v_start and (d.route is null or route = d.route);
    else -- rum
      select count(*), count(*) filter (where value <= d.threshold_ms)
        into v_total, v_good
        from public.rum_samples
       where at >= v_start and metric = d.metric;
    end if;

    if coalesce(v_total, 0) = 0 then
      continue;                            -- no data is not a breach
    end if;

    v_sli := v_good::numeric / v_total;
    v_burn := case when d.target >= 1 then 0
                   else ((1 - v_sli) / (1 - d.target)) end;
    v_breached := v_burn >= 1;

    insert into public.slo_snapshots (slo_id, window_start, window_end, total, good, sli, burn_rate, breached)
    values (d.id, v_start, p_now, v_total, v_good, v_sli, v_burn, v_breached);

    select exists (select 1 from public.alert_events where slo_id = d.id and state = 'firing') into v_open;

    if v_breached and not v_open then
      insert into public.alert_events (slo_id, state, severity, value, burn_rate, runbook_url)
      values (d.id, 'firing', d.severity, v_sli, v_burn, d.runbook_url);
      return query select d.id, v_sli, v_burn, true, 'fired';
    elsif not v_breached and v_open then
      update public.alert_events set state = 'resolved'
       where slo_id = d.id and state = 'firing';
      return query select d.id, v_sli, v_burn, false, 'resolved';
    else
      return query select d.id, v_sli, v_burn, v_breached, 'observed';
    end if;
  end loop;
end $$;

/** Retention. Samples are cheap but not free. */
create or replace function public.prune_observability(p_sample_days int default 14, p_snapshot_days int default 90)
returns bigint language plpgsql security definer set search_path = public as $$
declare v bigint := 0; d bigint;
begin
  delete from public.edge_request_samples where at < now() - make_interval(days => p_sample_days);
  get diagnostics d = row_count; v := v + d;
  delete from public.rum_samples where at < now() - make_interval(days => p_sample_days);
  get diagnostics d = row_count; v := v + d;
  delete from public.slo_snapshots where computed_at < now() - make_interval(days => p_snapshot_days);
  get diagnostics d = row_count; v := v + d;
  return v;
end $$;

-- ── schedule ────────────────────────────────────────────────────────────────
-- Minute evaluator + hourly retention. Guarded so re-applying is safe.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('slo-evaluator')  where exists (select 1 from cron.job where jobname = 'slo-evaluator');
    perform cron.unschedule('obs-retention')  where exists (select 1 from cron.job where jobname = 'obs-retention');
    perform cron.schedule('slo-evaluator', '* * * * *', $cron$
      select net.http_post(
        url     := current_setting('app.edge_url', true) || '/slo-evaluator',
        headers := jsonb_build_object('content-type','application/json'),
        body    := '{}'::jsonb
      );
    $cron$);
    perform cron.schedule('obs-retention', '7 * * * *', $cron$ select public.prune_observability(); $cron$);
  end if;
end $$;
