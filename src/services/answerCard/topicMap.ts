/**
 * topicMap.ts — card topic → engine life area.
 *
 * `LifeArea` is a closed union without a `property` area, so
 * `house_construction` routes to `wealth` (2nd house = immovable assets) and
 * the 4th house (dwelling) is added back as an overlay, rather than widening
 * the union inside the shipped engine.
 */

import type { LifeArea } from '@/services/conclusiveJatakJudgmentService';
import type { Topic } from './AnswerCard.types';

export const TOPIC_TO_AREA: Record<Topic, LifeArea> = {
  health: 'health',
  house_construction: 'wealth',
  career: 'career',
  marriage: 'marriage',
  finance: 'wealth',
  business: 'career', // LifeArea is closed; 10th via area, ownership houses as extras
};

/** Extra houses scored beyond what the engine already covers. */
export const TOPIC_EXTRA_HOUSES: Partial<Record<Topic, number[]>> = {
  house_construction: [4],
  business: [7, 3, 11], // 7th business/counterparty, 3rd enterprise, 11th gains
};
