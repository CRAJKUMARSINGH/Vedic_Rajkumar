/**
 * DashaGocharaCard — Dasha-Gochar Correlation
 * Source: BV Raman Magazine Enhancement Plan — Feature 4
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDashaGochaCorrelation } from '@/services/dashaGocharaCorrelationService';

interface Props {
  dashaLord: string;
  antarLord: string;
  transitHouses: Record<string, number>;
  lang: 'en' | 'hi';
}

const PLANET_SYMBOL: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};
const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगल',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु',
};
const ACT_COLOR: Record<string, string> = {
  High: 'bg-green-600 text-white',
  Medium: 'bg-amber-500 text-white',
  Low: 'bg-red-600 text-white',
};
const ACT_BG: Record<string, string> = {
  High: 'border-green-400 bg-green-50 dark:bg-green-950/20',
  Medium: 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
  Low: 'border-red-400 bg-red-50 dark:bg-red-950/20',
};

export default function DashaGocharaCard({ dashaLord, antarLord, transitHouses, lang }: Props) {
  const isHi = lang === 'hi';
  const r = calculateDashaGochaCorrelation(dashaLord, antarLord, transitHouses);
  const actLabel =
    r.activationLevel === 'High'
      ? isHi
        ? 'उच्च सक्रियता'
        : 'High Activation'
      : r.activationLevel === 'Medium'
        ? isHi
          ? 'मध्यम सक्रियता'
          : 'Medium Activation'
        : isHi
          ? 'निम्न सक्रियता'
          : 'Low Activation';

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-amber-800 dark:text-amber-300 ${isHi ? 'font-hindi' : ''}`}
        >
          <span className="text-2xl">⚡</span>
          {isHi ? 'दशा-गोचर संगम' : 'Dasha–Gochar Correlation'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '"गोचर फल तभी मिलता है जब दशा का समर्थन हो" — बी.वी. रमण'
            : '"Transit results manifest only when supported by Dasha" — B.V. Raman'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {[
            {
              lord: dashaLord,
              label: isHi ? 'महादशा' : 'Mahadasha',
              house: r.dashaLordHouseFromMoon,
              fav: r.dashaLordFavorable,
            },
            {
              lord: antarLord,
              label: isHi ? 'अंतर्दशा' : 'Antardasha',
              house: r.antarLordHouseFromMoon,
              fav: r.antarLordFavorable,
            },
          ].map(({ lord, label, house, fav }) => (
            <div
              key={lord}
              className="bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="text-lg">{PLANET_SYMBOL[lord]}</span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`font-semibold text-sm ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? PLANET_HI[lord] : lord}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {isHi ? `भाव ${house}` : `H${house}`}
              </Badge>
              <Badge className={`text-xs ${fav ? 'bg-green-600' : 'bg-red-500'} text-white`}>
                {fav ? '✓' : '✗'}
              </Badge>
            </div>
          ))}
        </div>

        <div className={`rounded-xl p-4 border-2 ${ACT_BG[r.activationLevel]}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'सक्रियता स्तर' : 'Activation Level'}
              </p>
              <p className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{actLabel}</p>
            </div>
            <div className="text-right">
              <Badge className={`text-sm px-3 py-1 ${ACT_COLOR[r.activationLevel]}`}>
                {r.activationLevel}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{r.score}/100</p>
            </div>
          </div>
          <div className="w-full bg-white/40 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${r.activationLevel === 'High' ? 'bg-green-500' : r.activationLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${r.score}%` }}
            />
          </div>
          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? r.prediction.hi : r.prediction.en}
          </p>
        </div>

        <div className="bg-white/40 dark:bg-white/5 rounded-lg p-3">
          <p className={`text-xs font-semibold mb-1 ${isHi ? 'font-hindi' : ''}`}>
            ⏰ {isHi ? 'समय संकेत:' : 'Timing:'}
          </p>
          <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? r.timing.hi : r.timing.en}
          </p>
        </div>

        {r.keyEvents.en.length > 0 && (
          <div>
            <p className={`text-xs font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
              🎯 {isHi ? 'संभावित घटनाएं:' : 'Likely Events:'}
            </p>
            <div className="flex flex-wrap gap-1">
              {(isHi ? r.keyEvents.hi : r.keyEvents.en).map((ev, i) => (
                <Badge key={i} variant="outline" className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                  {ev}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '📖 स्रोत: बी.वी. रमण, फलदीपिका, BPHS'
            : '📖 Source: B.V. Raman, Phaladeepika, BPHS'}
        </p>
      </CardContent>
    </Card>
  );
}
