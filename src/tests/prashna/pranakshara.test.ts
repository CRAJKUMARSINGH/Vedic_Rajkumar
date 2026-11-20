/**
 * Rule tests — Pranakshara (Prasnalove.txt §9; PM Ch. II §24, st. 104–108).
 * Every varga letter plus the vowel and "others" cases. Synthetic inputs.
 */
import { describe, it, expect } from 'vitest';
import {
  CYCLE,
  OTHERS,
  VARGAS,
  pranakshara,
} from '@/features/prashna/kernel/pranakshara';

describe('Pranakshara — consonant vargas', () => {
  it('the five letters of every varga cycle Vayu,Agni,Indra,Jala,Napumsaka', () => {
    VARGAS.forEach((varga) => {
      varga.forEach((letter, i) => {
        const r = pranakshara(letter);
        expect(r, letter).not.toBeNull();
        expect(r!.kind).toBe('consonant');
        expect(r!.bhuta).toBe(CYCLE[i]);
        expect(r!.lifeBody).toBe('body');
      });
    });
  });
});

describe('Pranakshara — other consonants (same cycle, repeated)', () => {
  it('य, र, ल, व, श … follow CYCLE by position', () => {
    OTHERS.forEach((letter, i) => {
      const r = pranakshara(letter);
      expect(r, letter).not.toBeNull();
      expect(r!.kind).toBe('consonant');
      expect(r!.bhuta).toBe(CYCLE[i % 5]);
    });
  });

  it('क्ष is read as क्ष (Napumsaka), not as क', () => {
    const r = pranakshara('क्षमा');
    expect(r?.matched).toBe('क्ष');
    expect(r?.bhuta).toBe('Napumsaka');
    expect(r?.effect).toBe('very-bad');
  });
});

describe('Pranakshara — vowels', () => {
  it('short vowels → Indra (life)', () => {
    const r = pranakshara('अग्नि');
    expect(r?.kind).toBe('vowel');
    expect(r?.bhuta).toBe('Indra');
    expect(r?.effect).toBe('neutral');
    expect(r?.lifeBody).toBe('life');
  });

  it('long vowels → Jala (favourable)', () => {
    const r = pranakshara('आशा');
    expect(r?.bhuta).toBe('Jala');
    expect(r?.effect).toBe('favourable');
    expect(r?.lifeBody).toBe('life');
  });

  it('ए (short) → Indra, ऐ (long) → Jala', () => {
    expect(pranakshara('एक')?.bhuta).toBe('Indra');
    expect(pranakshara('ऐसा')?.bhuta).toBe('Jala');
  });
});

describe('Pranakshara — effects', () => {
  it('maps each bhuta to its classical effect', () => {
    expect(pranakshara('कल')?.effect).toBe('evil'); // क → Vayu
    expect(pranakshara('खग')?.effect).toBe('evil'); // ख → Agni
    expect(pranakshara('गम')?.effect).toBe('neutral'); // ग → Indra
    expect(pranakshara('घर')?.effect).toBe('favourable'); // घ → Jala
    expect(pranakshara('ङ')?.effect).toBe('very-bad'); // ङ → Napumsaka
  });

  it('unknown akshara → null', () => {
    expect(pranakshara('a')).toBeNull();
    expect(pranakshara('X')).toBeNull();
    expect(pranakshara('   ')).toBeNull();
  });
});
