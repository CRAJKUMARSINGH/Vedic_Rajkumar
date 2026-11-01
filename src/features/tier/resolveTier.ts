/**
 * resolveTier.ts — the single runtime source of the internal `UserTier`.
 *
 * WHY THIS EXISTS
 *   Before this file, nothing in the client read a tier at all: `UserTier` was a
 *   type with no runtime producer, so every gate defaulted to `anonymous`. The
 *   tier robot (tests/e2e/tier-matrix.spec.ts) seeded `vr_tier` and the graded
 *   specs behaved identically — a vacuously passing harness.
 *
 * RESOLUTION ORDER (highest authority first)
 *   1. `vr_tier`         — seeded by the tier robot, or written by an auth flow.
 *   2. server entitlement — wired in Dose 2 (`useEntitlement`); absent today.
 *   3. `vedic_subscription` plan — the existing localStorage mirror
 *      (`pro` -> premium, `free` -> registered).
 *   4. `anonymous`.
 *
 * This is a *client* resolver: it is UX, not authorisation. Enforcement stays on
 * the server (Supabase RLS + edge functions). See docs/testing/TIER_MATRIX.md.
 */

import type { UserTier } from './config';
import { getSubscription } from '@/services/subscriptionService';
import { toTier, entitlementFor, type Tier, type Entitlement } from './tiers';

const SEED_KEY = 'vr_tier';
const CACHE_KEY = 'vr_entitlement';

const USER_TIERS: readonly UserTier[] = [
  'anonymous',
  'registered',
  'premium',
  'practitioner',
];

export function isUserTier(value: unknown): value is UserTier {
  return typeof value === 'string' && (USER_TIERS as readonly string[]).includes(value);
}

/** Map the legacy two-value plan onto the internal four-value tier. */
export function tierFromPlan(plan: 'free' | 'pro' | undefined): UserTier {
  return plan === 'pro' ? 'premium' : 'registered';
}

export function resolveTier(): UserTier {
  let seeded: unknown;
  try {
    const raw = localStorage.getItem(SEED_KEY);
    seeded = raw ? JSON.parse(raw) : undefined;
  } catch {
    seeded = undefined;
  }
  if (isUserTier(seeded)) return seeded;

  const sub = getSubscription();
  if (sub) return tierFromPlan(sub.plan);

  return 'anonymous';
}

// ─── Canonical tier (Dose 2) ─────────────────────────────────────────────────
// `resolveTier()` above stays the *legacy* `UserTier` the UI badge renders
// (`data-tier`). The canonical `Tier` (`free|pro|enterprise`) is the single
// taxonomy for entitlements. Both read the same sources, so they never disagree.

/** Provenance + window of the server entitlement (drives the TrialBanner). */
export interface ServerEntitlementMeta {
  source: string;
  /** ISO expiry of a time-boxed grant (beta trial); null = perpetual. */
  expiresAt: string | null;
}

/** Server entitlement, set by `useEntitlement()` after `/tier-entitlement`. */
let serverTier: Tier | null = null;
let serverMeta: ServerEntitlementMeta | null = null;

/**
 * Stable snapshot for `useSyncExternalStore` — a NEW object only when the server
 * speaks. React compares by identity, so returning a fresh object per call would
 * re-render forever.
 */
let serverSnapshot: { tier: Tier | null; meta: ServerEntitlementMeta | null } = {
  tier: null,
  meta: null,
};

const serverListeners = new Set<() => void>();

export function setServerTier(tier: Tier | null, meta: ServerEntitlementMeta | null = null): void {
  serverTier = tier;
  serverMeta = tier ? meta : null;
  serverSnapshot = { tier: serverTier, meta: serverMeta };
  try {
    if (tier) {
      // The cache is a mirror, never an authority: `currentTier()` still prefers
      // module state, and the server re-derives the truth on every privileged call.
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ tier, at: Date.now(), ...(serverMeta ?? {}) }),
      );
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    /* ignore */
  }
  for (const listener of serverListeners) listener();
}

/** Subscribe to server-entitlement changes (for `useSyncExternalStore`). */
export function subscribeServerEntitlement(listener: () => void): () => void {
  serverListeners.add(listener);
  return () => {
    serverListeners.delete(listener);
  };
}

/** Latest server-entitlement snapshot; `tier` is null until the server speaks. */
export function getServerEntitlementSnapshot(): {
  tier: Tier | null;
  meta: ServerEntitlementMeta | null;
} {
  return serverSnapshot;
}

/** Canonical tier from the seeded `vr_tier` key (harness / demo), or null. */
export function seededTier(): Tier | null {
  try {
    const raw = localStorage.getItem(SEED_KEY);
    if (!raw) return null;
    // `vr_tier` may be JSON-encoded ("\"premium\"") or bare ("premium").
    let value: string = raw;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') value = parsed;
    } catch {
      /* bare string */
    }
    return toTier(value);
  } catch {
    return null;
  }
}

/** Server → seeded → legacy resolver → 'free' (deny by default). */
export function currentTier(): Tier {
  return serverTier ?? seededTier() ?? toTier(resolveTier());
}

export function currentEntitlement(): Entitlement {
  return entitlementFor(currentTier());
}

/** True when the server has spoken AND the local seed disagrees — used by the parity spec. */
export function isSeedTampered(): boolean {
  const seeded = seededTier();
  return serverTier !== null && seeded !== null && seeded !== serverTier;
}
