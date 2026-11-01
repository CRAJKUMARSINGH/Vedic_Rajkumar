/**
 * viteEnvShim.ts — lets code written for Vite (src/api/v1/*) run unchanged in Deno.
 *
 * Vite statically replaces `import.meta.env.X` at build time. Deno has no
 * `import.meta.env`, so any module-level read of it throws. This module defines it.
 *
 * MUST be imported BEFORE anything under src/ — ESM evaluates dependencies in
 * import order, so a side-effect import at the top of the entry is sufficient.
 */
const env: Record<string, unknown> = {
  MODE: Deno.env.get('DENO_ENV') ?? 'production',
  PROD: true,
  DEV: false,
  VITE_SUPABASE_URL: Deno.env.get('SUPABASE_URL') ?? '',
  VITE_SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  VITE_RELEASE_VERSION: Deno.env.get('RELEASE_VERSION') ?? 'dev',
  VITE_USE_SWISS_EPHEMERIS: 'false',
};

const meta = import.meta as unknown as Record<string, unknown>;
if (!meta.env) meta.env = env;

export const shimmedEnv = env;
