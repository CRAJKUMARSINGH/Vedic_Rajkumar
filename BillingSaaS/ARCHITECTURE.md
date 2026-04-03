# BillingSaaS — Consolidated Architecture
## Based on ROLE.txt — Principal Architect Spec

**Mission**: Consolidate all `bill*` subfolders from `New-Folder.git` into one modern SaaS.

**Pipeline**: Excel/Hybrid/Unstructured Input → Editable Workflow → Auto Calculation → Final Print Editing → PDF/HTML Output

---

## Target Folder Structure

```
BillingSaaS/
├── frontend/          # React 19 + TanStack Router + shadcn/ui
├── backend/           # FastAPI + Pydantic v2
├── worker/            # ARQ async job queue
├── engine/            # Document Workflow Engine
├── tests/             # All test suites
├── docker/            # Multi-stage Dockerfiles
├── scripts/           # make dev/build/test/worker/docker
├── configs/           # Unified env, lint, format configs
└── docs/              # Architecture diagrams, ADRs, migration notes
```

---

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Backup & Baseline Testing | ⏳ Waiting for repo access |
| 1 | Global Architecture Audit | ⏳ Waiting for repo access |
| 2 | Target Architecture Design | ✅ Designed (this doc) |
| 3 | Input Ingestion Unification | ⏳ Pending |
| 4 | Document Workflow Engine | ⏳ Pending |
| 5 | Frontend Modernization | ⏳ Pending |
| 6 | Auto Calculation Engine | ⏳ Pending |
| 7 | FastAPI Backend Scaling | ⏳ Pending |
| 8 | Performance Layer | ⏳ Pending |
| 9 | Robotic Test Loop | ⏳ Pending |
| 10 | Dev Experience | ⏳ Pending |
| 11 | Productionization | ⏳ Pending |

---

## Input Modes

| Mode | Input | Engine |
|------|-------|--------|
| 1 | Structured Excel | openpyxl / pandas parser |
| 2 | Hybrid (Excel + Images + Text) | OCR + Excel parser |
| 3 | Fully Unstructured (Images/PDFs/Notes) | OCR + LLM extraction |

---

## Document States

```
UPLOADED → PARSED → INPUT_EDITED → CALCULATED → FINAL_EDITED → PRINT_READY → EXPORTED
```

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 19 + TanStack Router | Type-safe routing, streaming-ready |
| UI | shadcn/ui + Tailwind | Consistent, accessible |
| State | TanStack Query v5 | Server state, caching |
| Backend | FastAPI + Pydantic v2 | Async, type-safe, fast |
| Job Queue | ARQ (async Redis Queue) | Async-native, simpler than Celery |
| Database | PostgreSQL + Redis | Relational + cache/queue |
| PDF | WeasyPrint or Playwright | HTML→PDF with CSS support |
| OCR | Tesseract + pytesseract | Open source, accurate |
| Deploy | Docker Compose + Caddy | Auto-HTTPS, horizontal scale |

---

## Design System (2026)

- Dark mode first
- Glassmorphism 2.0 cards
- Bento Grid dashboards
- Post-Neumorphism soft depth
- Tactile micro-interactions (Framer Motion)

---

## Next Action

Provide correct repo URL or push `bill*` folders here.
Then: Phase 0 → clone → baseline test → Phase 1 audit.
