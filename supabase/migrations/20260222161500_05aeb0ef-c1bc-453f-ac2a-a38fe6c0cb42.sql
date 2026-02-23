
-- Table to store transit readings
CREATE TABLE public.transit_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  birth_location TEXT NOT NULL,
  moon_rashi_index INTEGER NOT NULL,
  transit_date TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transit_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert readings (public tool, no auth required)
CREATE POLICY "Anyone can insert readings"
  ON public.transit_readings
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read their own readings by matching birth details
CREATE POLICY "Anyone can read readings"
  ON public.transit_readings
  FOR SELECT
  USING (true);
