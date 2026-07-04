import type { NormalizedPlanet } from './ephemerisService';
import type { ShadabalaAnalysis } from './shadabalaService';
import type { DashaPeriod, AntarDasha } from './dashaService';
import type { ShodashVargaResult } from './divisionalChartsService';

export type ReferenceType = 'natal' | 'prashna';

export interface DashaForecastPlanetInput {
  name: string;
  rashiIndex: number;
  house: number;
  degrees: number;
  isRetrograde?: boolean;
  totalRupas?: number | null;
}

export interface DashaForecastInput {
  referenceType: ReferenceType;
  planets: DashaForecastPlanetInput[];
  ascendantRashiIndex: number;
  mdLord: string;
  mdStartDate: Date | string;
  mdEndDate: Date | string;
  adLord?: string;
  adStartDate?: Date | string;
  adEndDate?: Date | string;
  shadbala?: ShadabalaAnalysis | null;
  divisionalCharts?: ShodashVargaResult | null;
}

export interface DashaPlanetAnalysis {
  planet: string;
  naturalKarakatva: string[];
  housesOwned: number[];
  ownershipSignificance: string[];
  natalHouse: number;
  natalRashi: string;
  natalDignity: string;
  d9Rashi?: string;
  d9Verdict: string;
  shadbalaRupas: number | null;
  shadbalaTier: string;
  canDeliver: boolean;
  deliveryClass: 'full' | 'standard' | 'conditional' | 'diluted' | 'broken';
  aspectorsOnPlanet: string[];
  yogasParticipated: string[];
  placementVerdict: string;
  promiseLevel: 'high' | 'medium' | 'low' | 'broken';
}

export interface DashaLifeAreaForecast {
  area: 'career' | 'wealth' | 'marriage' | 'health' | 'spirituality';
  verdict: string;
  probability: number;
  keyIndicators: string[];
  timing: string;
}

export interface DashaForecastResult {
  referenceType: ReferenceType;
  referenceNote: string;
  detailedSynthesis: {
    contextLabel: string;
    subjectSignature: string;
    judgmentStack: string[];
    lifeAreaHierarchy: string[];
    dashaProtocol: string[];
    failurePoint: string;
    subjectiveVerdict: string;
  };
  subjectiveAnalysis: {
    title: string;
    readingMode: string;
    planetaryMandate: string[];
    mdAdSynthesis: string;
    d9InnerScript: string;
    shadbalaGate: string;
    domainReadings: Array<{
      area: DashaLifeAreaForecast['area'];
      promise: string;
      obstruction: string;
      timing: string;
      subjectiveInstruction: string;
      therefore: string;
    }>;
    psychologicalWeather: string[];
    interventionMap: string[];
    finalJatakVerdict: string;
  };
  mdAnalysis: DashaPlanetAnalysis;
  adAnalysis: DashaPlanetAnalysis | null;
  mdAdRelationship: {
    mdLord: string;
    adLord: string;
    relationship: string;
    isHarmonious: boolean;
    combinedTheme: string;
    friction: string | null;
  } | null;
  lifeAreaForecasts: DashaLifeAreaForecast[];
  phaseAnalysis: {
    rising: { period: string; themes: string[]; keyAction: string };
    peak: { period: string; themes: string[]; keyAction: string };
    decline: { period: string; themes: string[]; keyAction: string };
  };
  classicalReferences: string[];
  thereforeClause: string;
  overallProbability: number;
  failureMode: string | null;
  remedyTarget: string | null;
}

const RASHI_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const RASHI_LORDS = [
  'Mars',
  'Venus',
  'Mercury',
  'Moon',
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Saturn',
  'Jupiter',
];

const EXALTATION: Record<string, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
};

const DEBILITATION: Record<string, number> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
};

const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
};

const MOOLATRIKONA: Record<string, number> = {
  Sun: 4,
  Moon: 1,
  Mars: 0,
  Mercury: 5,
  Jupiter: 8,
  Venus: 6,
  Saturn: 10,
};

const FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
  Rahu: ['Saturn', 'Venus', 'Mercury'],
  Ketu: ['Mars', 'Jupiter', 'Venus'],
};

const ENEMIES: Record<string, string[]> = {
  Sun: ['Saturn', 'Venus'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
  Rahu: ['Sun', 'Moon', 'Mars'],
  Ketu: ['Mercury', 'Venus'],
};

const KARAKATVA: Record<string, string[]> = {
  Sun: ['soul', 'authority', 'father', 'government', 'status', 'vitality', 'leadership'],
  Moon: ['mind', 'mother', 'emotion', 'public', 'nourishment', 'popularity', 'travel'],
  Mars: ['energy', 'courage', 'siblings', 'property', 'surgery', 'land', 'conflict'],
  Mercury: ['intellect', 'communication', 'business', 'education', 'commerce', 'writing'],
  Jupiter: ['wisdom', 'dharma', 'children', 'guru', 'wealth expansion', 'law'],
  Venus: ['relationship', 'pleasure', 'arts', 'vehicles', 'luxury', 'marriage'],
  Saturn: ['karma', 'discipline', 'delay', 'service', 'longevity', 'masses'],
  Rahu: ['foreign', 'unconventional', 'technology', 'amplification', 'desire'],
  Ketu: ['spirituality', 'detachment', 'research', 'past karma', 'liberation'],
};

const HOUSE_SIGNIFICATIONS: Record<number, string> = {
  1: 'self, body, temperament',
  2: 'wealth, family, speech',
  3: 'siblings, courage, communication',
  4: 'home, mother, property, inner peace',
  5: 'children, creativity, intelligence',
  6: 'disease, debt, competition, service',
  7: 'marriage, partnership, public dealing',
  8: 'longevity, transformation, secrets',
  9: 'dharma, father, guru, fortune',
  10: 'career, status, public action',
  11: 'gains, income, networks',
  12: 'losses, foreign lands, moksha',
};

const BENEFIC_HOUSES = [1, 4, 5, 7, 9, 10];
const DUSTHANA_HOUSES = [6, 8, 12];

function assertReferenceType(
  referenceType: ReferenceType | undefined
): asserts referenceType is ReferenceType {
  if (referenceType !== 'natal' && referenceType !== 'prashna') {
    throw new Error("referenceType is required and must be 'natal' or 'prashna'");
  }
}

export function toDashaForecastPlanets(
  planets: NormalizedPlanet[],
  shadbala?: ShadabalaAnalysis | null
): DashaForecastPlanetInput[] {
  return planets.map(planet => {
    const strength = shadbala?.planets.find(item => item.planet === planet.name);
    return {
      name: planet.name,
      rashiIndex: planet.rashiIndex,
      house: planet.house,
      degrees: planet.degrees,
      isRetrograde: planet.retrograde,
      totalRupas: strength?.totalRupas ?? null,
    };
  });
}

function fmt(date: Date | string | undefined): string {
  if (!date) return 'unknown';
  return new Date(date).toISOString().slice(0, 10);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function getDignity(planet: string, rashiIndex: number): string {
  if (EXALTATION[planet] === rashiIndex) return 'Exalted';
  if (DEBILITATION[planet] === rashiIndex) return 'Debilitated';
  if (MOOLATRIKONA[planet] === rashiIndex) return 'Moolatrikona';
  if (OWN_SIGNS[planet]?.includes(rashiIndex)) return 'Own Sign';
  const rashiLord = RASHI_LORDS[rashiIndex];
  if (FRIENDS[planet]?.includes(rashiLord)) return 'Friend Sign';
  if (ENEMIES[planet]?.includes(rashiLord)) return 'Enemy Sign';
  return 'Neutral';
}

function getHousesOwned(planet: string, ascendantRashiIndex: number): number[] {
  const result: number[] = [];
  for (let house = 1; house <= 12; house += 1) {
    const houseRashi = (ascendantRashiIndex + house - 1) % 12;
    if (OWN_SIGNS[planet]?.includes(houseRashi) || MOOLATRIKONA[planet] === houseRashi) {
      result.push(house);
    }
  }
  return result;
}

function getAspectors(
  target: DashaForecastPlanetInput,
  planets: DashaForecastPlanetInput[]
): string[] {
  return planets
    .filter(planet => planet.name !== target.name)
    .filter(planet => {
      const diff = ((target.house - planet.house + 12) % 12) + 1;
      if (diff === 7) return true;
      if ([4, 8].includes(diff)) return planet.name === 'Mars';
      if ([5, 9].includes(diff)) return planet.name === 'Jupiter';
      if ([3, 10].includes(diff)) return planet.name === 'Saturn';
      return false;
    })
    .map(planet => planet.name);
}

function getD9Rashi(
  planetName: string,
  divisionalCharts?: ShodashVargaResult | null
): string | undefined {
  const d9 = divisionalCharts?.charts.find(chart => chart.division === 9);
  const position = d9?.positions.find(item => item.planet === planetName);
  return position ? RASHI_NAMES[position.vargaRashi] : undefined;
}

function getD9Verdict(
  planetName: string,
  d1RashiIndex: number,
  divisionalCharts?: ShodashVargaResult | null
): string {
  const d9 = divisionalCharts?.charts.find(chart => chart.division === 9);
  const position = d9?.positions.find(item => item.planet === planetName);
  if (!position) return 'D9 overlay unavailable; natal placement carries the verdict.';
  if (position.vargaRashi === d1RashiIndex) return 'D9 confirms through vargottama repetition.';
  if (position.isExalted || position.isOwnSign)
    return 'D9 strengthens the dasha lord and rescues delivery.';
  if (position.isDebilitated)
    return 'D9 weakens the dasha lord; promise needs corrective discipline.';
  return `D9 moves the planet to ${RASHI_NAMES[position.vargaRashi]}, giving a mixed but usable inner result.`;
}

function detectYogas(
  planet: string,
  planets: DashaForecastPlanetInput[],
  ascendantRashiIndex: number
): string[] {
  const result: string[] = [];
  const p = planets.find(item => item.name === planet);
  if (!p) return result;
  const owned = getHousesOwned(planet, ascendantRashiIndex);
  const ownsKendra = owned.some(house => [1, 4, 7, 10].includes(house));
  const ownsTrikona = owned.some(house => [1, 5, 9].includes(house));
  if (ownsKendra && ownsTrikona) result.push('Raja Yoga carrier');
  if (owned.some(house => [2, 11].includes(house)) && ownsTrikona)
    result.push('Dhana Yoga carrier');
  if (owned.some(house => DUSTHANA_HOUSES.includes(house)) && DUSTHANA_HOUSES.includes(p.house)) {
    result.push('Vipareet Raja Yoga carrier');
  }
  if (p.isRetrograde) result.push('Retrograde intensity: delayed but amplified');
  return result;
}

function buildPlanetAnalysis(planetName: string, input: DashaForecastInput): DashaPlanetAnalysis {
  const planet = input.planets.find(item => item.name === planetName);
  const rashiIndex = planet?.rashiIndex ?? 0;
  const house = planet?.house ?? 1;
  const rupas =
    planet?.totalRupas ??
    input.shadbala?.planets.find(item => item.planet === planetName)?.totalRupas ??
    null;
  const housesOwned = getHousesOwned(planetName, input.ascendantRashiIndex);
  const dignity = getDignity(planetName, rashiIndex);
  const aspectors = planet ? getAspectors(planet, input.planets) : [];
  const yogas = detectYogas(planetName, input.planets, input.ascendantRashiIndex);

  let deliveryClass: DashaPlanetAnalysis['deliveryClass'] = 'standard';
  let shadbalaTier = 'Unknown';
  if (rupas !== null) {
    if (rupas >= 2) {
      deliveryClass = 'full';
      shadbalaTier = 'Extremely Strong';
    } else if (rupas >= 1.25) {
      deliveryClass = 'full';
      shadbalaTier = 'Strong';
    } else if (rupas >= 0.75) {
      deliveryClass = 'standard';
      shadbalaTier = 'Average';
    } else if (rupas >= 0.4) {
      deliveryClass = 'conditional';
      shadbalaTier = 'Weak';
    } else {
      deliveryClass = 'broken';
      shadbalaTier = 'Very Weak';
    }
  }

  let promiseLevel: DashaPlanetAnalysis['promiseLevel'] = 'medium';
  if (deliveryClass === 'broken') promiseLevel = 'broken';
  else if (dignity === 'Debilitated' || DUSTHANA_HOUSES.includes(house))
    promiseLevel = rupas !== null && rupas >= 0.75 ? 'medium' : 'low';
  else if (
    ['Exalted', 'Moolatrikona', 'Own Sign'].includes(dignity) ||
    BENEFIC_HOUSES.includes(house)
  )
    promiseLevel = rupas !== null && rupas < 0.75 ? 'medium' : 'high';

  const d9Rashi = getD9Rashi(planetName, input.divisionalCharts);
  const d9Verdict = getD9Verdict(planetName, rashiIndex, input.divisionalCharts);
  const ownership = housesOwned.length
    ? `owns house ${housesOwned.join('/')}: ${housesOwned.map(houseNo => HOUSE_SIGNIFICATIONS[houseNo]).join('; ')}`
    : 'has no classical house ownership as a node';

  return {
    planet: planetName,
    naturalKarakatva: KARAKATVA[planetName] ?? [],
    housesOwned,
    ownershipSignificance: housesOwned.map(houseNo => HOUSE_SIGNIFICATIONS[houseNo]),
    natalHouse: house,
    natalRashi: RASHI_NAMES[rashiIndex],
    natalDignity: dignity,
    d9Rashi,
    d9Verdict,
    shadbalaRupas: rupas,
    shadbalaTier,
    canDeliver: deliveryClass !== 'broken' && deliveryClass !== 'diluted',
    deliveryClass,
    aspectorsOnPlanet: aspectors,
    yogasParticipated: yogas,
    placementVerdict: `${planetName} is in ${RASHI_NAMES[rashiIndex]} (${dignity}) in house ${house} (${HOUSE_SIGNIFICATIONS[house]}), and ${ownership}. ${d9Verdict}`,
    promiseLevel,
  };
}

function getMdAdRelationship(mdLord: string, adLord: string) {
  const mdLikesAd = FRIENDS[mdLord]?.includes(adLord) ?? false;
  const adLikesMd = FRIENDS[adLord]?.includes(mdLord) ?? false;
  const mdDislikesAd = ENEMIES[mdLord]?.includes(adLord) ?? false;
  const adDislikesMd = ENEMIES[adLord]?.includes(mdLord) ?? false;

  if (mdLikesAd && adLikesMd) {
    return {
      mdLord,
      adLord,
      relationship: 'mutual-friends',
      isHarmonious: true,
      combinedTheme: `${mdLord} and ${adLord} cooperate; the sub-period can deliver the main period without inner contradiction.`,
      friction: null,
    };
  }
  if (mdDislikesAd || adDislikesMd) {
    return {
      mdLord,
      adLord,
      relationship: mdDislikesAd && adDislikesMd ? 'mutual-enemies' : 'mixed',
      isHarmonious: false,
      combinedTheme: `${mdLord} and ${adLord} create uneven results; one planet opens the door while the other demands payment.`,
      friction:
        'Expect divided focus, delayed delivery, or gains in one area with strain in another.',
    };
  }
  return {
    mdLord,
    adLord,
    relationship: mdLikesAd || adLikesMd ? 'one-sided friendship' : 'neutral',
    isHarmonious: true,
    combinedTheme: `${mdLord} and ${adLord} can work together with practical effort; results are steady rather than dramatic.`,
    friction: null,
  };
}

function buildLifeAreaForecasts(
  md: DashaPlanetAnalysis,
  ad: DashaPlanetAnalysis | null,
  planets: DashaForecastPlanetInput[]
): DashaLifeAreaForecast[] {
  const areas: DashaLifeAreaForecast['area'][] = [
    'career',
    'wealth',
    'marriage',
    'health',
    'spirituality',
  ];
  const areaHouses: Record<DashaLifeAreaForecast['area'], number[]> = {
    career: [10, 1, 6],
    wealth: [2, 11, 9],
    marriage: [7, 2, 5],
    health: [1, 6, 8],
    spirituality: [9, 12, 5],
  };
  const areaKaraka: Record<DashaLifeAreaForecast['area'], string[]> = {
    career: ['Sun', 'Saturn', 'Mars', 'Mercury'],
    wealth: ['Jupiter', 'Venus', 'Mercury'],
    marriage: ['Venus', 'Jupiter', 'Moon'],
    health: ['Sun', 'Moon', 'Saturn'],
    spirituality: ['Jupiter', 'Ketu', 'Saturn'],
  };

  return areas.map(area => {
    const houses = areaHouses[area];
    const keyIndicators: string[] = [];
    const mdRelated =
      houses.some(house => md.housesOwned.includes(house)) || houses.includes(md.natalHouse);
    const adRelated =
      !!ad &&
      (houses.some(house => ad.housesOwned.includes(house)) || houses.includes(ad.natalHouse));
    const occupants = planets
      .filter(planet => houses.includes(planet.house))
      .map(planet => planet.name);
    const mdKaraka = areaKaraka[area].includes(md.planet);
    const adKaraka = !!ad && areaKaraka[area].includes(ad.planet);

    if (occupants.length) keyIndicators.push(`${occupants.join(', ')} occupy ${area} houses`);
    if (mdRelated) keyIndicators.push(`${md.planet} directly owns or occupies a ${area} house`);
    if (adRelated && ad) keyIndicators.push(`${ad.planet} AD directly triggers a ${area} house`);
    if (mdKaraka) keyIndicators.push(`${md.planet} is a natural karaka for ${area}`);
    if (adKaraka && ad) keyIndicators.push(`${ad.planet} is a sub-period karaka for ${area}`);

    let score = 48;
    if (mdRelated) score += 17;
    if (adRelated) score += 12;
    if (mdKaraka) score += 9;
    if (adKaraka) score += 7;
    if (md.promiseLevel === 'high') score += 12;
    if (md.promiseLevel === 'low') score -= 14;
    if (md.promiseLevel === 'broken') score -= 28;
    if (md.natalDignity === 'Exalted') score += 10;
    if (md.natalDignity === 'Debilitated') score -= 12;
    if (md.d9Verdict.includes('strengthens') || md.d9Verdict.includes('confirms')) score += 6;
    if (md.d9Verdict.includes('weakens')) score -= 8;

    const probability = clamp(score, 10, 92);
    const quality =
      probability >= 75
        ? 'strongly activates'
        : probability >= 55
          ? 'moderately activates'
          : 'weakly activates';
    const timing =
      adRelated && ad
        ? `Peak in ${ad.planet} Antardasha`
        : 'Distributed through the main dasha with transit support required';

    return {
      area,
      verdict: `${md.planet} Maha Dasha ${quality} ${area}. ${md.placementVerdict}`,
      probability,
      keyIndicators: keyIndicators.length
        ? keyIndicators
        : ['No direct activation; watch relevant sub-periods and transits.'],
      timing,
    };
  });
}

function buildPhaseAnalysis(
  md: DashaPlanetAnalysis,
  startDate: Date | string,
  endDate: Date | string
) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const first = new Date(start + (end - start) / 3).toISOString().slice(0, 10);
  const second = new Date(start + ((end - start) * 2) / 3).toISOString().slice(0, 10);
  const themes = md.naturalKarakatva.slice(0, 3).join(', ');

  return {
    rising: {
      period: `${fmt(startDate)} to ${first}`,
      themes: [
        `${md.planet} agenda begins`,
        `Early activation of ${themes}`,
        'New circumstances appear before full results mature',
      ],
      keyAction: `Start disciplined actions related to ${md.planet}; avoid over-reading early signals.`,
    },
    peak: {
      period: `${first} to ${second}`,
      themes: [
        `Full ${md.planet} delivery`,
        `House ${md.natalHouse} and owned houses ${md.housesOwned.join('/')} become dominant`,
        'Main gains and tests are most visible',
      ],
      keyAction: md.canDeliver
        ? 'Act decisively; the dasha lord can carry results.'
        : `Repair ${md.planet} before expansion.`,
    },
    decline: {
      period: `${second} to ${fmt(endDate)}`,
      themes: [
        `Closure of ${md.planet} themes`,
        'Transition toward the next mahadasha',
        'Consolidation of results',
      ],
      keyAction: 'Complete unfinished duties and prepare for the next planetary agenda.',
    },
  };
}

function buildClassicalReferences(
  md: DashaPlanetAnalysis,
  ad: DashaPlanetAnalysis | null
): string[] {
  const refs = [
    `BPHS Dasha Phala: ${md.planet} dasha gives results of its house, sign, strength, and natural significations.`,
    `Brihat Jataka: the dignity of the dasha lord decides whether promised results rise cleanly or arrive with strain.`,
    `Navamsha rule: D9 does not replace D1; it confirms, rescues, or weakens the natal promise.`,
  ];
  if (ad)
    refs.push(
      `Antardasha rule: ${ad.planet} delivers its own house themes inside the field created by ${md.planet} Mahadasha.`
    );
  return refs;
}

function buildDetailedSynthesis(params: {
  referenceType: ReferenceType;
  referenceNote: string;
  md: DashaPlanetAnalysis;
  ad: DashaPlanetAnalysis | null;
  relationship: DashaForecastResult['mdAdRelationship'];
  lifeAreaForecasts: DashaLifeAreaForecast[];
  thereforeClause: string;
  failureMode: string | null;
}): DashaForecastResult['detailedSynthesis'] {
  const {
    referenceType,
    referenceNote,
    md,
    ad,
    relationship,
    lifeAreaForecasts,
    thereforeClause,
    failureMode,
  } = params;
  const sortedAreas = [...lifeAreaForecasts].sort((a, b) => b.probability - a.probability);
  const topArea = sortedAreas[0];
  const weakArea = sortedAreas[sortedAreas.length - 1];
  const adLabel = ad ? `${ad.planet} Antardasha` : 'no supplied Antardasha';
  const relationshipText = relationship
    ? `${relationship.relationship}: ${relationship.combinedTheme}`
    : 'Mahadasha is judged without sub-period cooperation.';
  const d9Text = md.d9Rashi ? `${md.planet} D9 ${md.d9Rashi}: ${md.d9Verdict}` : md.d9Verdict;
  const shadbalaText =
    md.shadbalaRupas === null
      ? `${md.planet} Shadbala is unavailable; confidence is reduced and transits must confirm.`
      : `${md.planet} Shadbala ${md.shadbalaRupas.toFixed(2)} rupas, tier ${md.shadbalaTier}, delivery class ${md.deliveryClass}.`;

  return {
    contextLabel:
      referenceType === 'natal' ? 'Birth-data Jatak reading' : 'Question-time Prashna reading',
    subjectSignature:
      referenceType === 'natal'
        ? `This is Jatak-wise: ${md.planet} Maha Dasha is judged against the native's birth promise, D9 support, and lived life pattern.`
        : `This is Prashna-wise: ${md.planet} Maha Dasha language is constrained to this question-time chart and must not become a whole-life natal verdict.`,
    judgmentStack: [
      `D1 placement: ${md.placementVerdict}`,
      `House lordship: ${md.housesOwned.length ? `${md.planet} owns ${md.housesOwned.join('/')} and carries ${md.ownershipSignificance.join('; ')}.` : `${md.planet} is a node/no-owner factor, so house occupation and dispositors dominate.`}`,
      `Natural karakatva: ${md.naturalKarakatva.slice(0, 5).join(', ') || 'none listed'}.`,
      d9Text,
      shadbalaText,
      `MD/AD relationship: ${relationshipText}`,
    ],
    lifeAreaHierarchy: sortedAreas.map(
      (area, index) =>
        `${index + 1}. ${area.area}: ${area.probability}% - ${area.keyIndicators.join('; ')}`
    ),
    dashaProtocol: [
      `${md.planet} Mahadasha sets the field; ${adLabel} supplies the event trigger.`,
      `Promise level is ${md.promiseLevel}; delivery is ${md.canDeliver ? 'allowed' : 'blocked'} by the Shadbala gate.`,
      `${topArea.area} is the strongest activation; ${weakArea.area} is the weakest domain and needs transit/remedy confirmation.`,
      referenceNote,
    ],
    failurePoint:
      failureMode ??
      `${md.planet} is not structurally broken; watch ${weakArea.area} as the lowest probability domain.`,
    subjectiveVerdict: thereforeClause,
  };
}

function domainInstruction(
  area: DashaLifeAreaForecast['area'],
  md: DashaPlanetAnalysis,
  ad: DashaPlanetAnalysis | null
): string {
  const adText = ad ? `${ad.planet} AD` : 'the active Antardasha';
  const map: Record<DashaLifeAreaForecast['area'], string> = {
    career: `Make ${md.planet} visible through disciplined work. Use ${adText} for specific execution, not scattered ambition.`,
    wealth: `Let ${md.planet} define the earning channel. Avoid speculative expansion unless the sub-period supports house 2/11 themes.`,
    marriage: `Read relationship events through ${md.planet}'s maturity level. Do not judge affection alone; judge responsibility, timing, and D9 support.`,
    health: `Treat ${md.planet} as the stress signature. Stabilize routine before interpreting symptoms as destiny.`,
    spirituality: `Use the period for inner correction. ${md.planet} will show where ego has to become discipline.`,
  };
  return map[area];
}

function domainObstruction(
  area: DashaLifeAreaForecast['area'],
  md: DashaPlanetAnalysis,
  ad: DashaPlanetAnalysis | null
): string {
  const dusthana = DUSTHANA_HOUSES.includes(md.natalHouse);
  const weak = md.promiseLevel === 'low' || md.promiseLevel === 'broken';
  const adWeak = !!ad && (ad.promiseLevel === 'low' || ad.promiseLevel === 'broken');
  if (weak)
    return `${md.planet} is the obstruction because its delivery class is ${md.deliveryClass} and promise level is ${md.promiseLevel}.`;
  if (adWeak && ad)
    return `${ad.planet} AD is the obstruction inside an otherwise usable ${md.planet} field.`;
  if (dusthana)
    return `${md.planet} sits in a dusthana, so ${area} improves through pressure, service, correction, or debt-clearing.`;
  return `No structural denial is seen; obstruction comes from timing, overreach, or lack of transit confirmation.`;
}

function buildSubjectiveAnalysis(params: {
  referenceType: ReferenceType;
  referenceNote: string;
  md: DashaPlanetAnalysis;
  ad: DashaPlanetAnalysis | null;
  relationship: DashaForecastResult['mdAdRelationship'];
  lifeAreaForecasts: DashaLifeAreaForecast[];
  thereforeClause: string;
  failureMode: string | null;
  remedyTarget: string | null;
  overallProbability: number;
}): DashaForecastResult['subjectiveAnalysis'] {
  const {
    referenceType,
    referenceNote,
    md,
    ad,
    relationship,
    lifeAreaForecasts,
    thereforeClause,
    failureMode,
    remedyTarget,
    overallProbability,
  } = params;
  const sortedAreas = [...lifeAreaForecasts].sort((a, b) => b.probability - a.probability);
  const strongest = sortedAreas[0];
  const weakest = sortedAreas[sortedAreas.length - 1];
  const adPhrase = ad ? `${ad.planet} Antardasha` : 'no active Antardasha supplied';
  const houseOwnership = md.housesOwned.length
    ? `${md.planet} owns ${md.housesOwned.join('/')} and therefore carries ${md.ownershipSignificance.join('; ')}.`
    : `${md.planet} has no classical ownership here; occupation, dispositors, and karakatva become decisive.`;
  const relationshipLine = relationship
    ? relationship.isHarmonious
      ? `${md.planet} and ${ad?.planet} cooperate enough for results to come through effort.`
      : `${md.planet} and ${ad?.planet} are in friction; the event can come, but it extracts a cost or forces correction.`
    : `${md.planet} is judged as the main period lord without sub-period refinement.`;
  const d9Line = md.d9Rashi
    ? `Navamsha places ${md.planet} in ${md.d9Rashi}. ${md.d9Verdict}`
    : md.d9Verdict;
  const shadbalaLine =
    md.shadbalaRupas === null
      ? `${md.planet} has no Shadbala reading, so the forecast must stay conditional and transit-confirmed.`
      : `${md.planet} stands at ${md.shadbalaRupas.toFixed(2)} rupas (${md.shadbalaTier}). This makes the Dasha ${md.deliveryClass}, with ${md.promiseLevel} promise.`;

  const domainReadings = sortedAreas.map(area => {
    const obstruction = domainObstruction(area.area, md, ad);
    const instruction = domainInstruction(area.area, md, ad);
    const therefore =
      area.probability >= 75
        ? `Therefore: ${area.area} can be actively pursued in this Dasha, with ${area.timing.toLowerCase()}.`
        : area.probability >= 55
          ? `Therefore: ${area.area} is possible but not automatic; support it with discipline, correct timing, and realistic expectation.`
          : `Therefore: ${area.area} is not the cleanest promise of this Dasha; treat it as remedial, not expansionary.`;
    return {
      area: area.area,
      promise: area.verdict,
      obstruction,
      timing: area.timing,
      subjectiveInstruction: instruction,
      therefore,
    };
  });

  return {
    title:
      referenceType === 'natal'
        ? `${md.planet} Maha Dasha Jatak-wise Subjective Analysis`
        : `${md.planet} Maha Dasha Prashna-limited Subjective Analysis`,
    readingMode: referenceNote,
    planetaryMandate: [
      `${md.planet} is the Maha Dasha sovereign: it defines the field, mood, duty, reward, and test.`,
      `${adPhrase} is the event trigger: it decides where the large ${md.planet} agenda becomes visible in ordinary life.`,
      houseOwnership,
      `${md.planet}'s natural karakatva brings ${md.naturalKarakatva.join(', ') || 'its own significations'} into focus.`,
    ],
    mdAdSynthesis: `${relationshipLine} Strongest domain is ${strongest.area} at ${strongest.probability}%; weakest domain is ${weakest.area} at ${weakest.probability}%.`,
    d9InnerScript: d9Line,
    shadbalaGate: shadbalaLine,
    domainReadings,
    psychologicalWeather: [
      `${md.planet} Dasha changes the native's subjective weather: decisions start filtering through ${md.naturalKarakatva.slice(0, 3).join(', ') || md.planet}.`,
      md.promiseLevel === 'high'
        ? `Because ${md.planet} has high promise, the native should act without waiting for perfect certainty.`
        : `Because ${md.planet} is ${md.promiseLevel}, the native must reduce drama and increase structure before expecting clean delivery.`,
      ad
        ? `${ad.planet} AD colors the mind with ${ad.naturalKarakatva.slice(0, 3).join(', ') || ad.planet}; this is the short-term emotional trigger.`
        : `Without AD detail, psychological timing remains broad.`,
      referenceType === 'natal'
        ? `This is a life-pattern reading: old karmic habits around ${md.planet} will repeat until consciously handled.`
        : `This is a question chart reading: do not convert the pressure of this moment into a permanent identity verdict.`,
    ],
    interventionMap: [
      `Primary remedy target: ${remedyTarget ?? md.planet}.`,
      failureMode ??
        `${md.planet} is not broken, but the lowest probability domain (${weakest.area}) should not be forced.`,
      `Increase probability by strengthening the weakest delivery link, then act during ${ad ? `${ad.planet} AD` : 'the strongest transit-supported window'}.`,
      `Do not use generic remedies. The remedy must answer the exact planet that blocks delivery.`,
    ],
    finalJatakVerdict: `Overall delivery index is ${overallProbability}%. ${thereforeClause}`,
  };
}

export function runDashaForecast(input: DashaForecastInput): DashaForecastResult {
  assertReferenceType(input.referenceType);
  const md = buildPlanetAnalysis(input.mdLord, input);
  const ad = input.adLord ? buildPlanetAnalysis(input.adLord, input) : null;
  const relationship = ad ? getMdAdRelationship(md.planet, ad.planet) : null;
  const lifeAreaForecasts = buildLifeAreaForecasts(md, ad, input.planets);
  const topArea = [...lifeAreaForecasts].sort((a, b) => b.probability - a.probability)[0];
  const overallProbability = clamp(
    lifeAreaForecasts.reduce((sum, item) => sum + item.probability, 0) / lifeAreaForecasts.length,
    10,
    92
  );
  const referenceNote =
    input.referenceType === 'natal'
      ? 'Natal mode: answer is based on birth chart promise, birth Moon dasha, and the native/Jatak life pattern.'
      : 'Prashna mode: answer is based on the question-time chart. It applies to this question, not the whole life arc.';

  let failureMode: string | null = null;
  let remedyTarget: string | null = null;
  let thereforeClause: string;

  if (md.promiseLevel === 'broken') {
    failureMode = `${md.planet} is the single failure point: ${md.shadbalaRupas?.toFixed(2) ?? 'unknown'} rupas, ${md.natalDignity}, house ${md.natalHouse}.`;
    remedyTarget = md.planet;
    thereforeClause = `Therefore: ${md.planet} Maha Dasha cannot be treated as a high-delivery period until ${md.planet} is strengthened. Events may begin, but reversal or dilution is likely. ${referenceNote}`;
  } else if (relationship && !relationship.isHarmonious) {
    remedyTarget =
      ad?.shadbalaRupas !== null && (ad?.shadbalaRupas ?? 1) < (md.shadbalaRupas ?? 1)
        ? (ad?.planet ?? md.planet)
        : md.planet;
    failureMode = relationship.friction;
    thereforeClause = `Therefore: ${md.planet} MD / ${ad?.planet} AD gives conditional results. ${topArea.area} is the main activation (${topArea.probability}%), but MD/AD friction must be managed. ${referenceNote}`;
  } else if (md.promiseLevel === 'high') {
    thereforeClause = `Therefore: ${md.planet} Maha Dasha${ad ? ` / ${ad.planet} Antardasha` : ''} is a high-delivery window. ${topArea.area} is the strongest life area (${topArea.probability}%). Act with discipline while the dasha lord has delivery capacity. ${referenceNote}`;
  } else {
    thereforeClause = `Therefore: ${md.planet} Maha Dasha${ad ? ` / ${ad.planet} Antardasha` : ''} gives usable but measured results. ${topArea.area} leads, but outcomes depend on effort, D9 support, and transit confirmation. ${referenceNote}`;
  }

  return {
    referenceType: input.referenceType,
    referenceNote,
    detailedSynthesis: buildDetailedSynthesis({
      referenceType: input.referenceType,
      referenceNote,
      md,
      ad,
      relationship,
      lifeAreaForecasts,
      thereforeClause,
      failureMode,
    }),
    subjectiveAnalysis: buildSubjectiveAnalysis({
      referenceType: input.referenceType,
      referenceNote,
      md,
      ad,
      relationship,
      lifeAreaForecasts,
      thereforeClause,
      failureMode,
      remedyTarget,
      overallProbability,
    }),
    mdAnalysis: md,
    adAnalysis: ad,
    mdAdRelationship: relationship,
    lifeAreaForecasts,
    phaseAnalysis: buildPhaseAnalysis(md, input.mdStartDate, input.mdEndDate),
    classicalReferences: buildClassicalReferences(md, ad),
    thereforeClause,
    overallProbability,
    failureMode,
    remedyTarget,
  };
}

export function runCurrentDashaForecast(input: {
  referenceType: ReferenceType;
  planets: NormalizedPlanet[];
  ascendantRashiIndex: number;
  currentMahadasha: DashaPeriod;
  currentAntardasha?: AntarDasha | null;
  shadbala?: ShadabalaAnalysis | null;
  divisionalCharts?: ShodashVargaResult | null;
}): DashaForecastResult {
  return runDashaForecast({
    referenceType: input.referenceType,
    planets: toDashaForecastPlanets(input.planets, input.shadbala),
    ascendantRashiIndex: input.ascendantRashiIndex,
    mdLord: input.currentMahadasha.planet,
    mdStartDate: input.currentMahadasha.startDate,
    mdEndDate: input.currentMahadasha.endDate,
    adLord: input.currentAntardasha?.planet,
    adStartDate: input.currentAntardasha?.startDate,
    adEndDate: input.currentAntardasha?.endDate,
    shadbala: input.shadbala,
    divisionalCharts: input.divisionalCharts,
  });
}
