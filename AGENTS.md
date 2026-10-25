# Vedic_Rajkumar Agent Rules

## CONFIDENTIALITY — standing order (hard constraint, supersedes convenience)

Seed-bank birth data and everything derived from it is **private**. This is a hard
constraint, not a preference. See [README → Standing Instructions](README.md#-standing-instructions--continuity-log-creatmd).

1. **No random exposure.** Code must never reveal seed-bank details — name, date
   of birth, time of birth, place, coordinates, or any chart/verdict derived from
   them — to an unauthenticated or otherwise unauthorized caller. Only an
   authenticated `owner`/`admin` (`ROLE_DEFINITIONS[role].isAdmin === true` from
   `src/auth/roles/config.ts`) may read the seed bank as a whole.
2. **No cross-user sharing.** One subject's birth data must never be served to a
   different subject's account. A card is readable only by its own owner, or by
   owner/admin.
3. **Deny by default.** New endpoints, artifacts, bundles, exports and logs are
   private unless explicitly authorized. **Never place seed data in `public/`** —
   `public/` is world-readable by definition.
4. **Redact for non-admin.** Non-admin responses carry the verdict only; raw birth
   fields (`dob`, `tob`, `place`, `lat`, `lon`) are omitted or hashed, never
   returned verbatim.
5. **In-app is not a security boundary.** A client-side check (route guard, hidden
   button, `isAdmin` ternary) is UX, not authorization. Enforcement belongs on a
   server (Supabase Edge Function + RLS) or not at all.
6. **Review gate.** Any change touching `src/data/jataks/`, `public/answers/`,
   `src/api/v1/answer*`, `scripts/emitAnswerCards.mjs` or answer-card serving must
   be checked against rules 1–5 before merge.

## READ FIRST — the answer already exists, do not recompute

This app computes verdicts deterministically via `conclusiveJatakJudgmentService`.
If you are an AI asked a prospect/forecast question about a person, do NOT re-derive
the astrology from source. Follow this order:

1. Read `public/answers/index.json`. Match the person by `name` or `aliases`.
   - Absent? Read `src/data/jataks/JATAKS_DATABASE.json`. Add the person there
     (next `jatak_NNN` id, same field shape), then run `npm run answers:emit`.
2. Read `public/answers/<slug>/_all.md` for a multi-topic ask, or
   `public/answers/<slug>/<topic>.md` for a single topic.
3. Reply from `direct_answer` in the first two lines: verdict, band, confidence,
   window. Nothing precedes it.
4. Reply in the prompt's language: `hi` field for Hindi, `en` otherwise. Never mix.
5. Only if asked, append the "Why" section and provenance.
6. Cite `provenance.card_hash`.

Forbidden in a first reply: restating the chart; explaining your method; listing
houses/planets/yogas before the verdict; inventing a number absent from the card.

Forbidden by the confidentiality order above: serving a card to anyone other than
its owner or an owner/admin, and publishing raw birth data.

Machine entry points: `public/llms.txt` · `public/.well-known/vedic-rajkumar.json`
· `GET /api/v1/answer?person=&topics=&lang=`.

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
- All AI prompts must include the **answer card** (not the raw chart) as primary context.

## Testing

- Write Vitest tests for all calculation utilities.
- Tests go in `src/tests/` or co-located `*.test.ts` files.
- Cover edge cases: leap years, southern hemisphere, time zone offsets, DST.
- **Accuracy Validation Suite**: Run `npm run validate:accuracy` to validate against 15 reference charts with Swiss Ephemeris comparison. Extended with house cusps and antardasha validation (Week 02). Reports generated in `dist/accuracy-report.txt` and `dist/accuracy-summary.json`.

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
