/**
 * verify_accuracy_fix.ts
 * 
 * Verification script proving the accuracy fix works correctly.
 * Tests the three-layer pipeline: Precision Engine → Dasha → Nakshatra
 *
 * Test case: Veerpratap Singh Rathore
 *   DOB: 18 September 2011, 06:58 AM IST, Vidisha MP
 *   Expected: Moon at ~32.67° sidereal (Taurus 2°40'), Krittika Pada 2, Sun Dasha lord
 */

import { calculatePrecisePlanetaryPositions } from '../src/services/precisionEphemerisService';
import { calculateNakshatra, getNakshatraInfo } from '../src/services/nakshatraService';
import { calculateVimshottariDasha } from '../src/services/dashaService';
import { calculateMoonPosition } from '../src/services/ephemerisService';

const DATE = '2011-09-18';
const TIME = '06:58';

console.log('═══════════════════════════════════════════════════════════════');
console.log('  ACCURACY FIX VERIFICATION — Veerpratap Singh Rathore');
console.log('  DOB: 18 Sep 2011, 06:58 AM IST, Vidisha MP');
console.log('═══════════════════════════════════════════════════════════════\n');

// ──────────────────────────────────────────────────────────────────────────────
// 1. Legacy vs Precision Moon
// ──────────────────────────────────────────────────────────────────────────────
const legacyMoon = calculateMoonPosition(DATE, TIME);
const legacyLon = legacyMoon.rashiIndex * 30 + legacyMoon.degrees;

const precise = calculatePrecisePlanetaryPositions(DATE, TIME);
const preciseLon = precise.moon.sidereal;

console.log('── Moon Longitude Comparison ──');
console.log(`  Legacy engine:    ${legacyLon.toFixed(4)}° → ${legacyMoon.rashiName} ${legacyMoon.degrees.toFixed(2)}°`);
console.log(`  VSOP87 precision: ${preciseLon.toFixed(4)}° → Rashi ${precise.moon.rashi} (${precise.planets[1].rashiName}) ${precise.moon.degrees.toFixed(2)}°`);
console.log(`  Difference:       ${Math.abs(preciseLon - legacyLon).toFixed(4)}°`);
console.log();

// ──────────────────────────────────────────────────────────────────────────────
// 2. Nakshatra — Legacy (OLD) vs Accurate (NEW)
// ──────────────────────────────────────────────────────────────────────────────
const nakshatraOld = getNakshatraInfo(DATE, TIME);  // No accurate longitude → legacy path
const nakshatraNew = getNakshatraInfo(DATE, TIME, preciseLon);  // Accurate longitude → precision path

const oldName = typeof nakshatraOld.name === 'string' ? nakshatraOld.name : (nakshatraOld.name as any).en;
const newName = typeof nakshatraNew.name === 'string' ? nakshatraNew.name : (nakshatraNew.name as any).en;

console.log('── Nakshatra Comparison ──');
console.log(`  Legacy path:   ${oldName} (Pada ${nakshatraOld.pada}) — Lord: ${nakshatraOld.lord}`);
console.log(`  Accurate path: ${newName} (Pada ${nakshatraNew.pada}) — Lord: ${nakshatraNew.lord}`);
console.log(`  Expected:      Krittika (Pada 2) — Lord: Sun`);

const nakshatraCorrect = newName === 'Krittika' && nakshatraNew.pada === 2;
console.log(`  ✓ Nakshatra CORRECT: ${nakshatraCorrect ? 'YES ✅' : 'NO ❌'}`);
console.log();

// ──────────────────────────────────────────────────────────────────────────────
// 3. Dasha — Legacy (OLD) vs Accurate (NEW)
// ──────────────────────────────────────────────────────────────────────────────
const dashaOld = calculateVimshottariDasha(DATE, TIME);  // No accurate longitude → legacy path
const dashaNew = calculateVimshottariDasha(DATE, TIME, 3, preciseLon);  // Accurate longitude

console.log('── Dasha Comparison ──');
console.log(`  Legacy path:   First Dasha lord = ${dashaOld.moonNakshatraLord}, Nakshatra = ${dashaOld.moonNakshatraName}`);
console.log(`  Accurate path: First Dasha lord = ${dashaNew.moonNakshatraLord}, Nakshatra = ${dashaNew.moonNakshatraName}`);
console.log(`  Expected:      First Dasha lord = Sun (Krittika lord)`);

const dashaLordCorrect = dashaNew.moonNakshatraLord === 'Sun';
console.log(`  ✓ Dasha Lord CORRECT: ${dashaLordCorrect ? 'YES ✅' : 'NO ❌'}`);
console.log();

// ──────────────────────────────────────────────────────────────────────────────
// 4. Current Dasha (should be Mars as of 2026)
// ──────────────────────────────────────────────────────────────────────────────
const currentMD = dashaNew.currentMahadasha;
console.log('── Current Active Dasha (May 2026) ──');
if (currentMD) {
  const start = currentMD.startDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  const end = currentMD.endDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  console.log(`  Active Mahadasha: ${currentMD.planet} (${start} → ${end})`);
  console.log(`  Expected:         Mars (active ~2024-2031 per chatlog)`);
  
  const currentMDCorrect = currentMD.planet === 'Mars';
  console.log(`  ✓ Current MD CORRECT: ${currentMDCorrect ? 'YES ✅' : 'NO ❌'}`);
} else {
  console.log('  ⚠ No active Mahadasha found (date out of range)');
}
console.log();

// ──────────────────────────────────────────────────────────────────────────────
// 5. Full Dasha Timeline
// ──────────────────────────────────────────────────────────────────────────────
console.log('── Full Mahadasha Timeline (Accurate) ──');
dashaNew.mahadashas.forEach(md => {
  const start = md.startDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  const end = md.endDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
  const active = md.isActive ? ' ◀ ACTIVE' : '';
  console.log(`  ${md.planet.padEnd(8)} ${start.padEnd(12)} → ${end.padEnd(12)} (${md.durationYears.toFixed(1)} yrs)${active}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  Nakshatra: ${nakshatraCorrect ? '✅ PASS' : '❌ FAIL'} — ${newName} Pada ${nakshatraNew.pada}`);
console.log(`  Dasha Lord: ${dashaLordCorrect ? '✅ PASS' : '❌ FAIL'} — ${dashaNew.moonNakshatraLord}`);
console.log(`  Current MD: ${currentMD?.planet === 'Mars' ? '✅ PASS' : '❌ FAIL'} — ${currentMD?.planet ?? 'N/A'}`);
console.log('═══════════════════════════════════════════════════════════════');
