.PHONY: dev build build-dev test test-watch test-all lint lint-fix format format-check typecheck docker docker-down docker-logs clean install ci validate-ephemeris

# ── Development ──────────────────────────────────────────────────────────────
dev:
	npm run dev

# ── Build ─────────────────────────────────────────────────────────────────────
build:
	npm run build

build-dev:
	npm run build:dev

# ── Testing ───────────────────────────────────────────────────────────────────
test:
	npm run test

test-watch:
	npm run test:watch

# Run all tests including root node tests
test-all: test
	node tests/test-ephemeris-accuracy.js
	node tests/test-all-jataks.js
	@echo "✅ All tests passed"

# Validate Swiss Ephemeris accuracy
validate-ephemeris:
	node scripts/validate-ephemeris.js
	@echo "✅ Ephemeris accuracy validated"

# Post-build sanity check
check-build:
	node scripts/check-build.js

# ── Code Quality ──────────────────────────────────────────────────────────────
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

format-check:
	npm run format:check

typecheck:
	npm run typecheck

# ── Docker ────────────────────────────────────────────────────────────────────
docker:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# ── Utilities ─────────────────────────────────────────────────────────────────
clean:
	rm -rf dist node_modules/.vite

install:
	npm install

# ── CI pipeline (lint + typecheck + test-all + build + check-build) ───────────
ci: lint typecheck test-all build check-build
	@echo "✅ CI pipeline passed"

# ── Deploy (Vercel) ───────────────────────────────────────────────────────────
deploy:
	npx vercel --prod
