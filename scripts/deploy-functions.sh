#!/usr/bin/env bash
# deploy-functions.sh — Automated Supabase Edge Functions Deployment
# Usage: ./scripts/deploy-functions.sh [<project-ref>] [<region>]
set -euo pipefail

PROJECT_REF="${1:-${SUPABASE_PROJECT_REF:-}}"
REGION="${2:-}"

if [[ -z "$PROJECT_REF" ]]; then
  echo "❌ Error: Project reference required."
  echo "Usage: $0 <project-ref> [<region>]"
  echo "Or set SUPABASE_PROJECT_REF environment variable."
  exit 1
fi

FUNCTIONS=(
  "health"
  "ingest-logs"
  "metrics"
  "send-email"
  "transit-calendar"
  "transit-alerts"
  "api-keys"
  "webhook-dispatch"
  "calculate-kundli"
  "calculate-matchmaking"
  "calculate-transits"
  "get-panchang"
  "export-user-data"
  "user-data-delete"
  "user-data-export"
  "knowledge"
  "prashna"
)

echo "🚀 Deploying ${#FUNCTIONS[@]} Edge Functions to project: $PROJECT_REF ${REGION:+in region $REGION}..."

for fn in "${FUNCTIONS[@]}"; do
  echo "  📦 Deploying function: $fn..."
  if [[ -n "$REGION" ]]; then
    npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --region "$REGION" --no-verify-jwt
  else
    npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF"
  fi
done

echo "✅ All Edge Functions deployed successfully!"
