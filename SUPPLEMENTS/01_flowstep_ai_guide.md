# Flowstep.ai Submission Guide — Vedic Rajkumar
> **What this is:** Paste Section 10's AI Brief into Flowstep.ai → "New Project → AI Brief" to auto-generate your epic backlog, user flows, and sprint plan for the enterprise upgrade.
> **Repo:** https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar
> **Live app:** https://vedic-rajkumar.vercel.app

---

## 1. What the App Actually Is (from reading the real code)

**Vedic Rajkumar** is a running, feature-rich Vedic astrology SaaS platform built by Rajkumar Singh Chauhan. It is currently a **React 19.2 + Vite 5 SPA** deployed on Vercel, backed by **Supabase (PostgreSQL)** and authenticated via **Clerk**. The app has **40+ pages**, a **13-layer astrological interpretation engine (v2.1)**, and a family jataks database of 16 real birth charts going back to a 2014 Excel spreadsheet.

The app's strategic goal (from `COMBINED_MASTER_PROMPT.md`) is to evolve from **"astrology software"** into a **"Cognitive Jyotish Synthesis System"** — every reading resolves into a firm verdict, never hedges, always ends with a "Therefore:" clause.

**Current status:** Running MVP at Week 26 of a 100-week modernisation roadmap. Needs enterprise-grade hardening to launch commercially.

---

## 2. Real Tech Stack (from `package.json`, `api/index.mjs`, `.env.example`)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19.2 + Vite 5 + TypeScript | SPA, all routes lazy-loaded |
| UI System | Radix UI + shadcn/ui, Framer Motion 12 | Glassmorphism, neon glows, bento grid |
| State | TanStack Query v5 | Replaces manual `useState/useEffect` fetches |
| Auth | Clerk (React SDK `@clerk/react ^6.6.3`) | `ClerkProvider` wraps app |
| Database | Supabase PostgreSQL | Via `@supabase/supabase-js ^2.97.0` |
| API | Express serverless at `api/index.mjs` | Deployed as Vercel function |
| Ephemeris | `astronomia ^4.2.0` now; `swisseph-wasm ^0.0.5` queued | Swiss Ephemeris migration Week 28–30 |
| PDF Export | jsPDF + jspdf-autotable | Professional report generation |
| i18n | Custom bilingual (English + Hindi) | Full toggle implemented |
| Testing | Vitest + Playwright e2e | Husky pre-commit hooks |
| Deployment | Vercel (frontend) + Vercel Functions (API) | `netlify/functions/api.mjs` also present |

---

## 3. Real Pages & Routes (from `src/App.tsx`)

| Route | Page | Status |
|-------|------|--------|
| `/` | Landing Page | Live |
| `/sign-in`, `/sign-up` | Auth (Clerk) | Live |
| `/horoscope` | Horoscope & Birth Chart | Live |
| `/comprehensive-report` | Full 13-layer report | Live |
| `/dasha` | Vimshottari Dasha dashboard | Live |
| `/divisional-charts` | D9/D10/D12+ charts | Live |
| `/yogas` | 500+ yoga identification | Live |
| `/career-astrology` | Career forecast | Live |
| `/kaal-sarp` | Kaal Sarp dosha analysis | Live |
| `/matchmaking` | Compatibility (Ashtakuta) | Live |
| `/vaastu` | Vaastu assessment | Live |
| `/muhurat-calendar` | Auspicious timing finder | Live |
| `/baby-names` | Nakshatra-based naming | Live |
| `/lucky-elements` | Gems, colours, numbers | Live |
| `/festival-calendar` | Festival & tithi calendar | Live |
| `/mtss` | Marriage Timing & Spouse (MTSS panel) | Live — needs generic input form |
| `/remedies` | Planetary remedies | Live |
| `/planetary-strength` | Shadbala & Ashtakavarga | Live |
| `/jaimini` | Jaimini Chara Dasha | Live |
| `/tajik` | Varshaphal / Tajik | Live |
| `/lal-kitab` | Lal Kitab system | Live |
| `/kp-system` | Krishnamurti Paddhati | Live |
| `/love-astrology` | Love & relationship | Live |
| `/nadi-astrology` | Nadi system | Live |
| `/business-astrology` | Business muhurat & analysis | Live |
| `/analytics` | Admin analytics dashboard | Live |
| `/feature-requests`, `/feedback` | User feedback portals | Live |
| `/quick-wins` | Internal sprint dashboard | Live |

---

## 4. The 13-Layer Interpretation Engine (from `KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md`)

This is the core intellectual property of the app. Every reading must pass through all 14 layers (Layer 0 + Layers 1–13) in strict order:

| Layer | Name | What it does |
|-------|------|-------------|
| 0 | Virgin World Fame Filter | Scores chart 0–100 for fame potential before any output |
| 1 | Five-Layer Convergence | Checks D1 natal promise — if absent, no yoga/transit can manufacture it |
| 2 | Shadbala Scoring | Scores all yoga-forming planets by Shadbala tier |
| 3 | Yoga Status Tagging | Tags each yoga: ACTIVE / EMERGING / LATENT / BROKEN |
| 4 | Divisional Conflict Resolution | D1 vs D9/D10 conflicts resolved to one verdict |
| 5 | Aspect Weights | Applies Parashari + Jaimini aspect weights |
| 6 | Dasha Tagging | All predictions tagged [Level 1–5: Dasha details] |
| 7 | Double Transit Check | Jupiter + Saturn transit confirmation required |
| 8 | Arudha Lagna Analysis | AL, UL, A10, A4 read and gap identified |
| 9 | Conflict Resolution | Every conflict ends with explicit "Therefore:" clause |
| 10 | Failure Mode Analysis | Probabilities + single weakest planet identified |
| 11 | Psychological Profile | Full psychological profile object generated |
| 12 | Six-Layer Remedy Stack | Diagnostically specific remedies (not generic) |
| 13 | Fame Verdict | Virgin World Fame verdict emitted if fame-related query |

**Architectural principle (hardcoded into engine):** *"If the natal chart does not promise an event, no yoga, transit, or Dasha can manufacture it. The radix is the seed."*

---

## 5. Real Data — Jataks Database (from `jataks/JATAKS_DATABASE.json`)

The app currently has 16 real birth charts in `JATAKS_DATABASE.json` and individual `.kun`/`.xml` files. Key family members:

| Name | DOB | Relationship |
|------|-----|-------------|
| Mummy (Premlata) | 1947-09-05, 05:00, Nandli, Rajasthan | Mother (the "mamosa") |
| Rajkumar Singh Chauhan | owner's chart | Owner/developer |
| Vishwaraj Singh Chauhan | 1994-09-26, Indore | Son |
| Priyansh Singh Chauhan | 2000-10-26, Indore | Son |
| Ajit Singh Chauhan | in DB | Relative |
| + 11 others | — | Friends/relatives |

These are real charts used for validation. The enterprise upgrade must support **any subscriber's birth data**, not just family charts.

---

## 6. What Is Already Done (from `KNOWLEDGE_BASE/implementation_queue.md`)

| # | Feature | Status |
|---|---------|--------|
| Date selector → ephemeris wiring | Fixed in `Index.tsx` | ✅ Done |
| `.env` not tracked in git | Verified | ✅ Done |
| PLANET_REMEDIES data | Present in `transitData.ts` | ✅ Done |
| LIFE_AREA_EFFECTS data | Present in `enhancedTransitEffects.ts` | ✅ Done |
| Per-planet remedies accordion | Implemented in `TransitTable.tsx` | ✅ Done |
| Swiss Ephemeris wrapper | `swissEphemerisService.ts` created, flag off | ✅ Wrapper done |
| NorthIndianChart.tsx porting | Identified, queued | 🟠 Queued |
| Saved readings API port | From Vedic_Rajkumar-V01 | 🟡 Queued |
| GitHub Actions CI/CD | New | 🟡 Queued |
| Prasnatantra PDF processing | `ATTACHED_ASSETS/` | 🟠 Queued |
| Swiss Ephemeris full rollout | Week 28–30 (ADR-002) | 🟠 In Progress |

---

## 7. Enterprise Gaps — What Needs to Be Built

Based on the real codebase, here is what stands between the current MVP and enterprise launch:

### P0 — Blockers (must fix before any commercial launch)

| Gap | Where in code | Fix needed |
|-----|--------------|-----------|
| MTSS panel hardcoded to Kanchi's birth data | `src/components/MTSSPanel.tsx` | Replace with `EnhancedBirthInputForm` — generic input |
| `forecast_avani.ts` hardcoded to one person | CLI scripts folder | Generalise to `forecast.ts` accepting `(name, dob, tob, lat, lng, question)` |
| Swiss Ephemeris disabled | `VITE_USE_SWISS_EPHEMERIS=false` | Enable after Week 28–30 accuracy validation |
| No CI/CD pipeline | Missing `.github/workflows/` | Add GitHub Actions: lint → typecheck → test → deploy |
| Supabase creds in `.env` — no RLS confirmed | `api/index.mjs` | Verify Row Level Security on all Supabase tables |

### P1 — Enterprise Features

| Feature | Notes |
|---------|-------|
| Subscriber birth-data management | Any user can save unlimited profiles (already in roadmap) |
| Subscription tiers | Free / Pro / Enterprise — Clerk + payment gateway |
| Generalised CLI forecast tool | 13-layer engine, accepts any name + birth details + question |
| Ashtakavarga bindus in transit view | Item 16 in queue |
| Dasha integration in transit view | Item 17 in queue |
| Ebook knowledge base ingestion | Prasnatantra PDF + 10 more queued ebooks |

### P2 — Polish

| Feature | Notes |
|---------|-------|
| GitHub Actions CI/CD | Lint → typecheck → Vitest → Playwright → Vercel preview |
| SEO + meta tags | `SEO.tsx` and `SEOAnalyticsDashboard.tsx` exist — wire to each page |
| Offline PWA | Service worker registered, needs caching strategy |
| 20+ language support | Currently English + Hindi — expand via i18n library |

---

## 8. Non-Functional Requirements for Enterprise Launch

| Category | Requirement | Current Status |
|----------|-------------|----------------|
| Accuracy | Swiss Ephemeris 99.99% (±0.001°) | 🟡 Wrapper ready, not enabled |
| Auth | Clerk — already integrated | ✅ Done |
| Data privacy | Supabase RLS per-user isolation | ⚠️ Verify RLS policies |
| Performance | P95 < 300ms API, <100ms FCP | ✅ Vite + lazy loading + Web Worker |
| Accessibility | WCAG 2.1 AA | ✅ Claimed in README |
| Observability | Structured logging, error tracking | ⚠️ Add Sentry or Datadog |
| CI/CD | Automated test + deploy | ❌ Missing |
| Mobile | iOS + Android native apps | 🟡 Roadmap Week 50+ |

---

## 9. User Journeys for Flowstep to Expand

### Journey A — New Subscriber (First Reading)
```
Sign Up (Clerk) → Enter birth details (date, time, place) →
System geocodes place → Generates Janma Kundali via 13-layer engine →
Receives personalised forecast verdict ("Therefore: ...") →
Views Dasha timeline → Reads remedies → Saves profile
```

### Journey B — Returning Subscriber (Daily Use)
```
Sign In → Dashboard shows today's Panchang for their chart →
Checks active Dasha/Antardasha period → Views transit alerts →
Asks a Prashna question → Gets 13-layer verdict → Logs remedy progress
```

### Journey C — Consultancy (Pandit / Expert)
```
Access Jataks database → Select client chart →
Run Comprehensive Report (PDF export) → Share with client →
Note: this workflow exists but needs a client management UI
```

### Journey D — Prashna Kundali (Horary Question)
```
Enter question → System records current time automatically →
Generates Prashna chart → Routes through 13-layer engine →
Outputs verdict with "Therefore:" clause → No hedging
```

---

## 10. AI Brief — Paste This Into Flowstep.ai

> Copy the block below verbatim into Flowstep's **"New Project → AI Brief"** input:

```
I am enterprise-upgrading a running Vedic astrology SaaS called "Vedic Rajkumar"
(live at https://vedic-rajkumar.vercel.app, repo: github.com/CRAJKUMARSINGH/Vedic_Rajkumar).

Tech stack: React 19.2 + Vite 5, TypeScript, TanStack Query v5, Framer Motion 12,
Clerk auth, Supabase (PostgreSQL), deployed on Vercel. 40+ pages already built.

Core engine: A 13-layer Vedic astrological interpretation system (v2.1) that resolves
every chart reading into a firm verdict — never hedges, always ends with "Therefore:".
Layers cover: D1 natal promise, Shadbala scoring, Yoga tagging (ACTIVE/LATENT/BROKEN),
Divisional chart conflict resolution, Dasha tagging, Double Transit check, Arudha Lagna,
Failure Mode analysis, Psychological Profile, Six-Layer Remedy Stack, Fame scoring.

Current problems to solve for enterprise launch:
1. MTSS (Marriage Timing & Spouse) panel is hardcoded to one person — needs generic birth-input form
2. CLI forecast tool is person-specific — needs generalisation to accept any (name, DOB, TOB, lat, lng, question)
3. Swiss Ephemeris WASM is installed but disabled — needs accuracy validation + enablement
4. No CI/CD pipeline — needs GitHub Actions (lint → typecheck → Vitest → Playwright → Vercel)
5. Supabase Row Level Security needs verification for multi-tenant data isolation
6. Knowledge base ebooks (10+ PDFs) need ingestion into the interpretation engine

User types: (1) Subscribers seeking personal forecasts, (2) Pandits/consultants using the
platform with client charts, (3) Admin/owner (Rajkumar Singh Chauhan).

Please generate:
1. Epic-level backlog for the enterprise upgrade (P0/P1/P2 priority tiers)
2. User stories with acceptance criteria for the P0 sprint
3. User flow diagrams for: new-subscriber first reading, prashna query, pandit client session
4. Data model for multi-tenant subscriber birth-profile storage
5. A prioritised 12-week enterprise launch roadmap
```

---

## 11. What You Must Provide Before Submitting to Flowstep

- [ ] Confirm payment gateway: Razorpay (India) + Stripe (international) or just one?
- [ ] Confirm target languages beyond English + Hindi for the enterprise version
- [ ] Confirm whether Pandit/consultant accounts are part of v1 or a later phase
- [ ] Attach any new wireframes or screen recordings to the Flowstep project
- [ ] Confirm the subscription pricing model (flat monthly / usage-based / freemium)
