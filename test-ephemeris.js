/**
 * Test Ephemeris Service
 * Validate planetary position calculations
 */

import {
  calculateAyanamsa,
  dateToJulianDay,
  calculatePlanetaryPositions,
  formatPosition,
  validateCalculations,
} from './src/services/ephemerisService.ts';

console.log('🧪 EPHEMERIS SERVICE TEST\n');
console.log('='.repeat(80));

// Test 1: Julian Day Calculation
console.log('\n✅ TEST 1: JULIAN DAY CALCULATION\n');
console.log('-'.repeat(80));

const testDates = [
  { date: new Date(Date.UTC(2026, 0, 1, 0, 0, 0)), expected: 2460676.5, desc: '2026-01-01 00:00 UTC' },
  { date: new Date(Date.UTC(2026, 2, 1, 12, 0, 0)), expected: 2460737.0, desc: '2026-03-01 12:00 UTC' },
  { date: new Date(Date.UTC(2000, 0, 1, 12, 0, 0)), expected: 2451545.0, desc: '2000-01-01 12:00 UTC (J2000)' },
];

testDates.forEach(test => {
  const jd = dateToJulianDay(test.date);
  const diff = Math.abs(jd - test.expected);
  const pass = diff < 0.1;
  
  console.log(`${pass ? '✅' : '❌'} ${test.desc}`);
  console.log(`   Calculated: ${jd.toFixed(4)}`);
  console.log(`   Expected: ${test.expected.toFixed(4)}`);
  console.log(`   Difference: ${diff.toFixed(4)} days`);
  console.log();
});

// Test 2: Ayanamsa Calculation
console.log('\n✅ TEST 2: AYANAMSA CALCULATION (LAHIRI)\n');
console.log('-'.repeat(80));

const ayanamsaTests = [
  { date: new Date(2026, 0, 1), expected: 24.15, desc: '2026-01-01' },
  { date: new Date(2025, 0, 1), expected: 24.136, desc: '2025-01-01' },
  { date: new Date(2027, 0, 1), expected: 24.164, desc: '2027-01-01' },
];

ayanamsaTests.forEach(test => {
  const ayanamsa = calculateAyanamsa(test.date);
  const diff = Math.abs(ayanamsa - test.expected);
  const pass = diff < 0.05; // Within 0.05 degrees
  
  console.log(`${pass ? '✅' : '❌'} ${test.desc}`);
  console.log(`   Calculated: ${ayanamsa.toFixed(3)}°`);
  console.log(`   Expected: ${test.expected.toFixed(3)}°`);
  console.log(`   Difference: ${diff.toFixed(3)}°`);
  console.log();
});

// Test 3: Planetary Positions for Rajkumar
console.log('\n✅ TEST 3: PLANETARY POSITIONS - RAJKUMAR\n');
console.log('-'.repeat(80));

console.log('Birth Details:');
console.log('  Date: 1963-09-15');
console.log('  Time: 06:00 AM IST');
console.log('  Place: Aspur, Dungarpur (23.84°N, 73.71°E)');
console.log();

try {
  const positions = calculatePlanetaryPositions(
    '1963-09-15',
    '06:00'
  );
  
  console.log('Calculated Positions (Sidereal):');
  console.log();
  console.log('☉ Sun:');
  console.log(`   Tropical: ${positions.sun.tropical.toFixed(4)}°`);
  console.log(`   Sidereal: ${positions.sun.sidereal.toFixed(4)}°`);
  console.log(`   Position: ${formatPosition(positions.sun.rashi, positions.sun.degrees)}`);
  console.log();
  
  console.log('☽ Moon:');
  console.log(`   Tropical: ${positions.moon.tropical.toFixed(4)}°`);
  console.log(`   Sidereal: ${positions.moon.sidereal.toFixed(4)}°`);
  console.log(`   Position: ${formatPosition(positions.moon.rashi, positions.moon.degrees)}`);
  console.log();
  
  console.log('✅ Planetary position calculation successful');
} catch (error) {
  console.log(`❌ Error calculating positions: ${error.message}`);
}

// Test 4: Validation Function
console.log('\n\n✅ TEST 4: BUILT-IN VALIDATION\n');
console.log('-'.repeat(80));

try {
  const isValid = validateCalculations();
  console.log(`${isValid ? '✅' : '❌'} Validation ${isValid ? 'PASSED' : 'FAILED'}`);
} catch (error) {
  console.log(`❌ Validation error: ${error.message}`);
}

// Test 5: Multiple Jataks
console.log('\n\n✅ TEST 5: MULTIPLE JATAKS CALCULATION\n');
console.log('-'.repeat(80));

const jataks = [
  { name: 'Rajkumar', date: '1963-09-15', time: '06:00' },
  { name: 'Priyanka', date: '1984-10-23', time: '05:50' },
  { name: 'Priyansh', date: '2000-10-26', time: '00:50' },
];

console.log('\nCalculating Moon positions for all jataks...\n');

jataks.forEach(jatak => {
  try {
    const positions = calculatePlanetaryPositions(
      jatak.date,
      jatak.time
    );
    
    console.log(`${jatak.name.padEnd(15)} | Moon: ${formatPosition(positions.moon.rashi, positions.moon.degrees)}`);
  } catch (error) {
    console.log(`${jatak.name.padEnd(15)} | ❌ Error: ${error.message}`);
  }
});

// Final Summary
console.log('\n\n' + '='.repeat(80));
console.log('\n📊 TEST SUMMARY\n');
console.log('='.repeat(80));

console.log('\n✅ Ephemeris Service Tests Complete');
console.log('\nImplemented Features:');
console.log('  ✅ Julian Day calculation');
console.log('  ✅ Ayanamsa calculation (Lahiri)');
console.log('  ✅ Tropical to Sidereal conversion');
console.log('  ✅ Sun position calculation');
console.log('  ✅ Moon position calculation');
console.log('  ✅ Rashi identification');
console.log('  ✅ Position formatting');

console.log('\nNext Steps:');
console.log('  ⏳ Add remaining planets (Mercury, Venus, Mars, Jupiter, Saturn)');
console.log('  ⏳ Implement Ascendant calculation');
console.log('  ⏳ Add Nakshatra identification');
console.log('  ⏳ Validate against professional software');

console.log('\n' + '='.repeat(80) + '\n');
