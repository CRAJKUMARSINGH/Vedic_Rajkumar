Vedic_Rajkumar — Phase 1 ayanamsa/ephemeris patch set
Base commit: 6b1c0fbf95f25cc5478d60b0b319b6969a098fa0 Thu Nov 19 16:25:50 2026 +0530 fix(e2e): guard N9 on empty birthDate, fix test selectors, update e2e evidence
Generated: 2026-11-20

Files to replace (copy over repo root, paths are relative):
  src/lib/vedic/ayanamsaCore.ts        (NEW)
  src/lib/vedic/ayanamsaEngine.ts      (rewritten, compatibility facade)
  src/services/ayanamsaService.ts      (rewritten, derived labels)
  src/astrology/core/ephemeris.ts      (rewritten, fail-loud)

Apply either way:
  A) unzip and copy phase1/src over the repo, then git add -A
  B) git apply phase1-ayanamsa-ephemeris.patch    (from repo root)

Verified: npx tsc --noEmit --strict over all four files = 0 errors against this commit.
