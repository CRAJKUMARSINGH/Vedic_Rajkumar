import { calculatePrecisePlanetaryPositions } from '../src/services/precisionEphemerisService.ts';

async function main() {
  const dob = '2011-09-18';
  const tob = '06:58';
  const res = calculatePrecisePlanetaryPositions(dob, tob);
  console.log('--- Planetary Signs ---');
  res.planets.forEach(p => {
    console.log(`${p.name}: ${p.rashiName} (${p.degrees.toFixed(2)}°) in house ${p.house}`);
  });
  console.log('Ascendant:', res.ascendant.rashiName, res.ascendant.degrees.toFixed(2));
}

main();
