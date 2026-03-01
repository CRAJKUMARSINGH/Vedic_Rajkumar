import React, { useState } from 'react';
import { generateCareerReport, CareerReport } from '../data/careerData';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, Briefcase, TrendingUp, Users, Calendar, Star, Target } from 'lucide-react';

const RASHIS = [
  { en: "Aries", hi: "मेष", symbol: "♈" },
  { en: "Taurus", hi: "वृषभ", symbol: "♉" },
  { en: "Gemini", hi: "मिथुन", symbol: "♊" },
  { en: "Cancer", hi: "कर्क", symbol: "♋" },
  { en: "Leo", hi: "सिंह", symbol: "♌" },
  { en: "Virgo", hi: "कन्या", symbol: "♍" },
  { en: "Libra", hi: "तुला", symbol: "♎" },
  { en: "Scorpio", hi: "वृश्चिक", symbol: "♏" },
  { en: "Sagittarius", hi: "धनु", symbol: "♐" },
  { en: "Capricorn", hi: "मकर", symbol: "♑" },
  { en: "Aquarius", hi: "कुम्भ", symbol: "♒" },
  { en: "Pisces", hi: "मीन", symbol: "♓" },
];

interface CareerReportFormProps {
  isHindi: boolean;
}

export const CareerReportForm: React.FC<CareerReportFormProps> = ({ isHindi }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [ascendant, setAscendant] = useState('');
  const [report, setReport] = useState<CareerReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!name || !birthDate || !moonSign || !ascendant) {
      alert(isHindi ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const moonSignIndex = RASHIS.findIndex(r => r.en === moonSign);
      const ascendantIndex = RASHIS.findIndex(r => r.en === ascendant);
      const date = new Date(birthDate);
      
      const careerReport = generateCareerReport(name, date, moonSignIndex, ascendantIndex);
      setReport(careerReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(isHindi ? 'रिपोर्ट जेनरेट करने में त्रुटि' : 'Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (report) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isHindi ? 'करियर रिपोर्ट' : 'Career Report'}
          </h1>
          <p className="text-gray-600">
            {isHindi ? 'वैदिक ज्योतिष आधारित करियर विश्लेषण' : 'Vedic Astrology Based Career Analysis'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">
                  {isHindi ? 'नाम' : 'Name'}
                </Label>
                <p>{report.name}</p>
              </div>
              <div>
                <Label className="font-semibold">
                  {isHindi ? 'जन्म तिथि' : 'Birth Date'}
                </Label>
                <p>{report.dateOfBirth.toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="font-semibold">
                  {isHindi ? 'चंद्र राशि' : 'Moon Sign'}
                </Label>
                <p>{report.moonSign} ({isHindi ? report.moonSign : ''})</p>
              </div>
              <div>
                <Label className="font-semibold">
                  {isHindi ? 'लग्न' : 'Ascendant'}
                </Label>
                <p>{report.ascendant} ({isHindi ? report.ascendant : ''})</p>
              </div>
              <div>
                <Label className="font-semibold">
                  {isHindi ? 'सूर्य राशि' : 'Sun Sign'}
                </Label>
                <p>{report.sunSign}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {isHindi ? 'करियर क्षमता' : 'Career Potential'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(report.careerPotential)}>
                  {report.careerPotential}/10
                </span>
              </div>
              <div className="flex-1">
                <Badge className={getScoreBadge(report.careerPotential)}>
                  {report.careerPotential >= 8 ? (isHindi ? 'उत्कृष्ट' : 'Excellent') :
                   report.careerPotential >= 6 ? (isHindi ? 'अच्छा' : 'Good') :
                   (isHindi ? 'मध्यम' : 'Moderate')}
                </Badge>
                <p className="mt-2 text-sm text-gray-600">
                  {isHindi ? report.overallOutlookHi : report.overallOutlook}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="fields">
              <Briefcase className="h-4 w-4 mr-2" />
              {isHindi ? 'उपयुक्त क्षेत्र' : 'Suitable Fields'}
            </TabsTrigger>
            <TabsTrigger value="strengths">
              <Star className="h-4 w-4 mr-2" />
              {isHindi ? 'शक्तियां' : 'Strengths'}
            </TabsTrigger>
            <TabsTrigger value="influences">
              <TrendingUp className="h-4 w-4 mr-2" />
              {isHindi ? 'ग्रह प्रभाव' : 'Planetary Influences'}
            </TabsTrigger>
            <TabsTrigger value="houses">
              <Target className="h-4 w-4 mr-2" />
              {isHindi ? 'भाव विश्लेषण' : 'House Analysis'}
            </TabsTrigger>
            <TabsTrigger value="remedies">
              <AlertCircle className="h-4 w-4 mr-2" />
              {isHindi ? 'उपाय' : 'Remedies'}
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Calendar className="h-4 w-4 mr-2" />
              {isHindi ? 'समय' : 'Timing'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'उपयुक्त करियर क्षेत्र' : 'Suitable Career Fields'}
                </CardTitle>
                <CardDescription>
                  {isHindi ? 'आपके लिए सबसे उपयुक्त करियर विकल्प' : 'Most suitable career options for you'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {isHindi ? 'अनुशंसित क्षेत्र' : 'Recommended Fields'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(isHindi ? report.suitableFieldsHi : report.suitableFields).map((field, index) => (
                        <Badge key={index} variant="secondary">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'चुनौतियां' : 'Challenges'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(isHindi ? report.challengesHi : report.challenges).map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'सिफारिशें' : 'Recommendations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(isHindi ? report.recommendationsHi : report.recommendations).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strengths" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'आपकी शक्तियां' : 'Your Strengths'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(isHindi ? report.strengthsHi : report.strengths).map((strength, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Star className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influences" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">☉ {isHindi ? 'सूर्य' : 'Sun'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.sunInfluenceHi : report.sunInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">☽ {isHindi ? 'चंद्र' : 'Moon'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.moonInfluenceHi : report.moonInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">♂ {isHindi ? 'मंगल' : 'Mars'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.marsInfluenceHi : report.marsInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">☿ {isHindi ? 'बुध' : 'Mercury'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.mercuryInfluenceHi : report.mercuryInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">♃ {isHindi ? 'गुरु' : 'Jupiter'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.jupiterInfluenceHi : report.jupiterInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">♀ {isHindi ? 'शुक्र' : 'Venus'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.venusInfluenceHi : report.venusInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">♄ {isHindi ? 'शनि' : 'Saturn'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.saturnInfluenceHi : report.saturnInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">☊ {isHindi ? 'राहु' : 'Rahu'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.rahuInfluenceHi : report.rahuInfluence}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">☋ {isHindi ? 'केतु' : 'Ketu'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{isHindi ? report.ketuInfluenceHi : report.ketuInfluence}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="houses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'भाव-आधारित करियर विश्लेषण' : 'House-Based Career Analysis'}
                </CardTitle>
                <CardDescription>
                  {isHindi ? 'विभिन्न भावों का करियर पर प्रभाव' : 'Influence of different houses on career'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      {isHindi ? '10वां भाव (करियर)' : '10th House (Career)'}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {isHindi ? report.tenthHouseAnalysisHi : report.tenthHouseAnalysis}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      {isHindi ? '6ठा भाव (सेवा)' : '6th House (Service)'}
                    </h4>
                    <p className="text-sm text-green-700">
                      {isHindi ? report.sixthHouseAnalysisHi : report.sixthHouseAnalysis}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">
                      {isHindi ? '2रा भाव (धन)' : '2nd House (Wealth)'}
                    </h4>
                    <p className="text-sm text-purple-700">
                      {isHindi ? report.secondHouseAnalysisHi : report.secondHouseAnalysis}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">
                      {isHindi ? '11वां भाव (लाभ)' : '11th House (Gains)'}
                    </h4>
                    <p className="text-sm text-orange-700">
                      {isHindi ? report.eleventhHouseAnalysisHi : report.eleventhHouseAnalysis}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'व्यवसाय बनाम नौकरी' : 'Business vs Job'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.businessPotential}/10
                    </div>
                    <p className="text-sm text-gray-600">
                      {isHindi ? 'व्यवसाय क्षमता' : 'Business Potential'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {report.jobPotential}/10
                    </div>
                    <p className="text-sm text-gray-600">
                      {isHindi ? 'नौकरी क्षमता' : 'Job Potential'}
                    </p>
                  </div>
                </div>
                <p className="text-sm p-3 bg-gray-50 rounded-lg">
                  {isHindi ? report.businessVsJobAdviceHi : report.businessVsJobAdvice}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'वित्तीय संभावनाएं' : 'Financial Prospects'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">
                    {isHindi ? 'वित्तीय विकास' : 'Financial Growth'}
                  </h4>
                  <p className="text-sm p-3 bg-green-50 rounded-lg">
                    {isHindi ? report.financialGrowthHi : report.financialGrowth}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {isHindi ? 'निवेश सलाह' : 'Investment Advice'}
                  </h4>
                  <ul className="space-y-1">
                    {(isHindi ? report.investmentAdviceHi : report.investmentAdvice).map((advice, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remedies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'वैदिक उपाय' : 'Vedic Remedies'}
                </CardTitle>
                <CardDescription>
                  {isHindi ? 'ग्रहीय उपाय और समाधान' : 'Planetary remedies and solutions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">
                      {isHindi ? 'अनुशंसित उपाय' : 'Recommended Remedies'}
                    </h4>
                    <ul className="space-y-2">
                      {(isHindi ? report.remediesHi : report.remedies).map((remedy, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">
                      {isHindi ? 'अनुकूल रत्न' : 'Suitable Gemstones'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(isHindi ? report.gemstonesHi : report.gemstones).map((gemstone, index) => (
                        <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                          {gemstone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'वर्तमान दशा' : 'Current Dasha'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-center p-4 bg-orange-50 rounded-lg text-orange-800">
                  {isHindi ? report.currentDashaHi : report.currentDasha}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {isHindi ? 'अनुकूल अवधि' : 'Favorable Periods'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(isHindi ? report.favorablePeriodsHi : report.favorablePeriods).map((period, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{period}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    {isHindi ? 'सावधानी अवधि' : 'Caution Periods'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(isHindi ? report.cautionPeriodsHi : report.cautionPeriods).map((period, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{period}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isHindi ? 'सफलता की आयु' : 'Success Age'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-center p-4 bg-blue-50 rounded-lg text-blue-800">
                  🎯 {isHindi ? report.successAgeHi : report.successAge}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
          {isHindi ? 'करियर रिपोर्ट' : 'Career Report'}
        </h1>
        <p className="text-gray-600">
          {isHindi ? 'वैदिक ज्योतिष आधारित करियर विश्लेषण' : 'Vedic Astrology Based Career Analysis'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isHindi ? 'करियर रिपोर्ट जेनरेट करें' : 'Generate Career Report'}
          </CardTitle>
          <CardDescription>
            {isHindi ? 'अपनी जन्म कुंडली के आधार पर करियर विश्लेषण प्राप्त करें' : 'Get career analysis based on your birth chart'}
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
                {RASHIS.map((rashi) => (
                  <SelectItem key={rashi.en} value={rashi.en}>
                    {rashi.symbol} {rashi.en} ({rashi.hi})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ascendant">
              {isHindi ? 'लग्न (Ascendant)' : 'Ascendant'}
            </Label>
            <Select value={ascendant} onValueChange={setAscendant}>
              <SelectTrigger>
                <SelectValue placeholder={isHindi ? 'लग्न चुनें' : 'Select Ascendant'} />
              </SelectTrigger>
              <SelectContent>
                {RASHIS.map((rashi) => (
                  <SelectItem key={rashi.en} value={rashi.en}>
                    {rashi.symbol} {rashi.en} ({rashi.hi})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full"
          >
            {loading ? (isHindi ? 'जेनरेट हो रहा है...' : 'Generating...') : 
             (isHindi ? 'करियर रिपोर्ट जेनरेट करें' : 'Generate Career Report')}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          {isHindi ? 'यह रिपोर्ट वैदिक ज्योतिष सिद्धांतों के आधार पर जेनरेट की गई है' : 
           'This report is generated based on Vedic astrology principles'}
        </p>
        <p>
          {isHindi ? 'केवल सूचनात्मक उद्देश्यों के लिए' : 'For informational purposes only'}
        </p>
      </div>
    </div>
  );
};
