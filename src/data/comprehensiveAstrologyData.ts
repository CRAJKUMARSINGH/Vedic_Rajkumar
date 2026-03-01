// Comprehensive astrology data for all MoonAstro-inspired reports
// This file contains data structures and utilities for multiple astrology calculations

// Base interfaces
export interface AstrologyReport {
  name: string;
  dateOfBirth: Date;
  moonSign: string;
  ascendant: string;
  sunSign: string;
  generatedAt: Date;
}

// Manglik Yoga Report
export interface ManglikReport extends AstrologyReport {
  hasManglikYoga: boolean;
  manglikType: "No Manglik" | "Partial Manglik" | "Full Manglik" | "Double Manglik";
  manglikTypeHi: string;
  manglikPlanets: string[];
  affectedHouses: number[];
  intensity: number; // 1-10 scale
  effects: {
    positive: string[];
    negative: string[];
    positiveHi: string[];
    negativeHi: string[];
  };
  remedies: string[];
  remediesHi: string[];
  marriageCompatibility: number; // 1-10 scale
  cancellationConditions: string[];
  cancellationConditionsHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Sade Sati Report
export interface SadeSatiReport extends AstrologyReport {
  moonSignIndex: number;
  isCurrentlyInSadeSati: boolean;
  sadeSatiPhase: "Not in Sade Sati" | "First Phase" | "Second Phase" | "Third Phase" | "Complete";
  sadeSatiPhaseHi: string;
  saturnPosition: string;
  startDates: {
    firstPhase?: Date;
    secondPhase?: Date;
    thirdPhase?: Date;
    endDate?: Date;
  };
  currentEffects: string[];
  currentEffectsHi: string[];
  remedies: string[];
  remediesHi: string[];
  shaniMantra: string;
  shaniMantraHi: string;
  fastingRecommendations: string[];
  fastingRecommendationsHi: string[];
  donationItems: string[];
  donationItemsHi: string[];
  overallImpact: number; // 1-10 scale
  peakPeriods: string[];
  peakPeriodsHi: string[];
  successTimeline: string;
  successTimelineHi: string;
}

// Lal Kitab Report
export interface LalKitabReport extends AstrologyReport {
  planetPositions: {
    [key: string]: {
      house: number;
      sign: string;
      isFriend: boolean;
      isEnemy: boolean;
      remedies: string[];
      remediesHi: string[];
    };
  };
  houseAnalysis: {
    [key: number]: {
      ruler: string;
      occupants: string[];
      aspects: string[];
      remedies: string[];
      remediesHi: string[];
    };
  };
  varshphal: {
    year: number;
    predictions: string[];
    predictionsHi: string[];
    remedies: string[];
    remediesHi: string[];
  };
  generalRemedies: string[];
  generalRemediesHi: string[];
  specialRemedies: string[];
  specialRemediesHi: string[];
  predictions: string[];
  predictionsHi: string[];
  financialAdvice: string[];
  financialAdviceHi: string[];
  healthAdvice: string[];
  healthAdviceHi: string[];
  relationshipAdvice: string[];
  relationshipAdviceHi: string[];
}

// Love Compatibility Report
export interface LoveCompatibilityReport {
  person1: {
    name: string;
    dateOfBirth: Date;
    moonSign: string;
    ascendant: string;
  };
  person2: {
    name: string;
    dateOfBirth: Date;
    moonSign: string;
    ascendant: string;
  };
  overallCompatibility: number; // 1-10 scale
  loveCompatibility: number; // 1-10 scale
  marriageCompatibility: number; // 1-10 scale
  mentalCompatibility: number; // 1-10 scale
  physicalCompatibility: number; // 1-10 scale
  financialCompatibility: number; // 1-10 scale
  familyCompatibility: number; // 1-10 scale
  strengths: string[];
  strengthsHi: string[];
  challenges: string[];
  challengesHi: string[];
  recommendations: string[];
  recommendationsHi: string[];
  remedies: string[];
  remediesHi: string[];
  futureProspects: string[];
  futureProspectsHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Health Astrology Report
export interface HealthReport extends AstrologyReport {
  healthScore: number; // 1-10 scale
  weakOrgans: string[];
  weakOrgansHi: string[];
  strongOrgans: string[];
  strongOrgansHi: string[];
  potentialHealthIssues: string[];
  potentialHealthIssuesHi: string[];
  dietaryRecommendations: string[];
  dietaryRecommendationsHi: string[];
  lifestyleRecommendations: string[];
  lifestyleRecommendationsHi: string[];
  medicalPrecautions: string[];
  medicalPrecautionsHi: string[];
  astrologicalRemedies: string[];
  astrologicalRemediesHi: string[];
  gemstoneTherapy: string[];
  gemstoneTherapyHi: string[];
  criticalPeriods: string[];
  criticalPeriodsHi: string[];
  wellnessMantras: string[];
  wellnessMantrasHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Business Astrology Report
export interface BusinessReport extends AstrologyReport {
  businessPotential: number; // 1-10 scale
  suitableBusinessTypes: string[];
  suitableBusinessTypesHi: string[];
  partnershipCompatibility: number; // 1-10 scale
  financialProspects: number; // 1-10 scale
  successTimeline: string;
  successTimelineHi: string;
  favorablePeriods: string[];
  favorablePeriodsHi: string[];
  challengingPeriods: string[];
  challengingPeriodsHi: string[];
  investmentAdvice: string[];
  investmentAdviceHi: string[];
  businessRemedies: string[];
  businessRemediesHi: string[];
  luckyDirections: string[];
  luckyDirectionsHi: string[];
  partnershipAdvice: string[];
  partnershipAdviceHi: string[];
  expansionOpportunities: string[];
  expansionOpportunitiesHi: string[];
  riskFactors: string[];
  riskFactorsHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Lucky Gemstone Report
export interface GemstoneReport extends AstrologyReport {
  primaryGemstone: string;
  primaryGemstoneHi: string;
  secondaryGemstone: string;
  secondaryGemstoneHi: string[];
  substituteGemstones: string[];
  substituteGemstonesHi: string[];
  wearingMethod: string;
  wearingMethodHi: string;
  metalRecommendation: string;
  metalRecommendationHi: string;
  dayToWear: string;
  dayToWearHi: string;
  fingerRecommendation: string;
  fingerRecommendationHi: string;
  activationMantra: string;
  activationMantraHi: string;
  benefits: string[];
  benefitsHi: string[];
  precautions: string[];
  precautionsHi: string[];
  priceRange: string;
  priceRangeHi: string;
  qualityFactors: string[];
  qualityFactorsHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Match Making Report
export interface MatchMakingReport {
  bride: {
    name: string;
    dateOfBirth: Date;
    moonSign: string;
    nakshatra: string;
  };
  groom: {
    name: string;
    dateOfBirth: Date;
    moonSign: string;
    nakshatra: string;
  };
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  recommendation: "Excellent" | "Very Good" | "Good" | "Average" | "Poor" | "Not Recommended";
  recommendationHi: string;
  aspectScores: {
    varna: number;
    vashya: number;
    tara: number;
    yoni: number;
    grahaMaitri: number;
    gana: number;
    bhakoot: number;
    nadi: number;
  };
  doshas: string[];
  doshasHi: string[];
  remedies: string[];
  remediesHi: string[];
  marriageProspects: string[];
  marriageProspectsHi: string[];
  childrenProspects: string[];
  childrenProspectsHi: string[];
  financialCompatibility: string[];
  financialCompatibilityHi: string[];
  healthCompatibility: string[];
  healthCompatibilityHi: string[];
  overallAdvice: string;
  overallAdviceHi: string;
}

// Data structures for calculations
export const MOON_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const MOON_SIGNS_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"
];

export const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);

export const PLANETS = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
];

export const PLANETS_HI = [
  "सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"
];

// Manglik Yoga data
export const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12]; // Houses where Mars creates Manglik Yoga

export const MANGLIK_CANCELLATION_CONDITIONS = {
  en: [
    "Mars in own sign (Aries, Scorpio) or exalted (Capricorn)",
    "Mars in conjunction with Jupiter",
    "Mars aspecting Jupiter",
    "Mars in Navamsa of Jupiter",
    "Mars in trine from Jupiter",
    "Mars in Leo for Leo ascendant",
    "Mars in Sagittarius for Sagittarius ascendant",
    "Mars in Pisces for Pisces ascendant"
  ],
  hi: [
    "मंगल अपने राशि (मेष, वृश्चिक) या उच्च (मकर) में",
    "मंगल गुरु के साथ संयुक्त",
    "मंगल गुरु को देख रहा है",
    "मंगल गुरु के नवांश में",
    "मंगल गुरु से त्रिकोण में",
    "सिंह लग्न के लिए सिंह में मंगल",
    "धनु लग्न के लिए धनु में मंगल",
    "मीन लग्न के लिए मीन में मंगल"
  ]
};

// Sade Sati data
export const SADE_SATI_MOON_SIGNS = ["Capricorn", "Aquarius", "Pisces"];

export const SHANI_REMEDIES = {
  en: [
    "Recite Shani Mantra: Om Sham Shanicharaya Namah",
    "Fast on Saturdays",
    "Donate black items (black cloth, sesame oil, iron)",
    "Feed crows and dogs",
    "Wear blue sapphire (Neelam) after consultation",
    "Light mustard oil lamp under peepal tree on Saturday",
    "Read Hanuman Chalisa daily",
    "Avoid alcohol and non-vegetarian food on Saturdays"
  ],
  hi: [
    "शनि मंत्र का जाप करें: ॐ शं शनिचराय नमः",
    "शनिवार का व्रत रखें",
    "काली वस्तुएं दान करें (काले कपड़े, तिल का तेल, लोहा)",
    "कौवों और कुत्तों को भोजन दें",
    "परामर्श के बाद नीलम धारण करें",
    "शनिवार को पीपल के पेड़ के नीचे सरसों का तेल दीपक जलाएं",
    "प्रतिदिन हनुमान चालीसा पढ़ें",
    "शनिवार को शराब और शाकाहारी भोजन से बचें"
  ]
};

// Lal Kitab house rulers
export const LAL_KITAB_HOUSE_RULERS = {
  1: "Sun",
  2: "Jupiter",
  3: "Mars",
  4: "Moon",
  5: "Jupiter",
  6: "Ketu",
  7: "Venus",
  8: "Saturn",
  9: "Jupiter",
  10: "Saturn",
  11: "Jupiter",
  12: "Rahu"
};

// Gemstone data
export const GEMSTONE_DATA = {
  "Ruby": { planet: "Sun", color: "Red", day: "Sunday", finger: "Ring finger" },
  "Pearl": { planet: "Moon", color: "White", day: "Monday", finger: "Little finger" },
  "Red Coral": { planet: "Mars", color: "Red", day: "Tuesday", finger: "Ring finger" },
  "Emerald": { planet: "Mercury", color: "Green", day: "Wednesday", finger: "Little finger" },
  "Yellow Sapphire": { planet: "Jupiter", color: "Yellow", day: "Thursday", finger: "Index finger" },
  "Diamond": { planet: "Venus", color: "White", day: "Friday", finger: "Middle finger" },
  "Blue Sapphire": { planet: "Saturn", color: "Blue", day: "Saturday", finger: "Middle finger" },
  "Hessonite": { planet: "Rahu", color: "Honey", day: "Saturday", finger: "Middle finger" },
  "Cat's Eye": { planet: "Ketu", color: "Yellowish", day: "Tuesday", finger: "Ring finger" }
};

// Utility functions
export function getMoonSignIndex(moonSign: string): number {
  return MOON_SIGNS.indexOf(moonSign);
}

export function getAscendantIndex(ascendant: string): number {
  return MOON_SIGNS.indexOf(ascendant);
}

export function getSunSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export function calculateCompatibilityScore(
  sign1: string,
  sign2: string,
  type: "general" | "love" | "marriage" = "general"
): number {
  const sign1Index = getMoonSignIndex(sign1);
  const sign2Index = getMoonSignIndex(sign2);
  
  // Basic compatibility based on zodiac elements and aspects
  const elementCompatibility = getElementCompatibility(sign1Index, sign2Index);
  const aspectCompatibility = getAspectCompatibility(sign1Index, sign2Index);
  
  let baseScore = (elementCompatibility + aspectCompatibility) / 2;
  
  // Adjust based on type
  if (type === "love") {
    baseScore += getLoveCompatibilityBonus(sign1Index, sign2Index);
  } else if (type === "marriage") {
    baseScore += getMarriageCompatibilityBonus(sign1Index, sign2Index);
  }
  
  return Math.min(10, Math.max(1, Math.round(baseScore)));
}

function getElementCompatibility(sign1: number, sign2: number): number {
  // Fire, Earth, Air, Water elements
  const elements = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3]; // Simplified element mapping
  const elem1 = elements[sign1];
  const elem2 = elements[sign2];
  
  if (elem1 === elem2) return 8; // Same element - good compatibility
  if (Math.abs(elem1 - elem2) === 2) return 6; // Complementary elements
  if (Math.abs(elem1 - elem2) === 1 || Math.abs(elem1 - elem2) === 3) return 4; // Neutral
  return 2; // Challenging
}

function getAspectCompatibility(sign1: number, sign2: number): number {
  const diff = Math.abs(sign1 - sign2);
  if (diff === 0) return 10; // Same sign
  if (diff === 6) return 3; // Opposition
  if (diff === 3 || diff === 9) return 7; // Trine
  if (diff === 4 || diff === 8) return 6; // Square
  if (diff === 1 || diff === 11 || diff === 5 || diff === 7) return 8; // Sextile
  return 5;
}

function getLoveCompatibilityBonus(sign1: number, sign2: number): number {
  // Venus-ruled signs get bonus for love compatibility
  const venusSigns = [1, 6]; // Taurus, Libra
  if (venusSigns.includes(sign1) || venusSigns.includes(sign2)) {
    return 1;
  }
  return 0;
}

function getMarriageCompatibilityBonus(sign1: number, sign2: number): number {
  // Jupiter-ruled signs get bonus for marriage compatibility
  const jupiterSigns = [2, 8]; // Sagittarius, Pisces
  if (jupiterSigns.includes(sign1) || jupiterSigns.includes(sign2)) {
    return 1;
  }
  return 0;
}

export function getRandomPlanetaryPosition(): { house: number; sign: string } {
  const house = Math.floor(Math.random() * 12) + 1;
  const sign = MOON_SIGNS[Math.floor(Math.random() * 12)];
  return { house, sign };
}
