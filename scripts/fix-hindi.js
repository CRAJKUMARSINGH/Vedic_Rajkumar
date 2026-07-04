const fs = require('fs');
let c = fs.readFileSync('src/pages/Index.tsx', 'utf8');

// Find the garbled Mundane string and get its exact bytes
const idx = c.indexOf('"Mundane"}');
const start = c.lastIndexOf('{isHi', idx);
const chunk = c.substring(start, idx + 10);
const qi = chunk.indexOf('"');
const qi2 = chunk.indexOf('"', qi + 1);
const garbled = chunk.substring(qi + 1, qi2);
const bytes = Buffer.from(garbled, 'utf8');
console.log('Garbled hex:', bytes.toString('hex'));
console.log('Length:', bytes.length);
// Try decoding as latin1->utf8
const latin1 = bytes.toString('latin1');
const fixed = Buffer.from(latin1, 'latin1').toString('utf8');
console.log('Fixed:', fixed);
