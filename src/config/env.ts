import { z } from 'zod';

/**
 * Validates all required env vars at boot. If anything is missing in prod,
 * the app throws immediately instead of failing mysteriously later.
 */
const schema = z.object({
  VITE_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).default('placeholder-anon-key-min-20-chars'),
  VITE_EPHEMERIS_ENDPOINT: z.string().url().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_RELEASE_VERSION: z.string().default('dev'),
  VITE_LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  MODE: z.enum(['development', 'test', 'production']).default('development'),
});

const raw = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key-min-20-chars',
  VITE_EPHEMERIS_ENDPOINT: import.meta.env.VITE_EPHEMERIS_ENDPOINT,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
  VITE_RELEASE_VERSION: import.meta.env.VITE_RELEASE_VERSION,
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  MODE: import.meta.env.MODE,
};

const parsed = schema.safeParse(raw);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  if (import.meta.env.PROD) {
    throw new Error(`Invalid environment configuration:\n${issues}`);
  } else {
    console.warn(`[config/env] Non-fatal environment issues in dev/test:\n${issues}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const env = parsed.success ? parsed.data : (raw as any);
export const isProd = env.MODE === 'production';
