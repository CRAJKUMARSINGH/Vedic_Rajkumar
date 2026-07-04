import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find a garbled line
const lines = str.split('\n');
const garbledLine = lines.find(l => l.includes('\u00c3\u0192\u00c2'));
if (garbledLine) {
  console.log('Found garbled line');
  // Extract the garbled string
  const m = garbledLine.match(/"([^"]+)"/);
  if (m) {
    const garbled = m[1];
    console.log('Garbled string (first 30):', JSON.stringify(garbled.substring(0, 30)));
    
    // Fix: the garbled text is UTF-8 bytes that were encoded as Latin-1 then re-encoded as UTF-8
    // To fix: take the UTF-8 string, get its bytes, interpret as Latin-1, then decode as UTF-8
    const bytes = Buffer.from(garbled, 'utf8');
    const latin1 = bytes.toString('latin1');
    const fixedBytes = Buffer.from(latin1, 'latin1');
    const fixed = fixedBytes.toString('utf8');
    console.log('Fixed:', fixed.substring(0, 30));
  }
}
