# Vedic_Rajkumar Agent Rules

## Stack
- **Language**: TypeScript (strict mode)
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Backend/DB**: Supabase (auth, database, vectors)
- **Build System**: Turbo monorepo
- **Testing**: Vitest / Jest
- **Linting**: ESLint
- **Deployment**: Netlify

## Astrology Domain Rules
- Use **sidereal (Lahiri ayanamsa)** for all Vedic calculations — never tropical unless explicitly in a Western astrology context.
- Planetary positions must account for correct ayanamsa offset.
- Dasha calculations must use Vimshottari system by default.
- Ashtakavarga scores must follow classical Brihat Parashara Hora Shastra rules.
- Nakshatra lord sequences must follow: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury.
- Kundli Milan (compatibility) must use all 8 Ashta Koota factors (Varna, Vasya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) with correct weightings (total 36 points).
- Marriage prospect scoring should include ashtakavarga, navamsa analysis, and 7th house analysis.

## Code Quality
- Use TypeScript strictly — no `any` types without explicit justification in a comment.
- Follow existing component patterns in `src/components/`.
- Co-locate types in `src/types/` for shared interfaces.
- Services belong in `src/services/` — no direct Supabase calls from components.
- Utility/calculation logic goes in `src/utils/` or `src/lib/`.
- Hooks go in `src/hooks/`.

## Performance
- Prioritize mobile performance — target Lighthouse score > 90.
- Lazy-load heavy pages using React.lazy + Suspense.
- Heavy astrological computations should run in `src/workers/` (Web Workers).
- Avoid blocking the main thread with synchronous calculations.

## AI / RAG Features
- AI-powered insights use Supabase vector store where available.
- Streaming responses preferred over single-shot for long AI answers.
- All AI prompts must include relevant birth chart context before querying.

## Testing
- Write Vitest tests for all calculation utilities.
- Tests go in `src/tests/` or co-located `*.test.ts` files.
- Cover edge cases: leap years, southern hemisphere, time zone offsets, DST.

## Git Workflow
- Work on feature branches: `git checkout -b feature/<name>`.
- Never commit directly to `main`.
- Keep `.env` and secrets out of commits (already in `.gitignore`).

## Modules
- `Birth-Chart-Insights/` — standalone birth chart analysis module (pnpm workspace).
- `Marriage-Prospect-Finder/` — standalone kundli matching module (pnpm workspace).
- `src/` — main Vite/React application.
- `supabase/` — Supabase migrations and edge functions.
- `KNOWLEDGE_BASE/` — domain knowledge for RAG/AI context.
