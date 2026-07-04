import { calculateCompletePlanetaryPositions } from './ephemerisService';
import { calculateShadbala, type ShadabalaResult, type ShadabalaAnalysis } from './shadabalaService';
import { calculateVimshottariDasha, type DashaResult } from './dashaService';
import { analyzeYogas, type YogaAnalysis } from './yogaService';
import { calculatePadaLagna, type JaiminiAnalysis } from './jaiminiService';
import { assemblePsychologicalProfile, type PsychologicalProfile } from './psychologicalProfileService';
import { calculateDynamicTransits } from './dynamicTransitService';

export interface EngineData {
  planets: any[];
  lagnaRashiIdx: number;
  shadabala: ShadabalaResult[];
  shadabalaAnalysis: ShadabalaAnalysis;
  dasha: DashaResult;
  yogaAnalysis: YogaAnalysis;
  jaiminiAnalysis: JaiminiAnalysis;
  psychologicalProfile: PsychologicalProfile;
  transits: any[];
  aspects: any[];
  tenthLordName: string;
}

export function assembleEngineData(
  date: Date,
  lat: number = 28.6139,
  lon: number = 77.209
): EngineData {
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().substring(0, 5);
  const birthMonth = parseInt(dateStr.split('-')[1], 10);
  const hour = parseInt(timeStr.split(':')[0], 10);
  const daytime = hour >= 6 && hour < 18;

  const positionsResult = calculateCompletePlanetaryPositions(dateStr, timeStr);
  const positions = positionsResult.planets;
  const lagnaPos = positions.find(p => p.name === 'Ascendant');
  const lagnaRashiIdx = lagnaPos?.rashiIndex ?? 0;

  // Re-map planets to basic format expected by the engine
  const planets = positions.map(p => {
    let house = ((p.rashiIndex - lagnaRashiIdx + 12) % 12) + 1;
    return {
      name: p.name,
      house: house,
      rashiIndex: p.rashiIndex,
      degrees: p.degrees,
      isRetrograde: p.isRetrograde,
      longitude: p.rashiIndex * 30 + p.degrees,
      nakshatra: p.nakshatra
    };
  });

  const shadabalaResult = calculateShadbala(planets, daytime, birthMonth);
  const moon = planets.find(p => p.name === 'Moon');
  const moonLongitude = moon ? moon.longitude : 0;
  
  const dashaResult = calculateVimshottariDasha(dateStr, timeStr, 3, moonLongitude);
  const yogaAnalysis = analyzeYogas(planets, lagnaRashiIdx);
  
  const jaiminiPlanets = planets.map(p => ({
    name: p.name,
    rashiIndex: p.rashiIndex,
    degrees: p.degrees,
    house: p.house
  }));
  const padaLagna = calculatePadaLagna(lagnaRashiIdx, lagnaPos?.degrees ?? 0, jaiminiPlanets);
  const jaiminiAnalysis: JaiminiAnalysis = { padaLagna: padaLagna ?? 0, karakas: [] }; // Karakas not strictly needed by the orchestrator unless used

  // Re-map transits to minimal format
  const transits: any[] = [];

  const tenthHouse = ((lagnaRashiIdx + 9) % 12);
  const rashiLords: Record<number, string> = {
    0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon', 4: 'Sun', 5: 'Mercury',
    6: 'Venus', 7: 'Mars', 8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter'
  };
  const tenthLordName = rashiLords[tenthHouse];

  const psychologicalProfile = assemblePsychologicalProfile(
    lagnaPos?.nakshatra ?? 'Ashwini',
    planets as any,
    'Ashwini', // rahuNakshatra placeholder
    'Ashwini', // ketuNakshatra placeholder
    'Ashwini', // saturnNakshatra placeholder
    dashaResult,
    shadabalaResult.planets
  );

  return {
    planets,
    lagnaRashiIdx,
    shadabala: shadabalaResult.planets,
    shadabalaAnalysis: shadabalaResult,
    dasha: dashaResult,
    yogaAnalysis,
    jaiminiAnalysis,
    psychologicalProfile,
    transits,
    aspects: [], // Minimal aspects if not used heavily by orchestrator
    tenthLordName
  };
}
