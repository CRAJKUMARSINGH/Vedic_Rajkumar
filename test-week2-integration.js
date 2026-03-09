/**
 * Week 2 Integration Test
 * Tests Ascendant and Nakshatra calculations for all jataks
 */

import { calculateCompleteAscendant } from './src/services/ascendantService.ts';
import { getNakshatraInfo } from './src/services/nakshatraService.ts';
import { readFileSync } from 'fs';

const jataksData = JSON.parse(readFileSync('./jataks/JATAKS_DATABASE.json', 'utf-8'));

console.log('='.repeat(80));
console.log('WEEK 2 INTEGRATION TEST: Ascendant & Nakshatra Calculations');
console.log('='.repeat(80));
console.log();

// Parse coordinates from string format "23.84°N" to decimal
function parseCoordinate(coordStr, isLongitude = false) {
  const match = coordStr.match(/([0-9.]+)°([NSEW])/);
  if (!match) return 0;
  
  let value = parseFloat(match[1]);
  const direction = match[2];
  
  // Apply sign based on direction
  if (direction === 'S' || direction === 'W') {
    value = -value;
  }
  
  return value;
}

let successCount = 0;
let errorCount = 0;

// Test each jatak
for (const jatak of jataksData.jataks) {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`Testing: ${jatak.name} (${jatak.id})`);
  console.log(`Birth: ${jatak.dateOfBirth} at ${jatak.timeOfBirth}`);
  console.log(`Place: ${jatak.placeOfBirth}, ${jatak.state}`);
  
  // Parse coordinates
  const lat = parseCoordinate(jatak.coordinates.latitude);
  const lon = parseCoordinate(jatak.coordinates.longitude, true);
  console.log(`Coordinates: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
  
  try {
    // Calculate Ascendant
    const ascendant = calculateCompleteAscendant(
      jatak.dateOfBirth,
      jatak.timeOfBirth,
      lat,
      lon
    );
    
    console.log(`\n✅ ASCENDANT (Lagna):`);
    console.log(`   Rashi: ${ascendant.ascendant.rashiName}`);
    console.log(`   Degrees: ${ascendant.ascendant.degrees.toFixed(2)}°`);
    console.log(`   Sidereal: ${ascendant.ascendant.sidereal.toFixed(2)}°`);
    console.log(`   Ayanamsa: ${ascendant.ayanamsa.toFixed(2)}°`);
    
    // Calculate Nakshatra
    const nakshatra = getNakshatraInfo(
      jatak.dateOfBirth,
      jatak.timeOfBirth
    );
    
    console.log(`\n✅ NAKSHATRA (Birth Star):`);
    console.log(`   Name: ${nakshatra.name.en} (${nakshatra.name.hi})`);
    console.log(`   Pada: ${nakshatra.pada}`);
    console.log(`   Lord: ${nakshatra.lord}`);
    console.log(`   Deity: ${nakshatra.deity}`);
    console.log(`   Symbol: ${nakshatra.symbol}`);
    
    // Show first 3 house cusps
    console.log(`\n📊 House Cusps (first 3):`);
    for (let i = 0; i < 3; i++) {
      const house = ascendant.houseCusps[i];
      console.log(`   House ${house.house}: ${house.rashiName} (Lord: ${house.lord})`);
    }
    
    successCount++;
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    errorCount++;
  }
}

// Summary
console.log(`\n${'='.repeat(80)}`);
console.log('TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total Jataks: ${jataksData.totalJataks}`);
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`Success Rate: ${((successCount / jataksData.totalJataks) * 100).toFixed(1)}%`);
console.log();

if (successCount === jataksData.totalJataks) {
  console.log('🎉 ALL TESTS PASSED! Week 2 integration complete.');
} else {
  console.log('⚠️  Some tests failed. Review errors above.');
}

console.log('='.repeat(80));
console.log();

// Note about accuracy
console.log('📝 ACCURACY NOTE:');
console.log('   These calculations use simplified algorithms for rapid development.');
console.log('   Expected accuracy: ±2-3 degrees for Ascendant');
console.log('   For production, integrate Swiss Ephemeris or professional API.');
console.log('   Cross-verify with AstroSage, Jagannatha Hora, or other software.');
console.log();
