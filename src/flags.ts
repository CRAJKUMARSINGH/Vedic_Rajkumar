/**
 * flags.ts — kill switches with a fail-safe direction.
 *
 * WHY BAKED DEFAULTS: if the flag server is down, the app must still behave. The
 * baked value comes from docs/flags.yaml at build time via gen-flags.mjs, so the
 * fail-safe direction is a reviewable file, not a magic string.
 *
 * Evaluation: baked default → cached server value (TTL 5 min) → live fetch.
 * A flag is never allowed to throw.
 */
import BAKED from './flags.generated.json';

type FlagKey = keyof typeof BAKED;
const CACHE_KEY = 'vr.flags';
const TTL_MS = 5 * 60_000;

let overrides: Partial<Record<FlagKey, boolean>> = {};
let fetchedAt = 0;
let inflight: Promise<void> | null = null;

export function flag(key: FlagKey): boolean {
  void refresh();
  const override = overrides[key];
  return typeof override === 'boolean' ? override : BAKED[key].failsafe;
}

/** Percentage rollout, deterministic per anon id so a user does not flap. */
export function flagRollout(key: FlagKey, anonId: string, percent: number): boolean {
  if (percent >= 100) return true;
  if (percent <= 0) return false;
  let h = 0;
  for (let i = 0; i < anonId.length; i++) h = (h * 31 + anonId.charCodeAt(i)) >>> 0;
  return h % 100 < percent;
}

export async function refresh(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && Date.now() - fetchedAt < TTL_MS) return;

  inflight = (async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_EDGE_URL}/flags`, { credentials: 'include' });
      if (!res.ok) return;                       // keep the baked values
      const data = (await res.json()) as { flags: Partial<Record<FlagKey, boolean>> };
      overrides = data.flags ?? {};
      fetchedAt = Date.now();
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ overrides, at: fetchedAt })); } catch { /* full */ }
    } catch {
      /* offline: baked fail-safe wins */
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Hydrate from the last known values so a cold start is not blind. */
export function hydrateFlags(): void {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { overrides: o, at } = JSON.parse(raw);
    // Stale cache is worse than baked values if it is very old.
    if (Date.now() - at < 24 * 60 * 60_000) { overrides = o ?? {}; fetchedAt = at; }
  } catch { /* ignore */ }
}

/**
 * The kill switch must work even if the flag server is dead. Two levers:
 *   1. a URL param (?kill=checkout) — for the person on call, in seconds
 *   2. localStorage override — persists across the session
 * A third lever is the DB, but that needs the server. These two do not.
 */
export function installKillOverrides(): void {
  try {
    const params = new URLSearchParams(location.search);
    const kills = params.getAll('kill');
    if (kills.length) {
      for (const k of kills) {
        const key = `kill_${k}` as FlagKey;
        if (key in BAKED) overrides[key] = true;
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ overrides, at: Date.now() }));
    }
    if (params.get('unflag') === 'all') { overrides = {}; fetchedAt = Date.now(); }
  } catch { /* ignore */ }
}

export const allFlags = (): Record<string, boolean> =>
  Object.fromEntries(Object.keys(BAKED).map((k) => [k, flag(k as FlagKey)]));
export type { FlagKey };
