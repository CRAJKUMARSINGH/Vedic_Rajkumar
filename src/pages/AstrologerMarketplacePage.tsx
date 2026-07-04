// Week 89-92: Astrologer Marketplace Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

interface Astrologer {
  id: string;
  name: string;
  specialization: string[];
  experience: number;
  rating: number;
  reviews: number;
  languages: string[];
  pricePerMin: number;
  isOnline: boolean;
  avatar: string;
  bio: string;
  expertise: string[];
  totalConsultations: number;
}

const ASTROLOGERS: Astrologer[] = [
  {
    id: 'a1', name: 'Pt. Rajesh Sharma', specialization: ['Vedic Astrology', 'Kundali Reading', 'Marriage'],
    experience: 25, rating: 4.9, reviews: 1250, languages: ['Hindi', 'English'],
    pricePerMin: 30, isOnline: true, avatar: '🧙‍♂️',
    bio: 'Expert in Vedic astrology with 25 years of experience. Specializes in marriage compatibility and career guidance.',
    expertise: ['Birth Chart', 'Dasha Analysis', 'Marriage Compatibility', 'Career Guidance'],
    totalConsultations: 5000,
  },
  {
    id: 'a2', name: 'Dr. Priya Joshi', specialization: ['KP System', 'Horary', 'Medical Astrology'],
    experience: 18, rating: 4.8, reviews: 890, languages: ['English', 'Marathi', 'Hindi'],
    pricePerMin: 45, isOnline: true, avatar: '👩‍🔬',
    bio: 'PhD in Astrology. Expert in KP System and Medical Astrology. Provides scientific approach to predictions.',
    expertise: ['KP System', 'Medical Astrology', 'Horary Questions', 'Remedies'],
    totalConsultations: 3200,
  },
  {
    id: 'a3', name: 'Acharya Suresh Pandey', specialization: ['Lal Kitab', 'Vastu', 'Numerology'],
    experience: 30, rating: 4.7, reviews: 2100, languages: ['Hindi', 'Punjabi'],
    pricePerMin: 25, isOnline: false, avatar: '📕',
    bio: 'Master of Lal Kitab with 30 years experience. Expert in Vastu Shastra and Numerology.',
    expertise: ['Lal Kitab', 'Vastu Shastra', 'Numerology', 'Totke Remedies'],
    totalConsultations: 8000,
  },
  {
    id: 'a4', name: 'Jyotishi Meera Devi', specialization: ['Nadi Astrology', 'Palmistry', 'Tarot'],
    experience: 20, rating: 4.6, reviews: 650, languages: ['Tamil', 'English', 'Hindi'],
    pricePerMin: 35, isOnline: true, avatar: '🌺',
    bio: 'Specialist in South Indian Nadi Astrology and Palmistry. Provides detailed life readings.',
    expertise: ['Nadi Astrology', 'Palmistry', 'Tarot Reading', 'South Indian Astrology'],
    totalConsultations: 2800,
  },
  {
    id: 'a5', name: 'Astro Vikram Singh', specialization: ['Western Astrology', 'Vedic', 'Comparison'],
    experience: 15, rating: 4.8, reviews: 420, languages: ['English', 'Hindi'],
    pricePerMin: 50, isOnline: true, avatar: '⭐',
    bio: 'Expert in both Western and Vedic astrology. Provides comparative analysis for global clients.',
    expertise: ['Western Astrology', 'Vedic Astrology', 'Comparative Analysis', 'Transit Predictions'],
    totalConsultations: 1500,
  },
  {
    id: 'a6', name: 'Pt. Anand Mishra', specialization: ['Jaimini', 'Divisional Charts', 'Yogas'],
    experience: 22, rating: 4.9, reviews: 780, languages: ['Hindi', 'Sanskrit', 'English'],
    pricePerMin: 40, isOnline: false, avatar: '📿',
    bio: 'Scholar of Jaimini astrology and divisional charts. Expert in identifying yogas and their effects.',
    expertise: ['Jaimini System', 'Divisional Charts', 'Yoga Analysis', 'Muhurat'],
    totalConsultations: 3500,
  },
];

const AstrologerMarketplacePage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterSpecialization, setFilterSpecialization] = useState('All');
  const [showBooking, setShowBooking] = useState(false);
  const isHi = lang === 'hi';

  const specializations = ['All', 'Vedic Astrology', 'KP System', 'Lal Kitab', 'Nadi Astrology', 'Western Astrology', 'Numerology'];

  const filtered = ASTROLOGERS.filter(a => {
    if (filterOnline && !a.isOnline) return false;
    if (filterSpecialization !== 'All' && !a.specialization.includes(filterSpecialization)) return false;
    return true;
  });

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );

  return (
    <>
      <SEO title="Astrologer Marketplace - Book Expert Consultation" description="Connect with expert Vedic astrologers for personalized consultations. Book sessions with verified astrologers specializing in Vedic, KP, Lal Kitab, and more." keywords="astrologer consultation, book astrologer, vedic astrologer, online astrology, jyotish consultation" canonical="/marketplace" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏪</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'ज्योतिषी बाजार' : 'Astrologer Marketplace'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'विशेषज्ञ ज्योतिषियों से परामर्श' : 'Book Expert Consultations'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {selectedAstrologer && !showBooking ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedAstrologer(null)} className="text-sm text-primary flex items-center gap-1">← Back</button>
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedAstrologer.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-lg">{selectedAstrologer.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedAstrologer.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {selectedAstrologer.isOnline ? '● Online' : '○ Offline'}
                      </span>
                    </div>
                    <StarRating rating={selectedAstrologer.rating} />
                    <div className="text-xs text-muted-foreground mt-1">{selectedAstrologer.reviews} reviews • {selectedAstrologer.totalConsultations.toLocaleString()} consultations</div>
                    <div className="text-xs text-muted-foreground">{selectedAstrologer.experience} years experience</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{selectedAstrologer.bio}</p>
                <div className="mt-3">
                  <div className="text-xs font-medium mb-1">Expertise</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedAstrologer.expertise.map(e => <span key={e} className="text-xs bg-muted px-2 py-0.5 rounded">{e}</span>)}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-medium mb-1">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedAstrologer.languages.map(l => <span key={l} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{l}</span>)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹{selectedAstrologer.pricePerMin}</span>
                    <span className="text-xs text-muted-foreground">/min</span>
                  </div>
                  <button onClick={() => setShowBooking(true)} disabled={!selectedAstrologer.isOnline}
                    className="bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50">
                    {selectedAstrologer.isOnline ? 'Book Consultation' : 'Currently Offline'}
                  </button>
                </div>
              </div>
            </div>
          ) : showBooking && selectedAstrologer ? (
            <div className="space-y-4">
              <button onClick={() => setShowBooking(false)} className="text-sm text-primary flex items-center gap-1">← Back</button>
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <h2 className="font-bold">Book Consultation with {selectedAstrologer.name}</h2>
                <div className="bg-muted rounded-xl p-4 text-center">
                  <div className="text-4xl mb-2">🚧</div>
                  <p className="text-sm text-muted-foreground">Online consultation booking is coming soon. This feature will include video calls, chat, and payment integration.</p>
                  <p className="text-xs text-muted-foreground mt-2">For now, please contact through our community forum.</p>
                </div>
                <Link to="/community" className="block w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium text-center">
                  Visit Community Forum
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Expert Astrologers', value: ASTROLOGERS.length, icon: '🧙' },
                  { label: 'Online Now', value: ASTROLOGERS.filter(a => a.isOnline).length, icon: '🟢' },
                  { label: 'Avg Rating', value: '4.8★', icon: '⭐' },
                ].map(s => (
                  <div key={s.label} className="bg-card border rounded-xl p-3 text-center">
                    <div className="text-xl">{s.icon}</div>
                    <div className="font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setFilterOnline(!filterOnline)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterOnline ? 'bg-green-100 text-green-800 border-green-300' : 'border-border text-muted-foreground'}`}>
                    🟢 Online Only
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {specializations.map(s => (
                    <button key={s} onClick={() => setFilterSpecialization(s)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${filterSpecialization === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Astrologers List */}
              <div className="space-y-3">
                {filtered.map(astrologer => (
                  <button key={astrologer.id} onClick={() => setSelectedAstrologer(astrologer)}
                    className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{astrologer.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{astrologer.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${astrologer.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                            {astrologer.isOnline ? '● Online' : '○ Offline'}
                          </span>
                        </div>
                        <StarRating rating={astrologer.rating} />
                        <div className="text-xs text-muted-foreground">{astrologer.experience} yrs • {astrologer.reviews} reviews</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {astrologer.specialization.slice(0, 2).map(s => <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded">{s}</span>)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-primary">₹{astrologer.pricePerMin}</div>
                        <div className="text-xs text-muted-foreground">/min</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default AstrologerMarketplacePage;
