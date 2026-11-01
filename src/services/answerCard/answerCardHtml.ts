/**
 * answerCardHtml.ts — an answer card as static HTML, for the crawlers that
 * don't run JS (which is most of the ones that matter for AEO).
 *
 * A pure transform of what is already served: the `markdown` input is
 * `renderAnswerMarkdown(card)`, the SAME string `public/answers/<slug>/_all.<lang>.md`
 * carries. Nothing here can disagree with the served artifact, because nothing
 * here decides anything.
 *
 * `marked` is already a dependency and the input is this repo's own renderer
 * output — not user HTML — so there is deliberately no sanitizer. Pulling in
 * `dompurify` plus a DOM shim to protect us from ourselves would be a new
 * dependency and a new failure mode.
 *
 * Bilingual (contract 1.2, locale standing rule): one page per language, each
 * with the full `hreflang` alternate set and matching `og:locale`. `<html lang>`
 * and the JSON-LD `inLanguage` follow the page's own language.
 *
 * The card is redacted (see `redact.ts`), so the page carries no birth data by
 * construction; the disclosure says that out loud rather than implying the page
 * was built from raw inputs.
 */

import { marked } from 'marked';
import { DEFAULT_LANG, LANGUAGES } from './AnswerCard.types';
import type { AnswerCard, Lang } from './AnswerCard.types';

export interface HtmlPageInput {
  /** Already redacted — `dob`/`tob`/`place` are absent, `birth_hash` is present. */
  card: AnswerCard;
  /** `renderAnswerMarkdown(card)` — the SAME string in `_all.<lang>.md`. */
  markdown: string;
  /** From `public/answers/index.json`, never the wall clock. */
  asOf: string;
  siteUrl: string;
  /** Absolute URL of each language's page, for canonical + hreflang. */
  alternates: Record<Lang, string>;
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** A JSON-LD block must not be able to close its own `<script>` tag. */
const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

/** `async: false` is the sync overload; the cast pins the return type. */
const toHtml = (markdown: string) => marked.parse(markdown, { gfm: true, async: false }) as string;

const OG_LOCALE: Record<Lang, string> = { hi: 'hi_IN', en: 'en_US' };

export function renderAnswerHtml({ card, markdown, asOf, siteUrl, alternates }: HtmlPageInput): string {
  const slug = card.subject.slug;
  const name = card.subject.name;
  const lang: Lang = card.query.language;
  const canonical = alternates[lang];
  const mdPath = `${siteUrl}/answers/${slug}/_all.${lang}.md`;
  const title = `${name} — Vedic Rajkumar`;
  const description =
    `${name}: verdict-only answer card (${lang}), generated from the same renderer as the ` +
    `served artifact. Birth data is not included in this page.`;

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: lang,
    datePublished: asOf,
    dateModified: asOf,
    mainEntityOfPage: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Vedic Rajkumar', url: siteUrl },
    about: card.query.topics.map(t => ({ '@type': 'Thing', name: t })),
  };

  const alternateLinks = LANGUAGES.map(
    l => `<link rel="alternate" hreflang="${l}" href="${esc(alternates[l])}">`
  ).join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${alternateLinks}
<link rel="alternate" hreflang="x-default" href="${esc(alternates[DEFAULT_LANG])}">
<link rel="alternate" type="text/markdown" href="${esc(mdPath)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="${OG_LOCALE[lang]}">
<meta property="og:locale:alternate" content="${OG_LOCALE[lang === 'hi' ? 'en' : 'hi']}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonLd(structured)}</script>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0 auto; max-width: 46rem; padding: 2rem 1.25rem 4rem;
         font: 16px/1.65 system-ui, "Noto Sans Devanagari", sans-serif; }
  header { border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
           padding-bottom: 1rem; margin-bottom: 1.5rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .35rem; }
  .meta { font-size: .8125rem; opacity: .7; }
  table { border-collapse: collapse; width: 100%; font-size: .9375rem; }
  th, td { border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
           padding: .4rem .55rem; text-align: left; }
  .disclosure { font-size: .8125rem; opacity: .7; margin-top: 2rem; }
  a { color: inherit; }
</style>
</head>
<body>
<header>
  <h1>${esc(name)}</h1>
  <p class="meta">verdict-only answer card · ${esc(lang)} · generated ${esc(asOf)} · <a href="${esc(mdPath)}">markdown source</a></p>
  <p class="meta">${LANGUAGES.map(
    l => `<a href="${esc(alternates[l])}" hreflang="${l}">${l}</a>`
  ).join(' · ')}</p>
</header>
<article id="card">
${toHtml(markdown)}
</article>
<p class="disclosure">
  This page is generated from the redacted card, so it carries no birth data —
  the date, time and place of birth live in the RLS-locked store and are served
  only to the owner through <code>/answer-cards</code>.
  <a href="${esc(siteUrl)}/horoscope">Cast your own chart</a>.
</p>
</body>
</html>
`;
}
