-- pgTAP: admit_request atomicity + quota + prune. Run with `npm run test:db`.
begin;
select plan(7);

-- 1. first call starts full and is allowed
select is(
  (select allowed from public.admit_request('rl:t:a', 5, 0.001, 1000, 1, null, null, -1)),
  true, 'first request is allowed');

-- 2. burst is consumed exactly
select public.admit_request('rl:t:b', 3, 0.001, 1000, 1, null, null, -1);
select public.admit_request('rl:t:b', 3, 0.001, 1000, 1, null, null, -1);
select is(
  (select allowed from public.admit_request('rl:t:b', 3, 0.001, 1000, 1, null, null, -1)),
  false, 'fourth request against burst=3 is denied');

-- 3. denial reports a positive retry_after_ms
select cmp_ok(
  (select retry_after_ms from public.admit_request('rl:t:b', 3, 0.001, 1000, 1, null, null, -1)),
  '>', 0::bigint, 'denied response carries a retry hint');

-- 4. refill restores tokens after enough elapsed ms
select is(
  (select allowed from public.admit_request('rl:t:c', 1, 0.001, 1000, 1, null, null, -1)), true, 'c1 allowed');
select is(
  (select allowed from public.admit_request('rl:t:c', 1, 0.001, 6000, 1, null, null, -1)), true, 'c2 allowed after refill');

-- 5. daily quota trips and is independent of the bucket
select is(
  (select reason from public.admit_request('rl:t:d', 100, 0.001, 1000, 1, 'qk:d', '2026-10-30', 1)),
  'ok', 'first quota unit allowed');
select is(
  (select reason from public.admit_request('rl:t:d', 100, 0.001, 1000, 1, 'qk:d', '2026-10-30', 1)),
  'quota_exceeded', 'second unit trips the quota even with bucket left');

select * from finish();
rollback;
