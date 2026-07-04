// career_education_test.ts
import { generateComprehensiveHoroscope } from '../src/services/horoscopeService.ts';
import { calculateShodashVarga } from '../src/services/divisionalChartsService.ts';
import { calculatePrecisePlanetaryPositions } from '../src/services/precisionEphemerisService.ts';

async function main() {
  const dob = '2011-09-18';
  const tob = '06:58'; // time in HH:MM
  // Generate horoscope predictions (daily)
  const comp = generateComprehensiveHoroscope(dob, 'daily');
  const career = comp.career;
  console.log('--- Career Prediction ---');
  console.log('Title:', career.title);
  console.log('Prediction:', career.prediction);
  console.log('Lucky Numbers:', career.luckyNumbers);
  console.log('Lucky Colors:', career.luckyColors);

  // Get precise planetary positions for D24 education chart
  const precise = calculatePrecisePlanetaryPositions(dob, tob);
  const planetLongitudes: Record<string, number> = {};
  precise.planets.forEach(p => {
    planetLongitudes[p.name] = p.sidereal;
  });
  const ascLon = precise.ascendant.sidereal;
  const shodash = calculateShodashVarga(planetLongitudes, ascLon);
  const eduChart = shodash.charts.find(c => c.division === 24);
  if (eduChart) {
    console.log('\n--- Education (D24) Chart Summary ---');
    console.log('Purpose:', eduChart.purpose);
    console.log('Overall Strength:', eduChart.strength.overall.toFixed(2));
    console.log('Exalted Count:', eduChart.strength.exaltedCount);
    console.log('Own Sign Count:', eduChart.strength.ownHouseCount);
    console.log('Interpretation:', eduChart.interpretations.overallVerdict);
    console.log('Details:', eduChart.interpretations.finalResolvedMeaning);
  } else {
    console.log('Education chart not found');
  }
}

main().catch(err => console.error('Error:', err));
