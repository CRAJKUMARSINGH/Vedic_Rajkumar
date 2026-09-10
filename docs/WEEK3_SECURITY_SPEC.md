# Week 3: Security & Data Layer Spec
Status: Implementation Complete (Enhanced — Sep 2026)

## Goals
1. Supabase RLS for all user-owned tables — owner-scoped CRUD
2. Clerk → Supabase JWT identity linking
3. Authenticated Supabase client hook (replaces direct anon client in components)
4. Data export and delete endpoints (user right-to-erasure)
5. Rate limiting on expensive/sensitive edge functions
6. Protected route guard
7. Input sanitization via DOMPurify
8. TypeScript DB types for all tables

## Requirements

### R1 — RLS: saved_readings + user_profiles tables
- `saved_readings`: owner-scoped INSERT/SELECT/UPDATE/DELETE by `user_id` (Clerk subject)
- `user_profiles`: owner-scoped upsert/read by `id` (Clerk subject)
- Anonymous fallback: reads not allowed (data is personal)

### R2 — Clerk → Supabase JWT linking
- Supabase client must receive Clerk's session token when a user is signed in
- `auth.jwt() ->> 'sub'` must resolve to the Clerk user ID
- Supabase client is created with `accessToken` callback from Clerk

### R3 — Authenticated Supabase client
- `useAuthenticatedSupabase()` hook returns a Supabase client that includes the Clerk JWT
- Falls back to anon client when user is not signed in
- All service writes/reads for personal data use this hook

### R4 — Data export endpoint
- Edge function `user-data-export`: returns all user-owned data as JSON
- Requires valid Clerk JWT
- Covers: saved_readings, prashna_sessions, horoscope_analyses, transit_readings

### R5 — Data delete endpoint
- Edge function `user-data-delete`: deletes all user-owned data
- Requires valid Clerk JWT
- Permanent and irreversible — returns 200 on success

### R6 — Rate limiting
- Client-side token bucket: 10 requests / 60s per function per user
- Edge functions: check `X-RateLimit-*` headers and return 429 with Retry-After

### R7 — Protected route guard
- `<ProtectedRoute>` component: redirects to /sign-in if not authenticated
- Used for /my-readings and other personal data pages

### R8 — Input sanitization
- `sanitize(input)` utility wrapping DOMPurify
- Applied to all user-supplied text before Supabase INSERT

## Design

### Clerk → Supabase linking approach
Supabase `createClient` accepts `global.fetch` override OR `accessToken` async function.
Using `@supabase/supabase-js` v2 `auth: { accessToken }` option + Clerk `useSession()` hook.

### Tables added in this migration
- `saved_readings` (user_id TEXT, title TEXT, birth_date TEXT, birth_time TEXT, birth_location TEXT, chart_type TEXT, notes TEXT, results JSONB, created_at TIMESTAMPTZ)
- `user_profiles` (id TEXT PK, display_name TEXT, preferred_language TEXT, default_birth_date TEXT, default_birth_time TEXT, default_birth_place TEXT, updated_at TIMESTAMPTZ)

## Tasks
- [x] T1: Migration — saved_readings + user_profiles + RLS
- [x] T2: useAuthenticatedSupabase hook
- [x] T3: sanitize utility (DOMPurify wrapper)
- [x] T4: Updated readingService — owner_id + auth client
- [x] T5: user-data-export edge function
- [x] T6: user-data-delete edge function (enhanced: accepts body confirm as well as query param)
- [x] T7: ProtectedRoute component
- [x] T8: Rate limiter utility
- [x] T9: Updated Supabase TypeScript types
- [x] T10: dataLayerService — unified export/delete/profile API
- [x] T11: Tests for security utilities
- [x] T12: useUserDataPrivacy hook — unified auth-checked export/delete hook
- [x] T13: DataPrivacyPanel component — GDPR-friendly user-facing export/delete UI
- [x] T14: MyReadingsPage — integrated DataPrivacyPanel
- [x] T15: Migration — anon read lockdown + rate_limit_log cleanup function
- [x] T16: Tests for useUserDataPrivacy hook (10 tests)

## Acceptance Criteria
- Authenticated user can save, read, and delete their own readings
- Unauthenticated requests to personal data routes return 401 / redirect to sign-in
- User can export all their data as a JSON blob
- User can request deletion of all their data
- Rate limiter prevents abuse of expensive endpoints
- Input passed to Supabase is DOMPurify-sanitized
- All new tables are typed in TypeScript
