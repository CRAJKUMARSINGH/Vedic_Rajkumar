// Comprehensive Test Suite for All Astrology Reports
// Testing all features with multiple user scenarios

import { generateManglikReport } from '../data/manglikData';
import { generateSadeSatiReport } from '../data/sadeSatiData';
import { generateKaalSarpReport } from '../data/kaalSarpData';
import { generateCareerReport } from '../data/careerData';
import { getMoonSignIndex, getAscendantIndex, getSunSign } from '../data/comprehensiveAstrologyData';

interface TestUser {
  name: string;
  dateOfBirth: Date;
  moonSign: string;
  ascendant: string;
  marsHouse: number;
  saturnPosition: number;
  rahuHouse: number;
  ketuHouse: number;
}

const testUsers: TestUser[] = [
  {
    name: "Raj Kumar",
    dateOfBirth: new Date("1990-03-15"),
    moonSign: "Aries",
    ascendant: "Leo",
    marsHouse: 7,
    saturnPosition: 10,
    rahuHouse: 1,
    ketuHouse: 7
  },
  {
    name: "Priya Sharma",
    dateOfBirth: new Date("1992-08-22"),
    moonSign: "Cancer",
    ascendant: "Taurus",
    marsHouse: 4,
    saturnPosition: 1,
    rahuHouse: 12,
    ketuHouse: 6
  },
  {
    name: "Amit Patel",
    dateOfBirth: new Date("1988-12-10"),
    moonSign: "Scorpio",
    ascendant: "Virgo",
    marsHouse: 2,
    saturnPosition: 8,
    rahuHouse: 5,
    ketuHouse: 11
  },
  {
    name: "Neha Gupta",
    dateOfBirth: new Date("1995-06-28"),
    moonSign: "Capricorn",
    ascendant: "Libra",
    marsHouse: 8,
    saturnPosition: 2,
    rahuHouse: 3,
    ketuHouse: 9
  },
  {
    name: "Vijay Singh",
    dateOfBirth: new Date("1985-01-05"),
    moonSign: "Aquarius",
    ascendant: "Sagittarius",
    marsHouse: 1,
    saturnPosition: 11,
    rahuHouse: 2,
    ketuHouse: 8
  }
];

export function runComprehensiveTests() {
  console.log("🔮 Starting Comprehensive Astrology Report Tests");
  console.log("=" * 60);
  
  const testResults = {
    manglik: [] as any[],
    sadesati: [] as any[],
    kaalsarp: [] as any[],
    career: [] as any[],
    errors: [] as string[]
  };

  testUsers.forEach((user, index) => {
    console.log(`\n📊 Testing User ${index + 1}: ${user.name}`);
    console.log("-" * 40);
    
    try {
      // Test Manglik Report
      console.log("🔴 Testing Manglik Report...");
      const manglikReport = generateManglikReport(
        user.name,
        user.dateOfBirth,
        user.moonSign,
        user.ascendant,
        user.marsHouse
      );
      testResults.manglik.push({
        user: user.name,
        hasManglik: manglikReport.hasManglikYoga,
        type: manglikReport.manglikType,
        intensity: manglikReport.intensity,
        marriageCompatibility: manglikReport.marriageCompatibility
      });
      console.log(`✅ Manglik: ${manglikReport.manglikType} (${manglikReport.intensity}/10)`);

      // Test Sade Sati Report
      console.log("🔵 Testing Sade Sati Report...");
      const sadeSatiReport = generateSadeSatiReport(
        user.name,
        user.dateOfBirth,
        user.moonSign,
        user.saturnPosition
      );
      testResults.sadesati.push({
        user: user.name,
        isInSadeSati: sadeSatiReport.isCurrentlyInSadeSati,
        phase: sadeSatiReport.sadeSatiPhase,
        impact: sadeSatiReport.overallImpact
      });
      console.log(`✅ Sade Sati: ${sadeSatiReport.sadeSatiPhase} (${sadeSatiReport.overallImpact}/10)`);

      // Test Kaal Sarp Report
      console.log("🟣 Testing Kaal Sarp Report...");
      const moonSignIndex = getMoonSignIndex(user.moonSign);
      const kaalSarpReport = generateKaalSarpReport(
        user.name,
        user.dateOfBirth,
        moonSignIndex,
        user.rahuHouse,
        user.ketuHouse
      );
      testResults.kaalsarp.push({
        user: user.name,
        hasKaalSarp: kaalSarpReport.hasKaalSarpYoga,
        type: kaalSarpReport.yogaType,
        impact: kaalSarpReport.overallImpact
      });
      console.log(`✅ Kaal Sarp: ${kaalSarpReport.yogaType} (${kaalSarpReport.overallImpact}/10)`);

      // Test Career Report
      console.log("🟢 Testing Career Report...");
      const ascendantIndex = getAscendantIndex(user.ascendant);
      const careerReport = generateCareerReport(
        user.name,
        user.dateOfBirth,
        moonSignIndex,
        ascendantIndex
      );
      testResults.career.push({
        user: user.name,
        potential: careerReport.careerPotential,
        businessPotential: careerReport.businessPotential,
        jobPotential: careerReport.jobPotential,
        successAge: careerReport.successAge
      });
      console.log(`✅ Career: ${careerReport.careerPotential}/10 potential`);

    } catch (error) {
      console.error(`❌ Error testing ${user.name}:`, error);
      testResults.errors.push(`${user.name}: ${error}`);
    }
  });

  // Generate Summary Report
  console.log("\n" + "=" * 60);
  console.log("📋 COMPREHENSIVE TEST SUMMARY");
  console.log("=" * 60);

  // Manglik Summary
  console.log("\n🔴 MANGLIK YOGA SUMMARY:");
  testResults.manglik.forEach(result => {
    console.log(`  ${result.user}: ${result.hasManglik ? '⚠️ ' : '✅ '}${result.type} (Compatibility: ${result.marriageCompatibility}/10)`);
  });

  // Sade Sati Summary
  console.log("\n🔵 SADE SATI SUMMARY:");
  testResults.sadesati.forEach(result => {
    console.log(`  ${result.user}: ${result.isInSadeSati ? '⚠️ ' : '✅ '}${result.phase} (Impact: ${result.impact}/10)`);
  });

  // Kaal Sarp Summary
  console.log("\n🟣 KAAL SARP YOGA SUMMARY:");
  testResults.kaalsarp.forEach(result => {
    console.log(`  ${result.user}: ${result.hasKaalSarp ? '⚠️ ' : '✅ '}${result.type} (Impact: ${result.impact}/10)`);
  });

  // Career Summary
  console.log("\n🟢 CAREER POTENTIAL SUMMARY:");
  testResults.career.forEach(result => {
    console.log(`  ${result.user}: ${result.potential}/10 (Business: ${result.businessPotential}/10, Job: ${result.jobPotential}/10)`);
  });

  // Errors
  if (testResults.errors.length > 0) {
    console.log("\n❌ ERRORS ENCOUNTERED:");
    testResults.errors.forEach(error => {
      console.log(`  ${error}`);
    });
  } else {
    console.log("\n✅ ALL TESTS COMPLETED SUCCESSFULLY!");
  }

  // Statistics
  const manglikCount = testResults.manglik.filter(r => r.hasManglik).length;
  const sadesatiCount = testResults.sadesati.filter(r => r.isInSadeSati).length;
  const kaalsarpCount = testResults.kaalsarp.filter(r => r.hasKaalSarp).length;
  
  console.log("\n📊 STATISTICS:");
  console.log(`  Total Users Tested: ${testUsers.length}`);
  console.log(`  Manglik Cases: ${manglikCount}/${testUsers.length} (${(manglikCount/testUsers.length*100).toFixed(1)}%)`);
  console.log(`  Sade Sati Cases: ${sadesatiCount}/${testUsers.length} (${(sadesatiCount/testUsers.length*100).toFixed(1)}%)`);
  console.log(`  Kaal Sarp Cases: ${kaalsarpCount}/${testUsers.length} (${(kaalsarpCount/testUsers.length*100).toFixed(1)}%)`);
  console.log(`  Average Career Potential: ${(testResults.career.reduce((sum, r) => sum + r.potential, 0) / testResults.career.length).toFixed(1)}/10`);

  return testResults;
}

// Test individual functions
export function testManglikCalculations() {
  console.log("🔴 Testing Manglik Yoga Calculations...");
  
  // Test different Mars positions
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const nonManglikHouses = [3, 5, 6, 9, 10, 11];
  
  manglikHouses.forEach(house => {
    const report = generateManglikReport("Test User", new Date(), "Aries", "Leo", house);
    console.log(`  Mars in House ${house}: ${report.hasManglikYoga ? '✅ Manglik' : '❌ Not Manglik'} (${report.manglikType})`);
  });
  
  nonManglikHouses.forEach(house => {
    const report = generateManglikReport("Test User", new Date(), "Aries", "Leo", house);
    console.log(`  Mars in House ${house}: ${report.hasManglikYoga ? '❌ Manglik' : '✅ Not Manglik'}`);
  });
}

export function testSadeSatiCalculations() {
  console.log("🔵 Testing Sade Sati Calculations...");
  
  const sadeSatiSigns = ["Capricorn", "Aquarius", "Pisces"];
  const nonSadeSatiSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];
  
  sadeSatiSigns.forEach(sign => {
    const report = generateSadeSatiReport("Test User", new Date(), sign, 1);
    console.log(`  Moon Sign ${sign}: ${report.isCurrentlyInSadeSati ? '✅ Sade Sati' : '❌ Not Sade Sati'} (${report.sadeSatiPhase})`);
  });
  
  nonSadeSatiSigns.forEach(sign => {
    const report = generateSadeSatiReport("Test User", new Date(), sign, 1);
    console.log(`  Moon Sign ${sign}: ${report.isCurrentlyInSadeSati ? '❌ Sade Sati' : '✅ Not Sade Sati'}`);
  });
}

export function testKaalSarpCalculations() {
  console.log("🟣 Testing Kaal Sarp Yoga Calculations...");
  
  // Test valid Kaal Sarp combinations (6 houses apart)
  const validCombinations = [
    { rahu: 1, ketu: 7 },
    { rahu: 2, ketu: 8 },
    { rahu: 3, ketu: 9 },
    { rahu: 4, ketu: 10 },
    { rahu: 5, ketu: 11 },
    { rahu: 6, ketu: 12 }
  ];
  
  validCombinations.forEach(combo => {
    const report = generateKaalSarpReport("Test User", new Date(), 0, combo.rahu, combo.ketu);
    console.log(`  Rahu ${combo.rahu} - Ketu ${combo.ketu}: ${report.hasKaalSarpYoga ? '✅ Kaal Sarp' : '❌ Not Kaal Sarp'} (${report.yogaType})`);
  });
  
  // Test invalid combination
  const invalidReport = generateKaalSarpReport("Test User", new Date(), 0, 1, 2);
  console.log(`  Rahu 1 - Ketu 2: ${invalidReport.hasKaalSarpYoga ? '❌ Kaal Sarp' : '✅ Not Kaal Sarp'}`);
}

// Run all tests
if (typeof window === 'undefined') {
  // Node.js environment
  runComprehensiveTests();
  testManglikCalculations();
  testSadeSatiCalculations();
  testKaalSarpCalculations();
}
