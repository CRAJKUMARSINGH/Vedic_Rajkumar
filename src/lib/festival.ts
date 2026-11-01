/**
 * festival.ts — window gating, skin resolution and dismissal state.
 *
 * Deliberately date-gated rather than permanent: the dressing turns itself on
 * for the festival window and disappears afterwards without a code change.
 */

import { FESTIVALS, activeFestival, type FestivalId, type FestivalSkin } from '@/lib/festivals';

export const FESTIVAL_WINDOW: { start: string; end: string } = {
  start: '2026-11-01',
  end: '2026-11-15',
};

const DISMISS_KEY = 'festival-greeting-dismissed';

// A festival is an Indian calendar event; the host clock is irrelevant. The day
// key is therefore computed in Asia/Kolkata, never in the machine's timezone.
const IST_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' });

/** `YYYY-MM-DD` in Asia/Kolkata, independent of host timezone. */
const dayKey = (d: Date): string => IST_DAY.format(d);

/** ISO day compare — string compare is safe for `YYYY-MM-DD`. */
export function isFestivalActive(now: Date = new Date()): boolean {
  const today = dayKey(now);
  return today >= FESTIVAL_WINDOW.start && today <= FESTIVAL_WINDOW.end;
}

export function isGreetingDismissed(storage: Pick<Storage, 'getItem'> | null): boolean {
  if (!storage) return false;
  return storage.getItem(DISMISS_KEY) === 'true';
}

export function dismissGreeting(storage: Pick<Storage, 'setItem'> | null): void {
  storage?.setItem(DISMISS_KEY, 'true');
}

/**
 * Resolve the skin for this load. `?festival=off` kills it, `?festival=<id>`
 * forces a named skin (design review), otherwise the calendar decides.
 */
export function resolveFestival(
  search: string,
  now: Date = new Date()
): FestivalSkin | null {
  const flag = new URLSearchParams(search).get('festival');
  if (flag === 'off') return null;
  if (flag === 'on') return activeFestival(now);
  if (flag && flag in FESTIVALS) return FESTIVALS[flag as FestivalId];
  return activeFestival(now);
}
