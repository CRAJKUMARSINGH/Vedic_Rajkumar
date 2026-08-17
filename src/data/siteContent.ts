import jataksDb from './jataks/JATAKS_DATABASE.json';
// KNOWLEDGE_BASE markdown files — referenced as raw text for knowledge-base
// features. Stubbed as empty strings since the files don't exist in the repo.
const ebookIndexRaw: string = '';
const implementationQueueRaw: string = '';
const interpretationEngineRaw: string = '';

type JatakRecord = {
  id: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  state?: string;
  country?: string;
  relationship?: string;
  notes?: string;
};

type MarkdownRow = string[];

const parseMarkdownTable = (raw: string): MarkdownRow[] =>
  raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && !/^\|\s*-+/.test(line))
    .slice(1)
    .map(line =>
      line
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim())
    )
    .filter(row => row.length > 1);

const jataks = ((jataksDb as { jataks?: JatakRecord[] }).jataks ?? []).filter(Boolean);
const ebookRows = parseMarkdownTable(ebookIndexRaw);
const queueRows = parseMarkdownTable(implementationQueueRaw);

const layerMatches = interpretationEngineRaw.match(/^\[\s\]\s+\d+\.\s+LAYER/gm) ?? [];

const queuedFeatures = queueRows
  .filter(row => row[5]?.includes('QUEUED'))
  .map(row => ({
    priority: row[1],
    feature: row[2],
    source: row[3],
    type: row[4],
  }));

const processedSources = ebookRows
  .filter(row => /Processed/i.test(row[5] ?? ''))
  .map(row => row[0])
  .slice(0, 6);

const skippedSources = ebookRows.filter(row => /Skipped/i.test(row[5] ?? '')).length;
const processedCount = ebookRows.filter(row => /Processed/i.test(row[5] ?? '')).length;
const vedicCount = ebookRows.filter(row => (row[4] ?? '').includes('VEDIC')).length;

const topRelationships = Array.from(
  new Map(
    jataks.slice(0, 8).map(jatak => [
      jatak.id,
      {
        name: jatak.name,
        relationship: jatak.relationship ?? 'Archive record',
        birth: `${jatak.dateOfBirth} • ${jatak.timeOfBirth}`,
        location: [jatak.placeOfBirth, jatak.state].filter(Boolean).join(', '),
        notes: jatak.notes || 'Saved in the chart archive',
      },
    ])
  ).values()
);

const interpretationHighlights = [
  'Every reading resolves into a verdict instead of stopping at description.',
  'Natal promise remains the governing layer; transit and dasha only activate what exists.',
  'Conflicts must end in one forced conclusion with a clear Therefore clause.',
  'Remedies are tied to the weakest planet and a specific failure mode.',
];

const researchHighlights = [
  'The repo already tracks a perpetual scan → extract → implement → verify loop.',
  'The ebook index shows a very large corpus, even where PDF parsing still needs completion.',
  'The implementation queue captures missing calculations, rule sets, and integration work.',
  'The chart database gives the product real case material instead of purely synthetic examples.',
];

export const repoMetrics = {
  totalJataks: jataks.length,
  interpretationLayers: layerMatches.length,
  ebookRows: ebookRows.length,
  processedSources: processedCount,
  skippedSources,
  vedicSources: vedicCount,
  queuedItems: queuedFeatures.length,
};

export const repoHighlights = {
  topRelationships,
  queuedFeatures: queuedFeatures.slice(0, 6),
  processedSources,
  interpretationHighlights,
  researchHighlights,
  sourceFiles: [
    'KNOWLEDGE_BASE/INTERPRETATION_ENGINE_v2.1.md',
    'KNOWLEDGE_BASE/implementation_queue.md',
    'KNOWLEDGE_BASE/ebook_index.md',
    'jataks/JATAKS_DATABASE.json',
    'reports/comparisons/*.html',
  ],
  comparisonReports: [
    'Rajkumar',
    'Jyoti Chauhan',
    'Priyanka Jain',
    'Priyansh Singh Chauhan',
    'Vishwaraj Singh Chauhan',
  ],
  moduleCards: [
    {
      title: 'Prashna and verdict engine',
      description:
        'Question-led advisory built on the repo’s interpretation engine and Prashna research workflow.',
      href: '/question',
    },
    {
      title: 'Chart archive and profiles',
      description:
        'Saved Jataks, reusable birth details, and real family chart records from the repository database.',
      href: '/dasha',
    },
    {
      title: 'Marriage and compatibility suite',
      description:
        'Matching, MTSS, wedding timing, and relationship-oriented feature routes already present in the app.',
      href: '/vedic-marriage',
    },
    {
      title: 'Knowledge and research base',
      description: 'Ingestion, export, queue tracking, and a growing book-driven knowledge corpus.',
      href: '/knowledge',
    },
    {
      title: 'Comparative and case-study work',
      description:
        'Existing comparison outputs and archived chart summaries that can be surfaced as proof of depth.',
      href: '/kundli-compare',
    },
    {
      title: 'Career, remedies, and timing',
      description:
        'Decision-focused modules for karma, career direction, transit support, and remedy selection.',
      href: '/vidhya-karma',
    },
    {
      title: 'Transit Analysis & 4+ Scanner',
      description:
        'Professional bilingual Gochar report with Vedha analysis, Ashtakavarga overlay, PDF export, and a 4-planet favorable window finder.',
      href: '/transit-analysis',
    },
  ],
};
