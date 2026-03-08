// Test ephemeris accuracy against known Swiss Ephemeris data
// Reference: Feb 23, 2026, 02:11 PM IST from aaps.space

const LAHIRI_AYANAMSA_2000 = 23.8506;
const AYANAMSA_RATE_LINEAR = 0.01397;

function getLahiriAyanamsa(date) {
  const year = date.getFullYear() + (date.getMonth() / 12) + (date.getDate() / 365.25);
  const yearsSince2000 = year - 2000.0;
  return LAHIRI_AYANAMSA_2000 + (AYANAMSA_RATE_LINEAR * yearsSince2000);
}

function tropicalToSidereal(tropicalLong, ayanamsa) {
  let sidereal = tropicalLong - ayanamsa;
  while (sidereal < 0) sidereal += 360;
  while (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

function longitudeToRashi(longitude) {
  return Math.floor(longitude / 30);
}

function longitudeToDegrees(longitude) {
  const rashi = Math.floor(longitude / 30);
  const degrees = longitude - (rashi * 30);
  return { rashi, degrees };
}

function dateToJulianDay(date) {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4);
  jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  jd = jd + (hours - 12) / 24;
  
  return jd;
}

function calculatePlanetaryPositions(date) {
  const ayanamsa = getLahiriAyanamsa(date);
  const jd = dateToJulianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T2) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  const sunTropical = (L0 + C) % 360;

  // Moon
  const Lm = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3/538841 - T4/65194000;
  const D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3/545868 - T4/113065000) * Math.PI / 180;
  const M_moon = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3/69699 - T4/14712000) * Math.PI / 180;
  const M_sun = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3/24490000) * Math.PI / 180;
  const F = (93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3/3526000 + T4/863310000) * Math.PI / 180;
  
  const moonCorrection = 
    6.288774 * Math.sin(M_moon) +
    1.274027 * Math.sin(2*D - M_moon) +
    0.658314 * Math.sin(2*D) +
    0.213618 * Math.sin(2*M_moon) -
    0.185116 * Math.sin(M_sun) -
    0.114332 * Math.sin(2*F) +
    0.058793 * Math.sin(2*D - 2*M_moon) +
    0.057066 * Math.sin(2*D - M_sun - M_moon) +
    0.053322 * Math.sin(2*D + M_moon) +
    0.045758 * Math.sin(2*D - M_sun);
  const moonTropical = (Lm + moonCorrection) % 360;

  // Mercury
  const L_merc = 252.250906 + 149472.6746358 * T;
  const M_merc = (174.7947656 + 149472.5153127 * T) * Math.PI / 180;
  const mercuryCorrection = 
    23.4400 * Math.sin(M_merc) +
    2.9818 * Math.sin(2*M_merc) +
    0.5255 * Math.sin(3*M_merc);
  const mercuryTropical = (L_merc + mercuryCorrection) % 360;

  // Venus
  const L_ven = 181.979801 + 58517.8156760 * T;
  const M_ven = (50.4071988 + 58517.8038897 * T) * Math.PI / 180;
  const venusCorrection = 
    0.7758 * Math.sin(M_ven) +
    0.0033 * Math.sin(2*M_ven) +
    0.0002 * Math.sin(3*M_ven);
  const venusTropical = (L_ven + venusCorrection) % 360;

  // Mars
  const L_mars = 355.433000 + 19140.2993039 * T;
  const M_mars = (19.3730000 + 19139.8585209 * T) * Math.PI / 180;
  const marsCorrection = 
    10.6912 * Math.sin(M_mars) +
    0.6228 * Math.sin(2*M_mars) +
    0.0503 * Math.sin(3*M_mars);
  const marsTropical = (L_mars + marsCorrection) % 360;

  // Jupiter
  const L_jup = 34.351519 + 3034.9056606 * T;
  const M_jup = (20.0202500 + 3034.9057964 * T) * Math.PI / 180;
  const jupiterCorrection = 
    5.5549 * Math.sin(M_jup) +
    0.1683 * Math.sin(2*M_jup) +
    0.0071 * Math.sin(3*M_jup) +
    0.0003 * Math.sin(4*M_jup);
  const jupiterTropical = (L_jup + jupiterCorrection) % 360;

  // Saturn
  const L_sat = 50.077444 + 1222.1138488 * T;
  const M_sat = (317.0207000 + 1222.1138488 * T) * Math.PI / 180;
  const saturnCorrection = 
    6.4060 * Math.sin(M_sat) +
    0.3920 * Math.sin(2*M_sat) +
    0.0297 * Math.sin(3*M_sat) +
    0.0015 * Math.sin(4*M_sat);
  const saturnTropical = (L_sat + saturnCorrection) % 360;
  
  // Rahu
  const rahuMeanLong = 125.0445550 - 1934.1361849 * T + 0.0020762 * T2 + T3/467410 - T4/60616000;
  const rahuTropical = rahuMeanLong % 360;

  const normalize = (deg) => {
    let result = deg % 360;
    while (result < 0) result += 360;
    return result;
  };

  return {
    ayanamsa,
    jd,
    tropical: {
      Sun: normalize(sunTropical),
      Moon: normalize(moonTropical),
      Mercury: normalize(mercuryTropical),
      Venus: normalize(venusTropical),
      Mars: normalize(marsTropical),
      Jupiter: normalize(jupiterTropical),
      Saturn: normalize(saturnTropical),
      Rahu: normalize(rahuTropical),
      Ketu: normalize((rahuTropical + 180) % 360)
    },
    sidereal: {
      Sun: tropicalToSidereal(normalize(sunTropical), ayanamsa),
      Moon: tropicalToSidereal(normalize(moonTropical), ayanamsa),
      Mercury: tropicalToSidereal(normalize(mercuryTropical), ayanamsa),
      Venus: tropicalToSidereal(normalize(venusTropical), ayanamsa),
      Mars: tropicalToSidereal(normalize(marsTropical), ayanamsa),
      Jupiter: tropicalToSidereal(normalize(jupiterTropical), ayanamsa),
      Saturn: tropicalToSidereal(normalize(saturnTropical), ayanamsa),
      Rahu: tropicalToSidereal(normalize(rahuTropical), ayanamsa),
      Ketu: tropicalToSidereal(normalize((rahuTropical + 180) % 360), ayanamsa)
    }
  };
}

const rashiNames = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Known Swiss Ephemeris data for Feb 23, 2026, 02:11 PM IST
const swissEphemeris = {
  Sun: { degrees: 9.641, rashi: 10, name: "Aquarius" },      // 9°38'26"
  Moon: { degrees: 24.519, rashi: 0, name: "Aries" },        // 24°31'09"
  Mercury: { degrees: 26.764, rashi: 10, name: "Aquarius" }, // 26°45'49"
  Venus: { degrees: 21.084, rashi: 10, name: "Aquarius" },   // 21°05'02"
  Mars: { degrees: 29.201, rashi: 9, name: "Capricorn" },    // 29°12'05"
  Jupiter: { degrees: 20.385, rashi: 2, name: "Gemini" },    // 20°23'06"
  Saturn: { degrees: 5.953, rashi: 11, name: "Pisces" },     // 5°57'12"
  Rahu: { degrees: 14.237, rashi: 10, name: "Aquarius" },    // 14°14'14"
  Ketu: { degrees: 14.237, rashi: 4, name: "Leo" }           // 14°14'14"
};

console.log("=".repeat(90));
console.log("EPHEMERIS ACCURACY TEST - Feb 23, 2026, 02:11 PM IST");
console.log("=".repeat(90));

const testDate = new Date(2026, 1, 23, 14, 11, 54); // Feb 23, 2026, 2:11:54 PM
const calculated = calculatePlanetaryPositions(testDate);

console.log(`\nAyanamsa: ${calculated.ayanamsa.toFixed(4)}° (Expected: ~24.20°)`);
console.log(`Julian Day: ${calculated.jd.toFixed(2)}\n`);

console.log("Planet".padEnd(12) + "Our Calc (Sid)".padEnd(20) + "Swiss Eph".padEnd(20) + "Diff".padEnd(12) + "Rashi Match");
console.log("-".repeat(90));

Object.keys(swissEphemeris).forEach(planet => {
  const ourSidereal = calculated.sidereal[planet];
  const ourPos = longitudeToDegrees(ourSidereal);
  const swissPos = swissEphemeris[planet];
  
  const ourRashiName = rashiNames[ourPos.rashi];
  const diff = Math.abs(ourPos.degrees - swissPos.degrees);
  const rashiMatch = ourPos.rashi === swissPos.rashi ? "✅" : "❌";
  
  console.log(
    planet.padEnd(12) +
    `${ourPos.degrees.toFixed(2)}° ${ourRashiName}`.padEnd(20) +
    `${swissPos.degrees.toFixed(2)}° ${swissPos.name}`.padEnd(20) +
    `${diff.toFixed(2)}°`.padEnd(12) +
    rashiMatch
  );
});

console.log("-".repeat(90));

// Calculate accuracy statistics
let totalDiff = 0;
let rashiMatches = 0;
let count = 0;

Object.keys(swissEphemeris).forEach(planet => {
  const ourSidereal = calculated.sidereal[planet];
  const ourPos = longitudeToDegrees(ourSidereal);
  const swissPos = swissEphemeris[planet];
  
  const diff = Math.abs(ourPos.degrees - swissPos.degrees);
  totalDiff += diff;
  if (ourPos.rashi === swissPos.rashi) rashiMatches++;
  count++;
});

const avgDiff = totalDiff / count;
const rashiAccuracy = (rashiMatches / count) * 100;

console.log(`\nACCURACY SUMMARY:`);
console.log(`• Average Degree Difference: ${avgDiff.toFixed(3)}°`);
console.log(`• Rashi-Level Accuracy: ${rashiAccuracy.toFixed(1)}% (${rashiMatches}/${count})`);
console.log(`• Maximum Acceptable Difference: 1.0° for transit analysis`);

if (avgDiff <= 1.0 && rashiAccuracy === 100) {
  console.log(`\n✅ EXCELLENT: Calculations meet professional standards!`);
} else if (avgDiff <= 2.0 && rashiAccuracy >= 90) {
  console.log(`\n⚠️ GOOD: Calculations acceptable for transit analysis`);
} else {
  console.log(`\n❌ NEEDS IMPROVEMENT: Consider using Swiss Ephemeris library`);
}

console.log("\n" + "=".repeat(90));
console.log("TESTING MARCH 2026 DATES");
console.log("=".repeat(90));

// Test March 8, 2026
console.log("\nMarch 8, 2026:");
const march8 = calculatePlanetaryPositions(new Date(2026, 2, 8, 14, 0, 0));
Object.keys(march8.sidereal).forEach(planet => {
  const pos = longitudeToDegrees(march8.sidereal[planet]);
  console.log(`${planet}: ${pos.degrees.toFixed(2)}° ${rashiNames[pos.rashi]}`);
});

// Test March 14, 2026
console.log("\nMarch 14, 2026:");
const march14 = calculatePlanetaryPositions(new Date(2026, 2, 14, 14, 0, 0));
Object.keys(march14.sidereal).forEach(planet => {
  const pos = longitudeToDegrees(march14.sidereal[planet]);
  console.log(`${planet}: ${pos.degrees.toFixed(2)}° ${rashiNames[pos.rashi]}`);
});

console.log("\n" + "=".repeat(90));
