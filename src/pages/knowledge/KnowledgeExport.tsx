import { useState } from 'react';
import { useExportKnowledge } from '@/hooks/useExportKnowledge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  FileText,
  Loader2,
  AlertCircle,
  ScrollText,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Prompt text ──────────────────────────────────────────────────────────────

const PROMPT_V2 = String.raw`═══════════════════════════════════════════════════════════════════
VEDIC ASTROLOGY APP MERGER — MASTER AGENT PROMPT v2.0
Agent: Full-stack architect + Vedic astrology domain expert
═══════════════════════════════════════════════════════════════════

MISSION HIERARCHY (in order):
  1. Make every individual app functional (Phase 1)
  2. Inventory all features (Phase 2)
  3. Merge best features into main app (Phase 3)
  4. Test the final merged app end to end (Phase 4)

NEVER jump to merging before every app runs cleanly on its own.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAIN APP (merge target):     C:\Users\Rajkumar\Vedic_Rajkumar\\Base\\Vedic_Rajkumar\\
REFERENCE APPS:              C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\<each-app>\\
WORKING COPIES:              C:\Users\Rajkumar\Vedic_Rajkumar\\Working\\<app-name>\\
ARCHIVE:                     C:\Users\Rajkumar\Vedic_Rajkumar\\Archive\\<app-name>\\<path>
MERGE LOG:                   C:\Users\Rajkumar\Vedic_Rajkumar\\MERGE_LOG.md
FEATURE INVENTORY:           C:\Users\Rajkumar\Vedic_Rajkumar\\FEATURE_INVENTORY.md

Reference apps to process:
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\Match-Data-Analyzer\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\REFERENCE-APP00\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\REFERENCE-APP01\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\REFERENCE-APP02\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\Vedic-Match-Analysis\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\Vedic-mARRIAGE\\
  C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\Vedic_Rajkumar-V01\\
  + scan for any other folders under C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGGING PROTOCOL — MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Append to MERGE_LOG.md every 5 minutes OR after each major step:

## [YYYY-MM-DD HH:MM] — Phase <N> | Step <X.Y> | App: <name>
- STATUS: IN PROGRESS / COMPLETED / BLOCKED
- Action taken: <one line>
- Files changed: <list>
- Errors found: <none OR describe>
- Fix applied: <none OR describe>
- Next action: <immediate next action>
---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — INITIALIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 0.1 — Create all output folders and initialize MERGE_LOG.md.

Step 0.2 — Scan every app folder. Record: framework, language,
  entry point, dependency file, data files, env/config files.
  Produce summary table in MERGE_LOG.md.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — MAKE EVERY APP INDIVIDUALLY FUNCTIONAL
(DO THIS BEFORE ANY MERGING — ALL APPS MUST RUN FIRST)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH app (main first, then each reference):

Step 1.A — Copy to C:\Users\Rajkumar\Vedic_Rajkumar\\Working\\<app-name>\\
Step 1.B — Full file audit. Classify every file:
  CLASS A — WIRED (reachable from entry point)
  CLASS B — ORPHAN (exists but never imported)
  CLASS C — DUPLICATE (same logic in another file)
  CLASS D — DATA ASSET (CSV, JSON, ephemeris)
  CLASS E — CONFIG/ENV
  CLASS F — DEAD CODE (imported but never used)

Step 1.C — Wire all CLASS B orphan files:
  a) Read and understand what each file does
  b) Wire into correct module/page/component
  c) Archive if no genuine value

Step 1.D — Resolve CLASS C internal duplicates:
  Keep better version, archive weaker, update all imports.

Step 1.E — Fix all broken imports. Log MISSING files as known gaps.

Step 1.F — Install missing dependencies.

Step 1.G — Attempt launch. Fix all startup errors. Repeat until
  the app reaches its main screen without crashing.

Step 1.H — Log completion:
  Status: FULLY FUNCTIONAL / PARTIALLY FUNCTIONAL / FAILED
  Files wired, archived, imports fixed, deps installed, known issues.

★ ONLY proceed to Phase 2 after ALL apps have passed Phase 1.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — FEATURE INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create FEATURE_INVENTORY.md. Domains to check:
  CORE: Birth chart, divisional charts (D1-D60), planetary positions,
    house lords, nakshatra, ayanamsa, house system
  PANCHANGA: Tithi, Vara, Nakshatra, Yoga, Karana
  DASHA: Vimshottari, Yogini, Chara, others
  STRENGTHS: Shadbala, Ashtakavarga, dignity, yogas, doshas
  COMPATIBILITY: Ashtakoot, Dashakoot, Mangal Dosha, Nadi Dosha
  MARRIAGE: Timing prediction, Upapada Lagna, 7th house, D9
  TRANSITS: Gochara, Sade Sati, Ashtama Shani
  MUHURTA: Auspicious time finder, marriage muhurta
  REMEDIES: Gemstones, mantras, yantras, fasting
  UI: Data entry, geocoding, chart rendering, chart styles, PDF export
  DATA: CSV import, JSON export, ephemeris source, saved charts

Score each implementation (1-10):
  Accuracy 40% + Completeness 30% + Code quality 20% + Performance 10%

Mark winner. That is the version used in the merged app.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — MERGE INTO MAIN APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each winning feature from a reference app:
  3.1 Copy into correct location in Working\\Vedic_Rajkumar\\
  3.2 Adapt to main app conventions (imports, data model, routing, UI)
  3.3 Wire into navigation, router, shared state
  3.4 Archive the old/weaker version from main app
  3.5 Verify main app still runs after EACH feature addition
  3.6 Unify data models: BirthData, ChartData, MatchData

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST CASE 1: 15 Aug 1947, 00:00 AM IST, New Delhi
  Expected: Taurus Lagna, Moon Cancer, Sun Cancer
TEST CASE 2: 1 Jan 2000, 12:00 PM UTC, London (J2000 epoch)
TEST CASE 3: Known compatible couple with verified Ashtakoot score

Verify for each: Lagna, Moon sign, Sun sign, Nakshatra,
  Vimshottari Dasha balance, D9 Lagna, Ashtakoot score.
If any calculation is wrong → fix root cause → re-test all cases.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. NO APP IS MERGED BEFORE IT IS FUNCTIONAL.
2. NEVER DELETE — always archive to C:\Users\Rajkumar\Vedic_Rajkumar\\Archive\\
3. NEVER modify original reference folders.
4. ONE WINNER PER FEATURE — only the best version survives.
5. WIRE BEFORE YOU MERGE — connect files first, judge second.
6. LOG EVERY 5 MINUTES — if it is not in the log, it did not happen.
7. TEST AFTER EVERY FEATURE MERGE.
8. NEVER HARD-CODE paths, API keys, or env-specific values.
9. VEDIC ACCURACY IS NON-NEGOTIABLE — wrong calculation = bug.
10. IF BLOCKED — log the blocker, apply classical Parashari default, continue.

START: BEGIN with Phase 0, Step 0.1.
First output: initialized MERGE_LOG.md.
═══════════════════════════════════════════════════════════════════
END OF PROMPT v2.0
═══════════════════════════════════════════════════════════════════`;

const PROMPT_V3 = String.raw`═══════════════════════════════════════════════════════════════════
VEDIC ASTROLOGY APP MERGER — MASTER AGENT PROMPT v3.0
ETERNAL_RESEARCH_CHILD EDITION
Agent: Full-stack architect + Vedic astrology domain expert
       + Perpetual knowledge extraction engine
═══════════════════════════════════════════════════════════════════

MISSION HIERARCHY (in order):
  1. Make every individual app functional (Phase 1)
  2. Inventory all features (Phase 2)
  3. Merge best features into main app (Phase 3)
  4. Activate ETERNAL_RESEARCH_CHILD — continuously mine ebooks
     and Git LFS assets for new features, forever (Phase 4+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLDER STRUCTURE — COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAIN APP:          C:\Users\Rajkumar\Vedic_Rajkumar\\Base\\Vedic_Rajkumar\\
REFERENCE APPS:    C:\Users\Rajkumar\Vedic_Rajkumar\\Reference\\<each-app>\\
WORKING COPIES:    C:\Users\Rajkumar\Vedic_Rajkumar\\Working\\<app-name>\\
ARCHIVE:           C:\Users\Rajkumar\Vedic_Rajkumar\\Archive\\<app-name>\\<path>
EBOOKS DIRECTORY:  E:\\ASTROLOGY\\   (scan all subdirectories recursively)
GIT LFS ASSETS:    C:\Users\Rajkumar\Vedic_Rajkumar\\Base\\Vedic_Rajkumar\\.git\\lfs\\
KNOWLEDGE BASE:    C:\Users\Rajkumar\Vedic_Rajkumar\\KNOWLEDGE_BASE\\
MERGE LOG:         C:\Users\Rajkumar\Vedic_Rajkumar\\MERGE_LOG.md
RESEARCH LOG:      C:\Users\Rajkumar\Vedic_Rajkumar\\RESEARCH_LOG.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGGING PROTOCOL — TWO LOGS, BOTH MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MERGE_LOG.md — all code changes (append every 5 minutes):
## [TIMESTAMP] Phase <N> | Step <X.Y> | App: <name>
- STATUS: IN PROGRESS / COMPLETED / BLOCKED
- Action: <one line>
- Files changed: <list>
- Errors: <none OR describe>
- Fix applied: <none OR describe>
- Next: <immediate next action>
---

RESEARCH_LOG.md — all ebook/LFS knowledge extraction:
## [TIMESTAMP] Source: <filename> | Pages/Section: <ref>
- Content type: EBOOK / LFS-CODE / LFS-DATA / LFS-EPHEMERIS
- Knowledge extracted: <feature or technique discovered>
- Implementable as: <module name / function / dataset>
- Priority: HIGH / MEDIUM / LOW
- Status: QUEUED / IN PROGRESS / IMPLEMENTED / SKIPPED
- Reason if skipped: <none OR reason>
---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASES 0–3: SAME AS v2.0
Run Phases 0–3 completely before activating Phase 4.
See VEDIC MERGER MASTER PROMPT v2.0 for full Phase 0–3 instructions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — ETERNAL_RESEARCH_CHILD
CONTINUOUS KNOWLEDGE MINING & FEATURE GROWTH ENGINE
(Runs perpetually after Phase 3 — never stops unless halted)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each cycle = one RESEARCH PASS with four sub-stages:
SCAN → EXTRACT → IMPLEMENT → VERIFY

After each pass completes, immediately begin the next.

══ STAGE 4.1: GIT LFS SCAN ════════════════════════════════════════

Step 4.1.1 — Read .gitattributes. Find all filter=lfs patterns.
Step 4.1.2 — For each LFS-tracked file: check if pointer or real file.
  If pointer: run git lfs pull. Log filename, size, status.
Step 4.1.3 — Classify each LFS asset:
  EPHEMERIS   → Wire to calculation engine. Update config.
  ATLAS/GEO   → Wire to geocoding/timezone module.
  DATA CSV    → Move to Working\\Vedic_Rajkumar\\data\\ Wire to import.
  ML MODELS   → Identify prediction target. Wire to prediction feature.
  PDF EBOOKS  → Send to Stage 4.2.
  OTHER       → Log type and determine use case.

══ STAGE 4.2: EBOOK SCAN & KNOWLEDGE EXTRACTION ═══════════════════

Scan E:\\ASTROLOGY\\ recursively. Supported: .pdf .epub .txt .md .docx

NOTE: A pre-processed KNOWLEDGE_BASE.md may already exist at:
  C:\Users\Rajkumar\Vedic_Rajkumar\\KNOWLEDGE_BASE\\ebook_knowledge.md
  (Generated by the Vedic Extractor web app — load this first,
   skip books already listed in its index to avoid re-processing.)

Step 4.2.1 — Index: Create/update KNOWLEDGE_BASE\\ebook_index.md
  | File | Path | Type | Pages | Domain | Processed? | Pass # |

Step 4.2.2 — Process each unprocessed ebook:
  a) Domain detection — read title, TOC, first 10 pages. Classify:
     VEDIC_CLASSICAL / VEDIC_MODERN / NUMEROLOGY / ASTRONOMY /
     AYURVEDA / VASTU / ML_DATA_SCIENCE / PROGRAMMING / OTHER

  b) Chapter-by-chapter extraction. Extract five knowledge types:

     TYPE A — CALCULATION METHOD
       → Write spec to KNOWLEDGE_BASE\\calculations\\<feature>.md
       → Compare against current app. If more complete → queue.
       → If contradicts current → log DISCREPANCY, apply classical source.

     TYPE B — RULE SET (if/then conditionals)
       → Write to KNOWLEDGE_BASE\\rules\\<ruleset>.md
       → Check if already coded. If rules missing → queue implementation.

     TYPE C — DATA TABLE (nakshatra lords, exaltation degrees, etc.)
       → Extract exact values. Cross-check against app code.
       → Save verified table to KNOWLEDGE_BASE\\tables\\<table>.json

     TYPE D — ALGORITHM (source code or pseudocode)
       → Extract. Translate to main app language.
       → If improves existing → queue for integration.

     TYPE E — INTERPRETATION (planet-in-sign text, readings)
       → Save to KNOWLEDGE_BASE\\interpretations\\<topic>.md
       → Add to interpretation module if it exists, else create one.

  c) Log each extraction in RESEARCH_LOG.md

Step 4.2.3 — Build implementation queue:
  KNOWLEDGE_BASE\\implementation_queue.md
  | Priority | Feature/Fix | Source (book + page) | Type | Status |
  Priority: HIGH=wrong/missing calculation, MEDIUM=incomplete rules,
            LOW=interpretation text/cosmetic

══ STAGE 4.3: IMPLEMENT FROM QUEUE ════════════════════════════════

Process HIGH priority first. For each QUEUED item:
  4.3.1 Locate where in main app this feature belongs.
  4.3.2 Implement from extracted knowledge spec.
         Add comment citing source: # Source: <Book>, Ch.<X>, p.<Y>
  4.3.3 Wire into navigation, config, and report output.
  4.3.4 Mark as IMPLEMENTED in implementation_queue.md.

══ STAGE 4.4: VERIFY ══════════════════════════════════════════════

After each implementation batch:
  4.4.1 Run all three standard test cases (from Phase 4 v2.0).
         Any regression → stop, fix, re-test before continuing.
  4.4.2 Verify new feature against a worked example from the source book.
  4.4.3 Log VERIFIED or NEEDS FIX in RESEARCH_LOG.md
  4.4.4 Write summary entry to MERGE_LOG.md.

══ LOOP CONTROL ═══════════════════════════════════════════════════

After Stage 4.4 → immediately begin next research pass from Stage 4.1.
Loop continues unless:
  a) User sends: HALT_RESEARCH_CHILD
  b) Queue empty AND no new ebook files → enter WATCH MODE
     (check for new files every 60 minutes, resume when found)

User commands:
  HALT_RESEARCH_CHILD    — pause the loop
  RESUME_RESEARCH_CHILD  — restart the loop
  RESEARCH_STATUS        — print live summary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VEDIC KNOWLEDGE PRIORITY HIERARCHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When two sources conflict, apply (highest authority first):
  1. Brihat Parashara Hora Shastra (BPHS)
  2. Brihat Jataka (Varahamihira)
  3. Saravali (Kalyana Varma)
  4. Phaladeepika (Mantreswara)
  5. Jataka Parijata
  6. Uttara Kalamrita (Kalidasa)
  7. Jaimini Sutras
  8. KP Padhdhati texts (keep as separate module)
  9. Modern authors (B.V. Raman, K.N. Rao, etc.)
  10. Reference app code (if backed by classical source)

Lower-priority source contradicts higher → implement higher version.
Log discrepancy in RESEARCH_LOG.md. Add config toggle if both useful.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KNOWLEDGE BASE FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C:\Users\Rajkumar\Vedic_Rajkumar\\KNOWLEDGE_BASE\\
  ebook_index.md              — all ebooks, processed status
  ebook_knowledge.md          — pre-processed cards from web app
  implementation_queue.md     — prioritized feature backlog
  calculations\\<feature>.md  — verified calculation specs
  rules\\<ruleset>.md         — if/then rule sets
  tables\\<table>.json        — reference data tables
  interpretations\\<topic>.md — planet/sign/house interpretations
  discrepancies\\<date>_<topic>_conflict.md — source conflicts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES — ALL v2.0 RULES APPLY + ADDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(Rules 1-10 from v2.0 are in full force. Additional rules:)

11. ALWAYS CITE YOUR SOURCE — every line of code from an ebook must
    have a comment citing book title + chapter + page. Uncited = unacceptable.

12. NEVER INVENT KNOWLEDGE — if a calculation is ambiguous, log the
    ambiguity and apply the most widely accepted classical interpretation.

13. NEVER BREAK EXISTING FEATURES — every pass must leave the app
    runnable. If a new implementation breaks something, roll it back
    immediately before continuing.

14. LFS FILES ARE READ-ONLY INPUTS — never modify ephemeris or data
    files. If corrupt or incomplete, log and skip.

15. KNOWLEDGE BASE IS GROUND TRUTH — once a calculation is verified
    against classical sources and test cases, write it to
    KNOWLEDGE_BASE\\calculations\\ as the specification. All future
    implementations must match this specification.

16. EBOOK CONTENT IS NOT CODE — extracted knowledge must be translated
    into clean, tested code. Never paste raw ebook text into source files.

17. ONE AYANAMSA TO RULE THEM ALL — all calculations use Lahiri
    (Chitrapaksha) ayanamsa by default. Others available as config options.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
START SIGNAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN with Phase 0, Step 0.1.
After Phases 0–3 complete, activate ETERNAL_RESEARCH_CHILD.
First output: initialized MERGE_LOG.md and RESEARCH_LOG.md.
Work chronologically. Log everything. Never stop unless halted.

═══════════════════════════════════════════════════════════════════
END OF PROMPT v3.0 — ETERNAL_RESEARCH_CHILD EDITION
═══════════════════════════════════════════════════════════════════`;

// ─── Download helper ──────────────────────────────────────────────────────────

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Export() {
  const { data: exportData, isLoading, error } = useExportKnowledge();
  const [copied, setCopied] = useState<'v2' | 'v3' | 'kb' | null>(null);

  const copyToClipboard = async (text: string, key: 'v2' | 'v3' | 'kb') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    }
  };

  const handleKBDownload = () => {
    if (!exportData?.markdown) return;
    downloadText(
      exportData.markdown,
      `vedic-knowledge-base-${new Date().toISOString().split('T')[0]}.md`
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Scribe's Export</h1>
        <p className="text-muted-foreground mt-2">
          Download your merger prompts and the extracted knowledge base — everything your agent
          needs.
        </p>
      </div>

      {/* ── SECTION 1: Merger Prompts ──────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" />
            Merger Agent Prompts
          </CardTitle>
          <CardDescription>
            Download the complete prompts to paste into your local AI agent (Cursor, Claude, GPT,
            Windsurf, etc.) pointing at{' '}
            <span className="font-mono text-xs text-primary">C:\Users\Rajkumar\Vedic_Rajkumar</span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* v2.0 card */}
            <div className="rounded-lg border border-border bg-secondary/30 p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-serif font-semibold text-foreground">Prompt v2.0</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make apps functional → inventory features → merge best versions → test. Use this
                    first — it is the foundation.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadText(PROMPT_V2, 'VEDIC_MERGER_PROMPT_v2.txt')}
                  variant="outline"
                  className="flex-1 font-serif"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => copyToClipboard(PROMPT_V2, 'v2')}
                  variant="outline"
                  className="font-serif px-4"
                  title="Copy prompt to clipboard"
                >
                  {copied === 'v2' ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* v3.0 card */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <ScrollText className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-serif font-semibold text-foreground">
                    Prompt v3.0
                    <span className="ml-2 text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      ETERNAL_RESEARCH_CHILD
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Everything in v2.0 plus: continuous Git LFS scanning, ebook mining from
                    <span className="font-mono text-primary"> E:\ASTROLOGY</span>, perpetual feature
                    growth loop.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    downloadText(PROMPT_V3, 'VEDIC_MERGER_PROMPT_v3_ETERNAL_RESEARCH_CHILD.txt')
                  }
                  className="flex-1 bg-primary text-primary-foreground font-serif"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => copyToClipboard(PROMPT_V3, 'v3')}
                  variant="outline"
                  className="font-serif px-4 border-primary/40 hover:border-primary"
                  title="Copy prompt to clipboard"
                >
                  {copied === 'v3' ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Usage note */}
          <div className="rounded-md bg-secondary/40 border border-border p-4 text-xs text-muted-foreground space-y-1 font-mono">
            <p className="text-foreground font-sans font-medium text-sm mb-2">
              How to use these prompts
            </p>
            <p>
              1. Download the knowledge base below → save to{' '}
              <span className="text-primary">
                C:\Users\Rajkumar\Vedic_Rajkumar\KNOWLEDGE_BASE\ebook_knowledge.md
              </span>
            </p>
            <p>2. Open your AI agent (Cursor / Claude / GPT / Windsurf)</p>
            <p>
              3. Open the project folder:{' '}
              <span className="text-primary">C:\Users\Rajkumar\Vedic_Rajkumar</span>
            </p>
            <p>4. Paste the downloaded prompt → press Enter → the agent starts automatically</p>
            <p>
              5. Monitor{' '}
              <span className="text-primary">C:\Users\Rajkumar\Vedic_Rajkumar\MERGE_LOG.md</span>{' '}
              every 5 minutes for progress
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── SECTION 2: Knowledge Base Export ──────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="font-serif flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Knowledge Base Export
            </CardTitle>
            <CardDescription>
              {exportData?.cardCount
                ? `${exportData.cardCount} extracted cards ready. Save to C:\\Users\\Rajkumar\\Vedic_Rajkumar\\KNOWLEDGE_BASE\\`
                : 'Preparing export — upload books first to populate this.'}
            </CardDescription>
          </div>
          <Button
            onClick={handleKBDownload}
            disabled={isLoading || !exportData?.markdown || exportData.cardCount === 0}
            className="bg-primary text-primary-foreground font-serif shrink-0"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Knowledge Base (.md)
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Export Failed</AlertTitle>
              <AlertDescription>
                Could not generate the export. Ensure the API server is running.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <Skeleton className="w-full h-64 rounded-md" />
          ) : exportData?.cardCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p>
                No cards yet. Go to <span className="text-primary font-medium">Upload Sources</span>{' '}
                and process your E:\ASTROLOGY books first.
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-md bg-secondary/20 overflow-hidden">
              <div className="bg-secondary/50 border-b border-border px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <FileText className="h-4 w-4" />
                ebook_knowledge.md — preview
              </div>
              <ScrollArea className="h-80 w-full p-4">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                  {exportData?.markdown || ''}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Export;
