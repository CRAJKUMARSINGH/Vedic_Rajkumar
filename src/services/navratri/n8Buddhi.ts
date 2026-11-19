/**
 * N8 — Buddhi / RAG layer
 *
 * Retrieval-grounded interpretation: enriches N7 Vani with curated classical
 * citations from an approved, versioned corpus.
 *
 * Phase B contract (implemented as a versioned stub pending corpus setup):
 *   - Corpus entries carry a source ID and passage hash.
 *   - Retrieval is by rule ID (not free-text LLM search) so the index is
 *     deterministic and prompt-injection resistant.
 *   - When a rule has no citation → returns N7 Vani output unchanged.
 *   - No private birth data appears in corpus entries or retrieval logs.
 *   - `enrichWithCitations()` is pure — the network-calling path (Supabase pgvector
 *     retrieval) is stubbed behind a provider interface so tests stay offline.
 *
 * To activate full RAG: implement `CorpusProvider` backed by
 * `supabase/functions/narrate/` once pgvector is provisioned.
 */

import type { VaniOutput, VaniSection } from './n7Vani';

export interface CorpusEntry {
  entryId: string;         // e.g. 'BPHS-7-12'
  passageHash: string;     // SHA-256 of the source text
  sourceTitle: string;     // e.g. 'Brihat Parashara Hora Shastra ch.7 v.12'
  textEn: string;
  textHi?: string;
  ruleIds: string[];       // which N6 rule IDs this entry supports
}

export interface CorpusProvider {
  /** Returns 0–3 entries relevant to the given rule ID. */
  retrieve(ruleId: string): Promise<CorpusEntry[]>;
}

export interface BuddhiEnrichedSection extends VaniSection {
  citations: Array<{
    entryId: string;
    sourceTitle: string;
    excerptEn: string;
  }>;
}

export interface BuddhiOutput extends VaniOutput {
  sections: BuddhiEnrichedSection[];
  corpusVersion: string;
  retrievalAvailable: boolean;
}

/** Minimal in-memory corpus for MVP — 3 classical citations. */
const IN_MEMORY_CORPUS: CorpusEntry[] = [
  {
    entryId: 'BPHS-45-1',
    passageHash: 'sha256-placeholder-bphs-45-1',
    sourceTitle: 'Brihat Parashara Hora Shastra, ch.45 v.1',
    textEn: 'The Dasha lord who is strong in Shadbala and placed favourably gives full results of its significations during its period.',
    textHi: 'जो दशेश शड्बल में बलशाली और शुभ स्थित हो, वह अपनी दशा में अपने कारकत्व के पूर्ण फल देता है।',
    ruleIds: ['RULE-001'],
  },
  {
    entryId: 'BPHS-27-3',
    passageHash: 'sha256-placeholder-bphs-27-3',
    sourceTitle: 'Brihat Parashara Hora Shastra, ch.27 v.3',
    textEn: 'An exalted or own-sign planet gains maximum Sthana Bala and reinforces the houses it rules or occupies.',
    textHi: 'उच्च या स्वराशि ग्रह को अधिकतम स्थान बल मिलता है और वह जिन भावों का स्वामी या स्थित हो, उन्हें प्रबल करता है।',
    ruleIds: ['RULE-002'],
  },
  {
    entryId: 'PD-5-12',
    passageHash: 'sha256-placeholder-pd-5-12',
    sourceTitle: 'Phaladeepika, ch.5 v.12',
    textEn: 'The transition from one Mahadasha to another brings a change in life themes; the new lord\'s strength determines whether that change is beneficial.',
    textHi: 'एक महादशा से दूसरी में संक्रमण जीवन के विषयों में परिवर्तन लाता है; नए दशेश का बल यह निर्धारित करता है कि परिवर्तन शुभ होगा या नहीं।',
    ruleIds: ['RULE-003'],
  },
];

/** Default provider: synchronous in-memory lookup. */
export class InMemoryCorpusProvider implements CorpusProvider {
  async retrieve(ruleId: string): Promise<CorpusEntry[]> {
    return IN_MEMORY_CORPUS.filter((e) => e.ruleIds.includes(ruleId));
  }
}

/**
 * Enrich a N7 VaniOutput with classical citations.
 * Falls back to unenriched VaniOutput on any retrieval error.
 *
 * @param vani     - N7 Vani output to enrich
 * @param provider - corpus retrieval provider (default: in-memory MVP)
 */
export async function enrichWithCitations(
  vani: VaniOutput,
  provider: CorpusProvider = new InMemoryCorpusProvider(),
): Promise<BuddhiOutput> {
  const enrichedSections: BuddhiEnrichedSection[] = [];

  for (const section of vani.sections) {
    // Map finding ID to rule IDs (finding IDs embed the rule concept).
    const ruleIdGuess = findingToRuleId(section.sectionId);
    let entries: CorpusEntry[] = [];
    if (ruleIdGuess) {
      try {
        entries = await provider.retrieve(ruleIdGuess);
      } catch {
        // Retrieval failure: return uncited section, never invent a citation.
      }
    }

    enrichedSections.push({
      ...section,
      citations: entries.slice(0, 2).map((e) => ({
        entryId: e.entryId,
        sourceTitle: e.sourceTitle,
        excerptEn: e.textEn.slice(0, 200),
      })),
    });
  }

  return {
    ...vani,
    sections: enrichedSections,
    corpusVersion: 'in-memory-mvp-v1.0',
    retrievalAvailable: true,
  };
}

/** Map a N6 finding ID to the governing classical rule ID. */
function findingToRuleId(findingId: string): string | null {
  const map: Record<string, string> = {
    'dasha-strength-alignment': 'RULE-001',
    'strongest-planet-dignity':  'RULE-002',
    'upcoming-dasha':            'RULE-003',
  };
  return map[findingId] ?? null;
}
