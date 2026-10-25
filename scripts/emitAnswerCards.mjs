#!/usr/bin/env node
/**
 * emitAnswerCards.mjs — write the precomputed Answer Layer.
 *
 *   node scripts/emitAnswerCards.mjs            # write public/answers/**
 *   node scripts/emitAnswerCards.mjs --check    # CI: fail (exit 1) on drift
 *   node scripts/emitAnswerCards.mjs --as-of=2026-10-24
 *
 * CONFIDENTIALITY (AGENTS.md). `public/answers/**` is world-readable, so what
 * lands there is a **verdict-only** card: every raw birth field is stripped by
 * `src/services/answerCard/redact.ts` and replaced with `birth_hash`. The full
 * cards are pushed to the private `answer_cards` table (Supabase, RLS-locked)
 * where only the subject's own account or an owner/admin can read them — see
 * `supabase/functions/answer-cards/index.ts`. Full cards are never written to
 * disk. `assertNoPii()` is a hard guard on the write boundary: if a birth field
 * ever reaches a public file the emit fails instead of publishing it.
 *
 * Why `.mjs` + Vite SSR instead of `tsx`: the card builder is TypeScript with
 * `@/` path aliases, and the card chain is deep (builder → adapter → nine
 * calculation services). Vite's SSR module runner resolves those aliases with
 * the repo's own config — the same proven path `publish-accuracy.mjs` uses —
 * so no extra toolchain (`tsx`) has to be fetched from the network in CI.
 *
 * `public/answers/**` is mandatory: Vite only copies `publicDir` into `dist`.
 *
 * Determinism: `as-of` defaults to the pinned `ANSWER_CARD_AS_OF` constant
 * (`src/services/answerCard/answerCardAsOf.ts`), never the wall clock, so the
 * card, its hash and the transit layers are byte-stable with or without
 * `--as-of` — which is what makes `--check` a real gate on any day.
 * `generated_at` and `provenance.computed_at` are derived from `as-of`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'answers');

const CHECK = process.argv.includes('--check');
const asOfArg = process.argv.find(a => a.startsWith('--as-of='))?.split('=')[1];

let drifted = 0;

/**
 * Pinned `as_of` — resolved from `src/services/answerCard/answerCardAsOf.ts`,
 * the same constant `parity.test.ts` reads, so the emitter, the parity guard and
 * Netlify's `npm run answers:emit` can never disagree. `--as-of` overrides it.
 * Never the wall clock (see the header comment).
 */
let AS_OF = asOfArg;
/** Hard write-boundary guard, loaded from the shared, unit-tested module. */
let assertNoPii;

function write(rel, content, subject) {
  assertNoPii(rel, content, subject);
  const path = join(OUT, rel);
  const next = content.endsWith('\n') ? content : `${content}\n`;
  if (existsSync(path) && readFileSync(path, 'utf8') === next) return;
  if (CHECK) {
    console.error(`DRIFT: ${path.slice(ROOT.length + 1)}`);
    drifted++;
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next, 'utf8');
  console.log(`wrote ${path.slice(ROOT.length + 1)}`);
}

/**
 * Push the full (unredacted) cards to the private `answer_cards` table.
 * Skipped in `--check` and when no service credentials are configured, so the
 * emit stays offline-deterministic in CI. Full cards exist only here and in
 * Postgres — never on disk.
 */
async function upsertFullCards(cards) {
  if (CHECK) return;
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('note: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY unset — full cards not synced to the private store.');
    return;
  }
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/answer_cards`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(
      cards.map(c => ({
        slug: c.subject.slug,
        subject_name: c.subject.name,
        jatak_id: c.subject.jatak_id,
        card: c,
        updated_at: `${AS_OF}T00:00:00.000Z`,
      }))
    ),
  });
  if (!res.ok) {
    throw new Error(`answer_cards upsert failed: ${res.status} ${await res.text()}`);
  }
  console.log(`synced ${cards.length} full card(s) to the private answer_cards store.`);
}

const server = await createServer({
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  cacheDir: join(ROOT, 'node_modules', '.vite-answers-emit'),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, preTransformRequests: false },
  resolve: { alias: { '@': resolvePath(ROOT, 'src') } },
});

let cards = [];
try {
  const { allJataks } = await server.ssrLoadModule('/src/lib/jataks/resolveJatak.ts');
  const { buildAnswerCard, DEFAULT_ASK } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardBuilder.ts'
  );
  const { renderAnswerMarkdown, renderIndex } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardRender.ts'
  );
  const { redactAnswerCard } = await server.ssrLoadModule('/src/services/answerCard/redact.ts');
  const { ALL_TOPICS } = await server.ssrLoadModule('/src/services/answerCard/AnswerCard.types.ts');

  // Resolve the two shared contracts the emitter must not own a copy of.
  // `--as-of` still wins, so an explicit re-date is possible.
  const { ANSWER_CARD_AS_OF } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardAsOf.ts'
  );
  AS_OF = asOfArg ?? ANSWER_CARD_AS_OF;
  ({ assertNoPii } = await server.ssrLoadModule('/src/services/answerCard/publishGuard.ts'));

  for (const jatak of allJataks()) {
    const card = buildAnswerCard(jatak, DEFAULT_ASK, [...ALL_TOPICS], 'hi', AS_OF);
    cards.push(card);
    // Public surface: verdict only.
    const pub = redactAnswerCard(card, 'public');
    write(join(card.subject.slug, '_all.json'), JSON.stringify(pub, null, 2), card.subject);
    write(join(card.subject.slug, '_all.md'), renderAnswerMarkdown(pub), card.subject);
    for (const topic of ALL_TOPICS) {
      const single = buildAnswerCard(jatak, DEFAULT_ASK, [topic], 'hi', AS_OF);
      const singlePub = redactAnswerCard(single, 'public');
      write(join(card.subject.slug, `${topic}.json`), JSON.stringify(singlePub, null, 2), card.subject);
      write(join(card.subject.slug, `${topic}.md`), renderAnswerMarkdown(singlePub), card.subject);
    }
  }

  write('index.json', JSON.stringify(renderIndex(cards, `${AS_OF}T00:00:00.000Z`), null, 2), {});
  await upsertFullCards(cards);
} finally {
  await server.close();
}

if (CHECK && drifted > 0) {
  console.error(`\n${drifted} file(s) out of date. Run: npm run answers:emit`);
  process.exit(1);
}
console.log(`\n${cards.length} cards ${CHECK ? 'verified' : 'emitted'} (as_of ${AS_OF}).`);
