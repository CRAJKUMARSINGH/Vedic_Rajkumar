# Tier Matrix — the harness contract

**Owner:** Quality / Pre-Launch · **Status:** authoritative · **Last verified:** 2026-10-27

This is the single source of truth the tier robot asserts against. If you change a
gate, a limit, or a plan, change this file in the same commit — `tests/e2e/tier-matrix.spec.ts`
reads it, and `docs:verify` fails on drift.

## Grades

| Grade              | Internal `UserTier` (`src/features/tier/config.ts`) | API tier (`src/api/v1/scopes.ts`) | Plan (`subscriptionService.ts`) |
| ------------------ | --------------------------------------------------- | --------------------------------- | ------------------------------- |
| **A — Free**       | `registered` (visitor variant: `anonymous`)         | `free`                            | `free`                          |
| **B — Pro**        | `premium`                                           | `developer`                       | `pro`                           |
| **C — Enterprise** | `practitioner`                                      | `enterprise`                      | `pro` + white-label flag        |

> The three internal taxonomies are pre-existing and contradictory. This table is
> the **mapping**; unifying them into one enum is a separate, later task (see
> `docs/adr/ADR-001-tier-taxonomy.md`).

## Capability contract

| Capability                                | Flag / limit source            | A — Free | B — Pro    | C — Enterprise |
| ----------------------------------------- | ------------------------------ | -------- | ---------- | -------------- |
| Kundli · Prashna · Matchmaking · Panchang | `TIER_FEATURES`                | ✅       | ✅         | ✅             |
| Weekly questions                          | `WEEKLY_DRIVE.grants`          | 21       | ∞          | ∞              |
| Profiles                                  | `TIER_LIMITS.maxProfiles`      | 5        | 20         | ∞              |
| Charts / day                              | `TIER_LIMITS.maxChartsPerDay`  | 20       | 100        | ∞              |
| PDF exports                               | `TIER_LIMITS.maxPdfExports`    | 10       | ∞          | ∞              |
| `dasha_timeline`                          | `FEATURE_FLAGS.DASHA_TIMELINE` | ⛔ gated | ✅         | ✅             |
| `transit_alerts`                          | `FEATURE_FLAGS.TRANSIT_ALERTS` | ⛔ gated | ✅         | ✅             |
| `advanced_pdf`                            | `FEATURE_FLAGS.ADVANCED_PDF`   | ⛔ gated | ✅         | ✅             |
| `client_crm`                              | `FEATURE_FLAGS.CLIENT_CRM`     | ⛔ gated | ⛔ gated   | ✅             |
| `white_label`                             | `FEATURE_FLAGS.WHITE_LABEL`    | ⛔ gated | ⛔ gated   | ✅             |
| Upgrade banner                            | `UpgradeBanner.tsx`            | shown    | hidden     | hidden         |
| Support level                             | `TIER_LIMITS.supportLevel`     | `email`  | `priority` | `dedicated`    |

## Required `data-testid` contract

The robot cannot assert against styling. These attributes are mandatory:

| testid               | Component                              | Required attributes                  |
| -------------------- | -------------------------------------- | ------------------------------------ |
| `tier-badge`         | nav / profile chip                     | `data-tier` = internal `UserTier`    |
| `upgrade-banner`     | `src/components/UpgradeBanner.tsx`     | —                                    |
| `feature-gate`       | `src/components/FeatureGate/index.tsx` | `data-feature` = flag key            |
| `pdf-export-button`  | export trigger                         | `data-gated` = `"true"` \| `"false"` |
| `weekly-drive-card`  | `src/components/WeeklyDriveCard.tsx`   | `data-remaining` = int (`-1` = ∞)    |
| `white-label-toggle` | enterprise settings                    | —                                    |

## Known limitation — enforcement parity

Today every gate is **client-side** (localStorage). The robot therefore proves the
_UI contract_, not _authorisation_. A grade that edits localStorage still passes.
Tracked as `PARITY-001`; closes when gating moves behind an edge function
(see `docs/testing/TIER_PARITY.md`).
