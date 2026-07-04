import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envVars = {};
try {
  const envPath = path.resolve(__dirname, '../.env');
  const envFile = await fs.readFile(envPath, 'utf8');
  envFile.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      envVars[key] = val;
    }
  });
} catch (e) {
  console.warn("Could not read .env file:", e.message);
}

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);


const SEGMENTS = {
  "Career & Business": [3, 6, 9, 14, 19, 20, 21, 24, 26, 31, 37, 38, 39, 40, 42, 47, 54, 59, 63, 64, 67, 69, 73, 76, 86, 89, 91, 92, 95, 97],
  "Marriage & Relationships": [2, 13, 18, 27, 30, 33, 36, 43, 45, 50, 52, 66, 71, 75, 79, 81, 83, 85, 88, 90, 98],
  "Health & Wellness": [1, 12, 15, 25, 32, 34, 48, 55, 70, 77, 82, 87],
  "Financial & Wealth": [4, 10, 23, 28, 44, 49, 57],
  "Dasha & Transit": [11, 17, 22, 53, 58],
  "General & Spiritual": [29, 41, 46, 51, 56, 60, 62, 65, 68, 72, 74, 78, 80, 84, 93, 94, 96, 99, 100]
};

async function runTest(question, category) {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.functions.invoke('prashna', {
      body: {
        question: question,
        birthName: "Priyanka",
        questionTime: new Date().toISOString()
      }
    });
    
    const duration = (Date.now() - startTime) / 1000;
    
    if (error) {
      console.log(`❌ [${category}] Error (${duration}s): ${error.message}`);
      return { success: false, duration, error: error.message };
    } else {
      console.log(`✅ [${category}] Success (${duration}s): ${question.substring(0, 30)}...`);
      return { success: true, duration, data };
    }
  } catch (error) {
    console.log(`❌ [${category}] Catch Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function startSegmentedTesting() {
  const questionsRaw = await fs.readFile(path.resolve(__dirname, '../test-questions-priyanka.json'), 'utf8');
  const questions = JSON.parse(questionsRaw);
  
  console.log("🚀 Starting Segmented Robotic Testing...");
  console.log("======================================================");

  const stats = {};

  for (const [segmentName, ids] of Object.entries(SEGMENTS)) {
    console.log(`\n📂 Segment: ${segmentName} (${ids.length} questions)`);
    console.log("------------------------------------------------------");
    
    stats[segmentName] = { total: ids.length, success: 0, failure: 0 };
    
    // Run up to 3 questions per segment for quick testing in this turn
    const subset = ids.slice(0, 3); 
    for (const id of subset) {
      const q = questions.find(item => item.id === id);
      if (!q) continue;
      
      const result = await runTest(q.question, segmentName);
      if (result.success) stats[segmentName].success++;
      else stats[segmentName].failure++;
      
      // Small delay between questions
      await new Promise(r => setTimeout(r, 1000));
    }
    
    if (ids.length > 3) {
      console.log(`... and ${ids.length - 3} more questions in this segment (skipped for brevity)`);
    }
  }

  console.log("\n\n======================================================");
  console.log("📊 FINAL REPORT");
  console.log("======================================================");
  console.table(stats);
  console.log("======================================================");
}

startSegmentedTesting();
