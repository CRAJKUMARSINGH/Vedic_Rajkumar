# ADR-001: 2026 SaaS Modernization Architecture

**Date**: April 2026  
**Status**: Active  
**Context**: Week 26+ of 100-week roadmap — Phase 2 Advanced Systems

---

## Decision

Incrementally modernize the Vedic Rajkumar platform from a Phase 1 React SPA into a production-grade SaaS, aligned with the 100-week mega plan.

## Key Decisions

### 1. React 19.2 + Vite 5
- Upgraded from React 18.3 → 19.2 (concurrent features, improved Suspense)
- All existing lazy-loaded routes preserved

### 2. TanStack Query v5 (already installed)
- Replaces manual `useState` + `useEffect` fetch patterns
- Centralized via `src/lib/api.ts` query key factory
- Cache invalidation strategy: per-user, per-report-type

### 3. Keep react-router-dom v6 (NOT migrating to TanStack Router)
- 40+ pages already use `Link`, `useLocation`, `BrowserRouter`
- Migration cost > benefit at this stage
- Revisit at Week 50+ when mobile app (React Native) is introduced

### 4. Framer Motion 12 for micro-interactions
- Shared variants in `src/lib/motion.ts`
- Respects `prefers-reduced-motion`
- Used for: page transitions, card entrances, planet glow pulses, bento tiles

### 5. 2025 Design Trends (CSS-first, no extra deps)
- **Glassmorphism**: `.glass-card` — backdrop-blur + rgba bg + subtle border
- **Neon accents**: CSS custom properties `--neon-magenta/cyan/gold/violet`
- **Bento grid**: `.bento-grid`, `.bento-span-2` utility classes
- **Neumorphism**: `.neu-card`, `.neu-inset` for buttons/inputs

### 6. Swiss Ephemeris (swisseph-wasm 0.0.5 installed)
- Currently using simplified JS algorithms (±2-3° accuracy)
- Migration to swisseph-wasm planned for Week 28-30
- Will improve to 99.99% accuracy (Swiss Ephemeris standard)

### 7. Folder structure
```
/src          — React app (unchanged)
/tests        — All test-*.js files (moved from root)
/scripts      — Build/deploy/validate scripts
/docs         — Architecture decisions, migration notes
/supabase     — Migrations (already existed)
```

## Consequences

- Build passes: ✅ 0 TypeScript errors
- Tests pass: ✅ 203/203 Vitest + 18/18 ephemeris + 85/85 jataks
- No breaking changes to existing features
- Design tokens available globally via CSS custom properties
- Framer Motion variants importable from `@/lib/motion`
- API layer importable from `@/lib/api`
