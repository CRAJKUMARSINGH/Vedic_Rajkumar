import { useMemo } from 'react';
import { calculateChart, calculateNavamsa, calculateDasha } from '../lib/vedic/vedicCalc';
import { SubjectiveAnalysisEngine } from '../lib/astrology/subjective-analysis-engine';
import { calculateShadbala } from '../services/shadabalaService';
import { calculateNakshatra } from '../services/nakshatraService';
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
} from '../lib/astrology/types';

// Map rashi number (1-12) to ZodiacSign string
const RASHI_MAP: Record<number, ZodiacSign> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

const PLANET_NAME_MAP: Record<string, PlanetName> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mars: 'Mars',
  Mercury: 'Mercury',
  Jupiter: 'Jupiter',
  Venus: 'Venus',
  Saturn: 'Saturn',
  Rahu: 'Rahu',
  Ketu: 'Ketu',
};

const RASHI_LORDS: Record<number, PlanetName> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter',
};

// Calculate Dasamsa (D10) rashi
function calculateDasamsaRashi(lon: number): number {
  const rashiNum = Math.floor(lon / 30); // 0-11
  const degInRashi = lon - rashiNum * 30; // 0-29.99
  const div = Math.floor(degInRashi / 3); // 0-9
  const isOdd = rashiNum % 2 === 0; // Aries(0) is odd, Taurus(1) even

  if (isOdd) {
    return ((rashiNum + div) % 12) + 1;
  } else {
    // Starts from 9th sign from rashiNum
    const start = (rashiNum + 8) % 12;
    return ((start + div) % 12) + 1;
  }
}

// Calculate Arudha of any house (1-based from Lagna)
function calculateArudhaOfHouse(
  houseNum: number,
  d1Planets: any[],
  lagnaRashiNum: number
): { sign: ZodiacSign; houseFromLagna: HouseNumber } {
  const houseRashi = ((lagnaRashiNum - 1 + houseNum - 1) % 12) + 1;
  const lord = RASHI_LORDS[houseRashi];
  const lordPlanet = d1Planets.find(p => p.planet === lord);
  const lordHouse = lordPlanet ? lordPlanet.house : 1;

  const distance = (lordHouse - houseNum + 12) % 12;
  let arudhaHouseNum = ((lordHouse + distance - 1) % 12) + 1;

  // Apply Jaimini exceptions (cannot fall in self or 7th)
  if (arudhaHouseNum === houseNum) {
    arudhaHouseNum = ((arudhaHouseNum + 9) % 12) + 1; // shift by 10 houses
  } else if (arudhaHouseNum === ((houseNum + 6 - 1) % 12) + 1) {
    arudhaHouseNum = ((arudhaHouseNum + 9) % 12) + 1; // shift by 10 houses
  }

  const arudhaRashiNum = ((lagnaRashiNum - 1 + arudhaHouseNum - 1) % 12) + 1;
  return {
    sign: RASHI_MAP[arudhaRashiNum],
    houseFromLagna: arudhaHouseNum as HouseNumber,
  };
}

// Calculate Arudha Lagna (AL) and other bhava arudhas
function calculateArudhaLagna(d1: BirthChart): ArudhaPada {
  const lagnaRashiIndex = Object.values(RASHI_MAP).indexOf(d1.lagna.sign) + 1;

  const al = calculateArudhaOfHouse(1, d1.planets, lagnaRashiIndex);
  const a4 = calculateArudhaOfHouse(4, d1.planets, lagnaRashiIndex);
  const a10 = calculateArudhaOfHouse(10, d1.planets, lagnaRashiIndex);
  const ul = calculateArudhaOfHouse(12, d1.planets, lagnaRashiIndex);

  return {
    arudhaLagna: {
      sign: al.sign,
      houseFromLagna: al.houseFromLagna,
      planets: [],
      signification: 'AL Lagna',
    },
    bhavaArudhas: {
      4: {
        sign: a4.sign,
        houseFromLagna: a4.houseFromLagna,
        planets: [],
        signification: 'A4 Comfort',
      },
      10: {
        sign: a10.sign,
        houseFromLagna: a10.houseFromLagna,
        planets: [],
        signification: 'A10 Career',
      },
    },
    upapadaLagna: {
      sign: ul.sign,
      houseFromLagna: ul.houseFromLagna,
    },
  };
}

// Parse string formats to individual numbers for calculateChart
function parseDateString(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return { year, month, day, hour, minute };
}

export function useSubjectiveAnalysis(params: {
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
}) {
  return useMemo(() => {
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

      const { year, month, day, hour, minute } = parseDateString(
        birthDetails.date,
        birthDetails.time
      );
      const tz = 5.5; // Default IST

      // 1. Calculate D1 Chart
      const d1Data = calculateChart(
        year,
        month,
        day,
        hour,
        minute,
        birthDetails.lat,
        birthDetails.lon,
        tz
      );

      // Calculate real Shadbala
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
          p.name === 'Sun' && p.rashi === 1
            ? 'Exalted'
            : p.name === 'Saturn' && p.rashi === 7
              ? 'Exalted'
              : p.name === 'Moon' && p.rashi === 2
                ? 'Exalted'
                : p.name === 'Jupiter' && p.rashi === 4
                  ? 'Exalted'
                  : p.name === 'Venus' && p.rashi === 12
                    ? 'Exalted'
                    : p.name === 'Mars' && p.rashi === 10
                      ? 'Exalted'
                      : p.name === 'Mercury' && p.rashi === 6
                        ? 'Exalted'
                        : 'Neutral'; // Standard simplify fallback

        const shResult = shadbalaAnalysis.planets.find(sp => sp.planet === p.name);
        const shadbalaScore = shResult ? Math.round(shResult.shadabalaRatio * 100) : 100;

        // Calculate Nakshatra
        const nakInfo = calculateNakshatra(p.longitude);

        return {
          planet: PLANET_NAME_MAP[p.name] || 'Sun',
          sign: RASHI_MAP[p.rashi] || 'Aries',
          degree: p.degree,
          house: p.house as HouseNumber,
          dignity: dignity as any,
          retrograde: p.retrograde,
          shadbalaScore,
          vargottama: false,
          nakshatra: nakInfo.nameEn as any,
          nakshatraPada: nakInfo.pada as any,
        };
      });

      const d1: BirthChart = {
        dateTime: `${birthDetails.date}T${birthDetails.time}`,
        place: birthDetails.name,
        latitude: birthDetails.lat,
        longitude: birthDetails.lon,
        lagna: {
          sign: RASHI_MAP[d1Data.lagna] || 'Aries',
          degree: d1Data.lagnaLongitude % 30,
          planet: RASHI_LORDS[d1Data.lagna],
        },
        planets: d1PlanetsMapped,
      };

      // 2. Calculate D9 Chart
      const d9Data = calculateNavamsa(d1Data);
      const d9PlanetsMapped = d9Data.planets.map(p => ({
        planet: PLANET_NAME_MAP[p.name] || 'Sun',
        sign: RASHI_MAP[p.rashi] || 'Aries',
        degree: p.degree,
        house: p.house as HouseNumber,
        dignity: 'Neutral' as const,
        retrograde: p.retrograde,
      }));

      const d9: DivisionalChart = {
        type: 'D9',
        lagna: {
          sign: RASHI_MAP[d9Data.lagna] || 'Aries',
          degree: d9Data.lagnaLongitude % 30,
        },
        planets: d9PlanetsMapped,
      };

      // 3. Calculate D10 Chart
      const d10LagnaRashi = calculateDasamsaRashi(d1Data.lagnaLongitude);
      const d10PlanetsMapped = d1Data.planets.map(p => {
        const rashi = calculateDasamsaRashi(p.longitude);
        let house = rashi - d10LagnaRashi + 1;
        if (house <= 0) house += 12;
        return {
          planet: PLANET_NAME_MAP[p.name] || 'Sun',
          sign: RASHI_MAP[rashi] || 'Aries',
          degree: 0,
          house: house as HouseNumber,
          dignity: 'Neutral' as const,
          retrograde: p.retrograde,
        };
      });

      const d10: DivisionalChart = {
        type: 'D10',
        lagna: {
          sign: RASHI_MAP[d10LagnaRashi] || 'Aries',
          degree: 15,
        },
        planets: d10PlanetsMapped,
      };

      // 4. Calculate Arudha
      const arudha = calculateArudhaLagna(d1);

      // 5. Calculate Vimshottari Dashas
      const moonPlanet = d1Data.planets.find(p => p.name === 'Moon');
      const moonLon = moonPlanet ? moonPlanet.longitude : 0;
      const birthDate = new Date(`${birthDetails.date}T${birthDetails.time}`);
      const rawDashas = calculateDasha(birthDate, moonLon);

      const now = new Date();
      const dashas: DashaPeriod[] = rawDashas.map(d => {
        const isActive = now >= d.start && now <= d.end;
        return {
          mahadasha: PLANET_NAME_MAP[d.lord] || 'Sun',
          antardasha:
            PLANET_NAME_MAP[
              d.antarDashas.find(ad => now >= ad.start && now <= ad.end)?.lord || 'Sun'
            ] || 'Sun',
          startDate: d.start.toISOString().split('T')[0],
          endDate: d.end.toISOString().split('T')[0],
          isActive,
        };
      });

      // 6. Transits (May 2026/Current placeholders)
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

      // Detect Query Context based on question keywords
      let queryContext = 'general';
      const qLower = params.question.toLowerCase();
      if (
        qLower.includes('job') ||
        qLower.includes('work') ||
        qLower.includes('career') ||
        qLower.includes('promotion') ||
        qLower.includes('business') ||
        qLower.includes('नौकरी') ||
        qLower.includes('व्यवसाय')
      ) {
        queryContext = 'career';
      } else if (
        qLower.includes('fame') ||
        qLower.includes('popular') ||
        qLower.includes('reputation') ||
        qLower.includes('प्रसिद्धि')
      ) {
        queryContext = 'fame';
      } else if (
        qLower.includes('marry') ||
        qLower.includes('marriage') ||
        qLower.includes('wife') ||
        qLower.includes('husband') ||
        qLower.includes('विवाह') ||
        qLower.includes('शादी')
      ) {
        queryContext = 'marriage';
      }

      // Generate Reading
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
  }, [
    params.enabled,
    params.question,
    params.questionDate,
    params.questionTime,
    params.questionLat,
    params.questionLon,
    params.mode,
    params.referenceType,
    params.jatakDetails,
  ]);
}
