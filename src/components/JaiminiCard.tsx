/**
 * JaiminiCard — displays Jaimini system analysis inline on the main page
 */
import { useMemo } from 'react';
import { analyzeJaimini, type JaiminiPlanet } from '@/services/jaiminiService';

interface Props {
  planets: JaiminiPlanet[];
  ascendantRashi: number;
  ascendantDegrees: number;
  birthYear: number;
  lang: 'en' | 'hi';
}

const KARAKA_COLORS: Record<string, string> = {
  Atmakaraka: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300',
  Amatyakaraka: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300',
  Bhratrukaraka: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300',
  Matrukaraka: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300',
  Putrakaraka: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300',
  Gnatikaraka: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-300',
  Darakaraka: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export default function JaiminiCard({ planets, ascendantRashi, ascendantDegrees, birthYear, lang }: Props) {
  const isHi = lang === 'hi';

  const analysis = useMemo(
    () => analyzeJaimini(planets, ascendantRashi, ascendantDegrees, birthYear),
    [planets, ascendantRashi, ascendantDegrees, birthYear],
  );

  const presentYogas = analysis.yogas.filter(y => y.isPresent);

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔮</span>
        <div>
          <h2 className={`text-lg font-bold text-secondary ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'जैमिनी ज्योतिष' : 'Jaimini Astrology'}
          </h2>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'चर कारक • आरूढ लग्न • चर दशा' : 'Chara Karakas • Arudha Lagna • Chara Dasha'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <p className={`text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 ${isHi ? 'font-hindi' : ''}`}>
        {isHi ? analysis.summary.hi : analysis.summary.en}
      </p>

      {/* Chara Karakas */}
      <div>
        <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'चर कारक (7 कारक)' : 'Chara Karakas (7 Significators)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.karakas.map(k => (
            <div
              key={k.karaka}
              className={`border rounded-lg p-3 ${KARAKA_COLORS[k.karaka] ?? 'bg-muted'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? k.karakaHi : k.karaka}
                </span>
                <span className="text-base">{PLANET_SYMBOLS[k.planet] ?? '★'}</span>
              </div>
              <div className="text-sm font-semibold">{k.planet}</div>
              <div className="text-xs opacity-75">{k.degrees.toFixed(1)}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arudha Lagna */}
      {analysis.padaLagna && (
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🪞</span>
            <h3 className={`text-sm font-semibold text-violet-800 dark:text-violet-200 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'आरूढ लग्न (AL)' : 'Arudha Lagna (AL)'}
            </h3>
            <span className="ml-auto text-sm font-bold text-violet-700 dark:text-violet-300">
              {analysis.padaLagna.rashiName}
            </span>
          </div>
          <p className={`text-xs text-violet-700 dark:text-violet-300 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? analysis.padaLagna.meaning.hi : analysis.padaLagna.meaning.en}
          </p>
        </div>
      )}

      {/* Jaimini Yogas */}
      {presentYogas.length > 0 && (
        <div>
          <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? `जैमिनी योग (${presentYogas.length} सक्रिय)` : `Jaimini Yogas (${presentYogas.length} active)`}
          </h3>
          <div className="space-y-2">
            {presentYogas.map(yoga => (
              <div key={yoga.name} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold text-emerald-800 dark:text-emerald-200 ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? yoga.nameHi : yoga.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    yoga.strength === 'strong' ? 'bg-emerald-200 text-emerald-800' :
                    yoga.strength === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {yoga.strength}
                  </span>
                </div>
                <p className={`text-xs text-emerald-700 dark:text-emerald-300 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? yoga.description.hi : yoga.description.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chara Dasha — first 6 periods */}
      <div>
        <h3 className={`text-sm font-semibold mb-3 ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'चर दशा (राशि दशा)' : 'Chara Dasha (Sign Dasha)'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className={`text-left py-1 pr-3 font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'राशि' : 'Sign'}</th>
                <th className={`text-center py-1 pr-3 font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'वर्ष' : 'Years'}</th>
                <th className={`text-center py-1 font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'आयु' : 'Age'}</th>
              </tr>
            </thead>
            <tbody>
              {analysis.charaDasha.slice(0, 6).map((d, i) => (
                <tr key={d.rashi} className={`border-b border-border/50 ${i === 0 ? 'bg-primary/5 font-semibold' : ''}`}>
                  <td className="py-1.5 pr-3">{d.rashiName}</td>
                  <td className="py-1.5 pr-3 text-center">{d.years}</td>
                  <td className="py-1.5 text-center text-muted-foreground">{d.startAge}–{d.endAge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
