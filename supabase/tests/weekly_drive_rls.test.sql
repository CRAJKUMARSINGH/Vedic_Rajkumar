-- pgTAP: weekly_drive_grants RLS + RPC invariants. Run with `npm run test:db`.
begin;
select plan(6);

-- Two synthetic users. Adjust the column list if your auth.users shim differs.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@test.local');

-- 1. grant is idempotent
select public.grant_weekly_drive('00000000-0000-0000-0000-0000000000a1', '2026-W44', now(), now() + interval '7 days', 21, '{}'::jsonb);
select public.grant_weekly_drive('00000000-0000-0000-0000-0000000000a1', '2026-W44', now(), now() + interval '7 days', 21, '{}'::jsonb);
select is(
  (select count(*) from public.weekly_drive_grants where user_id = '00000000-0000-0000-0000-0000000000a1' and week_key = '2026-W44'),
  1::bigint, 'grant is idempotent for (user, week)');

-- 2. second user gets their own row
select public.grant_weekly_drive('00000000-0000-0000-0000-0000000000b2', '2026-W44', now(), now() + interval '7 days', 21, '{}'::jsonb);
select is(
  (select count(*) from public.weekly_drive_grants where user_id = '00000000-0000-0000-0000-0000000000b2'),
  1::bigint, 'second user has an independent row');

-- 3. consume increments exactly once
select public.consume_weekly_drive('00000000-0000-0000-0000-0000000000a1', '2026-W44');
select is(
  (select questions_consumed from public.weekly_drive_grants where user_id = '00000000-0000-0000-0000-0000000000a1' and week_key = '2026-W44'),
  1, 'consume increments the counter');

-- 4. exhaustion raises the named error
select set_config('vr.uid', '00000000-0000-0000-0000-0000000000c3', false);
select public.grant_weekly_drive('00000000-0000-0000-0000-0000000000c3', '2026-W44', now(), now() + interval '7 days', 1, '{}'::jsonb);
select public.consume_weekly_drive('00000000-0000-0000-0000-0000000000c3', '2026-W44');
select throws_ok(
  $$ select public.consume_weekly_drive('00000000-0000-0000-0000-0000000000c3', '2026-W44') $$,
  'P0001', 'weekly_drive_exhausted', 'exhausted grant raises weekly_drive_exhausted');

-- 5. unlimited never exhausts
select public.grant_weekly_drive('00000000-0000-0000-0000-0000000000b2', '2026-W45', now(), now() + interval '7 days', -1, '{}'::jsonb);
select public.consume_weekly_drive('00000000-0000-0000-0000-0000000000b2', '2026-W45');
select public.consume_weekly_drive('00000000-0000-0000-0000-0000000000b2', '2026-W45');
select is(
  (select questions_consumed from public.weekly_drive_grants where user_id = '00000000-0000-0000-0000-0000000000b2' and week_key = '2026-W45'),
  2, 'unlimited grant keeps consuming');

-- 6. owner-read policy exists and is scoped
select is(
  (select count(*) from pg_policies where tablename = 'weekly_drive_grants' and cmd = 'SELECT'),
  1::bigint, 'exactly one SELECT policy on weekly_drive_grants');

select * from finish();
rollback;
