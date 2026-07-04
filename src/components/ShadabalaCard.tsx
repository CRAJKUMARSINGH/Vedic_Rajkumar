/**
 * Shadbala Card — Six-fold Planetary Strength Display
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { calculateShadbala, type ShadabalaResult } from '@/services/shadabalaService';
import type { SupportedLanguage } from '@/services/multiLanguageService';

interface Props {
  planets: Array<{
    name: string; rashiIndex: number; house: number;
    degrees: number; isRetrograde: boolean; longitude: number;
  }>;
  isDaytime?: boolean;
  birthMonth?: number;
  lang: SupportedLanguage;
}

const STRENGTH_BADGE: Record<string, string> = {
  'very-strong': 'bg-green-700',
  'strong':      'bg-green-500',
  'average':     'bg-yellow-500',
  'weak':        'bg-orange-500',
  'very-weak':   'bg-red-600',
};

const BALA_LABELS = {
  en: ['Sthana', 'Dig', 'Kala', 'Chesta', 'Naisargika', 'Drik'],
  hi: ['स्थान', 'दिग्', 'काल', 'चेष्टा', 'नैसर्गिक', 'दृक्'],
};

function PlanetRow({ result, isHi }: { result: ShadabalaResult; isHi: boolean }) {
  const [open, setOpen] = useState(false);
  const badgeClass = STRENGTH_BADGE[result.strength] || 'bg-muted';
  const pct = Math.min(100, (result.shadabalaRatio * 100)).toFixed(0);

  return (
    <div className={`border rounded-lg overflow-hidden ${result.isStrong ? 'border-green-400' : 'border-orange-300'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>{result.planet}</span>
          <Badge className={`${badgeClass} text-white text-xs`}>
            {isHi ? result.label.hi : result.label.en}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${result.isStrong ? 'bg-green-500' : 'bg-orange-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">
            {result.totalRupas.toFixed(2)}/{result.requiredRupas}
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              result.sthanaBala, result.digBala, result.kalaBala,
              result.chestaBala, result.naisargikaBala, result.drikBala,
            ].map((val, i) => (
              <div key={i} className="bg-muted/30 rounded p-2 text-center">
                <p className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? BALA_LABELS.hi[i] : BALA_LABELS.en[i]}
                </p>
                <p className="font-bold">{val.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <p className={`text-xs text-muted-foreground mt-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi
              ? `षड्बल अनुपात: ${result.shadabalaRatio.toFixed(2)} (आवश्यक: 1.0)`
              : `Shadbala ratio: ${result.shadabalaRatio.toFixed(2)} (required: 1.0)`}
          </p>
        </div>
      )}
    </div>
  );
}

const ShadabalaCard = ({ planets, isDaytime = true, birthMonth = 1, lang }: Props) => {
  const isHi = lang === 'hi';

  let analysis;
  try {
    analysis = calculateShadbala(planets, isDaytime, birthMonth);
  } catch {
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">⚖️</span>
          {isHi ? 'षड्बल' : 'Shadbala'}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'छह-गुना ग्रह शक्ति विश्लेषण • BPHS' : 'Six-fold planetary strength analysis • BPHS'}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="bg-muted/40 rounded-lg p-3 text-sm">
          <p className={isHi ? 'font-hindi' : ''}>{isHi ? analysis.summary.hi : analysis.summary.en}</p>
        </div>

        <div className="space-y-2">
          {analysis.planets.map(result => (
            <PlanetRow key={result.planet} result={result} isHi={isHi} />
          ))}
        </div>

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ षड्बल गणना सरलीकृत एल्गोरिदम पर आधारित है। पूर्ण गणना के लिए स्विस एफेमेरिस आवश्यक है।'
            : '⚠️ Shadbala uses simplified algorithms. Full precision requires Swiss Ephemeris integration.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default ShadabalaCard;
