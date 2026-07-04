/**
 * Vimshottari Dasha Service
 * Phase 2 Week 31: Advanced Features
 * Implements comprehensive Vimshottari Dasha calculation system
 */

export interface DashaPeriod {
  id: string;
  name: string;
  planet: 'ketu' | 'venus' | 'sun' | 'moon' | 'mars' | 'rahu' | 'jupiter' | 'saturn' | 'mercury';
  startDate: Date;
  endDate: Date;
  duration: number; // in years
  order: number;
  level: number; // 1 for Maha Dasha, 2 for Antardasha, 3 for Pratyantardasha
  parentPeriod?: string;
  isRetrograde: boolean;
  isCombust: boolean;
  house: number;
  sign: string;
  nakshatra: string;
  pada: number;
  strength: number; // 0-100
  predictions: string[];
  remedies: string[];
  favorableFor: string[];
  unfavorableFor: string[];
}

export interface DashaAnalysis {
  currentDasha: DashaPeriod;
  currentAntardasha: DashaPeriod;
  currentPratyantardasha?: DashaPeriod;
  upcomingPeriods: DashaPeriod[];
  mahaDashaSequence: DashaPeriod[];
  antardashaSequence: DashaPeriod[];
  predictions: {
    overall: string;
    career: string;
    finance: string;
    health: string;
    relationships: string;
    education: string;
    spiritual: string;
  };
  remedies: {
    general: string[];
    specific: Record<string, string[]>;
    gemstones: Record<string, string>;
    mantras: Record<string, string>;
    fasting: Record<string, string>;
    charity: Record<string, string>;
  };
  keyDates: {
    startDate: Date;
    endDate: Date;
    criticalDates: Array<{
      date: Date;
      event: string;
      impact: 'positive' | 'negative' | 'neutral';
      description: string;
    }>;
  };
}

export interface DashaCalculationParams {
  birthDate: Date;
  birthTime: string;
  birthLocation: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  moonNakshatra: {
    name: string;
    pada: number;
    lord: string;
    degree: number;
  };
  ayanamsa: number;
  system: 'vimshottari' | 'ashtottari' | 'yogini' | 'kalachakra';
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  house: number;
  sign: string;
  nakshatra: string;
  pada: number;
  isRetrograde: boolean;
  isCombust: boolean;
  strength: number;
  dignity: 'exalted' | 'moolatrikona' | 'own' | 'friendly' | 'neutral' | 'enemy' | 'debilitated';
  aspects: string[];
}

export class VimshottariDashaService {
  private readonly dashaPeriods = {
    ketu: 7,
    venus: 20,
    sun: 6,
    moon: 10,
    mars: 7,
    rahu: 18,
    jupiter: 16,
    saturn: 19,
    mercury: 17,
  };

  private readonly planetNames = {
    ketu: 'Ketu',
    venus: 'Venus',
    sun: 'Sun',
    moon: 'Moon',
    mars: 'Mars',
    rahu: 'Rahu',
    jupiter: 'Jupiter',
    saturn: 'Saturn',
    mercury: 'Mercury',
  };

  private readonly planetSymbols = {
    ketu: '☋',
    venus: '♀',
    sun: '☉',
    moon: '☽',
    mars: '♂',
    rahu: '☊',
    jupiter: '♃',
    saturn: '♄',
    mercury: '☿',
  };

  /**
   * Calculate complete Vimshottari Dasha system
   */
  async calculateDasha(params: DashaCalculationParams): Promise<DashaAnalysis> {
    const { birthDate, moonNakshatra, ayanamsa } = params;

    // Calculate Maha Dasha sequence
    const mahaDashaSequence = this.calculateMahaDashaSequence(birthDate, moonNakshatra, ayanamsa);

    // Calculate current period
    const now = new Date();
    const currentDasha = this.findCurrentPeriod(mahaDashaSequence, now);

    // Calculate Antardasha sequence for current Maha Dasha
    const antardashaSequence = this.calculateAntardashaSequence(currentDasha);
    const currentAntardasha = this.findCurrentPeriod(antardashaSequence, now);

    // Calculate Pratyantardasha if needed
    let currentPratyantardasha: DashaPeriod | undefined;
    if (currentAntardasha) {
      const pratyantardashaSequence = this.calculatePratyantardashaSequence(currentAntardasha);
      currentPratyantardasha = this.findCurrentPeriod(pratyantardashaSequence, now);
    }

    // Generate predictions and remedies
    const predictions = this.generatePredictions(
      currentDasha,
      currentAntardasha,
      currentPratyantardasha
    );
    const remedies = this.generateRemedies(currentDasha, currentAntardasha, currentPratyantardasha);

    // Calculate key dates
    const keyDates = this.calculateKeyDates(
      currentDasha,
      currentAntardasha,
      currentPratyantardasha
    );

    return {
      currentDasha,
      currentAntardasha,
      currentPratyantardasha,
      upcomingPeriods: this.getUpcomingPeriods(mahaDashaSequence, now, 5),
      mahaDashaSequence,
      antardashaSequence,
      predictions,
      remedies,
      keyDates,
    };
  }

  /**
   * Calculate Maha Dasha sequence
   */
  private calculateMahaDashaSequence(
    birthDate: Date,
    moonNakshatra: any,
    ayanamsa: number
  ): DashaPeriod[] {
    const sequence: DashaPeriod[] = [];
    const planets = this.getNakshatraLordSequence(moonNakshatra.lord);
    let currentDate = new Date(birthDate);

    // Calculate balance of dasha at birth
    const moonDegree = moonNakshatra.degree;
    const nakshatraSpan = 13.333; // 13 degrees 20 minutes
    const balancePercentage = (nakshatraSpan - moonDegree) / nakshatraSpan;

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      const duration = this.dashaPeriods[planet as keyof typeof this.dashaPeriods];

      let actualDuration = duration;
      if (i === 0) {
        // First period gets the balance
        actualDuration = duration * balancePercentage;
      }

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + actualDuration);

      const period: DashaPeriod = {
        id: `maha_${i}`,
        name: this.planetNames[planet as keyof typeof this.planetNames],
        planet: planet as any,
        startDate,
        endDate,
        duration: actualDuration,
        order: i,
        level: 1,
        isRetrograde: false,
        isCombust: false,
        house: 0, // Will be calculated based on birth chart
        sign: '',
        nakshatra: '',
        pada: 0,
        strength: 75,
        predictions: [],
        remedies: [],
        favorableFor: [],
        unfavorableFor: [],
      };

      sequence.push(period);
      currentDate = new Date(endDate);
    }

    return sequence;
  }

  /**
   * Calculate Antardasha sequence for a Maha Dasha period
   */
  public calculateAntardashaSequence(mahaDasha: DashaPeriod): DashaPeriod[] {
    const sequence: DashaPeriod[] = [];
    const planets = this.getNakshatraLordSequence(mahaDasha.planet);
    let currentDate = new Date(mahaDasha.startDate);

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      const mahaDuration = this.dashaPeriods[planet as keyof typeof this.dashaPeriods];
      const antarDuration = this.dashaPeriods[mahaDasha.planet as keyof typeof this.dashaPeriods];
      const actualDuration = (mahaDuration * antarDuration) / 120; // Total dasha years = 120

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + actualDuration);

      const period: DashaPeriod = {
        id: `antar_${mahaDasha.id}_${i}`,
        name: this.planetNames[planet as keyof typeof this.planetNames],
        planet: planet as any,
        startDate,
        endDate,
        duration: actualDuration,
        order: i,
        level: 2,
        parentPeriod: mahaDasha.id,
        isRetrograde: false,
        isCombust: false,
        house: 0,
        sign: '',
        nakshatra: '',
        pada: 0,
        strength: 75,
        predictions: [],
        remedies: [],
        favorableFor: [],
        unfavorableFor: [],
      };

      sequence.push(period);
      currentDate = new Date(endDate);
    }

    return sequence;
  }

  /**
   * Calculate Pratyantardasha sequence for an Antardasha period
   */
  public calculatePratyantardashaSequence(antardasha: DashaPeriod): DashaPeriod[] {
    const sequence: DashaPeriod[] = [];
    const planets = this.getNakshatraLordSequence(antardasha.planet);
    let currentDate = new Date(antardasha.startDate);

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      const antarDuration = antardasha.duration;
      const pratyantarDuration = this.dashaPeriods[planet as keyof typeof this.dashaPeriods];
      const actualDuration = (antarDuration * pratyantarDuration) / 120;

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + actualDuration);

      const period: DashaPeriod = {
        id: `pratyantar_${antardasha.id}_${i}`,
        name: this.planetNames[planet as keyof typeof this.planetNames],
        planet: planet as any,
        startDate,
        endDate,
        duration: actualDuration,
        order: i,
        level: 3,
        parentPeriod: antardasha.id,
        isRetrograde: false,
        isCombust: false,
        house: 0,
        sign: '',
        nakshatra: '',
        pada: 0,
        strength: 75,
        predictions: [],
        remedies: [],
        favorableFor: [],
        unfavorableFor: [],
      };

      sequence.push(period);
      currentDate = new Date(endDate);
    }

    return sequence;
  }

  /**
   * Find current dasha period
   */
  private findCurrentPeriod(periods: DashaPeriod[], date: Date): DashaPeriod {
    return periods.find(period => date >= period.startDate && date <= period.endDate) || periods[0];
  }

  /**
   * Get upcoming periods
   */
  private getUpcomingPeriods(
    periods: DashaPeriod[],
    currentDate: Date,
    count: number
  ): DashaPeriod[] {
    const upcoming: DashaPeriod[] = [];
    const startIndex = periods.findIndex(p => p.endDate > currentDate);

    for (let i = startIndex; i < Math.min(startIndex + count, periods.length); i++) {
      upcoming.push(periods[i]);
    }

    return upcoming;
  }

  /**
   * Get nakshatra lord sequence
   */
  private getNakshatraLordSequence(startingLord: string): string[] {
    const lords = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
    const startIndex = lords.indexOf(startingLord);

    if (startIndex === -1) return lords;

    const sequence = [...lords.slice(startIndex), ...lords.slice(0, startIndex)];
    return sequence;
  }

  /**
   * Generate predictions for current dasha periods
   */
  private generatePredictions(
    mahaDasha: DashaPeriod,
    antardasha: DashaPeriod,
    pratyantardasha?: DashaPeriod
  ): DashaAnalysis['predictions'] {
    const predictions = {
      overall: this.generateOverallPrediction(mahaDasha, antardasha, pratyantardasha),
      career: this.generateCareerPrediction(mahaDasha, antardasha, pratyantardasha),
      finance: this.generateFinancePrediction(mahaDasha, antardasha, pratyantardasha),
      health: this.generateHealthPrediction(mahaDasha, antardasha, pratyantardasha),
      relationships: this.generateRelationshipsPrediction(mahaDasha, antardasha, pratyantardasha),
      education: this.generateEducationPrediction(mahaDasha, antardasha, pratyantardasha),
      spiritual: this.generateSpiritualPrediction(mahaDasha, antardasha, pratyantardasha),
    };

    return predictions;
  }

  /**
   * Generate remedies for current dasha periods
   */
  private generateRemedies(
    mahaDasha: DashaPeriod,
    antardasha: DashaPeriod,
    pratyantardasha?: DashaPeriod
  ): DashaAnalysis['remedies'] {
    const remedies = {
      general: this.getGeneralRemedies(mahaDasha.planet, antardasha.planet),
      specific: {
        [mahaDasha.planet]: this.getSpecificRemedies(mahaDasha.planet),
        [antardasha.planet]: this.getSpecificRemedies(antardasha.planet),
        ...(pratyantardasha && {
          [pratyantardasha.planet]: this.getSpecificRemedies(pratyantardasha.planet),
        }),
      },
      gemstones: this.getGemstoneRemedies(mahaDasha.planet, antardasha.planet),
      mantras: this.getMantraRemedies(mahaDasha.planet, antardasha.planet),
      fasting: this.getFastingRemedies(mahaDasha.planet, antardasha.planet),
      charity: this.getCharityRemedies(mahaDasha.planet, antardasha.planet),
    };

    return remedies;
  }

  /**
   * Calculate key dates for dasha periods
   */
  private calculateKeyDates(
    mahaDasha: DashaPeriod,
    antardasha: DashaPeriod,
    pratyantardasha?: DashaPeriod
  ): DashaAnalysis['keyDates'] {
    const criticalDates = [
      {
        date: mahaDasha.startDate,
        event: `${mahaDasha.name} Maha Dasha Start`,
        impact: 'neutral' as const,
        description: `Beginning of ${mahaDasha.duration}-year ${mahaDasha.name} period`,
      },
      {
        date: mahaDasha.endDate,
        event: `${mahaDasha.name} Maha Dasha End`,
        impact: 'neutral' as const,
        description: `End of ${mahaDasha.name} major period`,
      },
      {
        date: antardasha.startDate,
        event: `${antardasha.name} Antardasha Start`,
        impact: 'neutral' as const,
        description: `Beginning of ${antardasha.name} sub-period`,
      },
      {
        date: antardasha.endDate,
        event: `${antardasha.name} Antardasha End`,
        impact: 'neutral' as const,
        description: `End of ${antardasha.name} sub-period`,
      },
    ];

    if (pratyantardasha) {
      criticalDates.push(
        {
          date: pratyantardasha.startDate,
          event: `${pratyantardasha.name} Pratyantardasha Start`,
          impact: 'neutral' as const,
          description: `Beginning of ${pratyantardasha.name} sub-sub-period`,
        },
        {
          date: pratyantardasha.endDate,
          event: `${pratyantardasha.name} Pratyantardasha End`,
          impact: 'neutral' as const,
          description: `End of ${pratyantardasha.name} sub-sub-period`,
        }
      );
    }

    return {
      startDate: mahaDasha.startDate,
      endDate: mahaDasha.endDate,
      criticalDates,
    };
  }

  // Helper methods for predictions
  private generateOverallPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    const mahaEffects = this.getPlanetEffects(maha.planet);
    const antarEffects = this.getPlanetEffects(antar.planet);
    const pratyantarEffects = pratyantar ? this.getPlanetEffects(pratyantar.planet) : '';

    return `During ${maha.name} Maha Dasha with ${antar.name} Antardasha${pratyantar ? ` and ${pratyantar.name} Pratyantardasha` : ''}, you will experience ${mahaEffects}. The influence of ${antar.name} will bring ${antarEffects}${pratyantarEffects ? `, while ${pratyantar.name} adds ${pratyantarEffects}` : ''}. This period requires careful attention to both opportunities and challenges.`;
  }

  private generateCareerPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    const careerKeywords = {
      sun: 'leadership, authority, government jobs, recognition',
      moon: 'public relations, hospitality, nursing, emotional intelligence',
      mars: 'engineering, military, sports, entrepreneurship',
      mercury: 'communication, teaching, writing, business',
      jupiter: 'teaching, law, finance, consulting',
      venus: 'arts, entertainment, luxury goods, relationships',
      saturn: 'hard work, discipline, long-term projects, administration',
      rahu: 'technology, innovation, foreign lands, unconventional careers',
      ketu: 'spirituality, research, healing, occult sciences',
    };

    return `Career opportunities in ${careerKeywords[maha.planet as keyof typeof careerKeywords]} will be prominent. ${antar.name} antardasha will favor ${careerKeywords[antar.planet as keyof typeof careerKeywords]}. Focus on developing skills related to these areas for maximum growth.`;
  }

  private generateFinancePrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    const financeKeywords = {
      sun: 'speculation, government schemes, gold',
      moon: 'liquid assets, emotional spending, home-related expenses',
      mars: 'risky investments, real estate, machinery',
      mercury: 'trading, communication business, multiple income streams',
      jupiter: 'investments, savings, property, education expenses',
      venus: 'luxury goods, entertainment, relationships expenses',
      saturn: 'long-term investments, debts, discipline in spending',
      rahu: 'unconventional investments, foreign markets, technology stocks',
      ketu: 'spiritual investments, charity, unexpected gains/losses',
    };

    return `Financial focus will be on ${financeKeywords[maha.planet as keyof typeof financeKeywords]}. ${antar.name} period will influence ${financeKeywords[antar.planet as keyof typeof financeKeywords]}. Maintain balance between savings and expenditures.`;
  }

  private generateHealthPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    const healthKeywords = {
      sun: 'heart, blood pressure, eyes, vitality',
      moon: 'stomach, mental health, fluids, hormones',
      mars: 'head, muscles, accidents, surgery',
      mercury: 'nervous system, respiratory, skin',
      jupiter: 'liver, digestion, weight, diabetes',
      venus: 'reproductive system, kidneys, beauty',
      saturn: 'bones, joints, chronic diseases, longevity',
      rahu: 'mental health, addiction, mysterious illnesses',
      ketu: 'spiritual health, past life karmas, healing',
    };

    return `Health attention needed for ${healthKeywords[maha.planet as keyof typeof healthKeywords]}. ${antar.name} may affect ${healthKeywords[antar.planet as keyof typeof healthKeywords]}. Regular health check-ups recommended.`;
  }

  private generateRelationshipsPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    return `Relationship dynamics will be influenced by ${maha.name}'s characteristics of ${this.getPlanetCharacteristics(maha.planet)}. ${antar.name} will bring ${this.getPlanetCharacteristics(antar.planet)} to interpersonal connections. Focus on communication and understanding.`;
  }

  private generateEducationPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    return `Educational pursuits will align with ${maha.name}'s influence on ${this.getPlanetCharacteristics(maha.planet)}. ${antar.name} period favors learning in areas related to ${this.getPlanetCharacteristics(antar.planet)}. This is an excellent time for intellectual growth.`;
  }

  private generateSpiritualPrediction(
    maha: DashaPeriod,
    antar: DashaPeriod,
    pratyantar?: DashaPeriod
  ): string {
    return `Spiritual growth will be enhanced by ${maha.name}'s energy. ${antar.name} will bring opportunities for ${this.getPlanetCharacteristics(antar.planet)} in your spiritual journey. Meditation and self-reflection will be particularly beneficial.`;
  }

  // Helper methods for remedies
  private getGeneralRemedies(planet1: string, planet2: string): string[] {
    return [
      `Regular worship of ${this.planetNames[planet1 as keyof typeof this.planetNames]} and ${this.planetNames[planet2 as keyof typeof this.planetNames]}`,
      'Chanting of planetary mantras',
      'Performing charity on relevant weekdays',
      'Wearing appropriate colors',
      'Maintaining positive mindset',
    ];
  }

  private getSpecificRemedies(planet: string): string[] {
    const remedies = {
      sun: ['Offer water to Sun', 'Chant Gayatri Mantra', 'Donate wheat', 'Wear red clothes'],
      moon: [
        'Offer milk to Shivling',
        'Chant Mahamrityunjay Mantra',
        'Donate white clothes',
        'Wear white clothes',
      ],
      mars: [
        'Offer red flowers to Hanuman',
        'Chant Hanuman Chalisa',
        'Donate blood',
        'Wear red clothes',
      ],
      mercury: [
        'Feed green grass to cows',
        'Chant Budh Mantra',
        'Donate books',
        'Wear green clothes',
      ],
      jupiter: [
        'Worship Guru',
        'Chant Guru Mantra',
        'Donate yellow clothes',
        'Wear yellow clothes',
      ],
      venus: [
        'Worship Lakshmi',
        'Chant Lakshmi Mantra',
        'Donate white clothes',
        'Wear white clothes',
      ],
      saturn: ['Worship Shani', 'Chant Shani Mantra', 'Donate black clothes', 'Wear blue clothes'],
      rahu: ['Worship Durga', 'Chant Durga Mantra', 'Donate blue clothes', 'Wear blue clothes'],
      ketu: ['Worship Ganesha', 'Chant Ganesha Mantra', 'Donate gray clothes', 'Wear gray clothes'],
    };

    return remedies[planet as keyof typeof remedies] || [];
  }

  private getGemstoneRemedies(planet1: string, planet2: string): Record<string, string> {
    const gemstones = {
      sun: 'Ruby',
      moon: 'Pearl',
      mars: 'Red Coral',
      mercury: 'Emerald',
      jupiter: 'Yellow Sapphire',
      venus: 'Diamond',
      saturn: 'Blue Sapphire',
      rahu: 'Hessonite',
      ketu: "Cat's Eye",
    };

    return {
      [planet1]: gemstones[planet1 as keyof typeof gemstones],
      [planet2]: gemstones[planet2 as keyof typeof gemstones],
    };
  }

  private getMantraRemedies(planet1: string, planet2: string): Record<string, string> {
    const mantras = {
      sun: 'Om Suryaya Namaha',
      moon: 'Om Somaya Namaha',
      mars: 'Om Angarakaya Namaha',
      mercury: 'Om Budhaya Namaha',
      jupiter: 'Om Brihaspataye Namaha',
      venus: 'Om Shukraya Namaha',
      saturn: 'Om Shanicharaya Namaha',
      rahu: 'Om Rahave Namaha',
      ketu: 'Om Ketave Namaha',
    };

    return {
      [planet1]: mantras[planet1 as keyof typeof mantras],
      [planet2]: mantras[planet2 as keyof typeof mantras],
    };
  }

  private getFastingRemedies(planet1: string, planet2: string): Record<string, string> {
    const fasting = {
      sun: 'Sunday',
      moon: 'Monday',
      mars: 'Tuesday',
      mercury: 'Wednesday',
      jupiter: 'Thursday',
      venus: 'Friday',
      saturn: 'Saturday',
      rahu: 'Saturday',
      ketu: 'Tuesday',
    };

    return {
      [planet1]: fasting[planet1 as keyof typeof fasting],
      [planet2]: fasting[planet2 as keyof typeof fasting],
    };
  }

  private getCharityRemedies(planet1: string, planet2: string): Record<string, string> {
    const charity = {
      sun: 'Wheat, jaggery, copper',
      moon: 'Rice, sugar, silver',
      mars: 'Red lentils, weapons, land',
      mercury: 'Green gram, books, stationery',
      jupiter: 'Yellow lentils, gold, education',
      venus: 'White rice, clothes, cosmetics',
      saturn: 'Black gram, oil, iron',
      rahu: 'Blue flowers, electronics',
      ketu: 'Gray items, spiritual books',
    };

    return {
      [planet1]: charity[planet1 as keyof typeof charity],
      [planet2]: charity[planet2 as keyof typeof charity],
    };
  }

  // Helper methods for planet characteristics
  private getPlanetEffects(planet: string): string {
    const effects = {
      sun: 'authority, leadership, and recognition',
      moon: 'emotional sensitivity and intuition',
      mars: 'courage, energy, and initiative',
      mercury: 'intelligence, communication, and adaptability',
      jupiter: 'wisdom, expansion, and prosperity',
      venus: 'love, beauty, and harmony',
      saturn: 'discipline, responsibility, and hard work',
      rahu: 'ambition, innovation, and foreign connections',
      ketu: 'spirituality, detachment, and past life influences',
    };

    return effects[planet as keyof typeof effects] || 'general influences';
  }

  private getPlanetCharacteristics(planet: string): string {
    const characteristics = {
      sun: 'leadership qualities and self-expression',
      moon: 'emotional depth and nurturing qualities',
      mars: 'physical energy and competitive spirit',
      mercury: 'intellectual curiosity and communication skills',
      jupiter: 'optimism and philosophical outlook',
      venus: 'artistic sensibilities and social grace',
      saturn: 'practical wisdom and organizational skills',
      rahu: 'unconventional thinking and material desires',
      ketu: 'spiritual insight and intuitive abilities',
    };

    return characteristics[planet as keyof typeof characteristics] || 'general characteristics';
  }
}

// Export singleton instance
export const vimshottariDashaService = new VimshottariDashaService();
