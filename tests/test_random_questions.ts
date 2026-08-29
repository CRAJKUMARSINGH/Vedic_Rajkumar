/**
 * tests/test_random_questions.ts
 * Tests the Random Questions Engine by answering 10 random user questions natively
 * using 12-house horoscope calculations (NO TRANSIT DEPENDENCY).
 */

import { answerRandomQuestion, PRESET_RANDOM_QUESTIONS } from '../src/services/randomQuestionsService';

async function runRandomQuestionsTest() {
  console.log('================================================================================');
  console.log(' 🔮 VEDIC RAJKUMAR — RANDOM QUESTIONS NATIVE 12-HOUSE ANSWERING TEST');
  console.log('================================================================================\n');

  // Test subject: Rajkumar natal chart (DOB: 1963-09-15 06:00 IST)
  const birthDate = '1963-09-15';
  const birthTime = '06:00';
  const lat = 23.84;
  const lon = 73.71;

  console.log(`👤 TEST SUBJECT: Rajkumar (DOB: ${birthDate} ${birthTime} IST | Lagna: Leo)\n`);

  for (let i = 0; i < PRESET_RANDOM_QUESTIONS.length; i++) {
    const q = PRESET_RANDOM_QUESTIONS[i];
    console.log(`--------------------------------------------------------------------------------`);
    console.log(` ❓ RANDOM QUESTION ${i + 1} [${q.category.toUpperCase()}]: "${q.questionText}"`);
    console.log(`--------------------------------------------------------------------------------`);

    const result = await answerRandomQuestion(q.questionText, birthDate, birthTime, lat, lon);

    console.log(`   Mapped Primary House  : House ${result.primaryHouse} | Secondary House: House ${result.secondaryHouse}`);
    console.log(`   Lagna & Moon          : Lagna ${result.chartInfo.lagnaRashi} (Lord: ${result.chartInfo.lagnaLord}) | Moon ${result.chartInfo.moonRashi}`);
    console.log(`   Horoscope Capability  : ${result.score}/100`);
    console.log(`   VERDICT               : 🏆 ${result.verdict}`);
    console.log(`   Short Answer          : ${result.shortAnswer}`);
    console.log(`   Astrological Reasoning:`);
    result.detailedAnalysis.astrologicalReasoning.forEach(r => console.log(`     • ${r}`));
    console.log(`   Recommended Remedies  : ${result.recommendedRemedies.slice(0, 2).join(' | ')}`);
    console.log('   ✅ Status: Question answered natively by 12-House Engine.\n');
  }

  // Also test a custom typed random question
  const customQuestion = 'Will I succeed in buying a commercial property for my consulting business?';
  console.log(`--------------------------------------------------------------------------------`);
  console.log(` ❓ CUSTOM TYPED RANDOM QUESTION: "${customQuestion}"`);
  console.log(`--------------------------------------------------------------------------------`);

  const customResult = await answerRandomQuestion(customQuestion, birthDate, birthTime, lat, lon);
  console.log(`   Mapped Primary House  : House ${customResult.primaryHouse} (${customResult.category})`);
  console.log(`   Horoscope Capability  : ${customResult.score}/100`);
  console.log(`   VERDICT               : 🏆 ${customResult.verdict}`);
  console.log(`   Short Answer          : ${customResult.shortAnswer}`);
  console.log('   ✅ Status: Custom question parsed & answered natively by 12-House Engine.\n');

  console.log('================================================================================');
  console.log(' 🏁 ALL RANDOM QUESTIONS ANSWERED SUCCESSFULLY BY THE APP');
  console.log('================================================================================\n');
}

runRandomQuestionsTest().catch(console.error);
