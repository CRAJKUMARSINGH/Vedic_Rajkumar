#!/usr/bin/env bash
set -euo pipefail

ARCHIVE=${1:?usage: restore.sh <archive.tar.gz>}
TMP=$(mktemp -d)
tar -xzf "$ARCHIVE" -C "$TMP"

echo "==> Restoring schema"
psql "$DATABASE_URL" -f "$TMP/schema.sql"
echo "==> Restoring data"
psql "$DATABASE_URL" -f "$TMP/data.sql"
echo "Restore complete."
rm -rf "$TMP"
