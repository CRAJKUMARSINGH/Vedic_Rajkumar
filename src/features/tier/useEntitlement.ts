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
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  setServerTier,
  currentTier,
  subscribeServerEntitlement,
  getServerEntitlementSnapshot,
  type ServerEntitlementMeta,
} from './resolveTier';
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
        const body = (await res.json()) as {
          tier?: string;
          source?: string;
          expires_at?: string | null;
        };
        if (cancelled || !body?.tier) return;
        const resolved = toTier(body.tier);
        // `source`/`expires_at` are display-only (they feed the TrialBanner); the
        // server still honours expiry itself, so a stale pair cannot widen access.
        const meta: ServerEntitlementMeta = {
          source: body.source ?? 'default',
          expiresAt: body.expires_at ?? null,
        };
        setServerTier(resolved, meta);
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

// ─── Trial window ────────────────────────────────────────────────────────────

export interface TrialWindow {
  /** True only for a live, time-boxed beta-trial grant. */
  active: boolean;
  /** Whole days remaining (ceil); null when not a trial. */
  daysLeft: number | null;
  /** The server's ISO expiry, verbatim. */
  expiresAt: string | null;
  /** The server's provenance string ('beta_trial', 'default', …). */
  source: string;
}

/**
 * Pure: whole days from `now` to `expiresAt`, rounded UP (a part-day is still a
 * day of access), or null when there is no window / it is unparseable.
 */
export function daysUntil(expiresAt: string | null, now: number = Date.now()): number | null {
  if (!expiresAt) return null;
  const t = Date.parse(expiresAt);
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - now) / 86_400_000);
}

/**
 * The live beta-trial window, or an inert one. Reads the server-entitlement store
 * so it updates the moment `useEntitlement()` hears from the server — rendered via
 * `useSyncExternalStore`, so there is no effect and no first-paint race.
 */
export function useTrialWindow(now: number = Date.now()): TrialWindow {
  const snapshot = useSyncExternalStore(
    subscribeServerEntitlement,
    getServerEntitlementSnapshot,
    getServerEntitlementSnapshot,
  );
  const source = snapshot.meta?.source ?? 'default';
  const expiresAt = snapshot.meta?.expiresAt ?? null;
  const days = daysUntil(expiresAt, now);
  const active = source === 'beta_trial' && days !== null && days >= 0;
  return { active, daysLeft: active ? days : null, expiresAt, source };
}

export default useEntitlement;
