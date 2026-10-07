# GO-LIVE CHECKLIST

## Infra
- [ ] Production Supabase project with PITR enabled
- [ ] Backups running nightly + one restore drill passed
- [ ] Custom domain + TLS live
- [ ] Security headers verified
- [ ] WAF / DDoS protection on (Cloudflare)
- [ ] Status page live

## Observability
- [ ] Sentry capturing prod errors
- [ ] Alerts firing to Slack + PagerDuty
- [ ] Dashboards green
- [ ] On-call rotation staffed

## Product
- [ ] Accuracy validated vs Swiss Ephemeris
- [ ] E2E tests green on prod build
- [ ] Load test passed (p95 < 800ms @ 100 VU)
- [ ] Legal: ToS, Privacy Policy, DPA published
- [ ] Consent + export + deletion verified

## API
- [ ] Public docs live
- [ ] SDK published
- [ ] Test keys issued
- [ ] Webhooks verified end-to-end

## Business
- [ ] Pricing / billing live (if applicable)
- [ ] Support inbox + SLA
- [ ] Cost alerts configured
- [ ] Analytics baseline captured

## Go / No-Go
- [ ] All above checked
- [ ] Rollback rehearsed
- [ ] On-call present for 24h post-launch
- [ ] Announcement drafted
