import React, { useState } from 'react';
import { generateKaalSarpReport, KaalSarpReport } from '../data/kaalSarpData';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Gem, Heart, Home, Shield, Star, Target, Building, BookOpen } from 'lucide-react';

const HOUSES = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `House ${i + 1}`,
  labelHi: `${i + 1}वां भाव`,
  description: getHouseDescription(i + 1)
}));

function getHouseDescription(house: number): string {
  const descriptions = [
    "Self, Personality, Appearance",
    "Wealth, Family, Speech", 
    "Courage, Siblings, Communication",
    "Home, Mother, Property",
    "Children, Intelligence, Creativity",
    "Enemies, Health, Service",
    "Spouse, Partnership, Marriage",
    "Longevity, Inheritance, Research",
    "Father, Fortune, Higher Education",
    "Career, Status, Authority",
    "Gains, Income, Social Network",
    "Losses, Spirituality, Foreign Lands"
  ];
  return descriptions[house - 1] || "";
}

interface KaalSarpFormProps {
  isHindi: boolean;
}

export const KaalSarpForm: React.FC<KaalSarpFormProps> = ({ isHindi }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [rahuHouse, setRahuHouse] = useState('');
  const [ketuHouse, setKetuHouse] = useState('');
  const [report, setReport] = useState<KaalSarpReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!name || !birthDate || !moonSign || !rahuHouse || !ketuHouse) {
      alert(isHindi ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }

    // Validate Rahu and Ketu positions
    const rahuHouseNum = parseInt(rahuHouse);
    const ketuHouseNum = parseInt(ketuHouse);
    
    if (Math.abs(rahuHouseNum - ketuHouseNum) !== 6) {
      alert(isHindi ? 'राहु और केतु 6 भावों के अंतर पर होने चाहिए' : 'Rahu and Ketu must be 6 houses apart');
      return;
    }

    setLoading(true);
    try {
      const moonSignIndex = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].indexOf(moonSign);
      const date = new Date(birthDate);
      
      const kaalSarpReport = generateKaalSarpReport(name, date, moonSignIndex, rahuHouseNum, ketuHouseNum);
      setReport(kaalSarpReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(isHindi ? 'रिपोर्ट जेनरेट करने में त्रुटि' : 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Strong": return "text-red-600 bg-red-50";
      case "Moderate": return "text-yellow-600 bg-yellow-50";
      case "Mild": return "text-blue-600 bg-blue-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 5) return "text-yellow-600";
    return "text-green-600";
  };

  if (report) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isHindi ? 'काल सर्प योग रिपोर्ट' : 'Kaal Sarp Yoga Report'}
          </h1>
          <p className="text-gray-600">
            {isHindi ? 'वैदिक ज्योतिष आधारित काल सर्प योग विश्लेषण' : 'Vedic Astrology Based Kaal Sarp Yoga Analysis'}
          </p>
        </div>

        {/* Yoga Status Card */}
        <Card className={report.hasKaalSarpYoga ? "border-red-200" : "border-green-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {report.hasKaalSarpYoga ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {isHindi ? 'योग स्थिति' : 'Yoga Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  report.hasKaalSarpYoga 
                    ? "bg-red-100 text-red-800 border-red-300" 
                    : "bg-green-100 text-green-800 border-green-300"
                }`}
              >
                {report.hasKaalSarpYoga ? report.yogaType : report.yogaTypeHi}
              </Badge>
              <p className="mt-4 text-sm">
                {isHindi ? report.yogaDescriptionHi : report.yogaDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="font-semibold">{isHindi ? 'नाम' : 'Name'}</Label>
                <p>{report.name}</p>
              </div>
              <div>
                <Label className="font-semibold">{isHindi ? 'जन्म तिथि' : 'Birth Date'}</Label>
                <p>{report.dateOfBirth.toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="font-semibold">{isHindi ? 'चंद्र राशि' : 'Moon Sign'}</Label>
                <p>{report.moonSign}</p>
              </div>
              {report.hasKaalSarpYoga && (
                <>
                  <div>
                    <Label className="font-semibold">{isHindi ? 'राहु स्थिति' : 'Rahu Position'}</Label>
                    <p>{report.rahuPosition}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">{isHindi ? 'केतु स्थिति' : 'Ketu Position'}</Label>
                    <p>{report.ketuPosition}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">{isHindi ? 'तीव्रता' : 'Intensity'}</Label>
                    <p className={`font-semibold ${getIntensityColor(report.intensity)}`}>
                      {isHindi ? report.intensityHi : report.intensity}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {report.hasKaalSarpYoga && (
          <>
            {/* Overall Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {isHindi ? 'समग्र प्रभाव' : 'Overall Impact'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getImpactColor(report.overallImpact)}`}>
                      {report.overallImpact}/10
                    </div>
                    <p className="text-sm text-gray-600">
                      {isHindi ? 'प्रभाव स्तर' : 'Impact Level'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getImpactColor(report.mitigationPotential)}`}>
                      {report.mitigationPotential}/10
                    </div>
                    <p className="text-sm text-gray-600">
                      {isHindi ? 'शमन क्षमता' : 'Mitigation Potential'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {isHindi ? report.durationHi : report.duration}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isHindi ? 'अवधि' : 'Duration'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="effects" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="effects">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {isHindi ? 'प्रभाव' : 'Effects'}
                </TabsTrigger>
                <TabsTrigger value="timing">
                  <Clock className="h-4 w-4 mr-2" />
                  {isHindi ? 'समय' : 'Timing'}
                </TabsTrigger>
                <TabsTrigger value="remedies">
                  <Shield className="h-4 w-4 mr-2" />
                  {isHindi ? 'उपाय' : 'Remedies'}
                </TabsTrigger>
                <TabsTrigger value="mantras">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {isHindi ? 'मंत्र' : 'Mantras'}
                </TabsTrigger>
                <TabsTrigger value="temples">
                  <Building className="h-4 w-4 mr-2" />
                  {isHindi ? 'मंदिर' : 'Temples'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="effects" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">
                        {isHindi ? 'सकारात्मक प्रभाव' : 'Positive Effects'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.positiveEffectsHi : report.positiveEffects).map((effect, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{effect}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">
                        {isHindi ? 'नकारात्मक प्रभाव' : 'Negative Effects'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.negativeEffectsHi : report.negativeEffects).map((effect, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{effect}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isHindi ? 'प्रभावित जीवन क्षेत्र' : 'Life Areas Affected'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(isHindi ? report.lifeAreasAffectedHi : report.lifeAreasAffected).map((area, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isHindi ? 'शिखर अवधि' : 'Peak Periods'}
                    </CardTitle>
                    <CardDescription>
                      {isHindi ? 'जब काल सर्प योग का प्रभाव सबसे अधिक होता है' : 'When Kaal Sarp Yoga effects are strongest'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(isHindi ? report.peakPeriodsHi : report.peakPeriods).map((period, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{period}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="remedies" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isHindi ? 'सामान्य उपाय' : 'General Remedies'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.generalRemediesHi : report.generalRemedies).map((remedy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{remedy}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isHindi ? 'विशिष्ट उपाय' : 'Specific Remedies'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.specificRemediesHi : report.specificRemedies).map((remedy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{remedy}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gem className="h-5 w-5" />
                      {isHindi ? 'अनुकूल रत्न' : 'Suitable Gemstones'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(isHindi ? report.gemstonesHi : report.gemstones).map((gemstone, index) => (
                        <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                          {gemstone}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isHindi ? 'व्रत दिवस' : 'Fasting Days'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(isHindi ? report.fastingDaysHi : report.fastingDays).map((day, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <Star className="h-3 w-3 text-orange-600" />
                          {day}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mantras" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isHindi ? 'शक्तिशाली मंत्र' : 'Powerful Mantras'}
                    </CardTitle>
                    <CardDescription>
                      {isHindi ? 'नियमित जाप से शुभ फल प्राप्त होते हैं' : 'Regular chanting brings positive results'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(isHindi ? report.mantrasHi : report.mantras).map((mantra, index) => (
                        <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm font-medium text-orange-800">{mantra}</p>
                          <p className="text-xs text-orange-600 mt-1">
                            {isHindi ? 'प्रतिदिन 108 बार जाप करें' : 'Chant 108 times daily'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="temples" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isHindi ? 'शक्तिपीठ मंदिर' : 'Powerful Temples'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.templesHi : report.temples).map((temple, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Building className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{temple}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isHindi ? 'पूजा अनुशंसाएं' : 'Pooja Recommendations'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(isHindi ? report.poojaRecommendationsHi : report.poojaRecommendations).map((pooja, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Home className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{pooja}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Success Mantra */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">
                  {isHindi ? 'सफलता मंत्र' : 'Success Mantra'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg font-medium text-orange-700">
                  {isHindi ? report.successMantraHi : report.successMantra}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Overall Advice */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isHindi ? 'समग्र सलाह' : 'Overall Advice'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {isHindi ? report.overallAdviceHi : report.overallAdvice}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={() => setReport(null)}
            variant="outline"
          >
            {isHindi ? 'नई रिपोर्ट जेनरेट करें' : 'Generate New Report'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isHindi ? 'काल सर्प योग रिपोर्ट' : 'Kaal Sarp Yoga Report'}
        </h1>
        <p className="text-gray-600">
          {isHindi ? 'वैदिक ज्योतिष आधारित काल सर्प योग विश्लेषण' : 'Vedic Astrology Based Kaal Sarp Yoga Analysis'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isHindi ? 'काल सर्प योग जांच' : 'Kaal Sarp Yoga Check'}
          </CardTitle>
          <CardDescription>
            {isHindi ? 'अपनी कुंडली में काल सर्प योग का विश्लेषण करें' : 'Analyze Kaal Sarp Yoga in your birth chart'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">
              {isHindi ? 'नाम' : 'Name'}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
            />
          </div>

          <div>
            <Label htmlFor="birthdate">
              {isHindi ? 'जन्म तिथि' : 'Birth Date'}
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="moonsign">
              {isHindi ? 'चंद्र राशि' : 'Moon Sign'}
            </Label>
            <Select value={moonSign} onValueChange={setMoonSign}>
              <SelectTrigger>
                <SelectValue placeholder={isHindi ? 'चंद्र राशि चुनें' : 'Select Moon Sign'} />
              </SelectTrigger>
              <SelectContent>
                {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map((sign) => (
                  <SelectItem key={sign} value={sign}>
                    {sign}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rahuhouse">
                {isHindi ? 'राहु का भाव' : 'Rahu House'}
              </Label>
              <Select value={rahuHouse} onValueChange={setRahuHouse}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'राहु भाव चुनें' : 'Select Rahu House'} />
                </SelectTrigger>
                <SelectContent>
                  {HOUSES.map((house) => (
                    <SelectItem key={house.value} value={house.value.toString()}>
                      {isHindi ? house.labelHi : house.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ketuhouse">
                {isHindi ? 'केतु का भाव' : 'Ketu House'}
              </Label>
              <Select value={ketuHouse} onValueChange={setKetuHouse}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'केतु भाव चुनें' : 'Select Ketu House'} />
                </SelectTrigger>
                <SelectContent>
                  {HOUSES.map((house) => (
                    <SelectItem key={house.value} value={house.value.toString()}>
                      {isHindi ? house.labelHi : house.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">
              {isHindi ? 'महत्वपूर्ण नोट:' : 'Important Note:'}
            </p>
            <p>
              {isHindi ? 'राहु और केतु हमेशा 6 भावों के अंतर पर होते हैं (जैसे 1 और 7, 2 और 8, आदि)' : 
               'Rahu and Ketu are always 6 houses apart (like 1 and 7, 2 and 8, etc.)'}
            </p>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full"
          >
            {loading ? (isHindi ? 'जेनरेट हो रहा है...' : 'Generating...') : 
             (isHindi ? 'काल सर्प योग रिपोर्ट जेनरेट करें' : 'Generate Kaal Sarp Yoga Report')}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          {isHindi ? 'यह रिपोर्ट वैदिक ज्योतिष सिद्धांतों के आधार पर जेनरेट की गई है' : 
           'This report is generated based on Vedic astrology principles'}
        </p>
        <p>
          {isHindi ? 'केवल सूचनात्मक उद्देश्यों के लिए • MoonAstro प्रेरित' : 
           'For informational purposes only • Inspired by MoonAstro'}
        </p>
      </div>
    </div>
  );
};
