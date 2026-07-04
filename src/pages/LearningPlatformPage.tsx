// Week 93-95: Learning Platform - Astrology Education
import { useState } from 'react';
import { Link } from 'react-router-dom';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { type SupportedLanguage } from '@/services/multiLanguageService';
import { SEO } from '@/components/SEO';

interface Course {
  id: string;
  title: string;
  titleHi: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lessons: number;
  icon: string;
  description: string;
  topics: string[];
  isFree: boolean;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  content: string;
  keyPoints: string[];
}

const COURSES: Course[] = [
  {
    id: 'vedic-basics',
    title: 'Vedic Astrology Fundamentals',
    titleHi: 'वैदिक ज्योतिष मूल बातें',
    level: 'Beginner',
    duration: '8 hours',
    lessons: 12,
    icon: '🌟',
    description: 'Learn the foundations of Vedic astrology including planets, signs, houses, and basic chart reading.',
    topics: ['9 Planets (Navagraha)', '12 Rashis (Signs)', '12 Houses (Bhavas)', 'Ascendant (Lagna)', 'Nakshatras', 'Basic Chart Reading'],
    isFree: true,
  },
  {
    id: 'dasha-system',
    title: 'Dasha Systems Mastery',
    titleHi: 'दशा प्रणाली',
    level: 'Intermediate',
    duration: '6 hours',
    lessons: 8,
    icon: '⏳',
    description: 'Master the Vimshottari Dasha system and learn to predict life events through planetary periods.',
    topics: ['Vimshottari Dasha', 'Mahadasha Periods', 'Antardasha Analysis', 'Pratyantardasha', 'Dasha Predictions', 'Timing Events'],
    isFree: true,
  },
  {
    id: 'yogas-combinations',
    title: 'Yogas & Planetary Combinations',
    titleHi: 'योग और ग्रह संयोजन',
    level: 'Intermediate',
    duration: '10 hours',
    lessons: 15,
    icon: '✨',
    description: 'Identify and interpret 100+ yogas including Raj Yoga, Dhana Yoga, and Pancha Mahapurusha Yogas.',
    topics: ['Raj Yogas', 'Dhana Yogas', 'Pancha Mahapurusha', 'Neecha Bhanga', 'Viparita Raja Yoga', 'Yoga Strength'],
    isFree: false,
  },
  {
    id: 'divisional-charts',
    title: 'Divisional Charts (Vargas)',
    titleHi: 'विभागीय चार्ट',
    level: 'Advanced',
    duration: '12 hours',
    lessons: 16,
    icon: '📊',
    description: 'Deep dive into D9 Navamsa, D10 Dashamsa, and other divisional charts for precise predictions.',
    topics: ['D1 Rashi Chart', 'D9 Navamsa', 'D10 Dashamsa', 'D12 Dwadashamsa', 'D60 Shashtiamsa', 'Varga Analysis'],
    isFree: false,
  },
  {
    id: 'compatibility',
    title: 'Kundali Milan & Compatibility',
    titleHi: 'कुंडली मिलान',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 8,
    icon: '💑',
    description: 'Learn the complete 36-point Ashtakuta matching system for marriage compatibility.',
    topics: ['Ashtakuta System', 'Varna Matching', 'Nadi Dosha', 'Manglik Analysis', 'Compatibility Reports', 'Remedies'],
    isFree: true,
  },
  {
    id: 'remedies-advanced',
    title: 'Astrological Remedies',
    titleHi: 'ज्योतिषीय उपाय',
    level: 'Intermediate',
    duration: '7 hours',
    lessons: 10,
    icon: '💎',
    description: 'Learn gemstone therapy, mantras, yantras, and other Vedic remedies for planetary afflictions.',
    topics: ['Gemstone Therapy', 'Mantra Chanting', 'Yantra Usage', 'Rudraksha', 'Puja Procedures', 'Charity & Fasting'],
    isFree: false,
  },
  {
    id: 'lal-kitab',
    title: 'Lal Kitab Astrology',
    titleHi: 'लाल किताब',
    level: 'Advanced',
    duration: '8 hours',
    lessons: 12,
    icon: '📕',
    description: 'Master the unique Lal Kitab system with its distinctive predictions and powerful remedies (totke).',
    topics: ['Lal Kitab Basics', 'Planetary Positions', 'Debt (Rin)', 'Totke Remedies', 'Annual Chart', 'Predictions'],
    isFree: false,
  },
  {
    id: 'kp-system',
    title: 'KP System (Krishnamurti Paddhati)',
    titleHi: 'केपी पद्धति',
    level: 'Advanced',
    duration: '9 hours',
    lessons: 12,
    icon: '🔬',
    description: 'Learn the precise KP system for accurate event timing using sub-lord theory.',
    topics: ['KP Basics', 'Sub-Lord Theory', 'Significators', 'Event Timing', 'Horary KP', 'KP Predictions'],
    isFree: false,
  },
];

const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'l1',
    courseId: 'vedic-basics',
    title: 'Introduction to the 9 Planets (Navagraha)',
    duration: '25 min',
    content: `The nine planets (Navagraha) are the foundation of Vedic astrology. Each planet represents specific energies, qualities, and life areas.

**Sun (Surya)**: The soul, father, authority, government, health, and vitality. Rules Leo. Exalted in Aries.

**Moon (Chandra)**: The mind, mother, emotions, public, and fluids. Rules Cancer. Exalted in Taurus.

**Mars (Mangal)**: Energy, courage, siblings, property, and accidents. Rules Aries and Scorpio. Exalted in Capricorn.

**Mercury (Budha)**: Intelligence, communication, business, and education. Rules Gemini and Virgo. Exalted in Virgo.

**Jupiter (Guru/Brihaspati)**: Wisdom, expansion, children, religion, and wealth. Rules Sagittarius and Pisces. Exalted in Cancer.

**Venus (Shukra)**: Love, beauty, luxury, arts, and relationships. Rules Taurus and Libra. Exalted in Pisces.

**Saturn (Shani)**: Discipline, karma, delays, service, and longevity. Rules Capricorn and Aquarius. Exalted in Libra.

**Rahu (North Node)**: Ambition, materialism, foreign matters, and illusion. No sign rulership. Exalted in Taurus/Gemini.

**Ketu (South Node)**: Spirituality, liberation, past karma, and detachment. No sign rulership. Exalted in Scorpio/Sagittarius.`,
    keyPoints: [
      'Sun and Moon are luminaries; others are planets',
      'Each planet rules specific signs (Rashis)',
      'Planets have exaltation and debilitation signs',
      'Natural benefics: Jupiter, Venus, Mercury, Moon',
      'Natural malefics: Saturn, Mars, Rahu, Ketu, Sun',
    ],
  },
  {
    id: 'l2',
    courseId: 'vedic-basics',
    title: 'The 12 Houses (Bhavas) and Their Meanings',
    duration: '30 min',
    content: `The 12 houses represent different areas of life. The Ascendant (Lagna) determines the 1st house.

**1st House (Lagna)**: Self, personality, physical body, health, and overall life direction.

**2nd House (Dhana)**: Wealth, family, speech, food, and accumulated resources.

**3rd House (Sahaja)**: Siblings, courage, communication, short journeys, and skills.

**4th House (Sukha)**: Mother, home, property, vehicles, education, and inner happiness.

**5th House (Putra)**: Children, creativity, intelligence, romance, and past life merits.

**6th House (Ripu)**: Enemies, diseases, debts, service, and daily routines.

**7th House (Kalatra)**: Marriage, partnerships, business partners, and public relations.

**8th House (Mrityu)**: Longevity, transformation, occult, inheritance, and sudden events.

**9th House (Dharma)**: Father, religion, philosophy, higher education, and fortune.

**10th House (Karma)**: Career, status, reputation, government, and life purpose.

**11th House (Labha)**: Gains, income, elder siblings, social networks, and fulfillment of desires.

**12th House (Vyaya)**: Losses, expenses, foreign lands, spirituality, and liberation.`,
    keyPoints: [
      'Kendra houses (1,4,7,10) are most powerful',
      'Trikona houses (1,5,9) are most auspicious',
      'Dusthana houses (6,8,12) are challenging',
      'Upachaya houses (3,6,10,11) improve over time',
      'House lord placement is crucial for predictions',
    ],
  },
];

const LEVEL_COLORS = { Beginner: 'bg-green-100 text-green-800', Intermediate: 'bg-blue-100 text-blue-800', Advanced: 'bg-purple-100 text-purple-800' };

const LearningPlatformPage = () => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'courses'|'lessons'|'quiz'>('courses');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const isHi = lang === 'hi';

  const filteredCourses = filterLevel === 'All' ? COURSES : COURSES.filter(c => c.level === filterLevel);

  return (
    <>
      <SEO title="Astrology Learning Platform - Vedic Astrology Courses" description="Learn Vedic astrology with structured courses covering planets, houses, yogas, dashas, and advanced systems." keywords="learn astrology, vedic astrology course, astrology lessons, jyotish education, astrology certification" canonical="/learn" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'ज्योतिष शिक्षा' : 'Astrology Academy'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'पाठ्यक्रम • पाठ • प्रमाणपत्र' : 'Courses • Lessons • Certification'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          {selectedLesson ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedLesson(null)} className="text-sm text-primary flex items-center gap-1">← Back to course</button>
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{selectedLesson.duration}</span>
                </div>
                <h2 className="text-lg font-bold mb-4">{selectedLesson.title}</h2>
                <div className="prose prose-sm max-w-none text-sm text-muted-foreground whitespace-pre-line">{selectedLesson.content}</div>
                <div className="mt-4 bg-muted rounded-xl p-4">
                  <div className="text-sm font-medium mb-2">Key Points</div>
                  <ul className="space-y-1">
                    {selectedLesson.keyPoints.map(kp => <li key={kp} className="text-sm flex items-start gap-2"><span className="text-primary">✓</span>{kp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : selectedCourse ? (
            <div className="space-y-4">
              <button onClick={() => setSelectedCourse(null)} className="text-sm text-primary flex items-center gap-1">← Back to courses</button>
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{selectedCourse.icon}</span>
                  <div>
                    <h2 className="font-bold">{selectedCourse.title}</h2>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[selectedCourse.level]}`}>{selectedCourse.level}</span>
                      <span className="text-xs text-muted-foreground">{selectedCourse.duration} • {selectedCourse.lessons} lessons</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{selectedCourse.description}</p>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Topics Covered</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCourse.topics.map(t => <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Course Lessons</h3>
                {SAMPLE_LESSONS.filter(l => l.courseId === selectedCourse.id).map((lesson, i) => (
                  <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                    className="w-full bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{i + 1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </button>
                ))}
                {SAMPLE_LESSONS.filter(l => l.courseId === selectedCourse.id).length === 0 && (
                  <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                    <div className="text-3xl mb-2">🚧</div>
                    Lessons for this course are being prepared. Check back soon!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Courses', value: COURSES.length, icon: '📚' },
                  { label: 'Free Courses', value: COURSES.filter(c => c.isFree).length, icon: '🆓' },
                  { label: 'Total Lessons', value: COURSES.reduce((a, c) => a + c.lessons, 0), icon: '📖' },
                ].map(s => (
                  <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
                    <div className="text-2xl">{s.icon}</div>
                    <div className="text-xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button key={level} onClick={() => setFilterLevel(level)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                    {level}
                  </button>
                ))}
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredCourses.map(course => (
                  <button key={course.id} onClick={() => setSelectedCourse(course)}
                    className="bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{course.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{isHi ? course.titleHi : course.title}</span>
                          {course.isFree && <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">FREE</span>}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level]}`}>{course.level}</span>
                          <span className="text-xs text-muted-foreground">{course.duration} • {course.lessons} lessons</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                      </div>
                      <span className="text-muted-foreground flex-shrink-0">→</span>
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

export default LearningPlatformPage;
