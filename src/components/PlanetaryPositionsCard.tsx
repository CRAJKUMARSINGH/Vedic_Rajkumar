/**
 * Planetary Positions Display Card
 * Shows all 9 planetary positions in a table format
 */

import { Card } from "@/components/ui/card";
import type { CompletePlanetaryPositions } from "@/services/ephemerisService";

interface PlanetaryPositionsCardProps {
  positions: CompletePlanetaryPositions;
  lang: "en" | "hi";
}

// Planet names in English and Hindi
const PLANET_NAMES = {
  en: {
    sun: 'Sun',
    moon: 'Moon',
    mercury: 'Mercury',
    venus: 'Venus',
    mars: 'Mars',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    rahu: 'Rahu',
    ketu: 'Ketu',
  },
  hi: {
    sun: 'सूर्य',
    moon: 'चंद्र',
    mercury: 'बुध',
    venus: 'शुक्र',
    mars: 'मंगल',
    jupiter: 'गुरु',
    saturn: 'शनि',
    rahu: 'राहु',
    ketu: 'केतु',
  }
};

// Planet symbols/icons
const PLANET_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  rahu: '☊',
  ketu: '☋',
};

// Rashi names in Hindi
const RASHI_NAMES_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
                        'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];

export default function PlanetaryPositionsCard({ positions, lang }: PlanetaryPositionsCardProps) {
  const isHi = lang === "hi";
  
  // Format degrees as DD°MM'
  const formatDegrees = (degrees: number): string => {
    const deg = Math.floor(degrees);
    const min = Math.floor((degrees - deg) * 60);
    return `${deg}°${min.toString().padStart(2, '0')}'`;
  };
  
  // Get rashi name in current language
  const getRashiName = (rashiName: string, rashiIndex: number): string => {
    return isHi ? RASHI_NAMES_HI[rashiIndex] : rashiName;
  };
  
  // Planet order for display
  const planetOrder: (keyof typeof PLANET_NAMES.en)[] = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'
  ];
  
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">🪐</span>
        <div className="flex-1">
          <h3 className={`text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-1 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "ग्रह स्थिति (Planetary Positions)" : "Planetary Positions (Graha Sthiti)"}
          </h3>
          <p className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
            {isHi 
              ? "सभी 9 ग्रहों की वर्तमान राशि स्थिति"
              : "Current zodiac positions of all 9 planets"}
          </p>
        </div>
      </div>
      
      {/* Planetary positions table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-indigo-200 dark:border-indigo-800">
              <th className={`text-left py-2 px-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "ग्रह" : "Planet"}
              </th>
              <th className={`text-left py-2 px-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "राशि" : "Rashi"}
              </th>
              <th className={`text-right py-2 px-2 font-semibold ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "अंश" : "Degrees"}
              </th>
            </tr>
          </thead>
          <tbody>
            {planetOrder.map((planet) => {
              const position = positions[planet];
              const planetName = isHi ? PLANET_NAMES.hi[planet] : PLANET_NAMES.en[planet];
              const symbol = PLANET_SYMBOLS[planet];
              const rashiName = getRashiName(position.rashiName, position.rashi);
              const degreesStr = formatDegrees(position.degrees);
              const isRetrograde = position.retrograde;
              
              return (
                <tr key={planet} className="border-b border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{symbol}</span>
                      <span className={isHi ? "font-hindi" : ""}>
                        {planetName}
                        {isRetrograde && <span className="text-xs text-orange-600 ml-1">(R)</span>}
                      </span>
                    </div>
                  </td>
                  <td className={`py-2 px-2 ${isHi ? "font-hindi" : ""}`}>
                    {rashiName}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-xs">
                    {degreesStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Additional info */}
      <div className={`mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800 text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
        <p>
          {isHi 
            ? "• राहु और केतु सदैव वक्री (R) होते हैं और एक दूसरे से 180° दूर रहते हैं।"
            : "• Rahu and Ketu are always retrograde (R) and 180° apart."}
        </p>
        <p className="mt-1">
          {isHi 
            ? "• अयनांश (Lahiri): " + positions.ayanamsa.toFixed(2) + "°"
            : "• Ayanamsa (Lahiri): " + positions.ayanamsa.toFixed(2) + "°"}
        </p>
      </div>
    </Card>
  );
}
