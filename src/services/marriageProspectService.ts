// src/services/marriageProspectService.ts
import type { Kundli, MarriageScore } from '@vedic/marriage-prospect-finder';
import { findMarriageProspect } from '@vedic/marriage-prospect-finder';

/**
 * Wrapper around the remote marriage-prospect-finder package.
 * Accepts two Kundli objects and returns a detailed compatibility score.
 */
export async function getMarriageProspect(a: Kundli, b: Kundli): Promise<MarriageScore> {
  try {
    const result = await findMarriageProspect(a, b);
    return result;
  } catch (error) {
    console.error('Marriage prospect calculation failed', error);
    throw error;
  }
}
