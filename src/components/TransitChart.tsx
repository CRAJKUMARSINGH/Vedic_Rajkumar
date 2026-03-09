/**
 * Visual Transit Chart Component
 * Circular South Indian style chart showing 12 rashis and planet positions
 */

import { RASHIS, PLANETS, type TransitResult } from "@/data/transitData";

interface TransitChartProps {
  results: TransitResult[];
  moonRashiIndex: number;
  lang: "en" | "hi";
}

export default function TransitChart({ results, moonRashiIndex, lang }: TransitChartProps) {
  const isHi = lang === "hi";
  const size = 400;
  const center = size / 2;
  const outerRadius = 180;
  const innerRadius = 120;
  const planetRadius = 150;

  // Calculate positions for 12 houses in a circle
  const getHousePosition = (houseIndex: number) => {
    // Start from 9 o'clock position (Aries) and go counter-clockwise
    const angle = (houseIndex * 30 - 90) * (Math.PI / 180);
    return {
      x: center + outerRadius * Math.cos(angle),
      y: center + outerRadius * Math.sin(angle),
      midX: center + ((outerRadius + innerRadius) / 2) * Math.cos(angle),
      midY: center + ((outerRadius + innerRadius) / 2) * Math.sin(angle),
    };
  };

  // Calculate planet positions
  const getPlanetPosition = (rashiIndex: number, planetCount: number, planetIndex: number) => {
    const angle = (rashiIndex * 30 - 90) * (Math.PI / 180);
    const offset = (planetIndex - (planetCount - 1) / 2) * 15;
    const adjustedAngle = angle + (offset * Math.PI / 180);
    return {
      x: center + planetRadius * Math.cos(adjustedAngle),
      y: center + planetRadius * Math.sin(adjustedAngle),
    };
  };

  // Group planets by rashi
  const planetsByRashi: Record<number, TransitResult[]> = {};
  results.forEach(result => {
    const rashiIndex = result.currentRashi;
    if (!planetsByRashi[rashiIndex]) {
      planetsByRashi[rashiIndex] = [];
    }
    planetsByRashi[rashiIndex].push(result);
  });

  // Create SVG path for circle segments
  const createSegmentPath = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + outerRadius * Math.cos(startAngle * Math.PI / 180),
      y: center + outerRadius * Math.sin(startAngle * Math.PI / 180),
    };
    const end = {
      x: center + outerRadius * Math.cos(endAngle * Math.PI / 180),
      y: center + outerRadius * Math.sin(endAngle * Math.PI / 180),
    };
    const innerStart = {
      x: center + innerRadius * Math.cos(startAngle * Math.PI / 180),
      y: center + innerRadius * Math.sin(startAngle * Math.PI / 180),
    };
    const innerEnd = {
      x: center + innerRadius * Math.cos(endAngle * Math.PI / 180),
      y: center + innerRadius * Math.sin(endAngle * Math.PI / 180),
    };

    return `
      M ${start.x} ${start.y}
      A ${outerRadius} ${outerRadius} 0 0 1 ${end.x} ${end.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className={`text-xl font-heading font-bold text-center mb-4 ${isHi ? "font-hindi" : ""}`}>
          {isHi ? "गोचर चक्र" : "Transit Chart"}
        </h3>
        
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />

            {/* 12 House segments */}
            {Array.from({ length: 12 }).map((_, i) => {
              const startAngle = i * 30 - 90;
              const endAngle = (i + 1) * 30 - 90;
              const isMoonRashi = i === moonRashiIndex;
              const pos = getHousePosition(i);

              return (
                <g key={i}>
                  {/* Segment path */}
                  <path
                    d={createSegmentPath(startAngle, endAngle)}
                    fill={isMoonRashi ? "currentColor" : "transparent"}
                    className={isMoonRashi ? "text-primary/10 text-border" : "text-border"}
                    stroke="currentColor"
                    strokeWidth="1"
                  />

                  {/* Rashi symbol and name */}
                  <text
                    x={pos.midX}
                    y={pos.midY - 10}
                    textAnchor="middle"
                    className="text-lg font-bold fill-current"
                  >
                    {RASHIS[i].symbol}
                  </text>
                  <text
                    x={pos.midX}
                    y={pos.midY + 10}
                    textAnchor="middle"
                    className={`text-xs fill-current ${isHi ? "font-hindi" : ""}`}
                  >
                    {isHi ? RASHIS[i].hi : RASHIS[i].en}
                  </text>

                  {/* Moon indicator */}
                  {isMoonRashi && (
                    <circle
                      cx={pos.midX}
                      cy={pos.midY + 25}
                      r="4"
                      fill="currentColor"
                      className="text-primary"
                    />
                  )}
                </g>
              );
            })}

            {/* Planets */}
            {Object.entries(planetsByRashi).map(([rashiIndex, planets]) => {
              const rashi = parseInt(rashiIndex);
              return planets.map((planet, idx) => {
                const pos = getPlanetPosition(rashi, planets.length, idx);
                const isEffective = planet.effectiveStatus === "favorable";
                
                return (
                  <g key={`${planet.planet.en}-${rashi}`}>
                    {/* Planet symbol */}
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-2xl font-bold ${
                        isEffective ? "fill-green-600 dark:fill-green-400" : "fill-red-600 dark:fill-red-400"
                      }`}
                      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                    >
                      {planet.planet.symbol}
                    </text>
                    
                    {/* Tooltip on hover */}
                    <title>
                      {isHi ? planet.planet.hi : planet.planet.en}
                      {" - "}
                      {isHi ? RASHIS[rashi].hi : RASHIS[rashi].en}
                      {" ("}
                      {isHi ? "भाव" : "House"} {planet.houseFromMoon}
                      {")"}
                    </title>
                  </g>
                );
              });
            })}

            {/* Center label */}
            <text
              x={center}
              y={center - 10}
              textAnchor="middle"
              className={`text-sm font-semibold fill-current ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? "चन्द्र राशि" : "Moon Sign"}
            </text>
            <text
              x={center}
              y={center + 10}
              textAnchor="middle"
              className={`text-lg font-bold fill-current text-primary ${isHi ? "font-hindi" : ""}`}
            >
              {isHi ? RASHIS[moonRashiIndex].hi : RASHIS[moonRashiIndex].en}
            </text>
            <text
              x={center}
              y={center + 25}
              textAnchor="middle"
              className="text-2xl"
            >
              {RASHIS[moonRashiIndex].symbol}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-400"></div>
            <span className={isHi ? "font-hindi" : ""}>
              {isHi ? "शुभ ग्रह" : "Favorable Planets"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600 dark:bg-red-400"></div>
            <span className={isHi ? "font-hindi" : ""}>
              {isHi ? "अशुभ ग्रह" : "Unfavorable Planets"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span className={isHi ? "font-hindi" : ""}>
              {isHi ? "चन्द्र राशि" : "Moon Sign"}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className={`text-xs text-muted-foreground text-center mt-4 ${isHi ? "font-hindi" : ""}`}>
          {isHi 
            ? "ग्रह प्रतीकों पर होवर करें विवरण के लिए। हरा = शुभ, लाल = अशुभ।"
            : "Hover over planet symbols for details. Green = Favorable, Red = Unfavorable."}
        </p>
      </div>
    </div>
  );
}
