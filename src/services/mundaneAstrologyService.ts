// Week 62: Mundane Astrology Service
// World events, national predictions, planetary cycles

export interface PlanetaryCycle {
  planets: string; cycle: string; duration: string;
  currentPhase: string; effect: string; areas: string[];
  startYear: number; endYear: number;
}

export interface MundaneEvent {
  period: string; type: 'Political' | 'Economic' | 'Natural' | 'Social' | 'Spiritual';
  prediction: string; planets: string[]; probability: number;
  regions: string[]; remedies: string[];
}

export interface NationalChart {
  country: string; foundingDate: string; sunSign: string;
  moonSign: string; ascendant: string; currentDasha: string;
  forecast: string; strengths: string[]; challenges: string[];
}

const PLANETARY_CYCLES: PlanetaryCycle[] = [
  {
    planets: 'Jupiter-Saturn', cycle: 'Great Conjunction', duration: '20 years',
    currentPhase: 'Aquarius cycle (2020-2040)', effect: 'Social restructuring, technology revolution, democratic reforms',
    areas: ['Politics', 'Economy', 'Technology', 'Society'],
    startYear: 2020, endYear: 2040,
  },
  {
    planets: 'Saturn-Pluto', cycle: 'Transformation Cycle', duration: '33-38 years',
    currentPhase: 'Post-conjunction rebuilding (2020-2025)', effect: 'Structural collapse and rebuilding, power shifts, pandemic recovery',
    areas: ['Government', 'Corporations', 'Health Systems', 'Power Structures'],
    startYear: 2020, endYear: 2025,
  },
  {
    planets: 'Jupiter-Neptune', cycle: 'Spiritual Cycle', duration: '13 years',
    currentPhase: 'Pisces conjunction aftermath (2022-2026)', effect: 'Spiritual awakening, idealism, dissolution of boundaries',
    areas: ['Religion', 'Art', 'Spirituality', 'Illusion vs Reality'],
    startYear: 2022, endYear: 2026,
  },
  {
    planets: 'Rahu-Ketu', cycle: 'Nodal Axis', duration: '18 months per sign',
    currentPhase: 'Pisces-Virgo axis (2025-2026)', effect: 'Health focus, service, spiritual vs material balance',
    areas: ['Health', 'Service', 'Spirituality', 'Daily Routines'],
    startYear: 2025, endYear: 2026,
  },
  {
    planets: 'Saturn', cycle: 'Saturn Transit', duration: '2.5 years per sign',
    currentPhase: 'Pisces (2023-2025) → Aries (2025-2027)', effect: 'Discipline in spirituality, then new beginnings with challenges',
    areas: ['Karma', 'Discipline', 'Delays', 'Lessons'],
    startYear: 2023, endYear: 2027,
  },
  {
    planets: 'Jupiter', cycle: 'Jupiter Transit', duration: '1 year per sign',
    currentPhase: 'Gemini (2024-2025) → Cancer (2025-2026)', effect: 'Expansion in communication, then emotional abundance',
    areas: ['Expansion', 'Wisdom', 'Prosperity', 'Education'],
    startYear: 2024, endYear: 2026,
  },
];

const MUNDANE_EVENTS_2026: MundaneEvent[] = [
  {
    period: 'Jan-Mar 2026', type: 'Economic',
    prediction: 'Jupiter in Gemini brings expansion in technology and communication sectors. Stock markets show volatility with upward trend.',
    planets: ['Jupiter', 'Mercury'], probability: 72,
    regions: ['Global', 'Asia', 'USA'],
    remedies: ['Worship Jupiter on Thursdays', 'Donate yellow items', 'Chant Guru mantra'],
  },
  {
    period: 'Apr-Jun 2026', type: 'Political',
    prediction: 'Saturn-Rahu aspect creates political tensions and power struggles in major democracies. Leadership changes possible.',
    planets: ['Saturn', 'Rahu', 'Mars'], probability: 65,
    regions: ['Europe', 'Middle East', 'South Asia'],
    remedies: ['Perform Shani puja', 'Donate black sesame', 'Light mustard oil lamp on Saturdays'],
  },
  {
    period: 'Jul-Sep 2026', type: 'Natural',
    prediction: 'Mars-Ketu conjunction increases risk of natural disasters, fires, and extreme weather events.',
    planets: ['Mars', 'Ketu', 'Sun'], probability: 58,
    regions: ['Pacific Rim', 'South America', 'Africa'],
    remedies: ['Perform Hanuman puja', 'Donate red items on Tuesdays', 'Chant Mangal mantra'],
  },
  {
    period: 'Oct-Dec 2026', type: 'Social',
    prediction: 'Jupiter enters Cancer bringing humanitarian focus, social welfare programs, and emotional healing globally.',
    planets: ['Jupiter', 'Moon', 'Venus'], probability: 78,
    regions: ['Global', 'India', 'Southeast Asia'],
    remedies: ['Worship Lakshmi on Fridays', 'Donate food and water', 'Perform Satyanarayan puja'],
  },
  {
    period: 'Full Year 2026', type: 'Spiritual',
    prediction: 'Ketu in Virgo heightens collective spiritual seeking, alternative medicine interest, and service-oriented movements.',
    planets: ['Ketu', 'Mercury', 'Jupiter'], probability: 82,
    regions: ['India', 'Southeast Asia', 'Global Spiritual Communities'],
    remedies: ['Meditate daily', 'Serve the poor', 'Study sacred texts'],
  },
];

const NATIONAL_CHARTS: NationalChart[] = [
  {
    country: 'India', foundingDate: '1947-08-15', sunSign: 'Leo', moonSign: 'Capricorn',
    ascendant: 'Taurus', currentDasha: 'Jupiter Mahadasha',
    forecast: 'Jupiter Mahadasha brings expansion, international recognition, and economic growth. Technology and education sectors flourish.',
    strengths: ['Strong Jupiter', 'Exalted Moon', 'Powerful 10th house'],
    challenges: ['Saturn aspects Moon', 'Rahu in 2nd house', 'Mars-Saturn tension'],
  },
  {
    country: 'USA', foundingDate: '1776-07-04', sunSign: 'Cancer', moonSign: 'Aquarius',
    ascendant: 'Sagittarius', currentDasha: 'Saturn Mahadasha',
    forecast: 'Saturn Mahadasha brings restructuring, challenges to institutions, and karmic reckoning. Long-term rebuilding phase.',
    strengths: ['Strong Sun in Cancer', 'Jupiter in Cancer', 'Venus in Cancer'],
    challenges: ['Saturn Mahadasha challenges', 'Pluto return', 'Nodal axis tension'],
  },
  {
    country: 'China', foundingDate: '1949-10-01', sunSign: 'Libra', moonSign: 'Scorpio',
    ascendant: 'Aquarius', currentDasha: 'Rahu Mahadasha',
    forecast: 'Rahu Mahadasha drives rapid expansion, technological ambition, and global influence. Internal tensions possible.',
    strengths: ['Strong Mars', 'Saturn in Virgo', 'Powerful 10th house'],
    challenges: ['Rahu ambition vs stability', 'Moon in Scorpio tensions', 'External pressures'],
  },
];

export function getPlanetaryCycles(): PlanetaryCycle[] {
  return PLANETARY_CYCLES;
}

export function getMundaneEvents(year?: number): MundaneEvent[] {
  return MUNDANE_EVENTS_2026; // Expandable by year
}

export function getNationalCharts(): NationalChart[] {
  return NATIONAL_CHARTS;
}

export function getCurrentPlanetaryInfluences(): { planet: string; sign: string; effect: string; since: string; until: string }[] {
  return [
    { planet: 'Saturn', sign: 'Pisces', effect: 'Spiritual discipline, karmic lessons in faith and surrender', since: 'Mar 2023', until: 'May 2025' },
    { planet: 'Jupiter', sign: 'Gemini', effect: 'Expansion in communication, learning, and short journeys', since: 'May 2024', until: 'May 2025' },
    { planet: 'Rahu', sign: 'Pisces', effect: 'Obsession with spirituality, foreign connections, hidden matters', since: 'Oct 2023', until: 'Apr 2025' },
    { planet: 'Ketu', sign: 'Virgo', effect: 'Detachment from routine, health focus, service orientation', since: 'Oct 2023', until: 'Apr 2025' },
    { planet: 'Mars', sign: 'Variable', effect: 'Changes every 45 days - check current position', since: 'Current', until: 'Next transit' },
  ];
}
