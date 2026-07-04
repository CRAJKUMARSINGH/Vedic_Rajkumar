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
  {
    title: 'Birth Chart (Kundli)',
    titleHi: 'जन्म कुंडली',
    description: 'Complete Vedic birth chart with all planets and houses',
    icon: '🌟',
    path: '/',
    category: 'Core',
  },
  {
    title: 'Transit Analysis',
    titleHi: 'गोचर विश्लेषण',
    description: 'Daily planetary transit effects on your chart',
    icon: '🔄',
    path: '/',
    category: 'Core',
  },
  {
    title: 'Dasha System',
    titleHi: 'दशा प्रणाली',
    description: 'Vimshottari Dasha periods and predictions',
    icon: '🕒',
    path: '/dasha',
    category: 'Core',
  },
  {
    title: 'Nakshatra Analysis',
    titleHi: 'नक्षत्र विश्लेषण',
    description: '27 Nakshatras with detailed characteristics',
    icon: '⭐',
    path: '/',
    category: 'Core',
  },
  {
    title: 'Yoga Analysis',
    titleHi: 'योग विश्लेषण',
    description: '100+ Vedic yogas identification',
    icon: '✨',
    path: '/yogas',
    category: 'Core',
  },
  {
    title: 'Horoscope',
    titleHi: 'राशिफल',
    description: 'Daily, weekly, monthly horoscope predictions',
    icon: '🌙',
    path: '/horoscope',
    category: 'Core',
  },
  // Compatibility
  {
    title: 'Kundali Milan',
    titleHi: 'कुंडली मिलान',
    description: 'Complete 36-point marriage compatibility',
    icon: '👫',
    path: '/matchmaking',
    category: 'Compatibility',
  },
  {
    title: 'Love Astrology',
    titleHi: 'प्रेम ज्योतिष',
    description: 'Relationship and romance predictions',
    icon: '❤️',
    path: '/love-astrology',
    category: 'Compatibility',
  },
  // Advanced Systems
  {
    title: 'Lal Kitab',
    titleHi: 'लाल किताब',
    description: 'Lal Kitab predictions and totke remedies',
    icon: '📖',
    path: '/lal-kitab',
    category: 'Advanced',
  },
  {
    title: 'KP System',
    titleHi: 'केपी पद्धति',
    description: 'Krishnamurti Paddhati for precise timing',
    icon: '🔭',
    path: '/kp-system',
    category: 'Advanced',
  },
  {
    title: 'Jaimini System',
    titleHi: 'जैमिनी पद्धति',
    description: 'Jaimini astrology with Chara Dasha',
    icon: '📜',
    path: '/jaimini',
    category: 'Advanced',
  },
  {
    title: 'Tajik System',
    titleHi: 'ताजक पद्धति',
    description: 'Annual horoscope (Varshphal)',
    icon: '📅',
    path: '/tajik',
    category: 'Advanced',
  },
  {
    title: 'Nadi Astrology',
    titleHi: 'नाड़ी ज्योतिष',
    description: 'Ancient Nadi astrology predictions',
    icon: '🌿',
    path: '/nadi-astrology',
    category: 'Advanced',
  },
  {
    title: 'Divisional Charts',
    titleHi: 'विभागीय चार्ट',
    description: 'D9, D10, D12 and more divisional charts',
    icon: '📊',
    path: '/divisional-charts',
    category: 'Advanced',
  },
  {
    title: 'Planetary Strength',
    titleHi: 'ग्रह शक्ति',
    description: 'Shadbala and planetary strength analysis',
    icon: '💪',
    path: '/planetary-strength',
    category: 'Advanced',
  },
  // Global Systems
  {
    title: 'Western Astrology',
    titleHi: 'पाश्चात्य ज्योतिष',
    description: 'Tropical zodiac, aspects, and Western chart',
    icon: '⭐',
    path: '/western-astrology',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Chinese Astrology',
    titleHi: 'चीनी ज्योतिष',
    description: 'Animal signs, Five Elements, BaZi',
    icon: '🐉',
    path: '/chinese-astrology',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Horary Astrology',
    titleHi: 'प्रश्न कुंडली',
    description: 'Ask any question and get cosmic answers',
    icon: '🔮',
    path: '/horary',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Question / Prashna',
    titleHi: 'प्रश्न शास्त्र',
    description: 'Classical Prasna Marga analysis — natal+transit or pure Prasna chart',
    icon: '❓',
    path: '/question',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'World Astrology',
    titleHi: 'विश्व ज्योतिष',
    description: 'Mayan, Egyptian & Celtic astrology systems',
    icon: '🌍',
    path: '/world-astrology',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Comparative Astrology',
    titleHi: 'तुलनात्मक ज्योतिष',
    description: 'Vedic vs Western side-by-side comparison',
    icon: '⚖️',
    path: '/comparative-astrology',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Daily Panchang',
    titleHi: 'पंचांग',
    description: 'Tithi, Nakshatra, Yoga, Karana for any date',
    icon: '📅',
    path: '/panchang',
    category: 'Tools',
    isNew: true,
  },
  {
    title: 'Electional Astrology',
    titleHi: 'निर्वाचन ज्योतिष',
    description: 'Find best dates for marriage, business, travel',
    icon: '📅',
    path: '/electional-astrology',
    category: 'Tools',
    isNew: true,
  },
  {
    title: 'Mundane Astrology',
    titleHi: 'मुंडेन ज्योतिष',
    description: 'World events, national charts, planetary cycles',
    icon: '🌍',
    path: '/mundane-astrology',
    category: 'Global',
    isNew: true,
  },
  {
    title: 'Sade Sati',
    titleHi: 'साढ़े साती',
    description: "Saturn's 7.5 year transit with phase analysis",
    icon: '🪐',
    path: '/sade-sati',
    category: 'Remedies',
    isNew: true,
  },
  {
    title: 'Ashtakavarga',
    titleHi: 'अष्टकवर्ग',
    description: 'Transit strength with bindu scoring system',
    icon: '🎯',
    path: '/ashtakavarga',
    category: 'Advanced',
    isNew: true,
  },
  // Life Areas
  {
    title: 'Career Astrology',
    titleHi: 'करियर ज्योतिष',
    description: 'Career guidance and professional predictions',
    icon: '💼',
    path: '/career-astrology',
    category: 'Life Areas',
  },
  {
    title: 'Business Astrology',
    titleHi: 'व्यापार ज्योतिष',
    description: 'Business timing and partnership analysis',
    icon: '🏢',
    path: '/business-astrology',
    category: 'Life Areas',
  },
  {
    title: 'Medical Astrology',
    titleHi: 'चिकित्सा ज्योतिष',
    description: 'Health predictions and Ayurvedic constitution',
    icon: '🌿',
    path: '/medical-astrology',
    category: 'Life Areas',
    isNew: true,
  },
  {
    title: 'Financial Astrology',
    titleHi: 'वित्तीय ज्योतिष',
    description: 'Wealth yogas and investment timing',
    icon: '💰',
    path: '/financial-astrology',
    category: 'Life Areas',
    isNew: true,
  },
  // AI & Technology
  {
    title: 'AI Predictions',
    titleHi: 'AI भविष्यवाणी',
    description: 'AI-powered personalized astrological insights',
    icon: '🤖',
    path: '/ai-predictions',
    category: 'AI & Tech',
    isNew: true,
  },
  {
    title: 'Numerology',
    titleHi: 'अंक ज्योतिष',
    description: 'Life Path, Expression, and Soul Urge numbers',
    icon: '🔢',
    path: '/numerology',
    category: 'AI & Tech',
    isNew: true,
  },
  // Remedies
  {
    title: 'Gemstone Guide',
    titleHi: 'रत्न शास्त्र',
    description: 'Personalized gemstone recommendations with wearing guide',
    icon: '💎',
    path: '/gemstones',
    category: 'Remedies',
    isNew: true,
  },
  {
    title: 'Remedies',
    titleHi: 'उपाय',
    description: 'Gemstones, mantras, yantras, and more',
    icon: '🙏',
    path: '/remedies',
    category: 'Remedies',
  },
  // Tools
  {
    title: 'Kaal Sarp Yoga',
    titleHi: 'काल सर्प योग',
    description: 'Kaal Sarp Yoga detection and remedies',
    icon: '🐍',
    path: '/kaalsarp',
    category: 'Remedies',
  },
  {
    title: 'Muhurat Calendar',
    titleHi: 'मुहूर्त कैलेंडर',
    description: 'Auspicious timing for important events',
    icon: '📅',
    path: '/muhurat',
    category: 'Tools',
  },
  {
    title: 'Festival Calendar',
    titleHi: 'त्योहार कैलेंडर',
    description: 'Hindu festivals and auspicious dates',
    icon: '🎉',
    path: '/festival-calendar',
    category: 'Tools',
  },
  {
    title: 'Vaastu Assessment',
    titleHi: 'वास्तु आकलन',
    description: 'Vaastu Shastra analysis for home and office',
    icon: '🏠',
    path: '/vaastu',
    category: 'Tools',
  },
  {
    title: 'Baby Names',
    titleHi: 'बच्चों के नाम',
    description: 'Nakshatra-based baby name suggestions',
    icon: '👶',
    path: '/baby-names',
    category: 'Tools',
  },
  {
    title: 'Lucky Elements',
    titleHi: 'शुभ तत्व',
    description: 'Lucky numbers, colors, days, and gemstones',
    icon: '🍀',
    path: '/lucky-elements',
    category: 'Tools',
  },
  {
    title: 'Comprehensive Report',
    titleHi: 'व्यापक रिपोर्ट',
    description: 'Complete astrological report with PDF export',
    icon: '📄',
    path: '/comprehensive',
    category: 'Tools',
  },
  // Community & Learning
  {
    title: 'Astrology Academy',
    titleHi: 'ज्योतिष अकादमी',
    description: 'Learn Vedic astrology with structured courses',
    icon: '📚',
    path: '/learn',
    category: 'Community',
    isNew: true,
  },
  {
    title: 'Community Forum',
    titleHi: 'समुदाय मंच',
    description: 'Ask questions and discuss with astrologers',
    icon: '👥',
    path: '/community',
    category: 'Community',
    isNew: true,
  },
  {
    title: 'Enterprise Solutions',
    titleHi: 'एटरप्राइज समाधान',
    description: 'White-label platform, API access, custom integrations',
    icon: '🏢',
    path: '/enterprise',
    category: 'Community',
    isNew: true,
  },
  {
    title: 'Astrologer Marketplace',
    titleHi: 'ज्योतिषी बाजार',
    description: 'Book consultations with expert astrologers',
    icon: '🛒',
    path: '/marketplace',
    category: 'Community',
    isNew: true,
  },
];

const CATEGORIES = [
  'All',
  'Core',
  'Compatibility',
  'Advanced',
  'Global',
  'Life Areas',
  'AI & Tech',
  'Remedies',
  'Tools',
  'Community',
];

const AllFeaturesPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const isHi = lang === 'hi';

  const filtered = FEATURES.filter(f => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO
        title="All Features - Complete Vedic Astrology Platform"
        description="Explore all 500+ features of our comprehensive Vedic astrology platform including Western astrology, Chinese astrology, AI predictions, and more."
        keywords="vedic astrology features, astrology platform, all astrology tools, jyotish features"
        canonical="/features"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🕉️</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'सभी सुविधाएं' : 'All Features'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {FEATURES.length}+ features • Complete Astrology Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">
                {isHi ? 'होम' : 'Home'}
              </Link>
              <EnhancedLanguageToggle
                currentLang={lang}
                onChange={setLang}
                showRegion={false}
                autoDetect={false}
              />
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'सुविधा खोजें...' : 'Search features...'}
            className="w-full border rounded-xl px-4 py-3 text-sm bg-background"
          />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Features', value: FEATURES.length + '+', icon: 'â­' },
              { label: 'New Features', value: FEATURES.filter(f => f.isNew).length, icon: 'ðŸ†•' },
              { label: 'Categories', value: CATEGORIES.length - 1, icon: 'ðŸ“‚' },
              {
                label: 'Free Features',
                value: FEATURES.filter(f => !f.isPremium).length,
                icon: 'ðŸ†“',
              },
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
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(feature => (
              <Link
                key={feature.path + feature.title}
                to={feature.path}
                className="bg-card border rounded-xl p-4 hover:border-primary transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {isHi ? feature.titleHi : feature.title}
                      </span>
                      {feature.isNew && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          NEW
                        </span>
                      )}
                      {feature.isPremium && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {feature.description}
                    </p>
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
