/**
 * Visual Transit Chart Component
 * Circular chart showing 12 rashis with planet positions
 * Highlights natal Moon position and current transits
 */

import { RASHIS, type TransitResult } from "@/data/transitData";
import { useState } from "react";

interface VisualTransitChartProps {
  moonRashiIndex: number;
  results: TransitResult[];
  lang: "en" | "hi";
}

export default function VisualTransitChart({ moonRashiIndex, results, lang }: VisualTransitChartProps) {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const isHi = lang === "hi";

  // Chart dimensions
  const size = 400;
  const center = size / 2;
  const outerRadius = 180;
  const innerRadius = 120;
  const textRadius = 150;

  // Calculate positions for 12 houses (starting from Aries at 9 o'clock, going counter-clockwise)
  const getHouseAngle = (houseIndex: number) => {
    // Start from 180° (9 o'clock) and go counter-clockwise
    return 180 - (houseIndex * 30);
  };

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center - radius * Math.sin(rad),
    };
  };

  // Create SVG path for a house segment
  const createHousePath = (houseIndex: number) => {
    const startAngle = getHouseAngle(houseIndex);
    const endAngle = getHouseAngle(houseIndex + 1);

    const outerStart = polarToCartesian(startAngle, outerRadius);
    const outerEnd = polarToCartesian(endAngle, outerRadius);
    const innerStart = polarToCartesian(startAngle, innerRadius);
    const innerEnd = polarToCartesian(endAngle, innerRadius);

    return `
      M ${outerStart.x} ${outerStart.y}
      A ${outerRadius} ${outerRadius} 0 0 0 ${outerEnd.x} ${outerEnd.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 0 1 ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  // Get planets in a specific rashi
  const getPlanetsInRashi = (rashiIndex: number) => {
    return results.filter(r => r.currentRashi === rashiIndex);
  };

  // Get house number from Moon for a rashi
  const getHouseFromMoon = (rashiIndex: number) => {
    let house = rashiIndex - moonRashiIndex + 1;
    if (house <= 0) house += 12;
    return house;
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <h3 className={`text-xl font-heading font-bold text-center ${isHi ? "font-hindi" : ""}`}>
        {isHi ? "गोचर चक्र" : "Transit Chart"}
      </h3>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
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

        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border"
        />

        {/* Draw 12 house segments */}
        {Array.from({ length: 12 }, (_, i) => {
          const rashiIndex = i;
          const houseFromMoon = getHouseFromMoon(rashiIndex);
          const isMoonRashi = rashiIndex === moonRashiIndex;
          const planetsHere = getPlanetsInRashi(rashiIndex);
          const isHovered = hoveredHouse === rashiIndex;

          return (
            <g key={i}>
              {/* House segment */}
              <path
                d={createHousePath(i)}
                fill={isMoonRashi ? "rgba(59, 130, 246, 0.1)" : isHovered ? "rgba(100, 100, 100, 0.1)" : "transparent"}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border cursor-pointer transition-all"
                onMouseEnter={() => setHoveredHouse(rashiIndex)}
                onMouseLeave={() => setHoveredHouse(null)}
              />

              {/* Rashi symbol and name */}
              <text
                x={polarToCartesian(getHouseAngle(i) - 15, textRadius).x}
                y={polarToCartesian(getHouseAngle(i) - 15, textRadius).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-semibold ${isMoonRashi ? "fill-primary" : "fill-foreground"} ${isHi ? "font-hindi" : ""}`}
              >
                {RASHIS[rashiIndex].symbol}
              </text>

              {/* House number from Moon */}
              <text
                x={polarToCartesian(getHouseAngle(i) - 15, innerRadius - 15).x}
                y={polarToCartesian(getHouseAngle(i) - 15, innerRadius - 15).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground font-mono"
              >
                {houseFromMoon}
              </text>

              {/* Planet symbols */}
              {planetsHere.length > 0 && (
                <g>
                  {planetsHere.map((planet, idx) => {
                    const planetRadius = (outerRadius + innerRadius) / 2;
                    const offsetAngle = -15 + (idx - planetsHere.length / 2 + 0.5) * 8;
                    const pos = polarToCartesian(getHouseAngle(i) + offsetAngle, planetRadius);
                    
                    return (
                      <text
                        key={planet.planet.en}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-base font-bold fill-primary"
                        style={{ fontSize: '18px' }}
                      >
                        {planet.planet.symbol}
                      </text>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* Center Moon indicator */}
        <g>
          <circle
            cx={center}
            cy={center}
            r={30}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
          />
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold fill-primary"
          >
            ☽
          </text>
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-xs font-semibold fill-primary ${isHi ? "font-hindi" : ""}`}
          >
            {isHi ? RASHIS[moonRashiIndex].hi : RASHIS[moonRashiIndex].en}
          </text>
        </g>

        {/* Directional markers */}
        <text x={center} y={20} textAnchor="middle" className="text-xs fill-muted-foreground font-semibold">
          {isHi ? "पूर्व" : "East"}
        </text>
        <text x={size - 20} y={center + 5} textAnchor="end" className="text-xs fill-muted-foreground font-semibold">
          {isHi ? "दक्षिण" : "South"}
        </text>
        <text x={center} y={size - 10} textAnchor="middle" className="text-xs fill-muted-foreground font-semibold">
          {isHi ? "पश्चिम" : "West"}
        </text>
        <text x={20} y={center + 5} textAnchor="start" className="text-xs fill-muted-foreground font-semibold">
          {isHi ? "उत्तर" : "North"}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20 border-2 border-primary"></div>
          <span className={isHi ? "font-hindi" : ""}>
            {isHi ? "चन्द्र राशि" : "Moon Sign"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">☽</span>
          <span className={isHi ? "font-hindi" : ""}>
            {isHi ? "जन्म चन्द्र" : "Natal Moon"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-muted-foreground">1-12</span>
          <span className={isHi ? "font-hindi" : ""}>
            {isHi ? "भाव संख्या" : "House Number"}
          </span>
        </div>
      </div>

      {/* Hover info */}
      {hoveredHouse !== null && (
        <div className="bg-muted p-3 rounded-lg border border-border max-w-sm">
          <div className={`font-semibold mb-1 ${isHi ? "font-hindi" : ""}`}>
            {RASHIS[hoveredHouse].symbol} {isHi ? RASHIS[hoveredHouse].hi : RASHIS[hoveredHouse].en}
          </div>
          <div className={`text-xs text-muted-foreground mb-2 ${isHi ? "font-hindi" : ""}`}>
            {isHi ? "भाव" : "House"} {getHouseFromMoon(hoveredHouse)} {isHi ? "चन्द्र से" : "from Moon"}
          </div>
          {getPlanetsInRashi(hoveredHouse).length > 0 ? (
            <div className="space-y-1">
              {getPlanetsInRashi(hoveredHouse).map(planet => (
                <div key={planet.planet.en} className="flex items-center gap-2 text-xs">
                  <span className="text-base">{planet.planet.symbol}</span>
                  <span className={isHi ? "font-hindi" : ""}>
                    {isHi ? planet.planet.hi : planet.planet.en}
                  </span>
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${
                    planet.effectiveStatus === "favorable" 
                      ? "bg-favorable/20 text-favorable" 
                      : planet.effectiveStatus === "unfavorable"
                      ? "bg-unfavorable/20 text-unfavorable"
                      : "bg-mixed/20 text-mixed"
                  }`}>
                    {planet.effectiveStatus === "favorable" 
                      ? (isHi ? "शुभ" : "Fav") 
                      : planet.effectiveStatus === "unfavorable"
                      ? (isHi ? "अशुभ" : "Unfav")
                      : (isHi ? "वेध" : "Vedha")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-xs text-muted-foreground italic ${isHi ? "font-hindi" : ""}`}>
              {isHi ? "कोई ग्रह नहीं" : "No planets"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
