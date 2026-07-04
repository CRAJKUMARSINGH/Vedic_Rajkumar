/**
 * Yoga Card Component
 * Displays detected Vedic astrology yogas with strength indicators
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeYogas, type YogaResult } from '@/services/yogaService';
import type { SupportedLanguage } from '@/services/multiLanguageService';

interface YogaCardProps {
  planets: Array<{ name: string; rashiIndex: number; house: number; degrees: number; isRetrograde?: boolean }>;
  ascendantRashi?: number;
  lang: SupportedLanguage;
}

const CATEGORY_COLORS: Record<string, string> = {
  raj:         'bg-amber-100 border-amber-400 dark:bg-amber-950/30',
  dhana:       'bg-green-100 border-green-400 dark:bg-green-950/30',
  mahapurusha: 'bg-blue-100 border-blue-400 dark:bg-blue-950/30',
  dosha:       'bg-red-100 border-red-400 dark:bg-red-950/30',
  spiritual:   'bg-purple-100 border-purple-400 dark:bg-purple-950/30',
  special:     'bg-indigo-100 border-indigo-400 dark:bg-indigo-950/30',
};

const STRENGTH_BADGE: Record<string, string> = {
  strong:   'bg-green-600',
  moderate: 'bg-yellow-600',
  weak:     'bg-slate-400',
};

const CATEGORY_LABEL: Record<string, { en: string; hi: string }> = {
  raj:         { en: 'Raj Yoga', hi: 'राज योग' },
  dhana:       { en: 'Dhana Yoga', hi: 'धन योग' },
  mahapurusha: { en: 'Panch Mahapurusha', hi: 'पंच महापुरुष' },
  dosha:       { en: 'Dosha', hi: 'दोष' },
  spiritual:   { en: 'Spiritual', hi: 'आध्यात्मिक' },
  special:     { en: 'Special', hi: 'विशेष' },
};

function YogaRow({ yoga, isHi }: { yoga: YogaResult; isHi: boolean }) {
  const [open, setOpen] = useState(false);
  const colorClass = CATEGORY_COLORS[yoga.category] || 'bg-muted border-border';

  return (
    <div className={`border rounded-lg overflow-hidden ${colorClass}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? yoga.nameHi : yoga.name}
          </span>
          <Badge className={`${STRENGTH_BADGE[yoga.strength]} text-white text-xs`}>
            {isHi
              ? yoga.strength === 'strong' ? 'बलवान' : yoga.strength === 'moderate' ? 'मध्यम' : 'कमजोर'
              : yoga.strength}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {isHi ? CATEGORY_LABEL[yoga.category]?.hi : CATEGORY_LABEL[yoga.category]?.en}
          </Badge>
        </div>
        {open ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2">
          <p className={`text-sm leading-relaxed ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? yoga.description.hi : yoga.description.en}
          </p>
          {yoga.planets.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {isHi ? 'ग्रह: ' : 'Planets: '}
              {yoga.planets.join(', ')}
              {yoga.houses.filter(h => h > 0).length > 0 && (
                <> | {isHi ? 'भाव: ' : 'Houses: '}{yoga.houses.filter(h => h > 0).join(', ')}</>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const YogaCard = ({ planets, ascendantRashi = 0, lang }: YogaCardProps) => {
  const isHi = lang === 'hi';
  const [showAbsent, setShowAbsent] = useState(false);

  const analysis = analyzeYogas(planets, ascendantRashi);
  const { presentYogas, yogas, summary } = analysis;
  const absentYogas = yogas.filter(y => !y.isPresent);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">✨</span>
          {isHi ? 'योग विश्लेषण' : 'Yoga Analysis'}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? summary.hi : summary.en}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/50 dark:bg-black/20 border border-border rounded-xl p-3 text-center transition-all hover:shadow-sm">
            <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{presentYogas.length}</p>
            <p className={`text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'उपस्थित योग' : 'Present'}
            </p>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 text-center transition-all hover:shadow-sm">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{analysis.rajYogas.length}</p>
            <p className={`text-[10px] uppercase tracking-wider font-semibold text-amber-700/70 dark:text-amber-500/70 mt-1 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'राज योग' : 'Raj Yogas'}
            </p>
          </div>
          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3 text-center transition-all hover:shadow-sm">
            <p className="text-3xl font-bold text-red-600 dark:text-red-500">{analysis.doshaYogas.length}</p>
            <p className={`text-[10px] uppercase tracking-wider font-semibold text-red-700/70 dark:text-red-500/70 mt-1 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'दोष' : 'Doshas'}
            </p>
          </div>
        </div>

        {/* Grouped Present Yogas */}
        {presentYogas.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(CATEGORY_LABEL).map(([cat, label]) => {
              const catYogas = presentYogas.filter(y => y.category === cat);
              if (catYogas.length === 0) return null;

              return (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-4 rounded-full ${cat === 'dosha' ? 'bg-red-500' : cat === 'raj' ? 'bg-amber-500' : 'bg-primary'}`} />
                    <h3 className={`text-sm font-bold tracking-tight text-foreground/80 ${isHi ? 'font-hindi text-base' : ''}`}>
                      {isHi ? label.hi : label.en}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 opacity-70">
                      {catYogas.length}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {catYogas.map((yoga, i) => (
                      <YogaRow key={i} yoga={yoga} isHi={isHi} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl bg-muted/20">
            <span className="text-4xl block mb-2 opacity-20">✨</span>
            <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'कोई प्रमुख योग नहीं मिला।' : 'No major yogas detected in this chart.'}
            </p>
          </div>
        )}

        {/* Absent Yogas toggle */}
        {absentYogas.length > 0 && (
          <div>
            <button
              onClick={() => setShowAbsent(s => !s)}
              className={`text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground ${isHi ? 'font-hindi' : ''}`}
            >
              {showAbsent
                ? (isHi ? 'अनुपस्थित योग छुपाएं' : 'Hide absent yogas')
                : (isHi ? `${absentYogas.length} अनुपस्थित योग दिखाएं` : `Show ${absentYogas.length} absent yogas`)}
            </button>
            {showAbsent && (
              <div className="mt-2 space-y-1">
                {absentYogas.map((yoga, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/30 opacity-60 text-sm">
                    <span className={`text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {isHi ? yoga.nameHi : yoga.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {isHi ? 'अनुपस्थित' : 'Absent'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ योग विश्लेषण ग्रहों की स्थिति पर आधारित है। पूर्ण फल के लिए दशा और गोचर का भी विचार करें।'
            : '⚠️ Yoga analysis is based on planetary positions. Consider Dasha and transits for complete results.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default YogaCard;
