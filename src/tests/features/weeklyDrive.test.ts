import { describe, it, expect } from 'vitest';
import {
  weekKey,
  weekWindow,
  grantFor,
  remainingFrom,
  isExhausted,
  isSaturated,
  buildGrantRow,
  WEEKLY_DRIVE,
} from '@/features/tier/weeklyDrive';

describe('weeklyDrive — week boundary (Asia/Kolkata, ISO-8601)', () => {
  it('anchors the week to Monday 00:00 IST', () => {
    expect(weekKey(new Date('2026-10-26T00:00:00+05:30'))).toBe('2026-W44');
    expect(weekKey(new Date('2026-10-27T12:00:00+05:30'))).toBe('2026-W44');
  });

  it('keeps Sunday 23:59 IST in the PREVIOUS week', () => {
    expect(weekKey(new Date('2026-10-25T23:59:00+05:30'))).toBe('2026-W43');
  });

  it('rolls over exactly at the IST boundary, not the UTC one', () => {
    // 18:29Z == 23:59 IST Sun 25 Oct -> W43 ; 18:31Z == 00:01 IST Mon 26 Oct -> W44
    expect(weekKey(new Date('2026-10-25T18:29:00Z'))).toBe('2026-W43');
    expect(weekKey(new Date('2026-10-25T18:31:00Z'))).toBe('2026-W44');
  });

  it('handles the ISO year rollover correctly', () => {
    expect(weekKey(new Date('2026-12-31T12:00:00+05:30'))).toBe('2026-W53');
    expect(weekKey(new Date('2027-01-01T12:00:00+05:30'))).toBe('2026-W53'); // belongs to 2026
    expect(weekKey(new Date('2027-01-04T12:00:00+05:30'))).toBe('2027-W01');
  });

  it('exposes a 7-day half-open window', () => {
    const w = weekWindow(new Date('2026-10-27T12:00:00+05:30'));
    expect(w.key).toBe('2026-W44');
    expect(w.end.getTime() - w.start.getTime()).toBe(7 * 86_400_000);
    expect(w.start.toISOString()).toBe('2026-10-25T18:30:00.000Z'); // Mon 00:00 IST
  });
});

describe('weeklyDrive — grant semantics', () => {
  it('grants a finite allowance to free tiers and unlimited to paid', () => {
    expect(grantFor('anonymous').questions).toBe(7);
    expect(grantFor('registered').questions).toBe(21);
    expect(grantFor('premium').questions).toBe(-1);
    expect(grantFor('practitioner').questions).toBe(-1);
  });

  it('computes remaining without going negative and preserves unlimited', () => {
    expect(remainingFrom(21, 5)).toBe(16);
    expect(remainingFrom(21, 99)).toBe(0);
    expect(remainingFrom(-1, 9999)).toBe(-1);
  });

  it('flags exhaustion and saturation', () => {
    expect(isExhausted({ weekKey: 'x', questionsGranted: 21, questionsConsumed: 21, premiumTrials: 0 })).toBe(true);
    expect(isSaturated({ weekKey: 'x', questionsGranted: 21, questionsConsumed: 17, premiumTrials: 0 })).toBe(true);
    expect(isSaturated({ weekKey: 'x', questionsGranted: 21, questionsConsumed: 10, premiumTrials: 0 })).toBe(false);
    expect(isSaturated({ weekKey: 'x', questionsGranted: -1, questionsConsumed: 500, premiumTrials: 0 })).toBe(false);
  });

  it('builds an idempotent, week-keyed grant row', () => {
    const at = new Date('2026-10-27T12:00:00+05:30');
    const row = buildGrantRow('u1', 'registered', at);
    expect(row.week_key).toBe('2026-W44');
    expect(row.questions_granted).toBe(21);
    expect(row.week_start).toBe('2026-10-25T18:30:00.000Z');
    expect(WEEKLY_DRIVE.conversionWeeks).toBe(2);
  });
});
