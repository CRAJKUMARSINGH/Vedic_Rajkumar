import { readFileSync } from 'fs';
const c = readFileSync('src/pages/Index.tsx', 'utf8');
const idx = c.indexOf('"Mundane"}');
const start = c.lastIndexOf('{isHi', idx);
const chunk = c.substring(start, idx + 10);
const qi = chunk.indexOf('"');
const qi2 = chunk.indexOf('"', qi + 1);
const g = chunk.substring(qi + 1, qi2);
// Show all codepoints
const cps = [...g].map(ch => ch.codePointAt(0).toString(16).padStart(4,'0'));
console.log('All codepoints:', cps.join(' '));
