// Rajkumar's Transit for March 9, 2026 - Using Live Data from AppliedJyotish
// Birth: 15 September 1963, 6:00 AM, Aspur, Dungarpur, Rajasthan
// Moon Sign: Cancer (Karka) - Rashi index 3

// Live Sidereal Positions from AppliedJyotish (March 9, 2026)
const LIVE_POSITIONS_MARCH9 = {
  Sun: 10,      // Aquarius 24°21' Purva Bhadrapada
  Moon: 7,      // Scorpio 0°02' Vishakha Pada 4 (Debilitated)
  Mercury: 10,  // Aquarius 20°55' Purva Bhadrapada (Retrograde)
  Venus: 11,    // Pisces 9°09' Uttara Bhadrapada (EXALTED)
  Mars: 10,     // Aquarius 10°57' Shatabhisha
  Jupiter: 2,   // Gemini 20°52' Punarvasu (Retrograde)
  Saturn: 11,   // Pisces 8°29' Uttara Bhadrapada
  Rahu: 10,     // Aquarius 14°41' Shatabhisha (Retrograde)
  Ketu: 4       // Leo 14°41' Purva Phalguni (Retrograde)
};

const favorableHouses = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Mars: [3, 6, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 11],
  Ketu: [3, 6, 11]
};

const vedhaHouses = {
  Sun: { 3: [9], 6: [12], 10: [4], 11: [5] },
  Moon: { 1: [5], 3: [9], 6: [12], 7: [2], 10: [4], 11: [8] },
  Mercury: { 2: [5], 4: [3], 6: [9], 8: [11], 10: [1], 11: [12] },
  Venus: { 1: [8], 2: [7], 3: [1], 4: [10], 5: [9], 8: [5], 9: [11], 11: [6], 12: [3] },
  Mars: { 3: [12], 6: [9], 11: [5] },
  Jupiter: { 2: [12], 5: [4, 9], 7: [3], 9: [10], 11: [8] },
  Saturn: { 3: [12], 6: [9], 11: [5, 8] },
  Rahu: { 3: [9], 6: [12], 11: [5] },
  Ketu: { 3: [9], 6: [12], 11: [5] }
};

const rashiNames = [
  "Aries ♈", "Taurus ♉", "Gemini ♊", "Cancer ♋",
  "Leo ♌", "Virgo ♍", "Libra ♎", "Scorpio ♏",
  "Sagittarius ♐", "Capricorn ♑", "Aquarius ♒", "Pisces ♓"
];

function calculateHouseFromMoon(planetRashi, moonRashi = 3) {
  let house = planetRashi - moonRashi + 1;
  if (house <= 0) house += 12;
  return house;
}

function checkVedha(planet, house, allPositions, moonRashi = 3) {
  if (!vedhaHouses[planet] || !vedhaHouses[planet][house]) {
    return { hasVedha: false, vedhaFrom: [] };
  }
  
  const vedhaHouseList = vedhaHouses[planet][house];
  const vedhaFrom = [];
  
  Object.keys(allPositions).forEach(otherPlanet => {
    const otherHouse = calculateHouseFromMoon(allPositions[otherPlanet], moonRashi);
    if (vedhaHouseList.includes(otherHouse)) {
      vedhaFrom.push(`${otherPlanet} in ${otherHouse}th`);
    }
  });
  
  return { hasVedha: vedhaFrom.length > 0, vedhaFrom };
}

function analyzeTransit(planet, planetRashi, allPositions, moonRashi = 3) {
  const house = calculateHouseFromMoon(planetRashi, moonRashi);
  const isFavorable = favorableHouses[planet].includes(house);
  const vedhaCheck = checkVedha(planet, house, allPositions, moonRashi);
  
  let effectiveStatus;
  let score = 0;
  let specialNote = "";
  
  // Special notes for exalted/debilitated
  if (planet === "Venus" && planetRashi === 11) {
    specialNote = " (EXALTED ✨)";
  } else if (planet === "Moon" && planetRashi === 7) {
    specialNote = " (Debilitated ⚠️)";
  } else if (planet === "Mercury" && planetRashi === 10) {
    specialNote = " (Retrograde ↩️)";
  } else if (planet === "Jupiter" && planetRashi === 2) {
    specialNote = " (Retrograde ↩️)";
  }
  
  if (isFavorable && !vedhaCheck.hasVedha) {
    effectiveStatus = "✅ Favorable (No Vedha)";
    score = 1;
  } else if (isFavorable && vedhaCheck.hasVedha) {
    effectiveStatus = "⚠️ Blocked by Vedha";
    score = 0;
  } else if (!isFavorable && vedhaCheck.hasVedha) {
    effectiveStatus = "🔄 Vedha Neutralizes";
    score = 0.5;
  } else {
    effectiveStatus = "❌ Unfavorable";
    score = 0;
  }
  
  return {
    planet,
    rashi: rashiNames[planetRashi] + specialNote,
    house,
    baseFavorable: isFavorable,
    hasVedha: vedhaCheck.hasVedha,
    vedhaFrom: vedhaCheck.vedhaFrom,
    effectiveStatus,
    score
  };
}

console.log("=".repeat(90));
console.log("RAJKUMAR'S VEDIC TRANSIT REPORT - MARCH 9, 2026 (MONDAY)");
console.log("Live Planetary Positions from AppliedJyotish.com");
console.log("=".repeat(90));
console.log("Birth: 15 September 1963, 6:00 AM, Aspur, Dungarpur, Rajasthan");
console.log("Moon Sign: Cancer (Karka) ♋");
console.log("=".repeat(90));
console.log();

const results = [];
let totalScore = 0;

console.log("Planet".padEnd(12) + "Sign".padEnd(30) + "House".padEnd(7) + "Base".padEnd(12) + "Vedha?".padEnd(8) + "Effective Status".padEnd(25) + "Score");
console.log("-".repeat(90));

Object.keys(LIVE_POSITIONS_MARCH9).forEach(planet => {
  const analysis = analyzeTransit(planet, LIVE_POSITIONS_MARCH9[planet], LIVE_POSITIONS_MARCH9);
  results.push(analysis);
  totalScore += analysis.score;
  
  const baseText = analysis.baseFavorable ? "Favorable" : "Unfavorable";
  const vedhaText = analysis.hasVedha ? "Yes" : "No";
  
  console.log(
    planet.padEnd(12) + 
    analysis.rashi.padEnd(30) + 
    analysis.house.toString().padEnd(7) + 
    baseText.padEnd(12) +
    vedhaText.padEnd(8) +
    analysis.effectiveStatus.padEnd(25) + 
    analysis.score.toFixed(1)
  );
  
  if (analysis.hasVedha && analysis.vedhaFrom.length > 0) {
    console.log("          └─ Vedha from: " + analysis.vedhaFrom.join(", "));
  }
});

console.log("-".repeat(90));
console.log(`\nOVERALL SCORE: ${totalScore.toFixed(1)}/9`);

let interpretation = "";
if (totalScore >= 7) interpretation = "🌟 Highly Favorable";
else if (totalScore >= 5) interpretation = "✅ Favorable";
else if (totalScore >= 3) interpretation = "⚖️ Mixed";
else interpretation = "⚠️ Challenging";

console.log(`STATUS: ${interpretation}\n`);

// Key highlights
const trulyFavorable = results.filter(r => r.baseFavorable && !r.hasVedha);
const blockedByVedha = results.filter(r => r.baseFavorable && r.hasVedha);
const unfavorable = results.filter(r => !r.baseFavorable && !r.hasVedha);

console.log("KEY HIGHLIGHTS:\n");

if (trulyFavorable.length > 0) {
  console.log(`✅ Truly Favorable (${trulyFavorable.length}) - No Vedha obstruction:`);
  trulyFavorable.forEach(r => {
    console.log(`   • ${r.planet} in ${r.house}th house (${r.rashi})`);
  });
  console.log();
}

if (blockedByVedha.length > 0) {
  console.log(`⚠️ Blocked by Vedha (${blockedByVedha.length}):`);
  blockedByVedha.forEach(r => {
    console.log(`   • ${r.planet} in ${r.house}th house - Vedha from ${r.vedhaFrom.join(", ")}`);
  });
  console.log();
}

if (unfavorable.length > 0) {
  console.log(`❌ Unfavorable (${unfavorable.length}):`);
  unfavorable.forEach(r => {
    console.log(`   • ${r.planet} in ${r.house}th house (${r.rashi})`);
  });
}

console.log("\n" + "=".repeat(90));
console.log("SPECIAL PLANETARY CONDITIONS:");
console.log("=".repeat(90));
console.log("• Venus EXALTED in Pisces (9th house) - Maximum strength for fortune/spirituality");
console.log("• Moon DEBILITATED in Scorpio (5th house) - Emotional challenges, creativity affected");
console.log("• Mercury RETROGRADE in Aquarius (8th house) - Review, revise, research favored");
console.log("• Jupiter RETROGRADE in Gemini (12th house) - Spiritual introspection period");
console.log("• 8th House Stellium: Sun, Mercury, Mars, Rahu - Transformation emphasis");
console.log("=".repeat(90));

console.log("\nONE-LINE SUMMARY:");
console.log("Moderate-to-challenging day with Venus exalted in 9th bringing fortune/spiritual");
console.log("grace, Mercury in 8th sharpens hidden intelligence, but heavy 8th-house cluster");
console.log("(Sun, Mars, Rahu, Mercury) demands caution in health, finance & decisions.");
console.log("\n" + "=".repeat(90));
