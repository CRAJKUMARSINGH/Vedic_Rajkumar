import { generateComprehensiveHoroscope } from '../src/services/horoscopeService.ts';

async function main() {
  const dob = '2011-09-18';
  const result = generateComprehensiveHoroscope(dob);
  console.log('=== Career Prediction ===');
  console.log('Title:', result.career.title);
  console.log('Prediction:', result.career.prediction);
  console.log('Lucky Numbers:', result.career.luckyNumbers);
  console.log('Lucky Colors:', result.career.luckyColors);
  console.log('\n=== Education (Health) Prediction ===');
  console.log('Title:', result.health.title);
  console.log('Prediction:', result.health.prediction);
  console.log('Lucky Numbers:', result.health.luckyNumbers);
  console.log('Lucky Colors:', result.health.luckyColors);
}

main();
