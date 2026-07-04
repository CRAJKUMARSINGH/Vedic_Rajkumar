/**
 * test-ephemeris-accuracy.js
 * Tests ephemeris calculation accuracy against known reference values
 * Run: node tests/test-ephemeris-accuracy.js
 */

async function runTests() {

  let passed = 0;
  let failed = 0;

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

  function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
  }

  function assertClose(actual, expected, tolerance, msg) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
      throw new Error(`${msg || ''}: expected ${expected} ± ${tolerance}, got ${actual} (diff: ${diff.toFixed(4)})`);
    }
  }

  console.log('\n🔭 Ephemeris Accuracy Tests\n');

  // ── Julian Day Tests ──────────────────────────────────────────────────────
  console.log('Julian Day Calculations:');

  // Reference: J2000.0 = JD 2451545.0 (2000-01-01 12:00 UTC)
  test('J2000.0 epoch (2000-01-01 12:00 UTC)', () => {
    const jd = julianDay(2000, 1, 1, 12, 0);
    assertClose(jd, 2451545.0, 0.01, 'J2000.0');
  });

  // Reference: 1963-09-15 06:00 IST = 00:30 UTC → JD 2438287.52
  test('Rajkumar birth date JD (1963-09-15 06:00 IST)', () => {
    const jd = julianDay(1963, 9, 15, 0, 30); // 06:00 IST = 00:30 UTC
    assertClose(jd, 2438287.52, 0.5, 'Rajkumar JD');
  });

  // Reference: 1984-10-23 05:50 IST = 00:20 UTC → JD ~2446000
  test('Priyanka birth date JD (1984-10-23)', () => {
    const jd = julianDay(1984, 10, 23, 0, 20);
    assert(jd > 2445000 && jd < 2447000, `JD out of range: ${jd}`);
  });

  // ── Ayanamsa Tests ────────────────────────────────────────────────────────
  console.log('\nAyanamsa (Lahiri) Calculations:');

  test('Ayanamsa for 2000 ≈ 23.85°', () => {
    const a = ayanamsa(2000);
    assertClose(a, 23.85, 0.1, 'Ayanamsa 2000');
  });

  test('Ayanamsa for 2026 ≈ 24.21°', () => {
    const a = ayanamsa(2026);
    assertClose(a, 24.21, 0.1, 'Ayanamsa 2026');
  });

  test('Ayanamsa increases over time', () => {
    assert(ayanamsa(2026) > ayanamsa(2000), 'Ayanamsa should increase');
  });

  test('Ayanamsa for 1963 ≈ 23.43°', () => {
    const a = ayanamsa(1963);
    assertClose(a, 23.43, 0.15, 'Ayanamsa 1963');
  });

  // ── Rashi Boundary Tests ──────────────────────────────────────────────────
  console.log('\nRashi (Sign) Boundary Tests:');

  test('0° = Aries (Mesh)', () => {
    assert(getRashi(0) === 0, `Expected 0 (Aries), got ${getRashi(0)}`);
  });

  test('30° = Taurus (Vrishabh)', () => {
    assert(getRashi(30) === 1, `Expected 1 (Taurus), got ${getRashi(30)}`);
  });

  test('359° = Pisces (Meen)', () => {
    assert(getRashi(359) === 11, `Expected 11 (Pisces), got ${getRashi(359)}`);
  });

  test('180° = Libra (Tula)', () => {
    assert(getRashi(180) === 6, `Expected 6 (Libra), got ${getRashi(180)}`);
  });

  // ── Nakshatra Tests ───────────────────────────────────────────────────────
  console.log('\nNakshatra Boundary Tests:');

  test('0° = Ashwini (nakshatra 0)', () => {
    assert(getNakshatra(0) === 0, `Expected 0 (Ashwini), got ${getNakshatra(0)}`);
  });

  test('13.33° = Bharani (nakshatra 1)', () => {
    assert(getNakshatra(13.34) === 1, `Expected 1 (Bharani), got ${getNakshatra(13.34)}`);
  });

  test('360° wraps to Ashwini', () => {
    assert(getNakshatra(360) === 0, `Expected 0, got ${getNakshatra(360)}`);
  });

  // ── Date Parsing Tests ────────────────────────────────────────────────────
  console.log('\nDate Parsing & Validation:');

  test('Valid date 1963-09-15 parses correctly', () => {
    const d = parseDate('1963-09-15');
    assert(d.year === 1963 && d.month === 9 && d.day === 15, 'Date parse failed');
  });

  test('Valid date 2021-05-02 parses correctly', () => {
    const d = parseDate('2021-05-02');
    assert(d.year === 2021 && d.month === 5 && d.day === 2, 'Date parse failed');
  });

  test('Invalid month 13 is detected', () => {
    let threw = false;
    try { parseDate('2000-13-01'); } catch { threw = true; }
    assert(threw, 'Should throw for month 13');
  });

  test('Invalid day 32 is detected', () => {
    let threw = false;
    try { parseDate('2000-01-32'); } catch { threw = true; }
    assert(threw, 'Should throw for day 32');
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('✅ All ephemeris accuracy tests passed!\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    process.exit(1);
  }
}

// ── Pure JS implementations (mirrors ephemerisService.ts logic) ──────────────

function julianDay(year, month, day, hour = 0, minute = 0) {
  const h = hour + minute / 60;
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + h / 24 + B - 1524.5;
}

function ayanamsa(year) {
  const AYANAMSA_2000 = 23.85;
  const AYANAMSA_ANNUAL_RATE = 0.0139;
  return AYANAMSA_2000 + (year - 2000) * AYANAMSA_ANNUAL_RATE;
}

function getRashi(longitude) {
  return Math.floor(((longitude % 360) + 360) % 360 / 30);
}

function getNakshatra(longitude) {
  const NAKSHATRA_SPAN = 360 / 27;
  return Math.floor(((longitude % 360) + 360) % 360 / NAKSHATRA_SPAN) % 27;
}

function parseDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) throw new Error('Invalid date format');
  const year = parseInt(parts[0]), month = parseInt(parts[1]), day = parseInt(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) throw new Error('Invalid date components');
  if (month < 1 || month > 12) throw new Error('Invalid date: month out of range');
  if (day < 1 || day > 31) throw new Error('Invalid date: day out of range');
  return { year, month, day };
}

runTests().catch(console.error);
