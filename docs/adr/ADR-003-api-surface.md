# ADR-003 — The public API surface is `supabase/functions/v1`

**Date:** 2026-10-29 · **Status:** Accepted

## Context

`src/api/v1/` contains a Hono router, zod schemas, scopes, idempotency handling and
a zod-to-openapi generator. `hono` is a production dependency.
`docs/API_MONETIZATION_STRATEGY.md`, `docs/api/openapi.yaml` and `packages/sdk-ts/`
all describe a public API.

There was no edge function mounting any of it. The monetization story had no server.

Two ways out: delete `src/api/v1`, or mount it.

## Decision

Mount it, at `supabase/functions/v1/index.ts`, reusing the existing router
unchanged. Add `supabase/functions/deno.json` with an import map and a
`viteEnvShim.ts` so Vite-authored modules run under Deno.

## Why not delete

The router is the most monetizable asset in the repo and the SDK already targets it.
Deleting means rewriting the same thing later.

## Why not re-implement on the edge

Re-implementing means two routers, which is the exact failure this dose removes.

## Consequences and accepted limitations

1. **The mounted API runs as `anon`.** `edgeClient.ts` is a module singleton using
   the anon key, so it inherits anon RLS. Per-request RLS-as-caller requires the
   router to accept an injected client — a follow-up, tracked here.
2. **`import.meta.env` is shimmed, not native.** Works because the shim is imported
   first. Any new module that reads env at import time _before_ the shim in the
   graph must respect that ordering.
3. **`docs/api/openapi.yaml` is generated** from `src/api/v1/openapi.ts`. The
   hand-written spec is retired; `openapi:emit` owns the file.
4. `deno.json` in `supabase/functions/` now also governs lint/format for the edge
   tree — expect a one-time `deno fmt` diff.
