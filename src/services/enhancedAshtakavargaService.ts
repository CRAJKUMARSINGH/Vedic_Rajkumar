/**
 * Enhanced Ashtakavarga Service
 * Phase 2 Week 33: Advanced Features
 * Implements comprehensive Ashtakavarga system with transit analysis
 */

export interface AshtakavargaChart {
  planet: string;
  name: string;
  symbol: string;
  chart: number[]; // 12 houses, each with 0-8 points
  totalPoints: number;
  interpretations: {
    strong: number[];
    weak: number[];
    average: number[];
    recommendations: string[];
  };
  transitAnalysis?: TransitAshtakavarga;
}

export interface TransitAshtakavarga {
  planet: string;
  transitChart: number[]; // Transit positions with Ashtakavarga points
  originalChart: number[]; // Original birth chart Ashtakavarga
  combinedChart: number[]; // Combined transit + original
  predictions: {
    favorable: string[];
    unfavorable: string[];
    neutral: string[];
  };
  timing: {
    startDate: Date;
    endDate: Date;
    peakPeriods: Array<{
      date: Date;
      strength: number;
      description: string;
    }>;
  };
  remedies: string[];
}

export interface Sarvashtakavarga {
  chart: number[]; // 12 houses with total points
  totalPoints: number;
  averagePoints: number;
  interpretations: {
    excellent: number[]; // 30+ points
    good: number[]; // 25-29 points
    average: number[]; // 20-24 points
    poor: number[]; // below 20 points
  };
  predictions: {
    overall: string;
    houses: Record<number, string>;
  };
  remedies: string[];
}

export interface AshtakavargaAnalysis {
  sarvashtakavarga: Sarvashtakavarga;
  planetCharts: AshtakavargaChart[];
  transitAnalysis: TransitAshtakavarga[];
  predictions: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    timing: string[];
    remedies: string[];
  };
  recommendations: {
    general: string[];
    specific: Record<string, string[]>;
  };
}

export interface AshtakavargaParams {
  birthDate: Date;
  birthTime: string;
  birthLocation: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  ayanamsa: number;
  system: 'parashara' | 'jaimini' | 'kp';
  includeTransit?: boolean;
  transitDate?: Date;
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  house: number;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  isRetrograde: boolean;
}

export class EnhancedAshtakavargaService {
  private readonly planetNames = {
    sun: 'Sun',
    moon: 'Moon',
    mars: 'Mars',
    mercury: 'Mercury',
    jupiter: 'Jupiter',
    venus: 'Venus',
    saturn: 'Saturn'
  };

  private readonly planetSymbols = {
    sun: '☉',
    moon: '☽',
    mars: '♂',
    mercury: '☿',
    jupiter: '♃',
    venus: '♀',
    saturn: '♄'
  };

  private readonly beneficPlanets = ['jupiter', 'venus'];
  private readonly maleficPlanets = ['mars', 'saturn', 'sun', 'moon'];

  /**
   * Calculate complete Ashtakavarga system
   */
  async calculateAshtakavarga(params: AshtakavargaParams): Promise<AshtakavargaAnalysis> {
    // Get planetary positions
    const planetaryPositions = await this.calculatePlanetaryPositions(params);
    
    // Calculate individual planet Ashtakavarga charts
    const planetCharts = await this.calculatePlanetCharts(planetaryPositions);
    
    // Calculate Sarvashtakavarga
    const sarvashtakavarga = this.calculateSarvashtakavarga(planetCharts);
    
    // Calculate transit analysis if requested
    let transitAnalysis: TransitAshtakavarga[] = [];
    if (params.includeTransit && params.transitDate) {
      transitAnalysis = await this.calculateTransitAnalysis(
        planetaryPositions,
        params.transitDate,
        planetCharts
      );
    }
    
    // Generate predictions and recommendations
    const predictions = this.generatePredictions(sarvashtakavarga, planetCharts, transitAnalysis);
    const recommendations = this.generateRecommendations(sarvashtakavarga, planetCharts);
    
    return {
      sarvashtakavarga,
      planetCharts,
      transitAnalysis,
      predictions,
      recommendations
    };
  }

  /**
   * Calculate planetary positions
   */
  private async calculatePlanetaryPositions(params: AshtakavargaParams): Promise<PlanetPosition[]> {
    // Mock calculation - in production, use Swiss Ephemeris
    return [
      {
        planet: 'sun',
        longitude: 95.5,
        house: 4,
        sign: 'Cancer',
        degree: 5.5,
        nakshatra: 'Punarvasu',
        pada: 2,
        isRetrograde: false
      },
      {
        planet: 'moon',
        longitude: 185.5,
        house: 7,
        sign: 'Libra',
        degree: 5.5,
        nakshatra: 'Swati',
        pada: 3,
        isRetrograde: false
      },
      {
        planet: 'mars',
        longitude: 45.5,
        house: 2,
        sign: 'Taurus',
        degree: 15.5,
        nakshatra: 'Krittika',
        pada: 3,
        isRetrograde: false
      },
      {
        planet: 'mercury',
        longitude: 125.5,
        house: 5,
        sign: 'Leo',
        degree: 5.5,
        nakshatra: 'Purva Phalguni',
        pada: 1,
        isRetrograde: false
      },
      {
        planet: 'jupiter',
        longitude: 235.5,
        house: 9,
        sign: 'Scorpio',
        degree: 15.5,
        nakshatra: 'Anuradha',
        pada: 2,
        isRetrograde: false
      },
      {
        planet: 'venus',
        longitude: 305.5,
        house: 11,
        sign: 'Aquarius',
        degree: 5.5,
        nakshatra: 'Dhanishta',
        pada: 3,
        isRetrograde: false
      },
      {
        planet: 'saturn',
        longitude: 15.5,
        house: 1,
        sign: 'Aries',
        degree: 15.5,
        nakshatra: 'Ashwini',
        pada: 1,
        isRetrograde: false
      }
    ];
  }

  /**
   * Calculate individual planet Ashtakavarga charts
   */
  private async calculatePlanetCharts(planetaryPositions: PlanetPosition[]): Promise<AshtakavargaChart[]> {
    const charts: AshtakavargaChart[] = [];
    
    for (const planet of planetaryPositions) {
      const chart = this.calculatePlanetAshtakavarga(planet, planetaryPositions);
      charts.push(chart);
    }
    
    return charts;
  }

  /**
   * Calculate individual planet Ashtakavarga
   */
  private calculatePlanetAshtakavarga(planet: PlanetPosition, allPositions: PlanetPosition[]): AshtakavargaChart {
    const chart = new Array(12).fill(0);
    
    // Calculate Ashtakavarga points for each house
    for (let house = 0; house < 12; house++) {
      chart[house] = this.calculateHousePoints(planet, house, allPositions);
    }
    
    const totalPoints = chart.reduce((sum, points) => sum + points, 0);
    const interpretations = this.interpretPlanetChart(chart);
    
    return {
      planet: planet.planet,
      name: this.planetNames[planet.planet as keyof typeof this.planetNames],
      symbol: this.planetSymbols[planet.planet as keyof typeof this.planetSymbols],
      chart,
      totalPoints,
      interpretations
    };
  }

  /**
   * Calculate points for a specific house
   */
  private calculateHousePoints(planet: PlanetPosition, house: number, allPositions: PlanetPosition[]): number {
    let points = 0;
    
    // Calculate points based on positions of all 7 planets (including the planet itself)
    for (const otherPlanet of allPositions) {
      const contribution = this.calculatePlanetContribution(planet, otherPlanet, house);
      points += contribution;
    }
    
    return Math.min(8, Math.max(0, points));
  }

  /**
   * Calculate contribution of a planet to a house
   */
  private calculatePlanetContribution(planet: PlanetPosition, otherPlanet: PlanetPosition, house: number): number {
    // This is a simplified calculation - in production, use traditional Ashtakavarga rules
    const planetHouse = otherPlanet.house;
    const targetHouse = house;
    
    // Basic rules for contribution
    if (this.isBenefic(otherPlanet.planet)) {
      // Benefic planets contribute more points
      if (this.isFavorablePosition(planetHouse, targetHouse)) {
        return 1;
      }
    } else if (this.isMalefic(otherPlanet.planet)) {
      // Malefic planets contribute fewer points
      if (this.isUnfavorablePosition(planetHouse, targetHouse)) {
        return 0;
      } else {
        return 1;
      }
    }
    
    return 1; // Default contribution
  }

  /**
   * Check if planet is benefic
   */
  private isBenefic(planet: string): boolean {
    return this.beneficPlanets.includes(planet);
  }

  /**
   * Check if planet is malefic
   */
  private isMalefic(planet: string): boolean {
    return this.maleficPlanets.includes(planet);
  }

  /**
   * Check if position is favorable
   */
  private isFavorablePosition(fromHouse: number, toHouse: number): boolean {
    // Simplified rules for favorable positions
    const favorablePairs: Record<number, number[]> = {
      0: [1, 3, 5, 7, 9, 11], // From house 1
      1: [2, 4, 6, 8, 10, 12], // From house 2
      2: [3, 5, 7, 9, 11, 1], // From house 3
      3: [4, 6, 8, 10, 12, 2], // From house 4
      4: [5, 7, 9, 11, 1, 3], // From house 5
      5: [6, 8, 10, 12, 2, 4], // From house 6
      6: [7, 9, 11, 1, 3, 5], // From house 7
      7: [8, 10, 12, 2, 4, 6], // From house 8
      8: [9, 11, 1, 3, 5, 7], // From house 9
      9: [10, 12, 2, 4, 6, 8], // From house 10
      10: [11, 1, 3, 5, 7, 9], // From house 11
      11: [12, 2, 4, 6, 8, 10] // From house 12
    };
    
    return favorablePairs[fromHouse]?.includes(toHouse + 1) || false;
  }

  /**
   * Check if position is unfavorable
   */
  private isUnfavorablePosition(fromHouse: number, toHouse: number): boolean {
    // Simplified rules for unfavorable positions
    const unfavorablePairs: Record<number, number[]> = {
      0: [6, 8, 12], // From house 1
      1: [7, 9, 1], // From house 2
      2: [8, 10, 2], // From house 3
      3: [9, 11, 3], // From house 4
      4: [10, 12, 4], // From house 5
      5: [11, 1, 5], // From house 6
      6: [12, 2, 6], // From house 7
      7: [1, 3, 7], // From house 8
      8: [2, 4, 8], // From house 9
      9: [3, 5, 9], // From house 10
      10: [4, 6, 10], // From house 11
      11: [5, 7, 11] // From house 12
    };
    
    return unfavorablePairs[fromHouse]?.includes(toHouse + 1) || false;
  }

  /**
   * Interpret planet chart
   */
  private interpretPlanetChart(chart: number[]): AshtakavargaChart['interpretations'] {
    const strong = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points >= 6)
      .map(item => item.house);
    
    const weak = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points <= 2)
      .map(item => item.house);
    
    const average = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points >= 3 && item.points <= 5)
      .map(item => item.house);
    
    const recommendations = this.generatePlanetRecommendations(chart);
    
    return {
      strong,
      weak,
      average,
      recommendations
    };
  }

  /**
   * Generate planet-specific recommendations
   */
  private generatePlanetRecommendations(chart: number[]): string[] {
    const recommendations: string[] = [];
    const totalPoints = chart.reduce((sum, points) => sum + points, 0);
    
    if (totalPoints >= 50) {
      recommendations.push('This planet is very strong and will bring excellent results');
    } else if (totalPoints >= 40) {
      recommendations.push('This planet is strong and will bring good results');
    } else if (totalPoints >= 30) {
      recommendations.push('This planet has average strength and will bring mixed results');
    } else {
      recommendations.push('This planet is weak and may require remedies for better results');
    }
    
    return recommendations;
  }

  /**
   * Calculate Sarvashtakavarga
   */
  private calculateSarvashtakavarga(planetCharts: AshtakavargaChart[]): Sarvashtakavarga {
    const chart = new Array(12).fill(0);
    
    // Sum up points from all planet charts
    for (const planetChart of planetCharts) {
      for (let house = 0; house < 12; house++) {
        chart[house] += planetChart.chart[house];
      }
    }
    
    const totalPoints = chart.reduce((sum, points) => sum + points, 0);
    const averagePoints = totalPoints / 12;
    const interpretations = this.interpretSarvashtakavarga(chart);
    const predictions = this.generateSarvashtakavargaPredictions(chart);
    const remedies = this.generateSarvashtakavargaRemedies(chart);
    
    return {
      chart,
      totalPoints,
      averagePoints,
      interpretations,
      predictions,
      remedies
    };
  }

  /**
   * Interpret Sarvashtakavarga
   */
  private interpretSarvashtakavarga(chart: number[]): Sarvashtakavarga['interpretations'] {
    const excellent = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points >= 30)
      .map(item => item.house);
    
    const good = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points >= 25 && item.points <= 29)
      .map(item => item.house);
    
    const average = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points >= 20 && item.points <= 24)
      .map(item => item.house);
    
    const poor = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points < 20)
      .map(item => item.house);
    
    return {
      excellent,
      good,
      average,
      poor
    };
  }

  /**
   * Generate Sarvashtakavarga predictions
   */
  private generateSarvashtakavargaPredictions(chart: number[]): Sarvashtakavarga['predictions'] {
    const housePredictions: Record<number, string> = {};
    
    for (let house = 0; house < 12; house++) {
      const points = chart[house];
      housePredictions[house + 1] = this.getHousePrediction(house + 1, points);
    }
    
    const overall = this.getOverallPrediction(chart);
    
    return {
      overall,
      houses: housePredictions
    };
  }

  /**
   * Get house prediction based on points
   */
  private getHousePrediction(house: number, points: number): string {
    const houseNames = [
      'Self', 'Wealth', 'Siblings', 'Home', 'Children', 'Enemies',
      'Spouse', 'Death', 'Fortune', 'Career', 'Gains', 'Losses'
    ];
    
    const houseName = houseNames[house - 1];
    
    if (points >= 30) {
      return `Excellent results for ${houseName} - very strong and favorable`;
    } else if (points >= 25) {
      return `Good results for ${houseName} - strong and beneficial`;
    } else if (points >= 20) {
      return `Average results for ${houseName} - mixed outcomes possible`;
    } else {
      return `Challenging results for ${houseName} - remedies recommended`;
    }
  }

  /**
   * Get overall prediction
   */
  private getOverallPrediction(chart: number[]): string {
    const totalPoints = chart.reduce((sum, points) => sum + points, 0);
    const averagePoints = totalPoints / 12;
    
    if (averagePoints >= 25) {
      return 'Overall chart strength is excellent - life will be generally favorable with many opportunities';
    } else if (averagePoints >= 22) {
      return 'Overall chart strength is good - life will be generally positive with some challenges';
    } else if (averagePoints >= 19) {
      return 'Overall chart strength is average - life will have mixed results requiring effort';
    } else {
      return 'Overall chart strength is weak - life may have challenges requiring remedies';
    }
  }

  /**
   * Generate Sarvashtakavarga remedies
   */
  private generateSarvashtakavargaRemedies(chart: number[]): string[] {
    const remedies: string[] = [];
    const weakHouses = chart.map((points, index) => ({ house: index + 1, points }))
      .filter(item => item.points < 20);
    
    if (weakHouses.length > 0) {
      remedies.push('Strengthen weak houses through appropriate remedies');
      remedies.push('Perform charity related to weak house significations');
      remedies.push('Chant mantras for ruling planets of weak houses');
    }
    
    remedies.push('Regular spiritual practices for overall chart strength');
    remedies.push('Maintain positive lifestyle and habits');
    
    return remedies;
  }

  /**
   * Calculate transit analysis
   */
  private async calculateTransitAnalysis(
    birthPositions: PlanetPosition[],
    transitDate: Date,
    planetCharts: AshtakavargaChart[]
  ): Promise<TransitAshtakavarga[]> {
    const transitAnalysis: TransitAshtakavarga[] = [];
    
    // Get transit positions
    const transitPositions = await this.calculateTransitPositions(transitDate);
    
    for (const transitPlanet of transitPositions) {
      const originalChart = planetCharts.find(p => p.planet === transitPlanet.planet);
      if (originalChart) {
        const analysis = this.calculateTransitForPlanet(
          transitPlanet,
          originalChart,
          birthPositions
        );
        transitAnalysis.push(analysis);
      }
    }
    
    return transitAnalysis;
  }

  /**
   * Calculate transit positions
   */
  private async calculateTransitPositions(transitDate: Date): Promise<PlanetPosition[]> {
    // Mock transit calculation - in production, use Swiss Ephemeris
    return [
      {
        planet: 'jupiter',
        longitude: 165.5,
        house: 6,
        sign: 'Virgo',
        degree: 15.5,
        nakshatra: 'Hasta',
        pada: 2,
        isRetrograde: false
      },
      {
        planet: 'saturn',
        longitude: 285.5,
        house: 10,
        sign: 'Capricorn',
        degree: 15.5,
        nakshatra: 'Uttara Ashadha',
        pada: 3,
        isRetrograde: false
      }
    ];
  }

  /**
   * Calculate transit analysis for a specific planet
   */
  private calculateTransitForPlanet(
    transitPlanet: PlanetPosition,
    originalChart: AshtakavargaChart,
    birthPositions: PlanetPosition[]
  ): TransitAshtakavarga {
    const transitChart = this.calculateTransitChart(transitPlanet, birthPositions);
    const combinedChart = originalChart.chart.map((original, index) => 
      Math.min(8, original + transitChart[index])
    );
    
    const predictions = this.generateTransitPredictions(transitChart, combinedChart);
    const timing = this.generateTransitTiming(transitPlanet, combinedChart);
    const remedies = this.generateTransitRemedies(transitPlanet, combinedChart);
    
    return {
      planet: transitPlanet.planet,
      transitChart,
      originalChart: originalChart.chart,
      combinedChart,
      predictions,
      timing,
      remedies
    };
  }

  /**
   * Calculate transit chart
   */
  private calculateTransitChart(transitPlanet: PlanetPosition, birthPositions: PlanetPosition[]): number[] {
    const chart = new Array(12).fill(0);
    
    // Calculate transit Ashtakavarga points
    for (let house = 0; house < 12; house++) {
      chart[house] = this.calculateTransitHousePoints(transitPlanet, house, birthPositions);
    }
    
    return chart;
  }

  /**
   * Calculate transit house points
   */
  private calculateTransitHousePoints(transitPlanet: PlanetPosition, house: number, birthPositions: PlanetPosition[]): number {
    // Simplified transit calculation
    const isBenefic = this.isBenefic(transitPlanet.planet);
    const transitHouse = transitPlanet.house;
    
    if (isBenefic) {
      // Benefic planets in good positions add points
      if (this.isFavorableTransitPosition(transitHouse, house)) {
        return 2;
      } else {
        return 1;
      }
    } else {
      // Malefic planets in good positions add fewer points
      if (this.isFavorableTransitPosition(transitHouse, house)) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  /**
   * Check if transit position is favorable
   */
  private isFavorableTransitPosition(fromHouse: number, toHouse: number): boolean {
    // Simplified transit rules
    return Math.abs(fromHouse - toHouse) <= 3 || Math.abs(fromHouse - toHouse) >= 9;
  }

  /**
   * Generate transit predictions
   */
  private generateTransitPredictions(transitChart: number[], combinedChart: number[]): TransitAshtakavarga['predictions'] {
    const favorable: string[] = [];
    const unfavorable: string[] = [];
    const neutral: string[] = [];
    
    for (let house = 0; house < 12; house++) {
      const transitPoints = transitChart[house];
      const combinedPoints = combinedChart[house];
      
      if (combinedPoints >= 7) {
        favorable.push(`House ${house + 1} will have excellent results during transit`);
      } else if (combinedPoints <= 3) {
        unfavorable.push(`House ${house + 1} may face challenges during transit`);
      } else {
        neutral.push(`House ${house + 1} will have mixed results during transit`);
      }
    }
    
    return {
      favorable,
      unfavorable,
      neutral
    };
  }

  /**
   * Generate transit timing
   */
  private generateTransitTiming(transitPlanet: PlanetPosition, combinedChart: number[]): TransitAshtakavarga['timing'] {
    const peakPeriods: Array<{
      date: Date;
      strength: number;
      description: string;
    }> = [];
    
    // Find peak periods based on combined chart strength
    for (let house = 0; house < 12; house++) {
      if (combinedChart[house] >= 7) {
        peakPeriods.push({
          date: new Date(Date.now() + house * 30 * 24 * 60 * 60 * 1000), // Mock timing
          strength: combinedChart[house],
          description: `Peak influence on House ${house + 1}`
        });
      }
    }
    
    return {
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year transit
      peakPeriods
    };
  }

  /**
   * Generate transit remedies
   */
  private generateTransitRemedies(transitPlanet: PlanetPosition, combinedChart: number[]): string[] {
    const remedies: string[] = [];
    
    remedies.push(`Chant ${transitPlanet.planet} mantra during transit`);
    remedies.push(`Perform charity related to ${transitPlanet.planet} significations`);
    remedies.push(`Wear gemstone for ${transitPlanet.planet} if recommended`);
    
    return remedies;
  }

  /**
   * Generate overall predictions
   */
  private generatePredictions(
    sarvashtakavarga: Sarvashtakavarga,
    planetCharts: AshtakavargaChart[],
    transitAnalysis: TransitAshtakavarga[]
  ): AshtakavargaAnalysis['predictions'] {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const timing: string[] = [];
    const remedies: string[] = [];
    
    // Analyze strengths
    if (sarvashtakavarga.totalPoints >= 250) {
      strengths.push('Overall chart strength is excellent');
    }
    
    sarvashtakavarga.interpretations.excellent.forEach(house => {
      strengths.push(`House ${house} is very strong`);
    });
    
    // Analyze weaknesses
    if (sarvashtakavarga.totalPoints <= 200) {
      weaknesses.push('Overall chart strength needs improvement');
    }
    
    sarvashtakavarga.interpretations.poor.forEach(house => {
      weaknesses.push(`House ${house} is weak and needs attention`);
    });
    
    // Generate timing predictions
    if (transitAnalysis.length > 0) {
      timing.push('Current transits will activate chart potentials');
      transitAnalysis.forEach(transit => {
        if (transit.predictions.favorable.length > 0) {
          timing.push(`${transit.planet} transit brings favorable opportunities`);
        }
      });
    }
    
    // Generate remedies
    remedies.push(...sarvashtakavarga.remedies);
    
    const overall = this.getOverallPrediction(sarvashtakavarga.chart);
    
    return {
      overall,
      strengths,
      weaknesses,
      timing,
      remedies
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    sarvashtakavarga: Sarvashtakavarga,
    planetCharts: AshtakavargaChart[]
  ): AshtakavargaAnalysis['recommendations'] {
    const general: string[] = [];
    const specific: Record<string, string[]> = {};
    
    // General recommendations
    general.push('Focus on strengthening weak houses through appropriate remedies');
    general.push('Utilize strong periods for important decisions and actions');
    general.push('Maintain spiritual practices for overall chart improvement');
    
    // Specific recommendations for each planet
    planetCharts.forEach(chart => {
      specific[chart.planet] = [...chart.interpretations.recommendations];
    });
    
    return {
      general,
      specific
    };
  }
}

// Export singleton instance
export const enhancedAshtakavargaService = new EnhancedAshtakavargaService();
