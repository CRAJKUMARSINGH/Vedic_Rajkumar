/**
 * publishGuard.ts — the hard write-boundary guard for public answer artifacts.
 *
 * `public/answers/**` is world-readable (AGENTS.md — CONFIDENTIALITY standing
 * order), so the emitter must refuse to publish anything carrying a subject's
 * raw birth data. `assertNoPii()` is that refusal: it throws instead of writing.
 *
 * Extracted from `scripts/emitAnswerCards.mjs` so the guard is unit-testable —
 * the `.mjs` cannot be imported (it runs a full emit at module scope). The
 * emitter loads THIS module, so a test pins the behaviour that actually ships.
 *
 * `.json` artifacts are checked structurally (a raw key on `subject` is a leak);
 * `.md` artifacts are checked textually against `dob`/`tob`/`place`. The markdown
 * check is a *token-anchored* test: a verdict-only card must never echo the
 * subject's birth date, time or place, even incidentally in prose — but it must
 * not trip on the same letters inside an unrelated word either (the "Rome"
 * inside "Romeo" false-positive class recorded against this guard).
 */

/** Raw birth keys that must never appear on a public `subject`. */
export const PII_KEYS = ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted'] as const;

/** The subset of raw fields also scanned for as tokens in rendered markdown. */
export const PII_MARKDOWN_KEYS = ['dob', 'tob', 'place'] as const;

/** The raw fields the guard inspects; null-tolerant for builders that pad. */
export interface GuardSubject {
  dob?: string | null;
  tob?: string | null;
  place?: string | null;
}

/** Escape a raw value so it can be embedded in a RegExp literally. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True when `value` occurs in `content` as a whole token, not as a substring of
 * a longer word. Lookarounds rather than `\b`: `\b` is undefined next to a
 * non-word character, so a value ending in punctuation (a time `23:50`, a
 * coordinate) would anchor wrongly.
 */
function containsToken(content: string, value: string): boolean {
  return new RegExp(`(?<![\\w])${escapeRegExp(value)}(?![\\w])`).test(content);
}

/**
 * Throw (never return a value) if `content` would publish a birth field.
 * `rel` ends in `.json` or `.md` and is used only for the error message.
 */
export function assertNoPii(rel: string, content: string, subject: GuardSubject): void {
  if (rel.endsWith('.json')) {
    const parsed = JSON.parse(content) as { subject?: Record<string, unknown> };
    const leaked = PII_KEYS.filter((k) => parsed?.subject?.[k] !== undefined);
    if (leaked.length) {
      throw new Error(`REFUSING to publish ${rel}: subject carries ${leaked.join(', ')}`);
    }
    return;
  }
  for (const key of PII_MARKDOWN_KEYS) {
    const value = subject[key];
    if (value && containsToken(content, value)) {
      throw new Error(`REFUSING to publish ${rel}: markdown contains the subject's ${key}`);
    }
  }
}
