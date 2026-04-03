// Week 36-40: AI Prediction Engine (rule-based ML-style predictions)
// Pattern recognition, life event predictions, personalized insights

export interface AIPrediction {
  category: string;
  title: string;
  prediction: string;
  confidence: number; // 0-100
  timeframe: string;
  supportingFactors: string[];
  remedies: string[];
  icon: string;
}

export interface AIInsight {
  type: 'opportunity' | 'challenge' | 'neutral';
  message: string;
  planet: string;
  duration: string;
}

export interface AIReport {
  overallScore: number;
  predictions: AIPrediction[];
  insights: AIInsight[];
  personalityProfile: string;
  lifeTheme: string;
  strongestAreas: string[];
  challengeAreas: string[];
  keyPeriods: Array<{ period: string; theme: string; advice: string }>;
  naturalLanguageSummary: string;
}

interface PlanetData {
  name: string;
  rashiIndex: number;
  house: number;
  degrees: number;
  isRetrograde?: boolean;
}

// Rule-based prediction engine
const PLANET_HOUSE_EFFECTS: Record<string, Record<number, { career: number; love: number; health: number; wealth: number; spiritual: number }>> = {
  Sun: {
    1: { career: 85, love: 60, health: 80, wealth: 70, spiritual: 75 },
    4: { career: 60, love: 75, health: 70, wealth: 65, spiritual: 80 },
    7: { career: 65, love: 80, health: 60, wealth: 70, spiritual: 55 },
    10: { career: 95, love: 55, health: 75, wealth: 85, spiritual: 60 },
  },
  Moon: {
    1: { career: 65, love: 80, health: 70, wealth: 60, spiritual: 85 },
    4: { career: 60, love: 90, health: 75, wealth: 65, spiritual: 80 },
    7: { career: 60, love: 85, health: 65, wealth: 60, spiritual: 70 },
    10: { career: 75, love: 65, health: 70, wealth: 70, spiritual: 65 },
  },
  Jupiter: {
    1: { career: 80, love: 75, health: 85, wealth: 85, spiritual: 90 },
    5: { career: 75, love: 85, health: 80, wealth: 80, spiritual: 85 },
    9: { career: 85, love: 70, health: 80, wealth: 90, spiritual: 95 },
    11: { career: 85, love: 70, health: 75, wealth: 95, spiritual: 75 },
  },
  Saturn: {
    1: { career: 70, love: 45, health: 55, wealth: 65, spiritual: 80 },
    7: { career: 65, love: 50, health: 60, wealth: 60, spiritual: 70 },
    10: { career: 85, love: 50, health: 60, wealth: 75, spiritual: 65 },
  },
  Mars: {
    1: { career: 80, love: 65, health: 75, wealth: 70, spiritual: 55 },
    3: { career: 85, love: 60, health: 80, wealth: 75, spiritual: 50 },
    10: { career: 90, love: 55, health: 70, wealth: 80, spiritual: 50 },
  },
  Venus: {
    1: { career: 70, love: 90, health: 80, wealth: 80, spiritual: 65 },
    5: { career: 65, love: 95, health: 75, wealth: 75, spiritual: 70 },
    7: { career: 65, love: 95, health: 70, wealth: 75, spiritual: 60 },
  },
  Mercury: {
    1: { career: 80, love: 65, health: 70, wealth: 75, spiritual: 60 },
    3: { career: 85, love: 60, health: 65, wealth: 70, spiritual: 55 },
    10: { career: 85, love: 60, health: 65, wealth: 80, spiritual: 55 },
  },
};

function getDefaultScore(planet: string, house: number, area: keyof typeof PLANET_HOUSE_EFFECTS['Sun'][1]): number {
  const planetData = PLANET_HOUSE_EFFECTS[planet];
  if (!planetData) return 65;
  const houseData = planetData[house];
  if (!houseData) return 65;
  return houseData[area];
}

function calculateAreaScore(planets: PlanetData[], area: keyof typeof PLANET_HOUSE_EFFECTS['Sun'][1]): number {
  let total = 0;
  let count = 0;
  planets.forEach(p => {
    const score = getDefaultScore(p.name, p.house, area);
    const weight = ['Sun','Moon','Jupiter','Saturn'].includes(p.name) ? 2 : 1;
    total += score * weight;
    count += weight;
    if (p.isRetrograde) total -= 5 * weight;
  });
  return Math.min(100, Math.max(0, Math.round(total / Math.max(count, 1))));
}

const PREDICTION_TEMPLATES: Record<string, Array<{ threshold: number; text: string; timeframe: string; factors: string[] }>> = {
  career: [
    { threshold: 80, text: 'Exceptional career growth period. Leadership opportunities and recognition are strongly indicated. Your professional reputation reaches new heights.', timeframe: 'Next 12-18 months', factors: ['Strong 10th house', 'Jupiter influence', 'Sun well-placed'] },
    { threshold: 60, text: 'Steady career progress with moderate opportunities. Focus on skill development and networking for best results.', timeframe: 'Next 6-12 months', factors: ['Moderate planetary support', 'Saturn discipline'] },
    { threshold: 0, text: 'Career requires extra effort and patience. Avoid major job changes; focus on strengthening existing position.', timeframe: 'Next 3-6 months', factors: ['Challenging planetary positions', 'Saturn transit effects'] },
  ],
  love: [
    { threshold: 80, text: 'Highly favorable period for love and relationships. New romantic connections are likely; existing relationships deepen significantly.', timeframe: 'Next 12 months', factors: ['Venus well-placed', '7th house strength', 'Jupiter blessing'] },
    { threshold: 60, text: 'Moderate relationship energy. Good for deepening existing bonds; new relationships possible with effort.', timeframe: 'Next 6-9 months', factors: ['Balanced Venus energy', 'Moon support'] },
    { threshold: 0, text: 'Relationship challenges require patience and communication. Focus on self-improvement and emotional healing.', timeframe: 'Next 3-6 months', factors: ['Saturn influence on 7th', 'Venus challenges'] },
  ],
  health: [
    { threshold: 80, text: 'Excellent health period. Vitality is high; good time to start new fitness routines and health practices.', timeframe: 'Next 12 months', factors: ['Strong Ascendant', 'Jupiter health blessing', 'Sun vitality'] },
    { threshold: 60, text: 'Generally good health with minor concerns. Maintain regular routines and avoid overexertion.', timeframe: 'Next 6-9 months', factors: ['Moderate health indicators', 'Moon emotional balance'] },
    { threshold: 0, text: 'Health needs attention. Prioritize rest, nutrition, and medical check-ups. Avoid stress and overwork.', timeframe: 'Next 3-6 months', factors: ['Saturn health challenges', 'Weak 6th house'] },
  ],
  wealth: [
    { threshold: 80, text: 'Outstanding financial period. Multiple income sources, investments perform well, and unexpected gains are possible.', timeframe: 'Next 12-18 months', factors: ['Jupiter in 11th', 'Strong 2nd house', 'Venus wealth yoga'] },
    { threshold: 60, text: 'Steady financial growth. Savings and investments show moderate returns. Avoid speculation.', timeframe: 'Next 6-12 months', factors: ['Moderate wealth indicators', 'Saturn steady income'] },
    { threshold: 0, text: 'Financial caution advised. Avoid major investments or loans. Focus on reducing expenses and building savings.', timeframe: 'Next 3-6 months', factors: ['Saturn financial restriction', 'Challenging 2nd house'] },
  ],
  spiritual: [
    { threshold: 80, text: 'Profound spiritual awakening period. Deep insights, meditation breakthroughs, and connection to higher purpose are strongly indicated.', timeframe: 'Next 12-18 months', factors: ['Jupiter 9th house', 'Ketu influence', 'Strong 12th house'] },
    { threshold: 60, text: 'Good period for spiritual practices. Regular meditation and study of sacred texts brings inner peace.', timeframe: 'Next 6-12 months', factors: ['Moderate spiritual indicators', 'Moon intuition'] },
    { threshold: 0, text: 'Material concerns dominate. Use challenges as spiritual lessons; seek guidance from teachers or mentors.', timeframe: 'Next 3-6 months', factors: ['Rahu material focus', 'Saturn karmic lessons'] },
  ],
};

function getPrediction(area: string, score: number): AIPrediction {
  const templates = PREDICTION_TEMPLATES[area] ?? PREDICTION_TEMPLATES.career;
  const template = templates.find(t => score >= t.threshold) ?? templates[templates.length - 1];
  const icons: Record<string, string> = { career: '💼', love: '❤️', health: '🌿', wealth: '💰', spiritual: '🕉️' };
  const remedies: Record<string, string[]> = {
    career: ['Chant Surya mantra on Sundays', 'Wear Ruby or Sunstone', 'Donate wheat on Sundays'],
    love: ['Chant Venus mantra on Fridays', 'Wear Diamond or White Sapphire', 'Offer white flowers to Goddess Lakshmi'],
    health: ['Practice Surya Namaskar daily', 'Chant Mahamrityunjaya mantra', 'Wear Emerald for Mercury strength'],
    wealth: ['Chant Lakshmi mantra on Fridays', 'Wear Yellow Sapphire for Jupiter', 'Donate yellow items on Thursdays'],
    spiritual: ['Practice daily meditation', 'Chant Gayatri mantra at sunrise', 'Study Bhagavad Gita'],
  };

  return {
    category: area.charAt(0).toUpperCase() + area.slice(1),
    title: `${area.charAt(0).toUpperCase() + area.slice(1)} Forecast`,
    prediction: template.text,
    confidence: score,
    timeframe: template.timeframe,
    supportingFactors: template.factors,
    remedies: remedies[area] ?? [],
    icon: icons[area] ?? '⭐',
  };
}

function generatePersonalityProfile(planets: PlanetData[]): string {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  const asc = planets.find(p => p.name === 'Ascendant');
  const rashiNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const sunSign = sun ? rashiNames[sun.rashiIndex] : 'unknown';
  const moonSign = moon ? rashiNames[moon.rashiIndex] : 'unknown';
  return `Your Sun in ${sunSign} gives you a ${getSunTrait(sun?.rashiIndex ?? 0)} core identity. Your Moon in ${moonSign} reflects ${getMoonTrait(moon?.rashiIndex ?? 0)} emotional patterns. This combination creates a personality that is both ${getComboTrait(sun?.rashiIndex ?? 0, moon?.rashiIndex ?? 0)}.`;
}

function getSunTrait(i: number): string {
  const t = ['pioneering','steadfast','versatile','nurturing','confident','analytical','diplomatic','intense','philosophical','disciplined','innovative','compassionate'];
  return t[i] ?? 'unique';
}

function getMoonTrait(i: number): string {
  const t = ['impulsive and action-oriented','comfort-seeking and sensual','intellectually curious','deeply emotional','dramatic and expressive','detail-focused','relationship-oriented','deeply private','freedom-loving','controlled and reserved','detached and objective','boundlessly empathetic'];
  return t[i] ?? 'complex';
}

function getComboTrait(sunI: number, moonI: number): string {
  const diff = Math.abs(sunI - moonI);
  if (diff === 0) return 'focused and single-minded in purpose';
  if (diff <= 2) return 'harmonious and internally consistent';
  if (diff <= 5) return 'dynamic and multi-faceted';
  return 'complex and full of interesting contradictions';
}

export function generateAIReport(planets: PlanetData[], ascendantRashi: number): AIReport {
  const areas = ['career', 'love', 'health', 'wealth', 'spiritual'] as const;
  const scores = Object.fromEntries(areas.map(a => [a, calculateAreaScore(planets, a)]));
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / areas.length);

  const predictions = areas.map(a => getPrediction(a, scores[a]));

  const insights: AIInsight[] = planets.slice(0, 5).map(p => ({
    type: p.house === 1 || p.house === 5 || p.house === 9 || p.house === 11 ? 'opportunity' : p.house === 6 || p.house === 8 || p.house === 12 ? 'challenge' : 'neutral',
    message: `${p.name} in House ${p.house} ${p.isRetrograde ? '(Retrograde)' : ''} influences your ${getHouseTheme(p.house)}`,
    planet: p.name,
    duration: 'Current period',
  }));

  const strongestAreas = areas.filter(a => scores[a] >= 70).map(a => a.charAt(0).toUpperCase() + a.slice(1));
  const challengeAreas = areas.filter(a => scores[a] < 55).map(a => a.charAt(0).toUpperCase() + a.slice(1));

  const keyPeriods = [
    { period: 'Next 3 months', theme: 'Foundation building', advice: 'Focus on establishing strong routines and completing pending tasks.' },
    { period: '3-6 months', theme: 'Growth phase', advice: 'Expand your horizons; new opportunities emerge in your strongest areas.' },
    { period: '6-12 months', theme: 'Harvest period', advice: 'Reap rewards of earlier efforts; major milestones are achievable.' },
  ];

  const rashiNames = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const lifeThemes = ['Leadership & Identity','Security & Values','Communication & Learning','Home & Family','Creativity & Self-expression','Service & Health','Relationships & Partnership','Transformation & Depth','Philosophy & Expansion','Career & Achievement','Community & Innovation','Spirituality & Transcendence'];

  return {
    overallScore,
    predictions,
    insights,
    personalityProfile: generatePersonalityProfile(planets),
    lifeTheme: lifeThemes[ascendantRashi] ?? 'Personal Growth',
    strongestAreas: strongestAreas.length > 0 ? strongestAreas : ['Personal Growth'],
    challengeAreas: challengeAreas.length > 0 ? challengeAreas : ['Patience'],
    keyPeriods,
    naturalLanguageSummary: `Your chart shows an overall life quality score of ${overallScore}/100. ${strongestAreas.length > 0 ? `Your strongest areas are ${strongestAreas.join(' and ')}.` : ''} ${challengeAreas.length > 0 ? `Areas requiring attention: ${challengeAreas.join(' and ')}.` : ''} The stars indicate a ${overallScore >= 70 ? 'highly favorable' : overallScore >= 50 ? 'moderately positive' : 'challenging but growth-oriented'} period ahead.`,
  };
}

function getHouseTheme(house: number): string {
  const themes = ['','self and personality','wealth and values','communication and siblings','home and mother','creativity and children','health and service','partnerships and marriage','transformation and occult','philosophy and higher learning','career and status','gains and social network','spirituality and losses'];
  return themes[house] ?? 'life areas';
}
