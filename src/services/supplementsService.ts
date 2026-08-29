// src/services/supplementsService.ts
import { listGuides, Guide } from '@vedic/supplements';

/** Wrapper around the remote supplements package. Returns a list of spiritual guides. */
export async function getGuides(): Promise<Guide[]> {
  try {
    const guides = await listGuides();
    return guides;
  } catch (error) {
    console.error('Failed to fetch supplements guides', error);
    throw error;
  }
}
