/**
 * envConfig.ts
 *
 * Week 4: Environment configuration validation and helpers.
 *
 * Validates required VITE_* environment variables at application startup.
 * In production mode, missing required vars throw a descriptive error so
 * the app fails fast rather than silently misbehaving.
 * In development mode, missing vars emit console.warn with a helpful hint.
 *
 * Usage:
 *   import { validateEnv, isProduction, isDevelopment, env } from '@/lib/envConfig';
 *   validateEnv(); // call once in main.tsx before createRoot
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_CLERK_PUBLISHABLE_KEY: string;
  VITE_SENTRY_DSN: string;
  VITE_GA_MEASUREMENT_ID: string;
  MODE: string;
}

// ─── Required / optional split ────────────────────────────────────────────────

const REQUIRED_KEYS: (keyof AppEnv)[] = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CLERK_PUBLISHABLE_KEY',
];

const OPTIONAL_BUT_WARNED_KEYS: (keyof AppEnv)[] = [
  'VITE_GA_MEASUREMENT_ID',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true when Vite is building / running in production mode.
 * Safe to call anywhere — does not depend on React.
 */
export function isProduction(): boolean {
  return import.meta.env.MODE === 'production';
}

/**
 * Returns true in development / test mode.
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE !== 'production';
}

/**
 * Typed accessor for environment variables.
 * Falls back to an empty string so TypeScript callers don't need to null-check.
 */
export const env: AppEnv = {
  VITE_SUPABASE_URL:        import.meta.env.VITE_SUPABASE_URL        ?? '',
  VITE_SUPABASE_ANON_KEY:   import.meta.env.VITE_SUPABASE_ANON_KEY   ?? '',
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '',
  VITE_SENTRY_DSN:          import.meta.env.VITE_SENTRY_DSN          ?? '',
  VITE_GA_MEASUREMENT_ID:   import.meta.env.VITE_GA_MEASUREMENT_ID   ?? '',
  MODE:                     import.meta.env.MODE                     ?? 'development',
};

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate required environment variables.
 *
 * - In production: throws an Error if any required key is absent or a placeholder.
 * - In development: emits console.warn for each missing required key; does not throw.
 * - Optionally warns about missing optional keys in all modes.
 *
 * Call once in src/main.tsx before createRoot().
 */
export function validateEnv(): void {
  const missing = REQUIRED_KEYS.filter((key) => {
    const value = env[key];
    return (
      !value ||
      value.trim() === '' ||
      value.startsWith('your-') ||      // common placeholder pattern
      value.includes('your-project') || // supabase URL placeholder
      value.includes('your_clerk') ||   // clerk key placeholder
      value === 'placeholder_anon_key' ||
      value === 'pk_test_your_clerk_key'
    );
  });

  if (missing.length > 0) {
    const keyList = missing.join(', ');
    const hint = 'Copy .env.example to .env and fill in the missing values.';

    if (isProduction()) {
      throw new Error(
        `[Vedic Rajkumar] Missing required environment variables in production: ${keyList}. ` +
        hint,
      );
    } else {
      console.warn(
        `[Vedic Rajkumar] ⚠️  Missing or placeholder env vars: ${keyList}.\n` +
        `${hint}\n` +
        `Some features (auth, database) will not work without these.`,
      );
    }
  }

  // Warn about optional keys regardless of mode
  const missingOptional = OPTIONAL_BUT_WARNED_KEYS.filter((key) => !env[key]);
  if (missingOptional.length > 0) {
    console.info(
      `[Vedic Rajkumar] ℹ️  Optional env vars not set: ${missingOptional.join(', ')}. ` +
      'Some features (analytics) will be disabled.',
    );
  }
}

/**
 * Returns true if Supabase is properly configured (URL and anon key are present
 * and not placeholders). Useful for guarding data layer calls.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(env.VITE_SUPABASE_URL) &&
    !env.VITE_SUPABASE_URL.includes('placeholder') &&
    Boolean(env.VITE_SUPABASE_ANON_KEY) &&
    !env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
  );
}

/**
 * Returns true if Clerk is properly configured.
 */
export function isClerkConfigured(): boolean {
  return Boolean(env.VITE_CLERK_PUBLISHABLE_KEY) && !env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_');
}
