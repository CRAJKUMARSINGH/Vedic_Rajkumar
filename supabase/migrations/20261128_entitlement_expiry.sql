-- resolve_entitlement(): expose the grant's PROVENANCE and WINDOW, not just the tier.
--
-- Why: `user_entitlements` has always carried `source` + `expires_at`
-- (20261028_entitlements.sql), and the beta trial writes both
-- (20261126_beta_trials.sql: tier='pro', source='beta_trial', expires_at=start+7d).
-- The RPC dropped them, so the client could render the tier but never the window —
-- which is why the "Beta access · N days left" banner (TrialBanner) could not exist.
--
-- Additive and backwards-compatible: the returned jsonb only GAINS keys, so every
-- existing reader of `data.tier` (supabase/functions/_shared/entitlements.ts and
-- the `tier-entitlement` edge function) keeps working unchanged.
--
-- Authority is unchanged: this is a read. It still denies by default (no row, or an
-- expired row, resolves to 'free'/'default'/null) and is still SECURITY DEFINER with
-- a pinned search_path.

create or replace function public.resolve_entitlement(p_user uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t text;
  s text;
  e timestamptz;
begin
  -- `expires_at is null or expires_at > now()` == "live". A lapsed grant falls out
  -- of the select (not an error), leaving the variables NULL -> the deny-by-default
  -- payload below. plpgsql SELECT ... INTO without STRICT does not raise on zero rows.
  select tier, source, expires_at into t, s, e
    from public.user_entitlements
   where user_id = p_user and (expires_at is null or expires_at > now());

  return jsonb_build_object(
    'tier', coalesce(t, 'free'),
    'source', coalesce(s, 'default'),
    'expires_at', e
  );
end $$;

comment on function public.resolve_entitlement(uuid) is
  'Live entitlement for a user: {tier, source, expires_at}. Deny-by-default -> free/default/null.';
