/**
 * version.ts — client build identity + the deploy-skew floor.
 *
 * Client mirror of supabase/functions/_shared/client-version.ts. The server
 * advertises MIN_CLIENT_VERSION; this module tells the running bundle how it
 * compares. Keep the floor in sync with the server file — scripts/deploy-safety.mjs
 * reads the server copy as the source of truth.
 */

/** Bump ONLY with a breaking change. See docs/ops/UPDATE_SAFETY.md. */
export const MIN_CLIENT_VERSION = '1.4.0';

/** The version this bundle was built as, for the X-Client-Version request header. */
export const APP_VERSION = '1.7.3';

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
