# Multi-Region Latency Optimization (Gap 9)

## Overview

Edge functions are deployed across multiple geographic Supabase regions to ensure globally distributed sub-300ms API response times for Indian, North American, and European users.

## Target Regions

- `ap-south-1` — Mumbai, India (Primary user demographic)
- `us-east-1` — N. Virginia, United States
- `eu-west-1` — Dublin, Ireland

## Regional Deployment Commands

```bash
# Set project reference
PROJECT_REF="<your-supabase-project-ref>"

# 1. calculate-kundli
supabase functions deploy calculate-kundli --project-ref "$PROJECT_REF" --region ap-south-1
supabase functions deploy calculate-kundli --project-ref "$PROJECT_REF" --region us-east-1
supabase functions deploy calculate-kundli --project-ref "$PROJECT_REF" --region eu-west-1

# 2. calculate-matchmaking
supabase functions deploy calculate-matchmaking --project-ref "$PROJECT_REF" --region ap-south-1
supabase functions deploy calculate-matchmaking --project-ref "$PROJECT_REF" --region us-east-1
supabase functions deploy calculate-matchmaking --project-ref "$PROJECT_REF" --region eu-west-1

# 3. calculate-transits
supabase functions deploy calculate-transits --project-ref "$PROJECT_REF" --region ap-south-1
supabase functions deploy calculate-transits --project-ref "$PROJECT_REF" --region us-east-1
supabase functions deploy calculate-transits --project-ref "$PROJECT_REF" --region eu-west-1

# 4. get-panchang
supabase functions deploy get-panchang --project-ref "$PROJECT_REF" --region ap-south-1
supabase functions deploy get-panchang --project-ref "$PROJECT_REF" --region us-east-1
supabase functions deploy get-panchang --project-ref "$PROJECT_REF" --region eu-west-1
```

## GeoDNS / Edge Routing (Cloudflare Workers)

Indian traffic is automatically routed to `ap-south-1` edge endpoints using Cloudflare GeoDNS and latency-based routing headers (`CF-IPCountry`). North American queries default to `us-east-1`, minimizing transit calculations roundtrip.

## Verification

```bash
# Verify latency from regional probe:
curl -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" \
  -o /dev/null -s "https://api.vedic-rajkumar.app/functions/v1/health"
```
