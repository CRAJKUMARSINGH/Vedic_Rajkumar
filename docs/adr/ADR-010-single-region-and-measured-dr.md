# ADR-010 — Single region (ap-south-1) with a measured restore drill

**Date:** 2026-11-04 · **Status:** Accepted

## Context

The repo claimed 30-day rolling backups. Nobody had restored one. RTO and RPO
were not numbers. Separately, "multi-region" is a phrase that sounds like a
requirement but is expensive and has no customer attached.

## Decision

1. Stay single-region in `ap-south-1` (Mumbai) — latency to the primary market,
   and India residency is simpler to evidence than US + SCCs.
2. Make RTO/RPO **measured numbers** via a monthly automated restore drill.
3. Add `reopen_erasure_after_restore()` so a restore does not silently break
   GDPR Art 17 — the trap dose 7 opened.
4. Defer multi-region until a named trigger fires (ADR's "Revisit when").

## Why not multi-region now

- Supabase read replicas are plan-dependent, and a replica is not a failover
  strategy without routing.
- Two regions means two of everything: secrets, edge deploys, monitoring, cost,
  and a much larger "which region is truth?" surface.
- The failure we can actually hit today is a bad migration or accidental delete,
  and a **restore** covers that. A second region does not.

## Consequences

**Good:** DR becomes provable rather than asserted. Cost stays flat. The erasure
trap is closed and asserted by the drill.

**Bad / accepted:** a full region outage is a 2–4 h manual recovery. PITR to an
arbitrary second is plan-dependent. Storage and Auth are outside the dump scope
and are named as gaps rather than implied as covered.

## Revisit when

An enterprise contract states an availability SLA we cannot meet single-region,
or a second market has a residency requirement, or measured latency from a
served region exceeds budget.
