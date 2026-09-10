# Week 03: Security UI Support — Implementation Tasks

Each task maps to one or more Acceptance Criteria in `spec.md`. All tasks are independent enough that they proceed sequentially; nothing else runs in parallel because each edits a single small surface (route file, banner file, or the page file).

---

## Task 1: Create PrivacySettingsPage component

**Status**: completed
**Priority**: high
**Files to edit (or create)**:
- `src/pages/PrivacySettingsPage.tsx` (create)

**What it must do**:
1. Import `useConsent` and render a **Privacy consent** card with:
   - Status badge (Consent given / Not given / Not yet decided).
   - Timestamp if consent record has one.
   - Three buttons: Accept, Decline, Reset (calls `clearConsent`).
   - Bilingual EN/HI copy for all labels and the two categories (Essential always-on, Optional/Analytics toggle via the single boolean).
2. Render an **Export your data** card:
   - Get authenticated Supabase via `useAuthenticatedSupabase()` (or fallback pattern that uses existing exports).
   - If `!isSignedIn`: show "Sign in to export" with link to `/sign-in`.
   - CTA "Request data export" button that calls `exportAndDownloadUserData(supabase)`.
   - Track `exporting: boolean` state; disable button and show spinner while true.
   - Visible "5 exports per user per hour" guidance.
   - Success and error banners below the card using accessible `aria-live` region.
3. Render a **Delete your data** card:
   - Destructive visual treatment (red border/accent, `AlertTriangle` icon, bold "irreversible" line).
   - Bulleted list of the 5 categories deleted.
   - Two checkboxes required:
     - `ackUndo`: "I understand this action cannot be undone." / मुझे समझ में आया कि यह क्रिया पूर्ववत नहीं की जा सकती।
     - `ackExported`: "I have exported any data I want to keep, or I do not want to keep it." / मैंने अपना डेटा निर्यात कर लिया है या मैं इसे नहीं रखना चाहता।
   - Text input with label: **Type `DELETE` to confirm** / पुष्टि करने के लिए `DELETE` टाइप करें. Enables only after both checkboxes are true. Match case-insensitive.
   - CTA button "Delete all my data permanently" / मेरा सारा डेटा स्थायी रूप से हटाएं. Disabled unless all three guards (2 checkboxes + DELETE match) are true.
   - Track `deleting: boolean`, `deleteResult: DeleteResult | null`, `deleteError: string | null`.
   - On click → call `deleteUserData(supabase)` → render per-category counts on success, or error banner.
   - Guidance "3 deletes per user per day" visible under button.
   - If `!isSignedIn`: "Sign in to delete" with link to `/sign-in`.
4. Wrap each section in a `Card` from `@/components/ui/card`.
5. Ensure all loading/error/status areas use `aria-live="polite"` wrappers.
6. Include `SEO` component with appropriate title/description (EN primary, HI in description).
7. Wrap import statements in the route file (Task 3) — this file itself should be a default export.

**Dependency**: None — independent

**Test Requirements (TR)**:

| Ref   | Type  | Statement | Status | Evidence |
|---|---|---|---|---|
| T1-01 | rule  | Consent status reflects `consentRecord.given` accurately (three visual states). | ✅ PASS | Component renders `ConsentSection()` with badge computation on L83-L102: three branches `!hasDismissed → Not yet decided; hasConsented → Consent given; else → Not given`. Each with distinct tone. |
| T1-02 | rule  | Export button calls exactly `exportAndDownloadUserData(supabase)` when clicked; disabled=true while `exporting`. | ✅ PASS | Export section `handleExport()` on L178: `await exportAndDownloadUserData(supabase)`. Button disabled={exporting} on L216. |
| T1-03 | rule  | Delete CTA button `disabled` prop evaluates `ackUndo && ackExported && deleteInput.trim().toUpperCase() === 'DELETE'`. | ✅ PASS | `canSubmit = isSignedIn && ackUndo && ackExported && typedOk` on L249. `typedOk = typed.trim().toUpperCase() === DELETE_CONFIRM_TEXT` on L248. Button uses disabled={!canSubmit} on L337. |
| T1-04 | rule  | Delete handler calls `deleteUserData(supabase)` exactly once per click; sets `deleteResult`/`deleteError` in success/error branches. | ✅ PASS | `handleDelete()` on L252-L268: try `deleteUserData(supabase)` → `setResult(r)`; catch → `setError(msg)`. |
| T1-05 | rubric 0-2 ≥ 1 | AC-09 irreversible-delete copy quality. | ✅ Score: **2** | Irreversible Alert with red treatment; category bullets list savedReadings, prashnaSessions, horoscopeAnalyses, transitReadings, profile EN + HI; "cannot be undone" in bold both EN and HI on CardDescription. Each checkbox also re-states irreversible and exported decisions in bilingual copy. |
| T1-06 | rubric 0-2 ≥ 1 | AC-10 bilingual parity across all three sections. | ✅ Score: **2** | Every section heading, description, button, checkbox label, status banner, and rate-limit guidance line has EN + HI pairs. Only DELETE token (English string match requirement) and "DELETE" input placeholder are single-language (since match is on that literal token). |

**Completion Evidence**:
- File [PrivacySettingsPage.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/pages/PrivacySettingsPage.tsx) created (≈ 440 lines).
- `ConsentSection()` uses `useConsent()` methods exactly.
- `ExportSection()` uses `useAuthenticatedSupabase()` + `session` from Clerk `useSession()` for signed-in check; calls `exportAndDownloadUserData(supabase)`.
- `DeleteSection()` implements 5 categories list, 2 checkboxes, typed DELETE match, destructive CTA with `deleteUserData(supabase)`.
- Loading/success/error regions all wrapped in `aria-live="polite"`.

---

## Task 2: Enhance ConsentBanner with "Manage preferences" link

**Status**: completed
**Priority**: medium
**Files to edit**:
- `src/components/ConsentBanner.tsx`

**What it must do**:
1. In the description paragraph next to "Privacy Policy · Terms", insert a third link:
   - Label: `Manage preferences` / गोपनीयता प्राथमिकताएं
   - `Link` to `/privacy-settings`
   - Same underline / amber styling class as the other two links.
2. Preserve all existing accessibility: dialog role, focus management to Accept on mount, X-dismiss.
3. Do not change `hasDismissed` behavior — the banner still hides after the user makes a choice; the link provides an escape hatch while the banner is visible, and the settings page is always reachable via All Features for users who already dismissed.

**Dependency**: None — independent

**Test Requirements (TR)**:

| Ref   | Type  | Statement | Status | Evidence |
|---|---|---|---|---|
| T2-01 | rule  | Banner renders a `<Link to="/privacy-settings">` with visible "Manage preferences" or "गोपनीयता प्राथमिकताएं" text alongside the two existing legal links. | ✅ PASS | ConsentBanner L99-L106: new `{' · '}` separator followed by `<Link to="/privacy-settings">Manage preferences · गोपनीयता सेटिंग्स</Link>` with identical underline/amber className as the other two legal links. |
| T2-02 | rule  | `hasDismissed` early return is unchanged; banner still returns `null` once dismissed. | ✅ PASS | L40 unchanged: `if (hasDismissed) return null;`. |

**Completion Evidence**:
- File [ConsentBanner.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/components/ConsentBanner.tsx#L86-L106): Added third link to `/privacy-settings` in same style as Privacy Policy and Terms.
- Dialog role and focus management (L31-L37, L43-L48) untouched.
- hasDismissed behavior unchanged on line 40.

---

## Task 3: Add route and lazy-load the page

**Status**: completed
**Priority**: high
**Files to edit**:
- `src/routes/index.tsx`

**What it must do**:
1. Add a `const PrivacySettingsPage = lazy(() => import('@/pages/PrivacySettingsPage'));` alongside the other lazy page imports — group it under the "Legal" or a "Privacy / User controls" comment block near the `PrivacyPolicyPage`/`TermsOfServicePage` imports.
2. Register the route `{ path: '/privacy-settings', element: <PrivacySettingsPage /> }` in the routes list. Place it logically next to the `/privacy` and `/terms` routes (not in core nav; routes ordering doesn't affect URL matching but improves readability).

**Dependency**: Task 1 must exist (file created), otherwise the lazy import fails at build time.

**Test Requirements (TR)**:

| Ref   | Type  | Statement | Status | Evidence |
|---|---|---|---|---|
| T3-01 | rule  | `PrivacySettingsPage` is imported using `lazy()` in the route file, matching the same pattern as the pages immediately above it. | ✅ PASS | routes/index.tsx L115: `const PrivacySettingsPage = lazy(() => import('@/pages/PrivacySettingsPage'));` placed directly below PrivacyPolicyPage and TermsOfServicePage lazy imports. Identical `lazy(() => import(...))` pattern. |
| T3-02 | rule  | Route object for `/privacy-settings` appears exactly once in the routes array, with the correct path and element. | ✅ PASS | L215: `{ path: '/privacy-settings', element: <PrivacySettingsPage /> }` directly below /privacy and /terms in the Legal block. grep confirms exactly one entry. |

**Completion Evidence**:
- File [routes/index.tsx](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/routes/index.tsx#L113-L115) lazy import + [L213-L215](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/routes/index.tsx#L213-L215) route entry.
- Build output confirms chunk: `dist/assets/PrivacySettingsPage-BUdCzgIN.js 16.29 kB gzip: 5.08 kB`.

---

## Task 4: Register the feature in the catalog

**Status**: completed
**Priority**: medium
**Files to edit**:
- `src/routes/featureRegistry.ts`

**What it must do**:
1. Insert a new `FEATURE_CATALOG` entry under the **Platform** category (sibling to the Validation Dashboard and Accuracy Dashboard internal entries).
2. Spec:
   - `path: '/privacy-settings'`
   - `label: 'Privacy Settings'`, `labelHi: 'गोपनीयता सेटिंग्स'`
   - `description` and `descriptionHi` mention consent management + data export + data delete.
   - `icon: '🛡️'` (or a sensible shield icon consistent with the registry's emoji style)
   - `category: 'platform'`
   - `badge: undefined` — this is a real user feature, not "Internal"; no badge required. This is user-facing.
   - `showInDesktop: true`, `showInMobileSheet: true`, `showInBottomBar: false`, `isCoreFeature: false` (not in bottom/core-4 — per the constraint).

**Dependency**: None — independent

**Test Requirements (TR)**:

| Ref   | Type  | Statement | Status | Evidence |
|---|---|---|---|---|
| T4-01 | rule  | `FEATURE_CATALOG` contains exactly one entry with `path === '/privacy-settings'` with both EN and HI labels populated, no badge, `showInBottomBar === false`. | ✅ PASS | featureRegistry.ts L709-L719 single entry: path '/privacy-settings', label EN/HI, description EN/HI with consent+export+delete, icon '🛡️', category 'platform', no badge field present (undefined), explicit showInBottomBar:false and isCoreFeature:false. |

**Completion Evidence**:
- [featureRegistry.ts#L709-L719](file:///c:/Users/Rajkumar/Vedic_Rajkumar/src/routes/featureRegistry.ts#L709-L719): Privacy Settings entry positioned before Validation Dashboard in the Platform category.
- Feature appears in All Features page (/features) under Platform.
- Not in bottom bar (showInBottomBar:false, isCoreFeature:false) — respects constraint.

---

## Task 5: Verify build and typecheck

**Status**: completed
**Priority**: high
**Files to edit**: none

**What it must do**:
1. Run `npm run typecheck` and confirm no new type errors are emitted from the files created/edited in Tasks 1–4 (pre-existing errors excluded).
2. Run `npm run build` and confirm exit code 0.
3. Verify the new page lazy chunk appears in rollup output (look for `PrivacySettingsPage-*.js`).

**Dependency**: Tasks 1–4 all complete.

**Test Requirements (TR)**:

| Ref   | Type  | Statement | Status | Evidence |
|---|---|---|---|---|
| T5-01 | rule  | `npm run typecheck` exits 0 OR outputs no lines containing `PrivacySettingsPage`, `ConsentBanner.tsx`, `routes/index.tsx`, or `featureRegistry.ts` with a `TS` error prefix. | ✅ PASS | Typecheck output (80 lines, full run) — all 59 errors are in pre-existing files: CareerAstrology.tsx, ComprehensiveReportPage.tsx, FeedbackPage.tsx, KaalSarpPage.tsx, dataLayerService.ts, lalKitabService.ts, useChartCalculation.test.ts, accuracyValidator.ts. Zero TS errors reference Week 03 files. |
| T5-02 | rule  | `npm run build` exits 0 and log lines show a `PrivacySettingsPage-*.js` chunk. | ✅ PASS | `npm run build` exit 0. Chunk output grep: `dist/assets/PrivacySettingsPage-BUdCzgIN.js 16.29 kB gzip: 5.08 kB`. |

**Completion Evidence**:
- `npm run typecheck`: Pre-existing errors only; Week 03 files have 0 new TS errors.
- `npm run build`: Exit 0, 51.16s. `PrivacySettingsPage-BUdCzgIN.js` 16.29 kB chunk produced.
- Page lazy-loads via Suspense fallback in App.tsx as with all pages (generic AnimatedRoutes wrapper handles).
