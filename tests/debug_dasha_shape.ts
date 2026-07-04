import { calcPlanetsAccurate, calculateCompleteAscendant, calculateVimshottariDasha } from '../packages/core/src';

async function run() {
  const date = '2011-09-18', time = '06:58', lat = 23.52, lon = 77.82;
  const asc = calculateCompleteAscendant(date, time, lat, lon);
  const ascIdx = asc.ascendant.rashiIndex;
  console.log('Lagna rashiIndex:', ascIdx, '(', asc.ascendant.rashiName, ')');

  const chart = await calcPlanetsAccurate(date, time);
  (chart.planets as any[]) = (chart.planets as any[]).map((p: any) => ({
    ...p, house: ((p.rashiIndex - ascIdx + 12) % 12) + 1
  }));

  console.log('\nPlanets:');
  (chart.planets as any[]).forEach((p: any) => {
    console.log(`  ${p.name}: rashiIndex=${p.rashiIndex}, house=${p.house}, deg=${p.degrees?.toFixed(1)}`);
  });

  const moon: any = chart.moon;
  const moonLon = (moon.sidereal && moon.sidereal !== 0) ? moon.sidereal : moon.rashi * 30 + moon.degrees;
  console.log('\nMoon longitude for dasha:', moonLon.toFixed(2));

  const dasha = calculateVimshottariDasha(date, time, 3, moonLon);
  console.log('\nDasha top-level keys:', Object.keys(dasha));

  // Print first 2 levels deep
  const dashaAny = dasha as any;
  for (const key of Object.keys(dashaAny).slice(0, 8)) {
    const val = dashaAny[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      console.log(`  ${key}:`, JSON.stringify(val).slice(0, 120));
    } else if (Array.isArray(val)) {
      console.log(`  ${key}: [array len=${val.length}]`, JSON.stringify(val[0]).slice(0, 120));
    } else {
      console.log(`  ${key}:`, val);
    }
  }
}

run().catch(console.error);
