/**
 * cache.ts — Week 8 Performance Optimization
 *
 * IndexedDB caching layer for heavy Vedic calculations.
 * Uses the `idb` library for a Promise-based IndexedDB API.
 *
 * Three stores:
 *   charts    — birth chart results keyed by input hash (TTL 24 h)
 *   transits  — double-transit results keyed by date + moon rashi (TTL 6 h)
 *   panchang  — daily panchang keyed by date + location (TTL 6 h)
 *
 * Usage:
 *   import { cacheChart, getCachedChart, cachePanchang, purgeStaleCacheEntries } from '@/lib/cache';
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ─── TTLs ─────────────────────────────────────────────────────────────────────

const TTL_CHART    = 24 * 60 * 60 * 1000; // 24 hours — birth charts never change
const TTL_TRANSIT  =  6 * 60 * 60 * 1000; //  6 hours — transits shift daily
const TTL_PANCHANG =  6 * 60 * 60 * 1000; //  6 hours — panchang valid for the day

// ─── DB Schema ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CachePayload = any;

interface VedicCacheDB extends DBSchema {
  charts: {
    key: string;
    value: { id: string; data: CachePayload; cachedAt: number };
  };
  transits: {
    key: string;
    value: { id: string; data: CachePayload; cachedAt: number };
  };
  panchang: {
    key: string;
    value: { id: string; data: CachePayload; cachedAt: number };
  };
}

// ─── DB singleton ─────────────────────────────────────────────────────────────

let _dbPromise: Promise<IDBPDatabase<VedicCacheDB>> | null = null;

function getDB(): Promise<IDBPDatabase<VedicCacheDB>> | null {
  if (typeof window === 'undefined') return null;
  if (!_dbPromise) {
    _dbPromise = openDB<VedicCacheDB>('vedic-charts', 2, {
      upgrade(db, oldVersion) {
        // Create all stores (idempotent — createObjectStore throws if already exists)
        if (!db.objectStoreNames.contains('charts')) {
          db.createObjectStore('charts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transits')) {
          db.createObjectStore('transits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('panchang')) {
          db.createObjectStore('panchang', { keyPath: 'id' });
        }
        void oldVersion; // silence unused-var lint
      },
    });
  }
  return _dbPromise;
}

// ─── Key builders ─────────────────────────────────────────────────────────────

export interface ChartCacheKey {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone?: number;
  ayanamsa?: string;
}

export interface TransitCacheKey {
  date: string;           // YYYY-MM-DD
  moonRashiIndex: number; // 0–11
}

export interface PanchangCacheKey {
  date: string;           // YYYY-MM-DD
  latitude: number;
  longitude: number;
}

function hashChartKey(k: ChartCacheKey): string {
  return [
    k.birthDate,
    k.birthTime,
    k.latitude.toFixed(4),
    k.longitude.toFixed(4),
    k.timezone ?? '5.5',
    k.ayanamsa ?? 'Lahiri',
  ].join('|');
}

function hashTransitKey(k: TransitCacheKey): string {
  return `transit|${k.date}|${k.moonRashiIndex}`;
}

function hashPanchangKey(k: PanchangCacheKey): string {
  return `panchang|${k.date}|${k.latitude.toFixed(2)}|${k.longitude.toFixed(2)}`;
}

// ─── Generic read/write ───────────────────────────────────────────────────────

async function put(
  store: 'charts' | 'transits' | 'panchang',
  id: string,
  data: CachePayload
): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put(store, { id, data, cachedAt: Date.now() });
}

async function get(
  store: 'charts' | 'transits' | 'panchang',
  id: string,
  ttl: number
): Promise<CachePayload | null> {
  const db = await getDB();
  if (!db) return null;
  const entry = await db.get(store, id);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > ttl) {
    // Stale — delete lazily
    void db.delete(store, id);
    return null;
  }
  return entry.data;
}

// ─── Charts ───────────────────────────────────────────────────────────────────

export async function cacheChart(key: ChartCacheKey, data: CachePayload): Promise<void> {
  await put('charts', hashChartKey(key), data);
}

export async function getCachedChart(key: ChartCacheKey): Promise<CachePayload | null> {
  return get('charts', hashChartKey(key), TTL_CHART);
}

// ─── Transits ─────────────────────────────────────────────────────────────────

export async function cacheTransit(key: TransitCacheKey, data: CachePayload): Promise<void> {
  await put('transits', hashTransitKey(key), data);
}

export async function getCachedTransit(key: TransitCacheKey): Promise<CachePayload | null> {
  return get('transits', hashTransitKey(key), TTL_TRANSIT);
}

// ─── Panchang ─────────────────────────────────────────────────────────────────

export async function cachePanchang(key: PanchangCacheKey, data: CachePayload): Promise<void> {
  await put('panchang', hashPanchangKey(key), data);
}

export async function getCachedPanchang(key: PanchangCacheKey): Promise<CachePayload | null> {
  return get('panchang', hashPanchangKey(key), TTL_PANCHANG);
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

/**
 * Delete all stale entries across every store.
 * Call on app startup or periodically (e.g. once per day).
 */
export async function purgeStaleCacheEntries(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  const stores = [
    { name: 'charts'   as const, ttl: TTL_CHART },
    { name: 'transits' as const, ttl: TTL_TRANSIT },
    { name: 'panchang' as const, ttl: TTL_PANCHANG },
  ];

  const now = Date.now();

  for (const { name, ttl } of stores) {
    const tx = db.transaction(name, 'readwrite');
    const keys = await tx.store.getAllKeys();
    for (const key of keys) {
      const entry = await tx.store.get(key);
      if (entry && now - entry.cachedAt > ttl) {
        await tx.store.delete(key);
      }
    }
    await tx.done;
  }
}

/**
 * Clear all cached data (useful for debugging or sign-out).
 */
export async function clearAllCache(): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await Promise.all([
    db.clear('charts'),
    db.clear('transits'),
    db.clear('panchang'),
  ]);
}
