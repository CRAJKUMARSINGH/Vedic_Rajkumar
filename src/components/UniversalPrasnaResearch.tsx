/**
 * UniversalPrasnaResearch.tsx
 *
 * "Universal Prasna Research" bar — placed at the TOP of QuestionPage.
 *
 * Implements the UI described in PRASNA_MARG_TASK01.MD Section 6.1:
 *   - Input bar for the user's question
 *   - "Direction Faced" selector (Arudha Lagna input)
 *   - Auto-captures the Prasna Moment (timestamp) on submit
 *   - Displays the three-section structured response:
 *       Section 1 — Brief Astro-Logic Summary
 *       Section 2 — Core Method (chapter focus + Pancha Sutra)
 *       Section 3 — Predictive / Advisory Answer
 *   - Shows Parihara (remedial) advice when required
 *   - "View Source" link to the relevant Prasna Marga chapter
 *
 * Sources:
 *   Prasna Marga (Parts I & II) — B.V. Raman
 *   The Astrological Magazine (September 1978 Special Issue)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Compass,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Clock,
  AlignLeft,
  ListChecks,
  Lightbulb,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
  buildUniversalResearchPayload,
  type Direction,
  type UniversalResearchPayload,
} from '@/services/prasnaResearchEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DIRECTIONS: Direction[] = ['East', 'West', 'North', 'South', 'NE', 'NW', 'SE', 'SW'];

const CHAPTER_LINKS: Record<string, string> = {
  // Part I — Internet Archive (free full text)
  'Prasna Marga Part I, Chapters I–X': 'https://archive.org/stream/PrasnaMarga1_djvu',
  'Prasna Marga Part I, Chapters XII–XV': 'https://archive.org/stream/PrasnaMarga1_djvu',
  'Prasna Marga Part I, Chapters XIV–XVI': 'https://archive.org/stream/PrasnaMarga1_djvu',
  'Prasna Marga Part I, Chapters IX–X': 'https://archive.org/stream/PrasnaMarga1_djvu',
  'Prasna Marga Part I, Chapter XI': 'https://archive.org/stream/PrasnaMarga1_djvu',
  'Prasna Marga Part I, Chapters I–III': 'https://archive.org/stream/PrasnaMarga1_djvu',
  // Part II — MLBD publisher page
  'Prasna Marga Part II, Chapter XVIII (Vivaha Prasna)':
    'https://www.mlbd.in/products/prasna-marga-part-2',
  'Prasna Marga Part II, Chapter XVIII (Santhana Prasna)':
    'https://www.mlbd.in/products/prasna-marga-part-2',
  'Prasna Marga Part II, Chapters XXI–XXII (Bhagyoday & Karma Prasna)':
    'https://www.mlbd.in/products/prasna-marga-part-2',
  'Prasna Marga Part II, Chapter XX (Pravasa Prasna)':
    'https://www.mlbd.in/products/prasna-marga-part-2',
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface UniversalPrasnaResearchProps {
  /** Whether the UI is in Hindi mode */
  isHi?: boolean;
  /** Optional: pre-fill the question from the parent page */
  initialQuestion?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const UniversalPrasnaResearch = ({
  isHi = false,
  initialQuestion = '',
}: UniversalPrasnaResearchProps) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [direction, setDirection] = useState<Direction>('East');
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<UniversalResearchPayload | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setPayload(null);

    // Simulate a brief processing delay (the Prasna Moment capture is synchronous)
    await new Promise(r => setTimeout(r, 600));

    const result = buildUniversalResearchPayload(question.trim(), direction, new Date());
    setPayload(result);
    setExpanded(true);
    setLoading(false);
  };

  const chapterLink = payload
    ? (CHAPTER_LINKS[payload.chapterFocus.chapterRef] ??
      'https://archive.org/stream/PrasnaMarga1_djvu')
    : '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmtTime = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  return (
    <div className="w-full rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-lg mb-6 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-700 to-orange-700">
        <BookOpen className="w-6 h-6 text-amber-100 shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg leading-tight">
            {isHi ? 'सार्वभौम प्रश्न अनुसंधान' : 'Universal Prasna Research'}
          </h2>
          <p className="text-amber-200 text-xs truncate">
            {isHi
              ? 'प्रश्न मार्ग (भाग I & II) — बी.वी. रमण | केरल होरारी परंपरा'
              : 'Prasna Marga (Parts I & II) — B.V. Raman | Kerala Horary Tradition'}
          </p>
        </div>
        <Badge variant="outline" className="text-amber-100 border-amber-300 text-xs shrink-0">
          {isHi ? 'शीर्ष उपकरण' : 'Top Tool'}
        </Badge>
      </div>

      {/* ── Input area ── */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Question input */}
          <div className="flex-1">
            <Label className={`text-amber-900 text-xs mb-1 block ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'अपना अनोखा प्रश्न पूछें' : 'Ask your unique question'}
            </Label>
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={
                isHi
                  ? 'उदा. क्या मेरा व्यवसाय सफल होगा? / क्या संतान होगी?'
                  : 'e.g. Will my business succeed? / Will I have children?'
              }
              className="border-amber-300 focus:border-amber-500 bg-white"
            />
          </div>

          {/* Direction selector */}
          <div className="sm:w-36">
            <Label className="text-amber-900 text-xs mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {isHi ? 'दिशा (अरुढ़)' : 'Direction (Arudha)'}
            </Label>
            <Select value={direction} onValueChange={v => setDirection(v as Direction)}>
              <SelectTrigger className="border-amber-300 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTIONS.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="sm:self-end">
            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isHi ? 'विश्लेषण...' : 'Analysing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isHi ? 'खोजें' : 'Research'}
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-amber-700">
          {isHi
            ? 'प्रश्न का क्षण स्वतः अंकित होगा — यही प्रश्न मुहूर्त है।'
            : 'The exact moment of submission is auto-captured as the Prasna Moment (sacred timestamp).'}
        </p>
      </div>

      {/* ── Result ── */}
      <AnimatePresence>
        {payload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-amber-200 px-5 py-4 space-y-4">
              {/* Prasna Moment banner */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-800 bg-amber-100 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{isHi ? 'प्रश्न क्षण:' : 'Prasna Moment:'}</span>
                <span className="font-mono">{fmtTime(payload.metadata.timestamp)}</span>
                <span>·</span>
                <span>{payload.metadata.dayName}</span>
                <span>·</span>
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>{payload.metadata.direction}</span>
                <span>·</span>
                <span>
                  {isHi ? 'प्राणाक्षर:' : 'Pranakshara:'}{' '}
                  <strong>{payload.metadata.pranakshara}</strong>
                </span>
              </div>

              {/* Section 1 — Astro-Logic Summary */}
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">
                    {isHi ? 'खंड १ — ज्योतिष सारांश' : 'Section 1 — Astro-Logic Summary'}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {isHi
                    ? `आपका प्रश्न "${payload.chapterFocus.queryType}" श्रेणी में आता है।`
                    : `Your question falls under the "${payload.chapterFocus.queryType}" category.`}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  {isHi
                    ? `प्रश्न मार्ग के अनुसार: ${payload.chapterFocus.chapterRef}`
                    : `According to Prasna Marga: ${payload.chapterFocus.chapterRef}`}
                </p>
                <p className="text-sm text-slate-600 mt-1 italic">
                  {payload.chapterFocus.chapterHint}
                </p>
              </div>

              {/* Section 2 — Core Method */}
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">
                    {isHi ? 'खंड २ — पंच सूत्र विधि' : 'Section 2 — Pancha Sutra Method'}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm text-slate-700">
                  {payload.chapterFocus.pancha_sutra.split(' → ').map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </Badge>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-amber-100 text-xs text-slate-500 space-y-1">
                  <div>
                    <span className="font-semibold">
                      {isHi ? 'अरुढ़ लग्न संकेत:' : 'Arudha Lagna hint:'}
                    </span>{' '}
                    {payload.metadata.direction} → {/* Re-derive from engine */}
                    {payload.researchPrompt.match(/ARUDHA LAGNA HINT: (.+)/)?.[1] ?? '—'}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {isHi ? 'प्राणाक्षर राशि:' : 'Pranakshara Rashi:'}
                    </span>{' '}
                    {payload.researchPrompt.match(/Rashi: (.+)/)?.[1] ?? '—'}
                  </div>
                </div>
              </div>

              {/* Section 3 — Advisory Answer */}
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">
                    {isHi ? 'खंड ३ — परामर्श उत्तर' : 'Section 3 — Advisory Answer'}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {isHi
                    ? `प्रश्न मार्ग की विधि के अनुसार, इस प्रश्न का विश्लेषण ${payload.chapterFocus.chapterRef} के सिद्धांतों से किया जाना चाहिए।`
                    : `Per Prasna Marga methodology, this question should be analysed through the principles of ${payload.chapterFocus.chapterRef}.`}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {isHi
                    ? 'नीचे दिए गए प्रश्न फ़ॉर्म में यही प्रश्न भरें और "उत्तर पाएं" दबाएं — पूर्ण ज्योतिषीय विश्लेषण मिलेगा।'
                    : 'Enter this question in the Prashna form below and click "Get Answer" for the full astrological verdict with planetary indicators.'}
                </p>
              </div>

              {/* Parihara (Remedial) — shown only when required */}
              {payload.parihara && (
                <Alert className="border-rose-300 bg-rose-50">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <AlertTitle className="text-rose-800">
                    {isHi ? 'परिहार (उपाय) आवश्यक' : 'Parihara (Remedial Measures) Advised'}
                  </AlertTitle>
                  <AlertDescription className="text-rose-700 space-y-1 text-sm mt-1">
                    {payload.parihara.deity && (
                      <p>
                        <strong>{isHi ? 'देवता:' : 'Deity:'}</strong> {payload.parihara.deity}
                      </p>
                    )}
                    {payload.parihara.mantra && (
                      <p>
                        <strong>{isHi ? 'मंत्र:' : 'Mantra:'}</strong> {payload.parihara.mantra}
                      </p>
                    )}
                    {payload.parihara.day && (
                      <p>
                        <strong>{isHi ? 'दिन:' : 'Day:'}</strong> {payload.parihara.day}
                      </p>
                    )}
                    {payload.parihara.ritual && (
                      <p>
                        <strong>{isHi ? 'अनुष्ठान:' : 'Ritual:'}</strong> {payload.parihara.ritual}
                      </p>
                    )}
                    <p className="text-xs italic mt-1">{payload.parihara.note}</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Collapsible: full research prompt */}
              <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-700 hover:text-amber-900 w-full justify-between"
                  >
                    <span className="text-xs">
                      {isHi ? 'पूर्ण शोध प्रॉम्प्ट देखें' : 'View full research prompt'}
                    </span>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-xs bg-slate-900 text-green-300 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap mt-2 font-mono leading-relaxed">
                    {payload.researchPrompt}
                  </pre>
                </CollapsibleContent>
              </Collapsible>

              {/* Footer: source + view source link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200">
                <p className="text-xs text-slate-500 italic">{payload.source}</p>
                <a
                  href={chapterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isHi ? 'स्रोत देखें' : 'View Source'}
                </a>
              </div>
              <p className="text-xs text-slate-400 italic">{payload.magazineNote}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniversalPrasnaResearch;
