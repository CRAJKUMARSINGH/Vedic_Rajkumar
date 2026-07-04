// Fix double-encoded UTF-8 Hindi strings in Index.tsx
import { readFileSync, writeFileSync } from 'fs';

function fixDoubleEncodedUtf8(str) {
  // The string was UTF-8 bytes stored as latin1 codepoints
  // Each character's charCode is a raw UTF-8 byte
  try {
    const bytes = Buffer.from(str.split('').map(c => c.charCodeAt(0)));
    return bytes.toString('utf8');
  } catch (e) {
    return str;
  }
}

const content = readFileSync('src/pages/Index.tsx', 'utf8');
const lines = content.split('\n');

// Collect all unique corrupted strings and their fixes
const fixes = new Map();
lines.forEach((line, i) => {
  // Match strings containing the corruption pattern
  const re = /"([^"]*\u00c3[^"]*)"/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const corrupt = m[1];
    if (!fixes.has(corrupt)) {
      const fixed = fixDoubleEncodedUtf8(corrupt);
      fixes.set(corrupt, fixed);
      console.log('Line ' + (i+1) + ':');
      console.log('  CORRUPT: ' + corrupt.substring(0, 80));
      console.log('  FIXED:   ' + fixed.substring(0, 80));
      console.log('');
    }
  }
});

console.log('\nTotal unique corrupted strings found:', fixes.size);
