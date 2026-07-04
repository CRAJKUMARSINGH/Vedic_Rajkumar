import type { ChartData } from '@/hooks/useChartCalculation';
import type {
  DashaForecastResult,
  DashaLifeAreaForecast,
  ReferenceType,
} from './dashaForecastService';
import { enhanceYogaAnalysis, type EnhancedYogaResult } from './yogaService';
import {
  buildApproxMoonDoubleTransitInput,
  checkCareerMoonDoubleTransit,
  checkMarriageMoonDoubleTransit,
  checkWealthMoonDoubleTransit,
  type MoonDoubleTransitResult,
} from './doubleTransitService';

type VerdictType = 'DELIVERING' | 'CONDITIONAL' | 'DELAYED' | 'BLOCKED';
type LifeArea = DashaLifeAreaForecast['area'];

export interface ConclusiveJatakJudgment {
  referenceType: ReferenceType;
  headline: string;
  verdictType: VerdictType;
  score: number;
  rajyogaVerdict: string;
  houseVerdict: string;
  dashaVerdict: string;
  transitVerdict: string;
  conflictResolution: string[];
  therefore: string;
  evidence: Array<{ layer: string; score: number; finding: string }>;
}

const DOMAIN_HOUSES: Record<LifeArea, number[]> = {
  career: [10, 1, 6],
  wealth: [2, 11, 9],
  marriage: [7, 2, 5],
  health: [1, 6, 8],
  spirituality: [9, 12, 5],
};

const HOUSE_STRENGTH_SCORE = {
  excellent: 100,
  good: 78,
  average: 55,
  weak: 30,
  'very-weak': 12,
} as const;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function strongestLifeArea(forecast: DashaForecastResult): DashaLifeAreaForecast {
  return (
    [...forecast.lifeAreaForecasts].sort((a, b) => b.probability - a.probability)[0] ??
    forecast.lifeAreaForecasts[0]
  );
}

function buildEnhancedYogas(chart: ChartData, forecast: DashaForecastResult): EnhancedYogaResult[] {
  if (!chart.yogas) return [];
  const shadbalaResults =
    chart.shadbala?.planets.map(planet => ({
      planet: planet.planet,
      totalRupas: planet.totalRupas,
    })) ?? [];

  const activeDasha = {
    mdLord: forecast.mdAnalysis.planet,
    adLord: forecast.adAnalysis?.planet ?? forecast.mdAnalysis.planet,
  };

  return enhanceYogaAnalysis(chart.yogas, shadbalaResults, activeDasha).enhancedYogas;
}

function scoreRajyoga(yogas: EnhancedYogaResult[]): {
  score: number;
  verdict: string;
  activeRajyogas: EnhancedYogaResult[];
  brokenRajyogas: EnhancedYogaResult[];
} {
  const rajyogas = yogas.filter(yoga => yoga.category === 'raj' || /raj/i.test(yoga.name));
  const activeRajyogas = rajyogas.filter(yoga => yoga.status === 'ACTIVE');
  const emergingRajyogas = rajyogas.filter(yoga => yoga.status === 'EMERGING');
  const latentRajyogas = rajyogas.filter(yoga => yoga.status === 'LATENT');
  const brokenRajyogas = rajyogas.filter(yoga => yoga.status === 'BROKEN');

  const score = clamp(
    activeRajyogas.length * 26 +
      emergingRajyogas.length * 16 +
      latentRajyogas.length * 8 -
      brokenRajyogas.length * 18
  );

  const names = activeRajyogas
    .slice(0, 2)
    .map(yoga => yoga.name)
    .join(', ');
  const verdict =
    activeRajyogas.length > 0
      ? `Rajyoga gate is open through ${names}; status can rise because the forming planets are in the active Dasha field.`
      : brokenRajyogas.length > 0
        ? `${brokenRajyogas[0].name} is present but broken by Shadbala gate; the yoga cannot be treated as a clean promise.`
        : emergingRajyogas.length > 0
          ? `${emergingRajyogas[0].name} is forming but not fully released; status improves after the activating Dasha matures.`
          : `No active Rajyoga is certified in the current Dasha; judge outcome by house promise and Dasha lord strength.`;

  return { score, verdict, activeRajyogas, brokenRajyogas };
}

function scoreHousePromise(chart: ChartData, area: LifeArea): { score: number; verdict: string } {
  const houses = DOMAIN_HOUSES[area];
  const strengths = houses
    .map(house => chart.ashtakavarga?.houseStrengths.find(item => item.house === house))
    .filter(Boolean);

  if (strengths.length === 0) {
    return {
      score: 45,
      verdict: `House promise for ${area} is not SAV-certified because Ashtakavarga data is unavailable; Dasha and yoga gates carry more weight.`,
    };
  }

  const score = clamp(
    strengths.reduce((sum, item) => sum + HOUSE_STRENGTH_SCORE[item!.strength], 0) /
      strengths.length
  );
  const weakest = [...strengths].sort((a, b) => a!.savPoints - b!.savPoints)[0]!;
  const strongest = [...strengths].sort((a, b) => b!.savPoints - a!.savPoints)[0]!;

  return {
    score,
    verdict: `${area} houses average ${score}/100 by SAV; strongest is house ${strongest.house} at ${strongest.savPoints} points and weakest is house ${weakest.house} at ${weakest.savPoints} points.`,
  };
}

function scoreDasha(
  forecast: DashaForecastResult,
  area: LifeArea
): { score: number; verdict: string } {
  const areaForecast = forecast.lifeAreaForecasts.find(item => item.area === area);
  const shadbalaPenalty =
    forecast.mdAnalysis.deliveryClass === 'broken'
      ? 24
      : forecast.mdAnalysis.deliveryClass === 'diluted'
        ? 14
        : forecast.mdAnalysis.deliveryClass === 'conditional'
          ? 7
          : 0;
  const relationBonus = forecast.mdAdRelationship?.isHarmonious
    ? 8
    : forecast.mdAdRelationship
      ? -8
      : 0;
  const score = clamp(
    (areaForecast?.probability ?? forecast.overallProbability) - shadbalaPenalty + relationBonus
  );
  const adText = forecast.adAnalysis ? ` with ${forecast.adAnalysis.planet} AD` : '';

  return {
    score,
    verdict: `${forecast.mdAnalysis.planet} MD${adText} gives ${score}/100 Dasha clearance for ${area}; delivery class is ${forecast.mdAnalysis.deliveryClass}.`,
  };
}

function getMoonRashi(chart: ChartData): number | null {
  const moon = chart.planetaryPositions?.planets.find(planet => planet.name === 'Moon');
  return typeof moon?.rashiIndex === 'number' ? moon.rashiIndex : null;
}

function scoreTransit(
  chart: ChartData,
  area: LifeArea
): {
  score: number;
  verdict: string;
  result: MoonDoubleTransitResult | null;
} {
  const moonRashi = getMoonRashi(chart);
  if (moonRashi === null) {
    return {
      score: 40,
      verdict: `Transit cannot be certified because natal Moon rashi is unavailable; do not overrule the Dasha from transit alone.`,
      result: null,
    };
  }

  const input = buildApproxMoonDoubleTransitInput(
    moonRashi,
    new Date(),
    chart.ascendant?.ascendant.rashiIndex
  );
  const result =
    area === 'career'
      ? checkCareerMoonDoubleTransit(input)
      : area === 'wealth'
        ? checkWealthMoonDoubleTransit(input)
        : area === 'marriage'
          ? checkMarriageMoonDoubleTransit(input)
          : null;

  if (!result) {
    return {
      score: 48,
      verdict: `${area} has no dedicated Moon double-transit gate here; transit is treated as secondary and cannot overturn Dasha plus house promise.`,
      result: null,
    };
  }

  const score = result.isActive ? (result.confidence === 'high' ? 92 : 78) : 32;
  return {
    score,
    verdict: result.thereforeVerdict,
    result,
  };
}

function verdictFromScore(score: number): VerdictType {
  if (score >= 75) return 'DELIVERING';
  if (score >= 56) return 'CONDITIONAL';
  if (score >= 40) return 'DELAYED';
  return 'BLOCKED';
}

function buildConflicts(params: {
  area: LifeArea;
  rajScore: number;
  houseScore: number;
  dashaScore: number;
  transitScore: number;
  activeRajyogas: EnhancedYogaResult[];
  brokenRajyogas: EnhancedYogaResult[];
}): string[] {
  const conflicts: string[] = [];
  if (params.activeRajyogas.length > 0 && params.dashaScore < 55) {
    conflicts.push(
      `Rajyoga exists, but Dasha is not clean enough; promise remains visible yet delayed in ${params.area}.`
    );
  }
  if (params.dashaScore >= 65 && params.houseScore < 45) {
    conflicts.push(
      `Dasha is willing, but house reservoir is weak; result comes with pressure, repair, or reduced satisfaction.`
    );
  }
  if (params.houseScore >= 65 && params.transitScore < 45) {
    conflicts.push(
      `House promise is real, but transit has not opened the timing gate; do not call immediate fruition.`
    );
  }
  if (params.brokenRajyogas.length > 0) {
    conflicts.push(
      `${params.brokenRajyogas[0].name} must be treated as a failure warning, not as decorative praise.`
    );
  }
  if (conflicts.length === 0) {
    conflicts.push(
      `All major layers are coherent enough to issue a direct ${params.area} judgment without hiding behind general stanzas.`
    );
  }
  return conflicts;
}

export function buildConclusiveJatakJudgment(
  chart: ChartData,
  forecast: DashaForecastResult,
  referenceType: ReferenceType
): ConclusiveJatakJudgment | null {
  const areaForecast = strongestLifeArea(forecast);
  if (!areaForecast) return null;

  const area = areaForecast.area;
  const enhancedYogas = buildEnhancedYogas(chart, forecast);
  const raj = scoreRajyoga(enhancedYogas);
  const house = scoreHousePromise(chart, area);
  const dasha = scoreDasha(forecast, area);
  const transit = scoreTransit(chart, area);

  const score = clamp(
    raj.score * 0.24 + house.score * 0.26 + dasha.score * 0.36 + transit.score * 0.14
  );
  const verdictType = verdictFromScore(score);
  const conflicts = buildConflicts({
    area,
    rajScore: raj.score,
    houseScore: house.score,
    dashaScore: dasha.score,
    transitScore: transit.score,
    activeRajyogas: raj.activeRajyogas,
    brokenRajyogas: raj.brokenRajyogas,
  });

  const scope =
    referenceType === 'natal'
      ? `for this Jatak's birth promise`
      : `for this question-time chart only`;
  const headline = `${verdictType}: ${area} is the leading field at ${score}/100`;
  const therefore = `Therefore: ${scope}, ${area} is ${verdictType.toLowerCase()} now because Rajyoga scores ${raj.score}/100, house promise scores ${house.score}/100, Dasha scores ${dasha.score}/100, and transit timing scores ${transit.score}/100. The final call is ${headline}.`;

  return {
    referenceType,
    headline,
    verdictType,
    score,
    rajyogaVerdict: raj.verdict,
    houseVerdict: house.verdict,
    dashaVerdict: dasha.verdict,
    transitVerdict: transit.verdict,
    conflictResolution: conflicts,
    therefore,
    evidence: [
      { layer: 'Rajyoga gate', score: raj.score, finding: raj.verdict },
      { layer: 'House promise', score: house.score, finding: house.verdict },
      { layer: 'Dasha activation', score: dasha.score, finding: dasha.verdict },
      { layer: 'Transit timing', score: transit.score, finding: transit.verdict },
    ],
  };
}
