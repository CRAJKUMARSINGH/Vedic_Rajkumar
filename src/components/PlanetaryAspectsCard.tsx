/**
 * Planetary Aspects Card Component
 * Displays aspects between planets with interpretations
 */

import { calculatePlanetaryAspects, getVedicSpecialAspects, getAspectSummary, type PlanetaryAspect, type VedicAspect } from "@/services/aspectsService";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PlanetaryAspectsCardProps {
  planetaryPositions: Array<{ planet: string; rashi: number; degree: number; house: number }>;
  lang: "en" | "hi";
}

export default function PlanetaryAspectsCard({ planetaryPositions, lang }: PlanetaryAspectsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isHi = lang === "hi";
  
  const aspects = calculatePlanetaryAspects(planetaryPositions);
  const vedicAspects = getVedicSpecialAspects(planetaryPositions);
  const summary = getAspectSummary(aspects);

  const getNatureColor = (nature: string) => {
    switch (nature) {
      case 'Benefic': return 'text-green-600 dark:text-green-400';
      case 'Malefic': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStrengthBadge = (strength: string) => {
    const colors = {
      'Strong': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Moderate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Weak': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[strength as keyof typeof colors] || colors.Weak;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-heading font-bold ${isHi ? "font-hindi" : ""}`}>
          {isHi ? "ग्रह दृष्टि (Aspects)" : "Planetary Aspects"}
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{summary.total}</div>
          <div className={`text-xs text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "कुल दृष्टि" : "Total Aspects"}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.benefic}</div>
          <div className={`text-xs text-green-700 dark:text-green-300 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "शुभ" : "Benefic"}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.malefic}</div>
          <div className={`text-xs text-red-700 dark:text-red-300 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "अशुभ" : "Malefic"}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.neutral}</div>
          <div className={`text-xs text-yellow-700 dark:text-yellow-300 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "तटस्थ" : "Neutral"}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Western Aspects */}
          <div>
            <h4 className={`font-semibold mb-3 ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "पाश्चात्य दृष्टि" : "Western Aspects"}
            </h4>
            <div className="space-y-2">
              {aspects.map((aspect, idx) => (
                <div key={idx} className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{aspect.planet1}</span>
                      <span className="text-muted-foreground">
                        {aspect.aspectType === 'Conjunction' && '☌'}
                        {aspect.aspectType === 'Opposition' && '☍'}
                        {aspect.aspectType === 'Trine' && '△'}
                        {aspect.aspectType === 'Square' && '□'}
                        {aspect.aspectType === 'Sextile' && '⚹'}
                      </span>
                      <span className="font-semibold">{aspect.planet2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStrengthBadge(aspect.strength)}`}>
                        {aspect.strength}
                      </span>
                      <span className={`text-sm font-semibold ${getNatureColor(aspect.nature)}`}>
                        {aspect.nature}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                    {isHi ? aspect.description.hi : aspect.description.en}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isHi ? "कोण" : "Orb"}: {aspect.orb.toFixed(1)}°
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Vedic Special Aspects */}
          {vedicAspects.length > 0 && (
            <div>
              <h4 className={`font-semibold mb-3 ${isHi ? "font-hindi" : ""}`}>
                {isHi ? "वैदिक विशेष दृष्टि" : "Vedic Special Aspects"}
              </h4>
              <div className="space-y-2">
                {vedicAspects.map((aspect, idx) => (
                  <div key={idx} className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-primary">{aspect.planet}</span>
                      <span className="text-xs text-muted-foreground">
                        {isHi ? "भाव" : "Houses"}: {aspect.aspectsHouses.join(', ')}
                      </span>
                    </div>
                    <p className={`text-sm text-muted-foreground ${isHi ? "font-hindi" : ""}`}>
                      {isHi ? aspect.description.hi : aspect.description.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
