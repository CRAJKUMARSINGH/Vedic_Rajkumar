/**
 * Week 4: Environment Configuration Tests
 *
 * Tests for validateEnv(), isProduction(), isDevelopment(),
 * isSupabaseConfigured(), isClerkConfigured(), and the env object.
 *
 * Note: import.meta.env is mocked per Vitest's environment setup.
 * We use vi.stubEnv() to control env vars without touching the real .env file.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Re-import the module under test with fresh import.meta.env state.
 * We reset modules between tests because envConfig reads import.meta.env
 * at module evaluation time (the `env` object is created at module load).
 */
async function loadEnvConfig() {
  // Reset cached module so the `env` object re-evaluates
  vi.resetModules();
  return import('@/lib/envConfig');
}

// ─── isProduction / isDevelopment ────────────────────────────────────────────

describe('isProduction / isDevelopment', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('isDevelopment returns true in test/development mode', async () => {
    vi.stubEnv('MODE', 'test');
    const { isDevelopment, isProduction } = await loadEnvConfig();
    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
  });

  it('isProduction returns true when MODE is production', async () => {
    vi.stubEnv('MODE', 'production');
    const { isProduction, isDevelopment } = await loadEnvConfig();
    expect(isProduction()).toBe(true);
    expect(isDevelopment()).toBe(false);
  });
});

// ─── validateEnv — development mode ─────────────────────────────────────────

describe('validateEnv — development mode (warns, does not throw)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('emits console.warn when required vars are missing in dev', async () => {
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { validateEnv } = await loadEnvConfig();
    expect(() => validateEnv()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing or placeholder env vars'),
    );

    warnSpy.mockRestore();
  });

  it('does not warn when all required vars are present in dev', async () => {
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://real.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'real-anon-key');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_real');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { validateEnv } = await loadEnvConfig();
    validateEnv();
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Missing or placeholder env vars'),
    );

    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });

  it('detects placeholder values as missing', async () => {
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://your-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'your-supabase-anon-key');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_your_clerk_key');

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { validateEnv } = await loadEnvConfig();
    validateEnv();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('VITE_SUPABASE_URL'),
    );

    warnSpy.mockRestore();
  });
});

// ─── validateEnv — production mode ──────────────────────────────────────────

describe('validateEnv — production mode (throws on missing vars)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('throws when VITE_SUPABASE_URL is missing in production', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'real-key');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_real');

    const { validateEnv } = await loadEnvConfig();
    expect(() => validateEnv()).toThrowError(/Missing required environment variables/);
    expect(() => validateEnv()).toThrowError(/VITE_SUPABASE_URL/);
  });

  it('throws listing all missing keys in production', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', '');

    const { validateEnv } = await loadEnvConfig();
    expect(() => validateEnv()).toThrowError(/VITE_SUPABASE_URL/);
    expect(() => validateEnv()).toThrowError(/VITE_SUPABASE_ANON_KEY/);
    expect(() => validateEnv()).toThrowError(/VITE_CLERK_PUBLISHABLE_KEY/);
  });

  it('does not throw when all vars are present in production', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://real.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'real-anon-key');
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_live_real');

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const { validateEnv } = await loadEnvConfig();
    expect(() => validateEnv()).not.toThrow();
    infoSpy.mockRestore();
  });
});

// ─── isSupabaseConfigured ────────────────────────────────────────────────────

describe('isSupabaseConfigured', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns false when URL is empty', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'key');
    const { isSupabaseConfigured } = await loadEnvConfig();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false when URL contains placeholder', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://placeholder.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'key');
    const { isSupabaseConfigured } = await loadEnvConfig();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns true with real Supabase credentials', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abcxyz.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiJ9.real');
    const { isSupabaseConfigured } = await loadEnvConfig();
    expect(isSupabaseConfigured()).toBe(true);
  });
});
