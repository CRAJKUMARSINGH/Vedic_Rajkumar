// Weeks 56-58: World Astrology - Mayan, Egyptian, Celtic, Native American
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

interface WorldSign {
  name: string; symbol: string; element?: string;
  traits: string[]; description: string; period: string;
}

// ── Mayan Astrology (Day Signs / Nawales) ─────────────────────────────────────
const MAYAN_SIGNS: WorldSign[] = [
  { name: 'Imix (Crocodile)', symbol: '🐊', element: 'Water', traits: ['Nurturing','Primal','Creative'], description: 'The primordial mother, source of all life. Protective and nurturing energy.', period: 'Day 1' },
  { name: 'Ik (Wind)', symbol: '💨', element: 'Air', traits: ['Communication','Spirit','Change'], description: 'The breath of life and divine communication. Brings change and inspiration.', period: 'Day 2' },
  { name: 'Akbal (Night)', symbol: '🌙', element: 'Earth', traits: ['Mystery','Dreams','Depth'], description: 'The house of darkness and dreams. Deep intuition and hidden knowledge.', period: 'Day 3' },
  { name: 'Kan (Seed)', symbol: '🌱', element: 'Earth', traits: ['Growth','Potential','Abundance'], description: 'The seed of potential. Represents growth, fertility, and abundance.', period: 'Day 4' },
  { name: 'Chicchan (Serpent)', symbol: '🐍', element: 'Fire', traits: ['Kundalini','Passion','Instinct'], description: 'The life force and kundalini energy. Powerful instincts and passion.', period: 'Day 5' },
  { name: 'Cimi (Death)', symbol: '💀', element: 'Water', traits: ['Transformation','Ancestors','Rebirth'], description: 'Transformation and connection to ancestors. Death leads to rebirth.', period: 'Day 6' },
  { name: 'Manik (Deer)', symbol: '🦌', element: 'Earth', traits: ['Healing','Grace','Leadership'], description: 'The healer and leader. Graceful strength and spiritual authority.', period: 'Day 7' },
  { name: 'Lamat (Star)', symbol: '⭐', element: 'Water', traits: ['Harmony','Abundance','Luck'], description: 'The morning star Venus. Brings harmony, abundance, and good fortune.', period: 'Day 8' },
  { name: 'Muluc (Moon)', symbol: '🌊', element: 'Water', traits: ['Emotion','Offering','Purification'], description: 'The water and moon energy. Emotional depth and spiritual offerings.', period: 'Day 9' },
  { name: 'Oc (Dog)', symbol: '🐕', element: 'Air', traits: ['Loyalty','Justice','Guidance'], description: 'The loyal guide and guardian. Represents justice and faithful companionship.', period: 'Day 10' },
  { name: 'Chuen (Monkey)', symbol: '🐒', element: 'Air', traits: ['Creativity','Humor','Artistry'], description: 'The divine trickster and artist. Creativity, humor, and playful wisdom.', period: 'Day 11' },
  { name: 'Eb (Road)', symbol: '🛤️', element: 'Earth', traits: ['Journey','Destiny','Service'], description: 'The road of life and destiny. Service to community and spiritual path.', period: 'Day 12' },
  { name: 'Ben (Reed)', symbol: '🎋', element: 'Fire', traits: ['Authority','Sky','Pillar'], description: 'The pillar between earth and sky. Authority, leadership, and cosmic connection.', period: 'Day 13' },
  { name: 'Ix (Jaguar)', symbol: '🐆', element: 'Earth', traits: ['Shamanism','Magic','Earth'], description: 'The earth shaman and jaguar spirit. Magical powers and earth wisdom.', period: 'Day 14' },
  { name: 'Men (Eagle)', symbol: '🦅', element: 'Air', traits: ['Vision','Freedom','Higher Mind'], description: 'The eagle of higher vision. Freedom, clarity, and cosmic perspective.', period: 'Day 15' },
  { name: 'Cib (Owl)', symbol: '🦉', element: 'Earth', traits: ['Wisdom','Forgiveness','Karma'], description: 'The owl of ancient wisdom. Forgiveness, karma, and ancestral knowledge.', period: 'Day 16' },
  { name: 'Caban (Earth)', symbol: '🌍', element: 'Earth', traits: ['Intelligence','Synchronicity','Movement'], description: 'The earth force and synchronicity. Intelligence and cosmic movement.', period: 'Day 17' },
  { name: 'Etznab (Mirror)', symbol: '🪞', element: 'Air', traits: ['Truth','Clarity','Reflection'], description: 'The obsidian mirror of truth. Clarity, reflection, and cutting through illusion.', period: 'Day 18' },
  { name: 'Cauac (Storm)', symbol: '⛈️', element: 'Water', traits: ['Transformation','Purification','Thunder'], description: 'The thunderstorm of transformation. Purification and catalytic change.', period: 'Day 19' },
  { name: 'Ahau (Sun)', symbol: '☀️', element: 'Fire', traits: ['Enlightenment','Love','Completion'], description: 'The solar lord and enlightenment. Love, completion, and divine consciousness.', period: 'Day 20' },
];

// ── Egyptian Astrology (Decans) ───────────────────────────────────────────────
const EGYPTIAN_SIGNS: WorldSign[] = [
  { name: 'The Nile', symbol: '🌊', traits: ['Adaptable','Calm','Determined'], description: 'Born Jan 1-7 & Jun 19-28. Calm and adaptable, seeks peace and harmony.', period: 'Jan 1-7, Jun 19-28' },
  { name: 'Amun-Ra', symbol: '☀️', traits: ['Optimistic','Leader','Confident'], description: 'Born Jan 8-21 & Feb 1-11. Natural leader with solar confidence and optimism.', period: 'Jan 8-21, Feb 1-11' },
  { name: 'Mut', symbol: '🦅', traits: ['Practical','Logical','Orderly'], description: 'Born Jan 22-31 & Sep 8-22. Practical and logical, values order and tradition.', period: 'Jan 22-31, Sep 8-22' },
  { name: 'Geb', symbol: '🌍', traits: ['Sensitive','Intuitive','Emotional'], description: 'Born Feb 12-29 & Aug 20-Sep 7. Deeply sensitive with strong intuition.', period: 'Feb 12-29, Aug 20-Sep 7' },
  { name: 'Osiris', symbol: '⚖️', traits: ['Dual nature','Energetic','Decisive'], description: 'Born Mar 1-10 & Nov 27-Dec 18. Dual nature, energetic and decisive.', period: 'Mar 1-10, Nov 27-Dec 18' },
  { name: 'Isis', symbol: '🌙', traits: ['Romantic','Protective','Magical'], description: 'Born Mar 11-31 & Oct 18-29 & Dec 19-31. Romantic and protective with magical gifts.', period: 'Mar 11-31, Oct 18-29' },
  { name: 'Thoth', symbol: '📜', traits: ['Intellectual','Wise','Communicative'], description: 'Born Apr 1-19 & Nov 8-17. Intellectual and wise, gifted in communication.', period: 'Apr 1-19, Nov 8-17' },
  { name: 'Horus', symbol: '👁️', traits: ['Courageous','Optimistic','Motivated'], description: 'Born Apr 20-May 7 & Aug 12-19. Courageous and motivated, sees the big picture.', period: 'Apr 20-May 7, Aug 12-19' },
  { name: 'Anubis', symbol: '🐺', traits: ['Intuitive','Sensitive','Protective'], description: 'Born May 8-27 & Jun 29-Jul 13. Highly intuitive and protective of loved ones.', period: 'May 8-27, Jun 29-Jul 13' },
  { name: 'Seth', symbol: '⚡', traits: ['Ambitious','Perfectionist','Powerful'], description: 'Born May 28-Jun 18 & Sep 28-Oct 2. Ambitious perfectionist with great power.', period: 'May 28-Jun 18, Sep 28-Oct 2' },
  { name: 'Bastet', symbol: '🐱', traits: ['Intuitive','Secretive','Sensitive'], description: 'Born Jul 14-28 & Sep 23-27 & Oct 3-17. Intuitive and secretive with feline grace.', period: 'Jul 14-28, Sep 23-27' },
  { name: 'Sekhmet', symbol: '🦁', traits: ['Perfectionist','Practical','Disciplined'], description: 'Born Jul 29-Aug 11 & Oct 30-Nov 7. Perfectionist and disciplined with fierce energy.', period: 'Jul 29-Aug 11, Oct 30-Nov 7' },
];

// ── Celtic Astrology (Tree Signs) ─────────────────────────────────────────────
const CELTIC_SIGNS: WorldSign[] = [
  { name: 'Birch (The Achiever)', symbol: '🌿', element: 'Air', traits: ['Driven','Ambitious','Tolerant'], description: 'Dec 24-Jan 20. Highly driven and ambitious. Natural leaders who inspire others.', period: 'Dec 24 - Jan 20' },
  { name: 'Rowan (The Thinker)', symbol: '🍃', element: 'Air', traits: ['Visionary','Philosophical','Cool'], description: 'Jan 21-Feb 17. Visionary thinkers with philosophical minds and cool demeanor.', period: 'Jan 21 - Feb 17' },
  { name: 'Ash (The Enchanter)', symbol: '🌳', element: 'Water', traits: ['Artistic','Imaginative','Intuitive'], description: 'Feb 18-Mar 17. Artistic and imaginative, deeply connected to nature and intuition.', period: 'Feb 18 - Mar 17' },
  { name: 'Alder (The Trailblazer)', symbol: '🌲', element: 'Fire', traits: ['Confident','Focused','Charming'], description: 'Mar 18-Apr 14. Confident trailblazers who forge their own path with charm.', period: 'Mar 18 - Apr 14' },
  { name: 'Willow (The Observer)', symbol: '🌾', element: 'Water', traits: ['Intelligent','Realistic','Intuitive'], description: 'Apr 15-May 12. Intelligent observers with realistic outlook and strong intuition.', period: 'Apr 15 - May 12' },
  { name: 'Hawthorn (The Illusionist)', symbol: '🌸', element: 'Fire', traits: ['Creative','Multi-talented','Curious'], description: 'May 13-Jun 9. Creative illusionists with multiple talents and insatiable curiosity.', period: 'May 13 - Jun 9' },
  { name: 'Oak (The Stabilizer)', symbol: '🌰', element: 'Earth', traits: ['Nurturing','Protective','Optimistic'], description: 'Jun 10-Jul 7. Nurturing protectors with optimistic outlook and great strength.', period: 'Jun 10 - Jul 7' },
  { name: 'Holly (The Ruler)', symbol: '🍀', element: 'Fire', traits: ['Noble','Competitive','Confident'], description: 'Jul 8-Aug 4. Noble rulers with competitive spirit and natural confidence.', period: 'Jul 8 - Aug 4' },
  { name: 'Hazel (The Knower)', symbol: '🌿', element: 'Air', traits: ['Analytical','Organized','Efficient'], description: 'Aug 5-Sep 1. Analytical knowers who are organized, efficient, and detail-oriented.', period: 'Aug 5 - Sep 1' },
  { name: 'Vine (The Equalizer)', symbol: '🍇', element: 'Water', traits: ['Indulgent','Empathetic','Refined'], description: 'Sep 2-Sep 29. Refined equalizers with empathy and appreciation for beauty.', period: 'Sep 2 - Sep 29' },
  { name: 'Ivy (The Survivor)', symbol: '🌿', element: 'Water', traits: ['Compassionate','Loyal','Giving'], description: 'Sep 30-Oct 27. Compassionate survivors with fierce loyalty and giving nature.', period: 'Sep 30 - Oct 27' },
  { name: 'Reed (The Inquisitor)', symbol: '🎋', element: 'Water', traits: ['Complex','Secretive','Determined'], description: 'Oct 28-Nov 24. Complex inquisitors with secretive nature and iron determination.', period: 'Oct 28 - Nov 24' },
  { name: 'Elder (The Seeker)', symbol: '🌳', element: 'Earth', traits: ['Adventurous','Honest','Thoughtful'], description: 'Nov 25-Dec 23. Adventurous seekers with honest nature and thoughtful wisdom.', period: 'Nov 25 - Dec 23' },
];

function getMayanSign(date: string): WorldSign {
  const d = new Date(date);
  const start = new Date('2000-01-01');
  const diff = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return MAYAN_SIGNS[((diff % 20) + 20) % 20];
}

function getEgyptianSign(date: string): WorldSign {
  const d = new Date(date);
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m===1&&day<=7)||(m===6&&day>=19&&day<=28)) return EGYPTIAN_SIGNS[0];
  if ((m===1&&day>=8&&day<=21)||(m===2&&day>=1&&day<=11)) return EGYPTIAN_SIGNS[1];
  if ((m===1&&day>=22&&day<=31)||(m===9&&day>=8&&day<=22)) return EGYPTIAN_SIGNS[2];
  if ((m===2&&day>=12)||(m===8&&day>=20)||(m===9&&day<=7)) return EGYPTIAN_SIGNS[3];
  if ((m===3&&day<=10)||(m===11&&day>=27)||(m===12&&day>=18)) return EGYPTIAN_SIGNS[4];
  if ((m===3&&day>=11&&day<=31)||(m===10&&day>=18&&day<=29)||(m===12&&day>=19)) return EGYPTIAN_SIGNS[5];
  if ((m===4&&day<=19)||(m===11&&day>=8&&day<=17)) return EGYPTIAN_SIGNS[6];
  if ((m===4&&day>=20)||(m===5&&day<=7)||(m===8&&day>=12&&day<=19)) return EGYPTIAN_SIGNS[7];
  if ((m===5&&day>=8&&day<=27)||(m===6&&day>=29)||(m===7&&day<=13)) return EGYPTIAN_SIGNS[8];
  if ((m===5&&day>=28)||(m===6&&day<=18)||(m===9&&day>=28&&day<=30)||(m===10&&day<=2)) return EGYPTIAN_SIGNS[9];
  if ((m===7&&day>=14&&day<=28)||(m===9&&day>=23&&day<=27)||(m===10&&day>=3&&day<=17)) return EGYPTIAN_SIGNS[10];
  return EGYPTIAN_SIGNS[11];
}

function getCelticSign(date: string): WorldSign {
  const d = new Date(date);
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m===12&&day>=24)||(m===1&&day<=20)) return CELTIC_SIGNS[0];
  if (m===1&&day>=21||m===2&&day<=17) return CELTIC_SIGNS[1];
  if (m===2&&day>=18||m===3&&day<=17) return CELTIC_SIGNS[2];
  if (m===3&&day>=18||m===4&&day<=14) return CELTIC_SIGNS[3];
  if (m===4&&day>=15||m===5&&day<=12) return CELTIC_SIGNS[4];
  if (m===5&&day>=13||m===6&&day<=9) return CELTIC_SIGNS[5];
  if (m===6&&day>=10||m===7&&day<=7) return CELTIC_SIGNS[6];
  if (m===7&&day>=8||m===8&&day<=4) return CELTIC_SIGNS[7];
  if (m===8&&day>=5||m===9&&day<=1) return CELTIC_SIGNS[8];
  if (m===9&&day>=2&&day<=29) return CELTIC_SIGNS[9];
  if (m===9&&day>=30||m===10&&day<=27) return CELTIC_SIGNS[10];
  if (m===10&&day>=28||m===11&&day<=24) return CELTIC_SIGNS[11];
  return CELTIC_SIGNS[12];
}

const WorldAstrologyPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [birthDate, setBirthDate] = useState('');
  const [activeSystem, setActiveSystem] = useState<'mayan'|'egyptian'|'celtic'>('mayan');
  const isHi = lang === 'hi';

  const mayanSign = birthDate ? getMayanSign(birthDate) : null;
  const egyptianSign = birthDate ? getEgyptianSign(birthDate) : null;
  const celticSign = birthDate ? getCelticSign(birthDate) : null;

  const currentSign = activeSystem === 'mayan' ? mayanSign : activeSystem === 'egyptian' ? egyptianSign : celticSign;

  return (
    <>
      <SEO title="World Astrology - Mayan, Egyptian & Celtic" description="Discover your Mayan day sign, Egyptian zodiac, and Celtic tree sign. Explore ancient astrology systems from around the world." keywords="mayan astrology, egyptian astrology, celtic astrology, world astrology, ancient zodiac" canonical="/world-astrology" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'विश्व ज्योतिष' : 'World Astrology'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'माया • मिस्री • सेल्टिक' : 'Mayan • Egyptian • Celtic'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Date input */}
          <div className="bg-card border rounded-xl p-5">
            <label className="text-sm font-medium block mb-2">{isHi ? 'जन्म तिथि' : 'Birth Date'}</label>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background max-w-xs" />
          </div>

          {/* System tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {([
              { key: 'mayan', label: '🌽 Mayan', labelHi: '🌽 माया' },
              { key: 'egyptian', label: '🏺 Egyptian', labelHi: '🏺 मिस्री' },
              { key: 'celtic', label: '🌳 Celtic', labelHi: '🌳 सेल्टिक' },
            ] as const).map(s => (
              <button key={s.key} onClick={() => setActiveSystem(s.key)}
                className={`flex-1 py-2 text-xs rounded-md font-medium transition-colors ${activeSystem === s.key ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                {isHi ? s.labelHi : s.label}
              </button>
            ))}
          </div>

          {/* Sign result */}
          {birthDate && currentSign && (
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-6xl mb-3">{currentSign.symbol}</div>
              <h2 className="text-xl font-bold mb-1">{currentSign.name}</h2>
              <div className="text-sm text-muted-foreground mb-3">{currentSign.period}</div>
              {currentSign.element && (
                <div className="inline-block bg-muted px-3 py-1 rounded-full text-xs mb-3">Element: {currentSign.element}</div>
              )}
              <p className="text-sm text-muted-foreground mb-4">{currentSign.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {currentSign.traits.map(t => <span key={t} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{t}</span>)}
              </div>
            </div>
          )}

          {/* All signs reference */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-3 text-sm">
              {activeSystem === 'mayan' ? '20 Mayan Day Signs' : activeSystem === 'egyptian' ? '12 Egyptian Signs' : '13 Celtic Tree Signs'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(activeSystem === 'mayan' ? MAYAN_SIGNS : activeSystem === 'egyptian' ? EGYPTIAN_SIGNS : CELTIC_SIGNS).map(s => (
                <div key={s.name} className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${currentSign?.name === s.name ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <span className="text-lg">{s.symbol}</span>
                  <div>
                    <div className="font-medium leading-tight">{s.name.split('(')[0].trim()}</div>
                    <div className="text-muted-foreground">{s.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default WorldAstrologyPage;
