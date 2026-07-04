/**
 * vedhaData.ts — Classical Vedha (Obstruction) Data
 * Source: BV Raman Magazine Enhancement Plan — Feature 1
 * Classical Vedha house pairs from BPHS & Phaladeepika
 */

/** Classical Vedha pairs: planet in house X is obstructed if another planet is in house Y */
export const VEDHA_PAIRS: Record<number, number> = {
  1: 8,
  2: 5,
  3: 9,
  4: 10,
  5: 2,
  6: 12,
  7: 1,
  8: 4,
  9: 3,
  10: 6,
  11: 7,
  12: 11,
};

/** Favorable transit houses for each planet (from Moon) */
export const PLANET_FAVORABLE_HOUSES: Record<string, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 11],
};

/** Malefic planets for Vipreet Vedha calculation */
export const MALEFIC_PLANETS = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'] as const;

/** Benefic planets */
export const BENEFIC_PLANETS = ['Jupiter', 'Venus', 'Moon', 'Mercury'] as const;

/** Vedha house descriptions */
export const VEDHA_HOUSE_DESCRIPTIONS: Record<number, { en: string; hi: string }> = {
  1: { en: 'Self, health, personality', hi: 'सवय, सवसथय, वयकततव' },
  2: { en: 'Wealth, family, speech', hi: 'धन, परवर, वण' },
  3: { en: 'Siblings, courage, short travel', hi: 'भई-बहन, सहस, छट यतर' },
  4: { en: 'Home, mother, happiness', hi: 'घर, मत, सख' },
  5: { en: 'Children, intelligence, past karma', hi: 'सतन, बदध, परव करम' },
  6: { en: 'Enemies, disease, service', hi: 'शतर, रग, सव' },
  7: { en: 'Marriage, partnerships, travel', hi: 'ववह, सझदर, यतर' },
  8: { en: 'Longevity, obstacles, transformation', hi: 'आय, बधए, परवरतन' },
  9: { en: 'Fortune, dharma, father', hi: 'भगय, धरम, पत' },
  10: { en: 'Career, status, authority', hi: 'करयर, परतिषठ, अधकर' },
  11: { en: 'Gains, income, fulfillment', hi: 'लभ, आय, इचछपरत' },
  12: { en: 'Expenses, losses, liberation', hi: 'वयय, हन, मकष' },
};
