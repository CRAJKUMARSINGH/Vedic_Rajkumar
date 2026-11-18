import { beforeEach, describe, expect, it } from 'vitest';
import {
  FREE_LIMITS,
  activateProPlan,
  canAskPrashna,
  getPrashnaUsedToday,
  recordPrashnaQuestion,
} from '@/services/subscriptionService';

/**
 * Free-plan Prashna quota — the "3 questions/day" the UpgradeBanner advertises.
 * These cover the count, the rollover at local midnight, the Pro bypass and a
 * corrupt-storage recovery, i.e. every branch that can wrongly block or wrongly
 * allow a question.
 */
describe('prashna daily quota', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts a fresh day with nothing used', () => {
    expect(getPrashnaUsedToday()).toBe(0);
    expect(canAskPrashna()).toBe(true);
  });

  it(`blocks the question after the ${FREE_LIMITS.questionsPerDay} free ones`, () => {
    for (let i = 0; i < FREE_LIMITS.questionsPerDay; i++) {
      expect(canAskPrashna()).toBe(true);
      recordPrashnaQuestion();
    }
    expect(getPrashnaUsedToday()).toBe(FREE_LIMITS.questionsPerDay);
    expect(canAskPrashna()).toBe(false);
  });

  it('rolls the count over on the next local day', () => {
    const day1 = new Date('2026-11-04T10:00:00');
    const day2 = new Date('2026-11-05T09:00:00');

    recordPrashnaQuestion(day1);
    expect(getPrashnaUsedToday(day1)).toBe(1);
    expect(getPrashnaUsedToday(day2)).toBe(0);
  });

  it('never limits a Pro subscriber', () => {
    activateProPlan('Test User', 'pro@example.com');
    for (let i = 0; i < FREE_LIMITS.questionsPerDay * 3; i++) {
      recordPrashnaQuestion();
    }
    expect(canAskPrashna()).toBe(true);
  });

  it('treats unreadable storage as a fresh day rather than blocking', () => {
    localStorage.setItem('vedic_prashna_usage', 'not-json');
    expect(getPrashnaUsedToday()).toBe(0);
    expect(canAskPrashna()).toBe(true);
  });
});
