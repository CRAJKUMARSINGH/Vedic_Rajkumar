import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIGRATIONS } from '@/storage/idb';

describe('idb migrations', () => {
  it('is strictly ascending and starts at 1', () => {
    const versions = MIGRATIONS.map((m) => m.version);
    expect(versions[0]).toBe(1);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(new Set(versions).size).toBe(versions.length);
  });

  it('has no gaps (a gap means an upgrade path nobody can reach)', () => {
    MIGRATIONS.forEach((m, i) => expect(m.version).toBe(i + 1));
  });

  it('describes every migration', () => {
    for (const m of MIGRATIONS) expect(m.description.length).toBeGreaterThan(5);
  });

  it('every migration is guarded by a contains() check (idempotent)', () => {
    // Source-level check: a createObjectStore without a guard throws on re-run.
    for (const m of MIGRATIONS) {
      const src = m.up.toString();
      if (src.includes('createObjectStore')) {
        expect(src, `migration ${m.version} must guard createObjectStore`).toContain('objectStoreNames.contains');
      }
    }
  });

  it('target version equals the highest migration', () => {
    const src = readFileSync(join(process.cwd(), 'src', 'storage', 'idb.ts'), 'utf-8');
    const target = Number(src.match(/TARGET_VERSION\s*=\s*(\d+)/)?.[1]);
    expect(target).toBe(MIGRATIONS.at(-1)!.version);
  });
});
