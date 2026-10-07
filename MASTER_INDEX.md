# 📑 MASTER INDEX — Vedic Rajkumar Enterprise Platform (Weeks 1–13)

> Auto-generated from `sequential INSTRUCTIONS vedic 07 oct.txt`. All 13 weeks implemented and committed.

---

## Branch Names

| # | Week | Branch | Commit |
|---|------|--------|--------|
| 1 | Repository Hygiene | `feature/week-01-repo-hygiene` | ✅ merged to main |
| 2 | API Layer | `feature/week-02-api-layer` | ✅ merged |
| 3 | Feature Flags | `feature/week-03-feature-flags` | ✅ merged |
| 4 | Auth & RBAC | `feature/week-04-auth-rbac` | ✅ merged |
| 5 | Data Compliance | `feature/week-05-data-compliance` | ✅ merged |
| 6 | Security Hardening | `feature/week-06-security-hardening` | ✅ merged |
| 7 | Performance | `feature/week-07-performance` | ✅ merged |
| 8 | Testing & QA | `feature/week-08-testing-qa` | ✅ merged |
| 9 | Observability | `feature/week-09-observability` | ✅ merged |
| 10 | Transit Engine | `feature/week-10-transit-engine` | ✅ merged |
| 11 | Public API | `feature/week-11-public-api` | ✅ merged |
| 12 | Production Readiness | `feature/week-12-production-readiness` | ✅ merged |
| 13 | Post-Launch | `feature/week-13-post-launch` | ✅ merged |

---

## PR Titles (Conventional Commits)

| # | PR Title |
|---|----------|
| 1 | `chore: week 1 repository hygiene and tooling` |
| 2 | `feat: week 2 API layer and client abstraction` |
| 3 | `feat: week 3 feature flags` |
| 4 | `feat: week 4 auth and role-based access control` |
| 5 | `feat: week 5 data compliance, export, deletion` |
| 6 | `feat: week 6 security hardening` |
| 7 | `perf: week 7 performance optimization` |
| 8 | `test: week 8 testing and QA` |
| 9 | `infra: week 9 observability, logging, tracing, and alerting` |
| 10 | `feat: week 10 transit engine` |
| 11 | `feat: week 11 public API & developer integration` |
| 12 | `chore: week 12 production readiness` |
| 13 | `chore: week 13 post-launch stabilization, growth & scale` |

---

## Key Deliverables by Week

| # | Focus | Primary Artifacts |
|---|-------|-------------------|
| 1 | Repo Hygiene | `.commitlintrc.json`, `.husky/commit-msg`, `commitlint.config.js`, `archive/`, CI skeleton |
| 2 | API Layer | `src/api/client.ts`, typed endpoints, error normalization, retries |
| 3 | Feature Flags | `src/features/flags/`, `useFeature` hook, kill switches |
| 4 | Auth & RBAC | Supabase RLS, session mgmt, roles, MFA, `src/auth/` |
| 5 | Data Compliance | Consent, export (JSON), deletion jobs, `supabase/functions/export-user-data/` |
| 6 | Security Hardening | RLS audit, CSP headers, Zod validation, rate limits, audit logs |
| 7 | Performance | Code-splitting, memoization, IDB caching, bundle optimisation |
| 8 | Testing & QA | Vitest, accuracy fixtures, Week 8 refinement loop |
| 9 | Observability | Structured logs, Sentry, PostHog, tracing, SLOs, alerts, health endpoint |
| 10 | Transit Engine | Gochar, Sade Sati, Ashtakavarga, Vedha, Panchang, transit alerts |
| 11 | Public API | API keys, scopes, rate limits, webhooks, OpenAPI, SDK |
| 12 | Production Readiness | Env validation, backups/DR, canary, load tests, on-call, go-live |
| 13 | Post-Launch | War room, RUM, caching/CDN, DB scaling, funnels, SEO, roadmap |

---

## Gap Remediation (Minor Gaps — execute pre/post launch)

| Gap | Priority | Status | Key Files |
|-----|----------|--------|-----------|
| 1. PWA / Offline | 🟡 High | 🔲 Pending | `vite.config.ts` (VitePWA plugin), `src/sw.ts` |
| 2. Transactional Email | 🔴 Critical | ✅ Done | `src/services/email.ts`, `supabase/functions/send-email/` |
| 3. Legacy Data Migration | 🟡 High | ✅ Done | `scripts/migrate-legacy-data.ts`, `scripts/rollback-migration.ts` |
| 4. Chart Accessibility (a11y) | 🟢 Medium | ✅ Done | `src/components/charts/AccessibleChart.tsx` |
| 5. Kill Switches | 🔴 Critical | ✅ Done | `src/config/kill-switches.ts`, `supabase/migrations/*_kill_switches.sql` |
| 6. Dependency Gate CI | 🟡 High | ✅ Done | `.github/workflows/dependency-gate.yml` |
| 7. In-App Onboarding | 🟢 Medium | ✅ Done | `src/components/Onboarding/GuidedTour.tsx` |
| 8. Performance Budgets | 🟢 Medium | 🔲 Pending | `budgets.json`, Lighthouse CI config |
| 9. Multi-Region Latency | 🔵 Low | 🔲 Pending | Deploy to `ap-south-1`, `us-east-1`, `eu-west-1` |
| 10. Analytics Privacy | 🟡 High | ✅ Done | `src/observability/privacy-scrubber.ts` |

---

## Consolidated File Tree

```
src/
  api/           (W2,W11)  client, v1 routes, keys, rateLimit, webhooks, metering, scopes
  analytics/     (W13)     funnels, regressions
  astrology/     (W10)     core, transits, ashtakavarga, panchang, muhurta
  auth/          (W4)      roles, MFA, session
  components/    (W7,W10)  transits, charts, Onboarding
  config/        (W12)     env validation, kill-switches
  features/      (W3)      flags, ab, practitioner
  hooks/         (W3,W10)  useFlag, useTransits, useChartCache
  observability/ (W9)      logging, errors, analytics, metrics, tracing, slo, privacy-scrubber
  pages/         (W10,W11) TransitAnalysis, DashaTransit*, EventTransit*, ApiKeys
  services/      (W2,W10)  transits, email, chart services
  test/          (W8,W10,W11) unit, e2e, transits, api
  types/         (W2,W4)   auth, api types
  workers/       (W8)      calculation web workers

supabase/
  functions/     (W2,W5,W9,W10,W11) health, ingest-logs, metrics, transit-*, api-keys,
                                     webhook-dispatch, send-email, export-user-data, knowledge
  migrations/    (W4,W5,W6,W9,W10,W11,W12,W13)

scripts/
  migrate-legacy-data.ts
  rollback-migration.ts

packages/
  sdk-ts/        (W11) TypeScript SDK

ops/
  backups/       (W12)
  deploy/        (W12)
  load/          (W12)
  warroom/       (W13)
  scaling/       (W13)

docs/
  api/           (W11)
  observability/ (W9)
  runbooks/      (W9,W12)
  launch/        (W12)
  growth/        (W13)
  support/       (W13)
  roadmap/       (W13)

.github/
  workflows/     ci.yml, security.yml, deploy.yml, backup.yml, dependency-gate.yml

observability/
  alerts/        alerts.yml, uptime.yml
  dashboards/    service-overview.json
```

---

## Release Tags

| Tag | After Week | Milestone |
|-----|-----------|-----------|
| `v0.1.0-alpha` | 4 | Auth & RBAC complete |
| `v0.5.0-beta` | 8 | Testing & Performance |
| `v0.9.0-rc` | 11 | Public API ready |
| `v1.0.0` | 12 | Production Launch |
| `v1.1.0` | 13 | Post-launch stable |

---

## Three Pre-Week-10 Deploy Actions (Post-Week-9)

```bash
# 1. Deploy observability edge functions
supabase functions deploy health ingest-logs metrics

# 2. Set uptime monitor (UptimeRobot / BetterStack)
#    URL: https://YOUR_PROJECT.supabase.co/functions/v1/health
#    Interval: 1-5 min | Expected: { "status": "healthy" }

# 3. Set Netlify env vars
#    VITE_SENTRY_DSN = https://xxx@oXXX.ingest.sentry.io/XXX
#    VITE_POSTHOG_KEY = phc_XXXXXXXXXXXXXX
```

---

## 30 / 60 / 90 Day Post-Launch Roadmap

### Days 1–30: Stabilize
- Hit SLOs for 30 straight days
- Fix all SEV1/SEV2 follow-ups
- Ship top 3 perf fixes (PWA offline, performance budgets, multi-region)
- Baseline activation funnel; target +10%

### Days 31–60: Grow
- Programmatic SEO pages live
- Referral / share loop launched
- API developer signups; publish 2 integrations
- A/B test pricing / onboarding

### Days 61–90: Scale
- Read replica + partitioning in prod
- Multi-region edge rollout (ap-south-1, us-east-1, eu-west-1)
- Enterprise tier + SSO
- SOC 2 readiness kickoff

---

*Last updated: 2026-10-07 | Vedic Rajkumar — Enterprise Vedic Astrology Platform*
