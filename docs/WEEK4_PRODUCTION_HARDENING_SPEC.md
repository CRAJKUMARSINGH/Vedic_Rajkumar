# Week 4: Production Hardening Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Goals

Move the app from prototype toward safe public usage by:

1. Validating all required environment variables at startup with clear developer errors
2. Adding a privacy/consent banner (GDPR + CCPA compliant) before any data is collected
3. Integrating structured error monitoring hooks (Sentry-compatible) for production observability
4. Removing / guarding dev-only fallbacks that must not run in production
5. Marking prototype pages with `noindex` to prevent search engines from indexing incomplete flows

---

## 2. Requirements

### R1 — Environment Validation
- A `validateEnv()` function in `src/lib/envConfig.ts` reads all `VITE_*` vars
- In production (`MODE === 'production'`), missing required vars throw with a clear message listing which keys are absent
- In development, missing vars emit a `console.warn` with a hint to copy `.env.example`
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`
- Optional but warned: `VITE_GA_MEASUREMENT_ID`
- Called once in `src/main.tsx` before `createRoot`

### R2 — Consent Banner
- `<ConsentBanner>` component in `src/components/ConsentBanner.tsx`
- Appears on first visit if consent has not been given (stored in `localStorage['vr-consent']`)
- Two actions: "Accept" (stores consent with timestamp) and "Decline" (stores refusal — no analytics)
- Links to `/privacy-policy` and `/terms`
- Accessible: keyboard-navigable, focus-trapped within the banner, ARIA `role="dialog"`
- On accept: calls `onConsent(true)`, on decline: calls `onConsent(false)`
- Does NOT block page content — slides in from the bottom

### R3 — Error Monitoring Integration
- `src/lib/errorMonitoring.ts` — thin adapter wrapping Sentry (or a no-op if `VITE_SENTRY_DSN` is absent)
- Exports: `initErrorMonitoring()`, `captureException(err, context?)`, `captureMessage(msg, level?)`
- `initErrorMonitoring()` is called in `src/main.tsx` after env validation
- `ErrorBoundary` component updated to call `captureException` on `componentDidCatch`
- Errors in production are never swallowed silently

### R4 — Production-Safe Fallbacks
- `src/lib/envConfig.ts` exports `isProduction()`, `isDevelopment()` helpers
- Any component that renders mock/demo data should guard with `!isProduction()`
- `src/Providers.tsx` — Clerk missing key: warn in dev, throw in prod (handled by `validateEnv`)

### R5 — Prototype `noindex` Tags
- Pages not yet production-ready get `<meta name="robots" content="noindex,nofollow">`
- Applied via the existing `<SEO>` component's `noIndex` prop
- Placeholder/coming-soon pages already in the app get this treatment

### R6 — Week 4 Tests
- Unit tests in `src/tests/week4/envConfig.test.ts` — env validation logic
- Unit tests in `src/tests/week4/errorMonitoring.test.ts` — capture wrappers
- Unit tests in `src/tests/week4/consent.test.ts` — banner consent logic (localStorage)

---

## 3. Design

### Environment validation approach
```
validateEnv() → reads import.meta.env → checks required keys → throws (prod) or warns (dev)
```
Called synchronously before React mounts. Error is displayed as a styled DOM element if React can't mount.

### Consent storage format
```json
{
  "given": true,
  "timestamp": "2026-09-04T12:00:00.000Z",
  "version": "1.0"
}
```
Key: `vr-consent` in `localStorage`.

### Error monitoring adapter
```
initErrorMonitoring() → if VITE_SENTRY_DSN → dynamic import Sentry SDK → init
                       → else → install console.error passthrough
captureException(err) → forward to Sentry.captureException or console.error
captureMessage(msg)   → forward to Sentry.captureMessage or console.warn
```
Dynamic import keeps Sentry out of the main bundle when DSN is not configured.

---

## 4. Task Breakdown

| Task | File | Status |
|------|------|--------|
| T1: envConfig utility | `src/lib/envConfig.ts` | ✅ Done |
| T2: errorMonitoring utility | `src/lib/errorMonitoring.ts` | ✅ Done |
| T3: ConsentBanner component | `src/components/ConsentBanner.tsx` | ✅ Done |
| T4: useConsent hook | `src/hooks/useConsent.ts` | ✅ Done |
| T5: main.tsx — validateEnv + initErrorMonitoring | `src/main.tsx` | ✅ Done |
| T6: ErrorBoundary — captureException wired | `src/components/ErrorBoundary.tsx` | ✅ Done |
| T7: App.tsx — ConsentBanner mounted | `src/App.tsx` | ✅ Done |
| T8: Week 4 tests | `src/tests/week4/` | ✅ Done |

---

## 5. Acceptance Criteria

- [x] Missing required env vars in production mode throw with a list of absent keys
- [x] Missing required env vars in development mode emit console.warn (no throw)
- [x] ConsentBanner appears on first visit and stores choice in localStorage
- [x] Accepting consent triggers onConsent(true); declining triggers onConsent(false)
- [x] ConsentBanner is keyboard-accessible with visible focus ring
- [x] ErrorBoundary calls captureException on componentDidCatch
- [x] initErrorMonitoring is a no-op when VITE_SENTRY_DSN is absent (no bundle bloat)
- [x] Week 4 tests pass (env, monitoring, consent)
- [x] Core gate (test:core) still passes
