// Week 63: Financial Astrology Service
// Stock market timing, investment periods, wealth cycles

export interface FinancialPeriod {
  period: string;
  startDate: string;
  endDate: string;
  trend: 'Bullish' | 'Bearish' | 'Volatile' | 'Stable';
  confidence: number;
  sectors: string[];
  advice: string;
  planets: string[];
}

export interface PersonalFinancialForecast {
  wealthScore: number;
  currentPeriodTrend: 'Favorable' | 'Unfavorable' | 'Mixed';
  bestInvestmentPeriods: string[];
  avoidPeriods: string[];
  favorableSectors: string[];
  wealthYogas: string[];
  financialStrengths: string[];
  financialChallenges: string[];
  shortTermForecast: string;
  longTermForecast: string;
  remedies: string[];
}

interface PlanetData {
  name: string;
  rashiIndex: number;
  house: number;
  degrees: number;
  isRetrograde?: boolean;
}

// Market timing based on planetary cycles
export function getMarketForecast(year: number, month: number): FinancialPeriod[] {
  const periods: FinancialPeriod[] = [];
  const baseDate = new Date(year, month - 1, 1);

  // Jupiter cycle (12 years) - major bull/bear
  const jupiterSign = Math.floor(((year - 2000) * 12 / 12 + month / 12) % 12);
  const jupiterBullish = [0, 4, 8, 11].includes(jupiterSign); // Aries, Leo, Sagittarius, Pisces

  // Saturn cycle (29.5 years)
  const saturnSign = Math.floor(((year - 2000) * 12 / 29.5 + month / 29.5) % 12);
  const saturnBullish = [1, 5, 9, 10].includes(saturnSign); // Taurus, Virgo, Capricorn, Aquarius

  // Mercury retrograde periods (3x per year, ~3 weeks each)
  const mercuryRetrograde = [1, 5, 9].includes(month); // Simplified

  periods.push({
    period: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`,
    startDate: `${year}-${String(month).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
    trend: mercuryRetrograde ? 'Volatile' : jupiterBullish && saturnBullish ? 'Bullish' : !jupiterBullish && !saturnBullish ? 'Bearish' : 'Stable',
    confidence: 60 + Math.floor(Math.random() * 20),
    sectors: getFavorableSectors(jupiterSign, saturnSign),
    advice: mercuryRetrograde ? 'Mercury retrograde: Avoid signing contracts or major financial decisions. Review existing investments.' : jupiterBullish ? 'Jupiter supports expansion. Good time for long-term investments in growth sectors.' : 'Exercise caution. Focus on defensive investments and capital preservation.',
    planets: ['Jupiter', 'Saturn', mercuryRetrograde ? 'Mercury (Rx)' : 'Mercury'],
  });

  // Next 3 months
  for (let i = 1; i <= 3; i++) {
    const futureMonth = ((month - 1 + i) % 12) + 1;
    const futureYear = year + Math.floor((month - 1 + i) / 12);
    const fJupSign = Math.floor(((futureYear - 2000) * 12 / 12 + futureMonth / 12) % 12);
    const fBullish = [0, 4, 8, 11].includes(fJupSign);
    const fMercRx = [1, 5, 9].includes(futureMonth);

    periods.push({
      period: `${new Date(futureYear, futureMonth - 1).toLocaleString('default', { month: 'long' })} ${futureYear}`,
      startDate: `${futureYear}-${String(futureMonth).padStart(2, '0')}-01`,
      endDate: `${futureYear}-${String(futureMonth).padStart(2, '0')}-${new Date(futureYear, futureMonth, 0).getDate()}`,
      trend: fMercRx ? 'Volatile' : fBullish ? 'Bullish' : 'Stable',
      confidence: 55 + Math.floor(Math.random() * 20),
      sectors: getFavorableSectors(fJupSign, saturnSign),
      advice: fBullish ? 'Favorable period for growth investments.' : 'Consolidation phase; maintain existing positions.',
      planets: ['Jupiter', 'Saturn'],
    });
  }

  return periods;
}

function getFavorableSectors(jupiterSign: number, saturnSign: number): string[] {
  const jupiterSectors: Record<number, string[]> = {
    0: ['Technology', 'Defense', 'Sports'], 1: ['Banking', 'Agriculture', 'Real Estate'],
    2: ['Media', 'IT', 'Telecom'], 3: ['Healthcare', 'Food', 'Hospitality'],
    4: ['Entertainment', 'Gold', 'Luxury'], 5: ['Pharma', 'Healthcare', 'Analytics'],
    6: ['Fashion', 'Beauty', 'Luxury'], 7: ['Mining', 'Oil', 'Insurance'],
    8: ['Education', 'Travel', 'Publishing'], 9: ['Infrastructure', 'Mining', 'Government'],
    10: ['Technology', 'Aviation', 'Utilities'], 11: ['Spirituality', 'Healthcare', 'Charity'],
  };
  return jupiterSectors[jupiterSign] ?? ['Diversified'];
}

export function generatePersonalFinancialForecast(planets: PlanetData[], ascendantRashi: number): PersonalFinancialForecast {
  // Wealth houses: 2, 5, 9, 11
  const wealthHousePlanets = planets.filter(p => [2, 5, 9, 11].includes(p.house));
  const challengeHousePlanets = planets.filter(p => [6, 8, 12].includes(p.house));

  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

  let wealthScore = 60;
  wealthHousePlanets.forEach(p => {
    if (benefics.includes(p.name)) wealthScore += 5;
    if (p.name === 'Jupiter') wealthScore += 8;
    if (p.name === 'Venus') wealthScore += 5;
  });
  challengeHousePlanets.forEach(p => {
    if (malefics.includes(p.name)) wealthScore -= 5;
  });
  wealthScore = Math.min(100, Math.max(20, wealthScore));

  // Wealth yogas
  const wealthYogas: string[] = [];
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const venus = planets.find(p => p.name === 'Venus');
  const moon = planets.find(p => p.name === 'Moon');

  if (jupiter && [1, 2, 5, 9, 11].includes(jupiter.house)) wealthYogas.push('Dhana Yoga (Jupiter in wealth house)');
  if (venus && [2, 7, 11].includes(venus.house)) wealthYogas.push('Lakshmi Yoga (Venus in wealth house)');
  if (moon && [2, 4, 11].includes(moon.house)) wealthYogas.push('Chandra Dhana Yoga');
  if (jupiter && moon && Math.abs(jupiter.house - moon.house) === 4) wealthYogas.push('Gajakesari Yoga (wealth and wisdom)');

  const currentTrend: PersonalFinancialForecast['currentPeriodTrend'] = wealthScore >= 70 ? 'Favorable' : wealthScore >= 50 ? 'Mixed' : 'Unfavorable';

  const favorableSectors = getFavorableSectors(
    jupiter?.rashiIndex ?? 0,
    planets.find(p => p.name === 'Saturn')?.rashiIndex ?? 0
  );

  return {
    wealthScore,
    currentPeriodTrend: currentTrend,
    bestInvestmentPeriods: ['Jupiter Mahadasha periods', 'Venus Antardasha', 'When Jupiter transits 2nd, 5th, 9th, or 11th house'],
    avoidPeriods: ['Saturn Sade Sati', 'Rahu/Ketu transit over natal Moon', 'Mercury retrograde for contracts'],
    favorableSectors,
    wealthYogas: wealthYogas.length > 0 ? wealthYogas : ['No major wealth yogas detected; steady growth through effort'],
    financialStrengths: wealthHousePlanets.filter(p => benefics.includes(p.name)).map(p => `${p.name} in House ${p.house} supports wealth`),
    financialChallenges: challengeHousePlanets.filter(p => malefics.includes(p.name)).map(p => `${p.name} in House ${p.house} creates financial obstacles`),
    shortTermForecast: `${currentTrend === 'Favorable' ? 'Excellent' : currentTrend === 'Mixed' ? 'Moderate' : 'Challenging'} financial period in the next 6 months. ${currentTrend === 'Favorable' ? 'Good time for investments and new financial ventures.' : currentTrend === 'Mixed' ? 'Proceed with caution; diversify investments.' : 'Focus on savings and avoid speculation.'}`,
    longTermForecast: `Your wealth score of ${wealthScore}/100 indicates ${wealthScore >= 70 ? 'strong long-term wealth accumulation potential' : wealthScore >= 50 ? 'moderate wealth growth with consistent effort' : 'wealth requires dedicated effort and remedial measures'}. ${wealthYogas.length > 0 ? `Wealth yogas present: ${wealthYogas[0]}.` : ''}`,
    remedies: [
      'Worship Goddess Lakshmi on Fridays',
      'Chant "Om Shreem Mahalakshmiyei Namaha" 108 times daily',
      'Donate to charity on Thursdays (Jupiter day)',
      'Keep a yellow sapphire or citrine for Jupiter strength',
      'Avoid lending money on Saturdays',
    ],
  };
}
