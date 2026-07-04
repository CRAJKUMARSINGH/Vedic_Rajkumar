import { readFileSync } from 'fs';
const c = readFileSync('src/pages/Index.tsx', 'utf8');
const lines = c.split('\n');
const garbled = lines.filter(l => /\u00c3\u0192/.test(l));
console.log('Remaining garbled lines:', garbled.length);
garbled.forEach((l,i) => console.log(i+':', l.trim().substring(0,120)));
