/**
 * useEntitlement.ts — fetches the SERVER entitlement once per session and hands
 * it to `resolveTier`'s canonical layer.
 *
 * The server (edge `tier-entitlement` → `user_entitlements`) is the authority;
 * this hook only *renders* from it. When no backend is configured (dev / the
 * tier robot / demo mode) the fetch is skipped entirely and the client falls
 * back to the seeded tier — so the harness is never polluted by network noise.
 *
 * See docs/testing/TIER_PARITY.md.
 */
import { useEffect, useState } from 'react';
import { setServerTier, currentTier } from './resolveTier';
import { entitlementFor, toTier, type Tier, type Entitlement } from './tiers';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when a real (non-placeholder) backend is configured. */
const hasBackend = Boolean(SUPABASE_URL) && !SUPABASE_URL!.includes('placeholder');

export interface EntitlementState {
  tier: Tier;
  entitlement: Entitlement;
  isLoading: boolean;
  /** True when the server override disagreed with the local seed (parity signal). */
  serverBacked: boolean;
}

export function useEntitlement(): EntitlementState {
  const [tier, setTier] = useState<Tier>(() => currentTier());
  const [isLoading, setLoading] = useState(hasBackend);
  const [serverBacked, setServerBacked] = useState(false);

  useEffect(() => {
    if (!hasBackend) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/tier-entitlement`, {
          headers: SUPABASE_ANON_KEY
            ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
            : {},
        });
        if (!res.ok) return;
        const body = (await res.json()) as { tier?: string };
        if (cancelled || !body?.tier) return;
        const resolved = toTier(body.tier);
        setServerTier(resolved);
        setTier(resolved);
        setServerBacked(true);
      } catch {
        /* network / parse failure -> keep the client fallback (deny by default) */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tier, entitlement: entitlementFor(tier), isLoading, serverBacked };
}

/** Renderless bootstrap — mounts the entitlement fetch once, above the router. */
export function EntitlementBootstrap() {
  useEntitlement();
  return null;
}

export default useEntitlement;
