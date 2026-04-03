// Week 41-42: Comprehensive Numerology Service
// Life Path, Expression, Soul Urge, Personality, Destiny numbers

export interface NumerologyProfile {
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
  maturityNumber: number;
  currentYearNumber: number;
  currentMonthNumber: number;
  lifePathDescription: string;
  expressionDescription: string;
  soulUrgeDescription: string;
  personalityDescription: string;
  strengths: string[];
  challenges: string[];
  luckyNumbers: number[];
  luckyDays: string[];
  luckyColors: string[];
  careerSuggestions: string[];
  compatibleNumbers: number[];
  pinnacles: Array<{ period: string; number: number; theme: string }>;
  challenges_periods: Array<{ period: string; number: number; lesson: string }>;
}

const LETTER_VALUES: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
};

const VOWELS = new Set(['A','E','I','O','U']);

function reduceNumber(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n; // Master numbers
  while (n > 9) {
    n = n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    if (n === 11 || n === 22 || n === 33) return n;
  }
  return n;
}

function nameToNumber(name: string): number {
  const total = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((sum, c) => sum + (LETTER_VALUES[c] ?? 0), 0);
  return reduceNumber(total);
}

function vowelNumber(name: string): number {
  const total = name.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(c => VOWELS.has(c)).reduce((sum, c) => sum + (LETTER_VALUES[c] ?? 0), 0);
  return reduceNumber(total);
}

function consonantNumber(name: string): number {
  const total = name.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(c => !VOWELS.has(c)).reduce((sum, c) => sum + (LETTER_VALUES[c] ?? 0), 0);
  return reduceNumber(total);
}

function dateToLifePath(date: string): number {
  const total = date.replace(/-/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
  return reduceNumber(total);
}

const NUMBER_DESCRIPTIONS: Record<number, { life: string; expression: string; soul: string; personality: string; strengths: string[]; challenges: string[]; lucky: number[]; days: string[]; colors: string[]; career: string[]; compatible: number[] }> = {
  1: {
    life: 'The Leader. You are here to develop independence, originality, and leadership. Your path involves pioneering new ideas and standing on your own.',
    expression: 'Natural leader with strong executive abilities. You excel at initiating projects and inspiring others.',
    soul: 'Deep desire for independence and achievement. You want to be first and best in everything you do.',
    personality: 'You appear confident, assertive, and self-reliant. Others see you as a natural authority figure.',
    strengths: ['Leadership','Independence','Originality','Courage','Determination'],
    challenges: ['Stubbornness','Selfishness','Impatience','Domineering tendencies'],
    lucky: [1,10,19,28],
    days: ['Sunday','Monday'],
    colors: ['Red','Orange','Gold'],
    career: ['CEO','Entrepreneur','Military Officer','Politician','Inventor'],
    compatible: [1,3,5,9],
  },
  2: {
    life: 'The Diplomat. You are here to develop cooperation, sensitivity, and partnership. Your path involves bringing harmony and balance to relationships.',
    expression: 'Natural mediator with exceptional diplomatic skills. You excel at bringing people together.',
    soul: 'Deep desire for peace, harmony, and loving relationships. You want to be needed and appreciated.',
    personality: 'You appear gentle, cooperative, and supportive. Others see you as a peacemaker.',
    strengths: ['Diplomacy','Sensitivity','Cooperation','Patience','Intuition'],
    challenges: ['Over-sensitivity','Indecisiveness','Dependency','Timidity'],
    lucky: [2,11,20,29],
    days: ['Monday','Friday'],
    colors: ['Orange','Cream','White'],
    career: ['Counselor','Diplomat','Nurse','Teacher','Musician'],
    compatible: [2,4,6,8],
  },
  3: {
    life: 'The Communicator. You are here to develop self-expression, creativity, and joy. Your path involves inspiring others through art, words, and enthusiasm.',
    expression: 'Creative communicator with natural artistic talents. You excel at expressing ideas in engaging ways.',
    soul: 'Deep desire for self-expression and creative fulfillment. You want to inspire and entertain.',
    personality: 'You appear charming, witty, and enthusiastic. Others see you as the life of the party.',
    strengths: ['Creativity','Communication','Optimism','Humor','Inspiration'],
    challenges: ['Scattered energy','Superficiality','Moodiness','Extravagance'],
    lucky: [3,12,21,30],
    days: ['Wednesday','Thursday'],
    colors: ['Yellow','Gold','Orange'],
    career: ['Writer','Actor','Artist','Teacher','Comedian'],
    compatible: [1,3,5,9],
  },
  4: {
    life: 'The Builder. You are here to develop discipline, hard work, and practical achievement. Your path involves building solid foundations.',
    expression: 'Practical organizer with exceptional attention to detail. You excel at systematic work.',
    soul: 'Deep desire for security, order, and practical achievement. You want stability and reliability.',
    personality: 'You appear dependable, serious, and hardworking. Others see you as trustworthy.',
    strengths: ['Discipline','Reliability','Practicality','Loyalty','Determination'],
    challenges: ['Rigidity','Stubbornness','Limitation','Resistance to change'],
    lucky: [4,13,22,31],
    days: ['Saturday','Sunday'],
    colors: ['Blue','Grey','Green'],
    career: ['Engineer','Accountant','Manager','Architect','Farmer'],
    compatible: [2,4,6,8],
  },
  5: {
    life: 'The Freedom Seeker. You are here to develop freedom, versatility, and progressive thinking. Your path involves experiencing life fully.',
    expression: 'Versatile communicator with natural sales and promotional abilities. You excel at adapting.',
    soul: 'Deep desire for freedom, adventure, and variety. You want to experience everything life offers.',
    personality: 'You appear adventurous, dynamic, and magnetic. Others see you as exciting and unpredictable.',
    strengths: ['Adaptability','Freedom','Versatility','Curiosity','Enthusiasm'],
    challenges: ['Restlessness','Irresponsibility','Overindulgence','Inconsistency'],
    lucky: [5,14,23],
    days: ['Wednesday','Friday'],
    colors: ['Turquoise','Aqua','Silver'],
    career: ['Journalist','Travel Agent','Sales','Entertainer','Pilot'],
    compatible: [1,3,5,7],
  },
  6: {
    life: 'The Nurturer. You are here to develop responsibility, love, and service. Your path involves caring for family and community.',
    expression: 'Natural caregiver with strong sense of responsibility. You excel at healing and teaching.',
    soul: 'Deep desire to love and be loved. You want to create harmony and beauty in your environment.',
    personality: 'You appear warm, caring, and responsible. Others see you as a reliable support system.',
    strengths: ['Responsibility','Compassion','Creativity','Harmony','Healing'],
    challenges: ['Perfectionism','Martyrdom','Interference','Worry'],
    lucky: [6,15,24],
    days: ['Friday','Monday'],
    colors: ['Blue','Indigo','Pink'],
    career: ['Doctor','Teacher','Counselor','Artist','Social Worker'],
    compatible: [2,4,6,9],
  },
  7: {
    life: 'The Seeker. You are here to develop wisdom, analysis, and spiritual understanding. Your path involves deep investigation of life\'s mysteries.',
    expression: 'Deep thinker with exceptional analytical and research abilities. You excel at uncovering hidden truths.',
    soul: 'Deep desire for knowledge, wisdom, and spiritual understanding. You want to understand the deeper meaning of life.',
    personality: 'You appear mysterious, intellectual, and reserved. Others see you as wise and introspective.',
    strengths: ['Analysis','Wisdom','Intuition','Research','Spirituality'],
    challenges: ['Isolation','Skepticism','Aloofness','Perfectionism'],
    lucky: [7,16,25],
    days: ['Monday','Sunday'],
    colors: ['Purple','Violet','Grey'],
    career: ['Researcher','Philosopher','Scientist','Analyst','Spiritual Teacher'],
    compatible: [3,5,7],
  },
  8: {
    life: 'The Powerhouse. You are here to develop material mastery, authority, and abundance. Your path involves achieving success in the material world.',
    expression: 'Natural executive with exceptional business and organizational abilities. You excel at managing resources.',
    soul: 'Deep desire for material success, power, and recognition. You want to achieve great things.',
    personality: 'You appear powerful, confident, and authoritative. Others see you as a force to be reckoned with.',
    strengths: ['Ambition','Leadership','Business acumen','Determination','Efficiency'],
    challenges: ['Materialism','Workaholism','Domineering','Ruthlessness'],
    lucky: [8,17,26],
    days: ['Saturday','Sunday'],
    colors: ['Black','Dark Blue','Brown'],
    career: ['Business Executive','Banker','Lawyer','Politician','Real Estate'],
    compatible: [2,4,6,8],
  },
  9: {
    life: 'The Humanitarian. You are here to develop compassion, wisdom, and universal love. Your path involves serving humanity.',
    expression: 'Natural humanitarian with broad vision and compassionate nature. You excel at inspiring others.',
    soul: 'Deep desire to make the world a better place. You want to contribute to humanity\'s evolution.',
    personality: 'You appear wise, compassionate, and idealistic. Others see you as a visionary.',
    strengths: ['Compassion','Wisdom','Creativity','Generosity','Idealism'],
    challenges: ['Impracticality','Emotional volatility','Martyrdom','Resentment'],
    lucky: [9,18,27],
    days: ['Tuesday','Thursday'],
    colors: ['Gold','Red','Rose'],
    career: ['Humanitarian','Artist','Healer','Teacher','Philosopher'],
    compatible: [1,3,6,9],
  },
  11: {
    life: 'The Illuminator (Master Number). You are here to inspire and illuminate others. Your path involves spiritual leadership and intuitive wisdom.',
    expression: 'Visionary with exceptional intuitive and inspirational abilities. You excel at channeling higher wisdom.',
    soul: 'Deep desire to inspire and uplift humanity. You want to be a channel for divine wisdom.',
    personality: 'You appear charismatic, idealistic, and spiritually aware. Others see you as inspiring.',
    strengths: ['Intuition','Inspiration','Spiritual awareness','Charisma','Vision'],
    challenges: ['Nervous tension','Impracticality','Extremism','Sensitivity'],
    lucky: [11,2,20,29],
    days: ['Monday','Wednesday'],
    colors: ['Silver','White','Lavender'],
    career: ['Spiritual Teacher','Psychic','Inventor','Artist','Diplomat'],
    compatible: [2,4,6,11],
  },
  22: {
    life: 'The Master Builder (Master Number). You are here to build lasting structures that benefit humanity. Your path involves manifesting grand visions.',
    expression: 'Master organizer with ability to manifest large-scale visions. You excel at building systems.',
    soul: 'Deep desire to create something of lasting value for humanity. You want to leave a legacy.',
    personality: 'You appear powerful, visionary, and capable. Others see you as someone who can achieve the impossible.',
    strengths: ['Vision','Practicality','Leadership','Determination','Manifestation'],
    challenges: ['Overwhelm','Perfectionism','Rigidity','Pressure'],
    lucky: [22,4,13,31],
    days: ['Saturday','Sunday'],
    colors: ['Coral','Beige','Earth tones'],
    career: ['Architect','Engineer','Statesman','Business Leader','Visionary'],
    compatible: [4,6,8,22],
  },
};

export function calculateNumerologyProfile(fullName: string, birthDate: string): NumerologyProfile {
  const lifePathNumber = dateToLifePath(birthDate);
  const expressionNumber = nameToNumber(fullName);
  const soulUrgeNumber = vowelNumber(fullName);
  const personalityNumber = consonantNumber(fullName);
  const [y, m, d] = birthDate.split('-').map(Number);
  const birthdayNumber = reduceNumber(d);
  const maturityNumber = reduceNumber(lifePathNumber + expressionNumber);

  const currentYear = new Date().getFullYear();
  const currentYearNumber = reduceNumber(currentYear.toString().split('').reduce((a, b) => a + parseInt(b), 0) + lifePathNumber);
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthNumber = reduceNumber(currentYearNumber + currentMonth);

  const data = NUMBER_DESCRIPTIONS[lifePathNumber] ?? NUMBER_DESCRIPTIONS[1];

  // Pinnacles (4 major life periods)
  const firstPinnacle = reduceNumber((m) + d);
  const secondPinnacle = reduceNumber(d + y.toString().split('').reduce((a, b) => a + parseInt(b), 0));
  const thirdPinnacle = reduceNumber(firstPinnacle + secondPinnacle);
  const fourthPinnacle = reduceNumber((m) + y.toString().split('').reduce((a, b) => a + parseInt(b), 0));

  const age1 = 36 - lifePathNumber;
  const pinnacles = [
    { period: `Birth to age ${age1}`, number: firstPinnacle, theme: getPinnacleTheme(firstPinnacle) },
    { period: `Age ${age1} to ${age1 + 9}`, number: secondPinnacle, theme: getPinnacleTheme(secondPinnacle) },
    { period: `Age ${age1 + 9} to ${age1 + 18}`, number: thirdPinnacle, theme: getPinnacleTheme(thirdPinnacle) },
    { period: `Age ${age1 + 18}+`, number: fourthPinnacle, theme: getPinnacleTheme(fourthPinnacle) },
  ];

  const challenges_periods = [
    { period: `Birth to age ${age1}`, number: Math.abs(d - m) % 9 || 9, lesson: 'Learning independence and self-reliance' },
    { period: `Age ${age1} to ${age1 + 9}`, number: Math.abs(d - (y % 9)) % 9 || 9, lesson: 'Developing emotional balance' },
    { period: `Age ${age1 + 9}+`, number: Math.abs(m - (y % 9)) % 9 || 9, lesson: 'Achieving material and spiritual balance' },
  ];

  return {
    lifePathNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    birthdayNumber,
    maturityNumber,
    currentYearNumber,
    currentMonthNumber,
    lifePathDescription: data.life,
    expressionDescription: data.expression,
    soulUrgeDescription: data.soul,
    personalityDescription: data.personality,
    strengths: data.strengths,
    challenges: data.challenges,
    luckyNumbers: data.lucky,
    luckyDays: data.days,
    luckyColors: data.colors,
    careerSuggestions: data.career,
    compatibleNumbers: data.compatible,
    pinnacles,
    challenges_periods,
  };
}

function getPinnacleTheme(n: number): string {
  const themes: Record<number, string> = {
    1: 'Independence and new beginnings', 2: 'Cooperation and relationships', 3: 'Creativity and self-expression',
    4: 'Hard work and foundation building', 5: 'Freedom and change', 6: 'Family and responsibility',
    7: 'Spiritual growth and wisdom', 8: 'Material achievement', 9: 'Humanitarian service',
    11: 'Spiritual illumination', 22: 'Master building',
  };
  return themes[n] ?? 'Personal growth';
}
