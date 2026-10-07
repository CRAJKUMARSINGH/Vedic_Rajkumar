/**
 * migrate-legacy-data.ts — Gap 3: Data Migration (legacy chart data)
 * Migrates old PDF-generated chart metadata from archive/ into the unified Supabase schema.
 * Run: npx tsx scripts/migrate-legacy-data.ts
 *
 * Safety properties:
 * - Idempotent: skips records with matching legacy_id already in DB.
 * - Rollback: rollback-migration.ts deletes all rows where legacy_id IS NOT NULL.
 * - Checksums: SHA-256 of raw input stored for integrity verification.
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Types ─────────────────────────────────────────────────────────────────────

interface LegacyChartRecord {
  id: string;
  name: string;
  email?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone?: string;
  createdAt?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sha256(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Reads legacy chart records from archive/stale-assets/*.json
 * Falls back to an empty array if archive directory is empty.
 */
function fetchLegacyFromArchive(): LegacyChartRecord[] {
  const archiveDir = path.resolve(process.cwd(), 'archive', 'stale-assets');

  if (!fs.existsSync(archiveDir)) {
    console.warn('[migrate] archive/stale-assets/ not found — no legacy data to migrate.');
    return [];
  }

  const files = fs.readdirSync(archiveDir).filter((f) => f.endsWith('.json'));
  const records: LegacyChartRecord[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(archiveDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        records.push(...parsed);
      } else if (parsed?.id) {
        records.push(parsed);
      }
    } catch (err) {
      console.warn(`[migrate] Failed to parse ${file}:`, err);
    }
  }

  console.info(`[migrate] Found ${records.length} legacy records in archive/stale-assets/`);
  return records;
}

/**
 * Resolves Supabase user_id for a legacy email.
 * Returns null if user is not found (chart will be migrated without user linkage).
 */
async function resolveUser(email: string | undefined): Promise<string | null> {
  if (!email) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.warn(`[migrate] Could not resolve user for ${email}:`, error.message);
    return null;
  }

  return data?.id ?? null;
}

// ── Migration ─────────────────────────────────────────────────────────────────

async function migrateLegacyCharts(): Promise<void> {
  console.info('[migrate] Starting legacy chart migration...');

  const legacyCharts = fetchLegacyFromArchive();

  if (legacyCharts.length === 0) {
    console.info('[migrate] Nothing to migrate. Done.');
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const old of legacyCharts) {
    // Idempotency check — skip if already migrated
    const { data: existing } = await supabase
      .from('charts')
      .select('id')
      .eq('legacy_id', old.id)
      .maybeSingle();

    if (existing) {
      console.info(`[migrate] Skipping already-migrated legacy_id=${old.id}`);
      skipped++;
      continue;
    }

    const userId = await resolveUser(old.email);
    const checksum = sha256(old);

    const { error } = await supabase.from('charts').insert({
      user_id: userId,
      birth_data: {
        name: old.name,
        birthDate: old.birthDate,
        birthTime: old.birthTime,
        latitude: old.latitude,
        longitude: old.longitude,
        timezone: old.timezone ?? 'Asia/Kolkata',
        ayanamsa: 'Lahiri',
      },
      calculated_at: old.createdAt ?? new Date().toISOString(),
      legacy_id: old.id,
      checksum,
      migrated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[migrate] FAILED legacy_id=${old.id}:`, error.message);
      failed++;
    } else {
      console.info(`[migrate] ✓ Migrated legacy_id=${old.id} (checksum=${checksum.slice(0, 8)}...)`);
      migrated++;
    }
  }

  console.info(`\n[migrate] Complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

migrateLegacyCharts().catch((err) => {
  console.error('[migrate] Unhandled error:', err);
  process.exit(1);
});
