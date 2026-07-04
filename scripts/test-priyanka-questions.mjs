// Generate 100 Random Questions for Priyanka
// Born: 23 Oct 1984, 5:50 AM, Ahmedabad
// Purpose: Robotic testing of the Vedic astrology app

const priyankaDetails = {
  name: "Priyanka",
  dob: "23 Oct 1984",
  tob: "5:50 AM",
  pob: "Ahmedabad"
};

const questionTemplates = [
  // Muhurat Questions (30)
  "Find muhurat for {event} within next week",
  "When is the best time for {event}?",
  "Find auspicious date for {event} this month",
  "Muhurat for {event} in May 2026",
  "Best day for {event} next month",
  "When should I do {event}?",
  "Find shubh muhurat for {event}",
  "Auspicious time for {event}",
  "Best date and time for {event}",
  "When to start {event}?",
  
  // Career Questions (20)
  "Will I get promotion this year?",
  "When will I get job change?",
  "Is this good time to switch jobs?",
  "Career prospects for next 6 months",
  "Will I get salary hike?",
  "Should I accept new job offer?",
  "When will I get better opportunity?",
  "Career growth in current company",
  "Business success prediction",
  "When will I achieve career goals?",
  
  // Marriage Questions (15)
  "When will I get married?",
  "Love marriage or arranged marriage?",
  "Will I marry this year?",
  "Marriage compatibility check",
  "When is good time for marriage?",
  "Marriage prediction for Priyanka",
  "Will I have happy married life?",
  "Spouse characteristics prediction",
  "Marriage delays reasons",
  "Best year for marriage",
  
  // Health Questions (10)
  "Health prediction for this year",
  "Will I have health issues?",
  "When will health improve?",
  "Major health concerns prediction",
  "Remedies for health problems",
  "Longevity prediction",
  "Mental health forecast",
  "Will I recover from illness?",
  "Health precautions needed",
  "Best time for medical treatment",
  
  // Finance Questions (15)
  "Financial prediction for 2026",
  "Will I get financial gain?",
  "When will debts clear?",
  "Investment advice based on horoscope",
  "Will I buy property this year?",
  "Financial stability prediction",
  "When will I get wealth?",
  "Business profit prediction",
  "Stock market astrology prediction",
  "Best time for investment",
  
  // General Questions (10)
  "What is my rashi?",
  "What is my nakshatra?",
  "What is my lagna?",
  "Current dasha prediction",
  "When will Rahu Mahadasha end?",
  "Gemstone recommendation",
  "Lucky number for Priyanka",
  "Lucky color for this week",
  "Mantra for success",
  "General horoscope prediction"
];

const events = [
  "joining new job",
  "promotion",
  "business start",
  "marriage",
  "house warming",
  "vehicle purchase",
  "travel",
  "property purchase",
  "education start",
  "shop opening"
];

function generateQuestion(index) {
  const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
  
  if (template.includes("{event}")) {
    const event = events[Math.floor(Math.random() * events.length)];
    return template.replace("{event}", event);
  }
  
  return template;
}

function generate100Questions() {
  const questions = [];
  for (let i = 1; i <= 100; i++) {
    questions.push({
      id: i,
      question: generateQuestion(i),
      context: `For ${priyankaDetails.name} (${priyankaDetails.dob}, ${priyankaDetails.tob}, ${priyankaDetails.pob})`
    });
  }
  return questions;
}

function displayQuestions(questions) {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
  console.log('║           100 RANDOM QUESTIONS FOR PRIYANKA - APP TESTING              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('Profile:');
  console.log(`  Name: ${priyankaDetails.name}`);
  console.log(`  DOB: ${priyankaDetails.dob}`);
  console.log(`  TOB: ${priyankaDetails.tob}`);
  console.log(`  POB: ${priyankaDetails.pob}\n`);
  
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
  
  questions.forEach((q, index) => {
    console.log(`Q${q.id}: ${q.question}`);
    console.log(`     Context: ${q.context}`);
    console.log('');
    
    if ((index + 1) % 10 === 0) {
      console.log('═══════════════════════════════════════════════════════════════════════════\n');
    }
  });
}

async function saveQuestionsToFile(questions) {
  const fs = await import('fs');
  const data = JSON.stringify(questions, null, 2);
  fs.writeFileSync('c:\\Users\\Rajkumar\\Vedic_Rajkumar\\test-questions-priyanka.json', data);
  console.log('\n✅ Questions saved to: test-questions-priyanka.json\n');
}

// Generate and display questions
async function main() {
  const questions = generate100Questions();
  displayQuestions(questions);
  await saveQuestionsToFile(questions);

  console.log('\n📊 SUMMARY:');
  console.log(`   Total Questions: ${questions.length}`);
  console.log(`   Question Types: Muhurat, Career, Marriage, Health, Finance, General`);
  console.log(`   Purpose: Robotic testing of Vedic astrology app\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

main();
