-- Answer Layer contract 1.2 — bilingual full-card store.
--
-- Locale standing rule (AGENTS.md): every generated artifact ships in en AND hi.
-- The public corpus is now emitted per language (`<slug>/_all.<lang>.{json,md}`,
-- plus per topic); the private `answer_cards` store must hold one full card per
-- (subject, language) so `/answer-cards?lang=` can serve either.
--
-- Additive and backward-compatible with 1.1: existing rows default to the
-- default locale (`hi`), and the un-suffixed public paths still resolve.

ALTER TABLE public.answer_cards
  ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'hi';

-- Replace the single-column primary key with (slug, lang). Drop by lookup so
-- the migration is idempotent and does not depend on the auto-generated name.
DO $$
DECLARE
  pk_name TEXT;
BEGIN
  SELECT conname INTO pk_name
  FROM pg_constraint
  WHERE conrelid = 'public.answer_cards'::regclass
    AND contype = 'p'
  LIMIT 1;

  IF pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.answer_cards DROP CONSTRAINT %I', pk_name);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.answer_cards'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.answer_cards ADD PRIMARY KEY (slug, lang);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_answer_cards_slug_lang ON public.answer_cards(slug, lang);

-- RLS is unchanged: the policy reads `owner_id` / role, not `lang`, so it still
-- denies by default and grants only the subject's own account or owner/admin.
