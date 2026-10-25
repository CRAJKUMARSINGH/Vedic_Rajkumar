/**
 * redact.ts — the ONE place a card is projected down to a narrower viewer.
 *
 * Standing order (AGENTS.md §CONFIDENTIALITY): seed-bank birth data and
 * everything derived from it is private. Non-admin responses carry the verdict
 * only; raw birth fields (`dob`, `tob`, `place`, `lat`, `lon`, and the resolved
 * `tz`) are omitted, with a stable `birth_hash` kept for provenance/parity.
 *
 * Every public surface must go through this module — the emitter
 * (`scripts/emitAnswerCards.mjs`), the `/v1/answer` route, and the
 * `answer-cards` Edge Function — so there is exactly one definition of "what a
 * non-privileged caller may see".
 */

import { stableHash } from '@/lib/hash/stableHash';
import type { AnswerCard } from './AnswerCard.types';

/**
 * `public` — an authenticated non-admin (e.g. a free API-key holder).
 * `owner`  — the account that owns this subject's record.
 * `admin`  — `ROLE_DEFINITIONS[role].isAdmin === true` (owner/admin).
 */
export type Viewer = 'public' | 'owner' | 'admin';

/** Only the subject's own account and admins may see raw birth data. */
export function maySeeBirthData(viewer: Viewer): boolean {
  return viewer === 'owner' || viewer === 'admin';
}

/**
 * Project `card` for `viewer`. Returns the card unchanged for owner/admin;
 * otherwise strips every raw birth field and records `birth_hash`.
 *
 * Pure and total — safe to call on an already-redacted card (idempotent).
 */
export function redactAnswerCard(card: AnswerCard, viewer: Viewer = 'public'): AnswerCard {
  if (maySeeBirthData(viewer)) return card;

  const { dob, tob, place, lat, lon, tz, tz_defaulted, birth_hash, ...publicSubject } = card.subject;
  const birth_hash_next =
    birth_hash ??
    stableHash({
      dob: dob ?? '',
      tob: tob ?? '',
      place: place ?? '',
      lat: lat ?? null,
      lon: lon ?? null,
      tz: tz ?? '',
    });

  return { ...card, subject: { ...publicSubject, birth_hash: birth_hash_next } };
}
