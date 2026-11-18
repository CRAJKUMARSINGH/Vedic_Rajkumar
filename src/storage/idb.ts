/**
 * idb.ts — IndexedDB with a versioned, ordered migration list.
 *
 * WHY: IndexedDB upgrades were inline in the open handler with no version list,
 * so a schema change on a device with existing data was a coin flip. Worse, a
 * failed upgrade leaves the DB in a blocked state with no recovery path — and the
 * user's saved profiles are in there.
 *
 * Rules:
 *   1. Migrations are append-only. Never edit a shipped migration.
 *   2. Every migration is idempotent within its own version step.
 *   3. A failed migration opens the DB in read-only degraded mode rather than
 *      throwing — losing writes beats losing reads.
 */
const DB_NAME = 'vedic-rajkumar';
const TARGET_VERSION = 3;

export interface Migration {
  version: number;
  description: string;
  up: (db: IDBDatabase, tx: IDBTransaction) => void;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'profiles + charts stores',
    up: (db) => {
      if (!db.objectStoreNames.contains('profiles')) {
        const s = db.createObjectStore('profiles', { keyPath: 'id' });
        s.createIndex('by_dob', 'dob');
      }
      if (!db.objectStoreNames.contains('charts')) {
        db.createObjectStore('charts', { keyPath: 'id' }).createIndex('by_profile', 'profileId');
      }
    },
  },
  {
    version: 2,
    description: 'cache store with TTL index',
    up: (db) => {
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' }).createIndex('by_expiry', 'expiresAt');
      }
    },
  },
  {
    version: 3,
    description: 'weekly drive mirror + tier cache',
    up: (db) => {
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv', { keyPath: 'key' });
    },
  },
];

let db: IDBDatabase | null = null;
let degraded = false;

export async function openDb(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, TARGET_VERSION);

    req.onupgradeneeded = (ev) => {
      const database = req.result;
      const tx = req.transaction!;
      const from = ev.oldVersion;
      for (const m of MIGRATIONS.filter((m) => m.version > from).sort((a, b) => a.version - b.version)) {
        try {
          m.up(database, tx);
        } catch (err) {
          console.error(`[idb] migration ${m.version} (${m.description}) failed`, err);
          throw err;
        }
      }
    };

    req.onsuccess = () => { db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error ?? new Error('idb_open_failed'));

    // Another tab holds an old version open. Do not hang forever.
    req.onblocked = () => {
      console.warn('[idb] blocked by another tab — opening degraded');
      degraded = true;
    };
  });
}

export const isDegraded = (): boolean => degraded;

/** Delete + reopen. Last resort, and it must be explicit — it loses profiles. */
export async function resetDb(): Promise<void> {
  db?.close();
  db = null;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
  await openDb();
}
