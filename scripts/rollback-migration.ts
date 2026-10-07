/**
 * rollback-migration.ts — Rolls back all records inserted by migrate-legacy-data.ts
 * Only deletes rows where legacy_id IS NOT NULL (i.e., migrated rows).
 * Run: npx tsx scripts/rollback-migration.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function rollbackMigration(): Promise<void> {
  console.info('[rollback] Deleting all migrated records (legacy_id IS NOT NULL)...');

  const { count, error } = await supabase
    .from('charts')
    .delete({ count: 'exact' })
    .not('legacy_id', 'is', null);

  if (error) {
    console.error('[rollback] Failed:', error.message);
    process.exit(1);
  }

  console.info(`[rollback] Deleted ${count ?? 0} migrated records. Done.`);
}

rollbackMigration().catch((err) => {
  console.error('[rollback] Unhandled error:', err);
  process.exit(1);
});
