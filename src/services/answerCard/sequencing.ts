/**
 * sequencing.ts — optional planning guidance, not a rule.
 *
 * Per c3 Phase 2: the two-action cap is a presentation guideline. The copy
 * never tells the user to delay medical care, financial obligations or
 * urgent safety actions — it only orders discretionary astrological steps.
 * Pure.
 */
import type { Verdict, Topic } from './AnswerCard.types';
import type { Bi } from './bilingual';

const BAND_RANK: Record<Verdict['band'], number> = {
  excellent: 5, good: 4, average: 3, caution: 2, avoid: 1,
};

const TOPIC_WORD: Record<Topic, Bi> = {
  career: { en: 'the job change', hi: 'नौकरी परिवर्तन' },
  finance: { en: 'the money decision', hi: 'आर्थिक निर्णय' },
  marriage: { en: 'the marriage step', hi: 'विवाह कदम' },
  health: { en: 'the health regimen', hi: 'स्वास्थ्य नियम' },
  house_construction: { en: 'the construction', hi: 'निर्माण कार्य' },
};

export interface Sequencing {
  /** Suggested cap — guidance only, never a mandate. */
  max: number;
  order: Topic[];
  line: Bi;
}

export function deriveSequencing(verdicts: Verdict[]): Sequencing | null {
  const live = verdicts.filter(v => BAND_RANK[v.band] >= 3);
  if (live.length < 2) return null;

  // Stable deterministic ordering: band desc, then score desc, then topic asc.
  const order = [...live]
    .sort((a, b) =>
      BAND_RANK[b.band] - BAND_RANK[a.band] ||
      b.score_0_100 - a.score_0_100 ||
      a.topic.localeCompare(b.topic))
    .map(v => v.topic);

  const max = 2;
  const en = order.map(t => TOPIC_WORD[t].en);
  const hi = order.map(t => TOPIC_WORD[t].hi);

  return {
    max,
    order,
    line: {
      en: `Optional planning note: if you are acting on several matters, many practitioners suggest starting with at most ${max} at a time — ${en.join(', then ')}. This is sequencing guidance only; it never overrides medical, financial or safety obligations.`,
      hi: `वैकल्पिक योजना नोट: कई विषयों पर काम करते समय कुछ परंपराएँ अधिकतम ${max} से शुरू करने का सुझाव देती हैं — ${hi.join(', फिर ')}। यह केवल क्रम-सुझाव है; चिकित्सा, वित्त या सुरक्षा दायित्वों की जगह नहीं लेता।`,
    },
  };
}
