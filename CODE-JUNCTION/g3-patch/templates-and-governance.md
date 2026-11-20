# Issue / PR Templates + AGENTS.md + CONTRIBUTING.md Guidance — aligned to P1–P6

This document supplies copy-paste-ready content for `.github/` and the two governance files, aligned to the Phase 1 patch plan (P1–P6). Base repo state at `6b1c0fb`: templates exist in `.github/ISSUE_TEMPLATE/` (bug_report.yml, beta_bug.yml, defect.yml, feature_request.yml) and `.github/PULL_REQUEST_TEMPLATE.md`; `AGENTS.md` and `CONTRIBUTING.md` exist at root. The additions below are **additive** — append the marked sections rather than replacing existing content.

---

## 1. `.github/ISSUE_TEMPLATE/patch_task.yml` (new)

```yaml
name: Phase 1 Patch Task (P1–P6)
description: Track one patch from the Phase 1 accuracy/governance plan
title: "[P?] <short patch title>"
labels: ["phase-1", "patch"]
body:
  - type: dropdown
    id: patch_id
    attributes:
      label: Patch ID
      options: [P1 - Ayanamsa consolidation, P2 - Ephemeris routing, P3 - Swiss Ephemeris licence ADR, P4 - Quality-gate restoration, P5 - Accuracy gate in CI, P6 - Contribution workflow]
    validations: { required: true }
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance criteria
      description: Copy the numbered acceptance criteria from docs/PHASE1_PATCH_PLAN.md for this patch.
    validations: { required: true }
  - type: textarea
    id: patch_file
    attributes:
      label: Patch file / branch
      placeholder: "patches/0001-fix-ayanamsa-... .patch on branch phase1/patches-p1-p6"
  - type: input
    id: owner
    attributes: { label: Owner, description: "Use @handle — leave TBD if unassigned" }
  - type: input
    id: due
    attributes: { label: Due date, description: "YYYY-MM-DD — leave TBD if unscheduled" }
```

## 2. `.github/PULL_REQUEST_TEMPLATE.md` — append

```markdown
### Phase 1 linkage
- Patch ID: P1 / P2 / P3 / P4 / P5 / P6 (or N/A)
- Linked issue: #<issue>  (TBD until issues are filed)
- Patch file: `patches/….patch` (or branch `phase1/patches-p1-p6`)

### Gate commands run (per docs/QUALITY_GATE.md)
- [ ] `npm run test:core`
- [ ] `npm run build`
- [ ] `npm run typecheck` (required after P4)
- [ ] `npm run lint` (required after P4)
- [ ] `npm run test:accuracy:fast` (required after P5)

### Definition of Done
- [ ] Vitest coverage for new/changed calculation logic (normal + boundary)
- [ ] Sidereal math uses the shared `src/lib/vedic/ayanamsaEngine.ts` (no inline Lahiri formulas)
- [ ] Docs/claims updated (`npm run docs:verify`)
- [ ] DCO sign-off
```

## 3. `AGENTS.md` — append

```markdown
## Phase 1 patch workflow (P1–P6)

- P1–P6 are defined in docs/PHASE1_PATCH_PLAN.md; each has numbered acceptance criteria.
- Never edit a shipped `.patch` file in place — re-export with `git format-patch main..<branch>`.
- Before handing off any patch, verify on a fresh clone:
      git clone <repo> /tmp/verify && git -C /tmp/verify checkout main
      git -C /tmp/verify apply --check patches/NNNN-*.patch
- Required gates before marking a patch PR ready:
      npm run test:core && npm run build
  typecheck/lint become required once P4 lands; test:accuracy:fast once P5 lands.
- Sidereal ayanamsa: always import from src/lib/vedic/ayanamsaEngine.ts. Do not inline
  Lahiri formulas (this duplication is what P1/P2 removed).
- The Swiss Ephemeris WASM module is AGPL-3.0 — see LICENSING.md. Default builds keep
  VITE_USE_SWISS_EPHEMERIS=false; the P3 ADR governs any change.
```

## 4. `CONTRIBUTING.md` — append

```markdown
## Working on Phase 1 (P1–P6)

1. Pick a patch from the tracker (docs/PHASE1_PATCH_PLAN.md or the linked spreadsheet);
   comment on its issue (label `phase-1`) to claim it — leave Owner/TBD issues unassigned
   until an owner is recorded.
2. Branch from main as `phase1/<topic>`; one logical change per commit using the
   conventional-commit types enforced by commitlint (fix/feat/docs/chore/test/ci).
3. Run the gate sequence before pushing:
       npm run test:core && npm run build
4. For patches P1/P2 the exported `.patch` files are the contract: keep the commit
   message identical to the patch file, and re-run `git apply --check` on a fresh
   clone if main moves.
5. Update the tracker row (status, PR link) when the PR opens; the maintainer flips it
   to "merged" after the gate passes.
```

---

**Traceability note:** P1–P6 issue numbers, owners and due dates are **TBD** in this document — the repo's open issues (#8–#22) are dependabot dependency bumps, so the six `patch_task` issues must be filed from the template above and then linked in the tracker spreadsheet.
