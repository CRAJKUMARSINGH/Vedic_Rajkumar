-- Week 11: Developer API — API keys management

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,  -- Store hashed key only
  key_prefix TEXT NOT NULL,       -- First 8 chars shown to user for identification
  tier TEXT CHECK (tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  rate_limit_per_day INTEGER DEFAULT 100,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER,
  ip_address INET,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API usage" ON public.api_usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.api_keys
      WHERE api_keys.id = api_usage_log.api_key_id
        AND api_keys.user_id = auth.uid()
    )
  );

-- Function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_api_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.api_keys
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_id ON public.api_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_requested_at ON public.api_usage_log(requested_at);
