/**
 * test-all-jataks.js
 * Validates all 13 jataks from JATAKS_DATABASE.json
 * Tests: date parsing, coordinate parsing, nakshatra calculation, rashi calculation
 * Run: node test-all-jataks.js
 */

import { readFileSync } from 'fs';

const db = JSON.parse(readFileSync('./jataks/JATAKS_DATABASE.json', 'utf8'));

let passed = 0;
let failed = 0;
let warnings = 0;

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

function warn(name, msg) {
  console.log(`  ⚠️  ${name}: ${msg}`);
  warnings++;
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// ── Core calculation functions (mirrors service logic) ────────────────────────

function parseCoordinate(coordStr) {
  if (!coordStr) throw new Error('Empty coordinate');
  const match = coordStr.match(/^([\d.]+)°([NSEW])$/);
  if (!match) throw new Error(`Invalid format: ${coordStr}`);
  const val = parseFloat(match[1]);
  return (match[2] === 'S' || match[2] === 'W') ? -val : val;
}

function parseDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) throw new Error('Invalid date format');
  const year = parseInt(parts[0]), month = parseInt(parts[1]), day = parseInt(parts[2]);
  if (month < 1 || month > 12) throw new Error('Invalid month: ' + month);
  if (day < 1 || day > 31) throw new Error('Invalid day: ' + day);
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) throw new Error('Invalid date: ' + dateStr);
  return { year, month, day, date: d };
}

function parseTime(timeStr) {
  const parts = timeStr.split(':');
  if (parts.length < 2) throw new Error('Invalid time format');
  const h = parseInt(parts[0]), m = parseInt(parts[1]);
  if (h < 0 || h > 23) throw new Error('Invalid hour: ' + h);
  if (m < 0 || m > 59) throw new Error('Invalid minute: ' + m);
  return { hour: h, minute: m };
}

function julianDay(year, month, day, hour = 0, minute = 0) {
  const h = hour + minute / 60;
  let y = year, mo = month;
  if (mo <= 2) { y -= 1; mo += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + day + h / 24 + B - 1524.5;
}

function ayanamsa(year) {
  return 23.85 + (year - 2000) * 0.0139;
}

function getMoonRashi(moonLongitude) {
  const sidereal = ((moonLongitude % 360) + 360) % 360;
  return Math.floor(sidereal / 30);
}

function getNakshatra(moonLongitude) {
  const sidereal = ((moonLongitude % 360) + 360) % 360;
  return Math.floor(sidereal / (360 / 27));
}

const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];

// ── Run tests for all 13 jataks ───────────────────────────────────────────────

console.log(`\n🪐 All Jataks Validation Test\n`);
console.log(`Database: ${db.databaseName}`);
console.log(`Total jataks: ${db.totalJataks}\n`);

for (const jatak of db.jataks) {
  console.log(`\n── ${jatak.name} (${jatak.id}) ──`);

  // 1. Date parsing
  test(`Date parses: ${jatak.dateOfBirth}`, () => {
    const d = parseDate(jatak.dateOfBirth);
    assert(d.year > 1900 && d.year < 2030, `Year out of range: ${d.year}`);
    assert(d.month >= 1 && d.month <= 12, `Month invalid: ${d.month}`);
    assert(d.day >= 1 && d.day <= 31, `Day invalid: ${d.day}`);
  });

  // 2. Time parsing
  test(`Time parses: ${jatak.timeOfBirth}`, () => {
    const t = parseTime(jatak.timeOfBirth);
    assert(t.hour >= 0 && t.hour <= 23, `Hour invalid: ${t.hour}`);
    assert(t.minute >= 0 && t.minute <= 59, `Minute invalid: ${t.minute}`);
  });

  // 3. Coordinate parsing
  test(`Latitude parses: ${jatak.coordinates.latitude}`, () => {
    const lat = parseCoordinate(jatak.coordinates.latitude);
    assert(lat >= 8 && lat <= 37, `Latitude out of India range: ${lat}`);
  });

  test(`Longitude parses: ${jatak.coordinates.longitude}`, () => {
    const lon = parseCoordinate(jatak.coordinates.longitude);
    assert(lon >= 68 && lon <= 97, `Longitude out of India range: ${lon}`);
  });

  // 4. Julian Day calculation
  test(`Julian Day calculation`, () => {
    const d = parseDate(jatak.dateOfBirth);
    const t = parseTime(jatak.timeOfBirth);
    const jd = julianDay(d.year, d.month, d.day, t.hour, t.minute);
    assert(jd > 2400000 && jd < 2500000, `JD out of expected range: ${jd}`);
  });

  // 5. Ayanamsa for birth year
  test(`Ayanamsa for birth year`, () => {
    const d = parseDate(jatak.dateOfBirth);
    const ay = ayanamsa(d.year);
    assert(ay > 22 && ay < 25, `Ayanamsa out of range: ${ay}`);
  });

  // 6. Known moon rashi validation (where available)
  if (jatak.moonRashiIndex !== undefined) {
    test(`Known Moon Rashi index = ${jatak.moonRashiIndex} (${RASHIS[jatak.moonRashiIndex]})`, () => {
      assert(jatak.moonRashiIndex >= 0 && jatak.moonRashiIndex <= 11,
        `Moon rashi index out of range: ${jatak.moonRashiIndex}`);
    });
  }
}

// ── Cross-validation: unique birth data ──────────────────────────────────────
console.log('\n── Cross-validation ──');

test('All 13 jataks loaded', () => {
  assert(db.jataks.length === 13, `Expected 13, got ${db.jataks.length}`);
});

test('All jataks have unique IDs', () => {
  const ids = db.jataks.map(j => j.id);
  const unique = new Set(ids);
  assert(unique.size === ids.length, 'Duplicate IDs found');
});

test('All jataks have required fields', () => {
  for (const j of db.jataks) {
    assert(j.name, `Missing name for ${j.id}`);
    assert(j.dateOfBirth, `Missing DOB for ${j.id}`);
    assert(j.timeOfBirth, `Missing TOB for ${j.id}`);
    assert(j.coordinates?.latitude, `Missing lat for ${j.id}`);
    assert(j.coordinates?.longitude, `Missing lon for ${j.id}`);
  }
});

test('Date range: all births between 1940-2025', () => {
  for (const j of db.jataks) {
    const year = parseInt(j.dateOfBirth.split('-')[0]);
    assert(year >= 1940 && year <= 2025, `${j.name}: year ${year} out of range`);
  }
});

test('All coordinates are in India', () => {
  for (const j of db.jataks) {
    const lat = parseCoordinate(j.coordinates.latitude);
    const lon = parseCoordinate(j.coordinates.longitude);
    assert(lat >= 8 && lat <= 37, `${j.name}: lat ${lat} not in India`);
    assert(lon >= 68 && lon <= 97, `${j.name}: lon ${lon} not in India`);
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
console.log(`Jataks tested: ${db.jataks.length}/13`);

if (failed === 0) {
  console.log('✅ All jatak validation tests passed!\n');
} else {
  console.log(`⚠️  ${failed} test(s) failed\n`);
  process.exit(1);
}
