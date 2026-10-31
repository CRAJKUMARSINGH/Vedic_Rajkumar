/**
 * Week 4: Environment Contract Tests
 *
 * Tests for assertProdEnv(), warnMissingObservability() and the derived exports
 * of `@/config/env` (the single env contract — ADR-004 removed the
 * `@/lib/envConfig` duplicate, whose validateEnv() only warned).
 *
 * The contract that matters: production FAILS FAST when Supabase/Clerk keys are
 * missing, rather than silently degrading to demo mode.
 *
 * Note: import.meta.env is mocked per Vitest's environment setup.
 * We use vi.stubEnv() to control env vars without touching the real .env file.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/** Real-looking value that satisfies `.min(20)`. */
const REAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiJ9.real-anon-key-value';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Re-import the module under test with fresh import.meta.env state.
 * We reset modules between tests because env.ts parses import.meta.env at module
 * evaluation time (the `env` object is created at load).
 */
async function loadEnv() {
  vi.resetModules();
  return import('@/config/env');
}

// ─── Defaults ────────────────────────────────────────────────────────────────

describe('env — defaults', () => {
  beforeEach(() => vi.unstubAllEnvs());
  afterEach(() => vi.unstubAllEnvs());

  it('defaults the release version to "dev"', async () => {
    const { releaseVersion } = await loadEnv();
    expect(releaseVersion).toBe('dev');
  });

  it('leaves the Swiss Ephemeris switch off unless explicitly enabled', async () => {
    vi.stubEnv('VITE_USE_SWISS_EPHEMERIS', '');
    const { useSwissEphemeris } = await loadEnv();
    expect(useSwissEphemeris).toBe(false);
  });

  it('isProd mirrors import.meta.env.PROD', async () => {
    const { isProd } = await loadEnv();
    expect(isProd).toBe(false);
  });
});

// ─── assertProdEnv — development / test ──────────────────────────────────────

describe('assertProdEnv — non-production (no-op)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not throw when keys are missing outside production', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');

    const { assertProdEnv } = await loadEnv();
    expect(() => assertProdEnv()).not.toThrow();
  });
});

// ─── assertProdEnv — production ──────────────────────────────────────────────

describe('assertProdEnv — production (fails fast)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('throws when VITE_SUPABASE_URL is missing in production', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', REAL_ANON_KEY);
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_real');

    const { assertProdEnv } = await loadEnv();
    expect(() => assertProdEnv()).toThrow(/VITE_SUPABASE_URL/);
    expect(() => assertProdEnv()).toThrow(/refusing to boot/);
  });

  it('names every missing key, not just the first', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');

    const { assertProdEnv } = await loadEnv();
    expect(() => assertProdEnv()).toThrow(
      /VITE_SUPABASE_URL.*VITE_SUPABASE_ANON_KEY.*VITE_CLERK_PUBLISHABLE_KEY/s,
    );
  });

  it('does not throw when all required keys are present in production', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_SUPABASE_URL', 'https://real.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', REAL_ANON_KEY);
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_real');

    const { assertProdEnv } = await loadEnv();
    expect(() => assertProdEnv()).not.toThrow();
  });
});

// ─── warnMissingObservability — non-fatal ────────────────────────────────────

describe('warnMissingObservability', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('warns and returns the missing keys when observability is unconfigured', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    vi.stubEnv('VITE_FLAGSMITH_ENV_KEY', '');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { warnMissingObservability } = await loadEnv();

    const missing = warnMissingObservability();

    expect(missing).toEqual(['VITE_SENTRY_DSN', 'VITE_POSTHOG_KEY', 'VITE_FLAGSMITH_ENV_KEY']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('VITE_SENTRY_DSN'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('observability unconfigured'));

    warnSpy.mockRestore();
  });

  it('returns an empty list and stays quiet when observability is configured', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://sentry.example.com/1');
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_real');
    vi.stubEnv('VITE_FLAGSMITH_ENV_KEY', 'fs_real');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { warnMissingObservability } = await loadEnv();

    expect(warnMissingObservability()).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
