# Six-week strengthening plan

One theme per week. Every week ends with `main` deployable and the pre-push gate
green. If a week's theme is done by Wednesday, consolidate — do not start the
next theme early.

## Definition of done (every week)

`typecheck`, `typecheck:tests`, `docs:verify` green · no new `@ts-nocheck` ·
every new number in a tracked doc added to the claims corpus · every defect
logged with a `DEF-` id in app-robustness-testing.md · pre-push gate green.

## Weekly rituals

- Mon: pick the week's gate, write it in CREAT.md, one paragraph.
- Daily: push through the gate; never `--no-verify`.
- Fri: append to CREAT.md — what shipped, what slipped, what the gate proved.

---

## Week 15 — truth before reach

**Why:** the unverified layer is the only thing that can make the project wrong
rather than unfinished.

Deliverables: shadbala goldens against published tables · varga rule tests
(D4/D7/D20/D60) · `docs/accuracy/UNVERIFIED.md` · in-app verified/unverified badge.

Gate: every interpretive output is labelled verified or unverified; suite green
at `--hookTimeout=2000`.

Non-goals: no new features, no UI work, no reach.

## Week 16 — first hundred users

Deliverables: shareable chart permalink with no account · JSON-LD, sitemap, OG
images · /accuracy surfaced on the landing page · analytics key set in prod.

Gate: a stranger casts a chart from a shared link and the funnel is visible.

Non-goals: no new astrology modules.

## Week 17 — make the paper real

Deliverables: edge functions deploy from CI on main · `restore.sh` drill executed
and recorded · budget alarms and kill switch wired.

Gate: rollback drill run end to end; alarm fires on a forced breach.

Non-goals: no new observability tooling — use what's written.

## Week 18 — depth, or delete

Deliverables: ashtakavarga bindu goldens · KP promoted out of `@ts-nocheck` or
deleted · dasha-transit correlation goldens · prune preview routes that aren't
shipping.

Gate: zero `@ts-nocheck` under `src/`; accuracy corpus extended, never weakened.

Non-goals: no Jaimini, no Lal Kitab, no Nadi.

## Week 19 — survive a contributor

Deliverables: CODEOWNERS · good-first-issues · restructure docs into
`docs/{accuracy,ops,api,product}` · commitlint in CI · e2e, axe and lighthouse
on PR.

Gate: an outside PR passes CI with no maintainer help.

Non-goals: no refactor-for-taste.

## Week 20 — consolidate and tag

Deliverables: CHANGELOG built from CREAT.md · v2 tag · cost review · advisory
triage · delete what the six weeks proved unused.

Gate: tagged release; zero open high advisories; docs:verify green.

## Do not start

KP rewrite before ashtakavarga · React Native before permalinks · SOC2 evidence
collection before a real user.
