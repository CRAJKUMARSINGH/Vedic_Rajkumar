/**
 * ProgenyAnalysisCard.tsx
 *
 * UI component for Santhana Prasna (Progeny Analysis)
 * Based on: Prasna Marga Part II, Chapter 18 — B.V. Raman
 *
 * Exposes the progenyRules.ts service in a user-friendly card:
 *   - Input form for chart positions (simplified for Prasna use)
 *   - Displays score, yoga flags, timing hint, and Parihara notes
 *   - Bilingual (EN / HI) support
 *   - "View Source" link to Prasna Marga Chapter 18
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Baby,
  ShieldAlert,
  Clock,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  analyzeProgeny,
  getProgenyUiCaption,
  type ProgenyInput,
  type ProgenyAnalysis,
  type PlanetPosition,
} from '@/services/progenyRules';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RASHIS_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const RASHIS_HI = [
  'मेष',
  'वृष',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुम्भ',
  'मीन',
];

/** Default neutral planet position */
const neutralPlanet = (rashi = 0): PlanetPosition => ({
  rashi,
  degree: 15,
  combust: false,
  debilitated: false,
  inMaleficSign: false,
  hasBeneficAspect: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ProgenyAnalysisCardProps {
  isHi?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Score bar helper
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? 'bg-emerald-500' : score >= 0.4 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className={`h-2.5 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const ProgenyAnalysisCard = ({ isHi = false }: ProgenyAnalysisCardProps) => {
  // Form state — simplified inputs for Prasna use
  const [isMale, setIsMale] = useState(true);
  const [lagnaRashi, setLagnaRashi] = useState(0);
  const [rahuRashi, setRahuRashi] = useState(4);
  const [saturnRashi, setSaturnRashi] = useState(9);
  const [gulikaRashi, setGulikaRashi] = useState(9);
  const [marsRashi, setMarsRashi] = useState(4);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProgenyAnalysis | null>(null);

  const rashiName = (i: number) => (isHi ? RASHIS_HI[i] : RASHIS_EN[i]);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    await new Promise(r => setTimeout(r, 500));

    // Build a Prasna-style input from the simplified form
    // 5th house = lagna + 4 (5th from lagna), 9th house = lagna + 8
    const fifthHouseRashi = (lagnaRashi + 4) % 12;
    const ninthHouseRashi = (lagnaRashi + 8) % 12;
    const arudhaLagnaRashi = (lagnaRashi + 6) % 12; // simplified: 7th from lagna

    // 5th lord = lord of 5th rashi (simplified: use Jupiter as universal 5th lord)
    const fifthLord: PlanetPosition = {
      rashi: fifthHouseRashi,
      degree: 10,
      combust: false,
      debilitated: false,
      inMaleficSign: [0, 3, 7, 9].includes(fifthHouseRashi), // Aries/Cancer/Scorpio/Cap as malefic for simplicity
      hasBeneficAspect: true,
    };

    const ninthLord: PlanetPosition = {
      rashi: ninthHouseRashi,
      degree: 10,
      combust: false,
      debilitated: false,
      inMaleficSign: [0, 3, 7, 9].includes(ninthHouseRashi),
      hasBeneficAspect: true,
    };

    const input: ProgenyInput = {
      isMale,
      lagnaRashi,
      arudhaLagnaRashi,
      fifthHouseRashi,
      fifthLord,
      ninthHouseRashi,
      ninthLord,
      gulika: neutralPlanet(gulikaRashi),
      rahu: { ...neutralPlanet(rahuRashi), hasBeneficAspect: false },
      saturn: { ...neutralPlanet(saturnRashi), hasBeneficAspect: false },
      mars: neutralPlanet(marsRashi),
      jupiter: neutralPlanet((lagnaRashi + 4) % 12),
      lagnaLord: neutralPlanet(lagnaRashi),
    };

    setAnalysis(analyzeProgeny(input));
    setLoading(false);
  };

  return (
    <Card className="border-amber-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
        <CardTitle className={`text-amber-900 flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <Baby className="w-5 h-5" />
          {isHi
            ? 'सन्तान प्रश्न — प्रश्न मार्ग अध्याय १८'
            : 'Santhana Prasna — Prasna Marga Chapter 18'}
        </CardTitle>
        <p className="text-xs text-amber-700 mt-1">
          {isHi
            ? 'बी.वी. रमण द्वारा अनुवादित प्रश्न मार्ग भाग II के आधार पर संतान विश्लेषण'
            : 'Progeny analysis per Prasna Marga Part II, Chapter 18 — B.V. Raman'}
        </p>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Caption */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <pre className="text-xs text-amber-800 whitespace-pre-wrap font-sans leading-relaxed">
            {getProgenyUiCaption()}
          </pre>
        </div>

        {/* Input form */}
        <div className="space-y-4">
          {/* Gender */}
          <div>
            <Label className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'प्रश्नकर्ता का लिंग' : 'Querent gender'}
            </Label>
            <RadioGroup
              value={isMale ? 'male' : 'female'}
              onValueChange={v => setIsMale(v === 'male')}
              className="flex gap-4 mt-1"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="male" id="pg-male" />
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'पुरुष (5वाँ भाव)' : 'Male (5th house)'}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="female" id="pg-female" />
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'स्त्री (9वाँ भाव)' : 'Female (9th house)'}
                </span>
              </label>
            </RadioGroup>
          </div>

          {/* Rashi selectors */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Lagna */}
            <div>
              <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'प्रश्न लग्न' : 'Prasna Lagna'}
              </Label>
              <Select value={String(lagnaRashi)} onValueChange={v => setLagnaRashi(Number(v))}>
                <SelectTrigger className="mt-1 border-amber-300">
                  <SelectValue>{rashiName(lagnaRashi)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RASHIS_EN.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {rashiName(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rahu */}
            <div>
              <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'राहु राशि' : 'Rahu Rashi'}
              </Label>
              <Select value={String(rahuRashi)} onValueChange={v => setRahuRashi(Number(v))}>
                <SelectTrigger className="mt-1 border-amber-300">
                  <SelectValue>{rashiName(rahuRashi)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RASHIS_EN.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {rashiName(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Saturn */}
            <div>
              <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'शनि राशि' : 'Saturn Rashi'}
              </Label>
              <Select value={String(saturnRashi)} onValueChange={v => setSaturnRashi(Number(v))}>
                <SelectTrigger className="mt-1 border-amber-300">
                  <SelectValue>{rashiName(saturnRashi)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RASHIS_EN.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {rashiName(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gulika */}
            <div>
              <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'गुलिका राशि' : 'Gulika Rashi'}
              </Label>
              <Select value={String(gulikaRashi)} onValueChange={v => setGulikaRashi(Number(v))}>
                <SelectTrigger className="mt-1 border-amber-300">
                  <SelectValue>{rashiName(gulikaRashi)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RASHIS_EN.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {rashiName(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mars */}
            <div>
              <Label className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'मंगल राशि' : 'Mars Rashi'}
              </Label>
              <Select value={String(marsRashi)} onValueChange={v => setMarsRashi(Number(v))}>
                <SelectTrigger className="mt-1 border-amber-300">
                  <SelectValue>{rashiName(marsRashi)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RASHIS_EN.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {rashiName(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isHi ? 'विश्लेषण...' : 'Analysing...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {isHi ? 'संतान विश्लेषण करें' : 'Analyse Progeny'}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-4"
            >
              {/* Score */}
              <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold text-amber-900 ${isHi ? 'font-hindi' : ''}`}
                  >
                    {isHi ? 'संतान शक्ति स्कोर' : 'Progeny Strength Score'}
                  </span>
                  <Badge
                    variant={
                      analysis.flags.strongProgeny
                        ? 'default'
                        : analysis.flags.weakProgeny
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {Math.round(analysis.score * 100)}%
                  </Badge>
                </div>
                <ScoreBar score={analysis.score} />
                <p className="text-xs text-slate-600 italic">{analysis.summary}</p>
              </div>

              {/* Yoga flags */}
              <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-2">
                <p
                  className={`text-sm font-semibold text-amber-900 mb-2 ${isHi ? 'font-hindi' : ''}`}
                >
                  {isHi ? 'योग संकेत' : 'Yoga Flags'}
                </p>
                {[
                  {
                    flag: analysis.flags.strongProgeny,
                    label: isHi ? 'बलवान संतान योग' : 'Strong progeny yoga',
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                    positive: true,
                  },
                  {
                    flag: analysis.flags.hasMarsConceptionYoga,
                    label: isHi
                      ? 'मंगल गर्भाधान योग (5वें में मंगल + गुरु दृष्टि)'
                      : 'Mars conception yoga (Mars in 5th + Jupiter aspect)',
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                    positive: true,
                  },
                  {
                    flag: analysis.flags.hasSerpentCurse,
                    label: isHi
                      ? 'सर्पदोष (राहु 5वें में, बिना शुभ दृष्टि)'
                      : 'Serpent-god curse (Rahu in 5th, no benefic aspect)',
                    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
                    positive: false,
                  },
                  {
                    flag: analysis.flags.hasKarmicCurse,
                    label: isHi
                      ? 'पितृदोष (शनि + गुलिका 1/5/9 में)'
                      : 'Karmic/manes-curse (Saturn + Gulika in 1/5/9)',
                    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
                    positive: false,
                  },
                  {
                    flag: analysis.flags.likelyBarrenness,
                    label: isHi
                      ? 'वंध्यत्व संकेत (5वें/9वें स्वामी पीड़ित)'
                      : 'Barrenness indicator (5th/9th lord afflicted)',
                    icon: <XCircle className="w-4 h-4 text-rose-600" />,
                    positive: false,
                  },
                  {
                    flag: analysis.flags.weakProgeny,
                    label: isHi ? 'दुर्बल संतान योग' : 'Weak progeny yoga',
                    icon: <XCircle className="w-4 h-4 text-rose-600" />,
                    positive: false,
                  },
                ]
                  .filter(item => item.flag)
                  .map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                        item.positive
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}
                    >
                      {item.icon}
                      <span className={isHi ? 'font-hindi' : ''}>{item.label}</span>
                    </div>
                  ))}
                {!analysis.flags.strongProgeny &&
                  !analysis.flags.hasMarsConceptionYoga &&
                  !analysis.flags.hasSerpentCurse &&
                  !analysis.flags.hasKarmicCurse &&
                  !analysis.flags.likelyBarrenness &&
                  !analysis.flags.weakProgeny && (
                    <p className="text-xs text-slate-500 italic">
                      {isHi
                        ? 'कोई विशेष योग नहीं — सामान्य स्थिति।'
                        : 'No special yogas detected — neutral position.'}
                    </p>
                  )}
              </div>

              {/* Timing */}
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span
                    className={`text-sm font-semibold text-amber-900 ${isHi ? 'font-hindi' : ''}`}
                  >
                    {isHi ? 'संतान काल संकेत' : 'Progeny Timing Hint'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800">{analysis.timing.window}</p>
                <p className="text-xs text-slate-500 mt-1 italic">{analysis.timing.basis}</p>
                <Badge variant="outline" className="text-xs mt-2">
                  {analysis.timing.chapterRef}
                </Badge>
              </div>

              {/* Parihara notes */}
              {analysis.pariharaNotes.length > 0 && (
                <Alert className="border-rose-300 bg-rose-50">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <AlertTitle className={`text-rose-800 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? 'परिहार (उपाय) आवश्यक' : 'Parihara (Remedial Measures) Advised'}
                  </AlertTitle>
                  <AlertDescription className="text-rose-700 space-y-2 text-sm mt-1">
                    {analysis.pariharaNotes.map((note, i) => (
                      <p key={i}>{note}</p>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reference + source link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200">
                <p className="text-xs text-slate-500 italic">{analysis.reference}</p>
                <a
                  href="https://www.mlbd.in/products/prasna-marga-part-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isHi ? 'स्रोत देखें' : 'View Source'}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default ProgenyAnalysisCard;
