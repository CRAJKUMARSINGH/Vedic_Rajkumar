import { readFileSync, writeFileSync } from 'fs';

// Windows-1252 to Unicode mapping for the 0x80-0x9F range
// (Latin-1 maps these to control chars, but Windows-1252 maps them to printable chars)
const win1252ToUnicode = {
  0x80: 0x20AC, // €
  0x81: 0x0081, // undefined -> use as-is
  0x82: 0x201A, // ‚
  0x83: 0x0192, // ƒ
  0x84: 0x201E, // „
  0x85: 0x2026, // …
  0x86: 0x2020, // †
  0x87: 0x2021, // ‡
  0x88: 0x02C6, // ˆ
  0x89: 0x2030, // ‰
  0x8A: 0x0160, // Š
  0x8B: 0x2039, // ‹
  0x8C: 0x0152, // Œ
  0x8D: 0x008D, // undefined
  0x8E: 0x017D, // Ž
  0x8F: 0x008F, // undefined
  0x90: 0x0090, // undefined
  0x91: 0x2018, // '
  0x92: 0x2019, // '
  0x93: 0x201C, // "
  0x94: 0x201D, // "
  0x95: 0x2022, // •
  0x96: 0x2013, // –
  0x97: 0x2014, // —
  0x98: 0x02DC, // ˜
  0x99: 0x2122, // ™
  0x9A: 0x0161, // š
  0x9B: 0x203A, // ›
  0x9C: 0x0153, // œ
  0x9D: 0x009D, // undefined
  0x9E: 0x017E, // ž
  0x9F: 0x0178, // Ÿ
};

// Reverse map: Unicode -> byte value
const unicodeToWin1252 = {};
for (const [byte, unicode] of Object.entries(win1252ToUnicode)) {
  unicodeToWin1252[unicode] = parseInt(byte);
}
// Also add standard Latin-1 range (0xA0-0xFF maps directly)
for (let i = 0xA0; i <= 0xFF; i++) {
  unicodeToWin1252[i] = i;
}
// And ASCII range
for (let i = 0; i <= 0x7F; i++) {
  unicodeToWin1252[i] = i;
}

function decodeWin1252String(s) {
  const bytes = [];
  for (const char of s) {
    const cp = char.codePointAt(0);
    if (cp in unicodeToWin1252) {
      bytes.push(unicodeToWin1252[cp]);
    } else {
      return null; // Unknown character
    }
  }
  try {
    const decoded = Buffer.from(bytes).toString('utf8');
    if (/[\u0900-\u097F]/.test(decoded)) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

const buf = readFileSync('src/pages/Index.tsx');
let str = buf.toString('utf8');

// Find all garbled sequences and fix them
// A garbled sequence is a run of characters that are all in the Windows-1252 range
// and when decoded as UTF-8 bytes produce Hindi text

let fixCount = 0;

// Process the file line by line to find garbled strings in JSX
const lines = str.split('\n');
const fixedLines = lines.map(line => {
  // Find strings in quotes that contain non-ASCII non-Hindi characters
  return line.replace(/"([^"]*[\u00C0-\u00FF\u0192\u201A-\u201E\u2020-\u2022\u2026\u2030\u2039-\u203A\u20AC\u0152-\u0153\u0160-\u0161\u0178\u017D-\u017E][^"]*)"/g, (fullMatch, content) => {
    // Try to decode the content
    const decoded = decodeWin1252String(content);
    if (decoded) {
      fixCount++;
      return `"${decoded}"`;
    }
    return fullMatch;
  });
});

str = fixedLines.join('\n');

console.log(`Fixed ${fixCount} garbled strings`);

const hindiCount = (str.match(/[\u0900-\u097F]/g) || []).length;
const garbledCount = (str.match(/ÃƒÂ/g) || []).length;
console.log(`Hindi chars: ${hindiCount}, Remaining garbled: ${garbledCount}`);

const samples = str.match(/मुंडेन|साढ़े|अष्टकवर्ग|सीखें|समुदाय|गोचर तिथि/g);
console.log('Sample Hindi found:', samples ? samples.slice(0, 5).join(', ') : 'none');

writeFileSync('src/pages/Index.tsx', str, 'utf8');
console.log('File written successfully');
