import { SubjectiveAnalysisEngine } from '@/lib/astrology/subjective-analysis-engine';
import { calculateChart, calculateNavamsa, calculateDasha } from '@/lib/vedic/vedicCalc';
import { calculateShadbala } from '@/services/shadabalaService';
import { calculateNakshatra } from '@/services/nakshatraService';
import type {
  BirthChart,
  DivisionalChart,
  ArudhaPada,
  DashaPeriod,
  Transit,
  SubjectiveReading,
  PlanetName,
  ZodiacSign,
  HouseNumber,
} from '@/lib/astrology/types';

/**
 * Run the full 13‑layer subjective analysis without React.
 * Mirrors the logic previously hidden inside the `useSubjectiveAnalysis` hook.
 */
export function runSubjectiveAnalysis(params: {
  enabled: boolean;
  question: string;
  questionDate: string;
  questionTime: string;
  questionLat: string;
  questionLon: string;
  mode: 'jatak' | 'anonymous';
  referenceType?: 'natal' | 'prashna';
  jatakDetails?: {
    name: string;
    date: string;
    time: string;
    lat: number;
    lon: number;
  };
}): SubjectiveReading | null {
  if (!params.enabled) return null;
  try {
    const birthDetails =
      params.mode === 'jatak' && params.jatakDetails
        ? params.jatakDetails
        : {
            name: 'Querent',
            date: params.questionDate,
            time: params.questionTime,
            lat: parseFloat(params.questionLat) || 28.6139,
            lon: parseFloat(params.questionLon) || 77.209,
          };

    const { year, month, day, hour, minute } = (() => {
      const [y, mo, d] = birthDetails.date.split('-').map(Number);
      const [h, mi] = birthDetails.time.split(':').map(Number);
      return { year: y, month: mo, day: d, hour: h, minute: mi };
    })();

    // 1. D1 chart
    const d1Data = calculateChart(
      year,
      month,
      day,
      hour,
      minute,
      birthDetails.lat,
      birthDetails.lon,
      5.5 // IST default
    );

    // 2. Shadbala
    const shadbalaAnalysis = calculateShadbala(
      d1Data.planets.map(p => ({
        name: p.name,
        rashiIndex: p.rashi - 1,
        house: p.house,
        degrees: p.degree,
        isRetrograde: p.retrograde,
        longitude: p.longitude,
      })),
      hour >= 6 && hour < 18,
      month
    );

    const d1PlanetsMapped = d1Data.planets.map(p => {
      const dignity =
        (p.name === 'Sun' && p.rashi === 1) ||
        (p.name === 'Saturn' && p.rashi === 7) ||
        (p.name === 'Moon' && p.rashi === 2) ||
        (p.name === 'Jupiter' && p.rashi === 4) ||
        (p.name === 'Venus' && p.rashi === 12) ||
        (p.name === 'Mars' && p.rashi === 10) ||
        (p.name === 'Mercury' && p.rashi === 6)
          ? 'Exalted'
          : 'Neutral';
      const shResult = shadbalaAnalysis.planets.find(sp => sp.planet === p.name);
      const shScore = shResult ? Math.round(shResult.shadabalaRatio * 100) : 100;
      const nakInfo = calculateNakshatra(p.longitude);
      return {
        planet: p.name as PlanetName,
        sign: p.rashi,
        degree: p.degree,
        house: p.house as HouseNumber,
        dignity,
        retrograde: p.retrograde,
        shadbalaScore: shScore,
        vargottama: false,
        nakshatra: nakInfo.nameEn,
        nakshatraPada: nakInfo.pada,
      };
    });

    const d1: BirthChart = {
      dateTime: `${birthDetails.date}T${birthDetails.time}`,
      place: birthDetails.name,
      latitude: birthDetails.lat,
      longitude: birthDetails.lon,
      lagna: {
        sign: d1Data.rashi,
        degree: d1Data.lagnaLongitude % 30,
        planet: d1Data.lagna,
      },
      planets: d1PlanetsMapped,
    };

    // 3. D9 (Navamsa)
    const d9Data = calculateNavamsa(d1Data);
    const d9PlanetsMapped = d9Data.planets.map(p => ({
      planet: p.name as PlanetName,
      sign: p.rashi,
      degree: p.degree,
      house: p.house as HouseNumber,
      dignity: 'Neutral' as const,
      retrograde: p.retrograde,
    }));
    const d9: DivisionalChart = {
      type: 'D9',
      lagna: { sign: d9Data.rashi, degree: d9Data.lagnaLongitude % 30 },
      planets: d9PlanetsMapped,
    };

    // 4. D10 (Dasamsa)
    const d10LagnaRashi = (() => {
      const rashiNum = Math.floor(d1Data.lagnaLongitude / 30);
      const degInRashi = d1Data.lagnaLongitude - rashiNum * 30;
      const div = Math.floor(degInRashi / 3);
      const isOdd = rashiNum % 2 === 0;
      if (isOdd) return ((rashiNum + div) % 12) + 1;
      const start = (rashiNum + 8) % 12;
      return ((start + div) % 12) + 1;
    })();
    const d10PlanetsMapped = d1Data.planets.map(p => {
      const rashi = Math.floor(p.longitude / 30) + 1;
      let house = rashi - d10LagnaRashi + 1;
      if (house <= 0) house += 12;
      return {
        planet: p.name as PlanetName,
        sign: rashi,
        degree: 0,
        house: house as HouseNumber,
        dignity: 'Neutral' as const,
        retrograde: p.retrograde,
      };
    });
    const d10: DivisionalChart = {
      type: 'D10',
      lagna: { sign: d10LagnaRashi, degree: 15 },
      planets: d10PlanetsMapped,
    };

    // 5. Arudha
    const arudha = (() => {
      // Re‑use the helper from the original hook (calculateArudhaLagna)
      // For brevity we import it directly here.
      const { calculateArudhaLagna } = require('@/services/prasnaMargaExtras');
      return calculateArudhaLagna(d1);
    })();

    // 6. Dasha periods
    const moonPlanet = d1Data.planets.find(p => p.name === 'Moon');
    const moonLon = moonPlanet ? moonPlanet.longitude : 0;
    const birthDate = new Date(`${birthDetails.date}T${birthDetails.time}`);
    const rawDashas = calculateDasha(birthDate, moonLon);
    const now = new Date();
    const dashas: DashaPeriod[] = rawDashas.map(d => ({
      mahadasha: d.lord,
      antardasha: d.antarDashas.find(ad => now >= ad.start && now <= ad.end)?.lord || d.lord,
      startDate: d.start.toISOString().split('T')[0],
      endDate: d.end.toISOString().split('T')[0],
      isActive: now >= d.start && now <= d.end,
    }));

    // 7. Transits (sample static values for now)
    const transits: Transit[] = [
      {
        planet: 'Jupiter',
        currentSign: 'Gemini',
        degree: 18.7,
        retrograde: false,
        houseFromLagna: (((3 - d1Data.lagna + 12) % 12) + 1) as HouseNumber,
      },
      {
        planet: 'Saturn',
        currentSign: 'Pisces',
        degree: 24.25,
        retrograde: false,
        houseFromLagna: (((12 - d1Data.lagna + 12) % 12) + 1) as HouseNumber,
      },
    ];

    // 8. Query context detection (same heuristic as the hook)
    let queryContext: 'general' = 'general';
    const qLower = params.question.toLowerCase();
    if (/(job|work|career|promotion|business|नौकरी|व्यवसाय)/.test(qLower)) queryContext = 'career';
    else if (/(fame|popular|reputation|प्रसिद्धि)/.test(qLower)) queryContext = 'fame';
    else if (/(marry|marriage|wife|husband|विवाह|शादी)/.test(qLower)) queryContext = 'marriage';

    const engine = new SubjectiveAnalysisEngine({
      d1,
      d9,
      d10,
      arudha,
      dashas,
      transits,
      queryContext,
      referenceType: params.referenceType ?? (params.mode === 'jatak' ? 'natal' : 'prashna'),
    });
    return engine.generateReading();
  } catch (e) {
    console.error('Failed to run Subjective Analysis Engine', e);
    return null;
  }
}
