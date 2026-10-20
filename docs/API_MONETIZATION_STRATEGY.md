# API Monetization Strategy — Vedic Rajkumar

> *Version: 1.0 | Status: Draft | Classification: Internal*

---

## Executive Summary

Freemium-to-enterprise model targeting developers, SMB astrologers/platforms, and enterprises.

**Revenue Targets (First 12 Months):**

| Quarter | MRR Target | Active API Keys | Primary Driver |
|---------|-----------|-----------------|----------------|
| Q1 | $2,500 | 150 | Pro tier conversions |
| Q2 | $8,000 | 400 | Wedding planner integrations |
| Q3 | $20,000 | 1,000 | Enterprise POCs closing |
| Q4 | $45,000 | 2,500 | Multi-year contracts |

---

## 1. Tier Specifications

### Free — "Sadhaka" ($0/month)

| Feature | Value |
|---------|-------|
| Daily Requests | 100 |
| Rate Limit | 10 req/min |
| Features | D1 charts, basic panchang, simple matchmaking |
| Support | Community (Discord/GitHub) |
| SLA | Best effort |

### Pro — "Jyotishi" ($29/month)

| Feature | Value |
|---------|-------|
| Daily Requests | 10,000 |
| Rate Limit | 100 req/min |
| Features | All Free + D9/D10/D60, Prashna, PDF export |
| Support | Email (48h) |
| SLA | 99.5% uptime |

**ROI:** Astrologer charging ₹500/chart → 600 charts to break even.

### Business — "Acharya" ($199/month)

| Feature | Value |
|---------|-------|
| Daily Requests | 100,000 |
| Rate Limit | 500 req/min |
| Features | All Pro + Swiss Ephemeris, white-label PDFs, webhooks, 5 seats |
| Support | Priority + Slack |
| SLA | 99.9% with credits |

### Enterprise — "Paramacharya" (Custom $2k–$10k+/month)

- Unlimited requests, dedicated infra
- SSO (SAML/OIDC), audit logs, custom ayanamsa
- Data residency: EU, India, or US
- SLA: 99.99% with financial penalties
- Minimum 12-month commitment

---

## 2. Usage-Based Components

### Overage Pricing

| Tier | Included | Overage Rate | Cap |
|------|----------|--------------|-----|
| Free | 100/day | N/A (hard limit) | — |
| Pro | 10,000/day | $0.001/request | $500/month |
| Business | 100,000/day | $0.0005/request | $2,000/month |

### Feature Add-Ons

| Add-On | Price | Description |
|--------|-------|-------------|
| Swiss Ephemeris Mode | +$49/month | Research-grade precision |
| Additional Seats | $19/seat/month | Beyond 5 included |
| Priority Queue | +$99/month | Skip rate limit queues |

### API Credit System

| Endpoint | Credits |
|----------|---------|
| `GET /v1/panchang` | 1 |
| `POST /v1/charts/calculate` | 1 |
| `POST /v1/charts/calculate?divisional=d9,d10` | 3 |
| `POST /v1/charts/calculate?ephemeris=swiss` | 5 |
| `POST /v1/matchmaking` | 2 |
| `POST /v1/prashna` | 2 |

---

## 3. Geographic Pricing (PPP)

| Region | Pro Price | Business Price |
|--------|-----------|----------------|
| North America | $29 | $199 |
| Western Europe | €29 | €199 |
| **India** | ₹999 ($12) | ₹6,999 ($84) |
| Southeast Asia | $19 | $129 |

---

## 4. Revenue Optimization

### Conversion Triggers
- Daily limit exceeded 3× in a week → Email to Pro
- Feature gate on Swiss Ephemeris badge → upgrade prompt
- "Add colleague" CTA → +$50/month per seat

### Dunning Management

| Day | Action |
|-----|--------|
| 0 | Invoice sent |
| 7 | Reminder + in-app banner |
| 14 | Grace period (service continues) |
| 21 | Restricted to Free tier |
| 30 | Account suspended |

**Win-back:** 20% discount for 3 months if payment resolves within 7 days.

---

## 5. Competitive Positioning

| Competitor | Their Price | Our Advantage |
|------------|-------------|---------------|
| AstroSage API | $0.05/call | 50× cheaper at scale, open source |
| Prokerala API | $0.03/call | 30× cheaper, better docs |
| In-house build | $50k+ dev cost | $29/month, instant deployment |

---

## 6. KPIs

| Metric | Target |
|--------|--------|
| MRR (Month 12) | $45k |
| Net Revenue Retention | >120% |
| API Gross Margin | >85% |
| Free to Pro Conversion | 5% |
| Monthly Churn | <5% |

---

## 7. Implementation Roadmap

- **Month 1–2:** Stripe integration, self-serve checkout, tier enforcement
- **Month 3–4:** Annual discounts, usage alerts, team support
- **Month 5–6:** Enterprise workflows, net-30 invoicing, account management
- **Month 7–12:** A/B pricing tests, geographic pricing, annual renewals

---

**Document Owner:** Revenue Team | Review Cycle: Quarterly
