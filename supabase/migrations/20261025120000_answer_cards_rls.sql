-- Answer Layer confidentiality enforcement.
--
-- `public/answers/**` used to be a world-readable static corpus carrying each
-- subject's name, date of birth, time of birth and birthplace. AGENTS.md
-- (CONFIDENTIALITY, standing order) forbids that: seed-bank data and everything
-- derived from it is private, readable only by the subject's own account or an
-- owner/admin.
--
-- The full cards now live here, RLS-locked. Anonymous callers have no policy at
-- all (deny by default); only the subject's owner or an owner/admin may select a
-- row; writes come from the emitter's service role, which bypasses RLS.

-- Reusable admin predicate. SECURITY DEFINER so the policy can read user_roles
-- without recursing through that table's own policies.
CREATE OR REPLACE FUNCTION public.is_owner_or_admin(uid text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id::text = uid
      AND user_roles.role IN ('owner', 'admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_owner_or_admin(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner_or_admin(text) TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.answer_cards (
  slug          TEXT PRIMARY KEY,
  subject_name  TEXT NOT NULL,
  jatak_id      TEXT,
  -- Account allowed to read the full (unredacted) card. NULL = nobody but an
  -- owner/admin. Set by the emitter when a subject is linked to an account.
  owner_id      TEXT,
  card          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answer_cards_owner ON public.answer_cards(owner_id);
CREATE INDEX IF NOT EXISTS idx_answer_cards_name ON public.answer_cards(lower(subject_name));

ALTER TABLE public.answer_cards ENABLE ROW LEVEL SECURITY;

-- Deliberately no anon policy: unauthenticated callers read nothing.
DROP POLICY IF EXISTS "Owner or admin reads answer card" ON public.answer_cards;

CREATE POLICY "Owner or admin reads answer card"
  ON public.answer_cards
  FOR SELECT
  TO authenticated
  USING (
    owner_id = COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub')
    OR public.is_owner_or_admin(COALESCE(auth.uid()::TEXT, auth.jwt() ->> 'sub'))
  );

-- No INSERT/UPDATE/DELETE policy for `authenticated`: the only writer is the
-- emit script using the service role, which bypasses RLS by design.
