# deploy-functions.ps1 — Automated Supabase Edge Functions Deployment for Windows
param (
    [string]$ProjectRef = $env:SUPABASE_PROJECT_REF,
    [string]$Region = ""
)

if (-not $ProjectRef) {
    Write-Error "Project reference required. Run: .\scripts\deploy-functions.ps1 -ProjectRef <your-ref> [-Region <region>]"
    exit 1
}

$functions = @(
    "health",
    "ingest-logs",
    "metrics",
    "send-email",
    "transit-calendar",
    "transit-alerts",
    "api-keys",
    "webhook-dispatch",
    "calculate-kundli",
    "calculate-matchmaking",
    "calculate-transits",
    "get-panchang",
    "export-user-data",
    "user-data-delete",
    "user-data-export",
    "knowledge",
    "prashna"
)

Write-Host "🚀 Deploying $($functions.Count) Edge Functions to project: $ProjectRef $(if ($Region) { "in region $Region" })..." -ForegroundColor Cyan

foreach ($fn in $functions) {
    Write-Host "  📦 Deploying function: $fn..." -ForegroundColor Yellow
    if ($Region) {
        npx supabase functions deploy $fn --project-ref $ProjectRef --region $Region --no-verify-jwt
    } else {
        npx supabase functions deploy $fn --project-ref $ProjectRef
    }
}

Write-Host "✅ All Edge Functions deployed successfully!" -ForegroundColor Green
