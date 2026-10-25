/**
 * answerCardAsOf.ts — the pinned `as_of` date for the published Answer Layer.
 *
 * Single source of truth for every consumer that must agree on the same date:
 *   - the emitter's default (`scripts/emitAnswerCards.mjs`)
 *   - the emit/render parity guard (`src/tests/answerCard/parity.test.ts`)
 *
 * The emitter must NEVER default to the wall clock: a moving default makes
 * `answers:check` report DRIFT on any day after the emit, and forces the parity
 * test's constant to be hand-edited to match. Bumping this value and re-running
 * `npm run answers:emit` is the one deliberate action that re-dates the cards.
 */
export const ANSWER_CARD_AS_OF = '2026-10-24';
