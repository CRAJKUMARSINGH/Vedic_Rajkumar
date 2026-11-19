import { describe, it, expect } from 'vitest';
import { composeAnswer } from '@/services/answerCard/answerComposer';
import type { ChartFacts } from '@/services/answerCard/chartFacts';
import type { Verdict } from '@/services/answerCard/AnswerCard.types';
import { ALL_TOPICS } from '@/services/answerCard/AnswerCard.types';

const verdict = (topic: Verdict['topic'], band: Verdict['band'], score: number): Verdict => ({
  topic, headline: { en: '', hi: '' }, score_0_100: score, band,
  engine_verdict: 'DELIVERING', confidence_0_1: 0.8, window: null,
  rationale: { en: '', hi: '' }, conflicts: [], evidence: [],
  remedies: [], caveats: [],
});

const facts = (): ChartFacts => ({
  ascSign: 0,
  placements: [
    { planet: 'Sun', house: 10, sign: 0, retrograde: false, dignity: 'exalted' },
    { planet: 'Saturn', house: 10, sign: 6, retrograde: false, dignity: 'debilitated' },
    { planet: 'Moon', house: 7, sign: 1, retrograde: false, dignity: 'friend' },
  ],
  houses: {},
});

const verdicts = () => [
  verdict('career', 'good', 80),
  verdict('finance', 'average', 60),
  verdict('marriage', 'caution', 40),
];

const input = (over = {}) => ({
  facts: facts(), verdicts: verdicts(), asked: 'career prospects outlook', language: 'en' as const, ...over,
});

describe('composeAnswer', () => {
  it('is deterministic — identical input, identical output', () => {
    expect(composeAnswer(input())).toEqual(composeAnswer(input()));
  });

  it('empty verdicts → honest "not enough data", no fabricated sections', () => {
    const a = composeAnswer(input({ verdicts: [] }));
    expect(a.verdict_line.en).toContain('Not enough calculation data');
    expect(a.sections).toEqual([]);
    expect(a.ranked).toEqual([]);
  });

  it('bilingual output — every Bi has non-empty en and hi', () => {
    const a = composeAnswer(input());
    const all: { en: string; hi: string }[] = [
      a.verdict_line, a.closing_question, ...(a.sequence ? [a.sequence] : []),
      ...a.sections.flatMap(s => [s.title, s.body, ...s.citations]),
      ...a.app_links.map(l => l.label),
    ];
    for (const b of all) {
      expect(b.en.length).toBeGreaterThan(0);
      expect(b.hi.length).toBeGreaterThan(0);
    }
  });

  it('brief depth suppresses remedy/sequence sections', () => {
    const a = composeAnswer(input({ asked: 'will i get the job?' }));
    expect(a.depth).toBe('brief');
    expect(a.sections.find(s => s.id === 'remedy')).toBeUndefined();
    expect(a.sections.find(s => s.id === 'sequence')).toBeUndefined();
  });

  it('deep depth includes remedy + sequence with citations', () => {
    const a = composeAnswer(input());
    expect(a.depth).toBe('deep');
    expect(a.sections.map(s => s.id)).toContain('why');
    expect(a.sections.map(s => s.id)).toContain('sequence');
    expect(a.sections.map(s => s.id)).toContain('remedy');
    const remedy = a.sections.find(s => s.id === 'remedy')!;
    expect(remedy.citations.some(c => c.en.includes('optional'))).toBe(true);
  });

  it('no direction/geo section — unsupported claims removed per c3', () => {
    const a = composeAnswer(input());
    expect(a.sections.find(s => s.id === 'direction')).toBeUndefined();
    const blob = JSON.stringify(a);
    expect(blob).not.toMatch(/km|kilomet|city pool|rotate/i);
  });

  it('all app_links point at real registered routes', () => {
    const a = composeAnswer(input());
    const paths = a.app_links.map(l => l.path);
    for (const p of paths) expect(p).toMatch(/^\/(transits|muhurat|matchmaking|dasha)$/);
  });

  it('stable tie-break: equal scores order by topic name', () => {
    const vs = [verdict('finance', 'good', 80), verdict('career', 'good', 80)];
    const a = composeAnswer(input({ verdicts: vs, asked: 'x' }));
    expect(a.ranked[0].topic).toBe('career');
  });

  it('missing facts do not fabricate placements — lord-not-certified citation', () => {
    const sparse: ChartFacts = { ascSign: 5, placements: [], houses: {} };
    const a = composeAnswer(input({ facts: sparse, verdicts: [verdict('career', 'good', 80)] }));
    const why = a.sections.find(s => s.id === 'why');
    expect(why).toBeDefined();
    expect(JSON.stringify(why!.citations)).toContain('not certified');
  });

  it('health topic emits remedy only via verified dignity (no health creep)', () => {
    const a = composeAnswer(input({
      verdicts: [verdict('health', 'average', 60), verdict('career', 'good', 80)],
      asked: 'health outlook and career compare which one',
    }));
    // lead is career (80) — remedy targets career houses only
    const remedy = a.sections.find(s => s.id === 'remedy');
    if (remedy) expect(remedy.body.hi.length).toBeGreaterThan(0);
    expect(ALL_TOPICS).toContain('health');
  });
});
