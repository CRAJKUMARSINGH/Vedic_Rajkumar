import { calcPlanetsAccurate, calcHousesAccurate } from '../src/services/swissEphemerisService.ts';
import { calculateCompletePlanetaryPositions } from '../src/services/ephemerisService.ts';
import { calculatePrecisePlanetaryPositions } from '../src/services/precisionEphemerisService.ts';

async function main() {
  const dob = '2011-09-18';
  const tob = '06:58';
  const lat = 23.5235;
  const lon = 77.8131;

  console.log('--- SWISS EPHEMERIS CALCULATIONS FOR VEERPRATAP ---');
  try {
    const planetsSwiss = await calcPlanetsAccurate(dob, tob);
    console.log('Swiss Moon longitude:', planetsSwiss.moon.sidereal.toFixed(4));
    console.log('Swiss Moon Rashi:', planetsSwiss.moon.rashiName, 'degrees in Rashi:', planetsSwiss.moon.degrees.toFixed(4));
    console.log('Swiss Ayanamsa:', planetsSwiss.ayanamsa.toFixed(4));
    
    const housesSwiss = await calcHousesAccurate(dob, tob, lat, lon);
    console.log('Swiss Ascendant (Lagna):', housesSwiss.ascendant.toFixed(4));
  } catch (err) {
    console.error('Swiss Eph error:', err);
  }

  console.log('\n--- FALLBACK (JS) CALCULATIONS FOR VEERPRATAP ---');
  try {
    const planetsJS = calculateCompletePlanetaryPositions(dob, tob);
    console.log('JS Moon longitude:', planetsJS.moon.sidereal.toFixed(4));
    console.log('JS Moon Rashi:', planetsJS.moon.rashiName, 'degrees in Rashi:', planetsJS.moon.degrees.toFixed(4));
  } catch (err) {
    console.error('JS Eph error:', err);
  }

  console.log('\n--- PRECISION EPHEMERIS (VSOP87) CALCULATIONS FOR VEERPRATAP ---');
  try {
    const precise = calculatePrecisePlanetaryPositions(dob, tob);
    console.log('VSOP87 Moon longitude:', precise.moon.sidereal.toFixed(4));
    console.log('VSOP87 Moon Rashi:', precise.planets[1].rashiName, 'degrees in Rashi:', precise.moon.degrees.toFixed(4));
  } catch (err) {
    console.error('Precise Eph error:', err);
  }
}

main();
