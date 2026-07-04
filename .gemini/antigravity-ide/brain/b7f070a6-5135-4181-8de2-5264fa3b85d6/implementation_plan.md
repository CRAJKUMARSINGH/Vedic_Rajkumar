# Fix Linting and Syntax Errors

The project currently fails `npm run syntax-check` with 10 errors across multiple files. The goal is to systematically address each error, ensure the code compiles, and then run the full test suite.

## User Review Required

- Approve the plan to modify the following files:
  - `src/App.tsx`
  - `src/components/EnhancedBirthInputForm.tsx`
  - `src/components/RandomQuestionCard.tsx`
  - `src/components/VimshottariDashaDashboard.tsx`
  - `src/integrate_supplements.ts`
  - `src/services/prasnaMargaExtras.ts`
  - `src/tests/compare_parashar.ts`
- Confirm that adding simple console logs or comments to empty `catch` blocks is acceptable.

> [!IMPORTANT]
> These changes are limited to fixing syntax and linting; they do not alter functional logic.

## Open Questions

- Do you want any additional logging in the empty `catch` blocks beyond a simple comment?
- Should we remove duplicate imports in `VimshottariDashaDashboard.tsx` entirely, or replace them with a single import statement?

## Proposed Changes

### src/App.tsx
- Remove duplicated definitions of `queryClient`, `clerkAppearance`, `ClerkQueryClientCacheInvalidator`, and `ClerkProviderWithNavigate` (the second copy starting around line 393).
- Ensure only one `AnimatedRoutes` component exists and is exported.
- Verify there are no stray characters after the `const AnimatedRoutes = () => {` line.

### src/components/EnhancedBirthInputForm.tsx
- Fix corrupted line at 307: replace the malformed `setSelectedCoords(nu  const handleQuickAction = (action: string) => {` with proper separation:
  ```tsx
  setSelectedCoords(null);
  const handleQuickAction = (action: string) => {
  ```
- Ensure the function body is correctly closed.

### src/components/RandomQuestionCard.tsx
- Locate the empty block (likely a `catch {}` or similar) at line 53 and replace with a comment or console log, e.g.:
  ```tsx
  catch (e) {
    console.error('RandomQuestionCard error', e);
  }
  ```

### src/components/VimshottariDashaDashboard.tsx
- Remove duplicate named imports `Eye` and `Zap` (lines 46‑48) so each identifier is imported only once.
- Keep a single import list without redeclarations.

### src/integrate_supplements.ts
- Locate the unterminated string literal around line 93 and close the string properly (add missing quote) or restructure the string.

### src/services/prasnaMargaExtras.ts
- Add placeholder comments or simple logging to empty `catch` blocks at lines 326 and 341.

### src/tests/compare_parashar.ts
- Remove irregular whitespace characters (non‑breaking spaces) on line 8.
- Ensure the line follows standard spacing.

## Verification Plan

1. Apply the edits using the appropriate `replace_file_content` or `multi_replace_file_content` tools.
2. Run `npm run syntax-check` to confirm zero errors.
3. If successful, execute `npm test` to run the test suite.
4. Report any remaining issues.

### Automated Tests
- `npm run syntax-check`
- `npm test`

### Manual Verification
- Open the app in a browser (`npm run dev`) and ensure routes render without runtime errors.
