import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env file manually
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
      // Remove quotes if present
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
} catch (e) {
  console.warn("Could not read .env file:", e.message);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("🚀 Starting Robotic Testing of Prashna Engine...");
  
  try {
    const jsonPath = path.resolve(__dirname, '../test-questions-priyanka.json');
    const fileContent = await fs.readFile(jsonPath, 'utf8');
    const questions = JSON.parse(fileContent);
    
    console.log(`Loaded ${questions.length} questions. Running all tests...`);
    
    const testBatch = questions; // Run all questions
    
    for (let i = 0; i < testBatch.length; i++) {
      const q = testBatch[i];
      console.log(`\n======================================================`);
      console.log(`Q${i+1}: ${q.question}`);
      console.log(`======================================================`);
      
      const startTime = Date.now();
      
      // The API endpoint is a Supabase Edge Function named 'prashna'
      // Payload format: { question: string, direction?: string, birthName?: string, questionTime?: string }
      const { data, error } = await supabase.functions.invoke('prashna', {
        body: {
          question: q.question,
          birthName: "Priyanka", 
          // You could pass DOB, TOB, POB if your edge function accepts them, 
          // or just the birthName if it looks up the profile automatically.
          questionTime: new Date().toISOString()
        }
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (error) {
        console.error(`❌ Error (${duration}s):`, error.message);
      } else {
        console.log(`✅ Success (${duration}s)`);
        console.log(`Category: ${data.category || 'Unknown'}`);
        console.log(`Prashna Lagna: ${data.prashnaLagna || 'N/A'}`);
        console.log(`\nAnswer (EN):`);
        console.log(data.answerEn);
        console.log(`\nLogic:`);
        console.log(data.coreMethodEn);
        if (data.remediesEn) {
          console.log(`\nRemedy: ${data.remediesEn}`);
        }
      }
      
      // Wait between requests to avoid rate limits
      if (i < testBatch.length - 1) {
        console.log(`\n⏳ Waiting 5 seconds before next question...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log(`\n🎉 Robotic testing complete!`);
    
  } catch (error) {
    console.error("❌ Fatal Error:", error);
  }
}

runTests();
