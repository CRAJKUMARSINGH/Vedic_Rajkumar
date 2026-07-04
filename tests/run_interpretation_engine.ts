import { calcPlanetsAccurate, calculateCompleteAscendant, calculateVimshottariDasha, analyzeYogas, calculateShadbala, calculateShodashVarga } from '../packages/core/src';
import { calculatePadaLagna } from '../packages/core/src/services/jaiminiService';
import { generateClassicalAnswer } from '../packages/core/src/services/interpretationEngine';

async function run() {
  const date = '2011-09-18';
  const time = '06:58'; 
  const lat = 23.52;
  const lon = 77.82;

  console.log(`Calculating chart for Veerpratap (${date} ${time} IST at ${lat}, ${lon})`);

  // 1. Ascendant (Lagna)
  const ascendant = calculateCompleteAscendant(date, time, lat, lon);
  const ascRashiIdx = ascendant.ascendant.rashiIndex; // 5 = Virgo
  console.log(`Ascendant: ${ascendant.ascendant.rashiName} (rashiIndex=${ascRashiIdx})`);

  // 2. Planets via Swiss Ephemeris
  const chartData = await calcPlanetsAccurate(date, time);

  // Recalculate house numbers from Lagna
  chartData.planets = chartData.planets.map((p: any) => {
    const house = ((p.rashiIndex - ascRashiIdx + 12) % 12) + 1;
    return { ...p, house };
  });

  // 3. Moon Longitude for Dasha
  const moon = chartData.moon;
  const moonLongitude = moon.sidereal !== undefined && moon.sidereal !== 0
    ? moon.sidereal
    : moon.rashi * 30 + moon.degrees;

  // 4. Dasha
  const dasha = calculateVimshottariDasha(date, time, 3, moonLongitude);

  // 5. Yogas
  const yogas = analyzeYogas(chartData.planets, ascRashiIdx);

  // 6. Shadbala
  const birthMonth = 9;
  const daytime = true; 
  const shadbala = calculateShadbala(
    chartData.planets.map((p: any) => ({ ...p, longitude: p.rashiIndex * 30 + p.degrees })),
    daytime,
    birthMonth
  );

  // 7. Divisional Charts (ShodashVarga)
  const planetLongitudes = chartData.planets.reduce((acc: any, p: any) => {
    acc[p.name] = p.rashiIndex * 30 + p.degrees;
    return acc;
  }, {});
  const ascLongitude = ascendant.ascendant.rashiIndex * 30 + ascendant.ascendant.degrees;
  const shodashVarga = calculateShodashVarga(planetLongitudes, ascLongitude);

  // 8. Arudha Padas (Jaimini)
  const jaiminiPlanets = chartData.planets.map((p: any) => ({
    name: p.name,
    rashiIndex: p.rashiIndex,
    degrees: p.degrees,
    house: p.house
  }));
  const padaLagna = calculatePadaLagna(ascRashiIdx, ascendant.ascendant.degrees, jaiminiPlanets);

  console.log('\nRunning 13-Layer Cognitive Jyotish Synthesis Engine for Career...');
  
  const answer = await generateClassicalAnswer(
    chartData,
    ascRashiIdx,
    { domain: 'career', nativeAge: 15 },
    shadbala,
    dasha as any,
    yogas as any,
    shodashVarga, // Real divisional data
    padaLagna, // Real Pada Lagna data
    null as any  // Mock Double Transit
  );

  console.log('\n=== CJSE CAREER VERDICT ===');
  console.log(`Direct Answer: ${answer.directAnswer}`);
  console.log(`Reasoning: ${answer.reasoning}`);
  console.log(`Timing: ${JSON.stringify(answer.timing, null, 2)}`);
  console.log(`Risks: ${answer.risks}`);
  console.log(`Therefore Clause: ${JSON.stringify(answer.thereforeClause, null, 2)}`);
  console.log(`Failure Mode: ${JSON.stringify(answer.failureMode, null, 2)}`);
  console.log(`Convergence Layers: ${answer.convergenceLayers.join(', ')}`);
}

run().catch(console.error);
