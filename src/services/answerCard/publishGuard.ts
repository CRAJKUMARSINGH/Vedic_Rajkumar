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
 * check is intentionally a bare substring test: a verdict-only card must never
 * echo the subject's birth date, time or place, even incidentally in prose.
 */

/** Raw birth keys that must never appear on a public `subject`. */
export const PII_KEYS = ['dob', 'tob', 'place', 'lat', 'lon', 'tz', 'tz_defaulted'] as const;

/** The subset of raw fields also scanned for as substrings in rendered markdown. */
export const PII_MARKDOWN_KEYS = ['dob', 'tob', 'place'] as const;

/** The raw fields the guard inspects; null-tolerant for builders that pad. */
export interface GuardSubject {
  dob?: string | null;
  tob?: string | null;
  place?: string | null;
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
    if (value && content.includes(value)) {
      throw new Error(`REFUSING to publish ${rel}: markdown contains the subject's ${key}`);
    }
  }
}
