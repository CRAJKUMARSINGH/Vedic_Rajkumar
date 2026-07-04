import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find a garbled sequence
const lines = str.split('\n');
const garbledLine = lines.find(l => l.length > 50 && /[^\x00-\x7F\u0900-\u097F]/.test(l) && l.includes('"'));

if (garbledLine) {
  // Find the garbled string in quotes
  const matches = [...garbledLine.matchAll(/"([^"]{5,})"/g)];
  for (const m of matches) {
    const s = m[1];
    if (/[^\x00-\x7F\u0900-\u097F]/.test(s)) {
      console.log('Garbled string:', JSON.stringify(s.substring(0, 40)));
      // Show codepoints
      const cps = [...s.substring(0, 20)].map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')} (${c})`);
      console.log('Codepoints:', cps.join(', '));
      break;
    }
  }
}
