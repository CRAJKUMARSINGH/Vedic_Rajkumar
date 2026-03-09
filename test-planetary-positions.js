/**
 * Test Planetary Positions Calculation
 * Tests all 9 planetary positions for sample jataks
 */

import { calculateCompletePlanetaryPositions, RASHI_NAMES } from './src/services/ephemerisService.ts';
import { readFileSync } from 'fs';

const jataksData = JSON.parse(readFileSync('./jataks/JATAKS_DATABASE.json', 'utf-8'));

console.log('='.repeat(80));
console.log('PLANETARY POSITIONS TEST');
console.log('='.repeat(80));
console.log();

// Test with first 3 jataks
const testJataks = jataksData.jataks.slice(0, 3);

for (const jatak of testJataks) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`Testing: ${jatak.name}`);
  console.log(`Birth: ${jatak.dateOfBirth} at ${jatak.timeOfBirth}`);
  console.log(`Place: ${jatak.placeOfBirth}`);
  
  try {
    const positions = calculateCompletePlanetaryPositions(
      jatak.dateOfBirth,
      jatak.timeOfBirth
    );
    
    console.log(`\n✅ PLANETARY POSITIONS:`);
    console.log(`   Ayanamsa: ${positions.ayanamsa.toFixed(2)}°`);
    console.log(`   Julian Day: ${positions.julianDay.toFixed(2)}`);
    console.log();
    
    // Display all planets
    const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'rahu', 'ketu'];
    const planetSymbols = {
      sun: '☉',
      moon: '☽',
      mercury: '☿',
      venus: '♀',
      mars: '♂',
      jupiter: '♃',
      saturn: '♄',
      rahu: '☊',
      ketu: '☋'
    };
    
    console.log('   Planet      Rashi           Degrees    Sidereal');
    console.log('   ' + '─'.repeat(60));
    
    for (const planet of planets) {
      const pos = positions[planet];
      const symbol = planetSymbols[planet];
      const name = planet.charAt(0).toUpperCase() + planet.slice(1);
      const rashiName = pos.rashiName.padEnd(12);
      const degrees = `${Math.floor(pos.degrees)}°${Math.floor((pos.degrees % 1) * 60)}'`.padEnd(10);
      const sidereal = pos.sidereal.toFixed(2) + '°';
      const retro = pos.retrograde ? ' (R)' : '';
      
      console.log(`   ${symbol} ${name.padEnd(9)} ${rashiName} ${degrees} ${sidereal}${retro}`);
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log('TEST COMPLETE');
console.log('='.repeat(80));
console.log();
console.log('📝 NOTES:');
console.log('   • Rahu and Ketu are always retrograde (R) and 180° apart');
console.log('   • Accuracy: ±1-3 degrees (simplified algorithms)');
console.log('   • Cross-verify with AstroSage or Jagannatha Hora');
console.log('   • For production, integrate Swiss Ephemeris');
console.log();
