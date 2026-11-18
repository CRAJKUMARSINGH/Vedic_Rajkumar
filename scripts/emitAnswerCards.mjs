#!/usr/bin/env node
/**
 * emitAnswerCards.mjs — write the precomputed Answer Layer.
 *
 *   node scripts/emitAnswerCards.mjs            # write public/answers/**
 *   node scripts/emitAnswerCards.mjs --check    # CI: fail (exit 1) on drift
 *   node scripts/emitAnswerCards.mjs --as-of=2026-10-24
 *   node scripts/emitAnswerCards.mjs --langs=hi,en   # default: hi,en
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
 * BILINGUAL (locale standing rule, AGENTS.md). Every artifact is emitted per
 * language as `<slug>/_all.<lang>.{json,md}` (and per topic). The default
 * locale is also copied to the un-suffixed path (`_all.json` / `_all.md`), so a
 * 1.1 link in the wild never breaks. Redaction is locale-independent and the
 * emit asserts that: the same birth must hash the same in every language.
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
/** `--langs=hi,en`; when absent, the shared `LANGUAGES` constant decides. */
const langsArg = process.argv.find(a => a.startsWith('--langs='))?.split('=')[1];

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
 * Push the full (unredacted) cards to the private `answer_cards` table — one
 * row per (slug, lang).
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
        lang: c.query.language,
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

let indexCards = [];
try {
  const { allJataks } = await server.ssrLoadModule('/src/lib/jataks/resolveJatak.ts');
  const { buildAnswerCard, DEFAULT_ASK } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardBuilder.ts'
  );
  const { renderAnswerMarkdown, renderIndex } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardRender.ts'
  );
  const { redactAnswerCard } = await server.ssrLoadModule('/src/services/answerCard/redact.ts');
  const { ALL_TOPICS, LANGUAGES, DEFAULT_LANG } = await server.ssrLoadModule(
    '/src/services/answerCard/AnswerCard.types.ts'
  );

  // Resolve the two shared contracts the emitter must not own a copy of.
  // `--as-of` still wins, so an explicit re-date is possible.
  const { ANSWER_CARD_AS_OF } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardAsOf.ts'
  );
  AS_OF = asOfArg ?? ANSWER_CARD_AS_OF;
  ({ assertNoPii } = await server.ssrLoadModule('/src/services/answerCard/publishGuard.ts'));

  const LANGS = langsArg
    ? langsArg.split(',').map(s => s.trim()).filter(Boolean)
    : [...LANGUAGES];
  if (!LANGS.includes(DEFAULT_LANG)) {
    throw new Error(`--langs must include the default locale (${DEFAULT_LANG}); got ${LANGS.join(',')}`);
  }
  const fullCards = [];

  for (const jatak of allJataks()) {
    const perLang = {};
    for (const lang of LANGS) {
      const card = buildAnswerCard(jatak, DEFAULT_ASK, [...ALL_TOPICS], lang, AS_OF);
      fullCards.push(card);
      const pub = redactAnswerCard(card, 'public');
      write(join(card.subject.slug, `_all.${lang}.json`), JSON.stringify(pub, null, 2), card.subject);
      write(join(card.subject.slug, `_all.${lang}.md`), renderAnswerMarkdown(pub), card.subject);

      const singles = {};
      for (const topic of ALL_TOPICS) {
        const single = buildAnswerCard(jatak, DEFAULT_ASK, [topic], lang, AS_OF);
        const singlePub = redactAnswerCard(single, 'public');
        singles[topic] = singlePub;
        write(join(card.subject.slug, `${topic}.${lang}.json`), JSON.stringify(singlePub, null, 2), card.subject);
        write(join(card.subject.slug, `${topic}.${lang}.md`), renderAnswerMarkdown(singlePub), card.subject);
      }
      perLang[lang] = { pub, singles };
    }

    // Locale-independent redaction: the same birth must hash the same in both.
    const hashes = new Set(LANGS.map(l => perLang[l].pub.subject.birth_hash));
    if (hashes.size !== 1) {
      throw new Error(
        `${perLang[DEFAULT_LANG].pub.subject.slug}: birth_hash differs across languages (${[...hashes].join(', ')})`
      );
    }

    // Un-suffixed paths stay valid = default locale. No link in the wild breaks.
    const dflt = perLang[DEFAULT_LANG];
    const slug = dflt.pub.subject.slug;
    write(join(slug, '_all.json'), JSON.stringify(dflt.pub, null, 2), dflt.pub.subject);
    write(join(slug, '_all.md'), renderAnswerMarkdown(dflt.pub), dflt.pub.subject);
    for (const topic of ALL_TOPICS) {
      write(join(slug, `${topic}.json`), JSON.stringify(dflt.singles[topic], null, 2), dflt.pub.subject);
      write(join(slug, `${topic}.md`), renderAnswerMarkdown(dflt.singles[topic]), dflt.pub.subject);
    }

    indexCards.push(dflt.pub);
  }

  write(
    'index.json',
    JSON.stringify(renderIndex(indexCards, `${AS_OF}T00:00:00.000Z`, LANGS, DEFAULT_LANG), null, 2),
    {}
  );
  await upsertFullCards(fullCards);
} finally {
  await server.close();
}

if (CHECK && drifted > 0) {
  console.error(`\n${drifted} file(s) out of date. Run: npm run answers:emit`);
  process.exit(1);
}
console.log(`\n${indexCards.length} cards ${CHECK ? 'verified' : 'emitted'} (as_of ${AS_OF}).`);
