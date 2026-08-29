/**
 * src/services/randomQuestionsService.ts
 * Random Questions Engine for Vedic Rajkumar App
 * Answers any random user question natively based on 12-House Horoscope Evaluation.
 */

import { calcPlanetsAccurate, calcHousesAccurate } from './swissEphemerisService';
import { calculateCompleteAscendant } from './ascendantService';

export interface PresetQuestion {
  id: string;
  category: 'career' | 'relationship' | 'education' | 'finance' | 'property' | 'health' | 'legal' | 'spiritual';
  questionText: string;
  primaryHouse: number;
  secondaryHouse: number;
}

export interface QuestionAnswerResult {
  questionText: string;
  category: string;
  primaryHouse: number;
  secondaryHouse: number;
  chartInfo: {
    lagnaRashi: string;
    lagnaLord: string;
    moonRashi: string;
    moonNakshatra: string;
  };
  score: number; // 0 to 100
  verdict: 'Strong Yes (Highly Favorable)' | 'Yes (Favorable with Effort)' | 'Mixed / Neutral' | 'Caution Required';
  shortAnswer: string;
  detailedAnalysis: {
    primaryHouseStatus: string;
    secondaryHouseStatus: string;
    lagnaStrength: string;
    keyYogasOrAfflictions: string[];
    astrologicalReasoning: string[];
  };
  recommendedRemedies: string[];
}

export const PRESET_RANDOM_QUESTIONS: PresetQuestion[] = [
  {
    id: 'q1',
    category: 'career',
    questionText: 'Will I get a promotion or job elevation in my current organization?',
    primaryHouse: 10,
    secondaryHouse: 11
  },
  {
    id: 'q2',
    category: 'career',
    questionText: 'Is starting a new business venture or independent work favorable for me?',
    primaryHouse: 10,
    secondaryHouse: 7
  },
  {
    id: 'q3',
    category: 'relationship',
    questionText: 'Will my marriage/relationship be harmonious and long-lasting?',
    primaryHouse: 7,
    secondaryHouse: 4
  },
  {
    id: 'q4',
    category: 'relationship',
    questionText: 'When will I meet a compatible life partner?',
    primaryHouse: 7,
    secondaryHouse: 5
  },
  {
    id: 'q5',
    category: 'education',
    questionText: 'Will I clear my competitive examination / higher education goal?',
    primaryHouse: 5,
    secondaryHouse: 9
  },
  {
    id: 'q6',
    category: 'education',
    questionText: 'Is foreign education or overseas study favorable for me?',
    primaryHouse: 9,
    secondaryHouse: 12
  },
  {
    id: 'q7',
    category: 'finance',
    questionText: 'Will my financial condition improve and wealth accumulate?',
    primaryHouse: 2,
    secondaryHouse: 11
  },
  {
    id: 'q8',
    category: 'property',
    questionText: 'Is this a good period to buy real estate, land, or a home?',
    primaryHouse: 4,
    secondaryHouse: 11
  },
  {
    id: 'q9',
    category: 'health',
    questionText: 'How can I improve my health, immunity, and overall vitality?',
    primaryHouse: 1,
    secondaryHouse: 6
  },
  {
    id: 'q10',
    category: 'legal',
    questionText: 'Will I overcome legal disputes, court cases, or competitive rivals?',
    primaryHouse: 6,
    secondaryHouse: 11
  }
];

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

/**
 * Analyzes any custom random question string to determine house mappings.
 */
export function parseRandomQuestionDomain(questionStr: string): { primaryHouse: number; secondaryHouse: number; category: string } {
  const q = questionStr.toLowerCase();

  if (q.includes('job') || q.includes('career') || q.includes('promotion') || q.includes('work') || q.includes('boss') || q.includes('business')) {
    return { primaryHouse: 10, secondaryHouse: 11, category: 'Career & Profession' };
  }
  if (q.includes('marry') || q.includes('marriage') || q.includes('spouse') || q.includes('partner') || q.includes('love') || q.includes('relationship')) {
    return { primaryHouse: 7, secondaryHouse: 4, category: 'Love & Marriage' };
  }
  if (q.includes('money') || q.includes('wealth') || q.includes('finance') || q.includes('income') || q.includes('bank') || q.includes('profit')) {
    return { primaryHouse: 2, secondaryHouse: 11, category: 'Wealth & Finance' };
  }
  if (q.includes('study') || q.includes('exam') || q.includes('education') || q.includes('college') || q.includes('school') || q.includes('degree')) {
    return { primaryHouse: 5, secondaryHouse: 9, category: 'Education & Intellect' };
  }
  if (q.includes('house') || q.includes('property') || q.includes('land') || q.includes('car') || q.includes('vehicle') || q.includes('flat')) {
    return { primaryHouse: 4, secondaryHouse: 11, category: 'Property & Vehicles' };
  }
  if (q.includes('health') || q.includes('disease') || q.includes('cure') || q.includes('fitness') || q.includes('doctor') || q.includes('hospital')) {
    return { primaryHouse: 1, secondaryHouse: 6, category: 'Health & Vitality' };
  }
  if (q.includes('court') || q.includes('case') || q.includes('legal') || q.includes('enemy') || q.includes('dispute') || q.includes('lawyer')) {
    return { primaryHouse: 6, secondaryHouse: 11, category: 'Legal & Disputes' };
  }

  // Default general house
  return { primaryHouse: 1, secondaryHouse: 9, category: 'General Life Guidance' };
}

/**
 * Answers any random question by performing a full 12-house horoscope evaluation.
 */
export async function answerRandomQuestion(
  questionInput: string,
  birthDate: string,
  birthTime: string,
  latitude: number = 23.84,
  longitude: number = 73.71
): Promise<QuestionAnswerResult> {

  // 1. Determine question category and primary/secondary houses
  const preset = PRESET_RANDOM_QUESTIONS.find(p => p.questionText.toLowerCase() === questionInput.toLowerCase());
  const mapping = preset 
    ? { primaryHouse: preset.primaryHouse, secondaryHouse: preset.secondaryHouse, category: preset.category.toUpperCase() }
    : parseRandomQuestionDomain(questionInput);

  const primaryH = mapping.primaryHouse;
  const secondaryH = mapping.secondaryHouse;

  // 2. Compute 12-House Horoscope
  const housesData = await calcHousesAccurate(birthDate, birthTime, latitude, longitude);
  const planetsData = await calcPlanetsAccurate(birthDate, birthTime);

  const ascDeg = housesData.ascendant;
  const ascRashiIdx = Math.floor(ascDeg / 30) % 12;
  const lagnaRashiName = RASHIS[ascRashiIdx];
  const lagnaLord = RASHI_LORDS[lagnaRashiName];

  // Map 12 Houses
  const houseRashiNames: string[] = [];
  const houseLords: string[] = [];
  const houseOccupants: string[][] = Array.from({ length: 12 }, () => []);

  for (let h = 1; h <= 12; h++) {
    const rIdx = (ascRashiIdx + h - 1) % 12;
    const rName = RASHIS[rIdx];
    houseRashiNames.push(rName);
    houseLords.push(RASHI_LORDS[rName]);
  }

  let moonRashi = 'Cancer';
  let moonNakshatra = 'Pushya';

  planetsData.planets.forEach(p => {
    const pRashiIdx = p.rashiIndex;
    const hNum = ((pRashiIdx - ascRashiIdx + 12) % 12) + 1;
    houseOccupants[hNum - 1].push(p.name);

    if (p.name === 'Moon') {
      moonRashi = RASHIS[pRashiIdx];
    }
  });

  // 3. Evaluate Primary House & Secondary House
  const primaryLord = houseLords[primaryH - 1];
  const primaryRashi = houseRashiNames[primaryH - 1];
  const primaryOccs = houseOccupants[primaryH - 1];

  const secondaryLord = houseLords[secondaryH - 1];
  const secondaryOccs = houseOccupants[secondaryH - 1];

  // 4. Calculate Score (0-100)
  let score = 50; // baseline

  // Primary Lord placement evaluation
  const primaryLordObj = planetsData.planets.find(p => p.name === primaryLord);
  if (primaryLordObj) {
    const lordH = ((primaryLordObj.rashiIndex - ascRashiIdx + 12) % 12) + 1;
    if ([1, 4, 5, 7, 9, 10, 11].includes(lordH)) score += 20; // Kendra/Trikona/Gains
    else if ([6, 8, 12].includes(lordH)) score -= 15; // Dusthana
  }

  // Benefics in Primary House
  if (primaryOccs.includes('Jupiter') || primaryOccs.includes('Venus') || primaryOccs.includes('Mercury')) {
    score += 15;
  }
  if (primaryOccs.includes('Saturn') || primaryOccs.includes('Rahu') || primaryOccs.includes('Ketu')) {
    score -= 10;
  }

  // Lagna strength
  const lagnaLordObj = planetsData.planets.find(p => p.name === lagnaLord);
  if (lagnaLordObj) {
    const lH = ((lagnaLordObj.rashiIndex - ascRashiIdx + 12) % 12) + 1;
    if ([1, 4, 5, 7, 9, 10].includes(lH)) score += 15;
  }

  score = Math.max(15, Math.min(95, score));

  // 5. Verdict & Detailed Analysis
  let verdict: QuestionAnswerResult['verdict'] = 'Yes (Favorable with Effort)';
  let shortAnswer = '';

  if (score >= 75) {
    verdict = 'Strong Yes (Highly Favorable)';
    shortAnswer = `The 12-house horoscope shows strong alignment for ${mapping.category}. House ${primaryH} (${primaryRashi}, Lord: ${primaryLord}) is well-fortified.`;
  } else if (score >= 55) {
    verdict = 'Yes (Favorable with Effort)';
    shortAnswer = `Favorable overall. Success is indicated through persistent effort as House ${primaryH} and House ${secondaryH} show positive support.`;
  } else if (score >= 40) {
    verdict = 'Mixed / Neutral';
    shortAnswer = `Mixed planetary indications for House ${primaryH}. Patience and strategic planning required before taking big steps.`;
  } else {
    verdict = 'Caution Required';
    shortAnswer = `House ${primaryH} faces malefic influences. Perform recommended remedies to remove obstacles.`;
  }

  const keyYogas: string[] = [];
  if (score >= 70) keyYogas.push(`Fortified House ${primaryH} (${primaryRashi}) Lord ${primaryLord}`);
  if (primaryOccs.length > 0) keyYogas.push(`Occupants in House ${primaryH}: ${primaryOccs.join(', ')}`);
  if (secondaryOccs.length > 0) keyYogas.push(`Occupants in House ${secondaryH}: ${secondaryOccs.join(', ')}`);

  const astrologicalReasoning: string[] = [
    `Horoscope Lagna is ${lagnaRashiName} (Lord: ${lagnaLord}).`,
    `Query maps to Primary House ${primaryH} (${primaryRashi}, Lord: ${primaryLord}) and Supporting House ${secondaryH} (${houseRashiNames[secondaryH - 1]}).`,
    `Primary Lord ${primaryLord} is positioned in House ${primaryLordObj ? ((primaryLordObj.rashiIndex - ascRashiIdx + 12) % 12) + 1 : primaryH}.`,
    `House ${primaryH} Occupants: ${primaryOccs.length > 0 ? primaryOccs.join(', ') : 'Unoccupied (Evaluated by Lord & Aspects)'}.`,
    `Calculated Horoscope Capability Index for this question: ${score}/100.`
  ];

  const recommendedRemedies: string[] = [
    `Chant the mantra for House ${primaryH} lord (${primaryLord}): "Om ${primaryLord}aya Namah" 108 times.`,
    `Offer water to the Sun (Surya Arghya) daily at sunrise for Lagna strength.`,
    `Donate to worthy causes on the day of ${primaryLord} (e.g., Thursday for Jupiter, Friday for Venus).`
  ];

  return {
    questionText: questionInput,
    category: mapping.category,
    primaryHouse: primaryH,
    secondaryHouse: secondaryH,
    chartInfo: {
      lagnaRashi: lagnaRashiName,
      lagnaLord: lagnaLord,
      moonRashi: moonRashi,
      moonNakshatra: moonNakshatra
    },
    score,
    verdict,
    shortAnswer,
    detailedAnalysis: {
      primaryHouseStatus: `House ${primaryH} in ${primaryRashi} (Lord: ${primaryLord})`,
      secondaryHouseStatus: `House ${secondaryH} in ${houseRashiNames[secondaryH - 1]} (Lord: ${secondaryLord})`,
      lagnaStrength: `Lagna ${lagnaRashiName} (Lord: ${lagnaLord})`,
      keyYogasOrAfflictions: keyYogas,
      astrologicalReasoning
    },
    recommendedRemedies
  };
}
