import { useState } from 'react';
import type { ChartData, PlanetPosition } from '@/lib/vedic/vedicCalc';
import { RASHIS_HI, PLANET_SYMBOLS, PLANETS_HI } from '@/lib/vedic/vedicCalc';
import { getTrines, getSeventhLord } from '@/lib/vedic/vedicCalc';

interface NorthIndianChartProps {
  chart: ChartData;
  title?: string;
  titleHi?: string;
  size?: number;
  highlightSeventh?: boolean;
  showTransits?: boolean;
  transitPlanets?: { name: string; nameHi: string; rashi: number; symbol: string }[];
  id?: string;
}

// North Indian chart: fixed house positions, lagna rashi in top center
// House layout (top-center = house 1, clockwise):
const HOUSE_PATHS: Record<
  number,
  { path: string; textX: number; textY: number; numX: number; numY: number }
> = {
  1: {
    path: 'M 200,20  L 320,140 L 200,140 L 80,140  Z',
    textX: 200,
    textY: 95,
    numX: 200,
    numY: 42,
  },
  2: {
    path: 'M 320,20  L 440,20  L 380,80  L 320,140 Z',
    textX: 370,
    textY: 70,
    numX: 395,
    numY: 28,
  },
  3: {
    path: 'M 440,20  L 440,140 L 380,80  L 320,20  Z',
    textX: 410,
    textY: 95,
    numX: 438,
    numY: 52,
  },
  4: {
    path: 'M 440,140 L 440,260 L 380,200 L 320,140 Z',
    textX: 410,
    textY: 200,
    numX: 438,
    numY: 152,
  },
  5: {
    path: 'M 440,260 L 380,200 L 320,260 L 440,380 Z',
    textX: 370,
    textY: 290,
    numX: 395,
    numY: 370,
  },
  6: {
    path: 'M 320,260 L 200,260 L 200,380 L 440,380 Z',
    textX: 200,
    textY: 310,
    numX: 200,
    numY: 372,
  },
  7: {
    path: 'M 200,260 L 80,260  L 80,380  L 200,380 Z',
    textX: 200,
    textY: 310,
    numX: 200,
    numY: 372,
  },
  8: {
    path: 'M 80,260  L 20,380  L 200,380 L 200,260 Z',
    textX: 100,
    textY: 290,
    numX: 22,
    numY: 370,
  },
  9: {
    path: 'M 20,260  L 80,200  L 80,140  L 20,140  Z',
    textX: 48,
    textY: 200,
    numX: 22,
    numY: 152,
  },
  10: {
    path: 'M 80,140  L 80,260  L 20,260  L 20,140  Z',
    textX: 48,
    textY: 200,
    numX: 22,
    numY: 152,
  },
  11: {
    path: 'M 80,20   L 80,140  L 20,140  L 20,20   Z',
    textX: 48,
    textY: 95,
    numX: 22,
    numY: 52,
  },
  12: {
    path: 'M 20,20   L 200,20  L 200,140 L 80,140  Z',
    textX: 100,
    textY: 70,
    numX: 22,
    numY: 28,
  },
};

// Corrected North Indian chart layout (600x400 viewBox)
const HOUSES: {
  id: number;
  polygon: string;
  textX: number;
  textY: number;
  houseNumX: number;
  houseNumY: number;
}[] = [
  {
    id: 1,
    polygon: '200,10 380,130 200,130 20,130',
    textX: 200,
    textY: 83,
    houseNumX: 200,
    houseNumY: 22,
  },
  {
    id: 2,
    polygon: '380,10 420,10 420,130 380,130',
    textX: 400,
    textY: 70,
    houseNumX: 402,
    houseNumY: 20,
  },
  {
    id: 3,
    polygon: '420,10 420,130 380,130 420,10',
    textX: 415,
    textY: 80,
    houseNumX: 422,
    houseNumY: 55,
  },
  {
    id: 4,
    polygon: '420,130 420,270 380,270 380,130',
    textX: 415,
    textY: 200,
    houseNumX: 422,
    houseNumY: 155,
  },
  {
    id: 5,
    polygon: '420,270 380,270 200,270 380,390',
    textX: 360,
    textY: 330,
    houseNumX: 402,
    houseNumY: 382,
  },
  {
    id: 6,
    polygon: '380,390 200,270 20,390',
    textX: 200,
    textY: 340,
    houseNumX: 200,
    houseNumY: 390,
  },
  { id: 7, polygon: '20,390 200,270 20,270', textX: 45, textY: 330, houseNumX: 22, houseNumY: 382 },
  {
    id: 8,
    polygon: '20,270 20,130 60,130 60,270',
    textX: 40,
    textY: 200,
    houseNumX: 18,
    houseNumY: 155,
  },
  { id: 9, polygon: '20,130 60,130 20,10', textX: 35, textY: 80, houseNumX: 18, houseNumY: 55 },
  {
    id: 10,
    polygon: '20,10 60,10 60,130 20,130',
    textX: 40,
    textY: 70,
    houseNumX: 22,
    houseNumY: 20,
  },
  {
    id: 11,
    polygon: '60,10 200,10 200,130 60,130',
    textX: 130,
    textY: 70,
    houseNumX: 65,
    houseNumY: 20,
  },
  {
    id: 12,
    polygon: '200,10 380,10 380,130 200,130',
    textX: 290,
    textY: 70,
    houseNumX: 335,
    houseNumY: 20,
  },
];

const HOUSE_COLORS = [
  '#fff8f0',
  '#f0f8ff',
  '#f8f0ff',
  '#f0fff0',
  '#fff0f8',
  '#f8fff0',
  '#f0f0ff',
  '#fff8f8',
  '#f8f8ff',
  '#fffff0',
  '#f0ffff',
  '#fff0f0',
];

const HIGHLIGHT_COLORS: Record<string, string> = {
  lagna: '#ffedd5',
  seventh: '#fce7f3',
  trine: '#d1fae5',
  transit: '#dbeafe',
  sixthHouse: '#fef9c3',
};

function getPlanetsInHouse(chart: ChartData, house: number): PlanetPosition[] {
  return chart.planets.filter(p => p.house === house);
}

export default function NorthIndianChart({
  chart,
  title,
  titleHi,
  size = 420,
  highlightSeventh = true,
  showTransits = false,
  transitPlanets = [],
  id,
}: NorthIndianChartProps) {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const seventhLord = getSeventhLord(chart);
  const trines = getTrines(seventhLord.house);
  const seventhHouse = 7;
  const seventhTrines = getTrines(seventhHouse);

  const viewBoxW = 440;
  const viewBoxH = 400;

  // Proper North Indian chart polygons
  const NORTH_INDIAN = [
    { id: 1, pts: '220,10 410,10 310,110 220,110', tx: 278, ty: 55, hn: '१', hx: 252, hy: 26 },
    { id: 2, pts: '410,10 430,10 430,110 310,110', tx: 395, ty: 65, hn: '२', hx: 412, hy: 20 },
    { id: 3, pts: '430,10 430,200 330,200 430,10', tx: 410, ty: 100, hn: '३', hx: 422, hy: 100 },
    { id: 4, pts: '430,200 430,390 330,200 430,200', tx: 410, ty: 295, hn: '४', hx: 422, hy: 300 },
    { id: 5, pts: '430,390 310,290 220,390 430,390', tx: 370, ty: 355, hn: '५', hx: 412, hy: 382 },
    { id: 6, pts: '220,390 310,290 130,290 220,390', tx: 220, ty: 360, hn: '६', hx: 222, hy: 390 },
    { id: 7, pts: '130,290 10,390 220,390 130,290', tx: 110, ty: 355, hn: '७', hx: 50, hy: 382 },
    { id: 8, pts: '10,390 10,200 130,200 10,390', tx: 42, ty: 295, hn: '८', hx: 18, hy: 300 },
    { id: 9, pts: '10,200 10,10 130,200 10,200', tx: 42, ty: 100, hn: '९', hx: 18, hy: 100 },
    { id: 10, pts: '10,10 130,10 130,110 10,110', tx: 72, ty: 65, hn: '१०', hx: 25, hy: 20 },
    { id: 11, pts: '130,10 220,10 220,110 130,110', tx: 165, ty: 65, hn: '११', hx: 148, hy: 20 },
    { id: 12, pts: '220,10 310,10 310,110 220,110', tx: 265, ty: 65, hn: 'ल', hx: 252, hy: 26 },
  ];

  // House to rashi mapping
  function houseRashi(houseNum: number): number {
    return chart.houseRashis[houseNum - 1];
  }

  function getHouseColor(houseNum: number): string {
    if (houseNum === 1) return HIGHLIGHT_COLORS.lagna;
    if (highlightSeventh && houseNum === seventhHouse) return HIGHLIGHT_COLORS.seventh;
    if (highlightSeventh && seventhTrines.includes(houseNum) && houseNum !== seventhHouse)
      return HIGHLIGHT_COLORS.trine;
    if (houseNum === 6) return HIGHLIGHT_COLORS.sixthHouse;
    return HOUSE_COLORS[houseNum - 1];
  }

  function getHouseStroke(houseNum: number): string {
    if (houseNum === 1) return '#b45309';
    if (highlightSeventh && houseNum === seventhHouse) return '#db2777';
    if (hoveredHouse === houseNum) return '#7c3aed';
    return '#92400e';
  }

  return (
    <div className="flex flex-col items-center gap-2" id={id}>
      {(title || titleHi) && (
        <div className="text-center">
          {titleHi && (
            <div className="font-devanagari font-bold text-primary text-lg">{titleHi}</div>
          )}
          {title && <div className="text-sm text-muted-foreground">{title}</div>}
        </div>
      )}
      <svg
        viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
        width={size}
        height={size * (viewBoxH / viewBoxW)}
        className="border border-amber-700 rounded shadow-md bg-amber-50"
        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
      >
        {/* Outer border */}
        <rect
          x="5"
          y="5"
          width="430"
          height="390"
          rx="4"
          fill="#fef3c7"
          stroke="#92400e"
          strokeWidth="2"
        />

        {/* House polygons */}
        {NORTH_INDIAN.map(h => {
          const rashi = houseRashi(h.id);
          const planets = getPlanetsInHouse(chart, h.id);
          const bgColor = getHouseColor(h.id);
          const strokeColor = getHouseStroke(h.id);
          const transitInHouse = showTransits
            ? transitPlanets.filter(tp => tp.rashi === rashi)
            : [];

          return (
            <g
              key={h.id}
              className="vedic-chart-house cursor-pointer"
              onMouseEnter={() => setHoveredHouse(h.id)}
              onMouseLeave={() => setHoveredHouse(null)}
            >
              <polygon
                points={h.pts}
                fill={bgColor}
                stroke={strokeColor}
                strokeWidth={hoveredHouse === h.id ? '2' : '1.5'}
                opacity="0.97"
              />
              {/* Rashi name */}
              <text
                x={h.tx}
                y={h.ty - 14}
                textAnchor="middle"
                fontSize="10"
                fill="#78350f"
                fontWeight="500"
              >
                {RASHIS_HI[rashi - 1]}
              </text>
              {/* Planets */}
              {planets.map((p, i) => (
                <text
                  key={p.name}
                  x={h.tx}
                  y={h.ty + i * 13}
                  textAnchor="middle"
                  fontSize="11"
                  fill={p.name === 'Rahu' || p.name === 'Ketu' ? '#7c3aed' : '#1e3a5f'}
                  fontWeight="600"
                >
                  {PLANET_SYMBOLS[p.name] ?? p.nameHi.substring(0, 1)}
                  {p.retrograde ? '(व)' : ''}
                </text>
              ))}
              {/* Transit planets */}
              {transitInHouse.map((tp, i) => (
                <text
                  key={`transit-${tp.name}`}
                  x={h.tx}
                  y={h.ty + (planets.length + i) * 13}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#2563eb"
                  fontStyle="italic"
                >
                  [{tp.symbol}]
                </text>
              ))}
              {/* House number (lagna house shows ल) */}
              <text
                x={h.hx}
                y={h.hy}
                textAnchor="middle"
                fontSize="8"
                fill="#a16207"
                fontWeight="400"
              >
                {h.id === 1 ? 'ल' : h.hn}
              </text>
            </g>
          );
        })}

        {/* Center decorative lines */}
        <line x1="10" y1="10" x2="430" y2="390" stroke="#92400e" strokeWidth="1" opacity="0.3" />
        <line x1="430" y1="10" x2="10" y2="390" stroke="#92400e" strokeWidth="1" opacity="0.3" />
        <line x1="220" y1="10" x2="220" y2="390" stroke="#92400e" strokeWidth="0.5" opacity="0.2" />
        <line x1="10" y1="200" x2="430" y2="200" stroke="#92400e" strokeWidth="0.5" opacity="0.2" />
      </svg>

      {/* Legend */}
      <div className="flex gap-3 text-xs flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: HIGHLIGHT_COLORS.lagna, border: '1px solid #b45309' }}
          />
          <span className="font-devanagari">लग्न</span>
        </span>
        {highlightSeventh && (
          <>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: HIGHLIGHT_COLORS.seventh, border: '1px solid #db2777' }}
              />
              <span className="font-devanagari">सप्तम</span>
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: HIGHLIGHT_COLORS.trine, border: '1px solid #059669' }}
              />
              <span className="font-devanagari">सप्तम के त्रिकोण</span>
            </span>
          </>
        )}
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: HIGHLIGHT_COLORS.sixthHouse, border: '1px solid #a16207' }}
          />
          <span className="font-devanagari">षष्ठ भाव</span>
        </span>
        {showTransits && (
          <span className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: HIGHLIGHT_COLORS.transit, border: '1px solid #2563eb' }}
            />
            <span className="font-devanagari">गोचर [गु/श]</span>
          </span>
        )}
      </div>
    </div>
  );
}
