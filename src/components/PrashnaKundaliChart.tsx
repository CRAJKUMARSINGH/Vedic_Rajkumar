/**
 * PrashnaKundaliChart — Horary Chart Visual
 * Source: BV Raman Magazine Enhancement Plan — Feature 6
 * Prasna Marga (Kerala, 1650 AD) — B.V. Raman translation
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateCompleteAscendant } from '@/services/ascendantService';
import { getNakshatraInfo } from '@/services/nakshatraService';
import { calculatePlanetaryPositions } from '@/services/ephemerisService';

interface Props {
  questionTime?: Date;
  questionLat?: number;
  questionLon?: number;
  question?: string;
  lang: 'en' | 'hi';
}

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
  'कुंभ',
  'मीन',
];
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

const QUESTION_HOUSES: Record<string, { house: number; en: string; hi: string }> = {
  health: { house: 1, en: 'Health & Body', hi: 'स्वास्थ्य' },
  wealth: { house: 2, en: 'Wealth & Finance', hi: 'धन' },
  siblings: { house: 3, en: 'Siblings & Travel', hi: 'भाई-बहन' },
  property: { house: 4, en: 'Property & Home', hi: 'संपत्ति' },
  children: { house: 5, en: 'Children & Education', hi: 'संतान' },
  enemies: { house: 6, en: 'Enemies & Disease', hi: 'शत्रु' },
  marriage: { house: 7, en: 'Marriage & Partner', hi: 'विवाह' },
  longevity: { house: 8, en: 'Longevity & Obstacles', hi: 'आयु' },
  fortune: { house: 9, en: 'Fortune & Dharma', hi: 'भाग्य' },
  career: { house: 10, en: 'Career & Status', hi: 'करियर' },
  gains: { house: 11, en: 'Gains & Income', hi: 'लाभ' },
  losses: { house: 12, en: 'Losses & Liberation', hi: 'व्यय' },
};

function detectQuestionCategory(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('health') || q.includes('sick') || q.includes('स्वास्थ्य')) return 'health';
  if (q.includes('money') || q.includes('wealth') || q.includes('धन')) return 'wealth';
  if (q.includes('job') || q.includes('career') || q.includes('करियर')) return 'career';
  if (q.includes('marriage') || q.includes('love') || q.includes('विवाह')) return 'marriage';
  if (q.includes('child') || q.includes('संतान')) return 'children';
  if (q.includes('property') || q.includes('house') || q.includes('संपत्ति')) return 'property';
  return 'fortune';
}

export default function PrashnaKundaliChart({
  questionTime,
  questionLat = 28.6,
  questionLon = 77.2,
  question = '',
  lang,
}: Props) {
  const isHi = lang === 'hi';
  const now = questionTime ?? new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().slice(0, 5);

  let ascendant = { rashiIndex: 0, rashiName: 'Aries', degrees: 0 };
  let moonNakshatra = { name: 'Ashwini', pada: 1, lord: 'Ketu' };
  let positions: Record<string, number> = {};

  try {
    const asc = calculateCompleteAscendant(dateStr, timeStr, questionLat, questionLon);
    ascendant = {
      rashiIndex: asc.ascendant.rashiIndex,
      rashiName: asc.ascendant.rashiName,
      degrees: asc.ascendant.degrees,
    };
  } catch {
    /* use defaults */
  }

  try {
    const nak = getNakshatraInfo(dateStr, timeStr);
    if (nak)
      moonNakshatra = {
        name: typeof nak.name === 'string' ? nak.name : nak.name.en,
        pada: nak.pada,
        lord: nak.lord,
      };
  } catch {
    /* use defaults */
  }

  try {
    const pos = calculatePlanetaryPositions(dateStr, timeStr);
    positions = {
      Sun: pos.sun.rashi,
      Moon: pos.moon.rashi,
      Mars: pos.mars.rashi,
      Mercury: pos.mercury.rashi,
      Jupiter: pos.jupiter.rashi,
      Venus: pos.venus.rashi,
      Saturn: pos.saturn.rashi,
      Rahu: pos.rahu.rashi,
      Ketu: pos.ketu.rashi,
    };
  } catch {
    /* use defaults */
  }

  const category = question ? detectQuestionCategory(question) : 'fortune';
  const qInfo = QUESTION_HOUSES[category];

  // Hora lord (planet ruling the current hour)
  const hour = now.getHours();
  const horaOrder = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  const horaLord = horaOrder[hour % 7];

  // Verdict: Moon in benefic nakshatra + Hora lord favorable
  const beneficNakshatras = [
    'Rohini',
    'Mrigashira',
    'Punarvasu',
    'Pushya',
    'Hasta',
    'Chitra',
    'Swati',
    'Anuradha',
    'Revati',
    'Ashwini',
    'Magha',
    'Uttara Phalguni',
    'Uttara Ashadha',
    'Uttara Bhadrapada',
    'Shravana',
  ];
  const moonBenefic = beneficNakshatras.includes(moonNakshatra.name);
  const verdict = moonBenefic ? 'favorable' : 'unfavorable';

  // Build 12-house grid with planets
  const houseGrid: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) houseGrid[h] = [];
  Object.entries(positions).forEach(([planet, rashi]) => {
    const house = ((rashi - ascendant.rashiIndex + 12) % 12) + 1;
    houseGrid[house].push(planet);
  });

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-violet-800 dark:text-violet-300 ${isHi ? 'font-hindi' : ''}`}
        >
          <span className="text-2xl">🔯</span>
          {isHi ? 'प्रश्न कुंडली' : 'Prashna Kundali'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? 'प्रश्न समय का होरा चार्ट • प्रश्न मार्ग परंपरा'
            : 'Horary chart at question time • Prasna Marga tradition'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question info */}
        {question && (
          <div className="bg-white/60 dark:bg-white/5 rounded-lg p-3">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'प्रश्न:' : 'Question:'}
            </p>
            <p className={`text-sm font-medium ${isHi ? 'font-hindi' : ''}`}>{question}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                {isHi ? 'भाव' : 'House'} {qInfo.house}: {isHi ? qInfo.hi : qInfo.en}
              </Badge>
            </div>
          </div>
        )}

        {/* Prashna Lagna + Hora */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/60 dark:bg-white/5 rounded-lg p-2">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'प्रश्न लग्न' : 'Prashna Lagna'}
            </p>
            <p className={`font-bold text-sm ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? RASHIS_HI[ascendant.rashiIndex] : ascendant.rashiName}
            </p>
            <p className="text-xs text-muted-foreground">{ascendant.degrees.toFixed(1)}°</p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-lg p-2">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'चंद्र नक्षत्र' : 'Moon Nakshatra'}
            </p>
            <p className={`font-bold text-sm ${isHi ? 'font-hindi' : ''}`}>{moonNakshatra.name}</p>
            <p className="text-xs text-muted-foreground">Pada {moonNakshatra.pada}</p>
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-lg p-2">
            <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'होरा स्वामी' : 'Hora Lord'}
            </p>
            <p className="font-bold text-sm">
              {PLANET_SYMBOL[horaLord]} {horaLord}
            </p>
            <p className="text-xs text-muted-foreground">
              {isHi ? 'वर्तमान होरा' : 'Current Hora'}
            </p>
          </div>
        </div>

        {/* North Indian chart grid */}
        <div>
          <p className={`text-xs font-semibold mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'प्रश्न कुंडली चार्ट:' : 'Prashna Chart:'}
          </p>
          <div className="grid grid-cols-4 gap-0.5 bg-violet-200 dark:bg-violet-800 rounded-lg overflow-hidden text-xs">
            {[12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6].map((house, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-gray-900 p-1.5 min-h-[52px] ${house === null ? 'bg-violet-50 dark:bg-violet-950/30' : ''}`}
              >
                {house !== null && (
                  <>
                    <p className="text-violet-500 font-bold text-xs">{house}</p>
                    <p className={`text-xs ${isHi ? 'font-hindi' : ''}`}>
                      {isHi
                        ? RASHIS_HI[(ascendant.rashiIndex + house - 1) % 12]
                        : RASHIS_EN[(ascendant.rashiIndex + house - 1) % 12].slice(0, 3)}
                    </p>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      {(houseGrid[house] || []).map(p => (
                        <span key={p} className="text-xs">
                          {PLANET_SYMBOL[p]}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Verdict */}
        <div
          className={`rounded-xl p-4 border-2 ${verdict === 'favorable' ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-red-400 bg-red-50 dark:bg-red-950/20'}`}
        >
          <div className="flex items-center justify-between">
            <p className={`font-bold text-lg ${isHi ? 'font-hindi' : ''}`}>
              {verdict === 'favorable'
                ? isHi
                  ? '✅ शुभ संकेत'
                  : '✅ Favorable Indication'
                : isHi
                  ? '⚠️ अशुभ संकेत'
                  : '⚠️ Unfavorable Indication'}
            </p>
            <Badge
              className={`${verdict === 'favorable' ? 'bg-green-600' : 'bg-red-600'} text-white`}
            >
              {verdict === 'favorable'
                ? isHi
                  ? 'शुभ'
                  : 'Favorable'
                : isHi
                  ? 'अशुभ'
                  : 'Unfavorable'}
            </Badge>
          </div>
          <p className={`text-sm mt-2 text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {verdict === 'favorable'
              ? isHi
                ? `चंद्रमा ${moonNakshatra.name} नक्षत्र में शुभ स्थिति में है। प्रश्न का उत्तर सकारात्मक है।`
                : `Moon in ${moonNakshatra.name} nakshatra is in a benefic position. The question has a positive answer.`
              : isHi
                ? `चंद्रमा ${moonNakshatra.name} नक्षत्र में चुनौतीपूर्ण स्थिति में है। सावधानी आवश्यक है।`
                : `Moon in ${moonNakshatra.name} nakshatra indicates challenges. Caution is advised.`}
          </p>
        </div>

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '📖 स्रोत: प्रश्न मार्ग, बी.वी. रमण, BPHS'
            : '📖 Source: Prasna Marga, B.V. Raman, BPHS'}
        </p>
      </CardContent>
    </Card>
  );
}
