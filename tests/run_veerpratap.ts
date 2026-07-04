import { calcPlanetsAccurate, calculateCompleteAscendant, calculateVimshottariDasha, analyzeYogas, calculateShadbala, runSynthesis, SynthesisRequest, AstrologicalContext } from '../packages/core/src';

async function run() {
  const date = '2011-09-18';
  const time = '06:58'; // IST — services handle IST→UTC internally
  const lat = 23.52;
  const lon = 77.82;

  console.log(`Calculating chart for Veerpratap (${date} ${time} IST at ${lat}, ${lon})`);

  // 1. Ascendant (Lagna)
  const ascendant = calculateCompleteAscendant(date, time, lat, lon);
  const ascRashi = ascendant.ascendant.rashiIndex; // 5 = Virgo
  console.log(`\nAscendant: ${ascendant.ascendant.rashiName} ${ascendant.ascendant.degrees.toFixed(2)}° (rashiIndex=${ascRashi})`);

  // 2. Planets via Swiss Ephemeris (IST input)
  const planetaryPositions = await calcPlanetsAccurate(date, time);

  // Recalculate house numbers from Lagna (not Moon)
  const planetsWithHouses = planetaryPositions.planets.map((p: any) => {
    const house = ((p.rashiIndex - ascRashi + 12) % 12) + 1;
    return { ...p, house };
  });

  console.log('\nPlanetary Positions (Lagna-based houses):');
  planetsWithHouses.forEach((p: any) => {
    console.log(`  ${p.name.padEnd(8)}: ${p.rashiName.padEnd(14)} ${p.degrees.toFixed(2).padStart(6)}°  House ${p.house}`);
  });

  // 3. Moon Longitude for Dasha
  const moon = planetaryPositions.moon;
  const moonLongitude = moon.sidereal !== undefined && moon.sidereal !== 0
    ? moon.sidereal
    : moon.rashi * 30 + moon.degrees;

  // 4. Dasha
  const dasha = calculateVimshottariDasha(date, time, 3, moonLongitude);

  // 5. Yogas (pass Lagna rashi)
  const planetsForYogas = planetsWithHouses.map((p: any) => ({
    name: p.name,
    rashiIndex: p.rashiIndex,
    house: p.house,
    degrees: p.degrees,
    isRetrograde: p.retrograde || false,
  }));
  const yogas = analyzeYogas(planetsForYogas, ascRashi);

  // 6. Shadbala
  const birthMonth = 9;
  const daytime = true; // sunrise ~06:30 IST
  const shadbala = calculateShadbala(
    planetsForYogas.map((p: any) => ({ ...p, longitude: p.rashiIndex * 30 + p.degrees })),
    daytime,
    birthMonth
  );

  // Virgo Ascendant: 10th lord is Mercury (10th = Gemini, lord Mercury)
  // tenthLordName key for synthesis engine
  const context: AstrologicalContext = {
    planets: planetsForYogas,
    lagnaRashiIdx: ascRashi,
    shadabala: shadbala.planets,
    shadabalaAnalysis: shadbala,
    dasha: dasha,
    yogaAnalysis: yogas,
    jaiminiAnalysis: { atmakaraka: 'Sun', amatyakaraka: 'Venus', aspects: [] },
    transits: [],
    aspects: [],
    tenthLordName: 'Mercury', // 10th house = Gemini (Virgo + 9 = index 14 % 12 = 2 = Gemini), lord = Mercury
    divisional: {
      d9_strong: true,
      d10_strong: true,
      d60_strong: false
    }
  };

  // Run Career Synthesis
  console.log('\nRunning 13-Layer Synthesis for Career...');
  const careerVerdict = await runSynthesis({ domain: 'career' } as SynthesisRequest, context);

  console.log('\n=== 13-LAYER CAREER FORECAST FOR VEERPRATAP ===');
  console.log(`Domain: ${careerVerdict.domain.toUpperCase()} | Timing Class: ${careerVerdict.timingClass}`);
  console.log(`\nVerdict:\n${careerVerdict.verdictSummary}`);
  console.log(`\nExplanation:\n${careerVerdict.conciseExplanation}`);
  console.log('\nTop Supporting Factors:');
  careerVerdict.topSupportingFactors.forEach((f: string) => console.log(` + ${f}`));
  console.log('\nTop Obstructing Factors:');
  careerVerdict.topObstructingFactors.forEach((f: string) => console.log(` - ${f}`));
  console.log('\nScores:', JSON.stringify(careerVerdict.scores, null, 2));

  // Run Education Synthesis
  console.log('\nRunning 13-Layer Synthesis for Education...');
  const eduVerdict = await runSynthesis({ domain: 'education' } as SynthesisRequest, context);

  console.log('\n=== 13-LAYER EDUCATION FORECAST FOR VEERPRATAP ===');
  console.log(`Domain: ${eduVerdict.domain.toUpperCase()} | Timing Class: ${eduVerdict.timingClass}`);
  console.log(`\nVerdict:\n${eduVerdict.verdictSummary}`);
  console.log(`\nExplanation:\n${eduVerdict.conciseExplanation}`);
  console.log('\nTop Supporting Factors:');
  eduVerdict.topSupportingFactors.forEach((f: string) => console.log(` + ${f}`));
  console.log('\nTop Obstructing Factors:');
  eduVerdict.topObstructingFactors.forEach((f: string) => console.log(` - ${f}`));
  console.log('\nScores:', JSON.stringify(eduVerdict.scores, null, 2));
}

run().catch(console.error);
