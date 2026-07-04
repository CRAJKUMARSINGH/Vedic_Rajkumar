/**
 * Knowledge Extraction Service — Client-side
 * Ported from Vedic-App-Merger/artifacts/api-server extract logic.
 * Reads PDF / TXT / MD files in the browser, detects Vedic domain,
 * extracts structured knowledge cards, and saves them to Supabase.
 *
 * Knowledge Base target: C:\Users\Rajkumar\Vedic_Rajkumar\KNOWLEDGE_BASE
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Domain detection ────────────────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  VEDIC_CLASSICAL: [
    'parashar',
    'parashara',
    'brihat',
    'jataka',
    'hora',
    'shastra',
    'saravali',
    'phaladeepika',
    'uttara',
    'kalamrita',
    'varahamihira',
    'jaimini',
    'nadi',
  ],
  VEDIC_MODERN: [
    'vedic astrology',
    'birth chart',
    'raman',
    'k.n. rao',
    'bepin behari',
    'hart de fouw',
    'komilla sutton',
  ],
  NUMEROLOGY: ['numerology', 'lo shu', 'cheiro', 'numerological', 'life path number'],
  ASTRONOMY: [
    'ephemeris',
    'orbital',
    'ecliptic',
    'sidereal',
    'ayanamsa',
    'precession',
    'swiss ephemeris',
    'longitude',
    'latitude',
    'ascension',
  ],
  AYURVEDA: ['ayurveda', 'dosha', 'vata', 'pitta', 'kapha', 'tridosha', 'prakriti'],
  VASTU: ['vastu', 'shastra', 'vastu shastra', 'directional', 'mandala', 'north east'],
  COMPATIBILITY: [
    'compatibility',
    'synastry',
    'matching',
    'kundali milan',
    'ashtakoot',
    'guna',
    'navamsa',
    'marriage',
    'relationship',
  ],
  REMEDIES: [
    'remedy',
    'remedies',
    'gemstone',
    'mantra',
    'yantra',
    'rudraksha',
    'propitiation',
    'puja',
  ],
};

function detectDomain(text: string): string {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.reduce((acc, kw) => {
      const matches = (lower.match(new RegExp(kw, 'g')) || []).length;
      return acc + matches;
    }, 0);
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : 'VEDIC_GENERAL';
}

// Map detected domain to Base app's category system
function domainToCategory(domain: string): string {
  const map: Record<string, string> = {
    VEDIC_CLASSICAL: 'general',
    VEDIC_MODERN: 'general',
    NUMEROLOGY: 'other',
    ASTRONOMY: 'other',
    AYURVEDA: 'remedies',
    VASTU: 'other',
    COMPATIBILITY: 'yoga',
    REMEDIES: 'remedies',
    VEDIC_GENERAL: 'general',
  };
  return map[domain] || 'general';
}

// ─── Knowledge card extraction ────────────────────────────────────────────────

const CALC_PATTERNS = [
  /formula[:\s]+([^\n]{20,200})/gi,
  /calculated? (?:as|by|using)[:\s]+([^\n]{20,200})/gi,
  /\b(dasha|antardasha|vimshottari|shadbala|ashtakavarga|ashtakoot|guna milan)\b[^.]*[.]/gi,
  /\b(lagna|ascendant|moon sign|sun sign|nakshatra|navamsa|rashi)\b[^.]*formula[^.]*[.]/gi,
];

const RULE_PATTERNS = [
  /if\s+(?:the\s+)?(?:planet|lord|moon|sun|mars|jupiter|saturn|rahu|ketu|venus|mercury)[^.]*[.]/gi,
  /when\s+(?:planet|lord|moon|sun|mars|jupiter|saturn|rahu|ketu)[^.]*[.]/gi,
  /(?:mangal|kuja|shani|guru)\s+(?:dosha|dasha|yoga)[^.]*[.]/gi,
  /yoga\s+(?:is\s+)?(?:formed?|present)[^.]*[.]/gi,
  /cancellation\s+of[^.]*[.]/gi,
  /exception[s]?\s+(?:to|for|of)[^.]*[.]/gi,
];

const TABLE_PATTERNS = [
  /(?:nakshatra|yoga|tithi|karana|vara)\s+(?:lord|deity|nature)[^.]*[.]/gi,
  /(?:exaltation|debilitation|mool trikona|own sign)[^.]*(?:degree|sign|rashi)[^.]*[.]/gi,
  /(?:planets?|graha)\s+(?:in|of)\s+(?:\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+house[^.]*[.]/gi,
];

interface KnowledgeCardDraft {
  title: string;
  content: string;
  type: 'CALCULATION' | 'RULE_SET' | 'DATA_TABLE' | 'INTERPRETATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  keywords: string;
}

function extractCards(text: string, _filename: string): KnowledgeCardDraft[] {
  const cards: KnowledgeCardDraft[] = [];
  const seen = new Set<string>();

  function addCard(
    title: string,
    content: string,
    type: KnowledgeCardDraft['type'],
    priority: KnowledgeCardDraft['priority'],
    keywords: string
  ) {
    const key = content.trim().slice(0, 80);
    if (seen.has(key) || content.trim().length < 30) return;
    seen.add(key);
    cards.push({ title, content: content.trim().slice(0, 600), type, priority, keywords });
  }

  // Extract paragraphs with chapter headings as cards
  const paragraphs = text.split(/\n{2,}/);
  let currentHeading = 'General';

  for (let i = 0; i < paragraphs.length && cards.length < 80; i++) {
    const para = paragraphs[i].trim();
    if (!para || para.length < 20) continue;

    // Detect headings
    if (para.length < 120 && /^[A-Z\s\d\-–:]{4,}$/.test(para.replace(/[^A-Z\s\d\-–:]/g, ''))) {
      currentHeading = para.slice(0, 100);
      continue;
    }

    // Check for calculation patterns
    let matched = false;
    for (const pattern of CALC_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(para)) {
        addCard(
          `Calculation: ${currentHeading}`,
          para,
          'CALCULATION',
          'HIGH',
          'calculation,formula,' + currentHeading.toLowerCase().replace(/\s+/g, ',')
        );
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for rule patterns
    for (const pattern of RULE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(para)) {
        addCard(
          `Rule: ${currentHeading}`,
          para,
          'RULE_SET',
          'HIGH',
          'rule,conditional,' + currentHeading.toLowerCase().replace(/\s+/g, ',')
        );
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for table/reference data patterns
    for (const pattern of TABLE_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(para)) {
        addCard(
          `Reference Table: ${currentHeading}`,
          para,
          'DATA_TABLE',
          'MEDIUM',
          'table,reference,' + currentHeading.toLowerCase().replace(/\s+/g, ',')
        );
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // General interpretation text — only add if substantial
    if (para.length > 100 && para.length < 600) {
      addCard(
        `Interpretation: ${currentHeading}`,
        para,
        'INTERPRETATION',
        'LOW',
        'interpretation,' + currentHeading.toLowerCase().replace(/\s+/g, ',')
      );
    }
  }

  return cards;
}

// ─── Read file content ───────────────────────────────────────────────────────

async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function readPdfFile(file: File): Promise<string> {
  // Dynamic import pdfjs-dist; if not available, fall back to basic binary read
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n\n');
  } catch {
    // Fallback: try reading as text (will work for text-based PDFs)
    console.warn('pdfjs-dist not available, attempting text fallback for PDF');
    return readTextFile(file);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface ExtractionResult {
  sourceFile: string;
  wordCount: number;
  detectedDomain: string;
  cardsCreated: number;
  category: string;
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md'];

export function isSupportedFile(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Extract knowledge from a single file and save cards to Supabase.
 */
export async function extractAndSaveFile(file: File): Promise<ExtractionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  // Read content
  let text: string;
  if (ext === 'pdf') {
    text = await readPdfFile(file);
  } else {
    text = await readTextFile(file);
  }

  if (!text || text.trim().length < 50) {
    throw new Error('File content too short or empty');
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const detectedDomain = detectDomain(text);
  const category = domainToCategory(detectedDomain);
  const cardDrafts = extractCards(text, file.name);

  if (cardDrafts.length === 0) {
    // Still save a single summary entry if no structured cards were found
    const summaryContent = text.slice(0, 800);
    const { error } = await supabase.from('knowledge_entries').insert({
      title: `Extracted: ${file.name}`,
      content: summaryContent,
      category,
      source_type: 'book',
      author_name: null,
      source_url: null,
      tags: ['file-upload', detectedDomain.toLowerCase().replace(/_/g, '-')],
    });
    if (error) throw error;
    return { sourceFile: file.name, wordCount, detectedDomain, cardsCreated: 1, category };
  }

  // Batch insert all extracted cards
  const entries = cardDrafts.map(c => ({
    title: c.title,
    content: c.content,
    category,
    source_type: 'book' as const,
    author_name: null as string | null,
    source_url: null as string | null,
    tags: [
      'file-upload',
      c.type.toLowerCase().replace(/_/g, '-'),
      c.priority.toLowerCase(),
      detectedDomain.toLowerCase().replace(/_/g, '-'),
      ...c.keywords.split(',').slice(0, 5),
    ],
  }));

  const { error } = await supabase.from('knowledge_entries').insert(entries);
  if (error) throw error;

  return {
    sourceFile: file.name,
    wordCount,
    detectedDomain,
    cardsCreated: cardDrafts.length,
    category,
  };
}

/**
 * Export all knowledge entries as a structured Markdown document.
 * Target path: C:\Users\Rajkumar\Vedic_Rajkumar\KNOWLEDGE_BASE\ebook_knowledge.md
 */
export async function exportKnowledgeAsMarkdown(): Promise<{
  markdown: string;
  cardCount: number;
}> {
  const { data: cards, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) throw error;
  if (!cards || cards.length === 0) {
    return { markdown: '# VEDIC KNOWLEDGE BASE\n\n_No entries yet._\n', cardCount: 0 };
  }

  // Group by category
  const grouped = new Map<string, typeof cards>();
  for (const c of cards) {
    const key = c.category || 'general';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  let markdown = `# VEDIC KNOWLEDGE BASE\n`;
  markdown += `_Generated by ETERNAL_RESEARCH_CHILD — ${new Date().toISOString()}_\n\n`;
  markdown += `**Total cards:** ${cards.length}\n`;
  markdown += `**Target directory:** C:\\Users\\Rajkumar\\Vedic_Rajkumar\\KNOWLEDGE_BASE\\\n\n---\n\n`;

  for (const [category, group] of grouped.entries()) {
    markdown += `## ${category.toUpperCase()}\n\n`;
    for (const card of group) {
      markdown += `### ${card.title}\n`;
      markdown += `> Source: ${card.source_type || 'unknown'} | Author: ${card.author_name || '—'} | Tags: ${(card.tags || []).join(', ')}\n\n`;
      markdown += `${card.content}\n\n`;
      markdown += `---\n\n`;
    }
  }

  return { markdown, cardCount: cards.length };
}
