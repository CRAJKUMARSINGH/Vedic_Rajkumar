-- Enrichment as a DATA RELEASE: batched, versioned, time-travellable, revertible.
--
-- The key design choice is effective_from / effective_to on content_entries. That
-- gives two things:
--   1. schedule a festival calendar entry ahead of the year
--   2. revert a bad batch by DATE, without touching anything published since
--
-- Deliberately NOT a single `content` blob: a blob means every change is a full
-- rewrite, and you cannot diff what changed.

create table if not exists public.content_batches (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,              -- 'nakshatra' | 'dasha' | 'festival' | 'i18n' | 'alert'
  status      text not null default 'draft'
              check (status in ('draft','validated','canary','published','reverted','failed')),
  source      text not null,              -- 'manual' | 'ephemeris-2026' | 'panchang-ref'
  source_url  text,
  entry_count int not null default 0,
  checks      jsonb not null default '[]'::jsonb,
  notes       text,
  actor       text not null default 'enrich-cli',
  created_at  timestamptz not null default now(),
  applied_at  timestamptz,
  reverted_at timestamptz,
  canary_pct  int not null default 0 check (canary_pct between 0 and 100)
);
create index if not exists idx_content_batches_kind on public.content_batches (kind, created_at desc);

create table if not exists public.content_entries (
  id            bigserial primary key,
  batch_id      uuid not null references public.content_batches(id) on delete restrict,
  kind          text not null,
  key           text not null,            -- e.g. 'nakshatra.ashwini' | 'festival.diwali.2027'
  locale        text not null default 'en' check (locale in ('en','hi')),
  body          jsonb not null,
  effective_from date not null default current_date,
  effective_to   date,
  source_url    text,
  verified_by   text,
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- One live entry per (kind, key, locale, date). The partial unique index is what
-- makes "two live versions of the same key" impossible.
create unique index if not exists uq_content_live
  on public.content_entries (kind, key, locale, effective_from);
create index if not exists idx_content_lookup
  on public.content_entries (kind, key, locale, effective_from, effective_to);

alter table public.content_batches enable row level security;
alter table public.content_entries enable row level security;
create policy "read batches" on public.content_batches for select using (true);
create policy "read entries" on public.content_entries for select using (true);

/** Resolve content for a date. Time travel is a query, not a restore. */
create or replace function public.content_for(p_kind text, p_key text, p_locale text default 'en', p_on date default current_date)
returns jsonb language sql stable security definer set search_path = public as $$
  select e.body from public.content_entries e
   where e.kind = p_kind and e.key = p_key and e.locale = p_locale
     and e.effective_from <= p_on
     and (e.effective_to is null or e.effective_to > p_on)
   order by e.effective_from desc
   limit 1;
$$;

/** Revert a batch: close its entries on a date rather than deleting them. */
create or replace function public.revert_content_batch(p_batch uuid, p_from date default current_date)
returns int language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  update public.content_entries
     set effective_to = p_from
   where batch_id = p_batch
     and (effective_to is null or effective_to > p_from);
  get diagnostics v_count = row_count;

  update public.content_batches
     set status = 'reverted', reverted_at = now()
   where id = p_batch;

  return v_count;
end $$;

/**
 * Coverage check: what SHOULD have content but does not. This is how enrichment
 * is tracked as a backlog rather than discovered as a gap by a user.
 */
create or replace function public.content_coverage(p_kind text, p_expected int)
returns jsonb language sql security definer set search_path = public as $$
  with live as (
    select distinct key, locale from public.content_entries
     where kind = p_kind and effective_from <= current_date
       and (effective_to is null or effective_to > current_date)
  )
  select jsonb_build_object(
    'kind', p_kind,
    'expected', p_expected,
    'en', (select count(*) from live where locale = 'en'),
    'hi', (select count(*) from live where locale = 'hi'),
    'missing_hi', p_expected - (select count(*) from live where locale = 'hi'),
    'complete', (select count(*) from live where locale = 'en') = p_expected
                and (select count(*) from live where locale = 'hi') = p_expected
  );
$$;

/**
 * FESTIVAL CALENDAR — the sharp one. A wrong date is a wrong reading for millions.
 * Every entry needs a source_url, and the year must be covered in BOTH locales.
 */
create or replace function public.festival_year_health(p_year int)
returns jsonb language sql security definer set search_path = public as $$
  with y as (
    select * from public.content_entries
     where kind = 'festival'
       and key like 'festival.%.' || p_year
       and (effective_to is null or effective_to > current_date)
  )
  select jsonb_build_object(
    'year', p_year,
    'entries', (select count(*) from y),
    'unsourced', (select count(*) from y where source_url is null),
    'unverified', (select count(*) from y where verified_at is null),
    'hi_parity', (select count(*) from y where locale = 'hi') = (select count(*) from y where locale = 'en'),
    'ready', (select count(*) from y) > 0
             and (select count(*) from y where source_url is null) = 0
             and (select count(*) from y where verified_at is null) = 0
  );
$$;
