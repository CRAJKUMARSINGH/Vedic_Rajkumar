/**
 * use-birth-timezone.ts — Lightweight store for the resolved birth timezone.
 *
 * Not a React hook (no useState) — it is a simple module-level store so that
 * services outside React components can read the resolved offset without prop
 * drilling.
 *
 * Usage in a component:
 *   import { setBirthTimezone } from '@/hooks/use-birth-timezone';
 *   import { resolveBirthTimezone } from '@/lib/birthTimezone';
 *
 *   const tz = resolveBirthTimezone({ date, location });
 *   setBirthTimezone(tz);
 *
 * Usage in a service:
 *   import { currentOffsetHours } from '@/hooks/use-birth-timezone';
 *   const offset = currentOffsetHours() ?? 5.5;
 */

import type { BirthTimezone } from '@/lib/birthTimezone';

let _current: BirthTimezone | null = null;

/** Set the resolved birth timezone (call after geocoding / resolving). */
export function setBirthTimezone(tz: BirthTimezone | null): void {
  _current = tz;
}

/** Read the currently-set birth timezone (may be null if not yet resolved). */
export function getBirthTimezone(): BirthTimezone | null {
  return _current;
}

/**
 * The offset in decimal hours, or null if no timezone has been set.
 * Use this rather than reading offsetHours directly so callers can handle
 * the "not yet resolved" case.
 */
export function currentOffsetHours(): number | null {
  return _current?.offsetHours ?? null;
}
