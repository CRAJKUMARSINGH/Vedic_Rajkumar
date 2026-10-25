/**
 * answerCardRender.ts — the ONLY place card text becomes prose.
 *
 * Section 6 of the spec: no conditionals about content, so the UI, the emitted
 * `.md` and the parity test all read the same bytes. If a sentence appears in
 * the markdown, it came from the card.
 */

import { TOPIC_LABEL, type AnswerCard } from './AnswerCard.types';

export function renderAnswerMarkdown(card: AnswerCard): string {
  const v = card.verdicts;
  const table = v
    .map(
      x =>
        `| ${TOPIC_LABEL[x.topic].en} | ${x.band} | ${x.score_0_100} | ${x.confidence_0_1} | ` +
        `${x.window ? `${x.window.from} → ${x.window.to}${x.window.approximate ? ' (approx.)' : ''}` : '—'} |`
    )
    .join('\n');

  return `# ${card.subject.name} — Direct Answer
<!-- card_hash: ${card.provenance.card_hash} | generated: ${card.provenance.computed_at} -->

${card.direct_answer.hi}

${card.direct_answer.en}

## Verdicts
| Topic | Band | Score | Confidence | Window |
|---|---|---|---|---|
${table}

## Why (how the app arrived here)
${v
  .map(
    x =>
      `### ${TOPIC_LABEL[x.topic].en}\n${x.rationale.en}\n${x.evidence
        .map(e => `- ${e.layer} (${e.score}/100): ${e.finding}`)
        .join('\n')}`
  )
  .join('\n\n')}

## Remedies
${v.flatMap(x => x.remedies.map(r => `- ${r.hi} / ${r.en}`)).join('\n') || '- none specified'}

## Caveats
${v.flatMap(x => x.caveats.map(c => `- ${c.hi} / ${c.en}`)).join('\n')}

## Provenance
${card.provenance.ayanamsa} · ${card.provenance.dasha_system} · ${card.provenance.house_system} · engine ${card.provenance.engine_version} · as_of ${card.provenance.as_of} · input ${card.provenance.input_hash}
`;
}

export interface AnswerIndex {
  card_version: '1.0';
  generated_at: string;
  contract: string;
  people: Array<{
    name: string;
    aliases: string[];
    slug: string;
    topics: string[];
    card: string;
    text: string;
  }>;
}

export function renderIndex(cards: AnswerCard[], generatedAt: string): AnswerIndex {
  return {
    card_version: '1.0',
    generated_at: generatedAt,
    contract: 'Read the card, reply from direct_answer, do not recompute.',
    people: cards.map(c => ({
      name: c.subject.name,
      aliases: c.subject.aliases,
      slug: c.subject.slug,
      topics: c.query.topics,
      card: `${c.subject.slug}/_all.json`,
      text: `${c.subject.slug}/_all.md`,
    })),
  };
}
