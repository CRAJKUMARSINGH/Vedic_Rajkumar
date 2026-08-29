/**
 * src/services/prashnaService.ts
 * Prashna (Horary) Question-Time Astrology Service
 * Computes 12-house Prashna Lagna, Chandra Lagna, Tajika Yogas, and Query Significators
 * for real-time questions (Marriage, Career, Health, Finance, General).
 */

import { calcPlanetsAccurate, calcHousesAccurate } from './swissEphemerisService';

export interface PrashnaQuery {
  question: string;
  category: 'marriage' | 'career' | 'health' | 'finance' | 'general';
  queryDate: string; // YYYY-MM-DD
  queryTime: string; // HH:MM
  latitude: number;
  longitude: number;
  placeName?: string;
}

export interface TajikaYoga {
  name: string;
  planets: [string, string];
  nature: 'Benefic' | 'Malefic' | 'Neutral';
  description: string;
}

export interface HouseDetail {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  rashiLord: string;
  degree: number;
  occupants: string[];
  aspectingPlanets: string[];
}

export interface PrashnaResult {
  query: PrashnaQuery;
  prashnaLagna: {
    rashiName: string;
    rashiIndex: number;
    degrees: number;
    lord: string;
  };
  moonDetails: {
    rashiName: string;
    rashiIndex: number;
    degrees: number;
    house: number;
    nakshatra: string;
    lord: string;
  };
  primaryHouseNumber: number;
  karyesh: {
    planet: string;
    rashiName: string;
    house: number;
  };
  houses: HouseDetail[];
  tajikaYogas: TajikaYoga[];
  verdict: 'Highly Favorable' | 'Favorable' | 'Moderate / Delayed' | 'Challenging';
  verdictSummary: string;
  detailedAnalysis: string[];
}

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const RASHI_LORDS: Record<string, string> = {
  'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
  'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
  'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

function getNakshatra(longitude: number): { name: string; lord: string } {
  const norm = ((longitude % 360) + 360) % 360;
  const idx = Math.floor(norm / (360 / 27));
  const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  return {
    name: NAKSHATRAS[idx],
    lord: lords[idx % 9]
  };
}

/**
 * Maps query category to primary house of interest in Prashna.
 */
function getPrimaryHouseForCategory(category: PrashnaQuery['category']): number {
  switch (category) {
    case 'marriage': return 7;
    case 'career': return 10;
    case 'health': return 1; // Lagna + 6th house for disease assessment
    case 'finance': return 2; // 2nd (wealth) + 11th (gains)
    case 'general': default: return 1;
  }
}

export async function calculatePrashnaHoroscope(query: PrashnaQuery): Promise<PrashnaResult> {
  const { queryDate, queryTime, latitude, longitude, category } = query;

  // 1. Calculate precise ephemeris data
  const houseData = await calcHousesAccurate(queryDate, queryTime, latitude, longitude);
  const planetData = await calcPlanetsAccurate(queryDate, queryTime);

  const ascDeg = houseData.ascendant;
  const ascRashiIdx = Math.floor(ascDeg / 30) % 12;
  const ascRashiName = RASHIS[ascRashiIdx];
  const lagnaLord = RASHI_LORDS[ascRashiName];

  // 2. Identify 12 Houses
  const houses: HouseDetail[] = [];
  for (let h = 1; h <= 12; h++) {
    const rIdx = (ascRashiIdx + h - 1) % 12;
    const rName = RASHIS[rIdx];
    houses.push({
      houseNumber: h,
      rashiIndex: rIdx,
      rashiName: rName,
      rashiLord: RASHI_LORDS[rName],
      degree: (ascDeg + (h - 1) * 30) % 360,
      occupants: [],
      aspectingPlanets: []
    });
  }

  // 3. Map planets to houses
  let moonHouse = 1;
  let moonDeg = 0;
  let moonRashiIdx = 0;

  const planetsWithHouses = planetData.planets.map(p => {
    const pRashiIdx = p.rashiIndex;
    const houseNum = ((pRashiIdx - ascRashiIdx + 12) % 12) + 1;
    houses[houseNum - 1].occupants.push(p.name);

    if (p.name === 'Moon') {
      moonHouse = houseNum;
      moonDeg = p.sidereal ?? (p.rashiIndex * 30 + p.degrees);
      moonRashiIdx = pRashiIdx;
    }
    return { ...p, house: houseNum };
  });

  const moonNak = getNakshatra(moonDeg);

  // 4. Primary house and Karyesh (Significator)
  const primaryHouseNum = getPrimaryHouseForCategory(category);
  const primaryHouseRashi = RASHIS[(ascRashiIdx + primaryHouseNum - 1) % 12];
  const karyeshLord = RASHI_LORDS[primaryHouseRashi];
  const karyeshPlanetObj = planetsWithHouses.find(p => p.name === karyeshLord);
  const karyeshHouse = karyeshPlanetObj ? karyeshPlanetObj.house : primaryHouseNum;

  // 5. Tajika Yogas Analysis
  const tajikaYogas: TajikaYoga[] = [];

  // Check aspect/relationship between Lagna Lord and Karyesh Lord
  const lagnaLordObj = planetsWithHouses.find(p => p.name === lagnaLord);
  if (lagnaLordObj && karyeshPlanetObj) {
    const houseDiff = Math.abs(lagnaLordObj.house - karyeshPlanetObj.house);
    const isKendraOrKona = [0, 3, 4, 6, 8, 9].includes(houseDiff);

    if (isKendraOrKona) {
      tajikaYogas.push({
        name: 'Ithasala Yoga (Harmonious Alliance)',
        planets: [lagnaLord, karyeshLord],
        nature: 'Benefic',
        description: `Lagna Lord (${lagnaLord}) and Karyesh (${karyeshLord}) form a mutual benefic aspect, indicating swift realization of the query objective.`
      });
    } else {
      tajikaYogas.push({
        name: 'Esharapha Yoga (Separate / Dissociation)',
        planets: [lagnaLord, karyeshLord],
        nature: 'Neutral',
        description: `Lagna Lord (${lagnaLord}) and Karyesh (${karyeshLord}) are in non-aspecting signs (${houseDiff} houses apart), suggesting moderate delay or requiring extra effort.`
      });
    }
  }

  // Moon aspect on Lagna or Karyesh
  if (moonHouse === 1 || moonHouse === primaryHouseNum) {
    tajikaYogas.push({
      name: 'Kamboola Yoga (Lunar Confirmation)',
      planets: ['Moon', karyeshLord],
      nature: 'Benefic',
      description: `Moon occupies a pivotal house (House ${moonHouse}), reinforcing success and clarity for the question.`
    });
  }

  // 6. Verdict Calculation
  let verdict: PrashnaResult['verdict'] = 'Favorable';
  let verdictSummary = '';
  const detailedAnalysis: string[] = [];

  detailedAnalysis.push(`Prashna Lagna is ${ascRashiName} (House 1 lord: ${lagnaLord}).`);
  detailedAnalysis.push(`Query Category: ${category.toUpperCase()} → Primary House of Evaluation: House ${primaryHouseNum} (${primaryHouseRashi}, Lord: ${karyeshLord}).`);
  detailedAnalysis.push(`Moon is placed in ${RASHIS[moonRashiIdx]} (House ${moonHouse}, Nakshatra: ${moonNak.name} under ${moonNak.lord}).`);

  const lagnaLordInGoodHouse = lagnaLordObj && [1, 4, 5, 7, 9, 10, 11].includes(lagnaLordObj.house);
  const karyeshInGoodHouse = karyeshPlanetObj && [1, 2, 4, 5, 7, 9, 10, 11].includes(karyeshPlanetObj.house);
  const moonInDusthana = [6, 8, 12].includes(moonHouse);

  if (lagnaLordInGoodHouse && karyeshInGoodHouse && !moonInDusthana) {
    verdict = 'Highly Favorable';
    verdictSummary = `Strong alignment detected. Both Lagna Lord ${lagnaLord} (House ${lagnaLordObj?.house}) and Query Significator ${karyeshLord} (House ${karyeshPlanetObj?.house}) are strongly placed without malefic affliction.`;
  } else if ((lagnaLordInGoodHouse || karyeshInGoodHouse) && !moonInDusthana) {
    verdict = 'Favorable';
    verdictSummary = `Positive outcome indicated. The query significator ${karyeshLord} is positioned favorably in House ${karyeshHouse}.`;
  } else if (moonInDusthana) {
    verdict = 'Moderate / Delayed';
    verdictSummary = `The Moon is in House ${moonHouse} (Dusthana), indicating anxiety or initial hurdles before resolution.`;
  } else {
    verdict = 'Challenging';
    verdictSummary = `Afflictions noted on primary house significators. Caution and remedy recommended.`;
  }

  detailedAnalysis.push(`Final Evaluation: ${verdictSummary}`);

  return {
    query,
    prashnaLagna: {
      rashiName: ascRashiName,
      rashiIndex: ascRashiIdx,
      degrees: ascDeg,
      lord: lagnaLord
    },
    moonDetails: {
      rashiName: RASHIS[moonRashiIdx],
      rashiIndex: moonRashiIdx,
      degrees: moonDeg,
      house: moonHouse,
      nakshatra: moonNak.name,
      lord: moonNak.lord
    },
    primaryHouseNumber: primaryHouseNum,
    karyesh: {
      planet: karyeshLord,
      rashiName: primaryHouseRashi,
      house: karyeshHouse
    },
    houses,
    tajikaYogas,
    verdict,
    verdictSummary,
    detailedAnalysis
  };
}
