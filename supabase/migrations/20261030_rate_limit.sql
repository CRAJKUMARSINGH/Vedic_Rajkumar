-- Shared-state rate limiting + daily quota, decided in ONE round trip.
--
-- Why Postgres and not Redis: Postgres is already a dependency, and a single
-- FOR UPDATE row lock gives cross-isolate atomicity. Redis/Upstash is a latency
-- optimisation behind the same interface, not a correctness prerequisite.

create table if not exists public.rate_limit_buckets (
  key            text primary key,
  tokens         numeric not null,
  last_refill_ms bigint  not null,
  updated_at     timestamptz not null default now()
);

create table if not exists public.api_usage_daily (
  key_id   text not null,
  day      date not null,
  requests bigint not null default 0,
  errors   bigint not null default 0,
  primary key (key_id, day)
);

-- service-role only: no RLS policy means deny-by-default for anon/authenticated.
alter table public.rate_limit_buckets enable row level security;
alter table public.api_usage_daily  enable row level security;

create policy "service reads buckets" on public.rate_limit_buckets for select using (true);
create policy "service reads usage"   on public.api_usage_daily  for select using (true);

/**
 * admit_request — rate limit AND daily quota in one atomic call.
 * Returns allowed=false with a reason when either gate trips.
 * p_quota < 0 means unlimited (paid tiers).
 */
create or replace function public.admit_request(
  p_bucket_key    text,
  p_capacity      numeric,
  p_refill_per_ms numeric,
  p_now_ms        bigint,
  p_cost          int default 1,
  p_quota_key     text default null,
  p_day           date default null,
  p_quota         bigint default -1
) returns table (
  allowed boolean, reason text, remaining int, retry_after_ms bigint,
  quota_used bigint, quota_remaining bigint
)
language plpgsql security definer set search_path = public as $$
declare
  v_tokens numeric; v_last bigint; v_spend int := greatest(1, coalesce(p_cost, 1));
  v_rate numeric := case when p_refill_per_ms > 0 then p_refill_per_ms else 1e-9 end;
  v_used bigint; v_qlimit bigint := coalesce(p_quota, -1);
begin
  -- ── daily quota first (cheap, and a quota trip should not burn a token) ──
  if p_quota_key is not null and p_day is not null then
    insert into public.api_usage_daily (key_id, day, requests)
    values (p_quota_key, p_day, 1)
    on conflict (key_id, day) do update set requests = api_usage_daily.requests + 1
    returning requests into v_used;

    if v_qlimit >= 0 and v_used > v_qlimit then
      return query select false, 'quota_exceeded', 0, 0::bigint, v_used, 0::bigint;
      return;
    end if;
  end if;

  -- ── token bucket, serialised by the row lock ──
  insert into public.rate_limit_buckets (key, tokens, last_refill_ms)
  values (p_bucket_key, p_capacity, p_now_ms)
  on conflict (key) do nothing;

  select tokens, last_refill_ms into v_tokens, v_last
    from public.rate_limit_buckets where key = p_bucket_key for update;

  v_tokens := least(p_capacity, v_tokens + greatest(0, p_now_ms - v_last) * v_rate);

  if v_tokens >= v_spend then
    update public.rate_limit_buckets
       set tokens = v_tokens - v_spend, last_refill_ms = p_now_ms, updated_at = now()
     where key = p_bucket_key;
    return query select true, 'ok', floor(v_tokens - v_spend)::int, 0::bigint,
                        coalesce(v_used, 0), case when v_qlimit < 0 then -1::bigint else greatest(0, v_qlimit - coalesce(v_used, 0)) end;
  else
    update public.rate_limit_buckets
       set last_refill_ms = p_now_ms, updated_at = now()
     where key = p_bucket_key;
    return query select false, 'rate_limited', 0::int,
                        ceil((v_spend - v_tokens) / v_rate)::bigint,
                        coalesce(v_used, 0), case when v_qlimit < 0 then -1::bigint else greatest(0, v_qlimit - coalesce(v_used, 0)) end;
  end if;
end $$;

/** Housekeeping. Stale buckets are pure garbage after an hour of silence. */
create or replace function public.prune_rate_limit_buckets(p_older_than_minutes int default 60)
returns bigint
language plpgsql security definer set search_path = public as $$
declare v_deleted bigint;
begin
  delete from public.rate_limit_buckets
   where updated_at < now() - make_interval(mins => greatest(1, p_older_than_minutes));
  get diagnostics v_deleted = row_count;
  return v_deleted;
end $$;

create index if not exists idx_rate_limit_buckets_updated on public.rate_limit_buckets (updated_at);
