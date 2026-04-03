/**
 * Career Astrology Page
 * Professional guidance based on 10th house analysis and planetary indicators
 */

import { useState } from 'react';
import { Briefcase, Calculator, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CareerReportComponent from '@/components/CareerReport';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { analyzeCareer, type CareerAnalysis } from '@/services/careerAstrologyService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';

const CareerAstrology = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });

  const { toast } = useToast();
  const isHi = lang === 'hi';

  const labels = {
    en: {
      title: 'Career Astrology',
      subtitle: 'Professional Guidance & Analysis',
      description: 'Comprehensive career analysis based on 10th house, planetary positions, and Vedic astrology principles',
      userDetails: 'Personal Details',
      name: 'Full Name',
      dateOfBirth: 'Date of Birth',
      timeOfBirth: 'Time of Birth',
      placeOfBirth: 'Place of Birth',
      analyze: 'Analyze Career',
      analyzing: 'Analyzing...',
      newAnalysis: 'New Analysis',
      sampleData: 'Use Sample Data',
      week11Note: 'Week 11 Implementation',
      week11Description: 'Comprehensive career astrology system with 10th house analysis, planetary indicators, and professional guidance.',
      features: {
        tenthHouse: '10th House Analysis',
        indicators: 'Career Planetary Indicators',
        fields: 'Recommended Career Fields',
        strength: 'Career Strength Assessment',
        timing: 'Career Timing Analysis'
      },
      errors: {
        fillAllFields: 'Please fill all required fields',
        analysisFailed: 'Career analysis failed. Please check the data and try again.',
        invalidDate: 'Please enter valid date in YYYY-MM-DD format',
        invalidTime: 'Please enter valid time in HH:MM format'
      }
    },
    hi: {
      title: 'करियर ज्योतिष',
      subtitle: 'व्यावसायिक मार्गदर्शन और विश्लेषण',
      description: '10वें भाव, ग्रह स्थितियों और वैदिक ज्योतिष सिद्धांतों पर आधारित व्यापक करियर विश्लेषण',
      userDetails: 'व्यक्तिगत विवरण',
      name: 'पूरा नाम',
      dateOfBirth: 'जन्म तिथि',
      timeOfBirth: 'जन्म समय',
      placeOfBirth: 'जन्म स्थान',
      analyze: 'करियर विश्लेषण करें',
      analyzing: 'विश्लेषण कर रहे हैं...',
      newAnalysis: 'नया विश्लेषण',
      sampleData: 'नमूना डेटा का उपयोग करें',
      week11Note: 'सप्ताह 11 कार्यान्वयन',
      week11Description: '10वें भाव विश्लेषण, ग्रह संकेतकों और व्यावसायिक मार्गदर्शन के साथ व्यापक करियर ज्योतिष प्रणाली।',
      features: {
        tenthHouse: '10वां भाव विश्लेषण',
        indicators: 'करियर ग्रह संकेतक',
        fields: 'सुझाए गए करियर क्षेत्र',
        strength: 'करियर शक्ति मूल्यांकन',
        timing: 'करियर समय विश्लेषण'
      },
      errors: {
        fillAllFields: 'कृपया सभी आवश्यक फ़ील्ड भरें',
        analysisFailed: 'करियर विश्लेषण विफल हुआ। कृपया डेटा जांचें और पुनः प्रयास करें।',
        invalidDate: 'कृपया YYYY-MM-DD प्रारूप में वैध तिथि दर्ज करें',
        invalidTime: 'कृपया HH:MM प्रारूप में वैध समय दर्ज करें'
      }
    }
  };

  const t = labels[lang];

  // Validation function
  const validateInputs = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    // Check required fields
    if (!userInfo.name || !userInfo.dateOfBirth || !userInfo.timeOfBirth || !userInfo.placeOfBirth) {
      throw new Error(t.errors.fillAllFields);
    }

    // Validate date format
    if (!dateRegex.test(userInfo.dateOfBirth)) {
      throw new Error(t.errors.invalidDate);
    }

    // Validate time format
    if (!timeRegex.test(userInfo.timeOfBirth)) {
      throw new Error(t.errors.invalidTime);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      validateInputs();

      // Analyze career
      const careerAnalysis = await analyzeCareer(
        userInfo.dateOfBirth,
        userInfo.timeOfBirth,
        userInfo.placeOfBirth
      );
      
      setAnalysis(careerAnalysis);

      toast({
        title: isHi ? "✅ विश्लेषण पूर्ण" : "✅ Analysis Complete",
        description: isHi 
          ? `करियर शक्ति: ${careerAnalysis.careerStrength.overall}% (समग्र)`
          : `Career Strength: ${careerAnalysis.careerStrength.overall}% (Overall)`,
      });

    } catch (error) {
      console.error('Career analysis error:', error);
      toast({
        title: isHi ? "❌ विश्लेषण त्रुटि" : "❌ Analysis Error",
        description: error instanceof Error ? error.message : t.errors.analysisFailed,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setUserInfo({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
  };

  const loadSampleData = () => {
    setUserInfo({
      name: 'Rajkumar',
      dateOfBirth: '1963-09-15',
      timeOfBirth: '06:00',
      placeOfBirth: 'Aspur, Rajasthan'
    });
  };

  return (
    <>
      <SEO
        title="Career Astrology - Professional Guidance"
        description="Get personalized career guidance based on your birth chart. Discover suitable professions, business opportunities, and career timing with Vedic astrology."
        keywords="career astrology, job predictions, profession astrology, 10th house, career guidance, business astrology"
        canonical="/career-astrology"
      />
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className={cn('text-2xl font-bold text-primary', isHi && 'font-hindi')}>
                {t.title}
              </h1>
              <p className={cn('text-sm text-muted-foreground', isHi && 'font-hindi')}>
                {t.subtitle}
              </p>
            </div>
          </div>
          <EnhancedLanguageToggle currentLang={lang} onChange={setLang} showRegion={false} autoDetect={false} />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Description */}
        <div className="text-center mb-8">
          <p className={cn('text-muted-foreground max-w-2xl mx-auto', isHi && 'font-hindi')}>
            {t.description}
          </p>
        </div>
        {/* Week 11 Implementation Note */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className={cn('font-semibold text-blue-900 dark:text-blue-100 mb-1', isHi && 'font-hindi')}>
                {t.week11Note}
              </h3>
              <p className={cn('text-sm text-blue-800 dark:text-blue-200', isHi && 'font-hindi')}>
                {t.week11Description}
              </p>
              <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'मुख्य विशेषताएं:' : 'Key Features:'} 
                </span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>{t.features.tenthHouse}</li>
                  <li>{t.features.indicators}</li>
                  <li>{t.features.fields}</li>
                  <li>{t.features.strength}</li>
                  <li>{t.features.timing}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {!analysis ? (
          /* Input Form */
          <div className="space-y-6">
            {/* Sample Data Button */}
            <div className="text-center">
              <Button
                onClick={loadSampleData}
                variant="outline"
                className={cn('mb-4', isHi && 'font-hindi')}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {t.sampleData}
              </Button>
            </div>

            {/* User Details Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', isHi && 'font-hindi')}>
                  <Briefcase className="h-5 w-5" />
                  {t.userDetails}
                </CardTitle>
                <CardDescription className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'करियर विश्लेषण के लिए अपना विवरण दर्ज करें' : 'Enter your details for career analysis'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className={isHi ? 'font-hindi' : ''}>
                    {t.name} *
                  </Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    placeholder={isHi ? "पूरा नाम दर्ज करें" : "Enter full name"}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className={isHi ? 'font-hindi' : ''}>
                    {t.dateOfBirth} *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={userInfo.dateOfBirth}
                    onChange={(e) => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="time" className={isHi ? 'font-hindi' : ''}>
                    {t.timeOfBirth} *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={userInfo.timeOfBirth}
                    onChange={(e) => setUserInfo({ ...userInfo, timeOfBirth: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="place" className={isHi ? 'font-hindi' : ''}>
                    {t.placeOfBirth} *
                  </Label>
                  <Input
                    id="place"
                    value={userInfo.placeOfBirth}
                    onChange={(e) => setUserInfo({ ...userInfo, placeOfBirth: e.target.value })}
                    placeholder={isHi ? "जन्म स्थान दर्ज करें" : "Enter birth place"}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <div className="text-center">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                size="lg"
                className={cn('px-8', isHi && 'font-hindi')}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4 mr-2" />
                    {t.analyze}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* New Analysis Button */}
            <div className="text-center">
              <Button
                onClick={handleNewAnalysis}
                variant="outline"
                className={isHi ? 'font-hindi' : ''}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t.newAnalysis}
              </Button>
            </div>

            {/* Career Analysis Report */}
            <CareerReportComponent
              analysis={analysis}
              userInfo={userInfo}
              lang={lang}
            />
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default CareerAstrology;