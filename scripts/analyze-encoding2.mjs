import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find a line with the specific garbled pattern (Mundane link)
const lines = str.split('\n');
for (const line of lines) {
  if (line.includes('Mundane') && line.includes('"')) {
    console.log('Found Mundane line:', line.trim());
    // Find the Hindi string
    const m = line.match(/isHi \? "([^"]+)"/);
    if (m) {
      const s = m[1];
      console.log('Hindi string:', JSON.stringify(s));
      const cps = [...s].map(c => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}(${c})`);
      console.log('Codepoints:', cps.join(' '));
    }
    break;
  }
}
