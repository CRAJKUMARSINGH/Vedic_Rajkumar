/**
 * Dasha-Gocha Correlation Card
 * B.V. Raman's principle: transit results manifest only when Dasha supports
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateDashaGochaCorrelation } from '@/services/dashaGochara​CorrelationService';

interface Props {
  dashaLord: string;
  antarLord: string;
  transitHouses: Record<string, number>;
  lang: 'en' | 'hi';
}

const PLANET_HI: Record<string, string> = {
  Sun:'सूर्य',Moon:'चंद्र',Mars:'मंगल',Mercury:'बुध',
  Jupiter:'गुरु',Venus:'शुक्र',Saturn:'शनि',Rahu:'राहु',Ketu:'केतु',
};
const PLANET_SYMBOL: Record<string,string> = {
  Sun:'☉',Moon:'☽',Mars:'♂',Mercury:'☿',Jupiter:'♃',Venus:'♀',Saturn:'♄',Rahu:'☊',Ketu:'☋',
};

const LEVEL_STYLE: Record<string,string> = {
  High:   'bg-green-600 text-white',
  Medium: 'bg-yellow-500 text-white',
  Low:    'bg-red-500 text-white',
};

export default function DashaGochaCard({ dashaLord, antarLord, transitHouses, lang }: Props) {
  const isHi = lang === 'hi';
  const result = calculateDashaGochaCorrelation(dashaLord, antarLord, transitHouses);

  const pName = (p: string) => isHi ? (PLANET_HI[p] ?? p) : p;

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-violet-800 dark:text-violet-300 ${isHi?'font-hindi':''}`}>
          <span className="text-2xl">🪐</span>
          {isHi ? 'दशा-गोचर संगम' : 'Dasha–Gochar Correlation'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi?'font-hindi':''}`}>
          {isHi ? 'रमण सिद्धांत: गोचर फल तभी मिलता है जब दशा अनुकूल हो' : 'Raman principle: Transit results manifest only when Dasha supports'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Current Dasha */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 text-center">
            <p className={`text-xs text-muted-foreground ${isHi?'font-hindi':''}`}>{isHi?'महादशा':'Mahadasha'}</p>
            <p className="text-lg font-bold">{PLANET_SYMBOL[dashaLord]} {pName(dashaLord)}</p>
            <p className={`text-xs mt-0.5 ${result.dashaLordFavorable?'text-green-600':'text-red-500'} ${isHi?'font-hindi':''}`}>
              {isHi ? `भाव ${result.dashaLordHouseFromMoon}` : `House ${result.dashaLordHouseFromMoon}`}
              {' '}{result.dashaLordFavorable ? '✓' : '✗'}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 text-center">
            <p className={`text-xs text-muted-foreground ${isHi?'font-hindi':''}`}>{isHi?'अंतर्दशा':'Antardasha'}</p>
            <p className="text-lg font-bold">{PLANET_SYMBOL[antarLord]} {pName(antarLord)}</p>
            <p className={`text-xs mt-0.5 ${result.antarLordFavorable?'text-green-600':'text-red-500'} ${isHi?'font-hindi':''}`}>
              {isHi ? `भाव ${result.antarLordHouseFromMoon}` : `House ${result.antarLordHouseFromMoon}`}
              {' '}{result.antarLordFavorable ? '✓' : '✗'}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-lg px-4 py-2 text-center flex-1">
            <p className={`text-xs text-muted-foreground ${isHi?'font-hindi':''}`}>{isHi?'सक्रियता स्तर':'Activation Level'}</p>
            <Badge className={`text-base px-3 py-1 mt-1 ${LEVEL_STYLE[result.activationLevel]}`}>
              {result.activationLevel}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{result.score}/100</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${result.score>=70?'bg-green-500':result.score>=45?'bg-yellow-500':'bg-red-500'}`}
            style={{width:`${result.score}%`}} />
        </div>

        {/* Prediction */}
        <div className="bg-white/70 dark:bg-white/5 rounded-lg p-3 border border-violet-100 dark:border-violet-900">
          <p className={`text-xs font-semibold text-violet-700 mb-1 ${isHi?'font-hindi':''}`}>
            {isHi?'भविष्यवाणी:':'Prediction:'}
          </p>
          <p className={`text-sm ${isHi?'font-hindi':''}`}>
            {isHi ? result.prediction.hi : result.prediction.en}
          </p>
        </div>

        {/* Timing */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
          <p className={`text-xs font-semibold text-blue-700 mb-1 ${isHi?'font-hindi':''}`}>⏱ {isHi?'समय:':'Timing:'}</p>
          <p className={`text-sm text-blue-800 dark:text-blue-300 ${isHi?'font-hindi':''}`}>
            {isHi ? result.timing.hi : result.timing.en}
          </p>
        </div>

        {/* Key events */}
        <div>
          <p className={`text-xs font-semibold mb-2 ${isHi?'font-hindi':''}`}>{isHi?'प्रमुख घटनाएं:':'Key Events:'}</p>
          <div className="flex flex-wrap gap-1">
            {(isHi ? result.keyEvents.hi : result.keyEvents.en).map((e,i) => (
              <span key={i} className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 px-2 py-0.5 rounded">
                {e}
              </span>
            ))}
          </div>
        </div>

        <p className={`text-xs text-muted-foreground italic ${isHi?'font-hindi':''}`}>
          {isHi?'📖 स्रोत: डॉ. बी.वी. रमण, हिंदू प्रेडिक्टिव एस्ट्रोलॉजी':'📖 Source: Dr. B.V. Raman, Hindu Predictive Astrology'}
        </p>
      </CardContent>
    </Card>
  );
}
