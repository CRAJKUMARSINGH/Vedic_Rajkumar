// Week 59: Horary Astrology Service (Prashna Kundali)
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
}

const QUESTION_KEYWORDS: Record<HoraryQuestion['category'], string[]> = {
  love: ['love','relationship','marriage','partner','romance','date','boyfriend','girlfriend','husband','wife'],
  career: ['job','career','promotion','business','work','interview','salary','profession'],
  health: ['health','illness','disease','recovery','surgery','medicine','doctor'],
  finance: ['money','investment','loan','profit','loss','wealth','financial','stock'],
  travel: ['travel','journey','trip','abroad','foreign','visa','move'],
  property: ['house','property','land','buy','sell','rent','real estate'],
  legal: ['court','legal','case','lawsuit','dispute','contract','agreement'],
  general: ['when','will','should','can','is','are','does'],
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

  // Determine significator house based on category
  const categoryHouses: Record<HoraryQuestion['category'], number> = {
    love: 7, career: 10, health: 6, finance: 2, travel: 9, property: 4, legal: 7, general: 1,
  };
  const significatorHouse = categoryHouses[category];

  // Calculate if favorable
  const moonHouse = ((hour + 3) % 12) + 1;
  const isFavorable = FAVORABLE_HOUSES.includes(moonHouse) && !UNFAVORABLE_HOUSES.includes(ascIndex + 1);
  const isVeryFavorable = moonHouse === significatorHouse || moonHouse === 1 || moonHouse === 11;

  let answer: HoraryAnswer['answer'];
  let confidence: number;

  if (isVeryFavorable) { answer = 'Yes'; confidence = 75 + Math.floor(Math.random() * 15); }
  else if (isFavorable) { answer = 'Maybe'; confidence = 55 + Math.floor(Math.random() * 15); }
  else if (UNFAVORABLE_HOUSES.includes(moonHouse)) { answer = 'No'; confidence = 65 + Math.floor(Math.random() * 10); }
  else { answer = 'Timing needed'; confidence = 50 + Math.floor(Math.random() * 20); }

  const explanations: Record<HoraryQuestion['category'], string> = {
    love: `The 7th house (partnerships) ruler ${HOUSE_RULERS[6]} ${isFavorable ? 'supports' : 'challenges'} this query. Moon's position in house ${moonHouse} ${isFavorable ? 'indicates positive energy' : 'suggests delays or obstacles'} in relationship matters.`,
    career: `The 10th house (career) ruler ${HOUSE_RULERS[9]} ${isFavorable ? 'favors' : 'restricts'} professional advancement. Current planetary hour supports ${isFavorable ? 'action and initiative' : 'patience and preparation'}.`,
    health: `The 6th house (health) ruler ${HOUSE_RULERS[5]} ${isFavorable ? 'indicates recovery and vitality' : 'suggests need for medical attention'}. Moon's placement suggests ${isFavorable ? 'improving conditions' : 'continued vigilance'}.`,
    finance: `The 2nd house (wealth) ruler ${HOUSE_RULERS[1]} ${isFavorable ? 'supports financial gains' : 'warns against financial risks'}. Current planetary configuration ${isFavorable ? 'favors investments' : 'advises caution'}.`,
    travel: `The 9th house (long journeys) ruler ${HOUSE_RULERS[8]} ${isFavorable ? 'blesses travel plans' : 'indicates travel delays or complications'}. ${isFavorable ? 'Auspicious time to proceed' : 'Consider postponing if possible'}.`,
    property: `The 4th house (property) ruler ${HOUSE_RULERS[3]} ${isFavorable ? 'supports property transactions' : 'suggests delays in property matters'}. ${isFavorable ? 'Good time for real estate decisions' : 'Wait for better planetary alignment'}.`,
    legal: `The 7th house (contracts/disputes) ruler ${HOUSE_RULERS[6]} ${isFavorable ? 'favors legal proceedings' : 'suggests compromise over litigation'}. ${isFavorable ? 'Proceed with confidence' : 'Seek mediation if possible'}.`,
    general: `The Ascendant ruler ${HOUSE_RULERS[ascIndex]} ${isFavorable ? 'supports your query' : 'indicates challenges'}. Moon in house ${moonHouse} ${isFavorable ? 'brings positive energy' : 'requires patience'}.`,
  };

  const timings: Record<string, string> = {
    Yes: 'Within 3-6 months based on current planetary positions',
    No: 'Not favorable in the near term; revisit after 6-12 months',
    Maybe: 'Possible within 6-9 months with effort and right timing',
    'Timing needed': 'Consult a detailed Dasha analysis for precise timing',
  };

  const advices: Record<HoraryQuestion['category'], string> = {
    love: isFavorable ? 'Express your feelings openly; the time is right for romantic advances.' : 'Focus on self-improvement; love will come when you are ready.',
    career: isFavorable ? 'Apply for that position or start that business; stars support your ambition.' : 'Strengthen your skills and network; better opportunities are coming.',
    health: isFavorable ? 'Follow medical advice; recovery is supported by planetary energies.' : 'Seek a second medical opinion; take preventive measures seriously.',
    finance: isFavorable ? 'Moderate investments in stable assets are favored now.' : 'Avoid speculation; focus on saving and debt reduction.',
    travel: isFavorable ? 'Proceed with travel plans; the journey will be beneficial.' : 'Delay travel if possible; if unavoidable, take extra precautions.',
    property: isFavorable ? 'Good time to finalize property deals; negotiate confidently.' : 'Delay major property decisions; hidden issues may surface.',
    legal: isFavorable ? 'Proceed with legal action; justice is on your side.' : 'Seek out-of-court settlement; prolonged litigation is unfavorable.',
    general: isFavorable ? 'Proceed with your plans; the cosmic energy supports your intentions.' : 'Exercise patience; timing is crucial for success.',
  };

  return {
    question,
    answer,
    confidence,
    explanation: explanations[category],
    timing: timings[answer],
    advice: advices[category],
    significators: [HOUSE_RULERS[significatorHouse - 1], HOUSE_RULERS[ascIndex], 'Moon'],
    planetarySupport: isFavorable ? 'Favorable planetary configuration' : 'Challenging planetary configuration',
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
