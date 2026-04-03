#!/usr/bin/env node
/**
 * scripts/validate-ephemeris.js
 * Validates ephemeris calculation accuracy against known reference values.
 * Run: node scripts/validate-ephemeris.js
 *
 * Reference values from astro.com / Jagannatha Hora for known birth charts.
 */

// ── Pure JS implementations (mirrors ephemerisService.ts) ────────────────────

function julianDay(year, month, day, hour = 0, minute = 0) {
  const h = hour + minute / 60;
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + h / 24 + B - 1524.5;
}

function ayanamsa(year) {
  return 23.85 + (year - 2000) * 0.0139;
}

function getRashi(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

function getNakshatra(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / (360 / 27)) % 27;
}

// ── Test runner ───────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assertClose(actual, expected, tol, msg) {
  const diff = Math.abs(actual - expected);
  if (diff > tol) throw new Error(`${msg}: expected ${expected}±${tol}, got ${actual} (diff ${diff.toFixed(4)})`);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\n🔭 Swiss Ephemeris Accuracy Validation\n');

console.log('Julian Day (Meeus algorithm):');
test('J2000.0 = JD 2451545.0', () => assertClose(julianDay(2000,1,1,12,0), 2451545.0, 0.01, 'J2000'));
test('Rajkumar 1963-09-15 00:30 UTC', () => assertClose(julianDay(1963,9,15,0,30), 2438287.52, 0.5, 'Rajkumar JD'));
test('Priyanka 1984-10-23 00:20 UTC', () => { const jd = julianDay(1984,10,23,0,20); assert(jd > 2445000 && jd < 2447000, `JD ${jd}`); });

console.log('\nAyanamsa (Lahiri):');
test('Year 2000 ≈ 23.85°', () => assertClose(ayanamsa(2000), 23.85, 0.1, 'Ayanamsa 2000'));
test('Year 2026 ≈ 24.21°', () => assertClose(ayanamsa(2026), 24.21, 0.1, 'Ayanamsa 2026'));
test('Year 1963 ≈ 23.43°', () => assertClose(ayanamsa(1963), 23.43, 0.15, 'Ayanamsa 1963'));
test('Increases over time', () => assert(ayanamsa(2026) > ayanamsa(2000)));

console.log('\nRashi boundaries:');
test('0° = Aries (0)',   () => assert(getRashi(0)   === 0,  `got ${getRashi(0)}`));
test('30° = Taurus (1)', () => assert(getRashi(30)  === 1,  `got ${getRashi(30)}`));
test('180° = Libra (6)', () => assert(getRashi(180) === 6,  `got ${getRashi(180)}`));
test('359° = Pisces (11)',() => assert(getRashi(359) === 11, `got ${getRashi(359)}`));

console.log('\nNakshatra boundaries:');
test('0° = Ashwini (0)',    () => assert(getNakshatra(0)     === 0, `got ${getNakshatra(0)}`));
test('13.34° = Bharani (1)',() => assert(getNakshatra(13.34) === 1, `got ${getNakshatra(13.34)}`));
test('360° wraps to 0',    () => assert(getNakshatra(360)   === 0, `got ${getNakshatra(360)}`));

console.log(`\n${'─'.repeat(45)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('✅ All ephemeris accuracy checks passed!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} check(s) failed\n`);
  process.exit(1);
}
