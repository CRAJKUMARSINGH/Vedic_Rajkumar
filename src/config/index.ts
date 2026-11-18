/**
 * config/index.ts — the `@/config` entry point.
 *
 * EDGE_URL is the one value the browser shares with the Supabase Edge Functions.
 * Reading it once here means a missing `VITE_EDGE_URL` is a single greppable
 * constant rather than a scatter of `import.meta.env` reads. The trailing slash
 * is stripped so callers can always append `/funnel` without doubling it.
 */
export const EDGE_URL = (import.meta.env.VITE_EDGE_URL ?? '').replace(/\/+$/, '');
