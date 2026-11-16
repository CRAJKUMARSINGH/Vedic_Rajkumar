# PRODUCTION PREVIEW — OFFLINE TEST (PATCH 5)

**Repository:** `https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar`
**Branch:** `fix/robotic-failure-remediation`
**LATEST COMMIT SHA:** `e379bf51bfb9bc7e57ba3cfe1c0967f48310d6b8`
**Date:** 2026-11-15
**Config:** `playwright.preview.config.ts` (port 4173, `workers: 1`)

---

## Why a production preview (not the dev server)

The robotic screenshot (2026-11-04) flagged `/panchang` as blank offline. The
observation was made against the **dev server** — `vite-plugin-pwa` does not install
a real service worker in dev mode, so an offline claim there is meaningless.
A PWA offline claim is only valid against a real production bundle.

---

## Build

```powershell
npm run build
# ✅ built in 1m 17s
# PWA v1.3.0  mode: generateSW
# precache: 223 entries (6664.48 KiB)
# dist/sw.js + dist/workbox-*.js generated
```

---

## Procedure

```powershell
npx playwright test --config playwright.preview.config.ts tests/e2e/production-offline.spec.ts --reporter=list
```

The spec (`tests/e2e/production-offline.spec.ts`) runs two tests:

1. **PATCH 6 — home page loads with no unexplained 4xx/5xx** — captures all HTTP
   > =400 responses, failed requests, and console.error on the production `/`.
2. **PATCH 5 — /panchang works offline after service worker activation**:
   - Load `/panchang` **online**.
   - Wait for `navigator.serviceWorker.ready`.
   - Wait 3s for workbox precaching.
   - Inspect `caches.keys()` and check the shell is cached.
   - Assert the online page rendered real Panchang content.
   - Set context **offline**.
   - **Reload** `/panchang`.
   - Assert body is usable (not blank / not error boundary).

---

## Results

```
Running 2 tests using 1 worker

  ok 1  PATCH 6 — home page loads with no unexplained 4xx/5xx (6.0s)
  ok 2  PATCH 5 — /panchang works offline after service worker activation (11.3s)

  2 passed (19.7s)   exit code 0
```

---

## Evidence — PATCH 6 (home-page assets)

`reports/evidence/production-home-assets.txt`:

```
=== PRODUCTION home / — HTTP >=400 ===
(none)

=== PRODUCTION home / — requestfailed ===
(none)

=== PRODUCTION home / — console.error ===
(none)
```

**Status: NOT REPRODUCED.** The robotic-run 404 could not be observed in dev or
production preview. No 404 masking has been added.

---

## Evidence — PATCH 5 (Panchang offline)

`reports/evidence/production-panchang-offline.txt`:

```
=== PATCH 5 /panchang offline (production preview) ===
serviceWorker.ready → activating
cache keys → ["workbox-precache-v2-http://127.0.0.1:4173/"]
app shell cached → true
online body length → 1848
offline reload error → none
offline body length → 1848
offline body head → PROTOTYPE Vedic Rajkumar — Preview Build The product is
actively being refined...
```

Screenshot: `reports/evidence/panchang-offline.png`

---

## Verdict

| Check                                  | Result              |
| -------------------------------------- | ------------------- |
| Service worker activates in production | ✅ `activating`     |
| App shell in workbox precache          | ✅ `true`           |
| Offline reload of `/panchang`          | ✅ no error         |
| Offline render is usable (not blank)   | ✅ body length 1848 |
| Home page 4xx/5xx (production)         | ✅ none             |

**PASS.** The cached shell renders a usable page offline. The dev-server observation
(blank page) was a testing artefact — dev mode has no service worker by design.
No offline fallback UI was required.
