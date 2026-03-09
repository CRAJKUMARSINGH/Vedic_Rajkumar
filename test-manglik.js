/**
 * Test Manglik Dosha Detection
 * Tests with all 13 jataks from database
 */

import { readFileSync } from 'fs';
const jataksData = JSON.parse(readFileSync('./jataks/JATAKS_DATABASE.json', 'utf-8'));

console.log('🔍 Testing Manglik Dosha Detection\n');
console.log('=' .repeat(80));

// Helper to parse coordinates
function parseCoordinates(coordStr) {
  const match = coordStr.match(/([0-9.]+)°/);
  return match ? parseFloat(match[1]) : 0;
}

// Test each jatak
jataksData.jataks.forEach((jatak, index) => {
  console.log(`\n${index + 1}. ${jatak.name}`);
  console.log('-'.repeat(80));
  console.log(`Birth: ${jatak.dateOfBirth} at ${jatak.timeOfBirth}`);
  console.log(`Place: ${jatak.placeOfBirth}, ${jatak.state}`);
  
  const lat = parseCoordinates(jatak.coordinates.latitude);
  const lon = parseCoordinates(jatak.coordinates.longitude);
  
  try {
    const result = checkManglikDosha(
      jatak.dateOfBirth,
      jatak.timeOfBirth,
      lat,
      lon
    );
    
    console.log(`\n📊 RESULT:`);
    console.log(`   Status: ${result.effectiveManglik ? '⚠️ MANGLIK' : '✅ NOT MANGLIK'}`);
    console.log(`   Mars House: ${result.marsHouse} (${result.marsRashi})`);
    console.log(`   Severity: ${result.severity}`);
    console.log(`   Cancellations: ${result.cancellations.filter(c => c.applies).length}/${result.cancellations.length} active`);
    
    if (result.effectiveManglik) {
      console.log(`\n   ⚠️ ${result.description.en}`);
      console.log(`\n   🕉️ Remedies (${result.remedies.en.length}):`);
      result.remedies.en.slice(0, 3).forEach((remedy, i) => {
        console.log(`      ${i + 1}. ${remedy}`);
      });
    } else {
      console.log(`\n   ✅ ${result.description.en}`);
    }
    
    // Show active cancellations
    const activeCancellations = result.cancellations.filter(c => c.applies);
    if (activeCancellations.length > 0) {
      console.log(`\n   ✓ Active Cancellations:`);
      activeCancellations.forEach(c => {
        console.log(`      • ${c.rule}`);
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('✅ Testing Complete!\n');
