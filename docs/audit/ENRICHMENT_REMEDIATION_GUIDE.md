i took multiple audit observation from experts for my enterprise grade proposed project >>>>>https://github.com/CRAJKUMARSINGH/Vedic_Rajkumar >>>>guide for bug removal and enrichmeny>>>ur guide shud be in markdown file appliable

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AUDIT REMEDIATION & ENRICHMENT GUIDE

Project: CRAJKUMARSINGH/Vedic_Rajkumar
Version: 1.0 · Owner: Repo maintainer · Status: Active
Purpose: Convert external expert audit observations into closed, verifiable fixes, then raise the project from "working" to "enterprise-auditable" and finally to "genuinely valuable." 0. How To Use This Guide

    Never start at Section 3. Start at Section 2 — you need a safety net before you touch code, or you'll introduce regressions while fixing audit findings.
    Map every expert observation into the worksheet in Appendix A. One row per observation. An observation with no row is an observation you will forget.
    Fix in severity order, not in reviewer order. Reviewers report in the order they noticed things; that is rarely risk order.
    Every fix ships with a regression test. A fix without a test is a fix that will silently revert in three months.
    "Verified when" is the acceptance criterion. If you can't state how you'd prove it fixed, you haven't understood the finding.

Both search tools were rate-limited, so I've written this as a **stack-agnostic, audit-driven remediation framework** that maps onto whatever your expert reviewers flagged. Drop it in as `docs/AUDIT_REMEDIATION_GUIDE.md` and work it top-to-bottom — every section has a copy-pasteable artefact and an explicit "verified when" condition so nothing stays ambiguous.

---

# AUDIT REMEDIATION & ENRICHMENT GUIDE

**Project:** `CRAJKUMARSINGH/Vedic_Rajkumar`
**Version:** 1.0 · **Owner:** Repo maintainer · **Status:** Active
**Purpose:** Convert external expert audit observations into closed, verifiable fixes, then raise the project from "working" to "enterprise-auditable" and finally to "genuinely valuable."

---

## 0. How To Use This Guide

1. **Never start at Section 3.** Start at Section 2 — you need a safety net before you touch code, or you'll introduce regressions while fixing audit findings.
2. **Map every expert observation into the worksheet in Appendix A.** One row per observation. An observation with no row is an observation you will forget.
3. **Fix in severity order, not in reviewer order.** Reviewers report in the order they noticed things; that is rarely risk order.
4. **Every fix ships with a regression test.** A fix without a test is a fix that will silently revert in three months.
5. **"Verified when" is the acceptance criterion.** If you can't state how you'd prove it fixed, you haven't understood the finding.

### Findings → Section Map

| If the audit said…                                           | Go to        |
| ------------------------------------------------------------ | ------------ |
| "committed secrets", "API keys in repo", ".env pushed"       | §4           |
| "outdated deps", "no lockfile", "CVE-xxxx in dependency"     | §5           |
| "no CI", "no linting", "no tests run on PR"                  | §6, §10, §13 |
| "SQL injection", "missing authz", "IDOR", "CORS wildcard"    | §7           |
| "spaghetti", "god class", "no layering", "duplication"       | §8           |
| "no migrations", "N+1 queries", "no indexes", "schema drift" | §9           |
| "no error handling", "bare except", "print debugging"        | §8.5         |
| "slow", "no caching", "no pagination"                        | §11          |
| "no logging/metrics/tracing", "can't debug prod"             | §12          |
| "no Dockerfile best practice", "runs as root", "no rollback" | §13          |
| "calculation wrong", "timezone bugs", "ephemeris mismatch"   | §14          |
| "no README/license/docs", "unclear purpose"                  | §15          |
| "needs more features / business value"                       | §16          |
| "not enterprise ready"                                       | §17          |

---

## 1. Severity Model & SLAs

| Sev               | Definition                                                                                          | Fix SLA   | Release gate        |
| ----------------- | --------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| **S0 – Critical** | Leaked live secret, RCE, auth bypass, data loss, wrong financial/legal output                       | 24–72 h   | Blocks all releases |
| **S1 – High**     | Injection, broken access control, missing tests on core path, PII exposure, crash under normal load | 1–2 weeks | Blocks next minor   |
| **S2 – Medium**   | Missing validation, weak observability, performance regression, doc gaps                            | 1 sprint  | Tracked, scheduled  |
| **S3 – Low**      | Style, naming, minor duplication, cosmetic UX                                                       | Backlog   | Best-effort         |

**Rule:** any S0/S1 gets a linked issue _and_ a failing test _before_ the fix commit.

---

## 2. Phase 0 — Safety Net (do this first, in one sitting)

```bash
# 1. Baseline: record current state so "fixed" is provable
git checkout -b hardening/baseline
git tag pre-audit-$(date +%Y%m%d)
git log --oneline > docs/audit/baseline_commits.txt

# 2. Freeze non-essential feature work on main
# 3. Turn on branch protection: require PR, 1 review, passing CI, no force-push
# 4. Create the triage issue + worksheet (Appendix A)
```

**Deliverables of Phase 0**

- [ ] `docs/audit/AUDIT_WORKSHEET.md` created and populated with **all** expert observations
- [ ] Baseline tag pushed
- [ ] Branch protection enabled on `main`
- [ ] `.gitignore` corrected _before_ any secret purge (§4)
- [ ] CI exists at least in "report-only" mode so you have a before/after metric

---

## 3. Repository & Governance Hygiene

**Goal:** a stranger can clone, run, and trust the repo in under 10 minutes.

**Files that must exist:**

| File                               | Purpose                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `README.md`                        | What it is, why it matters, 60-second quickstart, screenshot/demo, architecture diagram, license badge        |
| `LICENSE`                          | Pick one. Enterprise + permissive → `Apache-2.0`. Copyleft → `AGPL-3.0`. **No license = not legally usable.** |
| `CONTRIBUTING.md`                  | Setup, branch naming, commit convention, PR checklist, Definition of Done                                     |
| `CODE_OF_CONDUCT.md`               | Contributor Covenant v2.1                                                                                     |
| `SECURITY.md`                      | How to report vulns, supported versions, disclosure window, contact                                           |
| `CHANGELOG.md`                     | Keep-a-Changelog format, driven by Conventional Commits                                                       |
| `.github/CODEOWNERS`               | Mandatory reviewers per path                                                                                  |
| `.github/ISSUE_TEMPLATE/*`         | bug, feature, audit-finding                                                                                   |
| `.github/pull_request_template.md` | Links issue, lists tests run, rollback plan                                                                   |
| `docs/adr/0001-*.md`               | Architecture Decision Records — **this is the single highest-value doc for expert credibility**               |

**Conventions to enforce**

- Conventional Commits (`feat:`, `fix:`, `chore:`, `perf:`, `docs:`, `refactor:`, `test:`)
- Semantic Versioning; tag releases; auto-generate release notes
- Trunk-based development with short-lived branches (`feat/x`, `fix/y`)
- Squash-merge only; linear history

```gitattributes
# .gitattributes
* text=auto eol=lf
*.png binary
*.pdf binary
*.ipynb -diff
```

**Verified when:** a fresh clone passes `make setup && make test` with zero manual steps, and every governance file above is present and non-boilerplate.

---

## 4. Secrets & Credential Remediation

This is usually the #1 audit finding and the one that actually costs money.

**Step 1 — Detect**

```bash
pipx run detect-secrets scan --all-files > .secrets.baseline
pipx run gitleaks detect --source . --report-format json --report-path gitleaks.json
# Also scan history, not just HEAD:
pipx run trufflehog git file://. --only-verified
```

**Step 2 — Purge from history** (only if a secret was live)

```bash
pipx run git-filter-repo --path .env --invert-paths
# or, for a value buried in code:
pipx run git-filter-repo --replace-text replacements.txt
git push --force --tags   # coordinate with collaborators
```

> After a purge, **every collaborator must re-clone.** Force-push alone leaves their local history broken.

**Step 3 — Rotate.** Purge ≠ rotate. Any secret that touched the remote must be rotated at the provider. Log rotation date in `docs/audit/rotation_log.md`.

**Step 4 — Prevent**

```gitignore
# .gitignore — minimum viable
.env
.env.*
!.env.example
*.pem
*.key
*.p12
.venv/
__pycache__/
node_modules/
dist/
build/
*.log
.DS_Store
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/
```

**Step 5 — Standardise config**

```python
# app/config.py — 12-factor, fail-fast, typed
from functools import lru_cache
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="forbid")

    app_env: str = Field(default="local")
    database_url: str
    jwt_secret: SecretStr
    jwt_issuer: str = "vedic-rajkumar"
    jwt_audience: str = "vedic-rajkumar-api"
    cors_origins: list[str] = []
    log_level: str = "INFO"

    @property
    def is_prod(self) -> bool:
        return self.app_env == "prod"

@lru_cache
def get_settings() -> Settings:
    return Settings()   # raises on missing required vars at import time
```

**Rule:** no `os.getenv()` scattered through the codebase. One typed settings object. `extra="forbid"` catches typos that silently become `None`.

**Verified when:** `detect-secrets scan` is clean, pre-commit blocks new secrets, `.env.example` documents every key, and rotation log exists.

---

## 5. Dependency & Supply Chain Hardening

```bash
# Python
pip-audit --strict --requirement requirements.txt
pip install pip-tools && pip-compile --generate-hashes -o requirements.txt requirements.in
# Node
npm audit --audit-level=high && npm ci --ignore-scripts
# Containers / IaC / SBOM
trivy fs --scanners vuln,misconfig,secret .
syft dir:. -o spdx-json > sbom.spdx.json
```

**Practices**

- **Pin everything.** `requirements.txt` with hashes, `package-lock.json` committed, Docker base images by digest (`python:3.12-slim@sha256:…`).
- **Separate direct from transitive** deps (`requirements.in` vs compiled output).
- **Automate updates:** Dependabot or Renovate, grouped, weekly, auto-merge patch-only after CI passes.
- **Generate an SBOM per release** and attach it to the GitHub Release.
- **Add provenance** — build in CI, sign artefacts with Sigstore/cosign, publish attestations (`actions/attest-build-provenance`).
- **Remove unused deps.** Every dependency is attack surface and audit liability. Run `deptry` (Python) / `depcheck` (JS).

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: pip
    directory: "/"
    schedule: { interval: weekly, day: monday }
    open-pull-requests-limit: 10
    groups:
      minor-and-patch: { patterns: ["*"], update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
  - package-ecosystem: docker
    directory: "/"
    schedule: { interval: weekly }
```

**Verified when:** CI fails on any `high`/`critical` advisory, lockfiles are committed, SBOM is attached to the latest release.

---

## 6. Static Analysis & Quality Gates

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E","F","W","I","N","UP","B","C4","SIM","ARG","PTH","RUF","S","BLE","T20","ANN"]
ignore = ["ANN101","ANN102"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101","ANN"]

[tool.mypy]
python_version = "3.12"
strict = true
warn_unreachable = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
addopts = "-q --strict-markers --cov=app --cov-report=term-missing --cov-fail-under=85"
testpaths = ["tests"]
markers = ["slow", "integration", "golden"]

[tool.coverage.report]
exclude_lines = ["pragma: no cover", "if TYPE_CHECKING:", "raise NotImplementedError"]
```

```yaml
# .pre-commit-config.yaml — cheap checks locally, so CI is not the first line of defence
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      [
        trailing-whitespace,
        end-of-file-fixer,
        check-yaml,
        check-added-large-files,
        check-merge-conflict,
        detect-private-key,
        mixed-line-ending,
      ]
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.7.0
    hooks: [{ id: ruff, args: [--fix] }, { id: ruff-format }]
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.13.0
    hooks: [{ id: mypy, additional_dependencies: [pydantic, types-requests] }]
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.10
    hooks: [{ id: bandit, args: ["-c", "pyproject.toml", "-r", "app"] }]
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks: [{ id: detect-secrets, args: ["--baseline", ".secrets.baseline"] }]
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.0
    hooks: [{ id: gitleaks }]
```

```yaml
# .github/workflows/ci.yml — the gate that makes everything else enforceable
name: CI
on:
  pull_request:
  push: { branches: [main] }
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }
permissions: { contents: read }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements-dev.txt
      - run: ruff check . && ruff format --check .
      - run: mypy app
      - run: bandit -r app -c pyproject.toml
      - run: pytest --cov --cov-fail-under=85 --cov-report=xml
      - uses: codecov/codecov-action@v4

  sast:
    runs-on: ubuntu-latest
    permissions: { contents: read, security-events: write }
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: python }
      - uses: github/codeql-action/analyze@v3
      - uses: returntocorp/semgrep-action@v1
        with: { config: p/python p/owasp-top-ten p/secrets }

  supply-chain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip-audit --strict
      - run: docker build -t app:${{ github.sha }} .
      - run: trivy image --severity HIGH,CRITICAL --exit-code 1 app:${{ github.sha }}
      - run: syft dir:. -o spdx-json > sbom.spdx.json
      - uses: actions/upload-artifact@v4
        with: { name: sbom, path: sbom.spdx.json }

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
```

**Gate policy:** `quality` and `secret-scan` are required for merge. `sast`/`supply-chain` start as non-blocking, become required after the S2 backlog is cleared.

**Verified when:** PRs cannot merge with a lint error, a type error, a coverage drop, or a leaked secret — and this is proven by a deliberately-broken test PR.

---

## 7. Application Security Controls

| Control                | Implementation                                                                                   | Verification test                         |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| **Password storage**   | Argon2id via `argon2-cffi`, tuned params                                                         | hash differs per call, verify round-trips |
| **JWT validation**     | Explicit `algorithms=["RS256"]`, check `iss`, `aud`, `exp`, `nbf`, `jti`                         | forged `alg:none` token rejected          |
| **Authorization**      | Central `require_permission(user, action, resource)` — never `if user.id == obj.owner_id` inline | cross-tenant access returns 404/403       |
| **Input validation**   | Pydantic models at every boundary; `extra="forbid"`                                              | fuzz payloads with Hypothesis             |
| **Output encoding**    | Templates autoescape on; JSON serializer strict                                                  | XSS payload in name renders inert         |
| **SQL**                | Parameterised queries only; no f-string SQL                                                      | `' OR 1=1 --` in every field              |
| **CORS**               | Explicit origin allowlist, no `*` with credentials                                               | preflight from evil.com rejected          |
| **Security headers**   | HSTS, CSP (nonce-based), X-Content-Type-Options, Referrer-Policy, Permissions-Policy             | `securityheaders.com` grade A             |
| **Rate limiting**      | Token bucket per IP + per API key, `429` with `Retry-After`                                      | k6 burst test stays under threshold       |
| **CSRF**               | Double-submit cookie for cookie-auth flows                                                       | forged POST rejected                      |
| **File upload**        | Magic-byte sniff, size cap, extension allowlist, store outside webroot, random name              | upload `.php` renamed `.png`              |
| **SSRF**               | Allowlist outbound hosts, block link-local/metadata IPs                                          | `http://169.254.169.254`                  |
| **Secrets in transit** | TLS 1.2+, HSTS preload                                                                           | `testssl.sh`                              |
| **Errors**             | Never leak stack traces in prod; correlation ID returned to client                               | force 500, inspect body                   |

```python
# app/security/passwords.py
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_ph = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)

def hash_password(raw: str) -> str:
    return _ph.hash(raw)

def verify_password(raw: str, hashed: str) -> bool:
    try:
        _ph.verify(hashed, raw)
        return True
    except VerifyMismatchError:
        return False
```

```python
# app/middleware/request_context.py — correlation IDs make every audit finding traceable
import uuid, contextvars
from starlette.middleware.base import BaseHTTPMiddleware

request_id: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        token = request_id.set(rid)
        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = rid
            return response
        finally:
            request_id.reset(token)
```

**Verified when:** OWASP ZAP baseline scan against a running instance reports zero High findings, and the authz test suite covers every endpoint.

---

## 8. Architecture & Code Quality Remediation

### 8.1 Layering (fix the "spaghetti" finding)

```
src/app/
├── domain/          # pure logic + entities. No I/O, no framework imports.
├── application/     # use cases / services. Orchestrates domain + ports.
├── infrastructure/  # DB, HTTP clients, queues, LLM providers — adapters.
├── interfaces/      # FastAPI routers, CLI, workers. Thin. No business logic.
└── config.py
```

**Dependency rule:** arrows point inward only. `domain` imports nothing from the app. Enforce mechanically:

```bash
pip install import-linter
# contracts in pyproject.toml: domain may not import infrastructure, etc.
lint-imports
```

A router handler should be ≤ 15 lines: validate → call use case → serialise.

### 8.2 Named smells → named fixes

| Smell                                   | Fix                                                  |
| --------------------------------------- | ---------------------------------------------------- |
| God class / 800-line module             | Extract cohesive services; one reason to change each |
| Duplicated validation                   | Single Pydantic schema reused                        |
| Magic numbers (`if ayanamsa == 3`)      | Enum + `StrEnum` with explicit values                |
| Deep nesting (4+ levels)                | Guard clauses / early returns                        |
| Long parameter lists                    | Dataclass / Pydantic params object                   |
| Boolean params (`calc(x, True, False)`) | Keyword-only args or enum                            |
| Feature envy                            | Move method to the data it envies                    |
| Dead code                               | `vulture`, `ruff F401`, `ts-prune`                   |
| Copy-pasted error handling              | Decorator / context manager                          |

### 8.3 Complexity budget

```toml
[tool.ruff.lint.mccabe]
max-complexity = 10
```

Anything above 10 → decompose, don't suppress. `radon cc -s -a app/` for a complexity report; track the trend in CI.

### 8.4 Dead code & duplication

```bash
pipx run vulture app tests --min-confidence 80
pipx run pylint --disable=all --enable=duplicate-code app
```

### 8.5 Error handling (fix "bare except" and "silent failure")

```python
# app/errors.py — one taxonomy, mapped to HTTP once, at the edge
class AppError(Exception):
    status = 500
    code = "internal_error"
    def __init__(self, message: str, *, details: dict | None = None):
        super().__init__(message)
        self.message, self.details = message, details or {}

class NotFound(AppError):     status, code = 404, "not_found"
class Conflict(AppError):     status, code = 409, "conflict"
class InvalidInput(AppError): status, code = 422, "invalid_input"
class UpstreamFailure(AppError): status, code = 502, "upstream_failure"
```

```python
# app/interfaces/errors.py — single handler, structured body, no stack leak
@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError):
    logger.warning("app_error", extra={"code": exc.code, "path": request.url.path,
                                      "rid": request_id.get()})
    return JSONResponse(
        status_code=exc.status,
        content={"error": exc.code, "message": exc.message,
                 "details": exc.details, "request_id": request_id.get()},
    )
```

**Banned:** `except: pass`, `except Exception` without logging, `try/except` wrapping 50 lines, exceptions used for control flow in hot paths.

**Verified when:** grep for `except:` returns zero, every caught exception is logged with a request ID, and there is exactly one place mapping errors to HTTP.

---

## 9. Data Layer

- **Migrations only.** No `create_all()` in prod. Alembic, one migration per schema change, autogenerated then **reviewed**.
- **Every migration has a tested downgrade.** CI runs upgrade → downgrade → upgrade on a scratch DB.
- **Expand/contract pattern** for zero-downtime: add nullable column → backfill → dual-write → switch reads → drop old.
- **Indexes** derived from actual query plans, not guesses: `EXPLAIN ANALYZE` on every query the audit flagged as slow. Add composite indexes matching `WHERE`+`ORDER BY` order.
- **N+1:** use `selectinload`/`joinedload`; assert query counts in tests with `sqlalchemy` event listeners.
- **Constraints in the DB, not just the app:** `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`. The app is not the last line of defence.
- **Transactions:** explicit boundaries at the use-case layer; short; no I/O inside a transaction.
- **Pooling:** `pool_size`, `max_overflow`, `pool_pre_ping=True`, `pool_recycle`.
- **Multi-tenancy:** `tenant_id` on every table + Postgres RLS as a backstop against a forgotten `WHERE`.
- **Soft delete + audit columns:** `created_at`, `updated_at`, `deleted_at`, `created_by` on all mutable tables.
- **PII inventory:** `docs/data/pii_inventory.md` — column, classification, retention, lawful basis.
- **Backups:** automated, encrypted, and **restore-tested monthly** (a backup you've never restored isn't a backup).

```python
# tests/test_query_budget.py — catches N+1 regressions automatically
def test_list_charts_uses_bounded_queries(db_session, query_counter):
    with query_counter() as count:
        ChartService(db_session).list_for_user(user_id=1, limit=50)
    assert count.value <= 3, f"N+1 detected: {count.value} queries"
```

**Verified when:** `alembic upgrade head && alembic downgrade -1 && alembic upgrade head` passes on a fresh DB, and every endpoint has a query-count assertion.

---

## 10. Testing Strategy

**Pyramid targets:** 70% unit · 20% integration · 10% end-to-end/golden.

| Layer             | Tool                           | Requirement                                          |
| ----------------- | ------------------------------ | ---------------------------------------------------- |
| Unit              | `pytest`, `hypothesis`         | Pure domain logic, no I/O, <100 ms per test          |
| Integration       | `pytest`, `testcontainers`     | Real Postgres/Redis in Docker, migrations applied    |
| Contract          | `schemathesis` against OpenAPI | Every endpoint, property-checked                     |
| Golden/regression | File fixtures                  | Numerical outputs compared to frozen reference files |
| Mutation          | `mutmut` / `cosmic-ray`        | Score ≥ 60% — proves tests actually assert           |
| Load              | `k6` / `locust`                | p95 under target at 2× expected peak                 |
| Fuzz              | `atheris` / `hypothesis`       | No unhandled exception on arbitrary input            |
| E2E               | Playwright                     | Critical user journeys only                          |

```python
# Property-based test — far better than examples for computational code
from hypothesis import given, strategies as st

@given(st.floats(min_value=-1_000_000, max_value=1_000_000, allow_nan=False),
       st.floats(min_value=-1_000_000, max_value=1_000_000, allow_nan=False))
def test_longitude_normalised(lon):
    result = normalise_longitude(lon)
    assert 0 <= result < 360
    assert result == pytest.approx(lon % 360)
```

**Test hygiene rules**

- Deterministic: freeze time (`freezegun`), fix random seeds, no network in unit tests.
- Fast: full unit suite under 30 s; mark slow tests and run them in a separate CI job.
- Readable: arrange/act/assert, one behaviour per test, names describe behaviour not method.
- No shared mutable fixtures; function-scoped by default, session-scoped only for containers.
- Coverage gates: 85% overall, **95% on `domain/`** — that's where correctness lives.

**Verified when:** mutation score ≥ 60%, coverage gate enforced in CI, and a fresh contributor can run `make test` successfully first try.

---

## 11. Performance & Scalability

1. **Measure before optimising.** `py-spy record`, `cProfile`, `EXPLAIN ANALYZE`, Lighthouse. Write the numbers into the audit worksheet.
2. **Cache with a strategy, not reflexively:** key naming, TTL, invalidation trigger, stampede protection (`lock` or `single-flight`).
3. **Paginate everything.** Cursor-based for large/ordered sets, never `LIMIT`-less endpoints.
4. **Async I/O for I/O-bound work**; process pool for CPU-bound (ephemeris math is CPU-heavy — keep it out of the event loop).
5. **Queue long jobs.** Anything >2 s goes to a worker with a job ID and a status endpoint.
6. **Backpressure:** bounded queues, concurrency limits on outbound calls, `429` rather than collapse.
7. **Timeouts everywhere:** DB, HTTP, LLM calls. A missing timeout is a future outage.
8. **Compression + CDN** for static assets; cache headers with content hashing.
9. **Define SLOs** and track error budget: e.g. p95 latency < 300 ms, availability 99.9%, error rate < 0.5%.

```javascript
// tests/load/baseline.js — k6
import http from "k6/http";
import { check, sleep } from "k6";
export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300", "p(99)<800"],
    http_req_failed: ["rate<0.005"],
  },
};
export default function () {
  const res = http.get(`${__ENV.BASE_URL}/health/ready`);
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(0.1);
}
```

**Verified when:** k6 thresholds pass at 2× expected peak, and a profiler report is committed to `docs/perf/`.

---

## 12. Observability & Reliability

```python
# app/observability/logging.py — JSON logs, one line per event, always correlated
import logging, json, sys
from app.middleware.request_context import request_id

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id.get(),
        }
        for key in ("user_id", "tenant_id", "duration_ms", "status", "path", "code"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)

def configure_logging(level: str = "INFO") -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
```

**The three pillars**

- **Logs** — structured, correlated, PII-redacted, levels used correctly (ERROR = paged human, WARN = attention, INFO = narrative, DEBUG = off in prod).
- **Metrics** — RED per endpoint (Rate, Errors, Duration) + USE per resource (Utilisation, Saturation, Errors). Business metrics too: calculations/day, active users, failure rate by calculation type.
- **Traces** — OpenTelemetry auto-instrumentation; `trace_id` propagated across HTTP, DB, queue, and any external API.

**Reliability mechanics**

- `/health/live` (process up) vs `/health/ready` (dependencies reachable) — different semantics, both present.
- Graceful shutdown: stop accepting, drain in-flight, close pools (`SIGTERM` handler).
- Circuit breaker + retry with jittered exponential backoff on outbound calls.
- Runbooks: `docs/runbooks/*.md` — symptom → diagnosis → action → rollback, one page each.
- Alert on symptoms (SLO burn) not causes (CPU 80%).
- Blameless postmortems in `docs/postmortems/`, each producing at least one new test or alert.

**Verified when:** you can trace a single request end-to-end by request ID across logs and traces, and the dashboard shows p50/p95/p99 + error rate + saturation.

---

## 13. CI/CD, Containers & Release Engineering

```dockerfile
# Dockerfile — multi-stage, non-root, minimal, cache-friendly
FROM python:3.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN groupadd -r app && useradd -r -g app -d /app app
COPY --from=builder /install /usr/local
WORKDIR /app
COPY --chown=app:app app ./app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health/live').status==200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**Pipeline stages:** `lint → typecheck → unit → integration → build → scan → sbom → sign → deploy-staging → smoke → deploy-prod (canary) → verify → promote/rollback`

**Release rules**

- Immutable artefacts; build once, promote the same image through environments.
- Migrations run as a separate step _before_ app rollout, and must be backward-compatible.
- Canary 5% → 25% → 100% with automated rollback on SLO burn.
- Every deploy tagged; `CHANGELOG.md` generated; release notes attached to the GitHub Release.
- Feature flags for anything risky; a flag is dead code with a deadline — schedule its removal.
- Environments: `local`, `ci`, `staging` (prod-like), `prod`. No debugging on prod.

**Verified when:** you can deploy, detect a bad release via metrics, and roll back in under 5 minutes — and you've rehearsed it.

---

## 14. Domain Correctness — Vedic Computational Engine

This is where a generic auditor's advice will be weakest and where the real bugs hide. Treat it as a first-class subsystem.

**14.1 Ephemeris & astronomy**

- Use a real ephemeris (Swiss Ephemeris / JPL DE440) rather than truncated series, or clearly document the accuracy envelope of whatever you use.
- Make the ephemeris source, version, and data files **explicit and pinned**; record them in the output for reproducibility.
- Cross-validate against an independent source on a fixed set of dates; store as golden files.
- State ΔT model and its version — pre-1900 and future dates diverge quickly.
- Sidereal vs tropical: make the **ayanamsa** an explicit, required enum (Lahiri/Chitrapaksha, Raman, KP, True Chitra, Yukteshwar). Never default silently.
- Document precision limits: arcsecond rounding, planetary aberration, nutation, topocentric vs geocentric.

**14.2 Time handling — the single biggest bug source**

- Store all instants as UTC; convert with IANA zones via `zoneinfo`, never fixed offsets.
- **Historical timezones matter:** India had multiple zones and local mean time before standardisation (IST adopted 1906; Calcutta/Bombay/Madras local times before that). A birth in 1890 must not be computed with `+05:30`.
- Handle DST for non-Indian data, and the ambiguous/nonexistent local times it creates.
- Convert calendar dates → Julian Day with a single well-tested function; test the Julian/Gregorian switchover (1582) and leap-year edge cases (1700, 1800, 1900 not leap; 2000 leap).
- Test the midnight boundary, month/year rollover, and negative years (BCE).

```python
# tests/test_time_edge_cases.py
import pytest
from datetime import datetime
from zoneinfo import ZoneInfo
from app.domain.time import to_utc, to_julian_day

@pytest.mark.parametrize("local,zone,expected_utc", [
    ("1900-01-01T00:00", "Asia/Kolkata", "1899-12-31T18:21:10"),  # LMT-era offset, not +05:30
    ("1947-08-15T00:00", "Asia/Kolkata", "1947-08-14T18:30:00"),
    ("2024-03-31T02:30", "Europe/London", "2024-03-31T01:30:00"),  # DST gap
])
def test_local_to_utc(local, zone, expected_utc):
    got = to_utc(datetime.fromisoformat(local), ZoneInfo(zone))
    assert got.isoformat() == expected_utc
```

**14.3 Calendar & panchanga logic**

- Cover all five limbs explicitly: tithi, nakshatra, yoga, karana, vara — each with its own invariant tests.
- Invariants are testable: tithi ∈ [1,30]; nakshatra ∈ [1,27]; a tithi's arc length = 12° of Moon−Sun elongation; karana count per lunar month = 60; every vara has exactly one sunrise-to-sunrise span.
- Support **both** Amanta and Purnimanta month systems as a configurable choice — results differ and users will notice.
- Regional variation (Tamil, Bengali, Malayali, Odiya rules; Kollavarsham; Vikram Samvat; Shaka Samvat) → separate strategy classes, not nested `if`s.
- Sunset/sunrise and moonrise: define the horizon (geometric vs apparent), refraction, and elevation. Document the choice.
- Adhika/masa and kshaya handling needs dedicated tests — these are the classic silent-failure areas.

**14.4 Text, language, transliteration**

- Canonicalise Sanskrit/Devanagari input; normalise Unicode (NFC), strip zero-width joiners, handle combining marks.
- Round-trip test transliteration: Devanagari ↔ IAST ↔ ITRANS ↔ Harvard-Kyoto. A round trip that doesn't return the original is a bug.
- Store both the native script and a searchable ASCII form.
- Don't rely on regex over Devanagari without testing matras and conjuncts.
- i18n: externalise all strings; support `en`, `hi`, `sa`, and add RTL-ready layout if you add Urdu/Persian.

**14.5 Determinism & reproducibility**

- Same inputs + same version + same ephemeris ⇒ bit-identical output. Assert it.
- Version the calculation engine separately from the app (`ENGINE_VERSION`) and stamp it on every result.
- Publish an accuracy/validation report in `docs/domain/validation.md` with the reference sources and mean/max deviation.

**Verified when:** golden-file suite passes across ≥ 200 reference charts spanning 1800–2100, timezone edge tests pass, transliteration round-trips are lossless, and `docs/domain/validation.md` publishes measured deviation.

---

## 15. Documentation, Licensing & Compliance

**Docs set (minimum for expert credibility):**

```
docs/
├── architecture/overview.md      + C4/context diagram (Mermaid)
├── adr/                          + 0001-record-architecture-decisions.md
├── api/openapi.json              + generated reference
├── domain/validation.md          accuracy + sources
├── data/pii_inventory.md
├── runbooks/
├── postmortems/
├── perf/
└── audit/AUDIT_WORKSHEET.md
```

- README gets: one-paragraph "what & why", a demo GIF, quickstart, architecture diagram, feature table, accuracy statement, citation block.
- API: OpenAPI 3.1 generated from code, served at `/docs`, contract-tested with `schemathesis`.
- Architecture diagrams as Mermaid so they live in git and diff cleanly.

**Licensing & legal**

- Explicit `LICENSE` file (recommend Apache-2.0 for enterprise adoption: patent grant + permissive).
- `NOTICE` / `THIRD_PARTY_LICENSES.md` generated by `pip-licenses` / `license-checker`. Watch for GPL contamination.
- Swiss Ephemeris has its own licence terms — **read and document them**; it is dual-licensed (AGPL / commercial). This is a real audit finding for any commercial fork.
- Add `CITATION.cff` — matters for a scholarly-adjacent project.
- Compliance: if personal data (birth data is PII, and can reveal belief) is stored — GDPR/DPDP Act 2023 obligations: lawful basis, purpose limitation, retention schedule, export, deletion, breach notification. Add a `/me/export` and `/me/delete` endpoint with tests.
- Accessibility: WCAG 2.2 AA — semantic HTML, keyboard nav, focus visible, contrast ≥ 4.5:1, labels, `aria-live` for async results. Lighthouse a11y ≥ 95.

**Verified when:** license and third-party notices exist, PII inventory is complete, export/delete endpoints are tested, a11y audit passes.

---

## 16. Enrichment Roadmap (raise value, not just quality)

**Tier 1 — Depth (2–4 weeks)**

1. **Public HTTP API + OpenAPI** with API keys, quotas, and usage metering.
2. **Python + TypeScript SDKs** generated from the OpenAPI spec.
3. **Batch mode** — CSV in, CSV out, for bulk chart generation.
4. **Webhook callbacks** for long-running jobs.
5. **Deterministic JSON output schema** with `ENGINE_VERSION` and full input echo — makes downstream diffing possible.

**Tier 2 — Intelligence (4–8 weeks)** 6. **Narrative layer** on top of raw positions: house-wise and dasha-wise interpretation, template-driven, versioned, testable. 7. **Timeline/transit engine**: dasha periods, gochara, sade-sati windows as queryable intervals. 8. **Chart rendering**: North/South Indian, Bengali, and Western-style SVG — deterministic, snapshot-tested. 9. **Comparison & rectification tools** (birth-time rectification via event matching). 10. **Uncertainty handling**: when birth time is approximate, return sensitivity bands rather than one false-precision answer. This is a genuine differentiator.

**Tier 3 — Platform (8–16 weeks)** 11. **Multi-tenant SaaS**: orgs, seats, roles, SSO (OIDC/SAML), audit log. 12. **Billing**: Stripe or Razorpay, usage-based tiers, idempotent webhooks, dunning. 13. **Admin console**: tenant management, quota overrides, feature flags, support impersonation with audit trail. 14. **Plugin system** for custom rulesets (regional panchanga, custom ayanamsa) with a stable interface. 15. **Data import**: GEDCOM-style family records, existing chart JSON, third-party formats. 16. **Offline/PWA** front end with a service worker and IndexedDB caching of computed charts. 17. **Public validation harness**: anyone can submit a date and compare against a reference — turns accuracy claims into evidence.

**Tier 4 — If there's an LLM/agent component** 18. **Prompt-injection defence**: treat retrieved text as untrusted; delimit and quote it; never let retrieved text trigger tools blindly. 19. **Tool sandboxing**: allowlist tools, validate arguments, cap iterations and token spend. 20. **Eval harness**: fixed Q/A set with expected outputs, run on every prompt/model change; report regression scores. 21. **Model version pinning + fallback**, per-request cost accounting, and PII redaction before any external call. 22. **Grounded citations**: every interpretive claim links to the computation that produced it.

---

## 17. Enterprise Readiness Checklist

| Area          | Requirement                                                    | Status |
| ------------- | -------------------------------------------------------------- | ------ |
| Licence       | Explicit, OSI-approved, third-party notices                    | ☐      |
| Secrets       | None in history, rotated, scanned in CI                        | ☐      |
| CI/CD         | Required gates, signed artefacts, <5 min rollback              | ☐      |
| Security      | ZAP clean, authz tests on every endpoint, headers A-grade      | ☐      |
| Quality       | ruff + mypy strict, complexity ≤ 10, coverage ≥ 85%            | ☐      |
| Testing       | Unit/integration/golden/mutation ≥ 60%/load thresholds pass    | ☐      |
| Data          | Migrations reversible, backups restore-tested, PII inventoried | ☐      |
| Observability | JSON logs + metrics + traces, SLOs, alerting, runbooks         | ☐      |
| Reliability   | Health probes, graceful shutdown, timeouts, circuit breakers   | ☐      |
| Domain        | Golden validation, tz edge cases, published accuracy report    | ☐      |
| Docs          | README, ADRs, OpenAPI, runbooks, onboarding                    | ☐      |
| Compliance    | GDPR/DPDP export+delete, retention, breach process             | ☐      |
| Accessibility | WCAG 2.2 AA, Lighthouse a11y ≥ 95                              | ☐      |
| Ops           | On-call rotation, incident process, postmortems                | ☐      |
| Governance    | CODEOWNERS, branch protection, release process, versioning     | ☐      |

---

## 18. 30 / 60 / 90 Day Execution Plan

**Days 1–30 — Stop the bleeding**

- Phase 0 safety net; worksheet complete; severities assigned
- Secrets purged + rotated; `.gitignore` + pre-commit live
- CI in report-only, then required for lint/type/test/secret-scan
- All S0 closed; S1 scheduled with owners and dates
- LICENSE, SECURITY.md, CONTRIBUTING.md, CODEOWNERS added
- Coverage from whatever it is → 60%

**Days 31–60 — Make it auditable**

- Coverage ≥ 85% overall / 95% domain; mutation testing introduced
- Layering enforced by import-linter; error taxonomy in place; complexity gate
- Alembic migration baseline; query-budget tests; indexes from EXPLAIN
- JSON logging + OTel + SLO dashboards + first runbook
- Dependency scanning blocking; SBOM per release; Dockerfile hardened
- Golden-file domain validation suite (≥ 100 reference charts); tz edge tests
- All S1 closed; S2 halved

**Days 61–90 — Make it valuable**

- Public API + OpenAPI + SDKs; batch mode; webhooks
- Perf baseline with k6 committed; p95 targets met
- Docs site (MkDocs/Docusaurus) + ADRs + architecture diagrams
- Compliance: PII inventory, export/delete

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
