/**
 * answerCardRender.ts — the ONLY place card text becomes prose.
 *
 * Section 6 of the spec: no conditionals about content, so the UI, the emitted
 * `.md` and the parity test all read the same bytes. If a sentence appears in
 * the markdown, it came from the card.
 *
 * Locale standing rule (AGENTS.md): the card is bilingual (`direct_answer.hi`
 * *and* `.en`), but a rendered artifact is **single-language** — it renders the
 * prose of `card.query.language` only. That is what makes `<slug>/_all.en.md`
 * Devanagari-free and `<slug>/_all.hi.md` Hindi, and it is enforced by
 * `langParity.test.ts`. The JSON card keeps both languages so a reader never
 * loses data; only the rendered bytes are split by language.
 */

import { TOPIC_LABEL, type AnswerCard, type Lang } from './AnswerCard.types';

/** Section headings and fixed labels — every user-visible string, both langs. */
const SECTION: Record<string, { en: string; hi: string }> = {
  title: { en: 'Direct Answer', hi: 'सीधा उत्तर' },
  verdicts: { en: 'Verdicts', hi: 'निर्णय' },
  table: {
    en: 'Topic | Band | Score | Confidence | Window',
    hi: 'विषय | वर्ग | अंक | विश्वास | समय-सीमा',
  },
  why: { en: 'Why (how the app arrived here)', hi: 'क्यों (ऐप यहाँ कैसे पहुँचा)' },
  remedies: { en: 'Remedies', hi: 'उपाय' },
  caveats: { en: 'Caveats', hi: 'सावधानियाँ' },
  provenance: { en: 'Provenance', hi: 'स्रोत' },
  none: { en: 'none specified', hi: 'कोई नहीं' },
};

export function renderAnswerMarkdown(card: AnswerCard): string {
  const lang: Lang = card.query.language;
  const s = (key: keyof typeof SECTION) => SECTION[key][lang];
  const v = card.verdicts;
  const table = v
    .map(
      x =>
        `| ${TOPIC_LABEL[x.topic][lang]} | ${x.band} | ${x.score_0_100} | ${x.confidence_0_1} | ` +
        `${x.window ? `${x.window.from} → ${x.window.to}${x.window.approximate ? ' (approx.)' : ''}` : '—'} |`
    )
    .join('\n');

  return `# ${card.subject.name} — ${s('title')}
<!-- card_hash: ${card.provenance.card_hash} | lang: ${lang} | generated: ${card.provenance.computed_at} -->

${card.direct_answer[lang]}

## ${s('verdicts')}
| ${s('table')} |
|---|---|---|---|---|
${table}

## ${s('why')}
${v
  .map(
    x =>
      `### ${TOPIC_LABEL[x.topic][lang]}\n${x.rationale[lang]}\n${x.evidence
        .map(e => `- ${e.layer} (${e.score}/100): ${e.finding}`)
        .join('\n')}`
  )
  .join('\n\n')}

## ${s('remedies')}
${v.flatMap(x => x.remedies.map(r => `- ${r[lang]}`)).join('\n') || `- ${s('none')}`}

## ${s('caveats')}
${v.flatMap(x => x.caveats.map(c => `- ${c[lang]}`)).join('\n')}

## ${s('provenance')}
${card.provenance.ayanamsa} · ${card.provenance.dasha_system} · ${card.provenance.house_system} · engine ${card.provenance.engine_version} · as_of ${card.provenance.as_of} · input ${card.provenance.input_hash}
`;
}

export interface AnswerIndex {
  card_version: '1.0';
  generated_at: string;
  contract: string;
  /**
   * Contract 1.2 — additive. Reader-visible facts about the corpus's languages.
   * `default_language` names the locale served at the un-suffixed path.
   */
  contract_version: '1.2';
  languages: Lang[];
  default_language: Lang;
  template: {
    card: string;
    text: string;
    redirect: 'none';
  };
  people: Array<{
    name: string;
    aliases: string[];
    slug: string;
    topics: string[];
    card: string;
    text: string;
    /**
     * Per-language artifact paths. The default locale's entry is the same file
     * the un-suffixed `card`/`text` point at, so 1.1 readers are unaffected.
     */
    cards: Record<Lang, string>;
    texts: Record<Lang, string>;
  }>;
}

export function renderIndex(
  cards: AnswerCard[],
  generatedAt: string,
  languages: readonly Lang[] = ['hi', 'en'],
  defaultLang: Lang = 'hi'
): AnswerIndex {
  return {
    card_version: '1.0',
    generated_at: generatedAt,
    contract: 'Read the card, reply from direct_answer, do not recompute.',
    contract_version: '1.2',
    languages: [...languages],
    default_language: defaultLang,
    template: {
      card: '{slug}/_all.{lang}.json',
      text: '{slug}/_all.{lang}.md',
      redirect: 'none',
    },
    people: cards.map(c => {
      const cardsByLang = Object.fromEntries(
        languages.map(l => [l, `${c.subject.slug}/_all.${l}.json`])
      ) as Record<Lang, string>;
      const textsByLang = Object.fromEntries(
        languages.map(l => [l, `${c.subject.slug}/_all.${l}.md`])
      ) as Record<Lang, string>;
      return {
        name: c.subject.name,
        aliases: c.subject.aliases,
        slug: c.subject.slug,
        topics: c.query.topics,
        card: `${c.subject.slug}/_all.json`,
        text: `${c.subject.slug}/_all.md`,
        cards: cardsByLang,
        texts: textsByLang,
      };
    }),
  };
}
