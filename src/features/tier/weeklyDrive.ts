/**
 * weeklyDrive.ts — weekly free-user drive (rolling 7-day allowance).
 *
 * WHY THIS EXISTS
 *   Every existing quota in the repo is DAILY:
 *     src/features/tier/config.ts   -> maxChartsPerDay (5 / 20 / 100 / -1)
 *     src/services/subscriptionService.ts -> FREE_LIMITS.questionsPerDay = 3
 *     src/api/v1/scopes.ts          -> RATE_LIMITS[tier].dailyQuota
 *   Nothing resets on a week boundary, so no weekly conversion signal exists.
 *
 * DESIGN RULES
 *   1. The week boundary is anchored to Asia/Kolkata (IST, +05:30, no DST) so
 *      the window is deterministic for the primary market.
 *   2. Pure functions only. Storage/network live in the store below.
 *   3. The server (weekly_drive_grants + weekly-drive edge fn) is authoritative;
 *      localStorage is an offline-first mirror, never the source of truth.
 */

import type { UserTier } from './config';

export const WEEKLY_DRIVE = {
  windowDays: 7,
  weekStartsOn: 1, // ISO-8601: Monday
  timezone: 'Asia/Kolkata',
  /** -1 means unlimited. */
  grants: {
    anonymous: { questions: 7, premiumTrials: 1 },
    registered: { questions: 21, premiumTrials: 1 },
    premium: { questions: -1, premiumTrials: -1 },
    practitioner: { questions: -1, premiumTrials: -1 },
  },
  /** conversion signal: >= 80% consumed for 2 consecutive weeks */
  saturationThreshold: 0.8,
  conversionWeeks: 2,
} as const;

export interface WeekWindow {
  key: string; // '2026-W44'
  start: Date; // Monday 00:00 IST
  end: Date; // next Monday 00:00 IST (exclusive)
}

export interface WeeklyGrant {
  weekKey: string;
  questionsGranted: number; // -1 = unlimited
  questionsConsumed: number;
  premiumTrials: number;
}

const IST_OFFSET_MIN = 330;
const MS_DAY = 86_400_000;
const MS_WEEK = 604_800_000;

/** Shift an instant into a UTC-based view of IST wall-clock time. */
function toIst(instant: Date): Date {
  return new Date(instant.getTime() + IST_OFFSET_MIN * 60_000);
}

/**
 * ISO-8601 week key in IST. `2026-10-26T00:00+05:30` -> '2026-W44'.
 * Monday 00:00 IST is the first instant of a week; Sunday 23:59:59 IST is the last.
 */
export function weekKey(at: Date = new Date()): string {
  const ist = toIst(at);
  const dow = ist.getUTCDay(); // 0 = Sunday
  const isoDow = dow === 0 ? 7 : dow;

  const monday = new Date(ist);
  monday.setUTCDate(ist.getUTCDate() - (isoDow - 1));
  monday.setUTCHours(0, 0, 0, 0);

  // The Thursday of this ISO week determines the year (ISO-8601 rule).
  const thursday = new Date(monday.getTime() + 3 * MS_DAY);
  const year = thursday.getUTCFullYear();
  const jan1 = Date.UTC(year, 0, 1);
  const week = Math.floor((thursday.getTime() - jan1) / MS_WEEK) + 1;

  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function weekWindow(at: Date = new Date()): WeekWindow {
  const ist = toIst(at);
  const dow = ist.getUTCDay();
  const isoDow = dow === 0 ? 7 : dow;

  const mondayIst = new Date(ist);
  mondayIst.setUTCDate(ist.getUTCDate() - (isoDow - 1));
  mondayIst.setUTCHours(0, 0, 0, 0);

  // Back out of the IST view to real instants.
  const start = new Date(mondayIst.getTime() - IST_OFFSET_MIN * 60_000);
  const end = new Date(start.getTime() + WEEKLY_DRIVE.windowDays * MS_DAY);

  return { key: weekKey(at), start, end };
}

export function grantFor(tier: UserTier): { questions: number; premiumTrials: number } {
  return WEEKLY_DRIVE.grants[tier] ?? WEEKLY_DRIVE.grants.anonymous;
}

export function remainingFrom(granted: number, consumed: number): number {
  if (granted === -1) return -1;
  return Math.max(0, granted - consumed);
}

export function isExhausted(grant: WeeklyGrant): boolean {
  return grant.questionsGranted !== -1 && grant.questionsConsumed >= grant.questionsGranted;
}

export function isSaturated(grant: WeeklyGrant): boolean {
  if (grant.questionsGranted === -1 || grant.questionsGranted === 0) return false;
  return grant.questionsConsumed / grant.questionsGranted >= WEEKLY_DRIVE.saturationThreshold;
}

/** Build the deterministic week-keyed row the server upserts (idempotent). */
export function buildGrantRow(userId: string, tier: UserTier, at: Date = new Date()) {
  const w = weekWindow(at);
  const g = grantFor(tier);
  return {
    user_id: userId,
    week_key: w.key,
    week_start: w.start.toISOString(),
    week_end: w.end.toISOString(),
    questions_granted: g.questions,
    feature_grants: { premiumTrials: g.premiumTrials },
  };
}

// ─── Offline-first mirror (never authoritative) ───────────────────────────────

const MIRROR_KEY = 'vr_weekly_drive';

export function readMirror(): WeeklyGrant | null {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeeklyGrant;
    return parsed.weekKey === weekKey() ? parsed : null; // stale week -> treat as absent
  } catch {
    return null;
  }
}

export function writeMirror(grant: WeeklyGrant): void {
  try {
    localStorage.setItem(MIRROR_KEY, JSON.stringify(grant));
  } catch {
    /* ignore */
  }
}
