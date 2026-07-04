// Week 60: Electional Astrology Service
// Finds auspicious dates/times for specific life events

export interface ElectionalEvent {
  type: string; icon: string;
  rules: { planet: string; house: number; condition: string }[];
  avoidPlanets: string[];
  bestDays: string[]; bestNakshatras: string[];
  description: string;
}

export interface ElectionalResult {
  eventType: string;
  date: string;
  score: number; // 0-100
  quality: 'Excellent' | 'Good' | 'Average' | 'Avoid';
  factors: { factor: string; positive: boolean; weight: number }[];
  recommendation: string;
  bestTime: string;
  avoidTime: string;
}

const EVENTS: Record<string, ElectionalEvent> = {
  marriage: {
    type: 'Marriage', icon: '💑',
    rules: [
      { planet: 'Venus', house: 7, condition: 'strong' },
      { planet: 'Jupiter', house: 1, condition: 'present' },
    ],
    avoidPlanets: ['Saturn', 'Mars', 'Rahu'],
    bestDays: ['Monday', 'Wednesday', 'Friday', 'Thursday'],
    bestNakshatras: ['Rohini', 'Mrigashira', 'Magha', 'Uttara Phalguni', 'Hasta', 'Swati', 'Anuradha', 'Mula', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati'],
    description: 'Marriage muhurat requires strong Venus, Jupiter in Lagna, and auspicious nakshatra.',
  },
  business: {
    type: 'Business Start', icon: '🏢',
    rules: [
      { planet: 'Mercury', house: 1, condition: 'strong' },
      { planet: 'Jupiter', house: 11, condition: 'present' },
    ],
    avoidPlanets: ['Saturn', 'Rahu', 'Ketu'],
    bestDays: ['Wednesday', 'Thursday', 'Friday'],
    bestNakshatras: ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Shravana', 'Dhanishtha', 'Revati'],
    description: 'Business start needs strong Mercury, Jupiter in 11th, and auspicious weekday.',
  },
  travel: {
    type: 'Travel', icon: '✈️',
    rules: [
      { planet: 'Mercury', house: 3, condition: 'strong' },
      { planet: 'Moon', house: 1, condition: 'waxing' },
    ],
    avoidPlanets: ['Saturn', 'Rahu'],
    bestDays: ['Wednesday', 'Thursday', 'Friday', 'Monday'],
    bestNakshatras: ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Shravana', 'Revati'],
    description: 'Travel muhurat needs strong 3rd house, waxing Moon, and Mercury well-placed.',
  },
  property: {
    type: 'Property Purchase', icon: '🏠',
    rules: [
      { planet: 'Mars', house: 4, condition: 'strong' },
      { planet: 'Moon', house: 4, condition: 'present' },
    ],
    avoidPlanets: ['Saturn', 'Rahu', 'Ketu'],
    bestDays: ['Monday', 'Wednesday', 'Thursday'],
    bestNakshatras: ['Rohini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada', 'Revati', 'Anuradha'],
    description: 'Property purchase needs strong 4th house, Mars well-placed, and fixed nakshatra.',
  },
  education: {
    type: 'Education Start', icon: '📚',
    rules: [
      { planet: 'Mercury', house: 5, condition: 'strong' },
      { planet: 'Jupiter', house: 5, condition: 'present' },
    ],
    avoidPlanets: ['Saturn', 'Rahu'],
    bestDays: ['Wednesday', 'Thursday', 'Sunday'],
    bestNakshatras: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Shravana', 'Revati'],
    description: 'Education start needs strong 5th house, Jupiter/Mercury well-placed.',
  },
  surgery: {
    type: 'Surgery', icon: '🏥',
    rules: [
      { planet: 'Mars', house: 6, condition: 'strong' },
      { planet: 'Moon', house: 1, condition: 'waxing' },
    ],
    avoidPlanets: ['Saturn', 'Rahu', 'Ketu'],
    bestDays: ['Tuesday', 'Saturday'],
    bestNakshatras: ['Ashwini', 'Mrigashira', 'Hasta', 'Chitra', 'Anuradha', 'Jyeshtha'],
    description: 'Surgery timing needs Mars strong, avoid full/new moon, waxing Moon preferred.',
  },
  vehicle: {
    type: 'Vehicle Purchase', icon: '🚗',
    rules: [
      { planet: 'Venus', house: 4, condition: 'strong' },
      { planet: 'Moon', house: 1, condition: 'waxing' },
    ],
    avoidPlanets: ['Saturn', 'Rahu', 'Mars'],
    bestDays: ['Wednesday', 'Friday', 'Thursday'],
    bestNakshatras: ['Rohini', 'Hasta', 'Chitra', 'Swati', 'Shravana', 'Dhanishtha', 'Revati'],
    description: 'Vehicle purchase needs Venus strong, waxing Moon, and auspicious nakshatra.',
  },
  naming: {
    type: 'Naming Ceremony', icon: '👶',
    rules: [
      { planet: 'Moon', house: 1, condition: 'strong' },
      { planet: 'Jupiter', house: 1, condition: 'present' },
    ],
    avoidPlanets: ['Saturn', 'Rahu', 'Ketu'],
    bestDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    bestNakshatras: ['Ashwini', 'Rohini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Shravana', 'Revati'],
    description: 'Naming ceremony needs strong Moon, Jupiter blessing, and auspicious nakshatra.',
  },
};

const WEEKDAY_SCORES: Record<string, number> = {
  Sunday: 60, Monday: 80, Tuesday: 50, Wednesday: 85,
  Thursday: 90, Friday: 85, Saturday: 40,
};

const NAKSHATRA_QUALITY: Record<string, number> = {
  Ashwini: 85, Bharani: 40, Krittika: 60, Rohini: 95, Mrigashira: 80,
  Ardra: 30, Punarvasu: 85, Pushya: 95, Ashlesha: 35, Magha: 75,
  'Uttara Phalguni': 90, 'Purva Phalguni': 55, Hasta: 90, Chitra: 80,
  Swati: 85, Vishakha: 70, Anuradha: 85, Jyeshtha: 60, Mula: 50,
  'Purva Ashadha': 65, 'Uttara Ashadha': 90, Shravana: 85, Dhanishtha: 80,
  Shatabhisha: 55, 'Purva Bhadrapada': 45, 'Uttara Bhadrapada': 90, Revati: 95,
};

export function getElectionalEvents(): ElectionalEvent[] {
  return Object.values(EVENTS);
}

export function getEventTypes(): { key: string; label: string; icon: string }[] {
  return Object.entries(EVENTS).map(([key, e]) => ({ key, label: e.type, icon: e.icon }));
}

export function analyzeElectionalDate(
  eventType: string,
  date: string,
  nakshatra?: string
): ElectionalResult {
  const event = EVENTS[eventType] || EVENTS.marriage;
  const d = new Date(date);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const dayScore = WEEKDAY_SCORES[weekday] ?? 60;
  const nakshatraScore = nakshatra ? (NAKSHATRA_QUALITY[nakshatra] ?? 60) : 70;
  const isBestDay = event.bestDays.includes(weekday);
  const isBestNakshatra = nakshatra ? event.bestNakshatras.includes(nakshatra) : false;

  // Tithi scoring (simplified)
  const dayOfMonth = d.getDate();
  const tithiScore = [2,3,5,7,10,11,12,13].includes(dayOfMonth % 15) ? 85 :
                     [4,6,8,9].includes(dayOfMonth % 15) ? 65 : 50;

  const factors: ElectionalResult['factors'] = [
    { factor: `Weekday: ${weekday}`, positive: isBestDay, weight: 25 },
    { factor: nakshatra ? `Nakshatra: ${nakshatra}` : 'Nakshatra: Not specified', positive: isBestNakshatra, weight: 30 },
    { factor: `Tithi quality`, positive: tithiScore > 70, weight: 20 },
    { factor: `Planetary alignment`, positive: dayScore > 70, weight: 25 },
  ];

  const score = Math.round(
    (dayScore * 0.25) + (nakshatraScore * 0.30) + (tithiScore * 0.20) + (dayScore * 0.25)
  );

  const quality: ElectionalResult['quality'] =
    score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 50 ? 'Average' : 'Avoid';

  const bestHours: Record<string, string> = {
    Sunday: '6:00-8:00 AM', Monday: '7:00-9:00 AM', Tuesday: '8:00-10:00 AM',
    Wednesday: '6:00-8:00 AM', Thursday: '7:00-9:00 AM', Friday: '6:00-8:00 AM', Saturday: '9:00-11:00 AM',
  };

  return {
    eventType: event.type,
    date,
    score,
    quality,
    factors,
    recommendation: quality === 'Excellent'
      ? `${date} is highly auspicious for ${event.type}. Proceed with confidence.`
      : quality === 'Good'
      ? `${date} is a good date for ${event.type}. Minor precautions advised.`
      : quality === 'Average'
      ? `${date} is average for ${event.type}. Consider alternative dates.`
      : `${date} is not recommended for ${event.type}. Please choose another date.`,
    bestTime: bestHours[weekday] || '6:00-8:00 AM',
    avoidTime: 'Rahu Kaal & Yamaganda periods',
  };
}

export function findBestDates(
  eventType: string,
  startDate: string,
  days = 30
): ElectionalResult[] {
  const results: ElectionalResult[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const result = analyzeElectionalDate(eventType, dateStr);
    if (result.quality === 'Excellent' || result.quality === 'Good') {
      results.push(result);
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}
