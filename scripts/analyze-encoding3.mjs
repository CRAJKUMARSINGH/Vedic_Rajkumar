import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find the Mundane line
const lines = str.split('\n');
for (const line of lines) {
  if (line.includes('Mundane') && line.includes('"')) {
    const m = line.match(/isHi \? "([^"]+)"/);
    if (m) {
      const s = m[1];
      console.log('Length:', s.length);
      // Show first 10 chars with their codepoints
      for (let i = 0; i < Math.min(10, s.length); i++) {
        const cp = s.codePointAt(i);
        console.log(`  [${i}] U+${cp.toString(16).toUpperCase().padStart(4,'0')} char="${s[i]}" inRange=${cp >= 0x80 && cp <= 0xFF}`);
      }
      
      // Try to fix manually
      const bytes = [];
      let ok = true;
      for (const char of s) {
        const cp = char.codePointAt(0);
        if (cp <= 0xFF) {
          bytes.push(cp);
        } else if (cp === 0x0192) { // ƒ -> 0x83
          bytes.push(0x83);
        } else if (cp === 0x201A) { // ‚ -> 0x82
          bytes.push(0x82);
        } else if (cp === 0x2026) { // … -> 0x85
          bytes.push(0x85);
        } else if (cp === 0x2020) { // † -> 0x86
          bytes.push(0x86);
        } else if (cp === 0x2022) { // • -> 0x95
          bytes.push(0x95);
        } else if (cp === 0x2039) { // ‹ -> 0x8B
          bytes.push(0x8B);
        } else if (cp === 0x203A) { // › -> 0x9B
          bytes.push(0x9B);
        } else if (cp === 0x2018) { // ' -> 0x91
          bytes.push(0x91);
        } else if (cp === 0x2019) { // ' -> 0x92
          bytes.push(0x92);
        } else if (cp === 0x201C) { // " -> 0x93
          bytes.push(0x93);
        } else if (cp === 0x201D) { // " -> 0x94
          bytes.push(0x94);
        } else if (cp === 0x2030) { // ‰ -> 0x89
          bytes.push(0x89);
        } else if (cp === 0x0160) { // Š -> 0x8A
          bytes.push(0x8A);
        } else if (cp === 0x0161) { // š -> 0x9A
          bytes.push(0x9A);
        } else if (cp === 0x0152) { // Œ -> 0x8C
          bytes.push(0x8C);
        } else if (cp === 0x0153) { // œ -> 0x9C
          bytes.push(0x9C);
        } else if (cp === 0x017D) { // Ž -> 0x8E
          bytes.push(0x8E);
        } else if (cp === 0x017E) { // ž -> 0x9E
          bytes.push(0x9E);
        } else if (cp === 0x0178) { // Ÿ -> 0x9F
          bytes.push(0x9F);
        } else if (cp === 0x20AC) { // € -> 0x80
          bytes.push(0x80);
        } else if (cp === 0x2021) { // ‡ -> 0x87
          bytes.push(0x87);
        } else if (cp === 0x02C6) { // ˆ -> 0x88
          bytes.push(0x88);
        } else if (cp === 0x2122) { // ™ -> 0x99
          bytes.push(0x99);
        } else if (cp === 0x0081) { // control char
          bytes.push(0x81);
        } else {
          console.log(`  Unknown codepoint: U+${cp.toString(16).toUpperCase()} (${char})`);
          ok = false;
          break;
        }
      }
      
      if (ok) {
        const decoded = Buffer.from(bytes).toString('utf8');
        console.log('Decoded:', decoded);
      }
    }
    break;
  }
}
