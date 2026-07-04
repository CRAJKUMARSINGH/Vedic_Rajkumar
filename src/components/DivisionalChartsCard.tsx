/**
 * Divisional Charts Card — ShodashVarga Display
 * Shows D1, D9 (Navamsha), D10 (Dashamsha) prominently + all 16 charts
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  calculateShodashVarga,
  getVargottamaPlanets,
  type DivisionalChart,
} from '@/services/divisionalChartsService';
import type { SupportedLanguage } from '@/services/multiLanguageService';

const RASHI_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const RASHI_NAMES = [
  { en: 'Aries', hi: 'मेष' }, { en: 'Taurus', hi: 'वृष' }, { en: 'Gemini', hi: 'मिथुन' },
  { en: 'Cancer', hi: 'कर्क' }, { en: 'Leo', hi: 'सिंह' }, { en: 'Virgo', hi: 'कन्या' },
  { en: 'Libra', hi: 'तुला' }, { en: 'Scorpio', hi: 'वृश्चिक' }, { en: 'Sagittarius', hi: 'धनु' },
  { en: 'Capricorn', hi: 'मकर' }, { en: 'Aquarius', hi: 'कुंभ' }, { en: 'Pisces', hi: 'मीन' },
];

interface Props {
  planetLongitudes: Record<string, number>;
  ascendantLongitude: number;
  lang: SupportedLanguage;
}

function ChartGrid({ chart, isHi }: { chart: DivisionalChart; isHi: boolean }) {
  // Group planets by varga rashi
  const byRashi: Record<number, string[]> = {};
  for (const pos of chart.positions) {
    if (!byRashi[pos.vargaRashi]) byRashi[pos.vargaRashi] = [];
    byRashi[pos.vargaRashi].push(pos.planet);
  }

  return (
    <div className="grid grid-cols-6 gap-0.5 text-xs">
      {Array.from({ length: 12 }, (_, i) => {
        const isAsc = i === chart.ascendantRashi;
        const planets = byRashi[i] || [];
        return (
          <div
            key={i}
            className={`border rounded p-1 min-h-[40px] ${isAsc ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}`}
          >
            <div className={`text-muted-foreground text-center ${isHi ? 'font-hindi' : ''}`}>
              {RASHI_SYMBOLS[i]}
            </div>
            <div className="text-center font-medium text-primary/80">
              {isAsc && <span className="text-primary">Asc</span>}
              {planets.map((p, j) => (
                <div key={j} className="truncate">{p.slice(0, 3)}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartRow({ chart, isHi, vargottamas }: { chart: DivisionalChart; isHi: boolean; vargottamas: string[] }) {
  const [open, setOpen] = useState(false);

  const exaltedPlanets = chart.positions.filter(p => p.isExalted).map(p => p.planet);
  const ownSignPlanets = chart.positions.filter(p => p.isOwnSign).map(p => p.planet);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{isHi ? chart.nameHi : chart.name}</span>
            {exaltedPlanets.length > 0 && (
              <Badge className="bg-green-600 text-white text-xs">
                ↑ {exaltedPlanets.join(', ')}
              </Badge>
            )}
            {ownSignPlanets.length > 0 && (
              <Badge variant="outline" className="text-xs">
                ⌂ {ownSignPlanets.join(', ')}
              </Badge>
            )}
          </div>
          <p className={`text-xs text-muted-foreground mt-0.5 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? chart.purpose.hi : chart.purpose.en}
          </p>
        </div>
        <span className="text-muted-foreground ml-2">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-3 space-y-3">
          <ChartGrid chart={chart} isHi={isHi} />

          {/* Planet positions list */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            {chart.positions.map(pos => (
              <div key={pos.planet} className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                <span className="font-medium w-16">{pos.planet}</span>
                <span>{RASHI_SYMBOLS[pos.vargaRashi]}</span>
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? RASHI_NAMES[pos.vargaRashi].hi : RASHI_NAMES[pos.vargaRashi].en}
                </span>
                {pos.isExalted && <Badge className="bg-green-600 text-white text-xs px-1">↑</Badge>}
                {pos.isDebilitated && <Badge className="bg-red-600 text-white text-xs px-1">↓</Badge>}
                {pos.isOwnSign && <Badge variant="outline" className="text-xs px-1">⌂</Badge>}
                {vargottamas.includes(pos.planet) && chart.division === 9 && (
                  <Badge className="bg-purple-600 text-white text-xs px-1">V</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DivisionalChartsCard = ({ planetLongitudes, ascendantLongitude, lang }: Props) => {
  const isHi = lang === 'hi';
  const [showAll, setShowAll] = useState(false);

  let result;
  try {
    result = calculateShodashVarga(planetLongitudes, ascendantLongitude);
  } catch {
    return null;
  }

  const vargottamas = getVargottamaPlanets(result);
  const priorityCharts = result.charts.filter(c => [1, 9, 10].includes(c.division));
  const otherCharts = result.charts.filter(c => ![1, 9, 10].includes(c.division));

  // Top planets by Vimshopaka Bala
  const topPlanets = (Object.entries(result.vimshopakaBala) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">🗂️</span>
          {isHi ? 'षोडशवर्ग (विभागीय कुंडलियां)' : 'ShodashVarga (Divisional Charts)'}
        </CardTitle>
        <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? '16 विभागीय कुंडलियां • D1 से D60' : '16 divisional charts • D1 to D60'}
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Vargottama & Vimshopaka summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'वर्गोत्तम ग्रह (D1=D9)' : 'Vargottama Planets (D1=D9)'}
            </p>
            {vargottamas.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {vargottamas.map(p => (
                  <Badge key={p} className="bg-purple-600 text-white text-xs">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'कोई नहीं' : 'None'}
              </p>
            )}
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className={`text-xs text-muted-foreground mb-1 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'विंशोपक बल (शीर्ष 3)' : 'Vimshopaka Bala (Top 3)'}
            </p>
            <div className="space-y-0.5">
              {topPlanets.map(([planet, pts]) => (
                <div key={planet} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{planet}</span>
                  <span className="text-muted-foreground">{pts.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Varga Dignity Titles */}
        {Object.keys(result.vargaDignities).length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg p-3">
            <p className={`text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1 ${isHi ? 'font-hindi' : ''}`}>
              <span className="text-sm">🏆</span>
              {isHi ? 'विशेष वर्ग संज्ञा (षोडशवर्ग):' : 'Varga Dignity Titles (Shodashvarga):'}
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(result.vargaDignities) as [string, { name: string; nameHi: string; count: number }][])
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([planet, dignity]) => (
                  <div key={planet} className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-amber-100/50 dark:border-amber-900/30">
                    <span className="text-xs font-bold text-primary">{planet}</span>
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-1.5 py-0 h-4 border-none">
                      {isHi ? dignity.nameHi : dignity.name}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">({dignity.count}/16)</span>
                  </div>
                ))}
            </div>
            <p className={`text-[10px] text-amber-700/70 dark:text-amber-500/50 mt-2 italic ${isHi ? 'font-hindi' : ''}`}>
              {isHi 
                ? '* पारिजात से श्रीधर तक की संज्ञाएं 2 या अधिक वर्गों में स्वराशि/उच्च होने पर दी जाती हैं।' 
                : '* Titles from Parijata to Shridhara denote strength in 2 or more divisional charts.'}
            </p>
          </div>
        )}

        {/* Priority charts: D1, D9, D10 */}
        <div className="space-y-2">
          <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'प्रमुख कुंडलियां:' : 'Key Charts:'}
          </p>
          {priorityCharts.map(chart => (
            <ChartRow key={chart.division} chart={chart} isHi={isHi} vargottamas={vargottamas} />
          ))}
        </div>

        {/* Other charts */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAll(s => !s)}
            className={`text-sm text-primary underline underline-offset-2 hover:text-primary/80 ${isHi ? 'font-hindi' : ''}`}
          >
            {showAll
              ? (isHi ? 'अन्य कुंडलियां छुपाएं' : 'Hide other charts')
              : (isHi ? `${otherCharts.length} अन्य कुंडलियां दिखाएं` : `Show ${otherCharts.length} more charts`)}
          </button>
          {showAll && otherCharts.map(chart => (
            <ChartRow key={chart.division} chart={chart} isHi={isHi} vargottamas={vargottamas} />
          ))}
        </div>

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ विभागीय कुंडलियां ग्रहों की सटीक देशांतर स्थिति पर निर्भर हैं। सटीक जन्म समय आवश्यक है।'
            : '⚠️ Divisional charts depend on precise planetary longitudes. Accurate birth time is essential.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default DivisionalChartsCard;
