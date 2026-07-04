// Direct string replacement of corrupted Hindi in Index.tsx
const fs = require('fs');
let content = fs.readFileSync('src/pages/Index.tsx', 'utf8');

// Each pair: [corrupted_string, correct_hindi]
// Identified by context (nav links, labels, UI text)
const fixes = [
  // mundane-astrology nav link
  ['\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00ae\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u0081\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u2020\u00e2\u20ac\u0161\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a5\u00c3\u201a\u00c2\u00a1\u00c3\u0192\u00c2\u00a0\u00c3\u201a\u00c2\u00a4\u00c3\u201a\u00c2\u00a8',
   '\u092e\u0941\u0902\u0921\u0947\u0928'],
];

let count = 0;
fixes.forEach(([bad, good]) => {
  if (content.includes(bad)) {
    content = content.split(bad).join(good);
    count++;
    console.log('Fixed: ' + good);
  } else {
    console.log('NOT FOUND for: ' + good);
  }
});

fs.writeFileSync('src/pages/Index.tsx', content, 'utf8');
console.log('Total fixes applied:', count);
