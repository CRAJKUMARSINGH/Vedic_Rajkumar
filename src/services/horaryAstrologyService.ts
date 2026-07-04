// Week 59: Horary Astrology Service (Prashna Kundali)
// Enhanced based on B.V. Raman's 'Prasna Tantra' and 'Prasna Marga'
// Answer specific questions based on the time the question is asked

export interface HoraryQuestion {
  category: 'love' | 'career' | 'health' | 'finance' | 'travel' | 'property' | 'legal' | 'general';
  question: string;
}

export interface HoraryAnswer {
  question: string;
  answer: 'Yes' | 'No' | 'Maybe' | 'Timing needed';
  confidence: number;
  explanation: string;
  timing: string;
  advice: string;
  significators: string[];
  planetarySupport: string;
  yoga?: string; // Tajika Yogas like Ithasala, Eshrapha
}

const QUESTION_KEYWORDS: Record<HoraryQuestion['category'], string[]> = {
  love: ['love','relationship','marriage','partner','romance','date','boyfriend','girlfriend','husband','wife','shadi'],
  career: ['job','career','promotion','business','work','interview','salary','profession','naukri','vyapar'],
  health: ['health','illness','disease','recovery','surgery','medicine','doctor','bimari','swasthya'],
  finance: ['money','investment','loan','profit','loss','wealth','financial','stock','paisa','dhan'],
  travel: ['travel','journey','trip','abroad','foreign','visa','move','yatra'],
  property: ['house','property','land','buy','sell','rent','real estate','makan','jamin'],
  legal: ['court','legal','case','lawsuit','dispute','contract','agreement','adalat'],
  general: ['when','will','should','can','is','are','does','kya','kab'],
};

function detectCategory(question: string): HoraryQuestion['category'] {
  const q = question.toLowerCase();
  for (const [cat, keywords] of Object.entries(QUESTION_KEYWORDS)) {
    if (keywords.some(k => q.includes(k))) return cat as HoraryQuestion['category'];
  }
  return 'general';
}

function getAscendantFromTime(hour: number, minute: number, dayOfYear: number): number {
  // Simplified: ascendant changes ~2 hours per sign
  const totalMinutes = hour * 60 + minute + dayOfYear * 4;
  return Math.floor((totalMinutes / 120) % 12);
}

const HOUSE_RULERS = [
  'Mars/Ketu','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars/Ketu','Jupiter','Saturn','Saturn/Rahu','Jupiter'
];

const FAVORABLE_HOUSES = [1, 3, 5, 7, 9, 11];
const UNFAVORABLE_HOUSES = [6, 8, 12];

export function answerHoraryQuestion(question: string, askedAt?: Date): HoraryAnswer {
  const now = askedAt ?? new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);

  const ascIndex = getAscendantFromTime(hour, minute, dayOfYear);
  const category = detectCategory(question);

  // Determine significator house based on category (Prasna Tantra)
  const categoryHouses: Record<HoraryQuestion['category'], number> = {
    love: 7, career: 10, health: 6, finance: 2, travel: 9, property: 4, legal: 7, general: 1,
  };
  const significatorHouse = categoryHouses[category];

  // Calculate if favorable (Simulating Tajika Yogas)
  const moonHouse = ((hour + minute/60 + 3) % 12) + 1;
  const lagnaLord = HOUSE_RULERS[ascIndex];
  const karyaLord = HOUSE_RULERS[significatorHouse - 1];
  
  // Ithasala: Connection between Lagna Lord and Karya Lord
  const isIthasala = (moonHouse === significatorHouse || moonHouse === 1 || moonHouse === 11) && !UNFAVORABLE_HOUSES.includes(ascIndex + 1);
  const isEshrapha = UNFAVORABLE_HOUSES.includes(moonHouse); // Separating aspect

  let answer: HoraryAnswer['answer'];
  let confidence: number;
  let yoga = "None";

  if (isIthasala) { 
    answer = 'Yes'; 
    confidence = 85 + Math.floor(Math.random() * 10); 
    yoga = "Ithasala (Favorable Connection)";
  } else if (isEshrapha) { 
    answer = 'No'; 
    confidence = 75 + Math.floor(Math.random() * 15); 
    yoga = "Eshrapha (Separating/Unfavorable)";
  } else if (FAVORABLE_HOUSES.includes(moonHouse)) { 
    answer = 'Maybe'; 
    confidence = 50 + Math.floor(Math.random() * 20); 
    yoga = "Neutral Interaction";
  } else { 
    answer = 'Timing needed'; 
    confidence = 40 + Math.floor(Math.random() * 30); 
    yoga = "Indeterminate";
  }

  const explanations: Record<HoraryQuestion['category'], string> = {
    love: `As per Prasna Tantra, the relationship between Lagna lord ${lagnaLord} and 7th lord ${karyaLord} is ${isIthasala ? 'highly favorable' : 'currently weak'}. Moon in house ${moonHouse} suggests ${isIthasala ? 'emotional fulfillment' : 'unresolved feelings'}.`,
    career: `Success in career (10th house) depends on ${karyaLord}. Current planetary hour supports ${isIthasala ? 'professional recognition' : 'steady labor'}. ${isIthasala ? 'A promotion or new role is likely.' : 'Focus on current responsibilities.'}`,
    health: `Health matters involve the 6th house. Ruler ${karyaLord} ${isIthasala ? 'indicates speedy recovery' : 'suggests need for caution'}. Following BV Raman's principles, Moon in a watery sign might suggest phlegmatic issues.`,
    finance: `Financial gains (2nd house) ruler ${karyaLord} ${isIthasala ? 'promises wealth' : 'warns of losses'}. Current planetary configuration ${isIthasala ? 'favors speculative gains' : 'advises financial discipline'}.`,
    travel: `Long journeys (9th house) ruler ${karyaLord} ${isIthasala ? 'will be safe and successful' : 'might face delays'}. Prasna Marga suggests avoiding travel if Moon is in the 8th house.`,
    property: `Property acquisition (4th house) is governed by ${karyaLord}. ${isIthasala ? 'Favorable time for purchase.' : 'Check documentation carefully.'}`,
    legal: `Disputes (7th/6th house) ruler ${karyaLord} ${isIthasala ? 'favors your victory' : 'suggests compromise'}. Prasna principles advise patience in legal battles now.`,
    general: `The query is influenced by ${lagnaLord}. Moon in ${moonHouse} provides ${isIthasala ? 'positive cosmic impulse' : 'karmic feedback'}.`,
  };

  const timings: Record<string, string> = {
    Yes: 'Within 1-3 months, as the Ithasala yoga matures.',
    No: 'Not indicated in current cycle; check again after 6 months.',
    Maybe: 'Depends on your initiative; favorable window in 4-5 months.',
    'Timing needed': 'The answer is tied to your upcoming Mahadasha transition.',
  };

  const advices: Record<HoraryQuestion['category'], string> = {
    love: isIthasala ? 'Communicate your heart. The stars are aligned for union.' : 'Practice patience and self-love. Avoid impulsive decisions.',
    career: isIthasala ? 'Seize the upcoming opportunity. Leadership calls you.' : 'Refine your skills. Preparation is the key to future success.',
    health: isIthasala ? 'Follow your regimen. Health is returning.' : 'Prioritize rest and medical advice. Do not ignore symptoms.',
    finance: isIthasala ? 'A good time for strategic investments.' : 'Avoid major expenditures. Save for the upcoming cycle.',
    travel: isIthasala ? 'Proceed with your plans. Journey will be auspicious.' : 'Postpone if possible. If traveling, be extra vigilant.',
    property: isIthasala ? 'Documentation and deals look solid. Finalize now.' : 'Wait for a clearer planetary alignment. Inspect property again.',
    legal: isIthasala ? 'Evidence supports you. Proceed with confidence.' : 'Seek out-of-court settlement. Avoid prolonged conflicts.',
    general: isIthasala ? 'The universe supports your intention. Take the leap.' : 'Meditate and wait. Clarity will emerge in time.',
  };

  return {
    question,
    answer,
    confidence,
    explanation: explanations[category],
    timing: timings[answer],
    advice: advices[category],
    significators: [lagnaLord, karyaLord, 'Moon'],
    planetarySupport: isIthasala ? 'Strong Tajika Yoga support' : 'Obstructed planetary influence',
    yoga,
  };
}

export function getHoraryCategories(): Array<{ value: HoraryQuestion['category']; label: string; icon: string }> {
  return [
    { value: 'love', label: 'Love & Relationships', icon: '❤️' },
    { value: 'career', label: 'Career & Business', icon: '💼' },
    { value: 'health', label: 'Health & Recovery', icon: '🌿' },
    { value: 'finance', label: 'Finance & Investment', icon: '💰' },
    { value: 'travel', label: 'Travel & Journey', icon: '✈️' },
    { value: 'property', label: 'Property & Real Estate', icon: '🏠' },
    { value: 'legal', label: 'Legal & Contracts', icon: '⚖️' },
    { value: 'general', label: 'General Question', icon: '🔮' },
  ];
}
