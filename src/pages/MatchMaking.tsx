/**
 * Match Making Page
 * Kundali Milan (Marriage Compatibility) using Ashtakuta system
 */

import { useState } from 'react';
import { Heart, Users, Calculator, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompatibilityReportComponent from '@/components/CompatibilityReport';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { calculateAshtakuta, type PartnerData, type CompatibilityReport } from '@/services/ashtakutaService';
import { parseAndValidateJatakCoordinates } from '@/utils/coordinateParser';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MatchMaking = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [malePartner, setMalePartner] = useState<PartnerData>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });
  const [femalePartner, setFemalePartner] = useState<PartnerData>({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });

  const { toast } = useToast();
  const isHi = lang === 'hi';

  const labels = {
    en: {
      title: 'Kundali Milan',
      subtitle: 'Marriage Compatibility Analysis',
      description: 'Traditional Ashtakuta system for marriage matching based on Vedic astrology principles',
      malePartner: 'Male Partner Details',
      femalePartner: 'Female Partner Details',
      name: 'Full Name',
      dateOfBirth: 'Date of Birth',
      timeOfBirth: 'Time of Birth',
      placeOfBirth: 'Place of Birth',
      calculate: 'Calculate Compatibility',
      calculating: 'Calculating...',
      newMatch: 'New Match',
      sampleData: 'Use Sample Data',
      week9Note: 'Week 9 Implementation',
      week9Description: 'Currently covers 5 out of 8 Ashtakuta categories (15/36 points). Complete system in Week 10.',
      categories: {
        varna: 'Varna (Social Compatibility)',
        vashya: 'Vashya (Mutual Attraction)',
        tara: 'Tara (Birth Star Compatibility)',
        yoni: 'Yoni (Physical Compatibility)',
        grahaMaitri: 'Graha Maitri (Mental Compatibility)'
      },
      errors: {
        fillAllFields: 'Please fill all required fields for both partners',
        calculationFailed: 'Compatibility calculation failed. Please check the data and try again.',
        invalidDate: 'Please enter valid dates in YYYY-MM-DD format',
        invalidTime: 'Please enter valid time in HH:MM format'
      }
    },
    hi: {
      title: 'कुंडली मिलान',
      subtitle: 'विवाह अनुकूलता विश्लेषण',
      description: 'वैदिक ज्योतिष सिद्धांतों पर आधारित विवाह मिलान के लिए पारंपरिक अष्टकूट प्रणाली',
      malePartner: 'पुरुष साथी का विवरण',
      femalePartner: 'महिला साथी का विवरण',
      name: 'पूरा नाम',
      dateOfBirth: 'जन्म तिथि',
      timeOfBirth: 'जन्म समय',
      placeOfBirth: 'जन्म स्थान',
      calculate: 'अनुकूलता की गणना करें',
      calculating: 'गणना कर रहे हैं...',
      newMatch: 'नया मिलान',
      sampleData: 'नमूना डेटा का उपयोग करें',
      week9Note: 'सप्ताह 9 कार्यान्वयन',
      week9Description: 'वर्तमान में 8 में से 5 अष्टकूट श्रेणियों को कवर करता है (36 में से 15 अंक)। सप्ताह 10 में पूर्ण प्रणाली।',
      categories: {
        varna: 'वर्ण (सामाजिक अनुकूलता)',
        vashya: 'वश्य (पारस्परिक आकर्षण)',
        tara: 'तारा (जन्म नक्षत्र अनुकूलता)',
        yoni: 'योनि (शारीरिक अनुकूलता)',
        grahaMaitri: 'ग्रह मैत्री (मानसिक अनुकूलता)'
      },
      errors: {
        fillAllFields: 'कृपया दोनों साझीदारों के लिए सभी आवश्यक फ़ील्ड भरें',
        calculationFailed: 'अनुकूलता गणना विफल हुई। कृपया डेटा जांचें और पुनः प्रयास करें।',
        invalidDate: 'कृपया YYYY-MM-DD प्रारूप में वैध तिथियां दर्ज करें',
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
    if (!malePartner.name || !malePartner.dateOfBirth || !malePartner.timeOfBirth || !malePartner.placeOfBirth ||
        !femalePartner.name || !femalePartner.dateOfBirth || !femalePartner.timeOfBirth || !femalePartner.placeOfBirth) {
      throw new Error(t.errors.fillAllFields);
    }

    // Validate date format
    if (!dateRegex.test(malePartner.dateOfBirth) || !dateRegex.test(femalePartner.dateOfBirth)) {
      throw new Error(t.errors.invalidDate);
    }

    // Validate time format
    if (!timeRegex.test(malePartner.timeOfBirth) || !timeRegex.test(femalePartner.timeOfBirth)) {
      throw new Error(t.errors.invalidTime);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      validateInputs();

      // Calculate compatibility
      const compatibilityReport = await calculateAshtakuta(malePartner, femalePartner);
      setReport(compatibilityReport);

      toast({
        title: isHi ? "✅ गणना पूर्ण" : "✅ Calculation Complete",
        description: isHi 
          ? `अनुकूलता स्कोर: ${compatibilityReport.totalPoints}/${compatibilityReport.maxPoints} (${compatibilityReport.percentage.toFixed(1)}%)`
          : `Compatibility Score: ${compatibilityReport.totalPoints}/${compatibilityReport.maxPoints} (${compatibilityReport.percentage.toFixed(1)}%)`,
      });

    } catch (error) {
      console.error('Compatibility calculation error:', error);
      toast({
        title: isHi ? "❌ गणना त्रुटि" : "❌ Calculation Error",
        description: error.message || t.errors.calculationFailed,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewMatch = () => {
    setReport(null);
    setMalePartner({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
    setFemalePartner({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
  };

  const loadSampleData = () => {
    setMalePartner({
      name: 'Rajkumar',
      dateOfBirth: '1963-09-15',
      timeOfBirth: '06:00',
      placeOfBirth: 'Aspur, Rajasthan'
    });
    setFemalePartner({
      name: 'Priyanka',
      dateOfBirth: '1984-10-23',
      timeOfBirth: '05:50',
      placeOfBirth: 'Ahmedabad, Gujarat'
    });
  };

  const PartnerForm = ({ 
    partner, 
    setPartner, 
    title, 
    bgColor 
  }: { 
    partner: PartnerData; 
    setPartner: (p: PartnerData) => void; 
    title: string;
    bgColor: string;
  }) => (
    <Card className={cn('border-2', bgColor)}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', isHi && 'font-hindi')}>
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${title}-name`} className={isHi ? 'font-hindi' : ''}>
            {t.name} *
          </Label>
          <Input
            id={`${title}-name`}
            value={partner.name}
            onChange={(e) => setPartner({ ...partner, name: e.target.value })}
            placeholder={isHi ? "पूरा नाम दर्ज करें" : "Enter full name"}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${title}-date`} className={isHi ? 'font-hindi' : ''}>
            {t.dateOfBirth} *
          </Label>
          <Input
            id={`${title}-date`}
            type="date"
            value={partner.dateOfBirth}
            onChange={(e) => setPartner({ ...partner, dateOfBirth: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${title}-time`} className={isHi ? 'font-hindi' : ''}>
            {t.timeOfBirth} *
          </Label>
          <Input
            id={`${title}-time`}
            type="time"
            value={partner.timeOfBirth}
            onChange={(e) => setPartner({ ...partner, timeOfBirth: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`${title}-place`} className={isHi ? 'font-hindi' : ''}>
            {t.placeOfBirth} *
          </Label>
          <Input
            id={`${title}-place`}
            value={partner.placeOfBirth}
            onChange={(e) => setPartner({ ...partner, placeOfBirth: e.target.value })}
            placeholder={isHi ? "जन्म स्थान दर्ज करें" : "Enter birth place"}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEO
        title="Kundli Milan - Marriage Compatibility"
        description="Check marriage compatibility with accurate Kundli Milan (36 Guna matching). Get detailed Ashtakuta analysis, dosha detection, and remedies."
        keywords="kundli milan, gun milan, marriage compatibility, ashtakuta, 36 guna, nadi dosha, bhakoot dosha"
        canonical="/matchmaking"
      />
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
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

        {/* Week 10 Complete Note */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className={cn('font-semibold text-green-900 dark:text-green-100 mb-1', isHi && 'font-hindi')}>
                {isHi ? 'सप्ताह 10 पूर्ण - पूर्ण कुंडली मिलान' : 'Week 10 Complete - Full Kundali Milan'}
              </h3>
              <p className={cn('text-sm text-green-800 dark:text-green-200', isHi && 'font-hindi')}>
                {isHi 
                  ? 'पूर्ण 36-अंक अष्टकूट प्रणाली सभी 8 श्रेणियों के साथ कार्यान्वित। पारंपरिक वैदिक विवाह अनुकूलता विश्लेषण।'
                  : 'Complete 36-point Ashtakuta system implemented with all 8 categories. Traditional Vedic marriage compatibility analysis.'
                }
              </p>
              <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                <span className={isHi ? 'font-hindi' : ''}>
                  {isHi ? 'सभी श्रेणियां:' : 'All Categories:'} 
                </span>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <div>
                    <div>1. {isHi ? 'वर्ण (1 अंक)' : 'Varna (1 point)'}</div>
                    <div>2. {isHi ? 'वश्य (2 अंक)' : 'Vashya (2 points)'}</div>
                    <div>3. {isHi ? 'तारा (3 अंक)' : 'Tara (3 points)'}</div>
                    <div>4. {isHi ? 'योनि (4 अंक)' : 'Yoni (4 points)'}</div>
                  </div>
                  <div>
                    <div>5. {isHi ? 'ग्रह मैत्री (5 अंक)' : 'Graha Maitri (5 points)'}</div>
                    <div>6. {isHi ? 'गण (6 अंक)' : 'Gana (6 points)'}</div>
                    <div>7. {isHi ? 'भकूट (7 अंक)' : 'Bhakoot (7 points)'}</div>
                    <div>8. {isHi ? 'नाड़ी (8 अंक)' : 'Nadi (8 points)'}</div>
                  </div>
                </div>
                <div className="mt-2 font-semibold">
                  {isHi ? 'कुल: 36 अंक (पूर्ण प्रणाली)' : 'Total: 36 points (Complete System)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!report ? (
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

            {/* Partner Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PartnerForm
                partner={malePartner}
                setPartner={setMalePartner}
                title={t.malePartner}
                bgColor="border-blue-200"
              />
              <PartnerForm
                partner={femalePartner}
                setPartner={setFemalePartner}
                title={t.femalePartner}
                bgColor="border-pink-200"
              />
            </div>

            {/* Calculate Button */}
            <div className="text-center">
              <Button
                onClick={handleCalculate}
                disabled={loading}
                size="lg"
                className={cn('px-8', isHi && 'font-hindi')}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.calculating}
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    {t.calculate}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* New Match Button */}
            <div className="text-center">
              <Button
                onClick={handleNewMatch}
                variant="outline"
                className={isHi ? 'font-hindi' : ''}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t.newMatch}
              </Button>
            </div>

            {/* Compatibility Report */}
            <CompatibilityReportComponent
              report={report}
              malePartner={malePartner}
              femalePartner={femalePartner}
              lang={lang}
            />
          </div>
        )}
      </main>
    </div>
    </>
  );
};

export default MatchMaking;