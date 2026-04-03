/**
 * Vipreet Vedha (Reverse Obstruction) Service
 * Source: BV Raman Magazine Enhancement Plan
 * Implements reverse obstruction logic where malefic obstructs malefic
 */

export interface VedhaResult {
  planet: string;
  house: number;
  isVedha: boolean;
  isVipreetVedha: boolean;
  obstructionCancelled: boolean;
  effect: 'favorable' | 'unfavorable' | 'neutral';
  description: {
    en: string;
    hi: string;
  };
}

export interface VipreetVedhaPair {
  maleficPlanet: string;
  obstructingPlanet: string;
  obstructionHouse: number;
  description: {
    en: string;
    hi: string;
  };
}

// Malefic planets in Vedic astrology
const MALEFICS = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

// Vipreet Vedha pairs - malefic obstructs malefic scenarios
const VIPREET_VEDHA_PAIRS: VipreetVedhaPair[] = [
  {
    maleficPlanet: 'Saturn',
    obstructingPlanet: 'Mars',
    obstructionHouse: 3,
    description: {
      en: 'Saturn in 3rd house obstructed by Mars - obstruction cancelled',
      hi: 'शनि तीसरे भाव में, मंगल द्वारा अवरोधित - अवरोध निरस्त'
    }
  },
  {
    maleficPlanet: 'Saturn',
    obstructingPlanet: 'Rahu',
    obstructionHouse: 5,
    description: {
      en: 'Saturn in 5th house obstructed by Rahu - obstruction cancelled',
      hi: 'शनि पांचवें भाव में, राहु द्वारा अवरोधित - अवरोध निरस्त'
    }
  },
  {
    maleficPlanet: 'Mars',
    obstructingPlanet: 'Saturn',
    obstructionHouse: 8,
    description: {
      en: 'Mars in 8th house obstructed by Saturn - obstruction cancelled',
      hi: 'मंगल आठवें भाव में, शनि द्वारा अवरोधित - अवरोध निरस्त'
    }
  },
  {
    maleficPlanet: 'Mars',
    obstructingPlanet: 'Ketu',
    obstructionHouse: 12,
    description: {
      en: 'Mars in 12th house obstructed by Ketu - obstruction cancelled',
      hi: 'मंगल बारहवें भाव में, केतु द्वारा अवरोधित - अवरोध निरस्त'
    }
  },
  {
    maleficPlanet: 'Rahu',
    obstructingPlanet: 'Saturn',
    obstructionHouse: 9,
    description: {
      en: 'Rahu in 9th house obstructed by Saturn - obstruction cancelled',
      hi: 'राहु नौवें भाव में, शनि द्वारा अवरोधित - अवरोध निरस्त'
    }
  },
  {
    maleficPlanet: 'Ketu',
    obstructingPlanet: 'Mars',
    obstructionHouse: 4,
    description: {
      en: 'Ketu in 4th house obstructed by Mars - obstruction cancelled',
      hi: 'केतु चौथे भाव में, मंगल द्वारा अवरोधित - अवरोध निरस्त'
    }
  }
];

// Classical Vedha houses (from BPHS)
const VEDHA_HOUSES: Record<number, number> = {
  1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12,
  7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6
};

// Favorable houses for transits
const FAVORABLE_HOUSES = [1, 3, 6, 10, 11];

/**
 * Check if a planet is malefic
 */
export function isMalefic(planet: string): boolean {
  return MALEFICS.includes(planet);
}

/**
 * Check if there's a classical Vedha (obstruction)
 */
export function checkClassicalVedha(transitHouse: number, moonHouse: number): boolean {
  const moonRashi = moonHouse;
  const transitFromMoon = ((transitHouse - moonRashi + 12) % 12) + 1;
  const vedhaHouse = VEDHA_HOUSES[transitFromMoon];
  return vedhaHouse !== undefined;
}

/**
 * Check if there's a Vipreet Vedha (reverse obstruction)
 * This occurs when a malefic planet obstructs another malefic planet
 */
export function checkVipreetVedha(
  transitPlanet: string,
  obstructingPlanet: string,
  transitHouse: number
): boolean {
  // Both planets must be malefic
  if (!isMalefic(transitPlanet) || !isMalefic(obstructingPlanet)) {
    return false;
  }

  // Check if this is a known Vipreet Vedha pair
  const pair = VIPREET_VEDHA_PAIRS.find(
    p => p.maleficPlanet === transitPlanet && 
         p.obstructingPlanet === obstructingPlanet &&
         p.obstructionHouse === transitHouse
  );

  return pair !== undefined;
}

/**
 * Get Vipreet Vedha description
 */
export function getVipreetVedhaDescription(
  transitPlanet: string,
  obstructingPlanet: string,
  transitHouse: number
): { en: string; hi: string } | null {
  const pair = VIPREET_VEDHA_PAIRS.find(
    p => p.maleficPlanet === transitPlanet && 
         p.obstructingPlanet === obstructingPlanet &&
         p.obstructionHouse === transitHouse
  );

  return pair ? pair.description : null;
}

/**
 * Calculate complete Vedha analysis including Vipreet Vedha
 */
export function calculateVedhaAnalysis(
  transitingPlanets: { planet: string; house: number }[],
  moonHouse: number,
  obstructingPlanets?: { planet: string; house: number }[]
): VedhaResult[] {
  const results: VedhaResult[] = [];

  for (const transit of transitingPlanets) {
    const transitFromMoon = ((transit.house - moonHouse + 12) % 12) + 1;
    const isFavorable = FAVORABLE_HOUSES.includes(transitFromMoon);
    const hasClassicalVedha = checkClassicalVedha(transit.house, moonHouse);
    
    // Check for Vipreet Vedha
    let isVipreetVedha = false;
    let obstructionCancelled = false;
    let vipreetDescription: { en: string; hi: string } | null = null;

    if (obstructingPlanets) {
      for (const obstructing of obstructingPlanets) {
        if (checkVipreetVedha(transit.planet, obstructing.planet, transit.house)) {
          isVipreetVedha = true;
          obstructionCancelled = true;
          vipreetDescription = getVipreetVedhaDescription(
            transit.planet,
            obstructing.planet,
            transit.house
          );
          break;
        }
      }
    }

    // Determine final effect
    let effect: 'favorable' | 'unfavorable' | 'neutral';
    let description: { en: string; hi: string };

    if (obstructionCancelled) {
      effect = 'favorable'; // Vipreet Vedha cancels the obstruction
      description = vipreetDescription || {
        en: `${transit.planet} obstruction cancelled by Vipreet Vedha`,
        hi: `${transit.planet} अवरोध विपरीत वेध द्वारा निरस्त`
      };
    } else if (hasClassicalVedha && isFavorable) {
      effect = 'unfavorable'; // Classical Vedha blocks favorable result
      description = {
        en: `${transit.planet} favorable effect blocked by Vedha`,
        hi: `${transit.planet} अनुकूल प्रभाव वेध द्वारा अवरुद्ध`
      };
    } else if (isFavorable) {
      effect = 'favorable';
      description = {
        en: `${transit.planet} gives favorable results in house ${transit.house}`,
        hi: `${transit.planet} भाव ${transit.house} में अनुकूल परिणाम देता है`
      };
    } else {
      effect = 'neutral';
      description = {
        en: `${transit.planet} gives neutral results in house ${transit.house}`,
        hi: `${transit.planet} भाव ${transit.house} में तटस्थ परिणाम देता है`
      };
    }

    results.push({
      planet: transit.planet,
      house: transit.house,
      isVedha: hasClassicalVedha,
      isVipreetVedha,
      obstructionCancelled,
      effect,
      description
    });
  }

  return results;
}

/**
 * Get Vipreet Vedha summary
 */
export function getVipreetVedhaSummary(results: VedhaResult[]): {
  totalObstructions: number;
  cancelledObstructions: number;
  netEffect: 'positive' | 'negative' | 'neutral';
  summary: {
    en: string;
    hi: string;
  };
} {
  const totalObstructions = results.filter(r => r.isVedha).length;
  const cancelledObstructions = results.filter(r => r.obstructionCancelled).length;
  
  let netEffect: 'positive' | 'negative' | 'neutral';
  let summary: { en: string; hi: string };

  if (cancelledObstructions > totalObstructions / 2) {
    netEffect = 'positive';
    summary = {
      en: `Vipreet Vedha cancels ${cancelledObstructions} of ${totalObstructions} obstructions - net positive effect`,
      hi: `विपरीत वेध ${totalObstructions} में से ${cancelledObstructions} अवरोध रद्द करता है - शुद्ध सकारात्मक प्रभाव`
    };
  } else if (cancelledObstructions === 0) {
    netEffect = 'negative';
    summary = {
      en: `${totalObstructions} obstructions active - no Vipreet Vedha relief`,
      hi: `${totalObstructions} अवरोध सक्रिय - कोई विपरीत वेध राहत नहीं`
    };
  } else {
    netEffect = 'neutral';
    summary = {
      en: `${cancelledObstructions} of ${totalObstructions} obstructions cancelled - mixed effect`,
      hi: `${totalObstructions} में से ${cancelledObstructions} अवरोध रद्द - मिश्रित प्रभाव`
    };
  }

  return {
    totalObstructions,
    cancelledObstructions,
    netEffect,
    summary
  };
}
