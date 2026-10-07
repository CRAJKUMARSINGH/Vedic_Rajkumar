# Vedic Rajkumar API — Quickstart

## Auth
Pass your key as a Bearer token:
```bash
curl https://api.vedic-rajkumar.app/v1/charts/CHART_ID \
  -H "Authorization: Bearer vk_live_xxxxxxxx"
```

## Create a chart
```bash
curl -X POST https://api.vedic-rajkumar.app/v1/charts \
  -H "Authorization: Bearer vk_live_xxx" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"date":"1990-01-01","time":"12:00","latitude":28.6,"longitude":77.2,"timezone":"Asia/Kolkata"}'
```

## Rate limits
Per-tier requests/min returned in `X-RateLimit-*` headers. 429 responses include a reset time.

## Webhooks
Verify `X-Vedic-Signature` (`t=<ts>,v1=<hmac>`) using HMAC-SHA256 over `"${ts}.${body}"` with your endpoint secret.

## Errors
All errors return `{ "error": { "code", "message", "requestId" } }`. Include `requestId` in support tickets.
