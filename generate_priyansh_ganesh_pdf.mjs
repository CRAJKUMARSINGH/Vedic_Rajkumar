import { generateVedicGaneshPDFBuffer } from './src/services/vedicGaneshPDFGenerator.ts';
import { savePDFToLocalFolder } from './scripts/localPDFHelper.mjs';

const HOUR_SLOTS = [
  { time: '08:00 - 09:45 AM', period: 'Early Clear Zone', quality: 82, verdict: '✅ ACCEPTABLE FALLBACK' },
  { time: '09:45 - 10:13 AM', period: 'Pre-Yamaganda Buffer', quality: 84, verdict: '✅ GOOD' },
  { time: '10:13 - 11:50 AM', period: '⚠️ YAMAGANDA (Yama Lord)', quality: 40, verdict: '❌ AVOID IF POSSIBLE' },
  { time: '11:50 AM - 12:48 PM', period: 'Pre-Abhijit Pure Clear Zone', quality: 89, verdict: '✅ EXCELLENT FALLBACK' },
  { time: '12:48 - 01:45 PM', period: '🌟🌟 ABHIJIT MUHURAT CORE 🌟🌟', quality: 95, verdict: '🏆🏆🏆 BEST OF DAY' },
  { time: '01:51 - 03:02 PM', period: 'Late Abhijit + Gulika', quality: 62, verdict: '⚠️ CAUTION — Sluggish' },
  { time: '03:02 - 04:39 PM', period: 'Pure Clear Zone', quality: 88, verdict: '✅ EXCELLENT SECONDARY' },
  { time: '04:40 - 06:00 PM', period: '🔴🔴 RAHU KAAL 🔴🔴', quality: 0, verdict: '❌❌❌ ABSOLUTELY AVOID' },
];

const WEEKLY_FORECAST = [
  { week: 'Week 1 (Sep 1-6)', energy: '🌟🌟🌟🌟🌟 EXTREME HIGH', events: 'Rapid intros; 1st impressions LOCK IN; training DAY 1', caution: 'Do NOT say YES to everything', tip: '3 small daily goals; LISTEN 80%' },
  { week: 'Week 2 (Sep 7-13)', energy: '📊📊📊 MODERATE', events: 'Training & docs; first REAL ticket', caution: 'DOUBLE-CHECK EVERYTHING (Mercury errors!)', tip: 'Physical notebook notes = KARMA' },
  { week: 'Week 3 (Sep 14-20)', energy: '⚡⚡⚡⚡ INTENSE', events: 'First REAL deadline + minor conflict', caution: 'PAUSE 5 FULL SECONDS before reacting', tip: 'Hanuman Chalisa DAILY this week' },
  { week: 'Week 4 (Sep 21-27)', energy: '🪐🪐🪐 SATURN TEST', events: 'Manager 1:1 — Process & Quality review', caution: 'NO CUTTING CORNERS (Saturn sees all)', tip: 'First-Month Wins tracker file' },
  { week: 'Week 5 (Sep 28-30)', energy: '💫💫💫💫 POSITIVE', events: 'First praise + work friendships deepen', caution: 'AVOID overconfidence', tip: 'Thank You notes × 3-5 people' },
];

const FIVE_RULES = [
  { n: 1, rule: 'TALK LESS, LISTEN MORE', why: 'Mercury watches every word. Early reputation = LIFETIME reputation. Ask: "Does this need to be said, by ME, RIGHT NOW?" If 2/3 = NO → SILENCE IS GOLDEN.' },
  { n: 2, rule: 'NO OFFICE POLITICS EVER. Stay NEUTRAL.', why: 'Rahu creates gossip traps. If colleague badmouths: Say "Hmm, I\'m new so I reserve judgment" → CHANGE SUBJECT. Do NOT pick sides. Do NOT agree. Neutrality = POWER.' },
  { n: 3, rule: 'Arrive 15 min EARLY. Leave ON TIME (+5 min max late.)', why: 'First 90 days = Saturn PROBATION test of DEPENDABILITY. Brilliance can wait. Reliability builds USA career foundation. Everybody notices the person who is always there.' },
  { n: 4, rule: 'FEED BIRDS / FISH / SQUIRRELS EVERY SATURDAY.', why: '$1 Publix/Walmart bread. Park 10 min. Feed 5+ birds. SHANI DEV (Saturn) will PERSONALLY OVERSEE your promotion timeline. 100x more powerful than any resume service.' },
  { n: 5, rule: 'CALL PARENTS EVERY WEEK — MIN: WED + SUN.', why: 'Father = SUN = Career framework. Mother = MOON = Mental peace. You CANNOT succeed long-term with EITHER blessing missing. 5 min call OK. Script: "Just calling to say hi, how are you?" DO IT.' },
];

const WEEKLY_ENRICHMENT_TABLE = [
  { wk: 'W1 (Sep 1-6)', k1: 'Listen 80%. Ask only clarifying questions', k2: 'Intro + Codebase README & docs × 1 full pass', k3: 'Tuesday join day rituals + Birds Saturday', k4: 'Name of janitor + 3 coworkers. NO gossip', k5: '3 names + roles written in notebook Sunday' },
  { wk: 'W2 (Sep 7-13)', k1: 'First small ticket or task, DOUBLE-CHECK then ship', k2: '1 core framework tutorial / course (Udemy/Coursera free)', k3: 'Tue Hanuman, Wed Mercury (Green sprouts), Mon Shiva', k4: 'Gym / 30-min walk 4x this week. 8h sleep.', k5: 'Task completion screenshot + 1 learning note' },
  { wk: 'W3 (Sep 14-20)', k1: 'Deadline week. PAUSE 5s before sending ANY message.', k2: 'Deep-dive: repo architecture &amp; debugging (Chrome DevTools)', k3: 'HANUMAN CHALISA DAILY this week (Mars test!)', k4: 'Conflict if it occurs: SILENCE. Schedule 1:1 with mentor.', k5: 'Friday 5pm: self-retro 3 wins + 2 improvements.' },
  { wk: 'W4 (Sep 21-27)', k1: 'Saturn review. Process, quality, consistency. NO CORNERS.', k2: '2 LeetCode easy + doc the system design of ONE feature.', k3: 'Saturn fav day: Saturday early. Birds + Neelanjana fast.', k4: 'Wins tracker file started. Every small win = entry.', k5: '3 wins to show; 2 questions prepped for 1:1.' },
  { wk: 'W5 (Sep 28-30)', k1: 'Thank You notes × 3-5 people who helped you this month.', k2: '1 public / portfolio commit or blog post.', k3: '40-day Shiva countdown check-in. 3/4 complete = on track.', k4: 'Dinner with ONE coworker. Build rapport out of office.', k5: 'Month-end self-review email draft to yourself.' },
];
  '🎯 Join at 12:48 - 1:45 PM EDT (ABHIJIT MUHURAT CORE) — #1 slot!',
  '🛕 Brahma Muhurat Puja + HANUMAN CHALISA (TUESDAY!) before leaving',
  '👔 Outfit: 🔴 RED / Saffron / Emerald Green (Tuesday Mars colors)',
  '🍲 Satvik breakfast + GREEN MOONG SPROUTS (Mercury career boost!)',
  '🚶 Exit house + Enter office: RIGHT FOOT FIRST. 100% MANDATORY.',
  '🖋️ Sign papers: Mental "Ganeshaya Namah × 5 + Hanumate Namah × 3"',
  '🤝 Accept offer/ID WITH BOTH HANDS. Accept water/coffee → 1 sip minimum.',
  '💸 Donate $5-$11 to charity WITHIN 3 DAYS of joining.',
  '📞 CALL PARENTS AFTER JOINING. SHARE EXCITEMENT!',
  '🧿 Red Mauli (7 knots) on wrist + Vibhuti Tripund on forehead DAILY.',
  '🐦 FEED BIRDS EVERY SATURDAY IN USA. Publix bread $1. Shani Dev.',
  '🔱 Visit Shiva temple in Miami WITHIN 40 DAYS. Jalabhishek minimum.',
  '🧹 11-DAY PURGE: Nothing from office to home for 11 days. Wipe bag/laptop.',
  '🚫 AVOID 4:40 PM - 6:00 PM RAHU KAAL AT ALL COSTS. Finish by 4:30 PM!',
  '🧘 START 11-MIN USA DAILY SADHANA TODAY. Not tomorrow. TODAY!',
];

const pdfConfig = {
  reportTitle: 'PRIYANSH SINGH CHAUHAN • NEW JOB JOINING MUHURAT',
  reportTitleHi: 'प्रियांश सिंह चौहान • नौकरी योगदान शुभ मुहूर्त',
  subtitle: 'MIAMI, FLORIDA, USA ┃ 1 SEPTEMBER 2026 ┃ 8:00 AM - 6:00 PM EDT',
  subtitleHi: 'मियामी, फ्लोरिडा, यूएसए ┃ १ सितंबर २०२६ ┃ ८:०० - १८:०० EDT',
  theme: 'magenta',
  filename: 'PRIYANSH_JOINING_MUHURAT_GANESH_REPORT.pdf',
  footerBlessing: '॥ श्री गणेशाय नमः ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभः। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
  subjectInfo: [
    { label: 'Name / नाम', value: 'Priyansh Singh Chauhan' },
    { label: 'DOB / जन्म तिथि', value: '26 Oct 2000' },
    { label: 'Birth Time / समय', value: '00:50 AM IST' },
    { label: 'Birth Place / स्थान', value: 'Indore, MP, India' },
    { label: 'Joining / योगदान', value: '1 Sep 2026 (Tuesday)' },
    { label: 'Work Location', value: 'Miami, Florida, USA' },
    { label: 'Mahadasha', value: 'MARS (2020-2027) 🔥' },
    { label: 'Report Date', value: new Date().toISOString().slice(0, 10) },
  ],
  sections: [
    { icon: '🏆', title: 'CORRECT MUHURAT RECOMMENDATION (Within 8AM-6PM EDT, TUESDAY)', titleHi: 'सही मुहूर्त सलाह', accentColor: [192, 38, 211], body: [
      '⭐⭐⭐⭐⭐ #1 PRIMARY & ABSOLUTE BEST RECOMMENDED JOINING TIME: 12:48 PM - 1:45 PM EDT',
      ['Falls perfectly in ABHIJIT MUHURAT CORE (8th Muhurat — Quality 95/100)', 'Abhijit destroys ALL obstacles; INDEPENDENT of doshas; PURIFIES everything', 'Tuesday (Mars Day = his Mahadasha Lord!) + Auspicious Nakshatra + Siddha Yoga + Abhijit = QUADRUPLE BLESSING'],
      '⭐⭐⭐⭐ #2 SECONDARY CHOICE: 3:15 PM - 4:30 PM EDT',
      ['Pure Clear Zone, completely free of all major doshas', 'Excellent; use only if HR scheduling conflicts with 1 PM prime slot'],
      '⭐⭐⭐ #3 ACCEPTABLE FALLBACK: 8:15 AM - 9:30 AM EDT',
      ['Clear of all doshas; Morning Sattva guna dominant; mind fresh & alert'],
      '❌🔴 NON-NEGOTIABLE — ABSOLUTELY AVOID: 4:40 PM - 6:00 PM EDT',
      ['THIS ENTIRE 80-MINUTE WINDOW = RAHU KAAL ON TUESDAY. NEVER JOIN IN RAHU KAAL.', 'Effects: Hostile coworkers, broken HR promises, confusion, toxic environment.', 'If 6 PM is hard deadline → finish ALL rituals BY 4:30 PM LATEST.'],
    ]},
    { icon: '📅', title: '1 SEPT 2026 — PANCHANG ANALYSIS (Miami, 5-Limbs)', titleHi: 'पंचांग विश्लेषण', accentColor: [217, 70, 239], body: [
      ['VAR (Day): TUESDAY (Mangalvaar) ✅ HIGHLY AUSPICIOUS. Lord = Mars + Hanuman.',
      '⚡ SPECIAL: Tuesday = MARS DAY = HIS MAHADASHA LORD DAY. DOUBLE MARS ENERGY 🔥🔥 — COSMIC SYNERGY.',
      'TITHI: Shukla Paksha Chaturthi/Panchami Zone ✅ FAVORABLE for contracts.',
      'NAKSHATRA: Uttara Ashadha / Shravana / Uttara Bhadrapada ✅ BEST career nakshatras — Foreign settlement.',
      'YOGA: Siddha / Shubha / Shiva class ✅ HIGHLY AUSPICIOUS — Siddha Yoga = EVERYTHING succeeds that you start.',
      'KARANA: Bava / Balava / Kaulava ✅ Positive for new beginnings.',
      'SUNRISE: 7:00 AM EDT | SUNSET: 7:52 PM EDT | Day ~12h52m.']
    ]},
    { icon: '🪐', title: 'BIRTH CHART & CAREER INDICATORS (Foreign Destiny)', titleHi: 'कुंडली एवं करियर संकेत', accentColor: [236, 72, 153], body: [
      'MAHADASHA IN PROGRESS: MARS (Sept 2020 - Sept 2027) 🔥 ACTION / COURAGE / MANIFESTATION — PEAK AT AGE 25.',
      ['Mars Mahadasha at 25 = PEAK. This USA move is karmic destiny.',
      'Antardasha: Mars-Rahu → Mars-Jupiter transition = Sudden positive life events.',
      '10th House Lord: Strong → Foreign career explicitly indicated.',
      '12th House (Foreign): ACTIVATED ✅ Miami = East/Southeast from Indore — DIRECTION AUSPICIOUS.',
      'Nakshatra Family: Jyeshtha/Anuradha (Scorpio) → FOREIGN SUCCESS pattern.',
      'TRANSIT: Mercury = OWN SIGN (Virgo) → Intellect, Business & Communication TRIPLY AMPLIFIED ✅✅✅',
      'TRANSIT: Jupiter in Taurus (friend sign) → Blessings & expansion.']
    ]},
    { icon: '🧘', title: 'JOINING DAY (1 SEPT, TUESDAY) — SPIRITUAL RITUAL TIME TABLE (MIAMI EDT)', titleHi: 'योगदान दिन — आध्यात्मिक विधि', accentColor: [157, 23, 77], body: [
      '5:00 - 5:45 AM ▸ BRAHMA MUHURAT', ['Bath with Ganga water drops; NEW clothes: 🔴 RED/SAFFRON/MAROON (Mars colors!)', '20 min silent meditation + Maha Mrityunjaya × 11 + HANUMAN CHALISA × 1 (TUESDAY!)'],
      '5:45 - 6:30 AM ▸ GANESH + HANUMAN VANDANA', ['1 GHEE DIYA + 2 Sandal incense. Offer MODAK/Ladoo + JAGGERY+CHANA to HANUMAN (Tue mandatory!)', 'Ganesh Atharvashirsha once or Vakratunda × 7. Prayer: "Remove obstacles from USA journey."'],
      '6:30 - 7:00 AM ▸ NAVAGRAHA SHANTI', ['SUN: Copper Arghya + red flower. MARS: Red flower + sindoor tilak.', 'MERCURY: Eat GREEN MOONG SPROUTS (MUST for software career!). JUPITER: Yellow dal/flowers.'],
      '7:00 - 7:45 AM ▸ BREAKFAST & DRESSING', ['Satvik breakfast: Poha, Upma, Idli, Fruits, GREEN MOONG SPROUTS. NO meat/onion/garlic/alcohol.', '👔 OUTFIT: 🔴 RED/SAFFRON/MAROON BEST; EMERALD GREEN good; YELLOW/cream OK. ❌ NO black/dark grey!'],
      '8:00 AM ▸ DEPARTURE (RIGHT FOOT FIRST — ALWAYS!)', ['Exit bedroom + house: RIGHT foot first. Touch car × 4 corners clockwise + "Om Vayave Swaha."', 'POCKETS: Ganesha photo LEFT pocket (heart!), Hanuman + sindoor, steel coin+muri RIGHT pocket, RED handkerchief, sanitizer.'],
      '12:15 PM ▸ OFFICE RITUALS (15 min before Abhijit!)', ['Right foot first out of car. 3 slow deep breaths + silent OM at entrance. Threshold touch. Enter with forehead bowed.', 'Stand 10 sec facing chair → namaste prayer. Sprinkle 2-3 water drops clockwise around chair. Sit EAST or SOUTH.'],
      '🏆 12:48 PM - 1:45 PM ▸ PRIME JOINING (ABHIJIT — TUESDAY + MARS MAHADASHA!)', ['Spine STRAIGHT. GENUINE smile (Venus → good relations!). Handshake: Firm-WARM, 2-3 pumps, eye contact.', 'While SIGNING: Mentally "Ganeshaya Namah × 5 + Shri Hanumate Namah × 3". Accept offer/ID WITH BOTH HANDS. Accept drink → 1 sip minimum.'],
      '3:00 PM+ ▸ POST-JOINING', ['First lunch with GRATITUDE. WITHIN 3 DAYS: Donate $5-$11 charity. CALL PARENTS AFTER JOINING! Share excitement!']
    ]},
    { icon: '🧿', title: '1ST MONTH PROTECTION REMEDIES + LIFELONG USA AURA SHIELD', titleHi: 'पहले महीने के सुरक्षा उपाय', accentColor: [244, 114, 182], body: [
      '🪢 RED MAULI (Kalava) WITH 7 KNOTS on RIGHT WRIST → Hanuman Kavach. Tuesday joining + 7 knots = DOUBLE MARS-HANUMAN PROTECTION 🔥.',
      '🕉️ VIBHUTI / TRIPUND BHASM: Apply 3 HORIZONTAL lines on forehead EVERYDAY before leaving. (Shiva armor!)',
      '🪙 SILVER PIECE: Small silver coin/ring in wallet 100% of time. Moon blessing: mental peace + money flow.',
      '🗓️ 11-DAY PURGE: Do NOT bring ANY office item (not pen/mint/sticker!) home for 11 days. Wipe bag/laptop before threshold. Why? Prevents negative office aura from contaminating sacred home.',
      '🔱 40-DAY SHIVA: Visit ANY Shiva temple in Miami WITHIN 40 DAYS. MIN: Jalabhishek. If no temple, Monday 11 Rudra mantra + milk on Shiva photo. 40 days = karmic completion.',
      '😟 WORKPLACE EMERGENCY (21-second aura reset):',
      ['① Hold breath 8 sec → slow exhale ② Touch 3rd eye 2 sec ③ 2 slow deep breaths ④ Mentally: Om Namah Shivaya × 3 + Om Shri Hanumate Namah × 1']
    ]},
    { icon: '💎', title: 'GEMSTONE GUIDANCE (Career + Wellbeing — USA budget alternatives)', titleHi: 'रत्न सलाह', accentColor: [194, 65, 12], body: [
      '💚 #1 EMERALD (PANNA) — MERCURY (Intellect, Communication, Coworkers, Docs, Software!)',
      ['Weight: 3.25-4.50 Ratti. QUALITY > WEIGHT. Gold/Silver ring. LITTLE finger RIGHT hand. Wear WEDNESDAY morning after sunrise.', '🔥 USA BUDGET ALTERNATIVE: GREEN PERIDOT bracelet <$20. 90% same Mercury results. DAILY WEAR.'],
      '🤍 #2 PEARL (MOTI) — MOON (Mental peace + culture-shock resilience)',
      ['Silver ring/pendant. MONDAY. Little/Ring finger. Stabilizes emotions; mother blessings.'],
      '🔴 #3 RED CORAL (MOONGA) — MARS (OPTIONAL Mahadasha boost!)',
      ['Ring finger, Tuesday. ✅ BUDGET ALT: RED MAULI 7-knot you already wear = 50% boost! No cost!']
    ]},
    { icon: '🧘', title: '11-MINUTE DAILY USA SADHANA (Culture-Shock Anchor)', titleHi: '११ मिनट दैनिक साधना', accentColor: [219, 39, 119], body: [
      'America is fast-paced. Culture shock is real. Burnout is real. Your 11 minutes = anchor. MAKE the time.',
      ['① WAKE → Splash cold water + Om Gam Ganapataye Namah × 21 (5 min) → Aura reset + obstacle removal.',
       '② BREAKFAST → Hands over food + Gratitude: "Annapurne Sadapurne..." or "Thank you for this food" (2 min) → Anna Lakshmi food purity.',
       '③ BEDTIME → 3 deep breaths + Self forgiveness for ANY mistake + Recall 1 GOOD moment (even coffee!) (4 min) → Prevents karma buildup; rewires positivity.',
       'TOTAL = 11 MIN. EVERY. SINGLE. DAY.']
    ]},
    { icon: '🕉️', title: 'FINAL SPIRITUAL MESSAGE (Chauhan Vansh Lineage Blessing)', titleHi: 'अंतिम आध्यात्मिक संदेश', accentColor: [225, 29, 72], body: [
      '',
      '"Beloved Priyansh Beta,',
      'You are in MARS MAHADASHA — 7-year cycle of ACTION, COURAGE, and MANIFESTATION.',
      'Miami is not an accident. It is karmically prepared destination, cultivated over MANY lifetimes, for your NEXT evolution.',
      'You carry CHAUHAN VANSH bloodline — warriors, leaders, defenders of Dharma. Prithviraj Chauhan did not carry fear. Carry that same light into every American office:',
      ['Speak TRUTH even if unpopular.', 'Work with INTEGRITY even when camera is off.', 'RESPECT every human — janitor to CEO.', 'Never forget Indore. America gives platform; Indore raised you.'],
      'Every past "No" was not rejection—it was PROTECTION. Saving you for THIS exact "Yes." THIS exact Tuesday. THIS exact Abhijit.',
      'This USA chapter is not just a job. It is becoming the man your 10-year-old self watched in wonder. It is making parents proud beyond words. It is opening doors for sister, future children, family back home. Job = launching pad, NOT destination.',
      'You are not alone in that Miami building on Tuesday Sep 1 2026:',
      ['Your Ancestors walk with you. Ganesha clears obstacles BEFORE you see them. Hanuman carries your courage. Shiva stands behind you always. Lakshmi rests in your sincere work. Saraswati speaks through your code and words.'],
      'Only YOU can fail Sep 1 — if you forget love, respect, humility. Everything else already taken care of by Divine Plan.',
      'Ganpati Bappa Morya! 🙏 | Jai Shri Ram! 🚩 | Har Har Mahadev! 🔱 | Bajrang Bali Ki Jai! 💨"',
      '',
      'With Vedic Blessings — Vedic Rajkumar Analysis Engine',
    ]},
  ],
  tables: [
    { title: '⏰ 8AM-6PM EDT WINDOW — HOUR-BY-HOUR MUHURAT (TUESDAY 1 SEPT)', titleHi: 'घंटेवार मुहूर्त', accentColor: [217, 70, 239],
      headers: ['Time EDT', 'Vedic Period', 'Quality 0-100', 'Verdict'],
      columnWidths: { 0: 28, 1: 52, 2: 22, 3: 80 },
      rows: HOUR_SLOTS.map(s => [s.time, s.period, `${s.quality}/100`, s.verdict]) },
    { title: '📈 1-MONTH FORECAST (1 Sep → 30 Sep 2026)', titleHi: '१ महिना भविष्यवाणी', accentColor: [236, 72, 153],
      headers: ['Week', 'Energy', 'Expected Events', '⚠️ CAUTION', '💡 ACTION TIP'],
      columnWidths: { 0: 22, 1: 28, 2: 46, 3: 38, 4: 48 },
      rows: WEEKLY_FORECAST.map(w => [w.week, w.energy, w.events, w.caution, w.tip]) },
    { title: '🔴 5 NON-NEGOTIABLE LIFE RULES (1st Month & Beyond USA)', titleHi: '५ नियम', accentColor: [225, 29, 72],
      headers: ['#', 'Rule', 'Why it Matters'],
      columnWidths: { 0: 8, 1: 76, 2: 98 },
      rows: FIVE_RULES.map(r => [r.n.toString(), r.rule, r.why]) },
    { title: '✅ PRINT & CARRY — JOINING DAY 15-POINT CHECKLIST', titleHi: 'चेकलिस्ट', accentColor: [192, 38, 211],
      headers: ['#', 'Item / Ritual'],
      columnWidths: { 0: 8, 1: 174 },
      rows: CHECKLIST_ITEMS.map((item, i) => [(i+1).toString(), item]) },
  ],
};

console.log('📝 Generating Priyansh Joining Muhurat PDF (Magenta Theme)...\n');

const buffer = generateVedicGaneshPDFBuffer(pdfConfig);
const result = await savePDFToLocalFolder({
  pdfBuffer: buffer,
  filename: pdfConfig.filename,
  subjectInfo: pdfConfig.subjectInfo,
});

console.log('✅ PDF Generated & Saved Successfully!');
console.log('');
console.log('📁 Folder Structure:');
console.log(`   📂 output/`);
console.log(`      📂 ${result.dateFolder}/`);
console.log(`         📂 ${result.clientName}/`);
console.log(`            📄 ${result.filename}`);
console.log('');
console.log(`📍 Absolute Path: ${result.absolutePath}`);
console.log(`📌 Relative Path: ${result.relativePath}`);
console.log('');
console.log('👤 Client: Priyansh Singh Chauhan — Miami Job Joining (Tuesday, 1 Sep 2026)');
console.log('🏆 Best Slot: 12:48 PM - 1:45 PM EDT (Abhijit Muhurat Core)');
console.log('🚫 Avoid:    4:40 PM - 6:00 PM EDT (Rahu Kaal Tuesday)');
console.log('🎨 Theme:    Magenta (Fuchsia / Pink / Rose palette)');
