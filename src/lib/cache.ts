/**
 * cache.ts — Week 8 Performance Optimization
 *
 * IndexedDB caching strategy for heavy chart calculations and transits.
 * Using idb to cache responses from the API or local computations.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChartInput {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone?: number;
  ayanamsa?: string;
}

// We use any for ChartResult because types are broad in the system
interface VedicCacheDB extends DBSchema {
  charts: {
    key: string;
    value: {
      id: string;
      data: any;
      cachedAt: number;
    };
  };
  transits: {
    key: string;
    value: {
      date: string;
      data: any;
      cachedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<VedicCacheDB>> | null = null;

export const initCache = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<VedicCacheDB>('vedic-charts', 1, {
      upgrade(db) {
        db.createObjectStore('charts', { keyPath: 'id' });
        db.createObjectStore('transits', { keyPath: 'date' });
      },
    });
  }
  return dbPromise;
};

// Simple hashing function for caching keys
function hashInput(input: ChartInput): string {
  return `${input.birthDate}-${input.birthTime}-${input.latitude}-${input.longitude}-${input.timezone ?? 5.5}-${input.ayanamsa ?? 'Lahiri'}`;
}

export const cacheChart = async (input: ChartInput, result: any) => {
  const db = await initCache();
  if (!db) return;

  const key = hashInput(input);
  await db.put('charts', {
    id: key,
    data: result,
    cachedAt: Date.now(),
  });
};

export const getCachedChart = async (input: ChartInput): Promise<any | null> => {
  const db = await initCache();
  if (!db) return null;

  const key = hashInput(input);
  const entry = await db.get('charts', key);
  
  // Cache invalidation (e.g., 24 hours)
  if (entry && Date.now() - entry.cachedAt < 24 * 60 * 60 * 1000) {
    return entry.data;
  }
  return null;
};
