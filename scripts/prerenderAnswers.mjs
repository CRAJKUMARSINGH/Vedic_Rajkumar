#!/usr/bin/env node
/**
 * prerenderAnswers.mjs — static HTML at public/a/<slug>[.lang].html
 *
 * A pure transform of the ALREADY-EMITTED answer artifacts:
 *   public/answers/<slug>/_all.<lang>.json  ->  renderAnswerMarkdown  ->  public/a/<slug>[.<lang>].html
 *
 * Three guards, all structural:
 *   1. never touches the calculation engine
 *   2. reads as_of + languages from public/answers/index.json, never wall-clock
 *   3. re-renders the markdown and asserts it equals the on-disk _all.<lang>.md
 *      BEFORE writing — so a renderer change without a re-emit fails here rather
 *      than drifting silently (the 6634a07 lesson)
 *
 *   node scripts/prerenderAnswers.mjs          # write public/a/**
 *   node scripts/prerenderAnswers.mjs --check  # CI: fail on drift
 *
 * Why flat `.html` files: a crawler that does not run JS must find the bytes at
 * the URL. One redirect in `netlify.toml` maps `/a/:slug` onto
 * `/a/:slug.html` (and `/a/:slug.:lang` onto `/a/:slug.:lang.html`), ordered
 * above the `/*` SPA catch-all.
 *
 * Bilingual (contract 1.2, locale standing rule): one page per language. The
 * default locale is written at the un-suffixed path (`<slug>.html`) and every
 * page carries the full `hreflang` alternate set plus a matching `og:locale`.
 *
 * `public/a/**` is world-readable and is a NEW leak vector, so it gets its own
 * `assertNoPiiInHtml` tripwire below — the same standing order `assertNoPii`
 * enforces on `public/answers/**`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ANSWERS = join(ROOT, 'public', 'answers');
const OUT = join(ROOT, 'public', 'a');

const CHECK = process.argv.includes('--check');
/**
 * The canonical origin. Matches `src/components/SEO.tsx` and the `Sitemap:` line
 * already in `public/robots.txt` — one origin for canonical tags, the sitemap
 * and OG URLs, or the three disagree in a way crawlers punish.
 */
const SITE_URL = (
  process.env.SITE_URL ??
  process.env.VITE_SITE_URL ??
  'https://vedicrajkumar.com'
).replace(/\/$/, '');

const lf = s => s.replace(/\r\n/g, '\n');
const problems = [];
let drifted = 0;

/** The corpus router — languages, default locale and as_of all live here. */
const index = JSON.parse(readFileSync(join(ANSWERS, 'index.json'), 'utf8'));
const LANGS = Array.isArray(index.languages) && index.languages.length ? index.languages : ['hi'];
const DEFAULT_LANG = index.default_language ?? LANGS[0];

/** as_of lives in index.json — one date, one source. */
function readAsOf() {
  const walk = o => {
    if (typeof o === 'string') return /^\d{4}-\d{2}-\d{2}/.test(o) ? o.slice(0, 10) : null;
    if (o && typeof o === 'object') {
      for (const k of ['generated_at', 'as_of', 'computed_at']) {
        const hit = o[k] && walk(o[k]);
        if (hit) return hit;
      }
      for (const v of Object.values(o)) {
        const hit = walk(v);
        if (hit) return hit;
      }
    }
    return null;
  };
  const hit = walk(index);
  if (hit) return hit;
  const m = readFileSync(join(ANSWERS, 'index.json'), 'utf8').match(/\d{4}-\d{2}-\d{2}/);
  if (!m) throw new Error('could not determine as_of from public/answers/index.json');
  return m[0];
}

/** Subjects mirror the emitted set exactly — never re-derived from jataks. */
const subjects = () =>
  readdirSync(ANSWERS, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

/** `a/<slug>` for the default locale, `a/<slug>.<lang>` otherwise. */
const pageUrl = (slug, lang) =>
  lang === DEFAULT_LANG ? `${SITE_URL}/a/${slug}` : `${SITE_URL}/a/${slug}.${lang}`;
/** `a/<slug>.html` for the default locale, `a/<slug>.<lang>.html` otherwise. */
const pageFile = (slug, lang) =>
  lang === DEFAULT_LANG ? `${slug}.html` : `${slug}.${lang}.html`;

/**
 * The new surface is a new leak vector: no raw birth values may appear.
 *
 * Two deliberate relaxations from the sketch, because it would otherwise flag
 * this script's own output:
 *   1. `<script>`/`<style>` payloads are dropped before the text scan — the
 *      JSON-LD carries `datePublished`, which is a generation date, not birth
 *      data;
 *   2. the ONLY ISO date allowed in visible text is the card's own `as_of`. A
 *      leaked `dob` is a *different* ISO date, so "no ISO date in any visible
 *      page text" is still enforced for the case that criterion is about.
 *
 * Stated limitation, not papered over: `place` is deliberately NOT a token we
 * assert on because it is a real English word that appears in prose. A leaked
 * place *value* is caught only by the ISO-date check and by review. This is a
 * tripwire, not a proof.
 */
function assertNoPiiInHtml(rel, html, asOf) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  for (const iso of text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? []) {
    if (iso !== asOf) problems.push(`${rel}: ISO date "${iso}" in visible text (dob leak?)`);
  }
  for (const key of ['dob', 'tob', 'tz_defaulted']) {
    if (new RegExp(`\\b${key}\\b`).test(text)) problems.push(`${rel}: bare key "${key}" in visible text`);
  }
}

const asOf = readAsOf();
const slugs = subjects();

/**
 * The corpus router and the emitted directories must agree — a card added
 * without a re-emit would otherwise prerender a 404 farm.
 */
const indexSlugs = new Set((index.people ?? []).map(p => p.slug));
for (const slug of slugs) {
  if (!indexSlugs.has(slug)) problems.push(`${slug}: emitted directory is absent from index.json — run \`npm run answers:emit\``);
}
for (const slug of indexSlugs) {
  if (!slugs.includes(slug)) problems.push(`${slug}: in index.json but has no emitted directory`);
}

const server = await createServer({
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  cacheDir: join(ROOT, 'node_modules', '.vite-answers-html'),
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, preTransformRequests: false },
  resolve: { alias: { '@': resolvePath(ROOT, 'src') } },
});

function write(rel, content) {
  const path = join(OUT, rel);
  const next = content.endsWith('\n') ? content : `${content}\n`;
  if (existsSync(path) && readFileSync(path, 'utf8') === next) return;
  if (CHECK) {
    console.error(`DRIFT: public/a/${rel}`);
    drifted++;
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, next, 'utf8');
  console.log(`wrote public/a/${rel}`);
}

try {
  const { renderAnswerMarkdown } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardRender.ts'
  );
  const { renderAnswerHtml } = await server.ssrLoadModule(
    '/src/services/answerCard/answerCardHtml.ts'
  );

  const hub = [];
  const expected = new Set();

  for (const slug of slugs) {
    const alternates = Object.fromEntries(LANGS.map(l => [l, pageUrl(slug, l)]));

    for (const lang of LANGS) {
      const card = JSON.parse(readFileSync(join(ANSWERS, slug, `_all.${lang}.json`), 'utf8'));

      // GUARD 3 — regenerate and compare before writing anything.
      const markdown = renderAnswerMarkdown(card);
      const diskPath = join(ANSWERS, slug, `_all.${lang}.md`);
      const onDisk = existsSync(diskPath) ? lf(readFileSync(diskPath, 'utf8')).trim() : '';
      if (lf(markdown).trim() !== onDisk) {
        problems.push(
          `${slug}/_all.${lang}.md: renderAnswerMarkdown no longer matches — run \`npm run answers:emit\``
        );
      }

      const rel = pageFile(slug, lang);
      expected.add(rel);
      const html = renderAnswerHtml({ card, markdown, asOf, siteUrl: SITE_URL, alternates });
      assertNoPiiInHtml(rel, html, asOf);
      write(rel, html);
    }

    hub.push({ slug, name: JSON.parse(readFileSync(join(ANSWERS, slug, `_all.${DEFAULT_LANG}.json`), 'utf8')).subject.name });
  }

  /**
   * Assertion 4 — set equality between the emitted corpus and the prerendered
   * pages. This is what catches "added a card, forgot to prerender" (a 404
   * farm) and orphan pages whose subject was removed.
   */
  const actual = existsSync(OUT)
    ? readdirSync(OUT).filter(f => f.endsWith('.html') && f !== 'index.html')
    : [];
  for (const rel of expected) if (!actual.includes(rel)) problems.push(`public/a/${rel}: expected page is missing`);
  for (const rel of actual) if (!expected.has(rel)) problems.push(`public/a/${rel}: orphan page (no matching corpus entry)`);

  hub.sort((a, b) => a.slug.localeCompare(b.slug));
  const hubHtml = `<!doctype html>
<html lang="${DEFAULT_LANG}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Answer cards — Vedic Rajkumar</title>
<meta name="description" content="Verdict-only answer cards, generated from the same renderer as the served artifacts.">
<link rel="canonical" href="${SITE_URL}/a">
</head><body>
<h1>Answer cards</h1>
<p>Generated ${asOf}. Verdict-only: no birth data in these pages.</p>
<ul>
${hub.map(s => `  <li><a href="/a/${s.slug}">${s.name}</a></li>`).join('\n')}
</ul>
</body></html>
`;
  assertNoPiiInHtml('index.html', hubHtml, asOf);
  write('index.html', hubHtml);

  /**
   * Sitemap for the crawler surface, one `<url>` per (subject, language), each
   * carrying the full `xhtml:link` alternate set so the two language variants
   * are declared to be translations of one another rather than duplicates.
   */
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${hub
  .flatMap(s =>
    LANGS.map(lang => {
      const alts = [
        ...LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${pageUrl(s.slug, l)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(s.slug, DEFAULT_LANG)}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${pageUrl(s.slug, lang)}</loc>\n    <lastmod>${asOf}</lastmod>\n${alts}\n  </url>`;
    })
  )
  .join('\n')}
</urlset>
`;
  write('sitemap.xml', sitemap);
} finally {
  await server.close();
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
}
if (drifted > 0) console.error(`\n${drifted} file(s) out of date. Run: npm run answers:html`);
if (problems.length || (CHECK && drifted > 0)) process.exit(1);
console.log(`\n${slugs.length} subject(s) × ${LANGS.length} lang(s) ${CHECK ? 'verified' : 'prerendered'} (as_of ${asOf}).`);
