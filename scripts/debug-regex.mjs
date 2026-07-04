import { readFileSync } from 'fs';

const buf = readFileSync('src/pages/Index.tsx');
const str = buf.toString('utf8');

// Find the Mundane line
const lines = str.split('\n');
for (const line of lines) {
  if (line.includes('Mundane')) {
    console.log('Line found');
    // Test the regex
    const testRegex = /"([^"]*[\u00C0-\u00FF][^"]*)"/g;
    const matches = [...line.matchAll(testRegex)];
    console.log('Regex matches:', matches.length);
    
    // Try simpler regex
    const simpleRegex = /"[^"]*Ã[^"]*"/g;
    const simpleMatches = [...line.matchAll(simpleRegex)];
    console.log('Simple regex matches:', simpleMatches.length);
    if (simpleMatches.length > 0) {
      console.log('Match:', simpleMatches[0][0].substring(0, 50));
    }
    
    // Check if Ã is in the line
    console.log('Contains Ã:', line.includes('Ã'));
    console.log('Ã codepoint:', 'Ã'.codePointAt(0).toString(16));
    
    // Check what's actually in the line at the garbled position
    const idx = line.indexOf('Ã');
    if (idx >= 0) {
      console.log('Ã at index:', idx);
      const cp = line.codePointAt(idx);
      console.log('Actual codepoint at that position:', cp.toString(16));
    }
    break;
  }
}
