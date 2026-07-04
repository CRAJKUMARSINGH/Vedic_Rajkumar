-- Prashna Sessions Table
CREATE TABLE IF NOT EXISTS prashna_sessions (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  question_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  direction TEXT,
  prashna_lagna TEXT NOT NULL,
  prashna_lagna_hindi TEXT,
  category TEXT NOT NULL,
  category_hindi TEXT,
  brief_summary_en TEXT NOT NULL,
  brief_summary_hi TEXT NOT NULL,
  core_method_en TEXT,
  core_method_hi TEXT,
  answer_en TEXT NOT NULL,
  answer_hi TEXT NOT NULL,
  remedies_en TEXT,
  remedies_hi TEXT,
  classical_source TEXT,
  confidence_percent INTEGER NOT NULL DEFAULT 70,
  birth_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Horoscope Analyses Table
CREATE TABLE IF NOT EXISTS horoscope_analyses (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  name TEXT,
  date_of_birth TEXT,
  time_of_birth TEXT,
  place_of_birth TEXT,
  latitude TEXT,
  longitude TEXT,
  moon_sign TEXT,
  ascendant TEXT,
  additional_details TEXT,
  chart_summary TEXT NOT NULL,
  analysis_en TEXT NOT NULL,
  analysis_hi TEXT NOT NULL,
  key_yogas JSONB DEFAULT '[]'::jsonb,
  remedies_en TEXT,
  remedies_hi TEXT,
  classical_sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Entries Table
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  source_type TEXT NOT NULL DEFAULT 'custom',
  source_url TEXT,
  author_name TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies (Basic)
ALTER TABLE prashna_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE horoscope_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Anonymous users can read knowledge
CREATE POLICY "Allow public read knowledge" ON knowledge_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Allow authenticated read knowledge" ON knowledge_entries FOR SELECT TO authenticated USING (true);

-- Users can only read their own sessions (if we add user_id later)
-- For now, allow public read/write for development/prototyping parity with Replit
CREATE POLICY "Allow public read/write sessions" ON prashna_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write analyses" ON horoscope_analyses FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public write knowledge" ON knowledge_entries FOR INSERT TO anon WITH CHECK (true);
