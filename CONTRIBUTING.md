# 🤝 Contributing to Vedic Rajkumar

First off — **thank you for considering contributing!** 🙏

Vedic Rajkumar is built by and for a community of Jyotish (Vedic astrology) lovers, learners, practitioners, diaspora users, and developers who want trustworthy, transparent tools. Every contribution matters — whether you're fixing a typo, adding your city to the presets, deepening a classical rule implementation, or polishing the UI.

This document is a short, friendly guide. If anything is unclear, **please just open a PR or issue and ask** — we'd rather have a rough first contribution than lose a great idea to uncertainty.

---

## 🧭 What Can I Work On?

You don't need to be a Vedic astrology expert OR a senior developer to help. Here are some ideas by skill level:

### 🌱 For First-Time Contributors (5–30 minutes)
- Add **your city** to `src/data/worldCities.ts` (name, lat, lng, timezone) so it appears in Panchang & chart city selectors
- Fix a **typo** or a **Hindi translation wording** in any `LABELS` dict inside `src/pages/*.tsx`
- Improve a **helper text string** so it's clearer or more encouraging
- Add a **screenshot** or **GIF** to the README demo section
- Star the repo ⭐ and tell one friend who would find this useful

### 🌿 For Casual Contributors (1–2 hours)
- Fix an open **good-first-issue** or **help-wanted** issue (check the issue labels)
- Add a **Vitest unit test** for a calculation path in `src/services/` or `src/lib/vedic/` — see existing tests in `src/tests/` for style
- Make a component **more mobile friendly** (e.g., a card layout that breaks at 360px)
- Improve the **a11y** of a page (aria-labels, focus states, keyboard navigation)
- Add a **missing loading/empty/error state** to a page or feature card

### 🌳 For Regular Contributors (half-day to multi-day)
- Implement a missing **classical Jyotish rule** and add reference tests to the accuracy suite
- Build out one of the **preview/coming-soon modules** (KP, Jaimini, Lal Kitab, Varshaphal, Nadi) to the graduation bar in [PRODUCT_BRIEF.md](./docs/PRODUCT_BRIEF.md)
- Add a new **report export format** (e.g., CSV for spreadsheet users, ePub for long-form readings, printable invite-card PDF for muhurats)
- Localize to another Indian language (Tamil, Telugu, Kannada, Gujarati, Marathi, Bengali, etc.) — the Hindi pattern is already in place
- Add a **Web Worker** to offload a heavy calculation path (see `src/workers/`)

### 🙏 For Jyotish Scholars & Practitioners (priceless)
- **Audit** any rule implementation against classical texts (Brihat Parashara Hora Shastra, Brihat Jataka, Prashna Marga, Jaimini Sutras)
- **Open an issue** titled `Rule audit: <Name of rule>` with the text reference, what the code currently does, and what it *should* do — we'll fix it and add a reference test
- Add a **reference jatak** (birth chart with a well-documented life) to the accuracy suite so every future change is validated against it

---

## 🌿 Git Workflow (per AGENTS.md)

We follow a **strict feature-branch workflow** — nothing ever commits directly to `main`. This keeps the main branch green, reviewable, and deployable at all times.

### Step-by-step

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/Vedic_Rajkumar.git
cd Vedic_Rajkumar

# 2. Add the upstream repo so you can keep your fork in sync
git remote add upstream https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar.git

# 3. Start fresh from main
git checkout main
git pull upstream main

# 4. Create a feature branch with a descriptive name
#    Good: feature/fix-nakshatra-pada, chore/add-mumbai-city, docs/fix-readme-typo
#    Bad: my-changes, fix-stuff, update
git checkout -b feature/short-descriptive-name

# 5. Make your changes, commit in small logical chunks
#    (see commit style guide below)
git add <files>
git commit -m "feat(scope): description of what changed"

# 6. Rebase on latest main if other work landed meanwhile
git fetch upstream
git rebase upstream/main
# (resolve any conflicts, then `git rebase --continue`)

# 7. Push to your fork
git push -u origin feature/short-descriptive-name
```

Then **open a Pull Request** against `CRAJKUMARSINGH/Vedic_Rajkumar:main` from the GitHub UI. Please fill out the PR checklist template that appears — it helps us review faster!

---

## ✅ Commit Message Style

We use **Conventional Commits** (similar to Angular & the Angular commit style). This generates a clean, auto-changelog-friendly history.

Format:

```
<type>(<scope>): <subject line in imperative, < 72 chars>

<optional body — explain WHY, not just what>

<optional footer with issue refs: Fixes #123, Closes #45>
```

**Types:**
- `feat` — new user-facing feature (e.g., `feat(panchang): add Amrit Kalam filter to muhurat finder`)
- `fix` — bug fix (e.g., `fix(kundli): correct lagna calc for southern hemisphere lat < -23`)
- `docs` — README, CONTRIBUTING, inline docs, comments
- `style` — CSS/classes, layout, visual polish (not logic changes)
- `refactor` — code restructure, zero behavior change
- `perf` — performance improvement only
- `test` — add/update tests, no production code change
- `chore` — build scripts, deps, config, CI

**Scopes** are feature names: `kundli`, `prashna`, `matchmaking`, `milan`, `panchang`, `muhurat`, `pdf`, `ui`, `build`, `ci`, `tests`, `docs`, `i18n`, etc. Keep them lowercase and short.

**Examples:**
```
feat(prashna): add Prashna Marga 2nd-house-arudha check

Implements rule from PM Chapter 3 verses 12–15. Adds reference
test for case #07 from the Prashna validation suite.

Fixes #88
```

```
fix(hindi): correct typo in Rahu Kalam label — "राहु काल"
```

---

## 🧪 Before You Open a PR — Self-Check

Please run **at minimum** the first 4 commands on your local machine before pushing. This catches 90% of review nits before we even look.

```bash
# Required (must all pass):
npm run typecheck           # 1. TypeScript strict — zero TS2304 etc.
npm run lint                # 2. ESLint — zero errors (warnings OK if pre-existing)
npm run test:core           # 3. Core gate tests: ephemeris, vedic engine, nav
npm run build               # 4. Vite production build — look for "✓ built in …"

# Optional but strongly recommended:
npm run validate:accuracy   # Full 15-chart Swiss Eph comparison (takes ~1min)
npm run test:run            # All Vitest suites (CI mode)
npm run test:e2e            # Playwright end-to-end (requires Playwright browsers)
```

If **any of #1–#4 fail**, please fix them before opening the PR. If you're stuck on why something fails, **push anyway and describe the failure in the PR body** — we'll help you debug!

---

## 📝 PR Checklist Template

When you open your PR, the following checklist will appear. Reviewing against this gets your PR merged 3× faster:

```markdown
## What

**Short description:** (one line, imperative)

**Screenshots / GIFs** (if UI changed): paste here

## Why

**Context:** why this change, what problem it solves, issue # it closes

Closes #<issue-number>

## How

**Approach:** short technical notes, tricky parts, alternatives considered

## Verification

- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` reports zero new errors (pre-existing warnings OK)
- [ ] `npm run test:core` passes (all 3 green)
- [ ] `npm run build` succeeds ("✓ built in …" present)
- [ ] (Optional) `npm run validate:accuracy` passes — no regressions in 15 reference charts
- [ ] (If UI changed) Manually tested at 360px mobile width
- [ ] (If new rule) Reference test added to `src/tests/` with expected values

## Scope Confirmation

- [ ] This PR targets the **correct week / module** and does NOT creep into Week N+1
- [ ] Zero new npm packages added (or justification below if unavoidable)
- [ ] No direct Supabase calls inside React components (use services/ per AGENTS.md)
```

---

## 🌐 Adding Hindi / Regional Language Strings

Every bilingual page uses a `LABELS = { en: {...}, hi: {...} }` pattern at the top of the file, rendered via `isHi ? LABELS.hi.foo : LABELS.en.foo` and wrapped in `className={cn(isHi && 'font-hindi')}`.

**Rules:**
- Keep keys identical between `en` and `hi` objects — no missing keys (TypeScript won't catch this, so please eye-ball both)
- Use **shuddh** (pure) Hindi where possible, but prefer the commonly-used word if that's what users will actually read (e.g., use "कुंडली" not "जन्म कुंडली" if kundli is the standard)
- For Devanagari shaping, we use `@fontsource/noto-sans-devanagari` loaded globally — if you see tofu (□□), ensure the CSS class `font-hindi` is applied in that render branch

---

## 🧪 Writing Tests for Astrology Calculations

Calculation tests live next to their source (e.g., `src/services/vedicAstroEngine.test.ts`) or in `src/tests/validation/` for the cross-reference Swiss Eph suite.

**A good astrology test has:**
1. **Source of expected values** — either a reference chart name, a classical text verse, or (preferred) a Swiss Ephemeris output line
2. **Exact known inputs** — name, date (ISO 8601), time, city + lat/lng, timezone explicitly in the test name or body
3. **Tolerances** — use `toBeCloseTo(value, 4)` for longitude minutes, not `toEqual` exactly — 4 digits of decimal seconds precision is plenty for Lahiri

**Example:**
```ts
it('matches Swiss Ephemeris Moon longitude for Swami Vivekananda (1863-01-12 06:02:00 UTC+5:54)', () => {
  // Swiss Eph reference output: Moon = 352.4833333° (Meena Rashi 22°29')
  const result = calculateMoonLongitude({ year: 1863, month: 1, day: 12, hour: 6, minute: 2, tzOffset: 5.9 });
  expect(result).toBeCloseTo(352.4833, 2);
});
```

---

## 🔍 Code Review Expectations

Code review is **kind, fast, and constructive.** We follow these rules:

- **Review within 3 business days.** If it's been longer and you haven't heard, gently bump the PR thread.
- **Two approvals** preferred for engine-level changes; one approval OK for docs/UI/city-presets.
- **Assume competence.** If something is unclear, ask rather than assume it's wrong.
- **Nit-style** comments are prefixed `nit:` and are **non-blocking** — you can choose to fix or ignore them.
- **Blocking comments** start with `⛔` and must be resolved before merge.

---

## ❤️ Contributor Recognition

Every merged PR adds you to the **Contributors** page in spirit — and to the git history permanently. If this repo ever gets a CONTRIBUTORS.md file or an All-Contributors bot, you'll be added automatically for any merged PR (even a 1-character typo fix).

For contributors who land 3+ significant engine-rule PRs, we'll also add your name (with consent) to a "Jyotish Rule Reviewers" section in the README shout-outs.

---

## 🆘 Stuck? Need Help?

1. **Open a draft PR** with `[WIP]` at the start of the title and a comment explaining what's blocking you. We'll jump in.
2. **Tag** `@CRAJKUMARSINGH` in an issue or PR comment.
3. **Search the docs/ folder** — there are deep-dive spec docs for every weekly enhancement gate (WEEK1_VALIDATION_GUIDE, WEEK2_ENGINE_GAPS, etc.) that describe expected behavior in detail.

**Above all: be bold, be kind, and don't let perfection be the enemy of the good.** 🚀
