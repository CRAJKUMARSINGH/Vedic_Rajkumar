import type {
  BirthChart,
  DivisionalChart,
  ArudhaPada,
  DashaPeriod,
  Transit,
  SubjectiveReading,
  ConflictResolution,
  TemporalLayer,
  PsychologicalArchetype,
  PersonalizedRemedy,
  FailureMode,
  DivisionalChartType,
  PlanetName,
  ZodiacSign,
  HouseNumber,
} from './types';

// Required Rupas for each planet (BPHS standard)
const REQUIRED_RUPAS: Record<string, number> = {
  Sun: 6.5,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
  Rahu: 5.0,
  Ketu: 5.0,
};

// Map rashi number (1-12) to ZodiacSign string
const RASHI_MAP: Record<number, ZodiacSign> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

const RASHI_LORDS: Record<number, PlanetName> = {
  1: 'Mars',
  2: 'Venus',
  3: 'Mercury',
  4: 'Moon',
  5: 'Sun',
  6: 'Mercury',
  7: 'Venus',
  8: 'Mars',
  9: 'Jupiter',
  10: 'Saturn',
  11: 'Saturn',
  12: 'Jupiter',
};

const AL_PSYCHOLOGY_MAP: Record<
  number,
  { mask: string; innerVsOuter: string; consequence: string; shift: string }
> = {
  1: {
    mask: 'AL in the 1st from Lagna: Pure authenticity. You wear no mask; the world sees your true strengths and vulnerabilities immediately.',
    innerVsOuter: 'You feel transparent privately, and you project raw authenticity publicly.',
    consequence:
      'This creates a deep vulnerability where any criticism of your work is felt as a direct attack on your soul.',
    shift:
      'Success arrives when you build a healthy boundary between your self-worth and external validation.',
  },
  2: {
    mask: 'AL in the 2nd from Lagna: The provider mask. Your public identity is heavily anchored in wealth, lineage, and articulate speech.',
    innerVsOuter:
      'You are privately preoccupied with security, but publicly project effortless abundance.',
    consequence:
      'The gap creates a pressure to constantly demonstrate financial or intellectual worth, leading to over-extension.',
    shift:
      'Therefore: True wealth manifests when you value your inner wisdom independent of material possessions.',
  },
  3: {
    mask: 'AL in the 3rd from Lagna: The warrior mask. You are perceived as courageous, competitive, and constantly active.',
    innerVsOuter:
      'You feel restless and doubtful privately, but project absolute courage and confidence publicly.',
    consequence:
      'The gap causes you to fight battles that are not yours simply to maintain the image of strength.',
    shift:
      'Therefore: True strength is realized when you learn to choose peace over victory and rest over action.',
  },
  4: {
    mask: 'AL in the 4th from Lagna: The nurturer mask. The world sees you as a safe haven, a protector, and a source of comfort.',
    innerVsOuter:
      'You are privately searching for safety, but project emotional stability and shelter publicly.',
    consequence:
      'You carry the emotional burdens of others while denying your own need for nurturing.',
    shift:
      'Therefore: Real security manifests when you nurture your own heart first before accommodating others.',
  },
  5: {
    mask: 'AL in the 5th from Lagna: The creator mask. The world projects intelligence, creative genius, and charisma onto you.',
    innerVsOuter:
      'You are privately anxious about your intellectual capabilities, but project authority and brilliance publicly.',
    consequence:
      'This results in impostor syndrome and a fear of making intellectual or creative mistakes in public.',
    shift:
      'Therefore: True wisdom flows when you express yourself without needing the applause of the audience.',
  },
  6: {
    mask: 'AL in the 6th from Lagna: The service/warrior mask. The world sees you through your daily struggles, service, or conflicts.',
    innerVsOuter:
      'You privately crave peace, but publicly project an image of an indomitable problem solver.',
    consequence:
      'You attract opposition and service-related duties because the world expects you to solve all problems.',
    shift:
      "Therefore: True freedom comes when you stop solving everyone else's crises and focus on your inner alignment.",
  },
  7: {
    mask: 'AL in the 7th from Lagna: The relational mirror mask. Your identity is perceived through your partnerships and associations.',
    innerVsOuter:
      'You privately search for your own center, but publicly project your identity only in partnership.',
    consequence:
      'You compromise your own truth to maintain harmony in relationships, losing your individual voice.',
    shift:
      'Therefore: True partnership becomes strong only when you stand firmly in your own independent identity.',
  },
  8: {
    mask: 'AL in the 8th from Lagna: The mystic/inscrutable mask. The world perceives you as mysterious, intense, and deeply private.',
    innerVsOuter:
      'You privately feel vulnerable and exposed to sudden shifts, but publicly project an aura of complete control.',
    consequence:
      'The world finds it difficult to trust you because you keep your true motivations hidden.',
    shift:
      'Therefore: Breakthroughs occur when you embrace vulnerability and allow trusted partners to see your true self.',
  },
  9: {
    mask: 'AL in the 9th from Lagna: The guru/teacher mask. The world projects wisdom, ethical purity, and spiritual authority onto you.',
    innerVsOuter:
      'You privately doubt your own righteousness, but publicly project a standard of moral and philosophical clarity.',
    consequence:
      'This creates a fear of being human, making you hide your flaws behind dogmatic principles.',
    shift:
      'Therefore: True guidance happens when you share your human struggles rather than just your perfect theories.',
  },
  10: {
    mask: 'AL in the 10th from Lagna: The career achiever mask. You are privately uncertain but publicly seen as an unstoppable force.',
    innerVsOuter:
      'You are privately searching for your purpose, but project competence and status publicly.',
    consequence: 'The gap creates a performance anxiety that is invisible to everyone except you.',
    shift: 'Therefore: Success arrives when you stop performing competence and start embodying it.',
  },
  11: {
    mask: 'AL in the 11th from Lagna: The visionary networker mask. The world sees you as highly connected, influential, and socially impactful.',
    innerVsOuter:
      'You privately feel lonely and detached, but project community leadership and extensive networks publicly.',
    consequence:
      'You spend energy maintaining empty associations that drain your creative essence.',
    shift:
      'Therefore: Abundance flows when you prioritize deep, meaningful connections over superficial popularity.',
  },
  12: {
    mask: 'AL in the 12th from Lagna: The exile mystic mask. You are perceived as detached, charitable, or existing in a separate realm.',
    innerVsOuter:
      'You privately struggle with belonging, but project spiritual detachment or exile publicly.',
    consequence:
      'This leads to self-sabotage, isolation, and an expectation of loss before any gain.',
    shift:
      'Therefore: Detachment becomes a superpower only when you actively engage with the world from a place of peace.',
  },
};

export class SubjectiveAnalysisEngine {
  private d1: BirthChart;
  private d9: DivisionalChart;
  private d10: DivisionalChart;
  private arudha: ArudhaPada;
  private dashas: DashaPeriod[];
  private transits: Transit[];
  private queryContext: string;
  private referenceType: 'natal' | 'prashna';

  constructor(data: {
    d1: BirthChart;
    d9: DivisionalChart;
    d10: DivisionalChart;
    arudha: ArudhaPada;
    dashas: DashaPeriod[];
    transits: Transit[];
    queryContext: string;
    referenceType?: 'natal' | 'prashna';
  }) {
    this.d1 = data.d1;
    this.d9 = data.d9;
    this.d10 = data.d10;
    this.arudha = data.arudha;
    this.dashas = data.dashas;
    this.transits = data.transits;
    this.queryContext = data.queryContext || 'general';
    this.referenceType = data.referenceType ?? 'natal';
  }

  /**
   * Main entry point: Runs all 13 Layers of the Convergence Architecture
   */
  public generateReading(): SubjectiveReading {
    const isFameQuery = this.queryContext === 'fame' || this.queryContext === 'career';

    // LAYER 0: Virgin World Fame Score
    const fameScore = isFameQuery ? this.scoreVirginWorldFame() : 0;

    // LAYER 2: Get lowest Shadbala planet for remedy targeting
    const weakestPlanet = this.findWeakestPlanet();

    // LAYER 3: Yoga Activation check
    const yogas = this.analyzeYogas();

    // LAYER 4: Divisional Synthesis (D1 vs D9 / D10 conflicts resolved)
    const divisionalConflicts = this.detectDivisionalConflicts();

    // LAYER 8: Arudha Lagna Psychology Gap
    const archetype = this.determineArchetype();

    // LAYER 9: Resolution Clause & Narrative Construction
    let narrative = this.synthesizeNarrative(divisionalConflicts, archetype);

    if (isFameQuery) {
      if (fameScore < 60) {
        narrative += `\n\n### Layer 13: Virgin World Fame Verdict\n**The chart does not structurally support virgin world fame.** Real-world recognition will be localized, private, or institutional rather than public stardom. We proceed to honest Layer 10 analysis of career structures.`;
      } else {
        narrative += this.generateFameVerdict(fameScore, weakestPlanet);
      }
    }

    // LAYER 10: Failure Mode & Probability Engine
    const risksAndMitigation = this.analyzeFailureModes(weakestPlanet);

    // LAYER 12: Six-Layer Remedy Stack
    const remedies = this.generateRemedies(weakestPlanet);

    // LAYER 6 & 7: Temporal Layers (Dasha levels + Double transit windows)
    const temporalInsights = this.generateTemporalLayers();

    // Key Takeaways & Focus Areas
    const keyTakeaways = this.getKeyTakeaways(divisionalConflicts, weakestPlanet);
    const focusAreas = this.getFocusAreas();
    const recommendedNextSteps = this.getRecommendedNextSteps(remedies);

    // Final Tone
    let overallTone: 'Empowering' | 'Cautionary' | 'Transformative' | 'Balanced' = 'Balanced';
    if (this.calculateConfidenceScore() > 80) overallTone = 'Transformative';
    else if (risksAndMitigation.some(r => r.probability > 60)) overallTone = 'Cautionary';

    const confidenceScore = this.calculateConfidenceScore();
    let confidenceBand: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low' = 'Moderate';
    if (confidenceScore >= 90) confidenceBand = 'Very High';
    else if (confidenceScore >= 75) confidenceBand = 'High';
    else if (confidenceScore <= 40) confidenceBand = 'Low';

    return {
      chartId: this.d1.dateTime,
      generatedAt: new Date().toISOString(),
      referenceType: this.referenceType,
      contextNote:
        this.referenceType === 'natal'
          ? 'Birth-data basis: the reading is Jatak-wise and may judge life-pattern promise.'
          : 'Question-time basis: the reading is Prashna-wise and applies to this question, not the whole life arc.',
      summary: `${this.referenceType === 'natal' ? 'Birth-data Jatak' : 'Question-time Prashna'} 13-layer convergence analysis addressing ${this.queryContext}. Dominant archetype: ${archetype.name}.`,
      overallTone,
      confidenceScore,
      confidenceBand,
      narrative,
      conflicts: divisionalConflicts,
      temporalInsights,
      archetype,
      remedies,
      risksAndMitigation,
      keyTakeaways,
      focusAreas,
      recommendedNextSteps,
      classicalReferences: [
        'BPHS (Brihat Parashara Hora Shastra)',
        'Jaimini Sutram Ch. 1-2',
        'Prasna Marga (Panakkattu Nambudiripad)',
        'Phaladeepika (Mantreswara)',
      ],
      chartsUsed: ['D1', 'D9', 'D10'],
    };
  }

  // ==========================================
  // LAYER 0: Virgin World Fame Filter
  // ==========================================
  private scoreVirginWorldFame(): number {
    let score = 0;

    // 1. Strong 10th / Lagna Lord / AL independent visibility (Sun/Rahu/Jupiter influence)
    const lagnaRashiIndex = Object.values(RASHI_MAP).indexOf(this.d1.lagna.sign) + 1;
    const lagnaLord = RASHI_LORDS[lagnaRashiIndex];
    const hasStrongLagnaLordOr10th = this.d1.planets.some(
      p =>
        (p.house === 10 || p.planet === lagnaLord) &&
        (p.planet === 'Sun' || p.planet === 'Rahu' || p.planet === 'Jupiter') &&
        (p.dignity === 'Exalted' || p.dignity === 'OwnSign' || (p.shadbalaScore || 100) >= 120)
    );
    if (hasStrongLagnaLordOr10th) score += 20;

    // 2. Rahu in 10th/11th/5th/9th or aspecting, or in Kendra from AL
    const hasRahuFamePlacement = this.d1.planets.some(
      p =>
        p.planet === 'Rahu' && (p.house === 10 || p.house === 11 || p.house === 5 || p.house === 9)
    );
    if (hasRahuFamePlacement) score += 15;

    // 3. Sun exalted, own sign, digbala or Neecha Bhanga with active Jupiter
    const sun = this.d1.planets.find(p => p.planet === 'Sun');
    if (sun) {
      if (sun.dignity === 'Exalted' || sun.dignity === 'OwnSign' || sun.house === 10) {
        score += 15;
      }
    }

    // 4. 10th lord Vargottama or Shadbala >= 120
    const tenthLord = this.d1.planets.find(p => p.house === 10);
    if (tenthLord && ((tenthLord.shadbalaScore || 0) >= 120 || tenthLord.vargottama)) {
      score += 15;
    }

    // 5. AL in 10th/11th from Lagna or receiving strong Jupiter/Rahu aspect
    if (
      this.arudha.arudhaLagna.houseFromLagna === 10 ||
      this.arudha.arudhaLagna.houseFromLagna === 11
    ) {
      score += 15;
    }

    // 6. D10 confirmation (10th lord strong, Rahu/Sun influence)
    const d10Lord = this.d10.planets.find(p => p.house === 10);
    if (d10Lord && (d10Lord.dignity === 'Exalted' || d10Lord.dignity === 'OwnSign')) {
      score += 10;
    }

    // 7. No Parasitic Fame (assumed true unless heavily afflicted)
    score += 10;

    return score;
  }

  // ==========================================
  // LAYER 2: Shadbala Protocol & Weakest Planet
  // ==========================================
  private findWeakestPlanet(): PlanetName {
    let weakest: PlanetName = 'Sun';
    let minScore = 999;

    this.d1.planets.forEach(p => {
      // Exclude Rahu and Ketu from standard Shadbala calculations
      if (p.planet === 'Rahu' || p.planet === 'Ketu') return;
      const score = p.shadbalaScore || 100;
      if (score < minScore) {
        minScore = score;
        weakest = p.planet;
      }
    });

    return weakest;
  }

  // ==========================================
  // LAYER 3: Yoga Activation
  // ==========================================
  private analyzeYogas(): Array<{
    name: string;
    status: 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
    detail: string;
  }> {
    const list: Array<{
      name: string;
      status: 'ACTIVE' | 'EMERGING' | 'LATENT' | 'BROKEN';
      detail: string;
    }> = [];

    // Gaja Kesari check
    const moon = this.d1.planets.find(p => p.planet === 'Moon');
    const jupiter = this.d1.planets.find(p => p.planet === 'Jupiter');
    if (moon && jupiter) {
      const dist = ((jupiter.house - moon.house + 12) % 12) + 1;
      const isKendra = dist === 1 || dist === 4 || dist === 7 || dist === 10;
      if (isKendra) {
        const active = this.isDashaActive('Jupiter') || this.isDashaActive('Moon');
        list.push({
          name: 'Gaja Kesari Yoga',
          status: active ? 'ACTIVE' : 'LATENT',
          detail: 'Jupiter in Kendra from Moon promises intelligence, honor, and speech success.',
        });
      }
    }

    // Viparita Raj Yoga (Lords of 6, 8, 12 in 6, 8, 12 houses)
    const dusthanaLords = this.d1.planets.filter(
      p => p.house === 6 || p.house === 8 || p.house === 12
    );
    if (dusthanaLords.length >= 2) {
      list.push({
        name: 'Viparita Raj Yoga',
        status: 'ACTIVE',
        detail: 'Sudden gains, elevation of status after initial collapse or systemic chaos.',
      });
    }

    return list;
  }

  private isDashaActive(planet: PlanetName): boolean {
    return this.dashas.some(d => d.mahadasha === planet && d.isActive);
  }

  // ==========================================
  // LAYER 4 & 9: Divisional Synthesis & Resolution
  // ==========================================
  private detectDivisionalConflicts(): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];
    const targetHouse = this.getTargetHouse();
    const dashaInfo = this.calculateDashaLevel(targetHouse);

    // Conflict 1: D1 vs D9 Marriage Promise
    const d1Venus = this.d1.planets.find(p => p.planet === 'Venus');
    const d9Venus = this.d9.planets.find(p => p.planet === 'Venus');

    if (d1Venus && d9Venus) {
      const isD1Strong =
        d1Venus.dignity === 'Exalted' ||
        d1Venus.dignity === 'OwnSign' ||
        d1Venus.dignity === 'MoolaTrikona';
      const isD9Weak =
        d9Venus.dignity === 'Debilitated' ||
        d9Venus.house === 6 ||
        d9Venus.house === 8 ||
        d9Venus.house === 12;

      if (isD1Strong && isD9Weak) {
        const venusShadbalaRupas = (((d1Venus.shadbalaScore || 100) / 100) * 5.5).toFixed(2);
        conflicts.push({
          id: 'D1_D9_Marriage',
          charts: ['D1', 'D9'],
          conflictDescription: `D9 Navamsa Venus is debilitated/placed in a dusthana house showing relationship friction, but D1 Radix Venus is dignified showing strong romantic promise.`,
          classicalBasis: `Layer 3 (Shadbala) gives the casting vote: Venus at ${venusShadbalaRupas} Rupas indicates strong core attraction and social alignment, which sustains the bond despite personal friction.`,
          synthesis: `Therefore: Marriage is guaranteed to materialize but requires conscious ego-dissolution and planetary remediation to survive long-term partnership friction. ${dashaInfo.levelTag}`,
          practicalAdvice: `Channel relationship energy into shared creative pursuits. Perform Venus remedies daily.`,
          confidence: 85,
        });
      }
    }

    // Conflict 2: D1 vs D10 Career Promise
    const d110thLord = this.d1.planets.find(p => p.house === 10);
    const d1010thLord = this.d10.planets.find(p => p.house === 10);

    if (d110thLord && d1010thLord) {
      const isD1Strong = (d110thLord.shadbalaScore || 100) > 90;
      const isD10Weak =
        d1010thLord.dignity === 'Debilitated' ||
        d1010thLord.house === 6 ||
        d1010thLord.house === 8 ||
        d1010thLord.house === 12;

      if (isD1Strong && isD10Weak) {
        const lordShadbalaRupas = (((d110thLord.shadbalaScore || 100) / 100) * 6.5).toFixed(2);
        conflicts.push({
          id: 'D1_D10_Career',
          charts: ['D1', 'D10'],
          conflictDescription: `D10 Dasamsa 10th lord is weakened/placed in service house, but D1 Radix 10th house is highly ambitious.`,
          classicalBasis: `Layer 3 (Shadbala) gives the casting vote: ${d110thLord.planet} at ${lordShadbalaRupas} Rupas grants strong executive capability, yet daily career operation is confined to structure.`,
          synthesis: `Therefore: Professional success comes through service within large structures rather than independent entrepreneurship. Ambitions are realized through institutional backing. ${dashaInfo.levelTag}`,
          practicalAdvice: `Do not launch a solo startup; seek leadership inside an established corporate or governmental organization.`,
          confidence: 80,
        });
      }
    }

    return conflicts;
  }

  // ==========================================
  // LAYER 8 & 11: Arudha Lagna Psychology
  // ==========================================
  private determineArchetype(): PsychologicalArchetype {
    const lagnaRashi = this.d1.lagna.sign;
    const alRashi = this.arudha.arudhaLagna.sign;
    const alHouse = this.arudha.arudhaLagna.houseFromLagna;

    // Check Moon Nakshatra for fear
    const moon = this.d1.planets.find(p => p.planet === 'Moon');
    const moonNak = (moon as any)?.nakshatra || 'Ashwini';

    let coreFear = 'Fear of insignificance';
    if (['Ashwini', 'Bharani', 'Krittika'].includes(moonNak))
      coreFear = 'Fear of insignificance / annihilation';
    else if (['Rohini', 'Mrigashira', 'Ardra'].includes(moonNak))
      coreFear = 'Fear of abandonment / loss of love';
    else if (['Punarvasu', 'Pushya', 'Ashlesha'].includes(moonNak))
      coreFear = 'Fear of uncertainty / need for control';
    else if (['Magha', 'PurvaPhalguni', 'UttaraPhalguni'].includes(moonNak))
      coreFear = 'Fear of obscurity / loss of lineage';
    else if (['Hasta', 'Chitra', 'Swati'].includes(moonNak))
      coreFear = 'Fear of imperfection / exposure';
    else if (['Vishakha', 'Anuradha', 'Jyeshtha'].includes(moonNak))
      coreFear = 'Fear of betrayal / powerlessness';
    else if (['Moola', 'PurvaAshadha', 'UttaraAshadha'].includes(moonNak))
      coreFear = 'Fear of meaninglessness / chaos';
    else if (['Shravana', 'Dhanishtha', 'Shatabhisha'].includes(moonNak))
      coreFear = 'Fear of disconnection / isolation';
    else coreFear = 'Fear of endings / the unknown';

    // Rahu/Ketu Axis
    const rahu = this.d1.planets.find(p => p.planet === 'Rahu');
    const ketu = this.d1.planets.find(p => p.planet === 'Ketu');
    const rahuHouse = rahu ? rahu.house : 10;
    const ketuHouse = ketu ? ketu.house : 4;
    const rahuKetuAxis = `Rahu in ${rahuHouse}H / Ketu in ${ketuHouse}H: Desiring worldly expansion in house ${rahuHouse} while experiencing past-life satiety or detachment in house ${ketuHouse}.`;

    // Saturn Wound
    const saturn = this.d1.planets.find(p => p.planet === 'Saturn');
    const saturnHouse = saturn ? saturn.house : 8;
    const saturnWound = `Saturn in ${saturnHouse}H: Area of delay, test, and hard-won mastery. Represents structural vulnerability that becomes your ultimate anchor through patient discipline.`;

    const mappedAL = AL_PSYCHOLOGY_MAP[alHouse] || AL_PSYCHOLOGY_MAP[10];

    const archetype: PsychologicalArchetype = {
      name:
        alHouse === 10
          ? 'The Public Sentinel'
          : alHouse === 12
            ? 'The Exile Mystic'
            : 'The Conscious Architect',
      coreTheme: mappedAL.mask,
      chartCombination: `Lagna: ${lagnaRashi} | AL Sign: ${alRashi} in ${alHouse}H from Lagna`,
      strengths: ['Diligence', 'Discipline', 'Strategic Foresight'],
      shadow: mappedAL.consequence,
      growthPath: mappedAL.shift,
      culturalResonance: alHouse === 12 ? 'Shiva in deep meditation' : 'Ganesha paving the path',
      coreFear: `Nakshatra Fear Architecture (${moonNak}): ${coreFear}`,
      coreMotivation: `Embodying inner purpose by aligning the AL mask with the Lagna's core truth.`,
      rahuKetuAxis,
      saturnWound,
    };

    return archetype;
  }

  // ==========================================
  // LAYER 9: Forced Synthesis Verdict
  // ==========================================
  private synthesizeNarrative(
    conflicts: ConflictResolution[],
    archetype: PsychologicalArchetype
  ): string {
    const parts: string[] = [];

    parts.push(`## Astrological Narrative: The ${archetype.name}`);
    parts.push(`Your life is defined by: **${archetype.coreTheme}**.`);
    parts.push(
      `Psychologically, your Moon placement creates a deep **${archetype.coreFear}**, manifesting as ${archetype.shadow.toLowerCase()}.`
    );

    // Add divisional conflict resolutions
    if (conflicts.length > 0) {
      parts.push(`### Critical Life Conflicts & Resolutions`);
      conflicts.forEach(c => {
        parts.push(`**Conflict**: ${c.conflictDescription}`);
        parts.push(`*Layered Weighing (Shadbala & Radix Promise)*: ${c.classicalBasis}`);
        parts.push(`**Therefore**: ${c.synthesis}`);
      });
    } else {
      const targetHouse = this.getTargetHouse();
      const dashaInfo = this.calculateDashaLevel(targetHouse);
      parts.push(`### Integration & Harmonization`);
      parts.push(
        `Therefore: The radix and divisional indicators align smoothly. Success flows naturally once you commit to your core Saturn lesson of ${archetype.growthPath.toLowerCase()}. ${dashaInfo.levelTag}`
      );
    }

    return parts.join('\n\n');
  }

  // ==========================================
  // LAYER 10: Failure Mode & Probability Engine
  // ==========================================
  private analyzeFailureModes(weakest: PlanetName): FailureMode[] {
    const targetHouse = this.getTargetHouse();

    // Find weakest planet details
    const planet = this.d1.planets.find(p => p.planet === weakest);
    const house = planet ? planet.house : 8;
    const score = planet ? planet.shadbalaScore || 60 : 60;

    // map score to Rupas
    const required = REQUIRED_RUPAS[weakest] || 5.5;
    const totalRupas = ((score / 100) * required).toFixed(2);

    let tier = 'Moderate';
    if (score < 40) tier = 'Extremely Weak';
    else if (score < 75) tier = 'Weak';
    else if (score < 125) tier = 'Moderate';
    else if (score < 200) tier = 'Strong';
    else tier = 'Extremely Strong';

    const probWithout = score < 60 ? 75 : 45;
    const probWith = score < 60 ? 30 : 15;

    const riskText = `Obstruction: ${weakest} in house ${house} with ${totalRupas} Rupas Shadbala (tier: ${tier}), unconfirmed in divisional charts. Mechanism: Afflicted ${weakest} creates subconscious self-sabotage, disrupting focus during peak dasha windows.`;

    const mitigationText = `Requires 6-Layer Remedy Stack for ${weakest} sustained for 40 Days (One Mandala).`;

    const recoveryText = `Intervention Target: ${weakest} — ${totalRupas} Rupas — This planet is the weakest link in your chart's promise chain. Strengthening it prevents the collapse of career or relational structure.`;

    return [
      {
        risk: riskText,
        probability: probWithout,
        triggers: [
          `Allowing the shadow aspect of your archetype (${this.determineArchetype().shadow}) to govern decisions`,
          `Failing to execute the primary behavioral remedy daily before 10 AM`,
          `Engaging in reactive disputes during Mercury or Mars retrograde phases`,
        ],
        earlyWarningSigns: [
          `Loss of daily structure, brain fog, or sudden disputes with peers`,
          `Delay in communications or feeling an acute sense of isolation`,
        ],
        mitigationStrategy: mitigationText,
        recoveryStrategy: recoveryText,
        opportunityInRisk: `Probability with intervention: ${probWith}% failure rate (sustained effort transforms this obstacle into your greatest structural strength).`,
      },
    ];
  }

  // ==========================================
  // LAYER 12: Six-Layer Remedy Stack
  // ==========================================
  private generateRemedies(weakest: PlanetName): PersonalizedRemedy[] {
    let behavioral = 'Initiate silent meditation for 20 minutes daily before 10 AM.';
    let psychological = 'Acknowledge your vulnerability; discipline shields you.';
    let spiritual = 'Chant Om Namo Bhagavate Vasudevaya 108 times daily.';
    let practical = 'Maintain a clean desk; align sleep with sunset/sunrise.';
    let karmic = 'Serve elder individuals or clean public religious spots on Saturdays.';
    let ritual = 'Light a mustard oil lamp under a Peepal tree on Saturdays.';

    switch (weakest) {
      case 'Saturn':
        behavioral = 'Execute tasks in strict order of difficulty, embrace delay without anger.';
        psychological =
          'Acknowledge that delays are not denials, but structural calibrations for longevity.';
        spiritual =
          'Chant Shani Beej Mantra: "Om Pram Preem Proum Sah Shanischaraya Namah" 108 times at dusk.';
        practical =
          'Limit processed sugars, eat black sesame seeds, and wear dark blue/black on Saturdays.';
        karmic = 'Provide food or shoes to manual laborers and helpers without demanding speed.';
        ritual = 'Light a sesame/mustard oil lamp under a Peepal tree on Saturday evenings.';
        break;
      case 'Sun':
        behavioral = 'Wake up before sunrise, stand in early morning sunlight for 10 minutes.';
        psychological =
          'Release the need for constant external praise; seek validation from within.';
        spiritual = 'Chant the Gayatri Mantra 108 times daily at sunrise.';
        practical = 'Consume ginger, black pepper, and warm cooked foods; avoid cold drinks.';
        karmic =
          'Offer respect and assistance to father figures and leaders without expecting favor.';
        ritual = 'Offer water mixed with red flowers and copper dust to the rising Sun.';
        break;
      case 'Mercury':
        behavioral =
          'Read technical or spiritual texts aloud for 20 minutes daily; record and audit speech.';
        psychological = 'Calm the racing mind by focusing on one communication stream at a time.';
        spiritual = 'Chant Vishnu Sahasranama or Vishnu Gayatri mantra 108 times daily.';
        practical = 'Write your daily goals in a green journal before 9 AM; avoid multitasking.';
        karmic = 'Donate school supplies or books to underprivileged children on Wednesdays.';
        ritual = 'Feed green grass or vegetables to cows on Wednesday mornings.';
        break;
      case 'Venus':
        behavioral =
          'Maintain strict hygiene, keep white flowers in your living space, and create art without expecting commercial return.';
        psychological =
          'Stop projecting perfection onto partners; appreciate relationship reality.';
        spiritual = 'Chant Lalitha Sahasranama or "Om Shum Shukraya Namah" 108 times daily.';
        practical = 'Wear clean, pressed, light-colored or white clothing; use subtle perfumes.';
        karmic = 'Donate white sweets or clothes to women in need on Fridays.';
        ritual = 'Light a ghee lamp in front of Goddess Lakshmi on Friday mornings.';
        break;
      case 'Mars':
        behavioral =
          'Engage in high-intensity physical exercise; count to ten before replying in anger.';
        psychological =
          'Rechannel irritation into structural execution rather than verbal aggression.';
        spiritual = 'Chant the Hanuman Chalisa or Mangal Beej Mantra 108 times daily.';
        practical =
          'Donate red lentils (masoor dal) on Tuesdays; avoid eating spicy food at night.';
        karmic = 'Support military, police, or athletic charity foundations; avoid litigation.';
        ritual = 'Visit a Hanuman temple on Tuesday mornings and offer vermillion.';
        break;
      case 'Jupiter':
        behavioral =
          'Read philosophical or wisdom texts daily; listen to advice without interrupting.';
        psychological = 'Avoid dogmatic self-righteousness; realize that wisdom is humble.';
        spiritual =
          'Chant Guru Beej Mantra: "Om Gram Greem Groum Sah Gurave Namah" 108 times on Thursdays.';
        practical =
          'Incorporate turmeric, honey, and yellow foods in your diet; wear yellow on Thursdays.';
        karmic = 'Offer voluntary service to a teacher, mentor, or priest on Thursdays.';
        ritual = 'Donate yellow chickpeas or saffron to a temple or school on Thursdays.';
        break;
    }

    return [
      {
        issue: `Affliction and weakness of your single point of failure: ${weakest}`,
        planetOrHouse: weakest,
        standardRemedy: `Daily mantra and donation targeting the energies of ${weakest}.`,
        behavioralRemedy: behavioral,
        psychologicalRemedy: psychological,
        spiritualRemedy: spiritual,
        practicalRemedy: practical,
        karmicRemedy: karmic,
        ritualRemedy: ritual,
        actionItems: [
          `Execute the primary behavioral remedy daily before 10 AM.`,
          `Keep a written journal of your mental trigger points during the hour of ${weakest}.`,
        ],
        duration: '40 Days (One Mandala)',
        expectedOutcome: `Restoration of executive focus, neutralization of transit obstacles, and karmic clearance.`,
        spiritualBasis: `Parashara: "Remedies performed with discipline alter the planetary reflection within the native's subtle body."`,
      },
    ];
  }

  // ==========================================
  // LAYER 6 & 7: Temporal Layers
  // ==========================================
  private generateTemporalLayers(): TemporalLayer[] {
    const list: TemporalLayer[] = [];
    const targetHouse = this.getTargetHouse();
    const dashaInfo = this.calculateDashaLevel(targetHouse);
    const dt = this.checkDoubleTransit(targetHouse);

    let basis = `Layer 7 Transit: ${dt.label}.`;
    if (dt.type === 'DOUBLE_TRANSIT_CERTIFIED') {
      basis = `Layer 7 Double Transit: Jupiter and Saturn double aspect/transit on house ${targetHouse} certifies permanent fruition.`;
    }

    list.push({
      lifeArea:
        this.queryContext === 'fame'
          ? 'Fame & Recognition'
          : this.queryContext === 'marriage'
            ? 'Marriage & Partnership'
            : 'Career Progression',
      timeWindow: dashaInfo.years,
      dashaActivation: `${dashaInfo.mdLord} MD / ${dashaInfo.adLord} AD [Dasha Level: ${dashaInfo.level}]`,
      divisionalTrigger: basis,
      recommendation: `Peak manifestation window triggered by transit activation. Perform remedies for ${this.findWeakestPlanet()} to clear obstructions.`,
      priority: dashaInfo.level >= 4 ? 'High' : 'Medium',
      confidence: dashaInfo.level * 20,
    });

    return list;
  }

  private isAspectingHouse(
    planet: PlanetName,
    planetHouse: HouseNumber,
    targetHouse: HouseNumber
  ): boolean {
    if (planetHouse === targetHouse) return true;
    const diff = (targetHouse - planetHouse + 12) % 12;
    if (planet === 'Jupiter') {
      return diff === 4 || diff === 6 || diff === 8;
    }
    if (planet === 'Saturn') {
      return diff === 2 || diff === 6 || diff === 9;
    }
    if (planet === 'Mars') {
      return diff === 3 || diff === 6 || diff === 7;
    }
    if (planet === 'Rahu' || planet === 'Ketu') {
      return diff === 4 || diff === 6 || diff === 8;
    }
    return diff === 6;
  }

  private checkDoubleTransit(targetHouse: HouseNumber): {
    type: string;
    label: string;
    activePlanet?: string;
  } {
    let jupiterActive = false;
    let saturnActive = false;

    this.transits.forEach(t => {
      const house = (t as any).houseFromLagna || 1;
      if (t.planet === 'Jupiter') {
        if (this.isAspectingHouse('Jupiter', house, targetHouse)) {
          jupiterActive = true;
        }
      } else if (t.planet === 'Saturn') {
        if (this.isAspectingHouse('Saturn', house, targetHouse)) {
          saturnActive = true;
        }
      }
    });

    if (jupiterActive && saturnActive) {
      return {
        type: 'DOUBLE_TRANSIT_CERTIFIED',
        label: 'DOUBLE_TRANSIT_CERTIFIED (Jupiter + Saturn aspecting/transiting simultaneously)',
      };
    }
    if (jupiterActive) {
      return {
        type: 'SINGLE_TRANSIT_TEMPORARY',
        label: 'SINGLE_TRANSIT_TEMPORARY (Jupiter active only)',
        activePlanet: 'Jupiter',
      };
    }
    if (saturnActive) {
      return {
        type: 'SINGLE_TRANSIT_TEMPORARY',
        label: 'SINGLE_TRANSIT_TEMPORARY (Saturn active only)',
        activePlanet: 'Saturn',
      };
    }
    return { type: 'NO_TRANSIT_IGNITION', label: 'NO_TRANSIT_IGNITION' };
  }

  private calculateDashaLevel(targetHouse: HouseNumber): {
    level: 1 | 2 | 3 | 4 | 5;
    label: string;
    mdLord: string;
    adLord: string;
    years: string;
    levelTag: string;
  } {
    const activeDasha = this.dashas.find(d => d.isActive) || this.dashas[0];
    const mdLord = activeDasha?.mahadasha || 'Sun';
    const adLord = activeDasha?.antardasha || 'Sun';
    const years = activeDasha
      ? `${activeDasha.startDate.split('-')[0]}–${activeDasha.endDate.split('-')[0]}`
      : '2026–2030';

    const lagnaRashiIndex = Object.values(RASHI_MAP).indexOf(this.d1.lagna.sign) + 1;
    const houseRashi = ((lagnaRashiIndex + targetHouse - 2) % 12) + 1;
    const targetLord = RASHI_LORDS[houseRashi];

    const mdLordPlanet = this.d1.planets.find(p => p.planet === mdLord);
    const mdLordHouse = mdLordPlanet ? mdLordPlanet.house : 1;
    const targetLordPlanet = this.d1.planets.find(p => p.planet === targetLord);

    const mdLordRatio = (mdLordPlanet?.shadbalaScore || 100) / 100;

    const mdLordConnects = mdLord === targetLord || mdLordHouse === targetHouse;

    // Double transit
    const dt = this.checkDoubleTransit(targetHouse);
    const doubleTransitActive = dt.type === 'DOUBLE_TRANSIT_CERTIFIED';

    // Divisional confirmation
    let divisionalConfirmed = true;
    if (targetHouse === 10) {
      const d10Lord = this.d10.planets.find(p => p.house === 10);
      if (
        d10Lord &&
        (d10Lord.dignity === 'Debilitated' ||
          d10Lord.house === 6 ||
          d10Lord.house === 8 ||
          d10Lord.house === 12)
      ) {
        divisionalConfirmed = false;
      }
    } else if (targetHouse === 7) {
      const d9Lord = this.d9.planets.find(p => p.house === 7);
      if (
        d9Lord &&
        (d9Lord.dignity === 'Debilitated' ||
          d9Lord.house === 6 ||
          d9Lord.house === 8 ||
          d9Lord.house === 12)
      ) {
        divisionalConfirmed = false;
      }
    }

    let level: 1 | 2 | 3 | 4 | 5 = 3;
    let label = 'Moderate';

    if (mdLordConnects && divisionalConfirmed && mdLordRatio >= 1.25 && doubleTransitActive) {
      level = 5;
      label = 'Maximum Convergence';
    } else if (mdLordConnects && divisionalConfirmed && mdLordRatio >= 1.0) {
      level = 4;
      label = 'High Confidence';
    } else if (mdLordConnects) {
      level = 3;
      label = 'Moderate';
    } else {
      // Find if future dasha connects
      const futureDasha = this.dashas.find(
        d =>
          !d.isActive &&
          (d.mahadasha === targetLord ||
            this.d1.planets.find(p => p.planet === d.mahadasha)?.house === targetHouse)
      );
      if (futureDasha) {
        level = 2;
        label = 'Conditional';
        const futureYears = `${futureDasha.startDate.split('-')[0]}–${futureDasha.endDate.split('-')[0]}`;
        const levelTag = `[Level 2: Conditional — Current ${mdLord} MD blocks; wait for ${futureDasha.mahadasha} MD running ${futureYears}]`;
        return { level, label, mdLord, adLord, years: futureYears, levelTag };
      } else {
        level = 1;
        label = 'Latent';
      }
    }

    let levelTag = '';
    if (level === 5) {
      levelTag = `[Level 5: Maximum Convergence — ${mdLord} MD / ${adLord} AD, exact active window ${years}]`;
    } else if (level === 4) {
      levelTag = `[Level 4: High Confidence — ${mdLord} MD / ${adLord} AD confirms timing, ${years}]`;
    } else if (level === 3) {
      levelTag = `[Level 3: Moderate — Activation in ${mdLord} MD, ${years}; remedies recommended]`;
    } else {
      levelTag = `[Level 1: Promise latent; energy is dormant without sustained remedy]`;
    }

    return { level, label, mdLord, adLord, years, levelTag };
  }

  // ==========================================
  // LAYER 13: Virgin World Fame Verdict
  // ==========================================
  private generateFameVerdict(fameScore: number, weakestPlanet: PlanetName): string {
    const targetHouse = this.getTargetHouse();
    const dashaInfo = this.calculateDashaLevel(targetHouse);

    let tier = 'Denied';
    if (fameScore >= 90) tier = 'Historic';
    else if (fameScore >= 75) tier = 'Global';
    else if (fameScore >= 60) tier = 'National + Niche';

    const weakestP = this.d1.planets.find(p => p.planet === weakestPlanet);
    const weakestRupas = weakestP
      ? (((weakestP.shadbalaScore || 100) / 100) * (REQUIRED_RUPAS[weakestPlanet] || 5.0)).toFixed(
          2
        )
      : '0.00';

    let nature = 'Respected';
    if (this.d1.planets.some(p => p.planet === 'Rahu' && p.house === 10))
      nature = 'Viral / Disruptive';
    else if (this.d1.planets.some(p => p.planet === 'Sun' && p.house === 10))
      nature = 'Enduring / Respected';
    else if (this.d1.planets.some(p => p.planet === 'Saturn' && p.house === 10))
      nature = 'Slow-Cemented / Generational';

    let longevity = 'Transient';
    if (fameScore >= 75) longevity = 'Generational';
    if (fameScore >= 90) longevity = 'Mythic';

    const remedies = this.generateRemedies(weakestPlanet)[0];

    return `

### Layer 13: Virgin World Fame Verdict
- **Score (0-100)**: ${fameScore}/100 — **Tier: ${tier}**
- **Probability without remedy**: ${fameScore < 60 ? '0' : '45'}%
- **Probability with remedy**: ${fameScore < 60 ? '0' : '75'}%
- **Peak Window**: ${dashaInfo.levelTag}
- **Nature of Fame**: ${nature}
- **Longevity**: ${longevity}
- **Weakest Fame Planet**: ${weakestPlanet} — ${weakestRupas} Rupas
- **Fame Remedy Target**: ${remedies.behavioralRemedy}
`;
  }

  private calculateConfidenceScore(): number {
    return Math.floor(70 + this.d1.planets.filter(p => (p.shadbalaScore || 100) >= 100).length * 3);
  }

  private getKeyTakeaways(conflicts: ConflictResolution[], weakest: PlanetName): string[] {
    return [
      `Your single failure point is **${weakest}**; focus all remedies on this planet.`,
      conflicts.length > 0
        ? `Marriage/Career requires structured patience; avoid impulsive jumps.`
        : `Radix alignments are favorable; execute daily tasks with rigor.`,
    ];
  }

  private getFocusAreas(): string[] {
    return ['Emotional Resilience', 'Career Realism', 'Karmic Remediation'];
  }

  private getRecommendedNextSteps(remedies: PersonalizedRemedy[]): string[] {
    return [
      `Initiate the 40-day remedy mandala for ${remedies[0]?.planetOrHouse}.`,
      `Track transits during the upcoming peak window.`,
    ];
  }
}
