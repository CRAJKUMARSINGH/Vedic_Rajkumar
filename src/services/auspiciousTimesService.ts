import { type AscendantData } from './ascendantService';
import { type CompletePlanetaryPositions, calculateCompletePlanetaryPositions } from './ephemerisService';
import { calculateShodashVarga, getVargaChart } from './divisionalChartsService';

export interface TransitPeriod {
  planet: string;
  rashi: number;
  startDate: string;
  endDate: string;
  type: 'Positive' | 'Negative';
}

export interface AuspiciousTimingResult {
  category: string;
  d1Lord: string;
  d1LordRashiD1: number;
  d1Trikonas: number[];
  vargaLord: string;
  vargaLordRashiDV: number;
  vargaTrikonas: number[];
  vargaName: string;
  auspiciousSigns: number[];
  upcomingTransits: TransitPeriod[];
}

const D1_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

export function generateTransitTimeline(auspiciousSigns: number[], startYear: number, endYear: number): TransitPeriod[] {
  const periods: TransitPeriod[] = [];
  const planetsToCheck = ['Jupiter', 'Saturn'];
  
  for (const planet of planetsToCheck) {
    const isPositive = planet === 'Jupiter';
    let currentRashi = -1;
    let periodStart = '';
    
    // Check every 5 days for boundary changes
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        for (let day = 1; day <= 31; day += 5) {
          if (day > 28 && new Date(year, month, day).getMonth() !== month) continue;
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          try {
            const posData = calculateCompletePlanetaryPositions(dateStr, '12:00');
            const pos = posData.planets.find(p => p.name.toLowerCase() === planet.toLowerCase());
            
            if (pos) {
              const rashi = pos.rashiIndex;
              if (rashi !== currentRashi) {
                if (currentRashi !== -1 && auspiciousSigns.includes(currentRashi) && periodStart) {
                  periods.push({
                    planet,
                    rashi: currentRashi,
                    startDate: periodStart,
                    endDate: dateStr,
                    type: isPositive ? 'Positive' : 'Negative'
                  });
                }
                
                currentRashi = rashi;
                periodStart = dateStr;
              }
            }
          } catch (e) {
            // Ignore date parsing errors
          }
        }
      }
    }
    
    if (currentRashi !== -1 && auspiciousSigns.includes(currentRashi) && periodStart) {
      periods.push({
        planet,
        rashi: currentRashi,
        startDate: periodStart,
        endDate: `${endYear}-12-31`,
        type: isPositive ? 'Positive' : 'Negative'
      });
    }
  }
  
  return periods;
}

export function calculateAuspiciousTiming(
  category: string,
  d1HouseIndex: number, // 0-indexed (e.g. 9 for 10th house)
  vargaDivision: number, // e.g. 9 for Navamsha
  vargaHouseIndex: number, // 0-indexed
  vargaName: string,
  ascendantData: AscendantData,
  planetaryPositions: CompletePlanetaryPositions,
  vargaResult: ReturnType<typeof calculateShodashVarga>
): AuspiciousTimingResult {
  
  // D1 Lord
  const d1LagnaRashi = ascendantData.ascendant.rashiIndex;
  const d1TargetRashi = (d1LagnaRashi + d1HouseIndex) % 12;
  const d1Lord = D1_LORDS[d1TargetRashi];
  
  let d1LordRashiD1 = 0;
  const lordPosD1 = planetaryPositions.planets.find(p => p.name.toLowerCase() === d1Lord.toLowerCase());
  if (lordPosD1) {
    d1LordRashiD1 = lordPosD1.rashiIndex;
  }

  const d1Trikonas = [
    d1LordRashiD1,
    (d1LordRashiD1 + 4) % 12,
    (d1LordRashiD1 + 8) % 12
  ];

  // Varga Lord
  let vargaLord = 'Sun';
  let vargaLordRashiDV = 0;
  let vargaTrikonas: number[] = [];
  
  const dvChart = getVargaChart(vargaResult, vargaDivision);
  
  if (dvChart) {
    const dvLagnaRashi = dvChart.ascendantRashi;
    const dvTargetRashi = (dvLagnaRashi + vargaHouseIndex) % 12;
    vargaLord = D1_LORDS[dvTargetRashi];
    
    const dvLordPosition = dvChart.positions.find(p => p.planet === vargaLord);
    if (dvLordPosition) {
      vargaLordRashiDV = dvLordPosition.vargaRashi;
    }
    
    vargaTrikonas = [
      vargaLordRashiDV,
      (vargaLordRashiDV + 4) % 12,
      (vargaLordRashiDV + 8) % 12
    ];
  }

  const auspiciousSigns = Array.from(new Set([...d1Trikonas, ...vargaTrikonas])).sort((a,b) => a-b);
  
  const currentYear = new Date().getFullYear();
  const upcomingTransits = generateTransitTimeline(auspiciousSigns, currentYear - 2, currentYear + 10);

  return {
    category,
    d1Lord,
    d1LordRashiD1,
    d1Trikonas,
    vargaLord,
    vargaLordRashiDV,
    vargaTrikonas,
    vargaName,
    auspiciousSigns,
    upcomingTransits
  };
}

export function generateAllAuspiciousTimings(
  ascendantData: AscendantData,
  planetaryPositions: CompletePlanetaryPositions
): Record<string, AuspiciousTimingResult> {
  const planetMap: Record<string, number> = {};
  planetaryPositions.planets.forEach((pos) => {
    planetMap[pos.name] = pos.rashiIndex * 30 + pos.degrees;
  });
  
  const vargaResult = calculateShodashVarga(planetMap, ascendantData.ascendant.sidereal);

  return {
    career: calculateAuspiciousTiming('Career', 9, 9, 9, 'D-9 (Navamsha)', ascendantData, planetaryPositions, vargaResult),
    marriage: calculateAuspiciousTiming('Marriage', 6, 9, 6, 'D-9 (Navamsha)', ascendantData, planetaryPositions, vargaResult),
    property: calculateAuspiciousTiming('Property / Vehicles', 3, 4, 3, 'D-4 (Chaturthamsha)', ascendantData, planetaryPositions, vargaResult),
    travel: calculateAuspiciousTiming('Foreign Travel', 11, 9, 11, 'D-9 (Navamsha)', ascendantData, planetaryPositions, vargaResult),
    wealth: calculateAuspiciousTiming('Wealth & Gains', 10, 9, 10, 'D-9 (Navamsha)', ascendantData, planetaryPositions, vargaResult),
    health: calculateAuspiciousTiming('Health & Vitality', 0, 9, 0, 'D-9 (Navamsha)', ascendantData, planetaryPositions, vargaResult),
  };
}
