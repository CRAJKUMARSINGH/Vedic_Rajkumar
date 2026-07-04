// Direct replacement of corrupted Hindi strings in Index.tsx
// Each corrupted string is replaced with the correct Hindi text based on context
import { readFileSync, writeFileSync } from 'fs';

const replacements = [
  // Line 136: comment arrow
  ["Set birth input \u00c3\u0192\u00c2\u00a2\u00c3\u201a\u00c2\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u201a\u00c2\u00a2\u00e2\u20ac\u017e\u00c2\u00ac hook auto-calculates all chart data",
   "Set birth input \u2014 hook auto-calculates all chart data"],
  // Line 305: "मुंडेन" (Mundane)
  ["\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00ae\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u0081\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u2020\u00e2\u20ac\u0161\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a8",
   "\u092e\u0941\u0902\u0921\u0947\u0928"],
];

let content = readFileSync('src/pages/Index.tsx', 'utf8');
console.log('File size before:', content.length);

// Strategy: use regex to find and replace all corrupted patterns
// Pattern: sequences of \u00c3 followed by other high chars
let count = 0;

// Map of corrupted -> correct based on line numbers and context
const lineMap = {
  305: ['\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00ae\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u0081\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u2020\u00e2\u20ac\u0161\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a8', '\u092e\u0941\u0902\u0921\u0947\u0928'],
};

console.log('Done. Replacements applied:', count);
