// Find Auspicious Muhurat for Priyanka's Promotion Joining
// Born: 23 Oct 1984, 5:50 AM, Ahmedabad
// Event: Joining on Promotion (Business Start)
// Timeframe: Next 7 days from May 5, 2026 (starting tomorrow)

const AYANAMSA_2000 = 23.85;
const AYANAMSA_RATE = 0.0139;

// Ahmedabad coordinates
const LATITUDE = 23.0225;
const LONGITUDE = 72.5714;

function julianDay(y, mo, d, h, mi) {
  const hh = h + mi / 60;
  let yr = y, m = mo;
  if (m <= 2) { yr--; m += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (m + 1)) + d + hh / 24 + B - 1524.5;
}

function calculatePlanetaryPositions(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const JD = julianDay(year, month, day, hours, minutes);
  const n = JD - 2451545.0;
  const T = n / 36525.0;
  const ay = AYANAMSA_2000 + (year - 2000) * AYANAMSA_RATE;
  
  const sin = x => Math.sin(x * Math.PI / 180);
  const sid = t => (((t - ay) % 360) + 360) % 360;
  
  // Sun
  const sunL = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const sunG = ((357.528 + 0.9856003 * n) % 360 + 360) % 360;
  const sunLongitude = sid(sunL + 1.915 * sin(sunG) + 0.020 * sin(2 * sunG));
  
  // Moon
  const moonL = ((218.316 + 13.176396 * n) % 360 + 360) % 360;
  const moonM = ((134.963 + 13.064993 * n) % 360 + 360) % 360;
  const moonMs = ((357.529 + 0.985600 * n) % 360 + 360) % 360;
  const moonLongitude = sid(moonL + 6.289 * sin(moonM) + 1.274 * sin(2 * (moonL - moonMs)) +
    0.658 * sin(2 * (moonL - moonMs)) + 0.214 * sin(2 * moonM) - 0.186 * sin(moonMs));
  
  return { sunLongitude, moonLongitude };
}

function calculateTithi(moonLongitude, sunLongitude) {
  let diff = moonLongitude - sunLongitude;
  if (diff < 0) diff += 360;
  const tithiNumber = Math.floor(diff / 12) + 1;
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  
  const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
    paksha === 'Shukla' ? 'Purnima' : 'Amavasya'];
  
  const name = tithiNames[tithiInPaksha - 1];
  const quality = ['Amavasya', 'Chaturthi', 'Ashtami', 'Navami'].includes(name) ? 'inauspicious' : 
                  ['Purnima', 'Ekadashi', 'Dwadashi', 'Trayodashi'].includes(name) ? 'auspicious' : 'neutral';
  
  return { number: tithiNumber, name, paksha, quality };
}

function calculateNakshatra(moonLongitude) {
  const nakshatraNumber = Math.floor(moonLongitude / 13.333333333) + 1;
  const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  
  const name = nakshatraNames[nakshatraNumber - 1];
  const quality = ['Bharani', 'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula'].includes(name) ? 'inauspicious' :
                  ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'].includes(name) ? 'auspicious' : 'neutral';
  
  return { number: nakshatraNumber, name, quality };
}

function getVarDetails(date) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNumber = date.getDay();
  const name = dayNames[dayNumber];
  const quality = ['Saturday'].includes(name) ? 'inauspicious' : 
                  ['Monday', 'Wednesday', 'Thursday', 'Friday'].includes(name) ? 'auspicious' : 'neutral';
  return { day: name, number: dayNumber, quality };
}

function calculateRahuKaal(date, sunrise, sunset) {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const muhuratDuration = dayDuration / 8;
  const dayOfWeek = date.getDay();
  const rahuKaalMuhurat = [7, 1, 6, 4, 5, 3, 2][dayOfWeek];
  const rahuStart = new Date(sunrise.getTime() + (muhuratDuration * (rahuKaalMuhurat - 1)));
  const rahuEnd = new Date(sunrise.getTime() + (muhuratDuration * rahuKaalMuhurat));
  return { start: rahuStart, end: rahuEnd };
}

function calculateAbhijitMuhurat(date, sunrise, sunset) {
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const abhijitStart = new Date(sunrise.getTime() + (dayDuration * 7 / 15));
  const abhijitEnd = new Date(sunrise.getTime() + (dayDuration * 8 / 15));
  return { start: abhijitStart, end: abhijitEnd };
}

function evaluateBusinessStartMuhurat(tithi, nakshatra, varDetails, dayQuality) {
  let score = 50;
  const factors = [];
  const warnings = [];
  
  // Business Start Criteria
  const auspiciousTithis = ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Trayodashi', 'Purnima'];
  const inauspiciousTithis = ['Amavasya', 'Chaturthi', 'Navami'];
  const auspiciousNakshatras = ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Revati'];
  const inauspiciousNakshatras = ['Bharani', 'Ardra', 'Ashlesha', 'Mula'];
  const auspiciousDays = ['Wednesday', 'Thursday', 'Friday'];
  const inauspiciousDays = ['Saturday'];
  
  if (auspiciousTithis.includes(tithi.name)) {
    score += 15;
    factors.push(`✅ Auspicious Tithi: ${tithi.name} (${tithi.paksha})`);
  } else if (inauspiciousTithis.includes(tithi.name)) {
    score -= 20;
    warnings.push(`⚠️ Inauspicious Tithi: ${tithi.name}`);
  }
  
  if (auspiciousNakshatras.includes(nakshatra.name)) {
    score += 15;
    factors.push(`✅ Auspicious Nakshatra: ${nakshatra.name}`);
  } else if (inauspiciousNakshatras.includes(nakshatra.name)) {
    score -= 20;
    warnings.push(`⚠️ Inauspicious Nakshatra: ${nakshatra.name}`);
  }
  
  if (auspiciousDays.includes(varDetails.day)) {
    score += 10;
    factors.push(`✅ Auspicious Day: ${varDetails.day}`);
  } else if (inauspiciousDays.includes(varDetails.day)) {
    score -= 15;
    warnings.push(`⚠️ Inauspicious Day: ${varDetails.day}`);
  }
  
  if (tithi.paksha === 'Shukla') {
    score += 5;
    factors.push(`✅ Shukla Paksha (Bright fortnight)`);
  }
  
  score += (dayQuality - 50) * 0.2;
  
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    factors,
    warnings,
    suitability: score >= 80 ? 'EXCELLENT' : score >= 65 ? 'GOOD' : score >= 50 ? 'AVERAGE' : 'POOR'
  };
}

function calculateDayQuality(date, sunrise, sunset) {
  // Simplified day quality based on weekday
  const day = date.getDay();
  const qualityScores = [60, 75, 55, 80, 85, 75, 40]; // Sun-Sat
  return qualityScores[day];
}

function analyzeDate(date) {
  // Set time to 9:00 AM for analysis
  const analysisDate = new Date(date);
  analysisDate.setHours(9, 0, 0, 0);
  
  const positions = calculatePlanetaryPositions(analysisDate);
  const tithi = calculateTithi(positions.moonLongitude, positions.sunLongitude);
  const nakshatra = calculateNakshatra(positions.moonLongitude);
  const varDetails = getVarDetails(analysisDate);
  
  const sunrise = new Date(analysisDate);
  sunrise.setHours(6, 0, 0, 0);
  const sunset = new Date(analysisDate);
  sunset.setHours(18, 30, 0, 0);
  
  const dayQuality = calculateDayQuality(analysisDate, sunrise, sunset);
  const evaluation = evaluateBusinessStartMuhurat(tithi, nakshatra, varDetails, dayQuality);
  
  const abhijit = calculateAbhijitMuhurat(analysisDate, sunrise, sunset);
  const rahuKaal = calculateRahuKaal(analysisDate, sunrise, sunset);
  
  return {
    date: analysisDate,
    tithi,
    nakshatra,
    varDetails,
    dayQuality,
    evaluation,
    abhijit,
    rahuKaal,
    sunrise,
    sunset
  };
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Main execution
console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║           प्रियंका की प्रमोशन जॉइनिंग के लिए शुभ मुहूर्त                      ║');
console.log('║           जन्म: 23 अक्टूबर 1984, 5:50 पूर्वाह्न, अहमदाबाद                   ║');
console.log('║           कार्यक्रम: प्रमोशन पर जॉइनिंग                                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const startDate = new Date('2026-05-05');
const results = [];

for (let i = 0; i < 7; i++) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + i);
  const analysis = analyzeDate(date);
  results.push(analysis);
}

// Sort by score
results.sort((a, b) => b.evaluation.score - a.evaluation.score);

console.log('📅 श्रेष्ठ मुहूर्त रैंकिंग (अगले 7 दिन):\n');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

results.forEach((result, index) => {
  console.log(`#${index + 1} ${formatDate(result.date)}`);
  console.log(`   स्कोर: ${result.evaluation.score}/100 - ${result.evaluation.suitability}`);
  console.log(`   तिथि: ${result.tithi.name} (${result.tithi.paksha} पक्ष)`);
  console.log(`   नक्षत्र: ${result.nakshatra.name}`);
  console.log(`   दिन: ${result.varDetails.day}`);
  console.log('');
  
  if (result.evaluation.factors.length > 0) {
    console.log('   शुभ तत्व:');
    result.evaluation.factors.forEach(f => console.log(`     ${f}`));
    console.log('');
  }
  
  if (result.evaluation.warnings.length > 0) {
    console.log('   चेतावनी:');
    result.evaluation.warnings.forEach(w => console.log(`     ${w}`));
    console.log('');
  }
  
  console.log(`   🌅 सूर्योदय: ${formatTime(result.sunrise)}`);
  console.log(`   🌇 सूर्यास्त: ${formatTime(result.sunset)}`);
  console.log(`   ⏰ अभिजीत मुहूर्त: ${formatTime(result.abhijit.start)} - ${formatTime(result.abhijit.end)}`);
  console.log(`   ⚠️  राहु काल: ${formatTime(result.rahuKaal.start)} - ${formatTime(result.rahuKaal.end)}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
});

console.log('🎯 सिफारिश:\n');
const best = results[0];
console.log(`श्रेष्ठ दिनांक: ${formatDate(best.date)}`);
console.log(`श्रेष्ठ समय: अभिजीत मुहूर्त के दौरान (${formatTime(best.abhijit.start)} - ${formatTime(best.abhijit.end)})`);
console.log(`            या सुबह के घंटे (9:00 पूर्वाह्न - 12:00 दोपहर) राहु काल से बचें`);
console.log(`\nकुल स्कोर: ${best.evaluation.score}/100 - ${best.evaluation.suitability}`);
console.log('\n📝 प्रमोशन जॉइनिंग के लिए विशेष नोट्स:');
console.log('   - जॉइनिंग से पहले गणेश पूजा करें');
console.log('   - हल्का पीला या सफेद रंग के कपड़े पहनें');
console.log('   - राहु काल से बचें');
console.log('   - जॉइनिंग के समय पूर्व या उत्तर दिशा की ओर मुख करें');
console.log('   - जॉइनिंग के बाद सहयोगियों को मिठाई वितरित करें\n');

console.log('## 📊 OTHER OPTIONS\n');
