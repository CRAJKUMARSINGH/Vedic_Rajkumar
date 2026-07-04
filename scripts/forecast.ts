import { analyzeQuestion } from '../src/services/questionAnalysisService';
import { generateEnhancedClassicalAnswer, renderEnhancedAnswer } from '../src/services/classicalAnswerEngine';

async function run() {
  const args = process.argv.slice(2);
  const options: any = {
    hi: false,
    name: 'Guest',
    question: '',
    date: '1995-01-01',
    time: '12:00',
    lat: 28.6139,
    lon: 77.209,
    direction: 'East'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--question') options.question = args[++i];
    else if (arg === '--date') options.date = args[++i];
    else if (arg === '--time') options.time = args[++i];
    else if (arg === '--lat') options.lat = parseFloat(args[++i]);
    else if (arg === '--lon') options.lon = parseFloat(args[++i]);
    else if (arg === '--name') options.name = args[++i];
    else if (arg === '--direction') options.direction = args[++i];
    else if (arg === '--hi') options.hi = true;
  }

  if (!options.question) {
    console.error("Usage: npx tsx scripts/forecast.ts --question \"Your question here\" [--name Name] [--date YYYY-MM-DD] [--time HH:MM] [--lat Latitude] [--lon Longitude] [--direction East] [--hi]");
    process.exit(1);
  }

  const questionTime = new Date();
  
  console.log(`\n=== GENERATING FORECAST FOR ${options.name.toUpperCase()} ===\n`);
  console.log(`Question: "${options.question}"`);
  console.log(`Birth Details: ${options.date} ${options.time} (Lat: ${options.lat}, Lon: ${options.lon})`);
  console.log(`Language: ${options.hi ? 'Hindi' : 'English'}\n`);
  console.log(`Analyzing with MTSS and Swiss Ephemeris engine... Please wait...\n`);

  try {
    const analysis = await analyzeQuestion({
      question: options.question,
      questionTime: questionTime,
      questionLocation: { lat: options.lat, lon: options.lon }, 
      natal: {
        name: options.name,
        date: options.date,
        time: options.time,
        lat: options.lat,
        lon: options.lon
      }
    });

    const classicalAns = await generateEnhancedClassicalAnswer({
      question: options.question,
      verdict: {
        outcome: analysis.verdict.outcome as 'favorable' | 'mixed' | 'unfavorable',
        score: analysis.verdict.score,
      },
      horaLord: analysis.horaLord,
      moonRashi: analysis.moonRashi,
      prashnaLagna: analysis.prashnaLagnaRashi,
      direction: options.direction,
      isHi: options.hi,
      questionTime: questionTime,
      lat: options.lat,
      lon: options.lon,
    });

    const output = renderEnhancedAnswer(classicalAns);
    console.log(output);

  } catch (error) {
    console.error("Error generating forecast:", error);
  }
}

run().catch(console.error);
