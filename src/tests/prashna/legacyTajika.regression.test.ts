/**
 * F9 regression — legacy Tajika relation in `prashnaService.ts`.
 *
 * The triage review flagged that Ithasala/Esharapha is decided by a
 * kendra/kona *house-difference* set (`0,3,4,6,8,9`) rather than the classical
 * Tajika drishti set (sign gaps 3,5,7,9,11 → house differences 2,4,6,8,10).
 *
 * This file PINS the legacy behaviour so a future fix is deliberate, and
 * demonstrates the divergence against the verified degree-based kernel in
 * `src/features/prashna/kernel/tajika.ts`. It does NOT change the algorithm.
 */

import { legacyTajikaRelation } from '@/services/prashnaService';
import { aspectGap } from '@/features/prashna/kernel/tajika';

/** Tajika aspect distances counted as sign gaps; a house difference adds 1. */
const TAJIKA_ASPECT_HOUSE_DIFFS = [2, 4, 6, 8, 10];

describe('F9 legacy Tajika relation (pinned)', () => {
  it('treats the kendra/kona house-difference set as "Ithasala"', () => {
    // diff 0,3,4,6,8,9 → Ithasala
    expect(legacyTajikaRelation(1, 1)).toBe('Ithasala'); // diff 0
    expect(legacyTajikaRelation(1, 4)).toBe('Ithasala'); // diff 3
    expect(legacyTajikaRelation(1, 5)).toBe('Ithasala'); // diff 4  ← the review's "4-house gap"
    expect(legacyTajikaRelation(1, 7)).toBe('Ithasala'); // diff 6
    expect(legacyTajikaRelation(1, 9)).toBe('Ithasala'); // diff 8
    expect(legacyTajikaRelation(1, 10)).toBe('Ithasala'); // diff 9
  });

  it('treats every other difference as "Esharapha"', () => {
    for (const diff of [1, 2, 5, 7, 10, 11]) {
      expect(legacyTajikaRelation(1, 1 + diff)).toBe('Esharapha');
    }
  });

  it('is symmetric in its arguments', () => {
    for (let a = 1; a <= 12; a++) {
      for (let b = 1; b <= 12; b++) {
        expect(legacyTajikaRelation(a, b)).toBe(legacyTajikaRelation(b, a));
      }
    }
  });

  it('diverges from the classical Tajika set', () => {
    // Tajika aspects that the legacy rule calls "Esharapha" (missed):
    expect(TAJIKA_ASPECT_HOUSE_DIFFS).toContain(2);
    expect(legacyTajikaRelation(1, 3)).toBe('Esharapha'); // diff 2 → sign gap 3 (Tajika aspect)
    expect(legacyTajikaRelation(1, 11)).toBe('Esharapha'); // diff 10 → sign gap 11 (Tajika aspect)

    // Non-Tajika gaps that the legacy rule calls "Ithasala" (false positives):
    expect(TAJIKA_ASPECT_HOUSE_DIFFS).not.toContain(3);
    expect(legacyTajikaRelation(1, 4)).toBe('Ithasala'); // diff 3 → sign gap 4 (not Tajika)
    expect(legacyTajikaRelation(1, 10)).toBe('Ithasala'); // diff 9 → sign gap 10 (not Tajika)
  });

  it('the verified kernel judges by degree, not by sign gap', () => {
    // A 2-house (60°) separation is an EXACT Tajika aspect…
    expect(aspectGap(60, 0)).toBe(0);
    // …yet the legacy sign-difference rule rejects it.
    expect(legacyTajikaRelation(1, 3)).toBe('Esharapha');
  });
});
