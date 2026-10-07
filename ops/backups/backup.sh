#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="ops/backups/out/$STAMP"
mkdir -p "$OUT"

echo "==> Dumping schema"
supabase db dump --schema public -f "$OUT/schema.sql"

echo "==> Dumping data"
supabase db dump --data-only -f "$OUT/data.sql"

echo "==> Dumping auth"
supabase db dump --schema auth -f "$OUT/auth.sql"

echo "==> Compressing"
tar -czf "$OUT.tar.gz" -C "$OUT" .
rm -rf "$OUT"

echo "==> Uploading to object storage"
# aws s3 cp "$OUT.tar.gz" "s3://vedic-backups/db/$STAMP.tar.gz" --storage-class STANDARD_IA
# OR: supabase storage cp
echo "Backup complete: $OUT.tar.gz"
