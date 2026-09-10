/**
 * MatchMaking.tsx — Kundali Milan (Marriage Compatibility)
 *
 * Week 6: Core Polish II
 *  - Inline ChartErrorState (persistent, not toast-only)
 *  - LoadingSkeleton during calculateAshtakuta()
 *  - ChartEmptyState before first calculation
 *  - aria-busy on submit button while loading
 *  - Focus management: result heading focused after calc
 *  - Removed dead imports (unused coordinate parser, unused lucide icons)
 *  - aria-live="polite" on result section (carried from Week 5)
 *  - Error clears when user edits any field
 */

import { useState, useRef, useEffect } from 'react';
import { Heart, Users, ArrowRight, Loader2, CheckCircle, Share2, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import ChartErrorState from '@/components/ChartErrorState';
import ChartEmptyState from '@/components/ChartEmptyState';
import CompatibilityReportComponent from '@/components/CompatibilityReport';
import EnhancedLanguageToggle from '@/components/EnhancedLanguageToggle';
import { ValidationInProgressNotice } from '@/components/PrototypeStatusBanner';
import { calculateAshtakuta, type PartnerData, type CompatibilityReport } from '@/services/ashtakutaService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import FamilyProfileSelector from '@/components/FamilyProfileSelector';
import { getProfileById } from '@/lib/familyProfiles';
import type { FamilyProfile } from '@/lib/familyProfiles';

// ─── Labels ───────────────────────────────────────────────────────────────────

const LABELS = {
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
    calculating: 'Calculating…',
    newMatch: 'New Match',
    sampleData: 'Load Sample Data',
    emptyTitle: 'Enter partner details',
    emptyDesc: "Fill in both partners' birth details above and click Calculate Compatibility. Tip: use the Family Profile buttons above each form to pre-fill a saved profile in one click.",
    resultHeading: 'Compatibility Result',
    errors: {
      fillAllFields: 'Please fill all required fields for both partners',
      calculationFailed: 'Compatibility calculation failed. Please check the data and try again.',
      invalidDate: 'Please enter valid dates in YYYY-MM-DD format',
      invalidTime: 'Please enter valid time in HH:MM format',
    },
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
    calculating: 'गणना हो रही है…',
    newMatch: 'नया मिलान',
    sampleData: 'नमूना डेटा',
    emptyTitle: 'साथी विवरण भरें',
    emptyDesc: 'दोनों साथियों का जन्म विवरण भरें और अनुकूलता की गणना करें पर क्लिक करें। सुझाव: एक क्लिक में सहेजी गई प्रोफ़ाइल पूर्व-भरने के लिए प्रत्येक फ़ॉर्म के ऊपर परिवार प्रोफ़ाइल बटन का उपयोग करें।',
    resultHeading: 'अनुकूलता परिणाम',
    errors: {
      fillAllFields: 'कृपया दोनों साझीदारों के लिए सभी आवश्यक फ़ील्ड भरें',
      calculationFailed: 'अनुकूलता गणना विफल हुई। कृपया डेटा जांचें और पुनः प्रयास करें।',
      invalidDate: 'कृपया YYYY-MM-DD प्रारूप में वैध तिथियां दर्ज करें',
      invalidTime: 'कृपया HH:MM प्रारूप में वैध समय दर्ज करें',
    },
  },
} as const;

// ─── PartnerForm sub-component ────────────────────────────────────────────────

interface PartnerFormProps {
  idPrefix: string;
  partner: PartnerData;
  setPartner: (p: PartnerData) => void;
  title: string;
  borderColor: string;
  isHi: boolean;
  t: typeof LABELS['en'] | typeof LABELS['hi'];
  onFieldChange: () => void;
}

function PartnerForm({
  idPrefix,
  partner,
  setPartner,
  title,
  borderColor,
  isHi,
  t,
  onFieldChange,
}: PartnerFormProps) {
  const update = (field: keyof PartnerData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPartner({ ...partner, [field]: e.target.value });
      onFieldChange();
    };

  return (
    <Card className={cn('border-2', borderColor)}>
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2 text-base', isHi && 'font-hindi')}>
          <Users className="h-4 w-4" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${idPrefix}-name`} className={isHi ? 'font-hindi' : ''}>
            {t.name} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}-name`}
            value={partner.name}
            onChange={update('name')}
            placeholder={isHi ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
            aria-required="true"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-date`} className={isHi ? 'font-hindi' : ''}>
            {t.dateOfBirth} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            value={partner.dateOfBirth}
            onChange={update('dateOfBirth')}
            aria-required="true"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-time`} className={isHi ? 'font-hindi' : ''}>
            {t.timeOfBirth} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}-time`}
            type="time"
            value={partner.timeOfBirth}
            onChange={update('timeOfBirth')}
            aria-required="true"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-place`} className={isHi ? 'font-hindi' : ''}>
            {t.placeOfBirth} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id={`${idPrefix}-place`}
            value={partner.placeOfBirth}
            onChange={update('placeOfBirth')}
            placeholder={isHi ? 'जन्म स्थान दर्ज करें' : 'Enter birth place'}
            aria-required="true"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const MatchMaking = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [malePartner, setMalePartner] = useState<PartnerData>({
    name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '',
  });
  const [femalePartner, setFemalePartner] = useState<PartnerData>({
    name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '',
  });
  const [selectedMaleProfileId, setSelectedMaleProfileId] = useState<string | undefined>();
  const [selectedFemaleProfileId, setSelectedFemaleProfileId] = useState<string | undefined>();

  const { toast } = useToast();
  const resultRef = useRef<HTMLHeadingElement>(null);
  const isHi = lang === 'hi';
  const t = LABELS[lang];

  // Focus result heading when report loads
  useEffect(() => {
    if (report) {
      resultRef.current?.focus();
    }
  }, [report]);

  // Clear inline error when user edits any field
  const handleFieldChange = () => {
    if (inlineError) setInlineError(null);
  };

  // Handle family profile selection for male partner
  const handleMaleProfileSelect = (profile: FamilyProfile) => {
    // Validate profile before using it to prevent data leakage
    const validatedProfile = getProfileById(profile.id);
    if (!validatedProfile) {
      setInlineError(isHi ? 'अमान्य प्रोफाइल चयनित' : 'Invalid profile selected');
      return;
    }
    
    setSelectedMaleProfileId(profile.id);
    setMalePartner({
      name: validatedProfile.name,
      dateOfBirth: validatedProfile.birthDate,
      timeOfBirth: validatedProfile.birthTime,
      placeOfBirth: validatedProfile.birthPlace,
    });
    if (inlineError) setInlineError(null);
  };

  // Handle family profile selection for female partner
  const handleFemaleProfileSelect = (profile: FamilyProfile) => {
    // Validate profile before using it to prevent data leakage
    const validatedProfile = getProfileById(profile.id);
    if (!validatedProfile) {
      setInlineError(isHi ? 'अमान्य प्रोफाइल चयनित' : 'Invalid profile selected');
      return;
    }
    
    setSelectedFemaleProfileId(profile.id);
    setFemalePartner({
      name: validatedProfile.name,
      dateOfBirth: validatedProfile.birthDate,
      timeOfBirth: validatedProfile.birthTime,
      placeOfBirth: validatedProfile.birthPlace,
    });
    if (inlineError) setInlineError(null);
  };

  const validateInputs = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (
      !malePartner.name || !malePartner.dateOfBirth ||
      !malePartner.timeOfBirth || !malePartner.placeOfBirth ||
      !femalePartner.name || !femalePartner.dateOfBirth ||
      !femalePartner.timeOfBirth || !femalePartner.placeOfBirth
    ) throw new Error(t.errors.fillAllFields);
    if (!dateRegex.test(malePartner.dateOfBirth) || !dateRegex.test(femalePartner.dateOfBirth))
      throw new Error(t.errors.invalidDate);
    if (!timeRegex.test(malePartner.timeOfBirth) || !timeRegex.test(femalePartner.timeOfBirth))
      throw new Error(t.errors.invalidTime);
  };

  const handleCalculate = async () => {
    setInlineError(null);
    try {
      validateInputs();
    } catch (validationErr) {
      setInlineError((validationErr as Error).message);
      return;
    }

    setLoading(true);
    try {
      const compatibilityReport = await calculateAshtakuta(malePartner, femalePartner);
      setReport(compatibilityReport);
      toast({
        title: isHi ? '✅ गणना पूर्ण' : '✅ Calculation Complete',
        description: isHi
          ? `अनुकूलता स्कोर: ${compatibilityReport.totalPoints}/${compatibilityReport.maxPoints}`
          : `Compatibility Score: ${compatibilityReport.totalPoints}/${compatibilityReport.maxPoints}`,
      });
    } catch (err) {
      const msg = (err as Error).message || t.errors.calculationFailed;
      setInlineError(msg);
      toast({ title: isHi ? '❌ गणना त्रुटि' : '❌ Calculation Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewMatch = () => {
    setReport(null);
    setInlineError(null);
    setMalePartner({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
    setFemalePartner({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
    setSelectedMaleProfileId(undefined);
    setSelectedFemaleProfileId(undefined);
  };

  const loadSampleData = () => {
    setInlineError(null);
    setMalePartner({ name: 'Rajkumar', dateOfBirth: '1963-09-15', timeOfBirth: '06:00', placeOfBirth: 'Aspur, Rajasthan' });
    setFemalePartner({ name: 'Priyanka', dateOfBirth: '1984-10-23', timeOfBirth: '05:50', placeOfBirth: 'Ahmedabad, Gujarat' });
    setSelectedMaleProfileId(undefined);
    setSelectedFemaleProfileId(undefined);
  };

  const handleRetry = () => {
    const allPresent =
      malePartner.name && malePartner.dateOfBirth &&
      malePartner.timeOfBirth && malePartner.placeOfBirth &&
      femalePartner.name && femalePartner.dateOfBirth &&
      femalePartner.timeOfBirth && femalePartner.placeOfBirth;
    if (allPresent) {
      void handleCalculate();
    } else {
      setInlineError(null);
      document.getElementById('male-name')?.focus();
    }
  };

  const handleCopyReport = async () => {
    if (!report) return;
    const summary =
      `Kundali Milan Report\n` +
      `Male: ${malePartner.name} (${malePartner.dateOfBirth})\n` +
      `Female: ${femalePartner.name} (${femalePartner.dateOfBirth})\n` +
      `Compatibility Score: ${report.totalPoints}/${report.maxPoints} (${report.percentage.toFixed(1)}%)\n` +
      `Overall Rating: ${report.overallCompatibility}\n` +
      `Generated by Vedic Rajkumar.`;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <SEO
        title="Kundli Milan - Marriage Compatibility"
        description="Check marriage compatibility with accurate Kundli Milan (36 Guna matching). Get detailed Ashtakuta analysis, dosha detection, and remedies."
        keywords="kundli milan, gun milan, marriage compatibility, ashtakuta, 36 guna, nadi dosha, bhakoot dosha"
        canonical="/matchmaking"
      />

      <div className="min-h-screen bg-background">
        {/* Page header */}
        <header className="border-b border-border bg-card">
          <div className="container max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Heart className="h-7 w-7 text-red-500" aria-hidden="true" />
              <div>
                <h1 className={cn('text-2xl font-bold text-primary', isHi && 'font-hindi')}>
                  {t.title}
                </h1>
                <p className={cn('text-sm text-muted-foreground', isHi && 'font-hindi')}>
                  {t.subtitle}
                </p>
              </div>
            </div>
            <EnhancedLanguageToggle
              currentLang={lang}
              onChange={(l) => setLang(l as 'en' | 'hi')}
              showRegion={false}
              autoDetect={false}
            />
          </div>
        </header>

        <main className="container max-w-6xl mx-auto px-4 py-8">
          {/* Description */}
          <p className={cn('text-center text-muted-foreground max-w-2xl mx-auto mb-8', isHi && 'font-hindi')}>
            {t.description}
          </p>

          {/* System completeness notice */}
          <div className="mb-6">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className={cn('font-semibold text-green-900 dark:text-green-100 mb-1 text-sm', isHi && 'font-hindi')}>
                    {isHi ? 'पूर्ण 36-अंक अष्टकूट प्रणाली' : 'Complete 36-point Ashtakuta System'}
                  </h2>
                  <p className={cn('text-xs text-green-800 dark:text-green-200', isHi && 'font-hindi')}>
                    {isHi
                      ? 'सभी 8 श्रेणियां: वर्ण (1) + वश्य (2) + तारा (3) + योनि (4) + ग्रह मैत्री (5) + गण (6) + भकूट (7) + नाड़ी (8) = 36'
                      : 'All 8 categories: Varna (1) + Vashya (2) + Tara (3) + Yoni (4) + Graha Maitri (5) + Gana (6) + Bhakoot (7) + Nadi (8) = 36'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <ValidationInProgressNotice isHi={isHi} compact={true} />
          </div>

          {/* Inline error — persistent, above the form */}
          {inlineError && (
            <ChartErrorState
              message={inlineError}
              onRetry={handleRetry}
              className="mb-6"
            />
          )}

          {!report ? (
            /* ── Input form ── */
            <section aria-labelledby="mm-form-heading">
              <h2 id="mm-form-heading" className="sr-only">Partner Details Form</h2>

              <div className="mb-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleData}
                  className={cn(isHi && 'font-hindi')}
                  aria-label={isHi ? 'नमूना डेटा लोड करें' : 'Load sample birth data'}
                >
                  {t.sampleData}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="secondary" className={cn('text-xs', isHi && 'font-hindi')}>
                      <Users className="h-3 w-3 inline mr-1" />
                      {isHi ? 'पुरुष साथी' : 'Male Partner'}
                    </Badge>
                    <FamilyProfileSelector
                      onSelect={handleMaleProfileSelect}
                      selectedId={selectedMaleProfileId}
                      triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
                      lang={lang}
                    />
                  </div>
                  <PartnerForm
                    idPrefix="male"
                    partner={malePartner}
                    setPartner={setMalePartner}
                    title={t.malePartner}
                    borderColor="border-blue-200"
                    isHi={isHi}
                    t={t}
                    onFieldChange={handleFieldChange}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant="secondary" className={cn('text-xs', isHi && 'font-hindi')}>
                      <Heart className="h-3 w-3 inline mr-1" />
                      {isHi ? 'महिला साथी' : 'Female Partner'}
                    </Badge>
                    <FamilyProfileSelector
                      onSelect={handleFemaleProfileSelect}
                      selectedId={selectedFemaleProfileId}
                      triggerLabel={isHi ? 'परिवार प्रोफ़ाइल' : 'Family Profile'}
                      lang={lang}
                    />
                  </div>
                  <PartnerForm
                    idPrefix="female"
                    partner={femalePartner}
                    setPartner={setFemalePartner}
                    title={t.femalePartner}
                    borderColor="border-pink-200"
                    isHi={isHi}
                    t={t}
                    onFieldChange={handleFieldChange}
                  />
                </div>
              </div>

              {/* Loading skeleton — diversified, previews CompatibilityReport layout */}
              {loading && (
                <div
                  role="status"
                  aria-live="polite"
                  className="space-y-4 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-hidden="true">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="h-[90px] animate-pulse rounded-lg border border-border bg-card"
                      />
                    ))}
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-[140px] animate-pulse rounded-xl border border-border bg-muted/30"
                  />
                  <LoadingSkeleton variant="card" rows={8} />
                </div>
              )}

              {/* Empty state — mutually exclusive with loading and error */}
              {!loading && !inlineError && (
                <ChartEmptyState
                  icon={<Heart className="h-8 w-8" />}
                  title={t.emptyTitle}
                  description={t.emptyDesc}
                  className="mb-6"
                />
              )}

              <div className="text-center">
                <Button
                  onClick={() => void handleCalculate()}
                  disabled={loading}
                  aria-busy={loading}
                  size="lg"
                  className={cn('px-8 gap-2', isHi && 'font-hindi')}
                  aria-label={loading
                    ? (isHi ? 'गणना हो रही है, कृपया प्रतीक्षा करें' : 'Calculating, please wait')
                    : (isHi ? 'अनुकूलता की गणना करें' : 'Calculate compatibility')}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {t.calculating}
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" aria-hidden="true" />
                      {t.calculate}
                    </>
                  )}
                </Button>
              </div>
            </section>
          ) : (
            /* ── Results ── */
            <section
              aria-labelledby="mm-result-heading"
              aria-live="polite"
              aria-atomic="false"
            >
              {/* Result heading — receives focus after calculation */}
              <h2
                id="mm-result-heading"
                ref={resultRef}
                tabIndex={-1}
                className={cn(
                  'text-xl font-bold text-foreground mb-4 flex items-center gap-2 outline-none',
                  isHi && 'font-hindi',
                )}
              >
                <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
                {t.resultHeading}
              </h2>

              <div className="mb-4 flex justify-start">
                <Button
                  onClick={handleNewMatch}
                  variant="outline"
                  size="sm"
                  className={cn('gap-2', isHi && 'font-hindi')}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  {t.newMatch}
                </Button>
              </div>

              <CompatibilityReportComponent
                report={report}
                malePartner={malePartner}
                femalePartner={femalePartner}
                lang={lang}
              />

              <div className="flex flex-wrap justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className={cn(isHi && 'font-hindi')}
                >
                  <MessageSquareQuote className="w-4 h-4 mr-2" />
                  {isHi ? 'रिपोर्ट प्रिंट करें' : 'Print Report'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyReport()}
                  className={cn(isHi && 'font-hindi')}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {copied
                    ? (isHi ? 'कॉपी हुआ' : 'Copied')
                    : (isHi ? 'कॉपी / शेयर' : 'Copy / Share')}
                </Button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default MatchMaking;
