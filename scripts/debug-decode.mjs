import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find the Mundane line
const lines = str.split('\n');
for (const line of lines) {
  if (line.includes('Mundane')) {
    const m = line.match(/"(Ã[^"]*)"/);
    if (m) {
      const content = m[1];
      console.log('Content length:', content.length);
      console.log('First 5 chars and codepoints:');
      for (let i = 0; i < Math.min(5, content.length); i++) {
        const cp = content.codePointAt(i);
        console.log(`  [${i}] U+${cp.toString(16).toUpperCase()} (${content[i]})`);
      }
      
      // Windows-1252 reverse map
      const unicodeToWin1252 = {};
      const win1252ToUnicode = {
        0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E,
        0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6,
        0x89: 0x2030, 0x8A: 0x0160, 0x8B: 0x2039, 0x8C: 0x0152,
        0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201C,
        0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
        0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A,
        0x9C: 0x0153, 0x9E: 0x017E, 0x9F: 0x0178,
      };
      for (const [byte, unicode] of Object.entries(win1252ToUnicode)) {
        unicodeToWin1252[unicode] = parseInt(byte);
      }
      for (let i = 0xA0; i <= 0xFF; i++) unicodeToWin1252[i] = i;
      for (let i = 0; i <= 0x7F; i++) unicodeToWin1252[i] = i;
      
      // Try to decode
      const bytes = [];
      let failed = false;
      for (const char of content) {
        const cp = char.codePointAt(0);
        if (cp in unicodeToWin1252) {
          bytes.push(unicodeToWin1252[cp]);
        } else {
          console.log(`  FAILED at U+${cp.toString(16).toUpperCase()} (${char})`);
          failed = true;
          break;
        }
      }
      
      if (!failed) {
        const decoded = Buffer.from(bytes).toString('utf8');
        console.log('Decoded:', decoded);
      }
    }
    break;
  }
}
