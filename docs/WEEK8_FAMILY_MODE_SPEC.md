# Week 8: Multi-Profile Family Mode Spec
Status: Implementation Complete
Last updated: 2026-09-04
Owner: Kiro (spec-driven)

---

## 1. Feature Evaluation

### Assessment
The Week 7 (Dasha + Transit Correlation) feature is solid — 57 tests, 661 total passing.
The foundation justifies adding a second high-value feature.

### Option A: Multi-Profile Family Mode (CHOSEN)
**Complexity**: Medium — localStorage + optional Supabase persistence
**User Value**: High — enables family astrology, repeat usage, no re-entry friction
**Architecture fit**: Excellent — data layer (Week 3) already has saved_readings, local profile service exists

### Option B: Harden Week 7
**Complexity**: Low — already well-covered
**User Value**: Lower — marginal improvement
**Chosen**: ❌ Deferred

---

## 2. Goals

Deliver a family profiles system that:
- Stores up to 10 named family member birth profiles locally (localStorage)
- Allows CRUD: add, edit, delete, reorder
- Provides a `FamilyProfileSelector` picker usable in any chart page
- Works offline / without authentication (localStorage-first)
- Has a dedicated management page at `/family-profiles`
- Is accessible (keyboard, ARIA, focus management)
- Has complete test coverage

---

## 3. Requirements

### R1 — FamilyProfile type and storage library
- `src/lib/familyProfiles.ts`
- `FamilyProfile` interface: `{ id, name, relationship, birthDate, birthTime, birthTimezone, birthLat, birthLon, birthPlace, avatarInitials, notes, createdAt, updatedAt }`
- CRUD functions: `loadProfiles()`, `saveProfile(profile)`, `deleteProfile(id)`, `reorderProfiles(ids)`
- Storage key: `vr-family-profiles`
- Max 10 profiles — throws descriptive error if exceeded
- All strings sanitized before storage

### R2 — useFamilyProfiles hook
- `src/hooks/useFamilyProfiles.ts`
- State: `profiles`, `isLoading`
- Actions: `addProfile`, `updateProfile`, `removeProfile`, `reorder`
- Auto-syncs with localStorage on mount
- Returns stable callbacks (useCallback)

### R3 — FamilyProfileSelector component
- `src/components/FamilyProfileSelector.tsx`
- Dropdown / popover showing all saved profiles
- Each entry shows avatar initials + name + relationship + birth date
- "Select" loads that profile's birth data into the calling page
- "Add new" opens the add form
- Accessible: keyboard navigable, role="listbox", aria-selected

### R4 — FamilyProfileForm component
- `src/components/FamilyProfileForm.tsx`
- Add/edit form: name (required), relationship (optional), birth date (required), birth time, timezone, lat/lon, place, notes
- Validation: name required, date required, lat/lon numeric
- Saves via useFamilyProfiles hook
- Cancel resets form

### R5 — FamilyProfilesPage
- `src/pages/FamilyProfilesPage.tsx`
- Route: `/family-profiles`
- Lists all profiles with edit/delete actions
- Add new profile button opens FamilyProfileForm
- Empty state: "No family profiles yet. Add your first family member."
- Shows profile count (max 10)
- SEO: noindex (personal data page)

### R6 — Route registration
- `/family-profiles` added to `appRoutes.tsx`
- Added to `featureRegistry.ts` under `platform` category

### R7 — Week 8 tests
- `src/tests/week8/familyProfiles.test.ts` — storage library tests
- `src/tests/week8/familyProfilesPage.test.tsx` — page + component tests

---

## 4. Design

### Storage format
```json
{
  "version": "1.0",
  "profiles": [
    {
      "id": "uuid-v4",
      "name": "Mummy",
      "relationship": "Mother",
      "birthDate": "1947-09-05",
      "birthTime": "05:00",
      "birthTimezone": "Asia/Kolkata",
      "birthLat": 23.5,
      "birthLon": 74.32,
      "birthPlace": "Nandli, Rajasthan",
      "avatarInitials": "M",
      "notes": "",
      "createdAt": "2026-09-04T00:00:00.000Z",
      "updatedAt": "2026-09-04T00:00:00.000Z"
    }
  ]
}
```

---

## 5. Acceptance Criteria

- [x] FamilyProfile CRUD (add, read, update, delete) works in localStorage
- [x] Max 10 profiles enforced
- [x] useFamilyProfiles hook returns stable state + actions
- [x] FamilyProfileSelector renders profiles and emits selected profile
- [x] FamilyProfileForm validates required fields and saves/updates
- [x] FamilyProfilesPage renders empty state + profile list + add form
- [x] Route /family-profiles registered and accessible
- [x] Week 8 tests pass
- [x] Full test suite (661+) still passes
- [x] Build passes
