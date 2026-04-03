// Week 97-100: All Features Hub - Complete Platform Navigation
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

interface Feature {
  title: string;
  titleHi: string;
  description: string;
  icon: string;
  path: string;
  category: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const FEATURES: Feature[] = [
  // Core
  { title: 'Birth Chart (Kundli)', titleHi: 'à¤œà¤¨à¥à¤® à¤•à¥à¤‚à¤¡à¤²à¥€', description: 'Complete Vedic birth chart with all planets and houses', icon: 'ðŸŒŸ', path: '/', category: 'Core' },
  { title: 'Transit Analysis', titleHi: 'à¤—à¥‹à¤šà¤° à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£', description: 'Daily planetary transit effects on your chart', icon: 'ðŸ”„', path: '/', category: 'Core' },
  { title: 'Dasha System', titleHi: 'à¤¦à¤¶à¤¾ à¤ªà¥à¤°à¤£à¤¾à¤²à¥€', description: 'Vimshottari Dasha periods and predictions', icon: 'â³', path: '/dasha', category: 'Core' },
  { title: 'Nakshatra Analysis', titleHi: 'à¤¨à¤•à¥à¤·à¤¤à¥à¤° à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£', description: '27 Nakshatras with detailed characteristics', icon: 'â­', path: '/', category: 'Core' },
  { title: 'Yoga Analysis', titleHi: 'à¤¯à¥‹à¤— à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤£', description: '100+ Vedic yogas identification', icon: 'âœ¨', path: '/yogas', category: 'Core' },
  { title: 'Horoscope', titleHi: 'à¤°à¤¾à¤¶à¤¿à¤«à¤²', description: 'Daily, weekly, monthly horoscope predictions', icon: 'ðŸŒ™', path: '/horoscope', category: 'Core' },
  // Compatibility
  { title: 'Kundali Milan', titleHi: 'à¤•à¥à¤‚à¤¡à¤²à¥€ à¤®à¤¿à¤²à¤¾à¤¨', description: 'Complete 36-point marriage compatibility', icon: 'ðŸ’‘', path: '/matchmaking', category: 'Compatibility' },
  { title: 'Love Astrology', titleHi: 'à¤ªà¥à¤°à¥‡à¤® à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Relationship and romance predictions', icon: 'â¤ï¸', path: '/love-astrology', category: 'Compatibility' },
  // Advanced Systems
  { title: 'Lal Kitab', titleHi: 'à¤²à¤¾à¤² à¤•à¤¿à¤¤à¤¾à¤¬', description: 'Lal Kitab predictions and totke remedies', icon: 'ðŸ“•', path: '/lal-kitab', category: 'Advanced' },
  { title: 'KP System', titleHi: 'à¤•à¥‡à¤ªà¥€ à¤ªà¤¦à¥à¤§à¤¤à¤¿', description: 'Krishnamurti Paddhati for precise timing', icon: 'ðŸ”¬', path: '/kp-system', category: 'Advanced' },
  { title: 'Jaimini System', titleHi: 'à¤œà¥ˆà¤®à¤¿à¤¨à¥€ à¤ªà¤¦à¥à¤§à¤¤à¤¿', description: 'Jaimini astrology with Chara Dasha', icon: 'ðŸ“œ', path: '/jaimini', category: 'Advanced' },
  { title: 'Tajik System', titleHi: 'à¤¤à¤¾à¤œà¤¿à¤• à¤ªà¤¦à¥à¤§à¤¤à¤¿', description: 'Annual horoscope (Varshphal)', icon: 'ðŸ“…', path: '/tajik', category: 'Advanced' },
  { title: 'Nadi Astrology', titleHi: 'à¤¨à¤¾à¤¡à¤¼à¥€ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Ancient Nadi astrology predictions', icon: 'ðŸŒ¿', path: '/nadi-astrology', category: 'Advanced' },
  { title: 'Divisional Charts', titleHi: 'à¤µà¤¿à¤­à¤¾à¤—à¥€à¤¯ à¤šà¤¾à¤°à¥à¤Ÿ', description: 'D9, D10, D12 and more divisional charts', icon: 'ðŸ“Š', path: '/divisional-charts', category: 'Advanced' },
  { title: 'Ashtakavarga', titleHi: 'à¤…à¤·à¥à¤Ÿà¤•à¤µà¤°à¥à¤—', description: 'Ashtakavarga scoring and transit timing', icon: 'ðŸŽ¯', path: '/', category: 'Advanced' },
  { title: 'Planetary Strength', titleHi: 'à¤—à¥à¤°à¤¹ à¤¶à¤•à¥à¤¤à¤¿', description: 'Shadbala and planetary strength analysis', icon: 'ðŸ’ª', path: '/planetary-strength', category: 'Advanced' },
  // Global Systems
  { title: 'Western Astrology', titleHi: 'à¤ªà¤¾à¤¶à¥à¤šà¤¾à¤¤à¥à¤¯ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Tropical zodiac, aspects, and Western chart', icon: 'â­', path: '/western-astrology', category: 'Global', isNew: true },
  { title: 'Chinese Astrology', titleHi: 'à¤šà¥€à¤¨à¥€ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Animal signs, Five Elements, BaZi', icon: 'ðŸ‰', path: '/chinese-astrology', category: 'Global', isNew: true },
  { title: 'Horary Astrology', titleHi: 'à¤ªà¥à¤°à¤¶à¥à¤¨ à¤•à¥à¤‚à¤¡à¤²à¥€', description: 'Ask any question and get cosmic answers', icon: 'ðŸ”®', path: '/horary', category: 'Global', isNew: true },
  { title: 'World Astrology', titleHi: 'à¤µà¤¿à¤¶à¥à¤µ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Mayan, Egyptian & Celtic astrology systems', icon: 'ðŸŒ', path: '/world-astrology', category: 'Global', isNew: true },
  { title: 'Comparative Astrology', titleHi: 'à¤¤à¥à¤²à¤¨à¤¾à¤¤à¥à¤®à¤• à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Vedic vs Western side-by-side comparison', icon: 'âš–ï¸', path: '/comparative-astrology', category: 'Global', isNew: true },
  { title: 'Daily Panchang', titleHi: 'à¤ªà¤‚à¤šà¤¾à¤‚à¤—', description: 'Tithi, Nakshatra, Yoga, Karana for any date', icon: 'ðŸ“†', path: '/panchang', category: 'Tools', isNew: true },
  { title: 'Electional Astrology', titleHi: 'à¤¨à¤¿à¤°à¥à¤µà¤¾à¤šà¤¨ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Find best dates for marriage, business, travel', icon: 'ðŸ“…', path: '/electional-astrology', category: 'Tools', isNew: true },
  { title: 'Mundane Astrology', titleHi: 'à¤®à¥à¤‚à¤¡à¥‡à¤¨ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'World events, national charts, planetary cycles', icon: 'ðŸŒ', path: '/mundane-astrology', category: 'Global', isNew: true },
  { title: 'Sade Sati', titleHi: 'à¤¸à¤¾à¤¢à¤¼à¥‡ à¤¸à¤¾à¤¤à¥€', description: "Saturn's 7.5 year transit with phase analysis", icon: 'ðŸª', path: '/sade-sati', category: 'Remedies', isNew: true },
  { title: 'Ashtakavarga', titleHi: 'à¤…à¤·à¥à¤Ÿà¤•à¤µà¤°à¥à¤—', description: 'Transit strength with bindu scoring system', icon: 'ðŸŽ¯', path: '/ashtakavarga', category: 'Advanced', isNew: true },
  // Life Areas
  { title: 'Career Astrology', titleHi: 'à¤•à¤°à¤¿à¤¯à¤° à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Career guidance and professional predictions', icon: 'ðŸ’¼', path: '/career-astrology', category: 'Life Areas' },
  { title: 'Business Astrology', titleHi: 'à¤µà¥à¤¯à¤¾à¤ªà¤¾à¤° à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Business timing and partnership analysis', icon: 'ðŸ¢', path: '/business-astrology', category: 'Life Areas' },
  { title: 'Medical Astrology', titleHi: 'à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Health predictions and Ayurvedic constitution', icon: 'ðŸŒ¿', path: '/medical-astrology', category: 'Life Areas', isNew: true },
  { title: 'Financial Astrology', titleHi: 'à¤µà¤¿à¤¤à¥à¤¤à¥€à¤¯ à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Wealth yogas and investment timing', icon: 'ðŸ’°', path: '/financial-astrology', category: 'Life Areas', isNew: true },
  // AI & Technology
  { title: 'AI Predictions', titleHi: 'AI à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€', description: 'AI-powered personalized astrological insights', icon: 'ðŸ¤–', path: '/ai-predictions', category: 'AI & Tech', isNew: true },
  { title: 'Numerology', titleHi: 'à¤…à¤‚à¤• à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·', description: 'Life Path, Expression, and Soul Urge numbers', icon: 'ðŸ”¢', path: '/numerology', category: 'AI & Tech', isNew: true },
  // Remedies
  { title: 'Gemstone Guide', titleHi: 'à¤°à¤¤à¥à¤¨ à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°', description: 'Personalized gemstone recommendations with wearing guide', icon: 'ðŸ’Ž', path: '/gemstones', category: 'Remedies', isNew: true },
  { title: 'Remedies', titleHi: 'à¤‰à¤ªà¤¾à¤¯', description: 'Gemstones, mantras, yantras, and more', icon: 'ðŸ™', path: '/remedies', category: 'Remedies' },
  // Tools
  { title: 'Kaal Sarp Yoga', titleHi: 'à¤•à¤¾à¤² à¤¸à¤°à¥à¤ª à¤¯à¥‹à¤—', description: 'Kaal Sarp Yoga detection and remedies', icon: 'ðŸ', path: '/kaalsarp', category: 'Remedies' },
  { title: 'Muhurat Calendar', titleHi: 'à¤®à¥à¤¹à¥‚à¤°à¥à¤¤ à¤•à¥ˆà¤²à¥‡à¤‚à¤¡à¤°', description: 'Auspicious timing for important events', icon: 'ðŸ“…', path: '/muhurat', category: 'Tools' },
  { title: 'Festival Calendar', titleHi: 'à¤¤à¥à¤¯à¥‹à¤¹à¤¾à¤° à¤•à¥ˆà¤²à¥‡à¤‚à¤¡à¤°', description: 'Hindu festivals and auspicious dates', icon: 'ðŸŽ‰', path: '/festival-calendar', category: 'Tools' },
  { title: 'Vaastu Assessment', titleHi: 'à¤µà¤¾à¤¸à¥à¤¤à¥ à¤†à¤•à¤²à¤¨', description: 'Vaastu Shastra analysis for home and office', icon: 'ðŸ ', path: '/vaastu', category: 'Tools' },
  { title: 'Baby Names', titleHi: 'à¤¬à¤šà¥à¤šà¥‹à¤‚ à¤•à¥‡ à¤¨à¤¾à¤®', description: 'Nakshatra-based baby name suggestions', icon: 'ðŸ‘¶', path: '/baby-names', category: 'Tools' },
  { title: 'Lucky Elements', titleHi: 'à¤¶à¥à¤­ à¤¤à¤¤à¥à¤µ', description: 'Lucky numbers, colors, days, and gemstones', icon: 'ðŸ€', path: '/lucky-elements', category: 'Tools' },
  { title: 'Comprehensive Report', titleHi: 'à¤µà¥à¤¯à¤¾à¤ªà¤• à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ', description: 'Complete astrological report with PDF export', icon: 'ðŸ“„', path: '/comprehensive', category: 'Tools' },
  // Community & Learning
  { title: 'Astrology Academy', titleHi: 'à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤· à¤…à¤•à¤¾à¤¦à¤®à¥€', description: 'Learn Vedic astrology with structured courses', icon: 'ðŸ“š', path: '/learn', category: 'Community', isNew: true },
  { title: 'Community Forum', titleHi: 'à¤¸à¤®à¥à¤¦à¤¾à¤¯ à¤®à¤‚à¤š', description: 'Ask questions and discuss with astrologers', icon: 'ðŸ‘¥', path: '/community', category: 'Community', isNew: true },
  { title: 'Enterprise Solutions', titleHi: 'एटरप्राइज समाधान', description: 'White-label platform, API access, custom integrations', icon: '🏢', path: '/enterprise', category: 'Community', isNew: true },
  { title: 'Astrologer Marketplace', titleHi: 'à¤œà¥à¤¯à¥‹à¤¤à¤¿à¤·à¥€ à¤¬à¤¾à¤œà¤¾à¤°', description: 'Book consultations with expert astrologers', icon: 'ðŸª', path: '/marketplace', category: 'Community', isNew: true },
];

const CATEGORIES = ['All', 'Core', 'Compatibility', 'Advanced', 'Global', 'Life Areas', 'AI & Tech', 'Remedies', 'Tools', 'Community'];

const AllFeaturesPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const isHi = lang === 'hi';

  const filtered = FEATURES.filter(f => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch = !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO title="All Features - Complete Vedic Astrology Platform" description="Explore all 500+ features of our comprehensive Vedic astrology platform including Western astrology, Chinese astrology, AI predictions, and more." keywords="vedic astrology features, astrology platform, all astrology tools, jyotish features" canonical="/features" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">ðŸ•‰ï¸</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'à¤¸à¤­à¥€ à¤¸à¥à¤µà¤¿à¤§à¤¾à¤à¤‚' : 'All Features'}</h1>
                <p className="text-xs text-muted-foreground">{FEATURES.length}+ features â€¢ Complete Astrology Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'à¤¹à¥‹à¤®' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Search */}
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'à¤¸à¥à¤µà¤¿à¤§à¤¾ à¤–à¥‹à¤œà¥‡à¤‚...' : 'Search features...'}
            className="w-full border rounded-xl px-4 py-3 text-sm bg-background" />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Features', value: FEATURES.length + '+', icon: 'â­' },
              { label: 'New Features', value: FEATURES.filter(f => f.isNew).length, icon: 'ðŸ†•' },
              { label: 'Categories', value: CATEGORIES.length - 1, icon: 'ðŸ“‚' },
              { label: 'Free Features', value: FEATURES.filter(f => !f.isPremium).length, icon: 'ðŸ†“' },
            ].map(s => (
              <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(feature => (
              <Link key={feature.path + feature.title} to={feature.path}
                className="bg-card border rounded-xl p-4 hover:border-primary transition-colors group">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {isHi ? feature.titleHi : feature.title}
                      </span>
                      {feature.isNew && <span className="text-xs bg-green-100 text-green-800 px-1 rounded">NEW</span>}
                      {feature.isPremium && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">PRO</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-2">ðŸ”</div>
              <p>No features found for "{searchQuery}"</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AllFeaturesPage;
