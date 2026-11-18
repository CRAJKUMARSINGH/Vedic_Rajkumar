/**
 * env.ts — THE env contract. Replaces src/lib/envConfig.ts.
 *
 * Two behaviours matter here:
 *   1. Demo mode is allowed in dev (blank .env) so `npm run dev` works instantly.
 *   2. Production FAILS FAST when Supabase/Clerk keys are missing. Previously a
 *      prod deploy missing them silently degraded to demo mode and looked fine.
 */
import { z } from 'zod';

const schema = z.object({
  MODE: z.string().default('production'),
  PROD: z.boolean().default(true),
  DEV: z.boolean().default(false),

  // Identity / persistence — required in production
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),

  // Observability — were dependencies but absent from the env contract (dose 6 wires them)
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_FLAGSMITH_ENV_KEY: z.string().optional(),

  // Release tag — must match the deployed commit or Sentry releases are useless
  VITE_RELEASE_VERSION: z.string().default('dev'),

  // Feature switches
  VITE_USE_SWISS_EPHEMERIS: z.enum(['true', 'false']).default('false'),

  // Read directly by their consumers (transitService, logger); kept here so the
  // contract is the single list rather than a scattered set of import.meta.env reads.
  VITE_EPHEMERIS_ENDPOINT: z.string().url().optional(),
  VITE_LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
});

type Env = z.infer<typeof schema>;

// A blank `VITE_FOO=` in a copied .env is the same as "not set" — otherwise a
// blank demo .env would fail `.url()` and (in prod) refuse to boot.
const raw = Object.fromEntries(
  Object.entries((import.meta.env ?? {}) as Record<string, unknown>).map(([k, v]) => [
    k,
    v === '' ? undefined : v,
  ]),
);
const parsed = schema.safeParse(raw);

if (!parsed.success && raw.PROD) {
  throw new Error(`[env] invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env: Env = parsed.success ? parsed.data : schema.parse({});

const REQUIRED_IN_PROD = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLERK_PUBLISHABLE_KEY',
] as const;

export function assertProdEnv(): void {
  if (!env.PROD) return;
  const missing = REQUIRED_IN_PROD.filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(
      `[env] production build missing ${missing.join(', ')} — refusing to boot in silent demo mode`,
    );
  }
}

/** Non-fatal: observability is missing but the app still runs. */
export function warnMissingObservability(): string[] {
  const missing = (
    ['VITE_SENTRY_DSN', 'VITE_POSTHOG_KEY', 'VITE_FLAGSMITH_ENV_KEY'] as const
  ).filter((k) => !env[k]);
  if (missing.length) {
    console.warn(`[env] observability unconfigured (no-op in prod): ${missing.join(', ')}`);
  }
  return [...missing];
}

export const useSwissEphemeris = env.VITE_USE_SWISS_EPHEMERIS === 'true';
export const releaseVersion = env.VITE_RELEASE_VERSION;
export const isProd = env.PROD;
