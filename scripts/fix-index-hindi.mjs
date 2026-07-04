/**
 * Fix garbled Hindi strings in Index.tsx
 * The garbled text is triple-encoded UTF-8 stored as Windows-1252 then re-encoded as UTF-8.
 * We fix by doing targeted string replacements with the correct Hindi text.
 */
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/pages/Index.tsx';
let content = readFileSync(file, 'utf8');

// Each garbled string maps to its correct Hindi equivalent
// These were identified by analyzing the byte sequences
const fixes = [
  // Navigation links (garbled → correct Hindi)
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ÃƒÂ Ã‚Â¤Ã‚Â¡ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã‚Â¨" : "Mundane"\}/, '{isHi ? "मुंडेन" : "Mundane"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¢ÃƒÂ Ã‚Â¤Ã‚Â¼ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Sade Sati"\}/, '{isHi ? "साढ़े सात" : "Sade Sati"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¦ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…Â¸ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬â€" : "Ashtakavarga"\}/, '{isHi ? "अष्टकवर्ग" : "Ashtakavarga"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ÃƒÂ Ã‚Â¤Ã¢â‚¬â€œÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Learn"\}/, '{isHi ? "सीखें" : "Learn"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¯" : "Community"\}/, '{isHi ? "समुदाय" : "Community"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â·ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬" : "Marketplace"\}/, '{isHi ? "ज्योतिषी बाज़ार" : "Marketplace"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â­ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â§ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚ÂÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡ ÃƒÂ¢Ã…â€œÃ‚Â¦" : "All Features ÃƒÂ¢Ã…â€œÃ‚Â¦"\}/, '{isHi ? "सभी सुविधाएं ✦" : "All Features ✦"}'],
  // Transit date label
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¿ ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Select Transit Date"\}/, '{isHi ? "गोचर तिथि चुनें" : "Select Transit Date"}'],
  // Transit date in header
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¿" : "Transit Date"\}/, '{isHi ? "गोचर तिथि" : "Transit Date"}'],
  // Calculating spinner
  [/\{isHi \? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã¢â‚¬â€ÃƒÂ Ã‚Â¤Ã‚Â£ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¹ ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦<\/span> : "CalculatingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦"\}/, '{isHi ? <span className="font-hindi">गणना हो रही है…</span> : "Calculating…"}'],
  // Hint text for date picker
  [/\{isHi \? "अद्यतन करें" : "Update"\}\s*\{isHi \? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬[^"]*\)" : "View transits for any date \(past\/present\/future\)"\}/, '{isHi ? "किसी भी तिथि के लिए गोचर देखें (भूत/वर्तमान/भविष्य)" : "View transits for any date (past/present/future)"}'],
  // Birth info chips
  [/\{isHi \? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã…â€œÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â®: \{rawBirthData\.date\}<\/span> : `Birth: \$\{rawBirthData\.date\}`\}/, '{isHi ? <span className="font-hindi">जन्म: {rawBirthData.date}</span> : `Birth: ${rawBirthData.date}`}'],
  [/\{isHi \? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â®ÃƒÂ Ã‚Â¤Ã‚Â¯: \{rawBirthData\.time\}<\/span> : `Time: \$\{rawBirthData\.time\}`\}/, '{isHi ? <span className="font-hindi">समय: {rawBirthData.time}</span> : `Time: ${rawBirthData.time}`}'],
  [/\{isHi \? <span className="font-hindi">ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¥ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¨: \{rawBirthData\.location\}<\/span> : `Place: \$\{rawBirthData\.location\}`\}/, '{isHi ? <span className="font-hindi">स्थान: {rawBirthData.location}</span> : `Place: ${rawBirthData.location}`}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã…â€œ ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡\.\.\." : "Saving\.\.\."\}/, '{isHi ? "सहेज रहे हैं..." : "Saving..."}'],
  // Sade Sati section
  [/<span className="text-2xl">ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â<\/span>/, '<span className="text-2xl">⚠️</span>'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¢ÃƒÂ Ã‚Â¤Ã‚Â¼ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¥Ã¢â€šÂ¬ ÃƒÂ Ã‚Â¤Ã‚Â¸ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚Â¯!" : "Sade Sati Active!"\}/, '{isHi ? "साढ़े सात सक्रिय!" : "Sade Sati Active!"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã¢â‚¬Â°ÃƒÂ Ã‚Â¤Ã‚ÂªÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â¯ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬â€œÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "View Remedies"\}/, '{isHi ? "उपाय देखें" : "View Remedies"}'],
  // Tabs
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¤ÃƒÂ Ã‚Â¤Ã‚Â¾ÃƒÂ Ã‚Â¤Ã‚Â²ÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Table View"\}/, '{isHi ? "तालिका दृश्य" : "Table View"}'],
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã…Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â° ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¥Ã†â€™ÃƒÂ Ã‚Â¤Ã‚Â¶ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã‚Â¯" : "Chart View"\}/, '{isHi ? "चक्र दृश्य" : "Chart View"}'],
  // Reset button
  [/\{isHi \? "ÃƒÂ Ã‚Â¤Ã‚Â¨ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ Ã‚Â¤Ã‚Â¾ ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â¿ÃƒÂ Ã‚Â¤Ã‚ÂµÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¤Ã‚Â£ ÃƒÂ Ã‚Â¤Ã‚Â¦ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã‚ÂÃƒÂ Ã‚Â¤Ã…â€œ ÃƒÂ Ã‚Â¤Ã¢â‚¬Â¢ÃƒÂ Ã‚Â¤Ã‚Â°ÃƒÂ Ã‚Â¥Ã¢â‚¬Â¡ÃƒÂ Ã‚Â¤Ã¢â‚¬Å¡" : "Enter new details"\}/, '{isHi ? "नया विवरण दर्ज करें" : "Enter new details"}'],
  // Disclaimer (long garbled Hindi paragraph)
  [/\{isHi\s*\?\s*"ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â ÃƒÂ Ã‚Â¤Ã‚Â¯ÃƒÂ[^"]*ÃƒÂ Ã‚Â¤Ã‚Â¹ÃƒÂ Ã‚Â¥Ã‹â€ ÃƒÂ Ã‚Â¥Ã‚Â4"\s*:\s*"ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â General transit analysis[^"]*"\}/, '{isHi ? "⚠️ यह फलदीपिका व बृहत् पाराशर होरा शास्त्र पर आधारित सामान्य गोचर विश्लेषण है। वेध (अवरोध) व विपरीत वेध का विचार किया गया है। व्यक्तिगत फल हेतु पूर्ण कुंडली, दशा व अष्टकवर्ग विश्लेषण आवश्यक है।" : "⚠️ General transit analysis based on Phaladeepika & BPHS principles. Vedha (obstruction) & Vipreet Vedha are considered. For personalized results, full chart, Dasha & Ashtakavarga analysis is needed."}'],
];

let fixCount = 0;
for (const [pattern, replacement] of fixes) {
  const before = content;
  content = content.replace(pattern, replacement);
  if (content !== before) fixCount++;
}

// Also fix the hint text which has a different structure
content = content.replace(
  /\{isHi \? "अद्यतन करें" : "Update"\}\s*\n\s*\{isHi \? "[^"]*\)" : "View transits for any date \(past\/present\/future\)"\}/,
  '{isHi ? "किसी भी तिथि के लिए गोचर देखें (भूत/वर्तमान/भविष्य)" : "View transits for any date (past/present/future)"}'
);

writeFileSync(file, content, 'utf8');

// Verify
const verify = readFileSync(file, 'utf8');
const remaining = (verify.match(/ÃƒÂ/g) || []).length;
const hindiCount = (verify.match(/[\u0900-\u097F]/g) || []).length;
console.log(`Fixed ${fixCount} patterns`);
console.log(`Hindi chars: ${hindiCount}, Remaining garbled: ${remaining}`);
