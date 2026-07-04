/**
 * Transit Remedies Card
 * Shows classical remedies for unfavorable transiting planets
 * Based on Raman tradition: mantra, gemstone, charity, deity
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getRemedyForPlanet } from '@/data/transitRemedies';
import type { TransitResult } from '@/data/transitData';

interface Props {
  results: TransitResult[];
  lang: 'en' | 'hi';
}

const PLANET_HI: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

export default function TransitRemediesCard({ results, lang }: Props) {
  const isHi = lang === 'hi';
  const [expanded, setExpanded] = useState<string | null>(null);

  // Only show remedies for unfavorable transits
  const unfavorable = results.filter(r => r.effectiveStatus === 'unfavorable');

  if (!unfavorable.length) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6 text-center">
          <p className="text-2xl mb-2">🙏</p>
          <p className={`text-sm text-green-700 font-semibold ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'सभी ग्रह अनुकूल हैं — कोई उपाय आवश्यक नहीं' : 'All planets favorable — no remedies needed'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 text-orange-800 dark:text-orange-300 ${isHi ? 'font-hindi' : ''}`}>
          <span className="text-2xl">🕉️</span>
          {isHi ? 'गोचर उपाय' : 'Transit Remedies'}
        </CardTitle>
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi ? 'अशुभ गोचर के लिए शास्त्रीय उपाय • रमण परंपरा' : 'Classical remedies for unfavorable transits • Raman tradition'}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className={`text-xs text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? `${unfavorable.length} ग्रह अशुभ गोचर में हैं। नीचे उपाय देखें:`
            : `${unfavorable.length} planet(s) in unfavorable transit. Remedies below:`}
        </p>

        {unfavorable.map(r => {
          const planetName = r.planet.en;
          const remedy = getRemedyForPlanet(planetName);
          if (!remedy) return null;
          const isOpen = expanded === planetName;

          return (
            <div key={planetName} className="bg-white/70 dark:bg-white/5 border border-orange-200 dark:border-orange-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : planetName)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{PLANET_SYMBOL[planetName]}</span>
                  <span className={`font-semibold ${isHi ? 'font-hindi' : ''}`}>
                    {isHi ? PLANET_HI[planetName] : planetName}
                  </span>
                  <Badge className="bg-red-100 text-red-700 text-xs">
                    {isHi ? `भाव ${r.houseFromMoon}` : `House ${r.houseFromMoon}`}
                  </Badge>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  <RemedyItem icon="🔔" label={isHi ? 'मंत्र' : 'Mantra'} value={isHi ? remedy.mantra.hi : remedy.mantra.en} sub={`× ${remedy.count}`} isHi={isHi} />
                  <RemedyItem icon="💎" label={isHi ? 'रत्न' : 'Gemstone'} value={isHi ? remedy.gemstone.hi : remedy.gemstone.en} isHi={isHi} />
                  <RemedyItem icon="📅" label={isHi ? 'दान दिन' : 'Charity Day'} value={isHi ? remedy.charityDay.hi : remedy.charityDay.en} isHi={isHi} />
                  <RemedyItem icon="🌾" label={isHi ? 'दान वस्तु' : 'Charity Item'} value={isHi ? remedy.charityItem.hi : remedy.charityItem.en} isHi={isHi} />
                  <RemedyItem icon="🙏" label={isHi ? 'देवता' : 'Deity'} value={isHi ? remedy.deity.hi : remedy.deity.en} isHi={isHi} />
                  <RemedyItem icon="🎨" label={isHi ? 'रंग' : 'Color'} value={remedy.color} isHi={isHi} />
                  <RemedyItem icon="⚡" label={isHi ? 'व्रत' : 'Fasting'} value={isHi ? remedy.fastingDay.hi : remedy.fastingDay.en} isHi={isHi} />
                  <RemedyItem icon="🔺" label={isHi ? 'यंत्र' : 'Yantra'} value={isHi ? remedy.yantra.hi : remedy.yantra.en} isHi={isHi} />
                </div>
              )}
            </div>
          );
        })}

        <p className={`text-xs text-muted-foreground italic ${isHi ? 'font-hindi' : ''}`}>
          {isHi
            ? '⚠️ उपाय सुझाव मात्र हैं। किसी योग्य ज्योतिषी से परामर्श लें।'
            : '⚠️ Remedies are suggestions only. Consult a qualified astrologer.'}
        </p>
      </CardContent>
    </Card>
  );
}

function RemedyItem({ icon, label, value, sub, isHi }: { icon: string; label: string; value: string; sub?: string; isHi: boolean }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2">
      <p className={`text-xs text-muted-foreground mb-0.5 ${isHi ? 'font-hindi' : ''}`}>{icon} {label}</p>
      <p className={`text-sm font-semibold ${isHi ? 'font-hindi' : ''}`}>{value} {sub && <span className="text-xs font-normal text-muted-foreground">{sub}</span>}</p>
    </div>
  );
}
