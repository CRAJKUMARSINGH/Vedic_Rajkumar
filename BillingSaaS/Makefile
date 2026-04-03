.PHONY: dev build test worker docker docker-down lint typecheck

# ── Development ───────────────────────────────────────────────────────────────
dev:
	docker compose -f docker/docker-compose.dev.yml up

# ── Build ─────────────────────────────────────────────────────────────────────
build:
	docker compose -f docker/docker-compose.yml build

# ── Testing ───────────────────────────────────────────────────────────────────
test:
	cd frontend && npm test
	cd backend && python -m pytest tests/ -v

# ── Worker ────────────────────────────────────────────────────────────────────
worker:
	cd backend && python -m arq worker.WorkerSettings

# ── Docker ────────────────────────────────────────────────────────────────────
docker:
	docker compose -f docker/docker-compose.yml up --build -d

docker-down:
	docker compose -f docker/docker-compose.yml down

# ── Code Quality ──────────────────────────────────────────────────────────────
lint:
	cd frontend && npm run lint
	cd backend && ruff check .

typecheck:
	cd frontend && npm run typecheck
	cd backend && mypy .

# ── CI ────────────────────────────────────────────────────────────────────────
ci: lint typecheck test build
	@echo "✅ CI passed"
