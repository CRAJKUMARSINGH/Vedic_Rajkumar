/**
 * Rule tests — the Five Sutras (Prasnalove.txt §9; PM Ch. VI §60–65).
 * Truth tables are derived independently from the spec. All inputs synthetic.
 */
import { describe, it, expect } from 'vitest';
import {
  adhipatiSutra,
  nakshatraSutra,
  pairSutra,
  samanyaSutra,
  signNature,
} from '@/features/prashna/kernel/sutras';
import type { Sutra } from '@/features/prashna/kernel/sutras';

// One representative rasi index per nature (0-based from Aries).
const MOVABLE = 0; // Aries
const FIXED = 1; // Taurus
const COMMON = 2; // Gemini

describe('signNature', () => {
  it('cycles movable/fixed/common', () => {
    expect(signNature(0)).toBe('movable');
    expect(signNature(1)).toBe('fixed');
    expect(signNature(2)).toBe('common');
    expect(signNature(3)).toBe('movable');
    expect(signNature(11)).toBe('common'); // Pisces
  });
});

describe('pairSutra — the 9 sign-nature pairs', () => {
  // rows = arudha nature (movable, fixed, common), cols = lagna nature.
  const expected: Sutra[][] = [
    ['Jeeva', 'Roga', 'Mrityu'], // movable+movable, movable+fixed, movable+common
    ['Roga', 'Mrityu', 'Jeeva'], // fixed+movable,   fixed+fixed,   fixed+common
    ['Mrityu', 'Jeeva', 'Roga'], // common+movable,  common+fixed,  common+common
  ];
  const natures = [MOVABLE, FIXED, COMMON];

  it.each([0, 1, 2])('arudha nature row %i', (i) => {
    [0, 1, 2].forEach((j) => {
      expect(pairSutra(natures[i], natures[j])).toBe(expected[i][j]);
    });
  });

  it('is order-independent', () => {
    expect(pairSutra(MOVABLE, FIXED)).toBe(pairSutra(FIXED, MOVABLE));
    expect(pairSutra(COMMON, FIXED)).toBe(pairSutra(FIXED, COMMON));
  });

  it('samanya sutra is Arudha vs Lagna', () => {
    expect(samanyaSutra(FIXED, COMMON)).toBe('Jeeva');
    expect(samanyaSutra(MOVABLE, MOVABLE)).toBe('Jeeva');
  });
});

describe('nakshatraSutra remainders (1→Jeeva, 2→Roga, 0→Mrityu)', () => {
  it('counts from Lagna nakshatra to Janma nakshatra', () => {
    const lagna = 1;
    expect(nakshatraSutra(lagna, 1)).toBe('Jeeva'); // count 1
    expect(nakshatraSutra(lagna, 2)).toBe('Roga'); // count 2
    expect(nakshatraSutra(lagna, 3)).toBe('Mrityu'); // count 3
    expect(nakshatraSutra(lagna, 4)).toBe('Jeeva'); // count 4
    expect(nakshatraSutra(lagna, 27)).toBe('Mrityu'); // count 27
  });

  it('wraps forward across the 27th → 1st', () => {
    // lagna 27 (Revati), janma 1 (Ashwini): count = 2
    expect(nakshatraSutra(27, 1)).toBe('Roga');
  });
});

describe('adhipatiSutra', () => {
  it('same lord → Jeeva', () => {
    expect(adhipatiSutra('Sun', 'Sun')).toBe('Jeeva');
  });

  it('mutual natural friends → Jeeva (Sun & Moon)', () => {
    expect(adhipatiSutra('Sun', 'Moon')).toBe('Jeeva');
  });

  it('enmity → Mrityu (Sun & Saturn)', () => {
    expect(adhipatiSutra('Sun', 'Saturn')).toBe('Mrityu');
  });

  it('one-way friendship → Roga (BPHS Sun/Mercury case)', () => {
    // Mercury is a friend of the Sun, but the Sun is neutral toward Mercury.
    expect(adhipatiSutra('Sun', 'Mercury')).toBe('Roga');
  });
});
