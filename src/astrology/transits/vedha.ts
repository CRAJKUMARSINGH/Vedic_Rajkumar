/**
 * Vedha = a piercing sign that cancels a benefic transit result.
 * Keyed by graha → map of benefic sign-offset → vedha sign-offset (from natal Moon).
 * Offsets are 1-based houses from Moon.
 */
export const VEDHA_PAIRS: Record<string, Array<[number, number]>> = {
  Sun: [[3, 9], [6, 12], [10, 4], [11, 5]],
  Moon: [[1, 5], [3, 9], [6, 12], [7, 2], [10, 4], [11, 8]],
  Mars: [[3, 12], [6, 9], [11, 5]],
  Mercury: [[2, 5], [4, 3], [6, 9], [8, 1], [10, 8], [11, 12]],
  Jupiter: [[2, 12], [5, 4], [6, 9], [7, 3], [11, 8]],
  Venus: [[1, 8], [2, 7], [3, 1], [4, 10], [5, 9], [6, 11], [7, 2], [9, 5], [11, 6], [12, 3]],
  Saturn: [[3, 12], [5, 4], [6, 9], [11, 5]],
};

/** Returns the vedha sign offset (from Moon) that obstructs, if any. */
export const getVedha = (graha: string, beneficOffsetFromMoon: number): number | null => {
  const pairs = VEDHA_PAIRS[graha] ?? [];
  for (const [benefic, vedha] of pairs) {
    if (benefic === beneficOffsetFromMoon) return vedha;
  }
  return null;
};

/** True if the transit's benefic effect is cancelled by an obstructing graha. */
export const isVedhaActive = (
  graha: string,
  beneficOffset: number,
  occupiedOffsets: Set<number>,
): boolean => {
  const vedha = getVedha(graha, beneficOffset);
  return vedha !== null && occupiedOffsets.has(vedha);
};
