import { useState, useMemo, memo } from 'react';
import { Download, Printer, CalendarCheck, MapPin, Clock, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VARA_COLORS: Record<string, string> = {
  Tuesday: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const GRADE_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'A+': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40', label: 'Excellent' },
  'A':  { bg: 'bg-teal-500/20',   text: 'text-teal-300',   border: 'border-teal-500/40',   label: 'Very Good' },
  'B+': { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40',   label: 'Good' },
  'B':  { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/40',  label: 'Moderate' },
  'C':  { bg: 'bg-slate-500/15',  text: 'text-slate-400',  border: 'border-slate-500/30',  label: 'Fair' },
  'Avoid': { bg: 'bg-red-500/15', text: 'text-red-400',    border: 'border-red-500/30',    label: 'Avoid' },
};

const ScoreRing = memo(function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const color = score >= 85 ? 'stroke-emerald-500' : score >= 70 ? 'stroke-teal-500' : score >= 55 ? 'stroke-blue-500' : score >= 40 ? 'stroke-amber-500' : 'stroke-red-500';
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className={`-rotate-90`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="4" className={color} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - fill} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
    </div>
  );
});

const HOUR_SLOTS = [
  { time: '08:00 - 09:45 AM', period: 'Early Clear Zone', quality: 82, grade: 'B+', verdict: '✅ ACCEPTABLE FALLBACK' },
  { time: '09:45 - 10:13 AM', period: 'Pre-Yamaganda Buffer', quality: 84, grade: 'B+', verdict: '✅ GOOD' },
  { time: '10:13 - 11:50 AM', period: '⚠️ YAMAGANDA (Yama Lord)', quality: 40, grade: 'C', verdict: '❌ AVOID IF POSSIBLE' },
  { time: '11:50 AM - 12:48 PM', period: 'Pre-Abhijit Pure Clear', quality: 89, grade: 'A', verdict: '✅ EXCELLENT FALLBACK' },
  { time: '12:48 - 01:45 PM', period: '🌟🌟 ABHIJIT MUHURAT CORE 🌟🌟', quality: 95, grade: 'A+', verdict: '🏆🏆🏆 BEST OF DAY' },
  { time: '01:51 - 03:02 PM', period: 'Late Abhijit + Gulika', quality: 62, grade: 'B', verdict: '⚠️ CAUTION — Sluggish' },
  { time: '03:02 - 04:39 PM', period: 'Pure Clear Zone', quality: 88, grade: 'A', verdict: '✅ EXCELLENT SECONDARY' },
  { time: '04:40 - 06:00 PM', period: '🔴🔴 RAHU KAAL 🔴🔴', quality: 0, grade: 'Avoid', verdict: '❌❌❌ ABSOLUTELY AVOID' },
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

const CHECKLIST_ITEMS = [
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

function buildPDFConfig(): import('@/services/vedicGaneshPDFGenerator').GaneshPDFConfig {
  return {
    reportTitle: 'PRIYANSH SINGH CHAUHAN • NEW JOB JOINING MUHURAT',
    reportTitleHi: 'प्रियांश सिंह चौहान • नौकरी योगदान शुभ मुहूर्त',
    subtitle: 'MIAMI, FLORIDA, USA ┃ 1 SEPTEMBER 2026 ┃ 8:00 AM - 6:00 PM EDT',
    subtitleHi: 'मियामी, फ्लोरिडा, यूएसए ┃ १ सितंबर २०२६ ┃ ८:०० - १८:०० EDT',
    theme: 'premium',
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
    { icon: '🏆', title: 'CORRECT MUHURAT RECOMMENDATION (Within 8AM-6PM EDT, TUESDAY)', titleHi: 'सही मुहूर्त सलाह', accentColor: [22, 101, 52], body: [
      '⭐⭐⭐⭐⭐ #1 PRIMARY & ABSOLUTE BEST RECOMMENDED JOINING TIME: 12:48 PM - 1:45 PM EDT',
      ['Falls perfectly in ABHIJIT MUHURAT CORE (8th Muhurat — Quality 95/100)', 'Abhijit destroys ALL obstacles; INDEPENDENT of doshas; PURIFIES everything', 'Tuesday (Mars Day = his Mahadasha Lord!) + Auspicious Nakshatra + Siddha Yoga + Abhijit = QUADRUPLE BLESSING'],
      '⭐⭐⭐⭐ #2 SECONDARY CHOICE: 3:15 PM - 4:30 PM EDT',
      ['Pure Clear Zone, completely free of all major doshas', 'Excellent; use only if HR scheduling conflicts with 1 PM prime slot'],
      '⭐⭐⭐ #3 ACCEPTABLE FALLBACK: 8:15 AM - 9:30 AM EDT',
      ['Clear of all doshas; Morning Sattva guna dominant; mind fresh & alert'],
      '❌🔴 NON-NEGOTIABLE — ABSOLUTELY AVOID: 4:40 PM - 6:00 PM EDT',
      ['THIS ENTIRE 80-MINUTE WINDOW = RAHU KAAL ON TUESDAY. NEVER JOIN IN RAHU KAAL.', 'Effects: Hostile coworkers, broken HR promises, confusion, toxic environment.', 'If 6 PM is hard deadline → finish ALL rituals BY 4:30 PM LATEST.'],
    ]},
    { icon: '📅', title: '1 SEPT 2026 — PANCHANG ANALYSIS (Miami, 5-Limbs)', titleHi: 'पंचांग विश्लेषण', accentColor: [120, 53, 15], body: [
      ['VAR (Day): TUESDAY (Mangalvaar) ✅ HIGHLY AUSPICIOUS. Lord = Mars + Hanuman.',
      '⚡ SPECIAL: Tuesday = MARS DAY = HIS MAHADASHA LORD DAY. DOUBLE MARS ENERGY 🔥🔥 — COSMIC SYNERGY.',
      'TITHI: Shukla Paksha Chaturthi/Panchami Zone ✅ FAVORABLE for contracts.',
      'NAKSHATRA: Uttara Ashadha / Shravana / Uttara Bhadrapada ✅ BEST career nakshatras — Foreign settlement.',
      'YOGA: Siddha / Shubha / Shiva class ✅ HIGHLY AUSPICIOUS — Siddha Yoga = EVERYTHING succeeds that you start.',
      'KARANA: Bava / Balava / Kaulava ✅ Positive for new beginnings.',
      'SUNRISE: 7:00 AM EDT | SUNSET: 7:52 PM EDT | Day ~12h52m.']
    ]},
    { icon: '🪐', title: 'BIRTH CHART & CAREER INDICATORS (Foreign Destiny)', titleHi: 'कुंडली एवं करियर संकेत', accentColor: [30, 64, 175], body: [
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
    { icon: '🧿', title: '1ST MONTH PROTECTION REMEDIES + LIFELONG USA AURA SHIELD', titleHi: 'पहले महीने के सुरक्षा उपाय', accentColor: [146, 64, 14], body: [
      '🪢 RED MAULI (Kalava) WITH 7 KNOTS on RIGHT WRIST → Hanuman Kavach. Tuesday joining + 7 knots = DOUBLE MARS-HANUMAN PROTECTION 🔥.',
      '🕉️ VIBHUTI / TRIPUND BHASM: Apply 3 HORIZONTAL lines on forehead EVERYDAY before leaving. (Shiva armor!)',
      '🪙 SILVER PIECE: Small silver coin/ring in wallet 100% of time. Moon blessing: mental peace + money flow.',
      '🗓️ 11-DAY PURGE: Do NOT bring ANY office item (not pen/mint/sticker!) home for 11 days. Wipe laptop/bag before threshold. Why? Prevents negative office aura from contaminating sacred home.',
      '🔱 40-DAY SHIVA: Visit ANY Shiva temple in Miami WITHIN 40 DAYS. MIN: Jalabhishek. If no temple, Monday 11 Rudra mantra + milk on Shiva photo. 40 days = karmic completion.',
      '😟 WORKPLACE EMERGENCY (21-second aura reset):',
      ['① Hold breath 8 sec → slow exhale ② Touch 3rd eye 2 sec ③ 2 slow deep breaths ④ Mentally: Om Namah Shivaya × 3 + Om Shri Hanumate Namah × 1']
    ]},
    { icon: '💎', title: 'GEMSTONE GUIDANCE (Career + Wellbeing — USA budget alternatives)', titleHi: 'रत्न सलाह', accentColor: [8, 47, 73], body: [
      '💚 #1 EMERALD (PANNA) — MERCURY (Intellect, Communication, Coworkers, Docs, Software!)',
      ['Weight: 3.25-4.50 Ratti. QUALITY > WEIGHT. Gold/Silver ring. LITTLE finger RIGHT hand. Wear WEDNESDAY morning after sunrise.', '🔥 USA BUDGET ALTERNATIVE: GREEN PERIDOT bracelet <$20. 90% same Mercury results. DAILY WEAR.'],
      '🤍 #2 PEARL (MOTI) — MOON (Mental peace + culture-shock resilience)',
      ['Silver ring/pendant. MONDAY. Little/Ring finger. Stabilizes emotions; mother blessings.'],
      '🔴 #3 RED CORAL (MOONGA) — MARS (OPTIONAL Mahadasha boost!)',
      ['Ring finger, Tuesday. ✅ BUDGET ALT: RED MAULI 7-knot you already wear = 50% boost! No cost!']
    ]},
    { icon: '🧘', title: '11-MINUTE DAILY USA SADHANA (Culture-Shock Anchor)', titleHi: '११ मिनट दैनिक साधना', accentColor: [6, 78, 59], body: [
      'America is fast-paced. Culture shock is real. Burnout is real. Your 11 minutes = anchor. MAKE the time.',
      ['① WAKE → Splash cold water + Om Gam Ganapataye Namah × 21 (5 min) → Aura reset + obstacle removal.',
       '② BREAKFAST → Hands over food + Gratitude: "Annapurne Sadapurne..." or "Thank you for this food" (2 min) → Anna Lakshmi food purity.',
       '③ BEDTIME → 3 deep breaths + Self forgiveness for ANY mistake + Recall 1 GOOD moment (even coffee!) (4 min) → Prevents karma buildup; rewires positivity.',
       'TOTAL = 11 MIN. EVERY. SINGLE. DAY.']
    ]},
    { icon: '🕉️', title: 'FINAL SPIRITUAL MESSAGE (Chauhan Vansh Lineage Blessing)', titleHi: 'अंतिम आध्यात्मिक संदेश', accentColor: [127, 29, 29], body: [
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
    { title: '⏰ 8AM-6PM EDT WINDOW — HOUR-BY-HOUR MUHURAT (TUESDAY 1 SEPT)', titleHi: 'घंटेवार मुहूर्त', accentColor: [120, 53, 15],
      headers: ['Time EDT', 'Vedic Period', 'Quality 0-100', 'Verdict'],
      rows: HOUR_SLOTS.map(s => [s.time, s.period, `${s.quality}/100`, s.verdict]) },
    { title: '📈 1-MONTH FORECAST (1 Sep → 30 Sep 2026)', titleHi: '१ महिना भविष्यवाणी', accentColor: [30, 64, 175],
      headers: ['Week', 'Energy', 'Expected Events', '⚠️ CAUTION', '💡 ACTION TIP'],
      rows: WEEKLY_FORECAST.map(w => [w.week, w.energy, w.events, w.caution, w.tip]) },
    { title: '🔴 5 NON-NEGOTIABLE LIFE RULES (1st Month & Beyond USA)', titleHi: '५ नियम', accentColor: [153, 27, 27],
      headers: ['#', 'Rule', 'Why it Matters'],
      rows: FIVE_RULES.map(r => [r.n.toString(), r.rule, r.why]) },
    { title: '✅ PRINT & CARRY — JOINING DAY 15-POINT CHECKLIST', titleHi: 'चेकलिस्ट', accentColor: [22, 101, 52],
      headers: ['#', 'Item / Ritual'],
      rows: CHECKLIST_ITEMS.map((item, i) => [(i+1).toString(), item]) },
  ],
  };
}

export default function PriyanshMuhuratPage() {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('hourly');

  const totalScore = useMemo(() => 93, []);
  const tuesdayClass = VARA_COLORS['Tuesday'];

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { generateVedicGaneshPDF } = await import('@/services/vedicGaneshPDFGenerator');
      generateVedicGaneshPDF(buildPDFConfig());
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF download failed. Check console for details.');
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Priyansh Singh Chauhan • Job Joining Muhurat Miami | Vedic Rajkumar"
        description="Vedic muhurat analysis for Priyansh Singh Chauhan new job joining at Miami USA, Tuesday 1 September 2026 8AM-6PM EDT, with spiritual guidance, remedies, and Ganesha motif A4 PDF report."
        keywords="priyansh singh chauhan, job joining muhurat, miami usa, 1 september 2026, tuesday, abhijit muhurat, vedic astrology, ganesha motif pdf"
        canonical="/priyansh-joining-muhurat"
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 print:px-0 print:py-0">
        {/* Hero Header */}
        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-orange-950/20 to-red-950/20 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <Badge className={`mb-3 rounded-lg border font-semibold ${tuesdayClass}`}>
                <CalendarCheck className="mr-2 h-3.5 w-3.5" />
                Tuesday · Mangalvaar · Mars Lord 🔥
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                🌟 Priyansh Singh Chauhan
              </h1>
              <h2 className="mt-1 text-xl font-bold text-amber-200 sm:text-2xl">
                New Job Joining Muhurat Report
              </h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Miami, Florida, USA
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-amber-400" />
                  Tuesday, 1 September 2026
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-400" />
                  8:00 AM — 6:00 PM EDT
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>DOB: 26 Oct 2000 · 00:50 AM IST · Indore MP India</span>
                <span>Mahadasha: <span className="text-red-400 font-semibold">MARS 2020–2027 🔥</span></span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={totalScore} size={96} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Overall Auspiciousness</p>
                <p className="text-[11px] text-slate-400">Tuesday + Mars Mahadasha + Abhijit = Quadruple Blessing</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold shadow-lg shadow-amber-500/20"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Generating PDF…' : '⬇️ Download Ganesha Motif A4 Report (PDF)'}
            </Button>
            <Button onClick={handlePrint} variant="outline" className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
              <Printer className="mr-2 h-4 w-4" />
              🖨️ Print A4 Motif Page
            </Button>
            <Badge className="ml-auto self-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <Award className="mr-1.5 h-3 w-3" /> Reusable Motif Border + Ganesh Header • A4 Standard
            </Badge>
          </div>

          {/* Recommendation */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">⭐ #1 Prime Slot</p>
              <p className="mt-1 text-lg font-extrabold text-white">12:48 PM — 1:45 PM EDT</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">🌟🌟 ABHIJIT MUHURAT CORE • Quality 95/100 • Destroys all Doshas</p>
            </div>
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">⭐⭐⭐⭐ #2 Secondary</p>
              <p className="mt-1 text-lg font-extrabold text-white">3:15 PM — 4:30 PM EDT</p>
              <p className="text-[11px] text-teal-300/80 mt-0.5">Pure Clear Zone • Free of all Doshas • 88/100</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-300">🚫 ABSOLUTELY AVOID</p>
              <p className="mt-1 text-lg font-extrabold text-white">4:40 PM — 6:00 PM EDT</p>
              <p className="text-[11px] text-red-300/80 mt-0.5">🔴 RAHU KAAL on TUESDAY • 0/100 • Non-negotiable avoidance</p>
            </div>
          </div>
        </div>

        {/* Tabbed Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1 bg-white/[0.03] border border-white/10 rounded-xl">
            <TabsTrigger value="hourly" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">⏰ Hourly</TabsTrigger>
            <TabsTrigger value="panchang" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">📅 Panchang</TabsTrigger>
            <TabsTrigger value="rituals" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">🧘 Rituals</TabsTrigger>
            <TabsTrigger value="remedies" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">🧿 Remedies</TabsTrigger>
            <TabsTrigger value="gemstones" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">💎 Gemstones</TabsTrigger>
            <TabsTrigger value="forecast" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">📈 Forecast</TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 py-2">✅ Checklist</TabsTrigger>
          </TabsList>

          {/* Hourly */}
          {activeTab === 'hourly' && (
          <TabsContent value="hourly">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">⏰ 8AM–6PM EDT — Hour-by-Hour Muhurat Breakdown (Tuesday 1 Sep 2026)</CardTitle>
                <CardDescription className="text-slate-400">Vedic period rating with quality score 0–100. <span className="text-red-400">Rahu Kaal 4:40–6:00 PM</span> = mandatory avoidance.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {HOUR_SLOTS.map((slot, i) => {
                  const gc = GRADE_CONFIG[slot.grade] ?? GRADE_CONFIG['C'];
                  const isPrime = slot.quality >= 95;
                  const isAvoid = slot.grade === 'Avoid';
                  return (
                    <div key={i} className={`rounded-xl border p-4 transition-all ${isPrime ? 'border-emerald-500/40 bg-emerald-950/20 ring-2 ring-emerald-500/20' : isAvoid ? 'border-red-500/30 bg-red-950/15' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                      <div className="flex flex-wrap items-center gap-4">
                        <ScoreRing score={slot.quality} size={64} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-base font-bold text-white">{slot.time}</span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${gc.bg} ${gc.text} ${gc.border}`}>
                              {slot.grade} · {gc.label}
                            </span>
                            {isPrime && <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold">🏆 Prime Best</span>}
                            {isAvoid && <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold">🚫 Rahu Kaal</span>}
                          </div>
                          <p className="text-sm text-slate-300">{slot.period}</p>
                          <p className={`text-sm font-semibold mt-1 ${isPrime ? 'text-emerald-300' : isAvoid ? 'text-red-300' : 'text-slate-200'}`}>{slot.verdict}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Panchang */}
          {activeTab === 'panchang' && (
          <TabsContent value="panchang">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">📅 1 September 2026 — Panchang (5-Limbs) Analysis — Miami</CardTitle>
                <CardDescription className="text-slate-400">Tuesday = Mangalvaar = Mars Lord = Mahadasha Lord day. Double Mars energy 🔥🔥.</CardDescription></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { l: 'Var (Day)', v: 'Tuesday (Mangalvaar)', s: 'HIGHLY AUSPICIOUS', c: 'text-red-300', e: '🔥 Mars Lord + Hanuman' },
                    { l: 'Tithi', v: 'Shukla Paksha Chaturthi/Panchami', s: 'FAVORABLE', c: 'text-emerald-300', e: 'Contracts & new starts' },
                    { l: 'Nakshatra', v: 'Uttara Ashadha/Shravana/U.Bhadrapada', s: 'BEST Career', c: 'text-emerald-300', e: '✅ Foreign settlement pattern' },
                    { l: 'Yoga', v: 'Siddha / Shubha / Shiva class', s: 'HIGHLY AUSPICIOUS', c: 'text-emerald-300', e: 'Siddha Yoga = EVERYTHING succeeds' },
                    { l: 'Karana', v: 'Bava / Balava / Kaulava', s: 'Positive', c: 'text-teal-300', e: 'New beginnings blessed' },
                    { l: 'Sunrise / Sunset', v: '7:00 AM / 7:52 PM EDT', s: 'Day ~12h52m', c: 'text-amber-300', e: 'Abhijit ~12:48–13:51' },
                  ].map((p, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{p.l}</p>
                      <p className="text-white font-bold mt-1">{p.v}</p>
                      <p className={`text-sm font-semibold mt-0.5 ${p.c}`}>✅ {p.s}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.e}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-950/15 p-5">
                  <h3 className="font-bold text-blue-200 flex items-center gap-2"><span>🪐</span> Birth Chart & Career Foreign Destiny Indicators</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-300 leading-relaxed">
                    <p>🔥 <span className="text-red-300 font-semibold">MAHADASHA:</span> MARS (Sept 2020 – Sept 2027) — PEAK at age 25. USA move = karmic destiny.</p>
                    <p>⚡ <span className="text-amber-300 font-semibold">ANTARDASHA:</span> Mars-Rahu → Mars-Jupiter transition = Sudden positive life events (this job!).</p>
                    <p>🏢 <span className="text-emerald-300 font-semibold">10th HOUSE (KARMA):</span> Strong placement → Foreign career explicitly indicated.</p>
                    <p>✈️ <span className="text-teal-300 font-semibold">12th HOUSE:</span> ACTIVATED ✅ → Foreign settlement. Miami = E/SE from Indore = AUSPICIOUS direction.</p>
                    <p>🧭 <span className="text-violet-300 font-semibold">NAKSHATRA FAMILY:</span> Jyeshtha/Anuradha (Scorpio cluster) → CLASSIC FOREIGN SUCCESS pattern.</p>
                    <p>🌟 <span className="text-emerald-300 font-semibold">TRANSIT MERCURY = OWN SIGN (VIRGO):</span> Intellect, Business & Communication TRIPLY AMPLIFIED ✅✅✅</p>
                    <p>🪴 <span className="text-amber-300 font-semibold">TRANSIT JUPITER in TAURUS:</span> Blessings & expansion. Saturn stable → career structure FIRM.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Rituals */}
          {activeTab === 'rituals' && (
          <TabsContent value="rituals">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">🧘 Joining Day Rituals — Tuesday 1 Sep 2026 (Miami EDT)</CardTitle>
                <CardDescription className="text-slate-400">Spiritual timetable from Brahma Muhurat through Abhijit prime joining.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { t: '5:00 – 5:45 AM', h: '🌅 BRAHMA MUHURAT (Most powerful 96 min)', c: 'from-amber-950/30', items: [
                    'Bath with Ganga water drops in bucket (CRITICAL USA aura purification)',
                    'Wear NEW clothes: 🔴 RED / SAFFRON / MAROON / CORAL (Tuesday Mars colors!) or White + red scarf',
                    '20 min SILENT MEDITATION — visualize walking into office with SMILE & confidence',
                    'Maha Mrityunjaya Mantra × 11 rounds (protection) + HANUMAN CHALISA × 1 (TUESDAY MANDATORY!)',
                  ]},
                  { t: '5:45 – 6:30 AM', h: '🕉️ GANESH + HANUMAN + GURU VANDANA', c: 'from-red-950/25', items: [
                    'Light 1 GHEE DIYA + 2 SANDALWOOD incense. Offer MODAK/Ladoo + bananas + Indian sweet to Ganesha',
                    'OFFER JAGGERY + CHANA (gram) to HANUMAN (TUESDAY MANDATORY!) with Sindoor tilak',
                    'Ganesh Atharvashirsha × 1 OR Vakratunda Mahakaya × 7',
                    'Prayer: "Ganpati ji — remove all obstacles from my USA journey. Hanuman Ji — courage for my TRUTH."',
                  ]},
                  { t: '6:30 – 7:00 AM', h: '🪐 NAVAGRAHA SHANTI (9 Planet Peace Offering)', c: 'from-yellow-950/25', items: [
                    'SUN: Copper vessel Arghya + red flower + roli to East rising sun',
                    'MARS (Tuesday Lord!): Red flower + sindoor tilak on forehead + 1 piece jaggery',
                    'MERCURY (Career!): Eat GREEN MOONG DAL SPROUTS — MUST for software/office boost!',
                    'JUPITER: Yellow flowers/dal. Navagraha Mantra × 3 rounds.',
                  ]},
                  { t: '7:00 – 7:45 AM', h: '🍲 BREAKFAST & DRESSING (TUESDAY COLOR PROTOCOL!)', c: 'from-green-950/20', items: [
                    '✅ EAT BEFORE LEAVING. Poha, Upma, Idli, Dalia, Fruits, Milk+Haldi, GREEN MOONG SPROUTS',
                    '❌ AVOID: Meat, eggs, onion, garlic, heavy/oily food, alcohol, black coffee empty stomach',
                    '👔 BEST OUTFIT: 🔴 RED / SAFFRON / MAROON / CORAL • GOOD: EMERALD GREEN / White+red • OK: Yellow/Cream',
                    '❌ NEVER WEAR: All Black, Dark Grey, Dark Navy (Saturn clashes Mars day). Wear NEW if possible!',
                  ]},
                  { t: '8:00 AM', h: '🚶 DEPARTURE (RIGHT FOOT FIRST — 100% MANDATORY!)', c: 'from-blue-950/20', items: [
                    'Exit bedroom + Exit house: RIGHT FOOT FIRST ALWAYS',
                    'Before entering car: Touch ×4 corners clockwise + Prayer "Om Vayave Swaha" (travel safety)',
                    'LEFT pocket (heart side): Ganesha photo/small idol',
                    'RIGHT pocket: Hanuman photo + Sindoor tiny container + 1 steel coin + 1 puffed rice (muri) + RED handkerchief (Mars color!) + sanitizer',
                  ]},
                  { t: '12:15 PM', h: '🏢 OFFICE RITUALS (15 min before Abhijit!)', c: 'from-violet-950/20', items: [
                    'Right foot first out of car. Building entrance: 3 SLOW deep breaths + silent OM',
                    'Threshold touch: Right hand lightly on entrance floor before crossing. Slight forehead bow.',
                    'Before sitting: Stand 10 sec facing chair → namaste prayer for success & learning',
                    'Sprinkle 2-3 water drops CLOCKWISE around chair base. Sit EAST or SOUTH if possible.',
                  ]},
                  { t: '🏆 12:48 PM – 1:45 PM', h: '🌟🌟 PRIME JOINING (ABHIJIT MUHURAT — TUESDAY + MARS MAHADASHA!)', c: 'from-emerald-950/30', items: [
                    'Spine STRAIGHT but relaxed. Slouch blocks Lakshmi! GENUINE smile (Venus activates good relations).',
                    'Handshake: FIRM but WARM — 2-3 pumps, EYE contact, NEVER limp/crushing.',
                    'While SIGNING papers: Mentally "Ganeshaya Namah × 5 + Shri Hanumate Namah × 3" (silently)',
                    'Accept offer letter / ID badge: WITH BOTH HANDS (respect!). Accept drink → 1 SIP minimum before down.',
                    'Introductions: SINCERE 1-line compliment: "I am excited to learn from your experienced team!"',
                  ]},
                  { t: '3:00 PM+', h: '✨ POST-JOINING RITUALS', c: 'from-amber-950/20', items: [
                    'First lunch: Eat with GRATITUDE, not rushed. If prasadam from home — EAT FIRST.',
                    'WITHIN 3 DAYS: Donate $5–$11 to charity / homeless person (Saturn Shanti)',
                    '📞 CALL PARENTS AFTER JOINING! Share excitement. 5 min = more powerful than any gemstone. Father=Sun=Career. Mother=Moon=Mental peace.',
                  ]},
                ].map((block, i) => (
                  <div key={i} className={`rounded-xl border border-white/10 bg-gradient-to-r ${block.c} to-transparent p-5`}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">{block.t}</p>
                        <h3 className="text-lg font-bold text-white mt-0.5">{block.h}</h3>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {block.items.map((it, j) => (
                        <li key={j} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Remedies */}
          {activeTab === 'remedies' && (
          <TabsContent value="remedies">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">🧿 1st Month Protection Remedies + Lifelong USA Aura Shield</CardTitle>
                <CardDescription className="text-slate-400">Six-layer protection for 90-day probation + foreign culture resilience.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: '🪢', title: 'RED MAULI (Kalava) 7 KNOTS — Right Wrist', body: 'Hanuman Kavach. Tuesday joining + 7 knots = DOUBLE MARS-HANUMAN PROTECTION 🔥. ALWAYS wear first 90 days.' },
                  { icon: '🕉️', title: 'VIBHUTI / TRIPUND BHASM — Forehead Daily', body: '3 HORIZONTAL lines EVERYDAY before leaving. Shiva armor against negative energy, evil eye, office politics.' },
                  { icon: '🪙', title: 'SILVER PIECE in Wallet Always', body: 'Small silver coin/ring in wallet 100% time. Moon blessing: mental peace in foreign land + stable money flow.' },
                  { icon: '🗓️', title: '11-DAY PURGE — Office Energy Quarantine', body: 'Do NOT bring ANY office item (not even pen/mint/sticker!) home for 11 days. Wipe laptop/bag with sanitizer BEFORE home threshold. Why? Prevents negative office aura from contaminating sacred home space.' },
                  { icon: '🔱', title: '40-DAY SHIVA OBLIGATION — NON-NEGOTIABLE!', body: 'Visit ANY Shiva temple in Miami WITHIN 40 DAYS of joining. MINIMUM: Jalabhishek (pour water on Shivling). If no temple: Monday 11 Rudra mantra + milk poured on Shiva photo. 40 days = karmic completion.' },
                  { icon: '😟', title: 'WORKPLACE EMERGENCY — 21-sec Aura Reset', body: 'For sudden anxiety / negativity / brain-fog: ① Hold breath 8 sec → slow exhale (instant cleanse) ② Touch 3rd eye 2 sec ③ 2 slow deep breaths ④ Mentally Om Namah Shivaya × 3 + Om Shri Hanumate Namah × 1' },
                ].map((r, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl leading-none flex-shrink-0">{r.icon}</div>
                      <div>
                        <h3 className="text-white font-bold mb-1">{r.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{r.body}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-5">
                  <h3 className="font-bold text-emerald-200 mb-3 flex items-center gap-2"><span>🧘</span> 11-Minute Daily USA Sadhana (Culture-Shock Anchor)</h3>
                  <p className="text-sm text-slate-300 mb-3"><em>America is fast-paced. Culture shock is real. Burnout is real. Your 11 minutes = anchor. DO NOT let anyone convince you "you don\'t have 11 minutes." You do. MAKE the time.</em></p>
                  <div className="space-y-2 text-sm">
                    {[
                      ['① WAKE (5 min)', 'Splash cold water on face. Om Gam Ganapataye Namah × 21 → Aura reset + Ganesh clears obstacles for the day.'],
                      ['② BREAKFAST (2 min)', 'Hands over food + Gratitude prayer: "Annapurne Sadapurne Shaktaye..." or simple "Thank you Universe for this food." → Anna Lakshmi = food goddess. Gratitude keeps food karma pure.'],
                      ['③ BEDTIME (4 min)', '3 deep breaths. Self forgiveness for ANY mistake (no guilt — only learning!). Recall 1 GOOD moment (even "the coffee was good"). → Self-forgiveness prevents karma buildup. Positive memory rewires brain for USA positivity.'],
                    ].map(([s, b], i) => (
                      <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
                        <p className="text-emerald-300 font-bold text-xs uppercase tracking-wider">{s}</p>
                        <p className="text-slate-300 text-sm mt-0.5">{b}</p>
                      </div>
                    ))}
                    <p className="text-center text-amber-300 font-bold text-sm mt-2">TOTAL = 11 MINUTES. EVERY. SINGLE. DAY.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Gemstones */}
          {activeTab === 'gemstones' && (
          <TabsContent value="gemstones">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">💎 Gemstone Guidance — Career Boost + Wellbeing (USA Budget Alternatives)</CardTitle>
                <CardDescription className="text-slate-400">Personalized stones matching planetary chart + USA-accessible budget crystal alternatives.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { rank: '#1', color: 'text-emerald-300', name: 'EMERALD (PANNA) — MERCURY PLANET', purpose: 'Intellect, Communication, Coworkers, Documentation, Software Career ✅ THE most important planet for software/office/corporate.',
                    weight: '3.25 — 4.50 Ratti (2.9–4.1 ct). QUALITY > WEIGHT ALWAYS.', metal: 'Gold ring (BEST). Silver = affordable (~90% same efficacy). Finger: LITTLE finger → RIGHT hand.', wear: 'WEDNESDAY morning, 60-90 min after sunrise. Soak overnight in milk + Ganga water; wash; wear before sunrise facing East.',
                    alt: '🔥 USA BUDGET ALTERNATIVE: GREEN PERIDOT bracelet ($15–$25 at any crystal shop). 90% same Mercury results. DAILY WEAR.',
                    bg: 'from-emerald-950/25' },
                  { rank: '#2', color: 'text-slate-200', name: 'PEARL (MOTI) — MOON PLANET', purpose: 'Mental peace & culture-shock resilience in FAR AWAY foreign land. Mother blessings. Stabilizes emotions during homesickness.',
                    weight: '5–7 ratti standard.', metal: 'Silver ring or pendant. Day: MONDAY. Finger: Little or Ring finger.', wear: 'Monday morning, after sunrise, after milk/Ganga water soak.',
                    alt: '✅ BUDGET ALT: Mother\'s used silver ring / any hand-me-down silver jewelry = same or stronger mother blessing!',
                    bg: 'from-slate-900/50' },
                  { rank: '#3', color: 'text-red-300', name: 'RED CORAL (MOONGA) — MARS (OPTIONAL Mahadasha boost!)', purpose: 'Extra Mars Mahadasha support during this peak 7-year ACTION period. Courage, energy, manifestation boost.',
                    weight: '3–6 ratti. Quality is critical — ensure no cracks/blemishes.', metal: 'Gold or Silver. Finger: RING finger → RIGHT hand. Day: TUESDAY morning.', wear: 'Tuesday morning. Dip in milk/Ganga water overnight. Wear with sindoor tilak on forehead.',
                    alt: '✅✅ BUDGET ALTERNATIVE (ZERO COST!): The RED MAULI 7-knot thread you are ALREADY wearing on your RIGHT wrist = 50% of the same Mars boost. You don\'t need extra!',
                    bg: 'from-red-950/25' },
                ].map((g, i) => (
                  <div key={i} className={`rounded-xl border border-white/10 bg-gradient-to-r ${g.bg} to-transparent p-5`}>
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                      <span className={`text-2xl font-black ${g.color}`}>{g.rank}</span>
                      <div>
                        <h3 className={`text-lg font-bold ${g.color}`}>{g.name}</h3>
                        <p className="text-sm text-slate-300 mt-0.5">{g.purpose}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-400">Specifications</p>
                        <p className="text-white mt-1">{g.weight}</p>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                        <p className="text-xs font-semibold uppercase text-slate-400">Metal / Finger</p>
                        <p className="text-white mt-1">{g.metal}</p>
                      </div>
                      <div className="rounded-lg border border-white/5 bg-black/20 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold uppercase text-slate-400">Wearing Protocol</p>
                        <p className="text-white mt-1">{g.wear}</p>
                      </div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-950/15 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold uppercase text-amber-300">💡 Budget Accessible Alternative (USA market!)</p>
                        <p className="text-amber-100 mt-1 text-sm">{g.alt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Forecast */}
          {activeTab === 'forecast' && (
          <TabsContent value="forecast">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">📈 1-Month Forecast — 1 Sep → 30 Sep 2026 (5 Weeks)</CardTitle>
                <CardDescription className="text-slate-400">Mars Mahadasha energy week-by-week with cautions & action tips.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {WEEKLY_FORECAST.map((w, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white">{w.week}</h3>
                      <span className="text-sm font-semibold text-amber-300">{w.energy}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Expected Events</p>
                        <p className="text-slate-200 mt-1">{w.events}</p>
                      </div>
                      <div className="rounded-lg bg-red-950/15 border border-red-500/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold">⚠️ CAUTION</p>
                        <p className="text-red-200/80 mt-1">{w.caution}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-950/15 border border-emerald-500/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">💡 ACTION TIP</p>
                        <p className="text-emerald-200/80 mt-1">{w.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-950/15 p-5">
                  <h3 className="font-bold text-red-200 mb-3">🔴 5 NON-NEGOTIABLE LIFE RULES — 1st Month & Forever USA</h3>
                  <div className="space-y-2.5">
                    {FIVE_RULES.map(r => (
                      <div key={r.n} className="rounded-lg border border-white/5 bg-black/20 p-3.5">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-black text-sm">{r.n}</span>
                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm">{r.rule}</p>
                            <p className="text-slate-300 text-sm mt-0.5 leading-relaxed">{r.why}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-orange-950/20 p-6">
                  <h3 className="font-extrabold text-amber-200 text-lg mb-3">🕉️ Final Spiritual Message — Chauhan Vansh Lineage Blessing</h3>
                  <div className="space-y-2.5 text-slate-200 text-sm leading-relaxed">
                    <p><em>Beloved Priyansh Beta,</em></p>
                    <p>You are in <span className="text-red-300 font-bold">MARS MAHADASHA</span> — 7-year cycle of ACTION, COURAGE, and MANIFESTATION.</p>
                    <p>Miami is not an accident. It is a karmically prepared destination, cultivated over MANY lifetimes, for your NEXT evolution. The gods have been arranging this for a very long time.</p>
                    <p>You carry the bloodline and blessings of the <span className="text-amber-300 font-bold">CHAUHAN VANSH</span> — the lineage of warriors, leaders, and defenders of Dharma. When Prithviraj Chauhan rode into battle, he did not carry fear. Carry that same light into every American office:</p>
                    <ul className="ml-5 space-y-1 list-disc text-amber-100/90">
                      <li>Speak <b>TRUTH</b> even if it makes you unpopular</li>
                      <li>Work with <b>INTEGRITY</b> even when the camera is off</li>
                      <li><b>RESPECT</b> every human being you meet — from the janitor to the CEO</li>
                      <li>Never forget where you came from. Indore raised you. America will give you the platform.</li>
                    </ul>
                    <p>Every past "No" from the Universe was not a rejection — it was <b className="text-emerald-300">protection</b>. Saving you for THIS exact "Yes." This exact city. This exact Tuesday in Abhijit Muhurat.</p>
                    <p>This USA chapter is not just about a job. It is becoming the man your 10-year-old self watched in wonder. It is making parents proud beyond words. It is opening doors for your sister, future children, extended family back home. <em>This job is a launching pad — not the destination.</em></p>
                    <p>You are not alone in that Miami building on Tuesday Sep 1, 2026:</p>
                    <ul className="ml-5 space-y-1 list-disc text-amber-100/90">
                      <li>Your <b>Ancestors</b> walk with you.</li>
                      <li>Lord <b>Ganesha</b> clears every obstacle before you even see it.</li>
                      <li>Lord <b>Hanuman</b> carries your courage when yours runs out.</li>
                      <li>Lord <b>Shiva</b> stands behind you — always.</li>
                      <li>Maa <b>Lakshmi</b> rests in your sincere work ethic.</li>
                      <li>Maa <b>Saraswati</b> speaks through your words and your code commits.</li>
                    </ul>
                    <p>The only person who can fail you on September 1 — is <b>YOURSELF</b> if you forget to show up with love, respect, and humility. Everything else is already taken care of by the Divine Plan.</p>
                    <p className="text-center font-bold text-amber-200 mt-3 text-base tracking-wide">
                      🕉️ Ganpati Bappa Morya! 🙏 &nbsp;|&nbsp; Jai Shri Ram! 🚩 &nbsp;|&nbsp; Har Har Mahadev! 🔱 &nbsp;|&nbsp; Bajrang Bali Ki Jai! 💨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Checklist */}
          {activeTab === 'checklist' && (
          <TabsContent value="checklist">
            <Card className="border-white/10 bg-[#0d131e]">
              <CardHeader><CardTitle className="text-xl text-white">✅ Print & Carry — 15-Point Joining Day Checklist (Tuesday 1 Sep 2026)</CardTitle>
                <CardDescription className="text-slate-400">Tape to bathroom mirror or store in wallet. Each item checked = 1 layer of spiritual protection.</CardDescription></CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CHECKLIST_ITEMS.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-amber-500/30 hover:bg-amber-950/10 cursor-pointer transition-all">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-amber-500 rounded" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] text-slate-500 font-bold mr-2">#{i+1}</span>
                        <span className="text-sm text-slate-200 leading-snug">{item}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>

        {/* Bottom CTA Bar */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-orange-950/20 to-red-950/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-200">📄 Ready to save this report?</p>
              <p className="text-sm text-slate-400">Download the full multi-page motif-bordered A4 PDF with Lord Ganesha geometric header, Kalash/Om/Swastika/Trishul corner motifs, watermark on every page, and all sections+tables formatted for printing. This is the EXACT same report as the standalone generator script produces.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadPDF} disabled={downloading} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold shadow-lg shadow-amber-500/20">
                <Download className="mr-2 h-4 w-4" />
                {downloading ? 'Generating…' : 'Download Ganesha Motif PDF'}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-slate-600">
          * Integral part of Vedic Rajkumar Application • PriyanshMuhuratPage.tsx • Motif-bordered reusable A4 Ganesh PDF template registered as default for all muhurat/fortune outputs • Updated: {new Date().toISOString().slice(0, 10)}
        </p>
      </div>
    </div>
  );
}
