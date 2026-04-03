/**
 * TajikCard — Varshphal (Annual Horoscope) inline display
 */
import { useMemo } from 'react';
import { analyzeTajik, type TajikPlanet } from '@/services/tajikService';

interface Props {
  planets: TajikPlanet[];
  birthAscendantRashi: number;
  birthYear: number;
  targetYear?: number;
  lang: 'en' | 'hi';
}

const QUALITY_COLORS = {
  excellent: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
  good: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20',
  mixed: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
  challenging: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20',
};

const QUALITY_ICONS = { excellent: '✨', good: '✅', mixed: '⚖️', challenging: '⚠️' };

export default function TajikCard({ planets, birthAscendantRashi, birthYear, targetYear, lang }: Props) {
  const isHi = lang === 'hi';
  const year = targetYear ?? new Date().getFullYear();

  const analysis = useMemo(
    () => analyzeTajik(planets, birthAscendantRashi, birthYear, year),
    [planets, birthAscendantRashi, birthYear, year],
  );

  const presentYogas = analysis.yogas.filter(y => y.isPresent);
  const chart = analysis.varshphalChart;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <div>
          <h2 className={`text-lg font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? `वर्षफल ${year}` : `Varshphal ${year}`}
          </h2>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'ताजिक पद्धति • वार्षिक कुंडली' : 'Tajik System • Annual Horoscope'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <p className={`text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 ${isHi ? 'font-hindi' : ''}`}>
        {isHi ? analysis.summary.hi : analysis.summary.en}
      </p>

      {/* Year overview row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">{isHi ? 'वर्ष लग्न' : 'Year Asc.'}</div>
          <div className="text-sm font-bold text-violet-700 dark:text-violet-300">{chart.ascendantName}</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">{isHi ? 'वर्षेश' : 'Year Lord'}</div>
          <div className="text-sm font-bold text-amber-700 dark:text-amber-300">{analysis.yearLord?.planet ?? '—'}</div>
          <div className="text-xs text-muted-foreground">H{analysis.yearLord?.house ?? '?'} · {analysis.yearLord?.strength}</div>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">{isHi ? 'मुंथा' : 'Muntha'}</div>
          <div className="text-sm font-bold text-teal-700 dark:text-teal-300">{chart.muntha.rashiName}</div>
          <div className="text-xs text-muted-foreground">H{chart.muntha.house}</div>
        </div>
      </div>

      {/* Muntha meaning */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-3">
        <p className={`text-xs text-teal-800 dark:text-teal-200 ${isHi ? 'font-hindi' : ''}`}>
          🌙 {isHi ? chart.muntha.meaning.hi : chart.muntha.meaning.en}
        </p>
      </div>

      {/* Tajik Yogas */}
      {presentYogas.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? `ताजिक योग (${presentYogas.length} सक्रिय)` : `Tajik Yogas (${presentYogas.length} active)`}
          </h3>
          <div className="space-y-2">
            {presentYogas.map(yoga => (
              <div key={yoga.name}
                className={`border rounded-lg p-3 ${yoga.type === 'benefic' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' : yoga.type === 'malefic' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? yoga.nameHi : yoga.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${yoga.type === 'benefic' ? 'bg-emerald-200 text-emerald-800' : yoga.type === 'malefic' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                    {yoga.type}
                  </span>
                </div>
                <p className={`text-xs opacity-80 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? yoga.description.hi : yoga.description.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sahams */}
      <div>
        <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'सहम (अरबी भाग)' : 'Sahams (Arabic Parts)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.sahams.map(s => (
            <div key={s.name} className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? s.nameHi : s.name}
                </span>
                <span className="text-xs font-bold text-primary">{s.rashiName} {s.degrees.toFixed(1)}°</span>
              </div>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? s.meaning.hi : s.meaning.en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Predictions — top 6 houses */}
      <div>
        <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'वार्षिक भविष्यवाणी' : 'Annual Predictions'}
        </h3>
        <div className="space-y-2">
          {analysis.annualPredictions.slice(0, 6).map(p => (
            <div key={p.house} className={`rounded-lg p-3 ${QUALITY_COLORS[p.quality]}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold">H{p.house}</span>
                <span className={`text-xs font-semibold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? p.topicHi : p.topic}
                </span>
                <span className="ml-auto text-sm">{QUALITY_ICONS[p.quality]}</span>
              </div>
              <p className={`text-xs opacity-90 ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? p.prediction.hi : p.prediction.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
