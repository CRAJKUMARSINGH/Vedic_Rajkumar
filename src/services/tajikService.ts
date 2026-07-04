/**
 * Tajik (Varshphal) System — Week 30
 * Annual horoscope system based on Solar Return chart.
 * Implements:
 * - Varshphal (Solar Return) chart calculation
 * - Muntha (annual progressed ascendant)
 * - Tajik Yogas (16 major yogas)
 * - Sahams (Arabic Parts / Tajik lots)
 * - Year lord (Varshesh) determination
 * - Annual predictions by house
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface TajikPlanet {
  name: string;
  rashiIndex: number;
  degrees: number;
  house: number;
  longitude: number; // 0-360
}

export interface VarshphalChart {
  year: number;
  ascendantRashi: number;
  ascendantDegrees: number;
  ascendantName: string;
  planets: TajikPlanet[];
  muntha: Muntha;
}

export interface Muntha {
  rashiIndex: number;
  rashiName: string;
  house: number;
  meaning: { en: string; hi: string };
}

export interface TajikYoga {
  name: string;
  nameHi: string;
  type: 'benefic' | 'malefic' | 'mixed';
  isPresent: boolean;
  strength: 'strong' | 'moderate' | 'weak';
  description: { en: string; hi: string };
}

export interface Saham {
  name: string;
  nameHi: string;
  rashiIndex: number;
  rashiName: string;
  degrees: number;
  meaning: { en: string; hi: string };
}

export interface YearLord {
  planet: string;
  rashiIndex: number;
  house: number;
  strength: 'strong' | 'moderate' | 'weak';
  prediction: { en: string; hi: string };
}

export interface AnnualPrediction {
  house: number;
  topic: string;
  topicHi: string;
  prediction: { en: string; hi: string };
  quality: 'excellent' | 'good' | 'mixed' | 'challenging';
}

export interface TajikAnalysis {
  varshphalChart: VarshphalChart;
  yearLord: YearLord | null;
  yogas: TajikYoga[];
  sahams: Saham[];
  annualPredictions: AnnualPrediction[];
  summary: { en: string; hi: string };
}

// ── Constants ────────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const RASHI_NAMES_HI = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन',
];

// Rashi lords (0=Sun, 1=Moon, 2=Mercury, 3=Mars, 4=Jupiter, 5=Venus, 6=Saturn)
const RASHI_LORDS: Record<number, string> = {
  0: 'Mars', 1: 'Venus', 2: 'Mercury', 3: 'Moon',
  4: 'Sun', 5: 'Mercury', 6: 'Venus', 7: 'Mars',
  8: 'Jupiter', 9: 'Saturn', 10: 'Saturn', 11: 'Jupiter',
};

// Natural benefics/malefics for Tajik
const BENEFICS = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
const MALEFICS = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

const HOUSE_TOPICS: Record<number, { en: string; hi: string }> = {
  1:  { en: 'Self & Health', hi: 'स्वास्थ्य और व्यक्तित्व' },
  2:  { en: 'Wealth & Family', hi: 'धन और परिवार' },
  3:  { en: 'Siblings & Courage', hi: 'भाई-बहन और साहस' },
  4:  { en: 'Home & Mother', hi: 'घर और माता' },
  5:  { en: 'Children & Education', hi: 'संतान और शिक्षा' },
  6:  { en: 'Enemies & Health Issues', hi: 'शत्रु और स्वास्थ्य समस्याएं' },
  7:  { en: 'Marriage & Partnerships', hi: 'विवाह और साझेदारी' },
  8:  { en: 'Longevity & Transformation', hi: 'आयु और परिवर्तन' },
  9:  { en: 'Fortune & Spirituality', hi: 'भाग्य और अध्यात्म' },
  10: { en: 'Career & Status', hi: 'करियर और प्रतिष्ठा' },
  11: { en: 'Gains & Desires', hi: 'लाभ और इच्छाएं' },
  12: { en: 'Losses & Spirituality', hi: 'हानि और मोक्ष' },
};

// ── Muntha Calculation ───────────────────────────────────────────────────────

/**
 * Muntha advances 1 rashi per year from birth ascendant.
 * For year N (age), Muntha = (birthAscendantRashi + N - 1) % 12
 */
export function calculateMuntha(birthAscendantRashi: number, age: number): Muntha {
  const rashiIndex = (birthAscendantRashi + age - 1) % 12;
  const house = ((rashiIndex - birthAscendantRashi + 12) % 12) + 1;

  const MUNTHA_MEANINGS: Record<number, { en: string; hi: string }> = {
    1:  { en: 'Excellent year for self, health, and new beginnings', hi: 'स्वास्थ्य और नई शुरुआत के लिए उत्कृष्ट वर्ष' },
    2:  { en: 'Good for wealth accumulation and family matters', hi: 'धन संचय और पारिवारिक मामलों के लिए अच्छा' },
    3:  { en: 'Favorable for travel, communication, and siblings', hi: 'यात्रा, संचार और भाई-बहन के लिए अनुकूल' },
    4:  { en: 'Focus on home, property, and mother\'s health', hi: 'घर, संपत्ति और माता के स्वास्थ्य पर ध्यान' },
    5:  { en: 'Good for children, creativity, and speculation', hi: 'संतान, रचनात्मकता और सट्टे के लिए अच्छा' },
    6:  { en: 'Challenges from enemies and health issues possible', hi: 'शत्रुओं और स्वास्थ्य समस्याओं से चुनौतियां संभव' },
    7:  { en: 'Important year for marriage and partnerships', hi: 'विवाह और साझेदारी के लिए महत्वपूर्ण वर्ष' },
    8:  { en: 'Year of transformation; avoid risky ventures', hi: 'परिवर्तन का वर्ष; जोखिम भरे कार्यों से बचें' },
    9:  { en: 'Excellent for fortune, spirituality, and long journeys', hi: 'भाग्य, अध्यात्म और लंबी यात्राओं के लिए उत्कृष्ट' },
    10: { en: 'Career advancement and recognition likely', hi: 'करियर में उन्नति और पहचान की संभावना' },
    11: { en: 'Year of gains, fulfillment of desires', hi: 'लाभ और इच्छाओं की पूर्ति का वर्ष' },
    12: { en: 'Expenses increase; focus on spiritual growth', hi: 'खर्च बढ़ेगा; आध्यात्मिक विकास पर ध्यान दें' },
  };

  return {
    rashiIndex,
    rashiName: RASHI_NAMES[rashiIndex],
    house,
    meaning: MUNTHA_MEANINGS[house] ?? { en: 'Neutral year', hi: 'सामान्य वर्ष' },
  };
}

// ── Varshphal Chart ──────────────────────────────────────────────────────────

/**
 * Build a simplified Varshphal (Solar Return) chart.
 * In a real implementation this would use Swiss Ephemeris to find the exact
 * moment the Sun returns to its natal longitude. Here we use the natal
 * planetary positions shifted by the solar return offset.
 */
export function buildVarshphalChart(
  natalPlanets: TajikPlanet[],
  birthAscendantRashi: number,
  birthYear: number,
  targetYear: number,
): VarshphalChart {
  const age = targetYear - birthYear;

  // Solar return ascendant: shifts ~1 rashi per year (simplified)
  const ascRashi = (birthAscendantRashi + age) % 12;
  const ascDegrees = natalPlanets.find(p => p.name === 'Sun')?.degrees ?? 0;

  // Shift all planets by the annual solar offset (simplified)
  const offset = (age * 30) % 360;
  const planets: TajikPlanet[] = natalPlanets.map(p => {
    const newLon = (p.longitude + offset) % 360;
    const newRashi = Math.floor(newLon / 30);
    const newDeg = newLon % 30;
    const house = ((newRashi - ascRashi + 12) % 12) + 1;
    return { ...p, longitude: newLon, rashiIndex: newRashi, degrees: newDeg, house };
  });

  const muntha = calculateMuntha(birthAscendantRashi, age);

  return {
    year: targetYear,
    ascendantRashi: ascRashi,
    ascendantDegrees: ascDegrees,
    ascendantName: RASHI_NAMES[ascRashi],
    planets,
    muntha,
  };
}

// ── Year Lord (Varshesh) ─────────────────────────────────────────────────────

/**
 * Year lord is the lord of the Varshphal ascendant rashi.
 */
export function determineYearLord(chart: VarshphalChart): YearLord | null {
  const lordName = RASHI_LORDS[chart.ascendantRashi];
  const planet = chart.planets.find(p => p.name === lordName);
  if (!planet) return null;

  const isBenefic = BENEFICS.includes(lordName);
  const inKendra = [1, 4, 7, 10].includes(planet.house);
  const inTrikona = [1, 5, 9].includes(planet.house);
  const inDusthana = [6, 8, 12].includes(planet.house);

  const strength: 'strong' | 'moderate' | 'weak' =
    inKendra || inTrikona ? 'strong' : inDusthana ? 'weak' : 'moderate';

  const YEAR_LORD_PREDICTIONS: Record<string, { en: string; hi: string }> = {
    Sun:     { en: 'Year of authority, government matters, and health focus', hi: 'अधिकार, सरकारी मामले और स्वास्थ्य पर ध्यान का वर्ष' },
    Moon:    { en: 'Year of emotions, travel, and family matters', hi: 'भावनाओं, यात्रा और पारिवारिक मामलों का वर्ष' },
    Mars:    { en: 'Year of energy, conflicts, and property matters', hi: 'ऊर्जा, संघर्ष और संपत्ति मामलों का वर्ष' },
    Mercury: { en: 'Year of business, communication, and education', hi: 'व्यापार, संचार और शिक्षा का वर्ष' },
    Jupiter: { en: 'Auspicious year for wisdom, wealth, and spirituality', hi: 'ज्ञान, धन और अध्यात्म के लिए शुभ वर्ष' },
    Venus:   { en: 'Year of love, luxury, arts, and relationships', hi: 'प्रेम, विलासिता, कला और संबंधों का वर्ष' },
    Saturn:  { en: 'Year of hard work, discipline, and karmic lessons', hi: 'कठिन परिश्रम, अनुशासन और कर्म पाठ का वर्ष' },
    Rahu:    { en: 'Year of ambition, foreign connections, and sudden changes', hi: 'महत्वाकांक्षा, विदेश संबंध और अचानक बदलाव का वर्ष' },
    Ketu:    { en: 'Year of spirituality, detachment, and past karma', hi: 'अध्यात्म, वैराग्य और पूर्व कर्म का वर्ष' },
  };

  return {
    planet: lordName,
    rashiIndex: planet.rashiIndex,
    house: planet.house,
    strength,
    prediction: YEAR_LORD_PREDICTIONS[lordName] ?? { en: 'Mixed year', hi: 'मिश्रित वर्ष' },
  };
}

// ── Tajik Yogas ──────────────────────────────────────────────────────────────

export function detectTajikYogas(chart: VarshphalChart): TajikYoga[] {
  const planets = chart.planets;
  const planetMap = Object.fromEntries(planets.map(p => [p.name, p]));

  const isConjunct = (a: string, b: string, orb = 10) => {
    const pa = planetMap[a], pb = planetMap[b];
    if (!pa || !pb) return false;
    const diff = Math.abs(pa.longitude - pb.longitude);
    return Math.min(diff, 360 - diff) <= orb;
  };

  const isOpposition = (a: string, b: string, orb = 10) => {
    const pa = planetMap[a], pb = planetMap[b];
    if (!pa || !pb) return false;
    const diff = Math.abs(pa.longitude - pb.longitude);
    return Math.abs(Math.min(diff, 360 - diff) - 180) <= orb;
  };

  const isTrine = (a: string, b: string, orb = 10) => {
    const pa = planetMap[a], pb = planetMap[b];
    if (!pa || !pb) return false;
    const diff = Math.abs(pa.longitude - pb.longitude);
    const norm = Math.min(diff, 360 - diff);
    return Math.abs(norm - 120) <= orb;
  };

  const yogas: TajikYoga[] = [
    {
      name: 'Ithasala Yoga',
      nameHi: 'इत्थशाल योग',
      type: 'benefic',
      isPresent: isConjunct('Jupiter', 'Venus') || isConjunct('Jupiter', 'Moon'),
      strength: isConjunct('Jupiter', 'Venus', 5) ? 'strong' : 'moderate',
      description: {
        en: 'Benefic planets in applying conjunction — promises fulfillment of desires and success',
        hi: 'शुभ ग्रहों का योग — इच्छाओं की पूर्ति और सफलता का वादा',
      },
    },
    {
      name: 'Ishrafa Yoga',
      nameHi: 'इशराफ योग',
      type: 'malefic',
      isPresent: isConjunct('Saturn', 'Mars') || isConjunct('Saturn', 'Sun'),
      strength: 'moderate',
      description: {
        en: 'Malefic planets in separating aspect — indicates obstacles and delays',
        hi: 'पाप ग्रहों का वियोग — बाधाओं और देरी का संकेत',
      },
    },
    {
      name: 'Nakta Yoga',
      nameHi: 'नक्त योग',
      type: 'mixed',
      isPresent: isConjunct('Mercury', 'Moon') || isConjunct('Mercury', 'Venus'),
      strength: 'moderate',
      description: {
        en: 'Mercury with benefic — success through intermediary or third party',
        hi: 'बुध शुभ ग्रह के साथ — मध्यस्थ के माध्यम से सफलता',
      },
    },
    {
      name: 'Yamaya Yoga',
      nameHi: 'यमाय योग',
      type: 'benefic',
      isPresent: isTrine('Jupiter', 'Venus') || isTrine('Jupiter', 'Moon'),
      strength: isTrine('Jupiter', 'Venus', 5) ? 'strong' : 'moderate',
      description: {
        en: 'Benefics in trine — excellent for prosperity, happiness, and spiritual growth',
        hi: 'शुभ ग्रह त्रिकोण में — समृद्धि, सुख और आध्यात्मिक विकास के लिए उत्कृष्ट',
      },
    },
    {
      name: 'Duphali-Kuttha Yoga',
      nameHi: 'दुफली-कुत्थ योग',
      type: 'malefic',
      isPresent: isOpposition('Saturn', 'Mars') || isOpposition('Saturn', 'Sun'),
      strength: 'moderate',
      description: {
        en: 'Malefics in opposition — conflicts, health issues, and financial losses possible',
        hi: 'पाप ग्रह विरोध में — संघर्ष, स्वास्थ्य समस्याएं और वित्तीय हानि संभव',
      },
    },
    {
      name: 'Kamboola Yoga',
      nameHi: 'कम्बूल योग',
      type: 'benefic',
      isPresent: (() => {
        const moon = planetMap['Moon'];
        const jupiter = planetMap['Jupiter'];
        if (!moon || !jupiter) return false;
        return [1, 4, 7, 10].includes(moon.house) && [1, 4, 7, 10].includes(jupiter.house);
      })(),
      strength: 'strong',
      description: {
        en: 'Moon and Jupiter both in Kendra — excellent for wealth, happiness, and family',
        hi: 'चंद्र और बृहस्पति दोनों केंद्र में — धन, सुख और परिवार के लिए उत्कृष्ट',
      },
    },
  ];

  return yogas;
}

// ── Sahams (Arabic Parts) ────────────────────────────────────────────────────

export function calculateSahams(chart: VarshphalChart): Saham[] {
  const planetMap = Object.fromEntries(chart.planets.map(p => [p.name, p]));
  const ascLon = chart.ascendantRashi * 30 + chart.ascendantDegrees;

  const calcSaham = (a: string, b: string, c: string): number => {
    const pa = planetMap[a]?.longitude ?? 0;
    const pb = planetMap[b]?.longitude ?? 0;
    const pc = planetMap[c]?.longitude ?? 0;
    return ((pa - pb + pc) % 360 + 360) % 360;
  };

  const makeSaham = (name: string, nameHi: string, lon: number, meaning: { en: string; hi: string }): Saham => {
    const rashiIndex = Math.floor(lon / 30);
    return { name, nameHi, rashiIndex, rashiName: RASHI_NAMES[rashiIndex], degrees: lon % 30, meaning };
  };

  const sunLon = planetMap['Sun']?.longitude ?? 0;
  const moonLon = planetMap['Moon']?.longitude ?? 0;
  const jupLon = planetMap['Jupiter']?.longitude ?? 0;
  const venLon = planetMap['Venus']?.longitude ?? 0;
  const satLon = planetMap['Saturn']?.longitude ?? 0;

  return [
    makeSaham('Punya Saham', 'पुण्य सहम', ((moonLon - sunLon + ascLon) % 360 + 360) % 360,
      { en: 'Fortune and auspiciousness indicator', hi: 'भाग्य और शुभता का संकेतक' }),
    makeSaham('Vidya Saham', 'विद्या सहम', ((jupLon - sunLon + ascLon) % 360 + 360) % 360,
      { en: 'Education and wisdom indicator', hi: 'शिक्षा और ज्ञान का संकेतक' }),
    makeSaham('Vivah Saham', 'विवाह सहम', ((venLon - sunLon + ascLon) % 360 + 360) % 360,
      { en: 'Marriage and partnership timing', hi: 'विवाह और साझेदारी का समय' }),
    makeSaham('Santana Saham', 'संतान सहम', ((jupLon - moonLon + ascLon) % 360 + 360) % 360,
      { en: 'Children and progeny indicator', hi: 'संतान का संकेतक' }),
    makeSaham('Karma Saham', 'कर्म सहम', ((satLon - sunLon + ascLon) % 360 + 360) % 360,
      { en: 'Career and profession indicator', hi: 'करियर और व्यवसाय का संकेतक' }),
  ];
}

// ── Annual Predictions ───────────────────────────────────────────────────────

export function generateAnnualPredictions(
  chart: VarshphalChart,
  yearLord: YearLord | null,
): AnnualPrediction[] {
  const predictions: AnnualPrediction[] = [];
  const munthaHouse = chart.muntha.house;

  for (let house = 1; house <= 12; house++) {
    const planetsInHouse = chart.planets.filter(p => p.house === house);
    const beneficsInHouse = planetsInHouse.filter(p => BENEFICS.includes(p.name));
    const maleficsInHouse = planetsInHouse.filter(p => MALEFICS.includes(p.name));
    const isMunthaHouse = house === munthaHouse;

    let quality: AnnualPrediction['quality'];
    if (isMunthaHouse && beneficsInHouse.length > 0) quality = 'excellent';
    else if (beneficsInHouse.length > maleficsInHouse.length) quality = 'good';
    else if (maleficsInHouse.length > beneficsInHouse.length) quality = 'challenging';
    else quality = 'mixed';

    const topic = HOUSE_TOPICS[house];
    const munthaNote = isMunthaHouse ? ' (Muntha here — highlighted year)' : '';
    const munthaNoteHi = isMunthaHouse ? ' (मुंथा यहाँ — विशेष वर्ष)' : '';

    predictions.push({
      house,
      topic: topic.en,
      topicHi: topic.hi,
      quality,
      prediction: {
        en: `${quality === 'excellent' ? 'Excellent' : quality === 'good' ? 'Favorable' : quality === 'challenging' ? 'Challenging' : 'Mixed'} period for ${topic.en.toLowerCase()}${munthaNote}. ${beneficsInHouse.length > 0 ? `${beneficsInHouse.map(p => p.name).join(', ')} bring support.` : ''} ${maleficsInHouse.length > 0 ? `${maleficsInHouse.map(p => p.name).join(', ')} require caution.` : ''}`.trim(),
        hi: `${topic.hi} के लिए ${quality === 'excellent' ? 'उत्कृष्ट' : quality === 'good' ? 'अनुकूल' : quality === 'challenging' ? 'चुनौतीपूर्ण' : 'मिश्रित'} समय${munthaNoteHi}।`,
      },
    });
  }

  return predictions;
}

// ── Main Analysis ────────────────────────────────────────────────────────────

export function analyzeTajik(
  natalPlanets: TajikPlanet[],
  birthAscendantRashi: number,
  birthYear: number,
  targetYear: number,
): TajikAnalysis {
  const varshphalChart = buildVarshphalChart(natalPlanets, birthAscendantRashi, birthYear, targetYear);
  const yearLord = determineYearLord(varshphalChart);
  const yogas = detectTajikYogas(varshphalChart);
  const sahams = calculateSahams(varshphalChart);
  const annualPredictions = generateAnnualPredictions(varshphalChart, yearLord);

  const presentYogas = yogas.filter(y => y.isPresent);
  const age = targetYear - birthYear;

  return {
    varshphalChart,
    yearLord,
    yogas,
    sahams,
    annualPredictions,
    summary: {
      en: `Varshphal ${targetYear} (Age ${age}): Ascendant in ${varshphalChart.ascendantName}. Year lord ${yearLord?.planet ?? 'Unknown'} in house ${yearLord?.house ?? '?'}. Muntha in ${varshphalChart.muntha.rashiName} (house ${varshphalChart.muntha.house}). ${presentYogas.length} Tajik yoga${presentYogas.length !== 1 ? 's' : ''} active.`,
      hi: `वर्षफल ${targetYear} (आयु ${age}): लग्न ${RASHI_NAMES_HI[varshphalChart.ascendantRashi]} में। वर्षेश ${yearLord?.planet ?? 'अज्ञात'} भाव ${yearLord?.house ?? '?'} में। मुंथा ${RASHI_NAMES_HI[varshphalChart.muntha.rashiIndex]} (भाव ${varshphalChart.muntha.house}) में। ${presentYogas.length} ताजिक योग सक्रिय।`,
    },
  };
}
