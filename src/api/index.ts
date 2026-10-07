/**
 * Unified API Client & Endpoints Export
 */

export * from './types';
export * from './client';
export * from './hooks';
export * from './endpoints/charts';
export * from './endpoints/transits';
export * from './endpoints/matchmaking';
export * from './endpoints/panchang';

import { apiClient } from './client';
import { calculateChart } from './endpoints/charts';
import { calculateDoubleTransits } from './endpoints/transits';
import { calculateMatchmaking } from './endpoints/matchmaking';
import { getPanchang } from './endpoints/panchang';

export const api = {
  client: apiClient,
  charts: {
    calculate: calculateChart,
  },
  transits: {
    doubleTransit: calculateDoubleTransits,
  },
  matchmaking: {
    calculate: calculateMatchmaking,
  },
  panchang: {
    get: getPanchang,
  },
};

export default api;
