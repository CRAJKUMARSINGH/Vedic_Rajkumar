# Maintainers

| Person          | Areas                                            | Since   |
| --------------- | ------------------------------------------------ | ------- |
| @CRAJKUMARSINGH | all (Core · Data · Security · Accuracy · Growth) | 2026-08 |

Bus factor is currently **1**. Roles and merge authority are defined in
[GOVERNANCE.md](GOVERNANCE.md); the target bus factor on `main` push, the
Supabase/Stripe dashboards, the domain registrar and the Sentry/PostHog projects
is **2**. [docs/ops/ACCESS_INVENTORY.md](docs/ops/ACCESS_INVENTORY.md) records
who holds what and how to recover it.

## Open gap — a second maintainer for the accuracy/engine area

Recruiting a second maintainer for the accuracy/ephemeris area is an open roadmap
item. Until it is filled, the continuity rule in
[GOVERNANCE.md](GOVERNANCE.md#continuity) applies: if the maintainer is
unreachable for 30 days, the most recent committer gains merge rights.
