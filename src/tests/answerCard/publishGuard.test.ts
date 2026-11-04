/**
 * publishGuard.test.ts — pins the intent of the emitter's write-boundary guard.
 *
 * `assertNoPii()` is the last line of defence before a public answer artifact is
 * written (AGENTS.md — CONFIDENTIALITY). These tests fix its contract so it can
 * only be relaxed deliberately:
 *
 *   • JSON: any raw key on `subject` is a leak.
 *   • Markdown: a *token-anchored* test, ON PURPOSE — a verdict-only card must
 *     never echo the subject's birth date, time or place, even when the place
 *     name falls out of interpretation prose. A card whose prose mentions the
 *     birth city therefore fails the emit rather than sliding through, and that
 *     behaviour is asserted here instead of being discovered at deploy time.
 *
 * The anchor is what separates the two failure modes: "born in Dungarpur" must
 * throw, while the same letters inside an unrelated word ("Rome" in "Romeo")
 * must not. A bare `content.includes(value)` conflated them.
 */

import { describe, expect, it } from 'vitest';
import { assertNoPii, PII_KEYS } from '@/services/answerCard/publishGuard';

const SUBJECT = { dob: '1979-07-28', tob: '23:50', place: 'Dungarpur' };

describe('assertNoPii — JSON artifacts', () => {
  it('throws when the subject carries any raw birth key', () => {
    for (const key of PII_KEYS) {
      const json = JSON.stringify({ subject: { name: 'Pankaj Jain', [key]: 'x' } });
      expect(() => assertNoPii('pankaj-jain/_all.json', json, SUBJECT)).toThrow(
        new RegExp(`subject carries ${key}`),
      );
    }
  });

  it('passes a redacted subject (no raw keys)', () => {
    const json = JSON.stringify({ subject: { name: 'Pankaj Jain', birth_hash: 'a'.repeat(16) } });
    expect(() => assertNoPii('pankaj-jain/_all.json', json, SUBJECT)).not.toThrow();
  });
});

describe('assertNoPii — markdown artifacts', () => {
  it("throws when the prose contains the subject's place, even incidentally", () => {
    const md = 'The native, born in Dungarpur, will prosper.';
    expect(() => assertNoPii('pankaj-jain/_all.md', md, SUBJECT)).toThrow(
      /markdown contains the subject's place/,
    );
  });

  it("throws when the prose contains the subject's dob or tob", () => {
    expect(() => assertNoPii('a.md', 'Born 1979-07-28.', SUBJECT)).toThrow(/subject's dob/);
    expect(() => assertNoPii('a.md', 'At 23:50 precisely.', SUBJECT)).toThrow(/subject's tob/);
  });

  it('passes verdict-only prose that omits every raw value', () => {
    const md = 'Favourable. Band: high. Window: 2026–2027.';
    expect(() => assertNoPii('a.md', md, SUBJECT)).not.toThrow();
  });

  it('ignores raw fields the subject does not carry', () => {
    expect(() => assertNoPii('a.md', 'no raw values here', {})).not.toThrow();
  });
});

describe('assertNoPii — token anchoring (false positives)', () => {
  it('does not trip on the place value as a substring of a longer word', () => {
    const subject = { place: 'Rome' };
    const md = 'The Romeo archetype is a romantic ideal, not a birthplace.';
    expect(() => assertNoPii('a.md', md, subject)).not.toThrow();
  });

  it('still trips when the same value stands alone as a token', () => {
    const subject = { place: 'Rome' };
    expect(() => assertNoPii('a.md', 'Born in Rome.', subject)).toThrow(/subject's place/);
  });

  it('anchors values containing regex metacharacters literally', () => {
    // A dob is hyphenated and a tob colon-separated; both must be matched
    // literally rather than as pattern syntax.
    expect(() => assertNoPii('a.md', 'Date 1979-07-28.', SUBJECT)).toThrow(/subject's dob/);
    expect(() => assertNoPii('a.md', 'Time 23:50.', SUBJECT)).toThrow(/subject's tob/);
    // And a value that is only ever a substring must not match.
    expect(() => assertNoPii('a.md', 'Ref 1979-07-281 and 123:50.', SUBJECT)).not.toThrow();
  });
});
