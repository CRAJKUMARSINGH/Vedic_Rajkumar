/**
 * Tarabala Card — Daily Nakshatra Transit Quality
 * Shows Moon's current Tarabala from birth nakshatra
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTarabala, getFullTarabalaTable, NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/services/tarabalaService';

interface Props {
  birthNakshatraIndex: number;   // 0-26
  moonNakshatraIndex: number;    // 0-26 current Moon nakshatra
  lang: 'en' | 'hi';
  showFullTable?: boolean;
}

const STRENGTH_STYLE: Record<string, string> = {
  Excellent: 'bg-green-600 text-white',
  Good:      'bg-blue-500 text-white',
  Neutral:   'bg-gray-400 text-white',
  Caution:   'bg-orange-500 text-white',
  Avoid:     'bg-red-600 text-white',
};

export default function TarabalaCard({ birthNakshatraIndex, moonNakshatraIndex, lang, showFullTable = false }: Props) {
  const isHi = lang === 'hi';
  const today = getTarabala(birthNakshatraIndex, moonNakshatraIndex);
  const fullTable = showFullTable ? getFullTarabalaTable(birthNakshatraIndex) : [];

  const birthNakName = isHi ? NAKSHATRA_NAMES_HI[birthNakshatraIndex] : NAKSHATRA_NAMES_EN[birthNakshatraIndex];
  const moonNakName  = isHi ? NAKSHATRA_NAMES_HI[moonNakshatraIndex]  : NAKSHATRA_NAMES_EN[moonNakshatraIndex];

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-indigo-800 dark:text-indigo-300 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">⭐</span>
          {isHi ? 'ताराबल' : 'Tarabala'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'जन्म नक्षत्र से चंद्र गोचर गुणवत्ता • BPHS परंपरा' : 'Moon transit quality from birth nakshatra • BPHS tradition'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Birth + Current nakshatra */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'जन्म नक्षत्र' : 'Birth Nakshatra'}</p>
            <p className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{birthNakName}</p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'चंद्र नक्षत्र (आज)' : "Moon's Nakshatra (Today)"}</p>
            <p className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{moonNakName}</p>
          </div>
        </div>

        {/* Today's Tarabala result */}
        <div className={`rounded-xl p-4 border-2 ${today.isBenefic ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-red-400 bg-red-50 dark:bg-red-950/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className={`text-lg font-bold ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? today.categoryHi : today.category}
              </p>
              <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? `तारा क्रम: ${today.index + 1}/9` : `Tara position: ${today.index + 1}/9`}
              </p>
            </div>
            <Badge className={`text-sm px-3 py-1 ${STRENGTH_STYLE[today.strength]}`}>
              {today.strength}
            </Badge>
          </div>
          <p className={`text-sm ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? today.advice.hi : today.advice.en}
          </p>
        </div>

        {/* Full 27-nakshatra table */}
        {showFullTable && (
          <div>
            <p className={`text-xs font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'सभी 27 नक्षत्रों का ताराबल:' : 'Tarabala for all 27 nakshatras:'}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {fullTable.map((t, i) => (
                <div key={i} className={`text-xs rounded px-2 py-1 flex justify-between items-center ${i === moonNakshatraIndex ? 'ring-2 ring-primary' : ''} ${t.isBenefic ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                  <span className={isHi ? 'font-hindi' : ''}>{isHi ? NAKSHATRA_NAMES_HI[i].slice(0, 6) : NAKSHATRA_NAMES_EN[i].slice(0, 6)}</span>
                  <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>{isHi ? t.categoryHi.slice(0, 4) : t.category.slice(0, 4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? '📖 स्रोत: बृहत् पाराशर होरा शास्त्र, रमण परंपरा' : '📖 Source: BPHS, Raman tradition'}
        </p>
      </CardContent>
    </Card>
  );
}
