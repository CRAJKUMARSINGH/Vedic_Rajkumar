import {
  SynthesisDomain,
  AstrologicalContext,
  DomainSignal,
  SynthesisRequest,
  SignalLayer,
} from './signalTypes';
import { DOMAIN_ONTOLOGY } from './domainOntology';

export function extractSignals(
  context: AstrologicalContext,
  request: SynthesisRequest
): DomainSignal[] {
  const domain = request.domain;
  const config = DOMAIN_ONTOLOGY[domain];
  const signals: DomainSignal[] = [];

  // LAYER 1: D1 Natal Promise
  // Evaluate primary houses
  config.primaryHouses.forEach(houseNum => {
    const occupantCount = context.planets.filter(p => p.house === houseNum).length;
    if (occupantCount > 0) {
      signals.push({
        id: `D1_HOUSE_${houseNum}_OCCUPANTS`,
        domain,
        layer: 'D1',
        category: 'promise',
        polarity: 'positive',
        magnitude: Math.min(1.0, 0.3 * occupantCount),
        reliability: 0.8,
        timingApplicability: 1.0,
        description: `Primary house ${houseNum} is activated by ${occupantCount} occupant(s).`,
      });
    }

    // Evaluate lord placement
    const houseLord = context.planets.find(
      p => p.name === getHouseLord(houseNum, context.lagnaRashiIdx)
    );
    if (houseLord) {
      if ([1, 4, 7, 10, 5, 9].includes(houseLord.house)) {
        signals.push({
          id: `D1_LORD_${houseNum}_KENDRA_TRIKONA`,
          domain,
          layer: 'D1',
          category: 'promise',
          polarity: 'positive',
          magnitude: 0.6,
          reliability: 0.9,
          timingApplicability: 1.0,
          description: `Lord of house ${houseNum} (${houseLord.name}) is powerfully placed in house ${houseLord.house}.`,
        });
      } else if ([6, 8, 12].includes(houseLord.house)) {
        signals.push({
          id: `D1_LORD_${houseNum}_DUSTHANA`,
          domain,
          layer: 'D1',
          category: 'obstruction',
          polarity: 'negative',
          magnitude: 0.7,
          reliability: 0.9,
          timingApplicability: 1.0,
          description: `Lord of house ${houseNum} (${houseLord.name}) is obstructed in house ${houseLord.house}.`,
        });
      }
    }
  });

  // LAYER: DIVISIONAL (e.g. D10 for career, D9 for marriage)
  if (domain === 'career' && context.divisional.d10_strong !== undefined) {
    signals.push({
      id: `D10_STRENGTH`,
      domain,
      layer: 'DIVISIONAL',
      category: 'promise',
      polarity: context.divisional.d10_strong ? 'positive' : 'negative',
      magnitude: 0.8,
      reliability: 0.9,
      timingApplicability: 1.0,
      description: context.divisional.d10_strong
        ? 'D10 (Dashamsa) confirms the career promise.'
        : 'D10 (Dashamsa) shows structural weakness, indicating a career ceiling.',
    });
  }

  // LAYER: DASHA ACTIVATION
  const md = context.dasha.currentMahadasha;
  const ad = context.dasha.currentAntardasha;
  let dashaMagnitude = 0;

  if (md) {
    const mdPlanet = context.planets.find(p => p.name === md.planet);
    if (
      mdPlanet &&
      (config.primaryHouses.includes(mdPlanet.house) || config.karakas.includes(md.planet))
    ) {
      dashaMagnitude += 0.6;
    }
  }
  if (ad) {
    const adPlanet = context.planets.find(p => p.name === ad.planet);
    if (
      adPlanet &&
      (config.primaryHouses.includes(adPlanet.house) || config.karakas.includes(ad.planet))
    ) {
      dashaMagnitude += 0.4;
    }
  }

  if (dashaMagnitude > 0) {
    signals.push({
      id: `DASHA_ACTIVATION_${md?.planet}_${ad?.planet}`,
      domain,
      layer: 'DASHA',
      category: 'activation',
      polarity: 'positive',
      magnitude: dashaMagnitude,
      reliability: 0.85,
      timingApplicability: 1.0,
      description: `Current Dasha (${md?.planet} MD / ${ad?.planet} AD) strongly activates the ${domain} domain.`,
    });
  } else {
    signals.push({
      id: `DASHA_DORMANT`,
      domain,
      layer: 'DASHA',
      category: 'activation',
      polarity: 'neutral',
      magnitude: 0.0,
      reliability: 0.9,
      timingApplicability: 0.0,
      description: `Current Dasha does not directly activate primary ${domain} indicators.`,
    });
  }

  // LAYER: TRANSIT
  // Check double transit on primary house (e.g. 10th for career)
  const targetHouse = config.primaryHouses[0];
  const jupiterTransit = context.transits.find(t => t.planet === 'Jupiter');
  const saturnTransit = context.transits.find(t => t.planet === 'Saturn');

  const jupiterActive =
    jupiterTransit &&
    (jupiterTransit.house === targetHouse || jupiterTransit.aspectsHouses.includes(targetHouse));
  const saturnActive =
    saturnTransit &&
    (saturnTransit.house === targetHouse || saturnTransit.aspectsHouses.includes(targetHouse));

  if (jupiterActive && saturnActive) {
    signals.push({
      id: `TRANSIT_DOUBLE_CERTIFIED`,
      domain,
      layer: 'TRANSIT',
      category: 'activation',
      polarity: 'positive',
      magnitude: 1.0,
      reliability: 0.95,
      timingApplicability: 1.0,
      description: `Double transit of Jupiter and Saturn certifies ${domain} manifestation on the ${targetHouse}th house.`,
    });
  } else if (jupiterActive || saturnActive) {
    signals.push({
      id: `TRANSIT_SINGLE`,
      domain,
      layer: 'TRANSIT',
      category: 'activation',
      polarity: 'positive',
      magnitude: 0.4,
      reliability: 0.7,
      timingApplicability: 0.8,
      description: `Single transit activation (${jupiterActive ? 'Jupiter' : 'Saturn'}) creates a temporary window.`,
    });
  }

  // LAYER: SHADBALA
  const weakest = context.shadabalaAnalysis.weakestPlanet;
  const weakestData = context.shadabala.find(s => s.planet === weakest);
  if (weakestData && config.karakas.includes(weakest)) {
    signals.push({
      id: `SHADBALA_WEAK_${weakest}`,
      domain,
      layer: 'SHADBALA',
      category: 'obstruction',
      polarity: 'negative',
      magnitude: Math.max(0, 1 - weakestData.shadabalaRatio),
      reliability: 0.9,
      timingApplicability: 1.0,
      description: `${weakest}, a karaka for ${domain}, is the weakest planet (${weakestData.totalRupas.toFixed(2)} rupas).`,
    });
  }

  // LAYER: ARUDHA
  if (context.jaiminiAnalysis.padaLagna) {
    // Basic AL distance logic
    const distance =
      ((context.jaiminiAnalysis.padaLagna.rashiIndex - context.lagnaRashiIdx + 12) % 12) + 1;
    if (distance === 10 || distance === 11) {
      signals.push({
        id: `ARUDHA_STRONG`,
        domain,
        layer: 'ARUDHA',
        category: 'visibility',
        polarity: 'positive',
        magnitude: 0.8,
        reliability: 0.8,
        timingApplicability: 1.0,
        description: `AL in ${distance}th house projects strong public visibility and authority.`,
      });
    }
  }

  return signals;
}

// Helper: Calculate house lord based on lagna and house number
function getHouseLord(houseNum: number, lagnaRashiIdx: number): string {
  const rashiIdx = (lagnaRashiIdx + houseNum - 1) % 12;
  const RASHI_LORDS: string[] = [
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
  return RASHI_LORDS[rashiIdx];
}
