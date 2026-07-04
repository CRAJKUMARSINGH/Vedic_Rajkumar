// Week 34-35: Chinese Astrology Service
// 12 Animal Signs, 5 Elements, Yin/Yang, BaZi basics

export interface ChineseSign {
  animal: string;
  animalChinese: string;
  element: string;
  yin_yang: 'Yin' | 'Yang';
  year: number;
  traits: string[];
  compatibility: string[];
  incompatibility: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  luckyFlowers: string;
  description: string;
  career: string;
  love: string;
  health: string;
}

export interface ChineseChart {
  yearSign: ChineseSign;
  monthSign: string;
  daySign: string;
  hourSign: string;
  element: string;
  polarity: 'Yin' | 'Yang';
  lifePathNumber: number;
  currentYearForecast: string;
  fiveElements: { wood: number; fire: number; earth: number; metal: number; water: number };
}

const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const ANIMALS_CHINESE = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const ELEMENTS_CYCLE = ['Wood','Fire','Earth','Metal','Water'];
const ELEMENT_COLORS: Record<string, string> = { Wood: 'Green', Fire: 'Red', Earth: 'Yellow', Metal: 'White', Water: 'Black' };

const SIGN_DATA: Record<string, Omit<ChineseSign, 'animal'|'animalChinese'|'element'|'yin_yang'|'year'>> = {
  Rat: {
    traits: ['Intelligent','Adaptable','Quick-witted','Charming','Artistic'],
    compatibility: ['Dragon','Monkey','Ox'],
    incompatibility: ['Horse','Goat','Rabbit'],
    luckyNumbers: [2,3],
    luckyColors: ['Blue','Gold','Green'],
    luckyFlowers: 'Lily, African Violet',
    description: 'Rats are quick-witted, resourceful, and versatile. They are charming and imaginative, with a strong sense of self-preservation.',
    career: 'Writer, Broadcaster, Politician, Lawyer, Researcher',
    love: 'Loyal and devoted partners who need intellectual stimulation',
    health: 'Watch for stress-related issues; maintain regular sleep patterns',
  },
  Ox: {
    traits: ['Diligent','Dependable','Strong','Determined','Honest'],
    compatibility: ['Rat','Snake','Rooster'],
    incompatibility: ['Tiger','Dragon','Horse','Goat'],
    luckyNumbers: [1,4],
    luckyColors: ['White','Yellow','Green'],
    luckyFlowers: 'Tulip, Evergreen',
    description: 'Oxen are hardworking, honest, and patient. They are reliable and methodical, with great endurance and determination.',
    career: 'Agriculture, Manufacturing, Pharmacy, Art, Real Estate',
    love: 'Steady and faithful; slow to open up but deeply committed',
    health: 'Prone to digestive issues; benefit from regular outdoor exercise',
  },
  Tiger: {
    traits: ['Brave','Confident','Competitive','Unpredictable','Charming'],
    compatibility: ['Dragon','Horse','Pig'],
    incompatibility: ['Ox','Tiger','Snake','Monkey'],
    luckyNumbers: [1,3,4],
    luckyColors: ['Blue','Grey','Orange'],
    luckyFlowers: 'Cineraria',
    description: 'Tigers are brave, competitive, and unpredictable. They are charming and well-liked, with a magnetic personality.',
    career: 'Advertising, Office Manager, Travel Agent, Actor, Writer',
    love: 'Passionate and intense; need freedom and excitement in relationships',
    health: 'High energy; prone to accidents; need adequate rest',
  },
  Rabbit: {
    traits: ['Quiet','Elegant','Kind','Responsible','Cautious'],
    compatibility: ['Goat','Pig','Dog'],
    incompatibility: ['Rat','Ox','Dragon','Rooster'],
    luckyNumbers: [3,4,6],
    luckyColors: ['Red','Pink','Purple','Blue'],
    luckyFlowers: 'Plantain Lily, Jasmine',
    description: 'Rabbits are gentle, quiet, and elegant. They are kind and responsible, with a talent for diplomacy and tact.',
    career: 'Lawyer, Diplomat, Actor, Teacher, Counselor',
    love: 'Romantic and sensitive; need security and emotional stability',
    health: 'Sensitive constitution; benefit from gentle exercise like yoga',
  },
  Dragon: {
    traits: ['Energetic','Fearless','Warm-hearted','Charismatic','Lucky'],
    compatibility: ['Rooster','Rat','Monkey'],
    incompatibility: ['Ox','Sheep','Dog'],
    luckyNumbers: [1,6,7],
    luckyColors: ['Gold','Silver','Grayish White'],
    luckyFlowers: 'Dragon Flower, Bleeding Heart Vine',
    description: 'Dragons are energetic, fearless, and charismatic. They are natural leaders with great ambition and confidence.',
    career: 'Politician, Inventor, Artist, Lawyer, Philosopher',
    love: 'Passionate and idealistic; need a partner who can match their energy',
    health: 'Generally robust; watch for stress and overexertion',
  },
  Snake: {
    traits: ['Enigmatic','Intuitive','Introspective','Refined','Cautious'],
    compatibility: ['Dragon','Rooster'],
    incompatibility: ['Tiger','Pig'],
    luckyNumbers: [2,8,9],
    luckyColors: ['Black','Red','Yellow'],
    luckyFlowers: 'Orchid, Cactus',
    description: 'Snakes are wise, intuitive, and elegant. They are deep thinkers with a mysterious charm and strong intuition.',
    career: 'Scientist, Analyst, Investigator, Painter, Potter',
    love: 'Possessive and jealous; deeply loyal once committed',
    health: 'Prone to stress; benefit from meditation and relaxation',
  },
  Horse: {
    traits: ['Animated','Active','Energetic','Impatient','Cheerful'],
    compatibility: ['Tiger','Goat','Dog'],
    incompatibility: ['Rat','Ox','Rabbit','Horse'],
    luckyNumbers: [2,3,7],
    luckyColors: ['Yellow','Green'],
    luckyFlowers: 'Calla Lily, Jasmine',
    description: 'Horses are energetic, animated, and active. They are cheerful and popular, with a love of freedom and adventure.',
    career: 'Journalist, Sales Representative, Translator, Bartender',
    love: 'Romantic and passionate; need freedom and independence',
    health: 'High energy; prone to overexertion; need regular exercise',
  },
  Goat: {
    traits: ['Calm','Gentle','Sympathetic','Creative','Persevering'],
    compatibility: ['Rabbit','Horse','Pig'],
    incompatibility: ['Ox','Tiger','Dog'],
    luckyNumbers: [2,7],
    luckyColors: ['Brown','Red','Purple'],
    luckyFlowers: 'Carnation, Primrose',
    description: 'Goats are gentle, calm, and creative. They are sympathetic and artistic, with a love of beauty and nature.',
    career: 'Arts, Crafts, Music, Gardening, Weaving',
    love: 'Romantic and sensitive; need emotional security and support',
    health: 'Sensitive to cold; benefit from warm environments and gentle exercise',
  },
  Monkey: {
    traits: ['Sharp','Smart','Curious','Mischievous','Versatile'],
    compatibility: ['Ox','Rabbit'],
    incompatibility: ['Tiger','Pig'],
    luckyNumbers: [1,7,8],
    luckyColors: ['White','Blue','Gold'],
    luckyFlowers: 'Chrysanthemum',
    description: 'Monkeys are clever, curious, and mischievous. They are versatile and innovative, with a great sense of humor.',
    career: 'Accountant, Banking, Science, Engineering, Stock Market',
    love: 'Playful and witty; need intellectual stimulation in relationships',
    health: 'Generally healthy; prone to throat and respiratory issues',
  },
  Rooster: {
    traits: ['Observant','Hardworking','Courageous','Talented','Confident'],
    compatibility: ['Ox','Snake'],
    incompatibility: ['Rat','Rabbit','Horse','Rooster'],
    luckyNumbers: [5,7,8],
    luckyColors: ['Gold','Brown','Yellow'],
    luckyFlowers: 'Gladiola, Cockscomb',
    description: 'Roosters are observant, hardworking, and courageous. They are confident and talented, with a flair for the dramatic.',
    career: 'Newsreader, Sales Person, Restaurant Owner, Hairdresser',
    love: 'Loyal and devoted; can be critical; need admiration',
    health: 'Prone to liver and digestive issues; benefit from regular meals',
  },
  Dog: {
    traits: ['Loyal','Honest','Amiable','Kind','Cautious'],
    compatibility: ['Rabbit','Tiger','Horse'],
    incompatibility: ['Dragon','Goat','Rooster'],
    luckyNumbers: [3,4,9],
    luckyColors: ['Green','Red','Purple'],
    luckyFlowers: 'Rose, Oncidium Orchid',
    description: 'Dogs are loyal, honest, and kind. They are reliable and faithful, with a strong sense of justice and duty.',
    career: 'Police Officer, Scientist, Counselor, Interior Designer',
    love: 'Faithful and devoted; need trust and security in relationships',
    health: 'Prone to anxiety; benefit from regular exercise and social activities',
  },
  Pig: {
    traits: ['Diligent','Compassionate','Generous','Optimistic','Sincere'],
    compatibility: ['Tiger','Rabbit','Goat'],
    incompatibility: ['Snake','Monkey'],
    luckyNumbers: [2,5,8],
    luckyColors: ['Yellow','Grey','Brown'],
    luckyFlowers: 'Hydrangea, Daisy',
    description: 'Pigs are diligent, compassionate, and generous. They are sincere and optimistic, with a love of luxury and comfort.',
    career: 'Entertainment, Catering, Retail, Hotel Management',
    love: 'Romantic and sensual; deeply committed and generous partners',
    health: 'Prone to weight issues; benefit from regular exercise and balanced diet',
  },
};

export function getChineseSign(year: number): ChineseSign {
  const animalIndex = ((year - 4) % 12 + 12) % 12;
  const animal = ANIMALS[animalIndex];
  const elementIndex = Math.floor(((year - 4) % 10 + 10) % 10 / 2);
  const element = ELEMENTS_CYCLE[elementIndex];
  const yin_yang: 'Yin' | 'Yang' = year % 2 === 0 ? 'Yang' : 'Yin';
  const data = SIGN_DATA[animal];
  return { animal, animalChinese: ANIMALS_CHINESE[animalIndex], element, yin_yang, year, ...data };
}

export function calculateChineseChart(birthDate: string, birthTime: string): ChineseChart {
  const [y, m, d] = birthDate.split('-').map(Number);
  const [h] = (birthTime || '12:00').split(':').map(Number);

  const yearSign = getChineseSign(y);

  // Month sign (simplified - based on solar month)
  const monthAnimalIndex = ((m - 1 + 2) % 12);
  const monthSign = ANIMALS[monthAnimalIndex];

  // Day sign (simplified)
  const dayNum = Math.floor((y * 365.25 + m * 30.44 + d) / 1) % 12;
  const daySign = ANIMALS[((dayNum % 12) + 12) % 12];

  // Hour sign (2-hour blocks)
  const hourIndex = Math.floor(((h + 1) % 24) / 2) % 12;
  const hourSign = ANIMALS[hourIndex];

  // Five elements balance (simplified)
  const fiveElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elementKey = yearSign.element.toLowerCase() as keyof typeof fiveElements;
  fiveElements[elementKey] += 3;
  fiveElements.earth += 1; // earth always present
  const monthEl = ELEMENTS_CYCLE[Math.floor(((m + 1) % 10) / 2)].toLowerCase() as keyof typeof fiveElements;
  fiveElements[monthEl] += 2;

  const lifePathNumber = (y.toString() + m.toString() + d.toString()).split('').reduce((a, b) => a + parseInt(b), 0) % 9 || 9;

  const currentYear = new Date().getFullYear();
  const currentYearSign = getChineseSign(currentYear);
  const currentYearForecast = generateYearForecast(yearSign.animal, currentYearSign.animal);

  return {
    yearSign,
    monthSign,
    daySign,
    hourSign,
    element: yearSign.element,
    polarity: yearSign.yin_yang,
    lifePathNumber,
    currentYearForecast,
    fiveElements,
  };
}

function generateYearForecast(birthAnimal: string, currentAnimal: string): string {
  const forecasts: Record<string, string> = {
    Rat: 'A year of opportunities and new beginnings. Your quick wit will help you navigate challenges.',
    Ox: 'Hard work pays off this year. Steady progress leads to significant achievements.',
    Tiger: 'Bold moves bring rewards. Trust your instincts and take calculated risks.',
    Rabbit: 'A peaceful year for relationships and creativity. Focus on harmony and diplomacy.',
    Dragon: 'Powerful energy surrounds you. Leadership opportunities arise; seize them.',
    Snake: 'Deep insights guide your path. Intuition is your greatest asset this year.',
    Horse: 'Freedom and adventure call. Travel and new experiences bring growth.',
    Goat: 'Creative pursuits flourish. Art, music, and beauty bring joy and success.',
    Monkey: 'Clever solutions to old problems emerge. Innovation leads to breakthroughs.',
    Rooster: 'Attention to detail brings rewards. Organization and planning are key.',
    Dog: 'Loyalty and honesty open doors. Relationships deepen and strengthen.',
    Pig: 'Abundance and generosity flow. Share your blessings and they multiply.',
  };
  return `In the Year of the ${currentAnimal}: ${forecasts[birthAnimal] ?? 'A year of growth and transformation awaits.'}`;
}

export function getChineseCompatibility(animal1: string, animal2: string): { score: number; description: string } {
  const sign1 = Object.values(SIGN_DATA).find((_, i) => ANIMALS[i] === animal1);
  if (!sign1) return { score: 50, description: 'Moderate compatibility' };

  if (sign1.compatibility.includes(animal2)) {
    return { score: 90, description: `${animal1} and ${animal2} are highly compatible! Natural harmony and mutual understanding.` };
  }
  if (sign1.incompatibility.includes(animal2)) {
    return { score: 30, description: `${animal1} and ${animal2} may face challenges. Different values and approaches require patience.` };
  }
  return { score: 65, description: `${animal1} and ${animal2} have moderate compatibility. With effort, a good relationship is possible.` };
}

export { ANIMALS, ELEMENTS_CYCLE, ELEMENT_COLORS };
