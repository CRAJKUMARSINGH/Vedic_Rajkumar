/**
 * Lal Kitab Service - The Red Book of Vedic Astrology
 * Week 17: Lal Kitab Foundation - Monday Implementation
 * Core Lal Kitab principles, chart calculation, and debt planet identification
 */

export interface LalKitabPlanetPosition {
  planet: string;
  house: number;
  rashi: string;
  degrees: number;
  isPuccaGhar: boolean; // Permanent house
  isAndha: boolean; // Blind planet
  strength: number;
  effects: {
    en: string[];
    hi: string[];
  };
}

export interface LalKitabHouse {
  houseNumber: number;
  rashi: string;
  planets: string[];
  lord: string;
  significance: {
    en: string;
    hi: string;
  };
  strength: number;
}

export interface DebtPlanet {
  planet: string;
  debtType: 'Pitru Rin' | 'Matru Rin' | 'Stri Rin' | 'Bhratru Rin' | 'Putra Rin' | 'Guru Rin';
  severity: 'low' | 'medium' | 'high';
  house: number;
  effects: {
    en: string[];
    hi: string[];
  };
  remedies: string[];
  timing: string;
}

export interface LalKitabChart {
  id: string;
  userId: string;
  chartData: {
    planets: LalKitabPlanetPosition[];
    houses: LalKitabHouse[];
    debtPlanets: DebtPlanet[];
    specialCombinations: string[];
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    karmaDebts: DebtPlanet[];
    recommendations: {
      en: string[];
      hi: string[];
    };
  };
}

/**
 * Lal Kitab Principles and Key Differences from Vedic Astrology
 */
export const LAL_KITAB_PRINCIPLES = {
  // Pucca Ghar (Permanent Houses) for each planet
  puccaGhar: {
    'Sun': 1,      // Sun's permanent house is 1st
    'Moon': 4,     // Moon's permanent house is 4th
    'Mars': 3,     // Mars' permanent house is 3rd (also 8th)
    'Mercury': 7,  // Mercury's permanent house is 7th
    'Jupiter': 9,  // Jupiter's permanent house is 9th
    'Venus': 7,    // Venus' permanent house is 7th
    'Saturn': 8,   // Saturn's permanent house is 8th
    'Rahu': 12,    // Rahu's permanent house is 12th
    'Ketu': 6      // Ketu's permanent house is 6th
  },
  
  // Andha (Blind) Planets - planets that cannot see certain houses
  andhaPlanets: {
    'Sun': [7],           // Sun is blind to 7th house
    'Moon': [8],          // Moon is blind to 8th house
    'Mars': [8],          // Mars is blind to 8th house
    'Mercury': [2],       // Mercury is blind to 2nd house
    'Jupiter': [6],       // Jupiter is blind to 6th house
    'Venus': [6, 8],      // Venus is blind to 6th and 8th houses
    'Saturn': [3],        // Saturn is blind to 3rd house
    'Rahu': [9],          // Rahu is blind to 9th house
    'Ketu': [3]           // Ketu is blind to 3rd house
  },
  
  // Planetary friendships in Lal Kitab (different from Vedic)
  friendships: {
    'Sun': ['Moon', 'Mars', 'Jupiter'],
    'Moon': ['Sun', 'Mercury'],
    'Mars': ['Sun', 'Moon', 'Jupiter'],
    'Mercury': ['Sun', 'Venus'],
    'Jupiter': ['Sun', 'Moon', 'Mars'],
    'Venus': ['Mercury', 'Saturn'],
    'Saturn': ['Mercury', 'Venus'],
    'Rahu': ['Mercury', 'Venus', 'Saturn'],
    'Ketu': ['Mars', 'Jupiter']
  },
  
  // Key concepts
  concepts: {
    en: [
      'Pucca Ghar: Each planet has a permanent house where it feels most comfortable',
      'Andha Planets: Planets that cannot see certain houses, creating blind spots',
      'Rinanu Bandhan: Karmic debts from past lives that manifest in current life',
      'Totke: Simple, practical remedies that are cost-effective and easy to perform',
      'Varsh Kundali: Annual chart that shows yearly predictions'
    ],
    hi: [
      'αñ¬αñòαÑìαñòαñ╛ αñÿαñ░: αñ¬αÑìαñ░αññαÑìαñ»αÑçαñò αñùαÑìαñ░αñ╣ αñòαñ╛ αñÅαñò αñ╕αÑìαñÑαñ╛αñ»αÑÇ αñÿαñ░ αñ╣αÑïαññαñ╛ αñ╣αÑê αñ£αñ╣αñ╛αñé αñ╡αñ╣ αñ╕αñ¼αñ╕αÑç αñ╕αñ╣αñ£ αñ«αñ╣αñ╕αÑéαñ╕ αñòαñ░αññαñ╛ αñ╣αÑê',
      'αñàαñéαñºαñ╛ αñùαÑìαñ░αñ╣: αñÉαñ╕αÑç αñùαÑìαñ░αñ╣ αñ£αÑï αñòαÑüαñ¢ αñÿαñ░αÑïαñé αñòαÑï αñ¿αñ╣αÑÇαñé αñªαÑçαñû αñ╕αñòαññαÑç, αñàαñéαñºαÑç αñ╕αÑìαñÑαñ╛αñ¿ αñ¼αñ¿αñ╛αññαÑç αñ╣αÑêαñé',
      'αñïαñúαñ╛αñ¿αÑüαñ¼αñéαñºαñ¿: αñ¬αñ┐αñ¢αñ▓αÑç αñ£αñ¿αÑìαñ«αÑïαñé αñòαÑç αñòαñ░αÑìαñ« αñïαñú αñ£αÑï αñ╡αñ░αÑìαññαñ«αñ╛αñ¿ αñ£αÑÇαñ╡αñ¿ αñ«αÑçαñé αñ¬αÑìαñ░αñòαñƒ αñ╣αÑïαññαÑç αñ╣αÑêαñé',
      'αñƒαÑïαñƒαñòαÑç: αñ╕αñ░αñ▓, αñ╡αÑìαñ»αñ╛αñ╡αñ╣αñ╛αñ░αñ┐αñò αñëαñ¬αñ╛αñ» αñ£αÑï αñòαñ┐αñ½αñ╛αñ»αññαÑÇ αñöαñ░ αñòαñ░αñ¿αÑç αñ«αÑçαñé αñåαñ╕αñ╛αñ¿ αñ╣αÑêαñé',
      'αñ╡αñ░αÑìαñ╖ αñòαÑüαñéαñíαñ▓αÑÇ: αñ╡αñ╛αñ░αÑìαñ╖αñ┐αñò αñÜαñ╛αñ░αÑìαñƒ αñ£αÑï αñ╡αñ╛αñ░αÑìαñ╖αñ┐αñò αñ¡αñ╡αñ┐αñ╖αÑìαñ»αñ╡αñ╛αñúαñ┐αñ»αñ╛αñé αñªαñ┐αñûαñ╛αññαñ╛ αñ╣αÑê'
    ]
  }
};

/**
 * Calculate Lal Kitab chart from birth data
 */
export function calculateLalKitabChart(birthChart: {
  houses: Record<number, { rashi: string; lord: string; planets: string[] }>;
  planetPositions: Record<string, { house: number; rashi: string; degrees: number }>;
  planetaryStrengths: Record<string, number>;
}): {
  planets: LalKitabPlanetPosition[];
  houses: LalKitabHouse[];
  debtPlanets: DebtPlanet[];
  specialCombinations: string[];
} {
  
  // Calculate planetary positions with Lal Kitab analysis
  const planets: LalKitabPlanetPosition[] = Object.entries(birthChart.planetPositions).map(([planet, position]) => {
    const puccaGhar = LAL_KITAB_PRINCIPLES.puccaGhar[planet as keyof typeof LAL_KITAB_PRINCIPLES.puccaGhar];
    const isPuccaGhar = position.house === puccaGhar;
    
    // Check if planet is Andha (blind)
    const andhaHouses = LAL_KITAB_PRINCIPLES.andhaPlanets[planet as keyof typeof LAL_KITAB_PRINCIPLES.andhaPlanets] || [];
    const isAndha = andhaHouses.includes(position.house);
    
    // Calculate strength based on Lal Kitab principles
    let strength = birthChart.planetaryStrengths[planet] || 50;
    if (isPuccaGhar) strength += 20; // Bonus for being in permanent house
    if (isAndha) strength -= 15; // Penalty for being blind
    strength = Math.min(100, Math.max(0, strength));
    
    return {
      planet,
      house: position.house,
      rashi: position.rashi,
      degrees: position.degrees,
      isPuccaGhar,
      isAndha,
      strength,
      effects: generatePlanetEffects(planet, position.house, isPuccaGhar, isAndha)
    };
  });
  
  // Calculate houses with Lal Kitab analysis
  const houses: LalKitabHouse[] = Object.entries(birthChart.houses).map(([houseNum, house]) => {
    const houseNumber = parseInt(houseNum);
    return {
      houseNumber,
      rashi: house.rashi,
      planets: house.planets,
      lord: house.lord,
      significance: getHouseSignificance(houseNumber),
      strength: calculateHouseStrength(houseNumber, house.planets, birthChart.planetaryStrengths)
    };
  });
  
  // Identify debt planets (Rinanu Bandhan)
  const debtPlanets = identifyDebtPlanets(planets, houses);
  
  // Identify special combinations
  const specialCombinations = identifySpecialCombinations(planets, houses);
  
  return {
    planets,
    houses,
    debtPlanets,
    specialCombinations
  };
}

/**
 * Generate planet effects based on Lal Kitab principles
 */
function generatePlanetEffects(
  planet: string,
  house: number,
  isPuccaGhar: boolean,
  isAndha: boolean
): { en: string[]; hi: string[] } {
  const effects: { en: string[]; hi: string[] } = { en: [], hi: [] };
  
  if (isPuccaGhar) {
    effects.en.push(`${planet} is in its permanent house (Pucca Ghar) - Very favorable`);
    effects.hi.push(`${planet} αñàαñ¬αñ¿αÑç αñ╕αÑìαñÑαñ╛αñ»αÑÇ αñÿαñ░ (αñ¬αñòαÑìαñòαñ╛ αñÿαñ░) αñ«αÑçαñé αñ╣αÑê - αñ¼αñ╣αÑüαññ αñàαñ¿αÑüαñòαÑéαñ▓`);
  }
  
  if (isAndha) {
    effects.en.push(`${planet} is blind (Andha) in this position - Creates blind spots`);
    effects.hi.push(`${planet} αñçαñ╕ αñ╕αÑìαñÑαñ┐αññαñ┐ αñ«αÑçαñé αñàαñéαñºαñ╛ αñ╣αÑê - αñàαñéαñºαÑç αñ╕αÑìαñÑαñ╛αñ¿ αñ¼αñ¿αñ╛αññαñ╛ αñ╣αÑê`);
  }
  
  // Add house-specific effects
  const houseEffects = getLalKitabHouseEffects(planet, house);
  effects.en.push(...houseEffects.en);
  effects.hi.push(...houseEffects.hi);
  
  return effects;
}

/**
 * Get Lal Kitab specific house effects
 */
function getLalKitabHouseEffects(planet: string, house: number): { en: string[]; hi: string[] } {
  const effects: { en: string[]; hi: string[] } = { en: [], hi: [] };
  
  // Simplified Lal Kitab house effects
  if (planet === 'Sun' && house === 10) {
    effects.en.push('Excellent for career and government positions');
    effects.hi.push('αñòαñ░αñ┐αñ»αñ░ αñöαñ░ αñ╕αñ░αñòαñ╛αñ░αÑÇ αñ¬αñªαÑïαñé αñòαÑç αñ▓αñ┐αñÅ αñëαññαÑìαñòαÑâαñ╖αÑìαñƒ');
  } else if (planet === 'Moon' && house === 4) {
    effects.en.push('Strong emotional foundation and mother relationship');
    effects.hi.push('αñ«αñ£αñ¼αÑéαññ αñ¡αñ╛αñ╡αñ¿αñ╛αññαÑìαñ«αñò αñåαñºαñ╛αñ░ αñöαñ░ αñ«αñ╛αñé αñòαÑç αñ╕αñ╛αñÑ αñ╕αñéαñ¼αñéαñº');
  } else if (planet === 'Jupiter' && house === 9) {
    effects.en.push('Great fortune, wisdom, and spiritual growth');
    effects.hi.push('αñ«αñ╣αñ╛αñ¿ αñ¡αñ╛αñùαÑìαñ», αñ£αÑìαñ₧αñ╛αñ¿ αñöαñ░ αñåαñºαÑìαñ»αñ╛αññαÑìαñ«αñ┐αñò αñ╡αñ┐αñòαñ╛αñ╕');
  }
  
  return effects;
}

/**
 * Get house significance in Lal Kitab
 */
function getHouseSignificance(houseNumber: number): { en: string; hi: string } {
  const significances: Record<number, { en: string; hi: string }> = {
    1: { en: 'Self, personality, physical body', hi: 'αñ╕αÑìαñ╡αñ»αñé, αñ╡αÑìαñ»αñòαÑìαññαñ┐αññαÑìαñ╡, αñ¡αÑîαññαñ┐αñò αñ╢αñ░αÑÇαñ░' },
    2: { en: 'Wealth, family, speech', hi: 'αñºαñ¿, αñ¬αñ░αñ┐αñ╡αñ╛αñ░, αñ╡αñ╛αñúαÑÇ' },
    3: { en: 'Siblings, courage, communication', hi: 'αñ¡αñ╛αñê-αñ¼αñ╣αñ¿, αñ╕αñ╛αñ╣αñ╕, αñ╕αñéαñÜαñ╛αñ░' },
    4: { en: 'Mother, home, emotions, property', hi: 'αñ«αñ╛αññαñ╛, αñÿαñ░, αñ¡αñ╛αñ╡αñ¿αñ╛αñÅαñé, αñ╕αñéαñ¬αññαÑìαññαñ┐' },
    5: { en: 'Children, creativity, intelligence', hi: 'αñ¼αñÜαÑìαñÜαÑç, αñ░αñÜαñ¿αñ╛αññαÑìαñ«αñòαññαñ╛, αñ¼αÑüαñªαÑìαñºαñ┐' },
    6: { en: 'Enemies, diseases, debts, service', hi: 'αñ╢αññαÑìαñ░αÑü, αñ░αÑïαñù, αñïαñú, αñ╕αÑçαñ╡αñ╛' },
    7: { en: 'Marriage, partnerships, business', hi: 'αñ╡αñ┐αñ╡αñ╛αñ╣, αñ╕αñ╛αñ¥αÑçαñªαñ╛αñ░αÑÇ, αñ╡αÑìαñ»αñ╛αñ¬αñ╛αñ░' },
    8: { en: 'Longevity, transformation, occult', hi: 'αñªαÑÇαñ░αÑìαñÿαñ╛αñ»αÑü, αñ¬αñ░αñ┐αñ╡αñ░αÑìαññαñ¿, αñùαÑüαñ¬αÑìαññ αñ╡αñ┐αñªαÑìαñ»αñ╛' },
    9: { en: 'Fortune, father, spirituality, dharma', hi: 'αñ¡αñ╛αñùαÑìαñ», αñ¬αñ┐αññαñ╛, αñåαñºαÑìαñ»αñ╛αññαÑìαñ«αñ┐αñòαññαñ╛, αñºαñ░αÑìαñ«' },
    10: { en: 'Career, reputation, authority', hi: 'αñòαñ░αñ┐αñ»αñ░, αñ¬αÑìαñ░αññαñ┐αñ╖αÑìαñáαñ╛, αñàαñºαñ┐αñòαñ╛αñ░' },
    11: { en: 'Gains, income, fulfillment of desires', hi: 'αñ▓αñ╛αñ¡, αñåαñ», αñçαñÜαÑìαñ¢αñ╛αñôαñé αñòαÑÇ αñ¬αÑéαñ░αÑìαññαñ┐' },
    12: { en: 'Losses, expenses, spirituality, moksha', hi: 'αñ╣αñ╛αñ¿αñ┐, αñ╡αÑìαñ»αñ», αñåαñºαÑìαñ»αñ╛αññαÑìαñ«αñ┐αñòαññαñ╛, αñ«αÑïαñòαÑìαñ╖' }
  };
  
  return significances[houseNumber] || { en: 'Unknown', hi: 'αñàαñ£αÑìαñ₧αñ╛αññ' };
}

/**
 * Calculate house strength in Lal Kitab
 */
function calculateHouseStrength(
  houseNumber: number,
  planets: string[],
  planetaryStrengths: Record<string, number>
): number {
  let strength = 50; // Base strength
  
  // Add strength from planets in house
  planets.forEach(planet => {
    const planetStrength = planetaryStrengths[planet] || 50;
    strength += (planetStrength - 50) * 0.3; // 30% contribution from each planet
  });
  
  return Math.round(Math.min(100, Math.max(0, strength)));
}

/**
 * Identify debt planets (Rinanu Bandhan) - Karmic debts
 */
function identifyDebtPlanets(
  planets: LalKitabPlanetPosition[],
  houses: LalKitabHouse[]
): DebtPlanet[] {
  const debtPlanets: DebtPlanet[] = [];
  
  planets.forEach(planet => {
    let debtType: DebtPlanet['debtType'] | null = null;
    let severity: DebtPlanet['severity'] = 'low';
    
    // Pitru Rin (Father's debt) - Sun in 9th house or afflicted
    if (planet.planet === 'Sun' && (planet.house === 9 || planet.strength < 40)) {
      debtType = 'Pitru Rin';
      severity = planet.strength < 30 ? 'high' : planet.strength < 50 ? 'medium' : 'low';
    }
    
    // Matru Rin (Mother's debt) - Moon in 4th house or afflicted
    if (planet.planet === 'Moon' && (planet.house === 4 || planet.strength < 40)) {
      debtType = 'Matru Rin';
      severity = planet.strength < 30 ? 'high' : planet.strength < 50 ? 'medium' : 'low';
    }
    
    // Stri Rin (Wife's debt) - Venus afflicted or in 7th
    if (planet.planet === 'Venus' && (planet.house === 7 || planet.strength < 40)) {
      debtType = 'Stri Rin';
      severity = planet.strength < 30 ? 'high' : planet.strength < 50 ? 'medium' : 'low';
    }
    
    // Bhratru Rin (Sibling's debt) - Mars in 3rd house or afflicted
    if (planet.planet === 'Mars' && (planet.house === 3 || planet.strength < 40)) {
      debtType = 'Bhratru Rin';
      severity = planet.strength < 30 ? 'high' : planet.strength < 50 ? 'medium' : 'low';
    }
    
    // Putra Rin (Children's debt) - Jupiter in 5th house or afflicted
    if (planet.planet === 'Jupiter' && (planet.house === 5 || planet.strength < 40)) {
      debtType = 'Putra Rin';
      severity = planet.strength < 30 ? 'high' : planet.strength < 50 ? 'medium' : 'low';
    }
    
    // Guru Rin (Teacher's debt) - Jupiter afflicted
    if (planet.planet === 'Jupiter' && planet.strength < 35) {
      debtType = 'Guru Rin';
      severity = 'high';
    }
    
    if (debtType) {
      debtPlanets.push({
        planet: planet.planet,
        debtType,
        severity,
        house: planet.house,
        effects: getDebtEffects(debtType, severity),
        remedies: getDebtRemedies(debtType),
        timing: 'Throughout life, especially during planet Mahadasha'
      });
    }
  });
  
  return debtPlanets;
}

/**
 * Get effects of karmic debts
 */
function getDebtEffects(debtType: DebtPlanet['debtType'], severity: DebtPlanet['severity']): { en: string[]; hi: string[] } {
  const effects: { en: string[]; hi: string[] } = { en: [], hi: [] };
  
  switch (debtType) {
    case 'Pitru Rin':
      effects.en.push('Challenges with father or paternal lineage');
      effects.en.push('Obstacles in career and authority');
      effects.hi.push('αñ¬αñ┐αññαñ╛ αñ»αñ╛ αñ¬αÑêαññαÑâαñò αñ╡αñéαñ╢ αñòαÑç αñ╕αñ╛αñÑ αñÜαÑüαñ¿αÑîαññαñ┐αñ»αñ╛αñé');
      effects.hi.push('αñòαñ░αñ┐αñ»αñ░ αñöαñ░ αñàαñºαñ┐αñòαñ╛αñ░ αñ«αÑçαñé αñ¼αñ╛αñºαñ╛αñÅαñé');
      break;
    case 'Matru Rin':
      effects.en.push('Issues with mother or maternal relationships');
      effects.en.push('Emotional instability and home problems');
      effects.hi.push('αñ«αñ╛αññαñ╛ αñ»αñ╛ αñ«αñ╛αññαÑâ αñ╕αñéαñ¼αñéαñºαÑïαñé αñòαÑç αñ╕αñ╛αñÑ αñ╕αñ«αñ╕αÑìαñ»αñ╛αñÅαñé');
      effects.hi.push('αñ¡αñ╛αñ╡αñ¿αñ╛αññαÑìαñ«αñò αñàαñ╕αÑìαñÑαñ┐αñ░αññαñ╛ αñöαñ░ αñÿαñ░ αñòαÑÇ αñ╕αñ«αñ╕αÑìαñ»αñ╛αñÅαñé');
      break;
    case 'Stri Rin':
      effects.en.push('Marital problems and relationship issues');
      effects.en.push('Difficulties with women in general');
      effects.hi.push('αñ╡αÑêαñ╡αñ╛αñ╣αñ┐αñò αñ╕αñ«αñ╕αÑìαñ»αñ╛αñÅαñé αñöαñ░ αñ╕αñéαñ¼αñéαñº αñ«αÑüαñªαÑìαñªαÑç');
      effects.hi.push('αñ╕αñ╛αñ«αñ╛αñ¿αÑìαñ» αñ░αÑéαñ¬ αñ╕αÑç αñ«αñ╣αñ┐αñ▓αñ╛αñôαñé αñòαÑç αñ╕αñ╛αñÑ αñòαñáαñ┐αñ¿αñ╛αñçαñ»αñ╛αñé');
      break;
    case 'Bhratru Rin':
      effects.en.push('Conflicts with siblings');
      effects.en.push('Lack of courage and communication issues');
      effects.hi.push('αñ¡αñ╛αñê-αñ¼αñ╣αñ¿αÑïαñé αñòαÑç αñ╕αñ╛αñÑ αñ╕αñéαñÿαñ░αÑìαñ╖');
      effects.hi.push('αñ╕αñ╛αñ╣αñ╕ αñòαÑÇ αñòαñ«αÑÇ αñöαñ░ αñ╕αñéαñÜαñ╛αñ░ αñ╕αñ«αñ╕αÑìαñ»αñ╛αñÅαñé');
      break;
    case 'Putra Rin':
      effects.en.push('Challenges with children');
      effects.en.push('Creative blocks and intelligence issues');
      effects.hi.push('αñ¼αñÜαÑìαñÜαÑïαñé αñòαÑç αñ╕αñ╛αñÑ αñÜαÑüαñ¿αÑîαññαñ┐αñ»αñ╛αñé');
      effects.hi.push('αñ░αñÜαñ¿αñ╛αññαÑìαñ«αñò αñàαñ╡αñ░αÑïαñº αñöαñ░ αñ¼αÑüαñªαÑìαñºαñ┐ αñ╕αñ«αñ╕αÑìαñ»αñ╛αñÅαñé');
      break;
    case 'Guru Rin':
      effects.en.push('Disrespect to teachers and elders');
      effects.en.push('Lack of wisdom and spiritual growth');
      effects.hi.push('αñ╢αñ┐αñòαÑìαñ╖αñòαÑïαñé αñöαñ░ αñ¼αñíαñ╝αÑïαñé αñòαñ╛ αñàαñ¿αñ╛αñªαñ░');
      effects.hi.push('αñ£αÑìαñ₧αñ╛αñ¿ αñöαñ░ αñåαñºαÑìαñ»αñ╛αññαÑìαñ«αñ┐αñò αñ╡αñ┐αñòαñ╛αñ╕ αñòαÑÇ αñòαñ«αÑÇ');
      break;
  }
  
  if (severity === 'high') {
    effects.en.push('Severe manifestation - immediate remedies required');
    effects.hi.push('αñùαñéαñ¡αÑÇαñ░ αñ¬αÑìαñ░αñòαñƒαÑÇαñòαñ░αñú - αññαññαÑìαñòαñ╛αñ▓ αñëαñ¬αñ╛αñ» αñåαñ╡αñ╢αÑìαñ»αñò');
  }
  
  return effects;
}

/**
 * Get remedies for karmic debts
 */
function getDebtRemedies(debtType: DebtPlanet['debtType']): string[] {
  const remedies: Record<DebtPlanet['debtType'], string[]> = {
    'Pitru Rin': [
      'Offer water to Sun every morning',
      'Feed cows and crows regularly',
      'Perform Pind Daan for ancestors',
      'Respect father and elders'
    ],
    'Matru Rin': [
      'Serve mother with devotion',
      'Donate white items on Mondays',
      'Feed white cows',
      'Keep silver items at home'
    ],
    'Stri Rin': [
      'Respect wife and all women',
      'Donate to girl child education',
      'Wear silver ring',
      'Keep good relations with spouse'
    ],
    'Bhratru Rin': [
      'Help siblings financially',
      'Donate red items on Tuesdays',
      'Feed birds regularly',
      'Maintain good sibling relationships'
    ],
    'Putra Rin': [
      'Respect children and youth',
      'Donate to education causes',
      'Plant trees',
      'Teach underprivileged children'
    ],
    'Guru Rin': [
      'Respect all teachers and gurus',
      'Donate to educational institutions',
      'Study religious texts',
      'Share knowledge with others'
    ]
  };
  
  return remedies[debtType] || [];
}

/**
 * Identify special combinations in Lal Kitab
 */
function identifySpecialCombinations(
  planets: LalKitabPlanetPosition[],
  houses: LalKitabHouse[]
): string[] {
  const combinations: string[] = [];
  
  // Check for planets in Pucca Ghar
  const planetsInPuccaGhar = planets.filter(p => p.isPuccaGhar);
  if (planetsInPuccaGhar.length > 0) {
    combinations.push(`${planetsInPuccaGhar.length} planet(s) in Pucca Ghar - Very favorable`);
  }
  
  // Check for Andha planets
  const andhaPlanets = planets.filter(p => p.isAndha);
  if (andhaPlanets.length > 0) {
    combinations.push(`${andhaPlanets.length} Andha (blind) planet(s) - Requires attention`);
  }
  
  // Check for multiple planets in one house
  houses.forEach(house => {
    if (house.planets.length >= 3) {
      combinations.push(`${house.planets.length} planets in ${house.houseNumber}th house - Strong focus area`);
    }
  });
  
  return combinations;
}

/**
 * Generate comprehensive Lal Kitab analysis
 */
export function generateLalKitabAnalysis(
  userId: string,
  birthChart: any
): LalKitabChart {
  const chartData = calculateLalKitabChart(birthChart);
  
  // Generate strengths
  const strengths: string[] = [];
  chartData.planets.forEach(planet => {
    if (planet.isPuccaGhar) {
      strengths.push(`${planet.planet} in Pucca Ghar - Excellent position`);
    }
    if (planet.strength > 70) {
      strengths.push(`Strong ${planet.planet} - ${planet.strength}% strength`);
    }
  });
  
  // Generate weaknesses
  const weaknesses: string[] = [];
  chartData.planets.forEach(planet => {
    if (planet.isAndha) {
      weaknesses.push(`${planet.planet} is Andha (blind) - Creates blind spots`);
    }
    if (planet.strength < 40) {
      weaknesses.push(`Weak ${planet.planet} - ${planet.strength}% strength`);
    }
  });
  
  // Generate recommendations
  const recommendations = {
    en: [
      'Follow Lal Kitab remedies (totke) for best results',
      'Pay off karmic debts through prescribed remedies',
      'Strengthen weak planets with simple daily practices',
      'Avoid actions that worsen Andha planet effects'
    ],
    hi: [
      'αñ╕αñ░αÑìαñ╡αÑïαññαÑìαññαñ« αñ¬αñ░αñ┐αñúαñ╛αñ«αÑïαñé αñòαÑç αñ▓αñ┐αñÅ αñ▓αñ╛αñ▓ αñòαñ┐αññαñ╛αñ¼ αñòαÑç αñëαñ¬αñ╛αñ» (αñƒαÑïαñƒαñòαÑç) αñòαñ╛ αñ¬αñ╛αñ▓αñ¿ αñòαñ░αÑçαñé',
      'αñ¿αñ┐αñ░αÑìαñºαñ╛αñ░αñ┐αññ αñëαñ¬αñ╛αñ»αÑïαñé αñòαÑç αñ«αñ╛αñºαÑìαñ»αñ« αñ╕αÑç αñòαñ░αÑìαñ« αñïαñú αñÜαÑüαñòαñ╛αñÅαñé',
      'αñ╕αñ░αñ▓ αñªαÑêαñ¿αñ┐αñò αñ¬αÑìαñ░αñÑαñ╛αñôαñé αñ╕αÑç αñòαñ«αñ£αÑïαñ░ αñùαÑìαñ░αñ╣αÑïαñé αñòαÑï αñ«αñ£αñ¼αÑéαññ αñòαñ░αÑçαñé',
      'αñàαñéαñºαñ╛ αñùαÑìαñ░αñ╣ αñ¬αÑìαñ░αñ¡αñ╛αñ╡αÑïαñé αñòαÑï αñ¼αñ┐αñùαñ╛αñíαñ╝αñ¿αÑç αñ╡αñ╛αñ▓αÑÇ αñòαÑìαñ░αñ┐αñ»αñ╛αñôαñé αñ╕αÑç αñ¼αñÜαÑçαñé'
    ]
  };
  
  return {
    id: `lalkitab_${userId}_${Date.now()}`,
    userId,
    chartData,
    analysis: {
      strengths,
      weaknesses,
      karmaDebts: chartData.debtPlanets,
      recommendations
    }
  };
}

export default {
  LAL_KITAB_PRINCIPLES,
  calculateLalKitabChart,
  identifyDebtPlanets,
  generateLalKitabAnalysis
};


