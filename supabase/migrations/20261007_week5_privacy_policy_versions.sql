-- Week 5 GDPR/DPDP: Privacy policy version tracking
-- Records which version of the privacy policy each user has consented to.
-- Required for GDPR Article 7 (demonstrable consent) and DPDP Act 2023.

-- ── 1. Policy versions catalogue ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS privacy_policy_versions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  version     TEXT        NOT NULL UNIQUE,              -- e.g. '1.0', '1.1'
  effective_date DATE     NOT NULL,
  summary     TEXT,                                     -- human-readable change summary
  content_url TEXT,                                     -- URL to full policy text
  is_current  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one version can be current at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_privacy_policy_versions_current
  ON privacy_policy_versions(is_current)
  WHERE is_current = true;

-- ── 2. User consent records ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_privacy_consents (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL,             -- Supabase auth.users OR Clerk userId
  policy_version_id   UUID        NOT NULL REFERENCES privacy_policy_versions(id),
  consented           BOOLEAN     NOT NULL,
  consent_method      TEXT        NOT NULL DEFAULT 'explicit_click', -- 'explicit_click' | 'api'
  ip_address          INET,
  user_agent          TEXT,
  consented_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at          TIMESTAMPTZ,                     -- NULL means still active
  UNIQUE (user_id, policy_version_id)
);

CREATE INDEX IF NOT EXISTS idx_user_privacy_consents_user_id
  ON user_privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_consents_policy_version_id
  ON user_privacy_consents(policy_version_id);

-- ── 3. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE privacy_policy_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_consents    ENABLE ROW LEVEL SECURITY;

-- Anyone can read policy versions (needed to show the consent banner)
CREATE POLICY "Anyone can read privacy policy versions" ON privacy_policy_versions
  FOR SELECT USING (true);

-- Users can read their own consent records
CREATE POLICY "Users can read own consents" ON user_privacy_consents
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert/update their own consent records
CREATE POLICY "Users can manage own consents" ON user_privacy_consents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own consents" ON user_privacy_consents
  FOR UPDATE USING (user_id = auth.uid());

-- Admins (via service role) can read all
-- (handled by service role key in edge functions — no policy needed)

-- ── 4. Seed: initial policy version ──────────────────────────────────────────

INSERT INTO privacy_policy_versions (version, effective_date, summary, is_current)
VALUES (
  '1.0',
  '2026-10-07',
  'Initial privacy policy covering GDPR Article 7 and India DPDP Act 2023. '
  'Covers birth data processing, Vedic calculations, family profiles, and third-party integrations.',
  true
)
ON CONFLICT (version) DO NOTHING;

-- ── 5. Helper: get current policy version ────────────────────────────────────

CREATE OR REPLACE FUNCTION get_current_privacy_policy_version()
RETURNS privacy_policy_versions
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM privacy_policy_versions WHERE is_current = true LIMIT 1;
$$;

-- ── 6. Helper: check user has consented to current version ───────────────────

CREATE OR REPLACE FUNCTION user_has_current_consent(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_privacy_consents upc
    JOIN privacy_policy_versions ppv ON ppv.id = upc.policy_version_id
    WHERE upc.user_id = p_user_id
      AND upc.consented = true
      AND upc.revoked_at IS NULL
      AND ppv.is_current = true
  );
$$;

COMMENT ON TABLE privacy_policy_versions IS
  'Catalogue of all published privacy policy versions. Only one can be current.';
COMMENT ON TABLE user_privacy_consents IS
  'GDPR Article 7 / DPDP Act 2023 — records per-user consent per policy version.';
