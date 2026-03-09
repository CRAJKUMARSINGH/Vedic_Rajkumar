import React, { useState } from 'react';
import { generateManglikReport, ManglikReport } from '../data/manglikData';
import { generateSadeSatiReport, SadeSatiReport } from '../data/sadeSatiData';
import { generateKaalSarpReport, KaalSarpReport } from '../data/kaalSarpData';
import { generateCareerReport, CareerReport } from '../data/careerData';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, AlertTriangle, CheckCircle, Heart, Shield, Star, Target, BookOpen, Home, Gem, Clock, Users, TrendingUp } from 'lucide-react';

interface ComprehensiveReportProps {
  isHindi: boolean;
}

type ReportType = 'manglik' | 'sadesati' | 'kaalsarp' | 'career' | 'all';

export const ComprehensiveReportForm: React.FC<ComprehensiveReportProps> = ({ isHindi }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [ascendant, setAscendant] = useState('');
  const [marsHouse, setMarsHouse] = useState('');
  const [saturnPosition, setSaturnPosition] = useState('');
  const [rahuHouse, setRahuHouse] = useState('');
  const [ketuHouse, setKetuHouse] = useState('');
  const [reportType, setReportType] = useState<ReportType>('all');
  const [loading, setLoading] = useState(false);
  
  const [reports, setReports] = useState<{
    manglik?: ManglikReport;
    sadesati?: SadeSatiReport;
    kaalsarp?: KaalSarpReport;
    career?: CareerReport;
  }>({});

  const handleGenerateReports = async () => {
    if (!name || !birthDate || !moonSign || !ascendant) {
      alert(isHindi ? 'कृपया बुनियादी जानकारी भरें' : 'Please fill basic information');
      return;
    }

    setLoading(true);
    try {
      const moonSignIndex = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].indexOf(moonSign);
      const ascendantIndex = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].indexOf(ascendant);
      const date = new Date(birthDate);
      
      const newReports: typeof reports = {};

      // Generate reports based on selection
      if (reportType === 'all' || reportType === 'manglik') {
        if (marsHouse) {
          newReports.manglik = generateManglikReport(name, date, moonSign, ascendant, parseInt(marsHouse));
        }
      }

      if (reportType === 'all' || reportType === 'sadesati') {
        if (saturnPosition) {
          newReports.sadesati = generateSadeSatiReport(name, date, moonSign, parseInt(saturnPosition));
        }
      }

      if (reportType === 'all' || reportType === 'kaalsarp') {
        if (rahuHouse && ketuHouse) {
          newReports.kaalsarp = generateKaalSarpReport(name, date, moonSignIndex, parseInt(rahuHouse), parseInt(ketuHouse));
        }
      }

      if (reportType === 'all' || reportType === 'career') {
        newReports.career = generateCareerReport(name, date, moonSignIndex, ascendantIndex);
      }

      setReports(newReports);
    } catch (error) {
      console.error('Error generating reports:', error);
      alert(isHindi ? 'रिपोर्ट जेनरेट करने में त्रुटि' : 'Error generating reports');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (hasCondition: boolean) => {
    return hasCondition ? "text-red-600" : "text-green-600";
  };

  if (Object.keys(reports).length > 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isHindi ? 'व्यापक ज्योतिष रिपोर्ट' : 'Comprehensive Astrology Report'}
          </h1>
          <p className="text-gray-600">
            {isHindi ? 'वैदिक ज्योतिष आधारित पूर्ण विश्लेषण' : 'Complete Vedic Astrology Analysis'}
          </p>
        </div>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="font-semibold">{isHindi ? 'नाम' : 'Name'}</Label>
                <p>{name}</p>
              </div>
              <div>
                <Label className="font-semibold">{isHindi ? 'जन्म तिथि' : 'Birth Date'}</Label>
                <p>{new Date(birthDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="font-semibold">{isHindi ? 'चंद्र राशि' : 'Moon Sign'}</Label>
                <p>{moonSign}</p>
              </div>
              <div>
                <Label className="font-semibold">{isHindi ? 'लग्न' : 'Ascendant'}</Label>
                <p>{ascendant}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.manglik && (
            <Card className={reports.manglik.hasManglikYoga ? "border-red-200" : "border-green-200"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${getStatusColor(reports.manglik.hasManglikYoga)}`} />
                  {isHindi ? 'मांगलिक योग' : 'Manglik Yoga'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={reports.manglik.hasManglikYoga ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                  {isHindi ? reports.manglik.manglikTypeHi : reports.manglik.manglikType}
                </Badge>
                <p className="mt-2 text-sm">
                  {isHindi ? 'विवाह संगतता' : 'Marriage Compatibility'}: 
                  <span className={`font-bold ${getScoreColor(reports.manglik.marriageCompatibility)}`}>
                    {reports.manglik.marriageCompatibility}/10
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {reports.sadesati && (
            <Card className={reports.sadesati.isCurrentlyInSadeSati ? "border-orange-200" : "border-green-200"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${getStatusColor(reports.sadesati.isCurrentlyInSadeSati)}`} />
                  {isHindi ? 'साढ़े साती' : 'Sade Sati'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={reports.sadesati.isCurrentlyInSadeSati ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}>
                  {isHindi ? reports.sadesati.sadeSatiPhaseHi : reports.sadesati.sadeSatiPhase}
                </Badge>
                <p className="mt-2 text-sm">
                  {isHindi ? 'प्रभाव' : 'Impact'}: 
                  <span className={`font-bold ${getScoreColor(reports.sadesati.overallImpact)}`}>
                    {reports.sadesati.overallImpact}/10
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {reports.kaalsarp && (
            <Card className={reports.kaalsarp.hasKaalSarpYoga ? "border-purple-200" : "border-green-200"}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className={`h-4 w-4 ${getStatusColor(reports.kaalsarp.hasKaalSarpYoga)}`} />
                  {isHindi ? 'काल सर्प योग' : 'Kaal Sarp Yoga'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={reports.kaalsarp.hasKaalSarpYoga ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}>
                  {isHindi ? reports.kaalsarp.yogaTypeHi : reports.kaalsarp.yogaType}
                </Badge>
                <p className="mt-2 text-sm">
                  {isHindi ? 'प्रभाव' : 'Impact'}: 
                  <span className={`font-bold ${getScoreColor(reports.kaalsarp.overallImpact)}`}>
                    {reports.kaalsarp.overallImpact}/10
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {reports.career && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  {isHindi ? 'करियर' : 'Career'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-blue-100 text-blue-800">
                  {isHindi ? 'विश्लेषण पूर्ण' : 'Analysis Complete'}
                </Badge>
                <p className="mt-2 text-sm">
                  {isHindi ? 'क्षमता' : 'Potential'}: 
                  <span className={`font-bold ${getScoreColor(reports.career.careerPotential)}`}>
                    {reports.career.careerPotential}/10
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Target className="h-4 w-4 mr-2" />
              {isHindi ? 'सारांश' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="remedies">
              <Shield className="h-4 w-4 mr-2" />
              {isHindi ? 'उपाय' : 'Remedies'}
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="h-4 w-4 mr-2" />
              {isHindi ? 'समय' : 'Timing'}
            </TabsTrigger>
            <TabsTrigger value="relationships">
              <Heart className="h-4 w-4 mr-2" />
              {isHindi ? 'रिश्ते' : 'Relationships'}
            </TabsTrigger>
            <TabsTrigger value="career">
              <TrendingUp className="h-4 w-4 mr-2" />
              {isHindi ? 'करियर' : 'Career'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.manglik && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'मांगलिक योग विश्लेषण' : 'Manglik Yoga Analysis'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'स्थिति' : 'Status'}:</strong> {isHindi ? reports.manglik.manglikTypeHi : reports.manglik.manglikType}</p>
                      <p><strong>{isHindi ? 'तीव्रता' : 'Intensity'}:</strong> {reports.manglik.intensity}/10</p>
                      <p><strong>{isHindi ? 'प्रभावित भाव' : 'Affected Houses'}:</strong> {reports.manglik.affectedHouses.join(', ')}</p>
                      <p><strong>{isHindi ? 'सलाह' : 'Advice'}:</strong> {isHindi ? reports.manglik.overallAdviceHi : reports.manglik.overallAdvice}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reports.sadesati && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'साढ़े साती विश्लेषण' : 'Sade Sati Analysis'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'चरण' : 'Phase'}:</strong> {isHindi ? reports.sadesati.sadeSatiPhaseHi : reports.sadesati.sadeSatiPhase}</p>
                      <p><strong>{isHindi ? 'प्रभाव' : 'Impact'}:</strong> {reports.sadesati.overallImpact}/10</p>
                      <p><strong>{isHindi ? 'शनि की स्थिति' : 'Saturn Position'}:</strong> {reports.sadesati.saturnPosition}</p>
                      <p><strong>{isHindi ? 'सफलता का समय' : 'Success Timeline'}:</strong> {isHindi ? reports.sadesati.successTimelineHi : reports.sadesati.successTimeline}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reports.kaalsarp && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'काल सर्प योग विश्लेषण' : 'Kaal Sarp Yoga Analysis'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'योग प्रकार' : 'Yoga Type'}:</strong> {isHindi ? reports.kaalsarp.yogaTypeHi : reports.kaalsarp.yogaType}</p>
                      <p><strong>{isHindi ? 'तीव्रता' : 'Intensity'}:</strong> {isHindi ? reports.kaalsarp.intensityHi : reports.kaalsarp.intensity}</p>
                      <p><strong>{isHindi ? '�ाहु स्थिति' : 'Rahu Position'}:</strong> {reports.kaalsarp.rahuPosition}</p>
                      <p><strong>{isHindi ? 'केतु स्थिति' : 'Ketu Position'}:</strong> {reports.kaalsarp.ketuPosition}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reports.career && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'करियर विश्लेषण' : 'Career Analysis'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'करियर क्षमता' : 'Career Potential'}:</strong> {reports.career.careerPotential}/10</p>
                      <p><strong>{isHindi ? 'व्यवसाय क्षमता' : 'Business Potential'}:</strong> {reports.career.businessPotential}/10</p>
                      <p><strong>{isHindi ? 'नौकरी क्षमता' : 'Job Potential'}:</strong> {reports.career.jobPotential}/10</p>
                      <p><strong>{isHindi ? 'सफलता की आयु' : 'Success Age'}:</strong> {isHindi ? reports.career.successAgeHi : reports.career.successAge}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="remedies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.manglik && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'मांगलिक उपाय' : 'Manglik Remedies'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(isHindi ? reports.manglik.remediesHi : reports.manglik.remedies).map((remedy, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {reports.sadesati && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'साढ़े साती उपाय' : 'Sade Sati Remedies'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(isHindi ? reports.sadesati.remediesHi : reports.sadesati.remedies).map((remedy, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {reports.kaalsarp && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'काल सर्प उपाय' : 'Kaal Sarp Remedies'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(isHindi ? reports.kaalsarp.generalRemediesHi : reports.kaalsarp.generalRemedies).map((remedy, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {reports.career && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'करियर उपाय' : 'Career Remedies'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(isHindi ? reports.career.remediesHi : reports.career.remedies).map((remedy, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.sadesati && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'साढ़े साती समय' : 'Sade Sati Timing'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'शिखर अवधि' : 'Peak Periods'}:</strong></p>
                      <ul className="space-y-1">
                        {(isHindi ? reports.sadesati.peakPeriodsHi : reports.sadesati.peakPeriods).map((period, index) => (
                          <li key={index} className="text-sm">• {period}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reports.career && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'करियर समय' : 'Career Timing'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>{isHindi ? 'अनुकूल अवधि' : 'Favorable Periods'}:</strong></p>
                      <ul className="space-y-1">
                        {(isHindi ? reports.career.favorablePeriodsHi : reports.career.favorablePeriods).map((period, index) => (
                          <li key={index} className="text-sm">• {period}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.manglik && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isHindi ? 'विवाह संगतता' : 'Marriage Compatibility'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(reports.manglik.marriageCompatibility)}`}>
                        {reports.manglik.marriageCompatibility}/10
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {reports.manglik.marriageCompatibility >= 8 ? (isHindi ? 'उत्कृष्ट' : 'Excellent') :
                         reports.manglik.marriageCompatibility >= 6 ? (isHindi ? 'अच्छा' : 'Good') :
                         (isHindi ? 'सावधानी आवश्यक' : 'Caution Required')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="career" className="space-y-4">
            {reports.career && (
              <Card>
                <CardHeader>
                  <CardTitle>{isHindi ? 'करियर विस्तृत विश्लेषण' : 'Detailed Career Analysis'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">{isHindi ? 'उपयुक्त क्षेत्र' : 'Suitable Fields'}</h4>
                      <div className="flex flex-wrap gap-1">
                        {(isHindi ? reports.career.suitableFieldsHi : reports.career.suitableFields).map((field, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{isHindi ? 'शक्तियां' : 'Strengths'}</h4>
                      <ul className="space-y-1">
                        {(isHindi ? reports.career.strengthsHi : reports.career.strengths).map((strength, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Star className="h-3 w-3 text-green-600 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button 
            onClick={() => {
              setReports({});
              setName('');
              setBirthDate('');
              setMoonSign('');
              setAscendant('');
              setMarsHouse('');
              setSaturnPosition('');
              setRahuHouse('');
              setKetuHouse('');
            }}
            variant="outline"
          >
            {isHindi ? 'नई रिपोर्ट जेनरेट करें' : 'Generate New Report'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isHindi ? 'व्यापक ज्योतिष रिपोर्ट' : 'Comprehensive Astrology Report'}
        </h1>
        <p className="text-gray-600">
          {isHindi ? 'सभी प्रमुख ज्योतिष विश्लेषण एक ही स्थान पर' : 'All major astrology analyses in one place'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isHindi ? 'ज्योतिष रिपोर्ट जेनरेटर' : 'Astrology Report Generator'}
          </CardTitle>
          <CardDescription>
            {isHindi ? 'अपनी जानकारी भरें और व्यापक विश्लेषण प्राप्त करें' : 'Fill your information and get comprehensive analysis'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{isHindi ? 'नाम' : 'Name'}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
              />
            </div>
            <div>
              <Label htmlFor="birthdate">{isHindi ? 'जन्म तिथि' : 'Birth Date'}</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="moonsign">{isHindi ? 'चंद्र राशि' : 'Moon Sign'}</Label>
              <Select value={moonSign} onValueChange={setMoonSign}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'चंद्र राशि चुनें' : 'Select Moon Sign'} />
                </SelectTrigger>
                <SelectContent>
                  {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map((sign) => (
                    <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ascendant">{isHindi ? 'लग्न' : 'Ascendant'}</Label>
              <Select value={ascendant} onValueChange={setAscendant}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'लग्न चुनें' : 'Select Ascendant'} />
                </SelectTrigger>
                <SelectContent>
                  {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map((sign) => (
                    <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <Label htmlFor="reporttype">{isHindi ? 'रिपोर्ट प्रकार' : 'Report Type'}</Label>
            <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder={isHindi ? 'रिपोर्ट प्रकार चुनें' : 'Select Report Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isHindi ? 'सभी रिपोर्ट' : 'All Reports'}</SelectItem>
                <SelectItem value="manglik">{isHindi ? 'केवल मांगलिक योग' : 'Manglik Yoga Only'}</SelectItem>
                <SelectItem value="sadesati">{isHindi ? 'केवल साढ़े साती' : 'Sade Sati Only'}</SelectItem>
                <SelectItem value="kaalsarp">{isHindi ? 'केवल काल सर्प योग' : 'Kaal Sarp Yoga Only'}</SelectItem>
                <SelectItem value="career">{isHindi ? 'केवल करियर' : 'Career Only'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Planetary Positions */}
          {(reportType === 'all' || reportType === 'manglik') && (
            <div>
              <Label htmlFor="marshouse">{isHindi ? 'मंगल का भाव' : 'Mars House'}</Label>
              <Select value={marsHouse} onValueChange={setMarsHouse}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'मंगल भाव चुनें' : 'Select Mars House'} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {isHindi ? `${i + 1}वां भाव` : `House ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(reportType === 'all' || reportType === 'sadesati') && (
            <div>
              <Label htmlFor="saturnposition">{isHindi ? 'शनि की स्थिति' : 'Saturn Position'}</Label>
              <Select value={saturnPosition} onValueChange={setSaturnPosition}>
                <SelectTrigger>
                  <SelectValue placeholder={isHindi ? 'शनि स्थिति चुनें' : 'Select Saturn Position'} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {isHindi ? `${i + 1}वां भाव` : `House ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(reportType === 'all' || reportType === 'kaalsarp') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rahuhouse">{isHindi ? 'राहु का भाव' : 'Rahu House'}</Label>
                <Select value={rahuHouse} onValueChange={setRahuHouse}>
                  <SelectTrigger>
                    <SelectValue placeholder={isHindi ? 'राहु भाव चुनें' : 'Select Rahu House'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {isHindi ? `${i + 1}वां भाव` : `House ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ketuhouse">{isHindi ? 'केतु का भाव' : 'Ketu House'}</Label>
                <Select value={ketuHouse} onValueChange={setKetuHouse}>
                  <SelectTrigger>
                    <SelectValue placeholder={isHindi ? 'केतु भाव चुनें' : 'Select Ketu House'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {isHindi ? `${i + 1}वां भाव` : `House ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerateReports}
            disabled={loading}
            className="w-full"
          >
            {loading ? (isHindi ? 'जेनरेट हो रहा है...' : 'Generating...') : 
             (isHindi ? 'व्यापक रिपोर्ट जेनरेट करें' : 'Generate Comprehensive Report')}
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
