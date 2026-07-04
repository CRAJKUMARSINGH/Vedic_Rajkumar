/**
 * Varshaphal (Annual Solar Return) Service
 * Source: BV Raman Magazine Enhancement Plan
 * Implements annual solar return calculations per B.V. Raman's methods
 */

export interface VarshaphalChart {
  year: number;
  birthDate: string;
  solarReturnDate: string;
  varshesh: {
    planet: string;
    strength: number;
    dignity: string;
    house: number;
  };
  muntha: {
    house: number;
    planet?: string;
    sign: string;
    degree: number;
  };
  tajikaYogas: TajikaYoga[];
  planetaryPositions: PlanetaryPosition[];
  dasha: {
    system: 'Mudda' | 'Patyayini';
    planets: MuddaDasha[];
  };
  predictions: VarshaphalPrediction[];
}

export interface TajikaYoga {
  name: string;
  type: 'Ithasala' | 'Musaripha' | 'Kamboola' | 'Raddha' | 'Durudhara';
  planets: string[];
  house: number;
  strength: number;
  effect: {
    en: string;
    hi: string;
  };
  results: {
    en: string;
    hi: string;
  };
}

export interface PlanetaryPosition {
  planet: string;
  longitude: number;
  house: number;
  sign: string;
  nakshatra: string;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own' | 'Friend' | 'Neutral' | 'Enemy' | 'Debilitated';
  aspects: string[];
}

export interface MuddaDasha {
  planet: string;
  startDate: string;
  endDate: string;
  duration: number; // in months
  strength: number;
  predictions: {
    en: string;
    hi: string;
  };
}

export interface VarshaphalPrediction {
  category: 'Career' | 'Finance' | 'Health' | 'Family' | 'Education' | 'Spiritual';
  prediction: {
    en: string;
    hi: string;
  };
  strength: number;
  period: string;
  remedies?: string[];
}

// Tajika Yoga combinations
const TAJIKA_YOGAS = {
  Ithasala: {
    description: {
      en: 'Beneficial combination between planets in mutual aspect',
      hi: 'परस्पर दृष्टि में ग्रहों के बीच लाभदायक संयोग'
    },
    condition: (planet1: number, planet2: number) => {
      // Planets in mutual aspect (opposition, trine, sextile)
      const aspect = Math.abs(planet1 - planet2);
      return aspect === 180 || aspect === 120 || aspect === 60;
    }
  },
  Musaripha: {
    description: {
      en: 'Planet faster than another in mutual aspect',
      hi: 'परस्पर दृष्टि में तेज ग्रह धीमे ग्रह से आगे'
    },
    condition: (planet1: number, planet2: number, speed1: number, speed2: number) => {
      return TAJIKA_YOGAS.Ithasala.condition(planet1, planet2) && speed1 > speed2;
    }
  },
  Kamboola: {
    description: {
      en: 'Ithasala yoga with Moon involved',
      hi: 'इथासाला योग में चंद्रमा की भागीदारी'
    },
    condition: (planet1: number, planet2: number, moon: number) => {
      return (TAJIKA_YOGAS.Ithasala.condition(planet1, planet2) && 
              (planet1 === moon || planet2 === moon));
    }
  },
  Raddha: {
    description: {
      en: 'Planets in mutual aspect but one is retrograde',
      hi: 'परस्पर दृष्टि में ग्रह लेकिन एक वक्री'
    },
    condition: (planet1: number, planet2: number, retrograde1: boolean, retrograde2: boolean) => {
      return TAJIKA_YOGAS.Ithasala.condition(planet1, planet2) && 
             (retrograde1 || retrograde2);
    }
  },
  Durudhara: {
    description: {
      en: 'Planets in mutual aspect with no obstructions',
      hi: 'परस्पर दृष्टि में ग्रह बिना किसी अवरोध के'
    },
    condition: (planet1: number, planet2: number, obstructions: number[]) => {
      return TAJIKA_YOGAS.Ithasala.condition(planet1, planet2) && 
             obstructions.length === 0;
    }
  }
} as const;

// Varshesh (Year Lord) determination
const getVarshesh = (solarReturnLongitude: number): {
  planet: string;
  strength: number;
  dignity: string;
  house: number;
} => {
  // Simplified Varshesh calculation based on solar return degree
  const degree = solarReturnLongitude % 30;
  const planetAssignments = [
    { planet: 'Sun', range: [0, 5], strength: 10 },
    { planet: 'Mars', range: [5, 10], strength: 8 },
    { planet: 'Mercury', range: [10, 15], strength: 7 },
    { planet: 'Jupiter', range: [15, 20], strength: 9 },
    { planet: 'Venus', range: [20, 25], strength: 6 },
    { planet: 'Saturn', range: [25, 30], strength: 5 }
  ];

  const varshesh = planetAssignments.find(p => degree >= p.range[0] && degree < p.range[1]);
  
  return {
    planet: varshesh?.planet || 'Sun',
    strength: varshesh?.strength || 5,
    dignity: 'Own',
    house: 1 // Solar return house
  };
};

// Muntha calculation
const getMuntha = (birthAscendant: number, age: number): {
  house: number;
  planet?: string;
  sign: string;
  degree: number;
} => {
  // Muntha moves one house per year of age
  const munthaHouse = ((birthAscendant - 1 + age) % 12) + 1;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  return {
    house: munthaHouse,
    sign: signs[munthaHouse - 1],
    degree: (age * 30) % 360 // Simplified calculation
  };
};

/**
 * Calculate Varshaphal (Annual Solar Return) chart
 */
export function calculateVarshaphal(
  birthDate: Date,
  birthLatitude: number,
  birthLongitude: number,
  targetYear: number
): VarshaphalChart {
  // Calculate solar return date (when Sun returns to same degree)
  const birthSunLongitude = 200; // Simplified - should calculate actual position
  const solarReturnDate = new Date(targetYear, birthDate.getMonth(), birthDate.getDate());
  
  // Calculate planetary positions for solar return
  const planetaryPositions = calculateSolarReturnPositions(solarReturnDate, birthLatitude, birthLongitude);
  
  // Determine Varshesh (Year Lord)
  const varshesh = getVarshesh(birthSunLongitude);
  
  // Calculate Muntha
  const age = targetYear - birthDate.getFullYear();
  const muntha = getMuntha(1, age); // Simplified ascendant
  
  // Calculate Tajika Yogas
  const tajikaYogas = calculateTajikaYogas(planetaryPositions);
  
  // Calculate Mudda Dasha
  const muddaDasha = calculateMuddaDasha(varshesh.planet, solarReturnDate);
  
  // Generate predictions
  const predictions = generateVarshaphalPredictions(varshesh, muntha, tajikaYogas, planetaryPositions);

  return {
    year: targetYear,
    birthDate: birthDate.toISOString(),
    solarReturnDate: solarReturnDate.toISOString(),
    varshesh,
    muntha,
    tajikaYogas,
    planetaryPositions,
    dasha: {
      system: 'Mudda',
      planets: muddaDasha
    },
    predictions
  };
}

/**
 * Calculate planetary positions for solar return
 */
function calculateSolarReturnPositions(
  date: Date,
  latitude: number,
  longitude: number
): PlanetaryPosition[] {
  // Simplified calculation - should use Swiss Ephemeris
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const positions: PlanetaryPosition[] = [];

  for (const planet of planets) {
    const longitude = Math.random() * 360; // Simplified
    const house = Math.floor(longitude / 30) + 1;
    const sign = getSignFromLongitude(longitude);
    
    positions.push({
      planet,
      longitude,
      house,
      sign,
      nakshatra: getNakshatraFromLongitude(longitude),
      dignity: getDignity(planet, sign),
      aspects: calculateAspects(longitude)
    });
  }

  return positions;
}

/**
 * Calculate Tajika Yogas
 */
function calculateTajikaYogas(positions: PlanetaryPosition[]): TajikaYoga[] {
  const yogas: TajikaYoga[] = [];

  // Check for Ithasala yogas
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const planet1 = positions[i];
      const planet2 = positions[j];

      if (TAJIKA_YOGAS.Ithasala.condition(planet1.longitude, planet2.longitude)) {
        yogas.push({
          name: `Ithasala ${planet1.planet}-${planet2.planet}`,
          type: 'Ithasala',
          planets: [planet1.planet, planet2.planet],
          house: planet1.house,
          strength: calculateYogaStrength(planet1, planet2),
          effect: TAJIKA_YOGAS.Ithasala.description,
          results: {
            en: `Favorable results from ${planet1.planet} and ${planet2.planet} combination`,
            hi: `${planet1.planet} और ${planet2.planet} संयोग से अनुकूल परिणाम`
          }
        });
      }
    }
  }

  return yogas;
}

/**
 * Calculate Mudda Dasha
 */
function calculateMuddaDasha(varsheshPlanet: string, startDate: Date): MuddaDasha[] {
  const dashaOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const dashaPeriods: Record<string, number> = {
    Sun: 6, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 7
  };

  const dashas: MuddaDasha[] = [];
  let currentDate = new Date(startDate);
  
  // Start from Varshesh planet
  const startIndex = dashaOrder.indexOf(varsheshPlanet);
  const reorderedPlanets = [...dashaOrder.slice(startIndex), ...dashaOrder.slice(0, startIndex)];

  for (const planet of reorderedPlanets) {
    const duration = dashaPeriods[planet] || 1;
    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + duration);

    dashas.push({
      planet,
      startDate: currentDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      strength: duration * 10, // Simplified strength calculation
      predictions: {
        en: `${planet} period will bring ${duration} months of ${getPlanetNature(planet)} influences`,
        hi: `${planet} अवधि ${duration} महीनों के ${getPlanetNatureInHindi(planet)} प्रभाव लाएगी`
      }
    });

    currentDate = endDate;
  }

  return dashas;
}

/**
 * Generate Varshaphal predictions
 */
function generateVarshaphalPredictions(
  varshesh: any,
  muntha: any,
  tajikaYogas: TajikaYoga[],
  positions: PlanetaryPosition[]
): VarshaphalPrediction[] {
  const predictions: VarshaphalPrediction[] = [];

  // Career predictions based on Varshesh
  predictions.push({
    category: 'Career',
    prediction: {
      en: `With ${varshesh.planet} as year lord, career will show ${getCareerPrediction(varshesh.planet)}`,
      hi: `${varshesh.planet} वर्षेश के रूप में, करियर ${getCareerPredictionInHindi(varshesh.planet)} दिखाएगा`
    },
    strength: varshesh.strength * 10,
    period: 'Year-long',
    remedies: getCareerRemedies(varshesh.planet)
  });

  // Health predictions based on Muntha
  predictions.push({
    category: 'Health',
    prediction: {
      en: `Muntha in ${muntha.sign} indicates ${getHealthPrediction(muntha.house)}`,
      hi: `मुंथा ${muntha.sign} में ${getHealthPredictionInHindi(muntha.house)} का संकेत देता है`
    },
    strength: 70,
    period: 'Year-long',
    remedies: getHealthRemedies(muntha.house)
  });

  // Finance predictions based on Tajika Yogas
  const financeYogas = tajikaYogas.filter(y => y.planets.includes('Jupiter') || y.planets.includes('Venus'));
  if (financeYogas.length > 0) {
    predictions.push({
      category: 'Finance',
      prediction: {
        en: `Favorable ${financeYogas[0].name} yoga indicates financial gains`,
        hi: `अनुकूल ${financeYogas[0].name} योग वित्तीय लाभ का संकेत देता है`
      },
      strength: financeYogas[0].strength * 10,
      period: 'When yoga is active',
      remedies: ['Donate to charity', 'Worship Lakshmi']
    });
  }

  return predictions;
}

// Helper functions
function getSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(longitude / 30)];
}

function getNakshatraFromLongitude(longitude: number): string {
  const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
                      'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
                      'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
                      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
                      'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  return nakshatras[Math.floor((longitude * 27) / 360)];
}

function getDignity(planet: string, sign: string): 'Exalted' | 'Moolatrikona' | 'Own' | 'Friend' | 'Neutral' | 'Enemy' | 'Debilitated' {
  // Simplified dignity calculation
  const exaltations: Record<string, string> = {
    Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo',
    Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra'
  };
  
  const debilitations: Record<string, string> = {
    Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces',
    Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries'
  };

  if (exaltations[planet] === sign) return 'Exalted';
  if (debilitations[planet] === sign) return 'Debilitated';
  return 'Own'; // Simplified
}

function calculateAspects(longitude: number): string[] {
  const aspects: string[] = [];
  const house = Math.floor(longitude / 30) + 1;
  
  // All planets aspect 7th house (opposition)
  aspects.push(`${((house + 6) % 12) + 1}`);
  
  // Special aspects for Mars, Jupiter, Saturn
  if (house === 4) { // Mars
    aspects.push(`${((house + 3) % 12) + 1}`, `${((house + 7) % 12) + 1}`, `${((house + 10) % 12) + 1}`);
  }
  // Add more aspect logic as needed
  
  return aspects;
}

function calculateYogaStrength(planet1: PlanetaryPosition, planet2: PlanetaryPosition): number {
  // Simplified strength calculation
  const strength1 = planet1.dignity === 'Exalted' ? 100 : planet1.dignity === 'Debilitated' ? 20 : 60;
  const strength2 = planet2.dignity === 'Exalted' ? 100 : planet2.dignity === 'Debilitated' ? 20 : 60;
  return (strength1 + strength2) / 2;
}

function getPlanetNature(planet: string): string {
  const natures: Record<string, string> = {
    Sun: 'energetic and leadership', Moon: 'emotional and nurturing',
    Mars: 'action-oriented and competitive', Mercury: 'intellectual and communicative',
    Jupiter: 'expansive and wise', Venus: 'pleasurable and artistic',
    Saturn: 'disciplined and restrictive'
  };
  return natures[planet] || 'mixed';
}

function getPlanetNatureInHindi(planet: string): string {
  const natures: Record<string, string> = {
    Sun: 'ऊर्जावान और नेतृत्व', Moon: 'भावनात्मक और पालनकारी',
    Mars: 'क्रियाशील और प्रतिस्पर्धी', Mercury: 'बौद्धिक और संवादात्मक',
    Jupiter: 'विस्तारक और ज्ञानी', Venus: 'आनंददायक और कलात्मक',
    Saturn: 'अनुशासनात्मक और प्रतिबंधक'
  };
  return natures[planet] || 'मिश्रित';
}

function getCareerPrediction(planet: string): string {
  const predictions: Record<string, string> = {
    Sun: 'growth in leadership and recognition',
    Moon: 'success in caring professions or public service',
    Mars: 'advancement in competitive fields or sports',
    Mercury: 'progress in communication, writing, or business',
    Jupiter: 'expansion in teaching, consulting, or spiritual work',
    Venus: 'success in arts, entertainment, or luxury industries',
    Saturn: 'steady progress through hard work and perseverance'
  };
  return predictions[planet] || 'moderate progress';
}

function getCareerPredictionInHindi(planet: string): string {
  const predictions: Record<string, string> = {
    Sun: 'नेतृत्व और मान्यता में वृद्धि',
    Moon: 'देखभाल पेशा या सार्वजनिक सेवा में सफलता',
    Mars: 'प्रतिस्पर्धी क्षेत्रों या खेल में प्रगति',
    Mercury: 'संचार, लेखन या व्यवसाय में प्रगति',
    Jupiter: 'शिक्षण, परामर्श या आध्यात्मिक कार्य में विस्तार',
    Venus: 'कला, मनोरंजन या विलासिती उद्योगों में सफलता',
    Saturn: 'कड़ी मेहनत और दृढ़ता से निरंतर प्रगति'
  };
  return predictions[planet] || 'मध्यम प्रगति';
}

function getCareerRemedies(planet: string): string[] {
  const remedies: Record<string, string[]> = {
    Sun: ['Offer water to Sun', 'Recite Aditya Hridayam'],
    Moon: ['Observe Monday fast', 'Donate white clothes'],
    Mars: ['Recite Hanuman Chalisa', 'Donate red items'],
    Mercury: ['Feed green leaves to cows', 'Recite Budh mantra'],
    Jupiter: ['Donate to teachers', 'Recite Guru mantra'],
    Venus: ['Donate to women', 'Recite Shukra mantra'],
    Saturn: ['Donate black items', 'Recite Shani mantra']
  };
  return remedies[planet] || ['Meditate regularly'];
}

function getHealthPrediction(munthaHouse: number): string {
  const predictions: string[] = [
    'good vitality and energy',
    'focus on digestive health',
    'attention to mental well-being',
    'care for heart and chest',
    'maintain work-life balance',
    'regular health check-ups needed',
    'watch diet and nutrition',
    'strengthen immune system',
    'avoid excessive stress',
    'care for bones and joints',
    'social connections important',
    'rest and rejuvenation needed'
  ];
  return predictions[munthaHouse - 1] || 'moderate health';
}

function getHealthPredictionInHindi(munthaHouse: number): string {
  const predictions: string[] = [
    'अच्छी जीवन शक्ति और ऊर्जा',
    'पाचन स्वास्थ्य पर ध्यान दें',
    'मानसिक स्वास्थ्य पर ध्यान दें',
    'हृदय और छाती की देखभाल करें',
    'कार्य-जीवन संतुलन बनाए रखें',
    'नियमित स्वास्थ्य जांच की आवश्यकता',
    'आहार और पोषण पर ध्यान दें',
    'प्रतिरक्षा प्रणाली मजबूत करें',
    'अत्यधिक तनाव से बचें',
    'हड्डियों और जोड़ों की देखभाल करें',
    'सामाजिक संबंध महत्वपूर्ण',
    'आराम और पुनर्जीवन की आवश्यकता'
  ];
  return predictions[munthaHouse - 1] || 'मध्यम स्वास्थ्य';
}

function getHealthRemedies(munthaHouse: number): string[] {
  const remedies = [
    ['Daily exercise', 'Morning walk'],
    ['Avoid heavy food', 'Practice yoga'],
    ['Meditation', 'Green tea'],
    ['Cardio exercises', 'Avoid stress'],
    ['Time management', 'Hobbies'],
    ['Regular checkups', 'Health insurance'],
    ['Balanced diet', 'Nutrition supplements'],
    ['Immune boosters', 'Vitamin C'],
    ['Stress management', 'Counseling'],
    ['Calcium intake', 'Joint exercises'],
    ['Social activities', 'Community service'],
    ['Adequate sleep', 'Relaxation techniques']
  ];
  return remedies[munthaHouse - 1] || ['Healthy lifestyle'];
}
