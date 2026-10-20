# SOC 2 Type II Preparation Checklist — Vedic Rajkumar

> *Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy*
> *Version: 1.0 | Target Audit: Q3 2027*

---

## Audit Timeline

| Phase | Duration | Target |
|-------|----------|--------|
| Gap Assessment | 4 weeks | Month 1 |
| Remediation | 12 weeks | Months 2–4 |
| Observation Period | 26 weeks | Months 5–10 |
| Audit Fieldwork | 4 weeks | Month 11 |
| Report Issuance | 4 weeks | Month 12 |

---

## 1. Security (CC6.1) — Critical

| Control | Evidence | Status |
|---------|----------|--------|
| User authentication (Clerk) | Auth logs, MFA enrollment | ✅ |
| Unique user IDs | Supabase user table | ✅ |
| Session timeout (30 min) | `useSessionTimeout.ts` | ✅ |
| Failed login lockout | Rate limiting (5 attempts) | ✅ |
| Privileged access monitoring | Admin audit logs | 🟡 In Progress |
| MFA for admin accounts | Clerk MFA config | 🟡 In Progress |
| Access removal on offboarding | API key revocation checklist | 🟡 In Progress |

### Network Security

| Control | Implementation | Status |
|---------|---------------|--------|
| Firewall | Cloudflare WAF + Netlify edge | ✅ |
| TLS 1.3 enforced | HSTS in `netlify.toml` | ✅ |
| Intrusion detection | Sentry anomaly alerts | ✅ |
| CORS locked to known origins | Supabase config | ✅ |

### Required Documentation

- [ ] Network topology diagram (updated)
- [ ] Data flow diagram (birth data → API → DB)
- [ ] Penetration test report (annual) — `docs/launch/security-review.md`
- [ ] Vulnerability scan results (quarterly)

---

## 2. Availability (A1.2) — High

| Control | Implementation | Status |
|---------|---------------|--------|
| System monitoring | Sentry + PostHog dashboards | ✅ |
| Incident response | `docs/runbooks/oncall.md` | ✅ |
| Backup procedures | `ops/backups/backup.sh` (daily, 30-day) | ✅ |
| DR plan | `ops/deploy/rollback.md` | ✅ |
| Capacity planning | k6 load tests `ops/load/smoke.js` | ✅ |

**SLA Commitments:**

```yaml
Free:       99.0%  (no SLA credits)
Pro:        99.5%  (10% credit if breached)
Business:   99.9%  (25% credit if breached)
Enterprise: 99.99% (50% credit if breached)
```

**Required Testing:**
- [ ] Tabletop: Database corruption (Q4 2026)
- [ ] Failover: Primary → Replica switch (Q1 2027)
- [ ] Full DR drill: Simulated region outage (Q2 2027) — `docs/runbooks/restore-drill.md`

---

## 3. Processing Integrity (PI1.3) — High

| Control | Implementation | Status |
|---------|---------------|--------|
| Input validation | Zod schemas `src/lib/validation.ts` | ✅ |
| Error handling | try/catch + Sentry everywhere | ✅ |
| Accuracy test suite | 155/155 charts vs Swiss Ephemeris | ✅ |
| SHA-256 checksums | Export data + API responses | ✅ |
| Accuracy alerts | Sentry warning if score < 95% | ✅ |

**Validation Evidence:** `src/tests/validation/accuracySuite.test.ts` — run via `npm run validate:accuracy`.

---

## 4. Confidentiality (CC6.6) — Critical

### Data Classification

| Data Type | Classification | Encryption |
|-----------|---------------|------------|
| Birth dates/times | **Confidential** | AES-256 at rest |
| API keys | **Restricted** | SHA-256 hashed |
| User emails | **Internal** | TLS in transit |
| Calculated charts | **Internal** | AES-256 at rest |
| Audit logs | **Restricted** | Immutable, signed |

### Encryption Standards

| Layer | Standard | Implementation | Status |
|-------|----------|---------------|--------|
| Transit | TLS 1.3 | Cloudflare + Netlify | ✅ SSL Labs A+ |
| At Rest (DB) | AES-256 | Supabase (AWS KMS) | ✅ |
| Backups | AES-256 | Encrypted snapshots | ✅ |
| Secrets | Vault | Doppler/Supabase env | 🟡 |

---

## 5. Privacy (P1.1) — GDPR/DPDP

### Data Subject Rights

| Right | Implementation | Status |
|-------|---------------|--------|
| Access | `user-data-export` edge fn | ✅ |
| Erasure | `user-data-delete` edge fn (30-day grace) | ✅ |
| Portability | JSON export | ✅ |
| Consent withdrawal | Account settings | ✅ |
| Consent audit trail | `user_privacy_consents` table | ✅ |

### Vendor DPAs

| Vendor | DPA Signed | SOC 2 |
|--------|-----------|-------|
| Supabase | ✅ | ✅ Type II |
| Clerk | ✅ | ✅ Type II |
| Stripe | ✅ | ✅ Type II |
| Cloudflare | ✅ | ✅ Type II |
| Sentry | ✅ | ✅ Type II |
| PostHog | ✅ (EU) | ✅ |

---

## 6. Required Policies

| Policy | Status | Location |
|--------|--------|----------|
| Information Security | ✅ | `SECURITY.md` |
| Incident Response | ✅ | `docs/runbooks/oncall.md` |
| Backup & Recovery | ✅ | `ops/backups/` |
| Data Classification | 🟡 | `docs/policies/DATA_CLASSIFICATION.md` |
| Acceptable Use | 🟡 | `docs/policies/ACCEPTABLE_USE.md` |
| Change Management | ✅ | `CONTRIBUTING.md` |

---

## 7. Pre-Audit Checklist (4 weeks before)

- [ ] All policies reviewed and approved (within 12 months)
- [ ] Risk assessment updated (within 6 months)
- [ ] Access review completed (all users, all systems)
- [ ] Penetration test report available (within 12 months)
- [ ] No critical/high vulnerabilities in last 30 days
- [ ] Evidence organized in shared drive
- [ ] Key personnel availability confirmed

---

## 8. Auditor Estimates

| Firm | Estimate | Timeline | Notes |
|------|----------|----------|-------|
| Schellman | $20k–$30k | 8–12 weeks | Tech-focused, recommended for first-time |
| BDO | $25k–$35k | 8–10 weeks | Good credibility |
| KPMG | $40k–$60k | 6–8 weeks | Big 4 |

---

## 9. Compliance Calendar

| Month | Activity |
|-------|----------|
| Jan | Annual policy review, risk assessment |
| Apr | Q2 access review, pen test |
| Jul | Q3 access review, DR drill |
| Oct | Q4 access review, pre-audit prep |
| Nov | SOC 2 audit window |

---

## 10. Evidence Retention

| Type | Retention | Location |
|------|-----------|----------|
| Audit logs | 1 year | Supabase + S3 |
| System logs | 90 days | Logtail |
| Access reviews | 3 years | GDrive (Compliance) |
| Incident reports | 5 years | GDrive (Compliance) |
| Training records | Duration + 3 years | HR system |

---

**Document Owner:** Security Lead | Next Review: Quarterly
*"Trust is built on transparency. SOC 2 validates what we already practice."*
