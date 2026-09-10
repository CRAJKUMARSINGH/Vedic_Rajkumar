# Week 03: Security UI Support — Specification

## Problem

The backend data layer has hardened user-data export and delete edge functions (`user-data-export`, `user-data-delete`) plus RLS-enabled tables, but there is no front-end surface that lets a user:
- view and manage their privacy consent choices after the initial banner is dismissed;
- trigger a self-service export of their stored data;
- initiate and confirm an irreversible delete of their stored data.

The current `ConsentBanner` hides itself after any first interaction and provides no path to revisit the choice. Users cannot exercise their GDPR/CCPA-style rights from within the app. A settings UI is required to close this privacy-experience gap and make the hardened backend controls actually usable.

## Users

- **Signed-in users** of the app (Clerk-authenticated) who have stored readings, prashna sessions, horoscope analyses, or transit reports and want to export or delete their data.
- **Any visitor** (signed-in or not) who wants to view or change privacy consent preferences after having initially accepted or declined.

## Goals

1. Provide a single **Privacy Settings** page users can reach from the app.
2. Let users inspect, grant, or revoke consent (reset to banner state) from that settings page.
3. Let users request a JSON export of all their owner-scoped data and download it as a file.
4. Let users request permanent deletion of all their owner-scoped data, with a clear, multi-step irreversible confirmation flow.
5. Keep the UI lightweight and easy to evolve alongside back-end hardening. Errors, loading states, and rate-limit messages must be readable.

## Non-Goals

- Implementing a full account/profile management system (name, email, password change) — out of scope.
- Building a settings shell with tabs/layout scaffolding unrelated to privacy (e.g., appearance, locale). That belongs to a later week's UI polish.
- Replacing or refactoring the existing Supabase edge functions, Clerk auth, or RLS policies. The UI only consumes what is already there.
- Adding telemetry/consent enforcement inside the analytics utility itself. Enforcement hooks are already presumed available; this work is limited to exposing controls.

## Functional Requirements

### FR-01 Privacy Settings page
- A new page component at route `/privacy-settings`.
- Page contains three visually separated sections: **Privacy consent**, **Export your data**, **Delete your data**.
- Each section has a bilingual (EN/HI) heading, short description, and appropriate CTA controls.
- Page is linked from:
  - the ConsentBanner via a "Manage preferences" or "Privacy settings" link;
  - the All Features catalog (Platform category, non-core; no bottom-bar/core-nav promotion).

### FR-02 Consent management section
- Displays current consent state visually:
  - Status badge (Consent given / Not given / Not yet decided).
  - Last-updated timestamp formatted as a readable local datetime, if available.
- Controls:
  - **Accept**: writes `{ given: true }` record via `useConsent().giveConsent()`.
  - **Decline**: writes `{ given: false }` record via `useConsent().declineConsent()`.
  - **Reset / Ask me again**: clears stored consent so the banner re-appears on next load.
- Category labels (Essential, Optional/Analytics) are shown for transparency even if current implementation stores a single boolean record.

### FR-03 Export section
- Primary CTA button: **"Request data export"** or bilingual equivalent.
- While export is in progress: button disabled with loading state; status text visible.
- On success:
  - Download of a JSON file `vedic-data-export-<userId>.json` is triggered via the existing `exportAndDownloadUserData` service.
  - Success toast/banner confirming the export and listing what was included (`savedReadings`, `prashnaSessions`, `horoscopeAnalyses`, `transitReadings`, `userProfile`).
- On error (rate-limit 429, network failure, 401, etc.):
  - Human-readable error banner shown; no throw.
  - Guidance text "5 exports per user per hour" visible under the button regardless of state.
- Export CTA disabled or shows a "Sign in to export" hint if the user is not authenticated (Clerk session absent).

### FR-04 Delete section
- Destructive section visually marked (red accent, warning icon, clear "irreversible" copy).
- **Step 1 — disclosure**: section shows a short description of what will be deleted, with a bulleted list of the same categories used in export.
- **Step 2 — confirmation checkboxes** (both required):
  - "I understand this action cannot be undone."
  - "I have exported any data I want to keep, or I do not want to keep it."
- **Step 3 — typed confirmation**: a text input where the user must type the word **`DELETE`** (case-insensitive) to confirm.
- **Step 4 — CTA**: primary destructive button ("Delete all my data permanently"), disabled until both checkboxes ticked AND typed string matches `DELETE`.
- While delete in progress: button disabled with loading state; status text visible.
- On success: summary banner showing the per-category delete counts (`savedReadings`, `transitReadings`, `prashnaSessions`, `horoscopeAnalyses`, `userProfile`) plus timestamps.
- On error: human-readable error banner. Rate limit "3 deletes per user per day" guidance visible under the button.
- Unauthenticated users see "Sign in to delete" with link to `/sign-in`.

### FR-05 ConsentBanner enhancements
- Add a secondary "Manage preferences" link (visually inline with Privacy Policy / Terms links) that navigates to `/privacy-settings` so users who already made a choice can still change it later.
- Preserve all existing accessibility attributes (dialog role, focus handling).
- No behavior change to Accept/Decline flow.

## Non-Functional Requirements

### NFR-01 Accessibility
- All new interactive controls have descriptive `aria-label`s where text alone is insufficient.
- Destructive delete button announces itself as destructive; confirmation input uses `aria-describedby` to tie to the typed-match requirement.
- Loading/success/error status messages live in an `aria-live="polite"` region.
- Respect reduced-motion preferences where Tailwind motion utilities apply.

### NFR-02 Authentication awareness
- Page uses existing Clerk + Supabase integrations (`useAuthenticatedSupabase` hook or equivalent) — never hardcodes tokens or secrets.
- Export and delete sections correctly disable themselves when no session exists.

### NFR-03 Performance
- No heavy blocking work on page load. All heavy work happens only after the user clicks a CTA.
- Page is lazy-loaded via `React.lazy` in the route file (consistent with the other pages).

### NFR-04 Bilingual parity (English + Hindi)
- All section headings, descriptions, status badges, error messages, success messages, and CTA labels have English and Hindi text. Follow the pattern used elsewhere in the project for bilingual copy.

### NFR-05 Style consistency
- Use existing components (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge`, `Checkbox`, `Input`) plus `lucide-react` icons consistent with the rest of the app.
- Use the same warm-amber-on-dark aesthetic already established for banners and pages — no new color systems introduced.

### NFR-06 Error resilience
- Every network call wrapped in try/catch with human-readable messages surfaced to the UI.
- Partial/empty responses from edge functions are handled gracefully (non-fatal; show "no data to export" or equivalent).

## Constraints

- Do not add to the mobile core 4 (or 5) bottom-bar navigation. The privacy page is discoverable via All Features and via the banner link only.
- Do not weaken or remove any existing RLS / rate-limit / confirm gates already enforced in Supabase or the services.
- No new `npm` dependencies are allowed unless explicitly justified and approved.
- All code is strictly TypeScript; no `any` types without a comment explaining why.

## Dependencies

- Clerk auth (session → `getToken`)
- Supabase JS client (`supabase.functions.invoke`)
- Existing services: `dataExportService.ts`, `dataDeleteService.ts`, existing hook: `useConsent.ts`
- Existing UI components (`@/components/ui/*`) and icons (`lucide-react`)

## Assumptions

- Supabase edge functions `user-data-export` and `user-data-delete` are already deployed (or will be by the time the UI is exercised) and accept calls via the Supabase JS client authenticated with a Clerk JWT — matching the existing services' signatures.
- `useAuthenticatedSupabase` hook returns `{ supabase, isLoaded, isSignedIn }` or similar shape consistent with current patterns. If not, we replicate the minimal pattern inline.
- `Checkbox` and `Input` shadcn components exist in `@/components/ui/`; if they are missing we fall back to native elements styled consistently and note the debt.

## Open Questions

- None at this time — scope is intentionally bounded to UI-only controls.

---

## Acceptance Criteria (rule / rubric)

### AC-01 (rule)
Running `git status` after implementation shows exactly one new page file under `src/pages/`, optional small edits to `ConsentBanner.tsx`, edits to `src/routes/index.tsx` for the new route, edits to `src/routes/featureRegistry.ts` for the catalog entry, and no other scope-creep files.

### AC-02 (rule)
Visiting `/privacy-settings` while signed in renders three named sections: "Privacy consent", "Export your data", and "Delete your data", all with bilingual copy.

### AC-03 (rule)
Consent section contains Accept, Decline, and Reset controls that call the matching methods on `useConsent` with visibly updated state without requiring a page reload.

### AC-04 (rule)
The export button invokes `exportAndDownloadUserData` via the authenticated Supabase client and triggers a `.json` file download on success. Error state shows a visible banner. Export button is disabled while loading.

### AC-05 (rule)
Delete section exposes:
- two required checkboxes (both must be ticked before the input/button enable);
- a text input requiring the exact word `DELETE` (case-insensitive);
- a destructive CTA button that calls `deleteUserData` only when all guards are satisfied;
- a success state that renders the returned `deleted` counts.

### AC-06 (rule)
`ConsentBanner.tsx` contains a clickable "Manage preferences" link (or bilingual equivalent) that routes to `/privacy-settings` when rendered, even though the banner itself auto-hides after first dismissal.

### AC-07 (rule)
`npm run typecheck` shows zero new type errors introduced by Week 03 files (pre-existing errors are not counted against this criterion).

### AC-08 (rule)
`npm run build` succeeds with exit code 0. The new page appears as a lazy-loaded chunk in the rollup output.

### AC-09 (rubric, 0-2, threshold ≥ 1)
**Copy quality and clarity of the privacy/delete copy**: The irreversible-delete section contains clear, non-ambiguous copy that leaves no doubt what will be deleted and that the action cannot be undone.
- `2`: Copy is legally prudent, scannable, bilingual parity is near-perfect, no jargon.
- `1`: Copy is clear enough for users but missing one dimension (bilingual parity, formatting, or some ambiguity).
- `0`: Ambiguous or vague copy that could surprise a user.

### AC-10 (rubric, 0-2, threshold ≥ 1)
**Bilingual parity (EN/HI) across the new Privacy Settings page**: Heading + description + CTA labels + success/error messaging in each of the three sections.
- `2`: Every section heading, description, button label, and status message has matched EN and HI text; no orphan English strings.
- `1`: Major sections bilingual, a small number of status strings or micro-copy still English-only.
- `0`: English-only surface, no Hindi copy present.
