/**
 * BV Raman Page - 50+ Years of Astrological Wisdom
 * BV Raman Magazine Enhancement Plan Implementation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Calendar, Award, Users, Star, Clock } from 'lucide-react';
import VedhaAnalysisCard from '@/components/VedhaAnalysisCard';
import AshtakavargaTransitOverlay from '@/components/AshtakavargaTransitOverlay';

export default function BV_RamanPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const isHi = lang === 'hi';

  const [activeTab, setActiveTab] = useState<'overview' | 'vedha' | 'ashtakavarga' | 'magazine'>('overview');

  // Sample transit data for demonstration
  const sampleTransitHouses = {
    Sun: 8, Moon: 5, Mars: 3, Mercury: 2, Jupiter: 11,
    Venus: 9, Saturn: 12, Rahu: 6, Ketu: 4
  };

  const sampleTransitingPlanets = [
    { planet: 'Sun', house: 8 },
    { planet: 'Moon', house: 5 },
    { planet: 'Mars', house: 3 },
    { planet: 'Mercury', house: 2 },
    { planet: 'Jupiter', house: 11 },
    { planet: 'Venus', house: 9 },
    { planet: 'Saturn', house: 12 },
    { planet: 'Rahu', house: 6 },
    { planet: 'Ketu', house: 4 }
  ];

  const magazineHistory = [
    {
      year: '1936-1957',
      title: isHi ? 'प्रारंभिक काल' : 'Early Period',
      description: isHi 
        ? 'बी.एस. सूर्यनारायण राव द्वारा स्थापित, मूल सिद्धांत'
        : 'Founded by B.S. Suryanarain Rao, foundational principles'
    },
    {
      year: '1957-1977',
      title: isHi ? 'शास्त्रीय विकास' : 'Classical Development',
      description: isHi 
        ? 'गोचर मूल, वेध सिद्धांत, अष्टकवर्ग मूल'
        : 'Gochar basics, Vedha principles, Ashtakavarga foundations'
    },
    {
      year: '1977-1997',
      title: isHi ? 'विस्तारित अनुप्रयोग' : 'Expanded Applications',
      description: isHi 
        ? 'जैमिनी कारकांश, शब्दाला, वार्षिक फल'
        : 'Jaimini Karakamsha, Shadbala, Varshaphal'
    },
    {
      year: '1997-2007',
      title: isHi ? 'आधुनिक एकीकरण' : 'Modern Integration',
      description: isHi 
        ? 'केपी प्रणाली, चिकित्सक ज्योतिष, वैश्विक तुलना'
        : 'KP System, Medical astrology, Global comparisons'
    }
  ];

  const keyContributions = [
    {
      icon: <Star className="w-5 h-5" />,
      title: isHi ? 'विपरीत वेध' : 'Vipreet Vedha',
      description: isHi 
        ? 'पुरुष द्वारा विपरीत वेध का विकास - नरक ग्रह बाधा रद्द करते हैं'
        : 'Reverse obstruction by malefics - cancels obstructions'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: isHi ? 'अष्टकवर्ग विश्लेषण' : 'Ashtakavarga Analysis',
      description: isHi 
        ? 'सार्वाष्टकवर्ग स्कोर आधारित गोचर शक्ति मूल्यांकन'
        : 'Transit strength evaluation based on SAV scores'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: isHi ? 'वर्षफल प्रणाली' : 'Varshaphal System',
      description: isHi 
        ? 'वार्षिक सौर प्रत्यागमन विश्लेषण और भविष्यवाणी'
        : 'Annual solar return analysis and predictions'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: isHi ? 'वैज्ञानिक दृष्टिकोण' : 'Scientific Approach',
      description: isHi 
        ? 'प्रयोगात्मक विधियों और सांख्यिकीय विश्लेषण'
        : 'Empirical methods and statistical analysis'
    }
  ];

  const contemporaryRelevance = [
    {
      area: isHi ? 'शैक्षिक ज्योतिष' : 'Educational Astrology',
      impact: isHi 
        ? 'आधुनिक शिक्षा प्रणालियों में ज्योतिष का एकीकरण'
        : 'Integration of astrology in modern education systems'
    },
    {
      area: isHi ? 'अनुसंधान प्रक्रिया' : 'Research Methodology',
      impact: isHi 
        ? 'ज्योतिष अनुसंधान के लिए मानक प्रक्रियाएं'
        : 'Standardized procedures for astrological research'
    },
    {
      area: isHi ? 'वैश्विक मान्यता' : 'Global Recognition',
      impact: isHi 
        ? 'पश्चिमी ज्योतिष के साथ तुलनात्मक अध्ययन'
        : 'Comparative studies with Western astrology'
    },
    {
      area: isHi ? 'तकनीकी एकीकरण' : 'Technical Integration',
      impact: isHi 
        ? 'आधुनिक तकनीक के साथ पारंपरिक ज्ञान'
        : 'Traditional wisdom with modern technology'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="w-8 h-8 text-purple-600" />
            <h1 className={`text-4xl font-bold text-purple-800 dark:text-purple-300 ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'बी.वी. रमण - 50+ वर्षों का ज्योतिष ज्ञान' : 'B.V. Raman - 50+ Years of Astrological Wisdom'}
            </h1>
          </div>
          <p className={`text-lg text-muted-foreground mb-4 ${isHi ? 'font-hindi' : ''}`}>
            {isHi 
              ? 'द एस्ट्रोलॉजिकल मैगज़ीन (1936-2007) की 70 वर्षों की विरासत'
              : '70-year legacy of The Astrological Magazine (1936-2007)'}
          </p>
          <div className="flex justify-center gap-2">
            <Badge className="bg-purple-600 text-white">
              {isHi ? '1936-2007' : '1936-2007'}
            </Badge>
            <Badge className="bg-indigo-600 text-white">
              {isHi ? '70 वर्ष' : '70 Years'}
            </Badge>
            <Badge className="bg-blue-600 text-white">
              {isHi ? 'विश्व प्रसिद्ध' : 'World Renowned'}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'अवलोकन' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="vedha" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'विपरीत वेध' : 'Vipreet Vedha'}
            </TabsTrigger>
            <TabsTrigger value="ashtakavarga" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'अष्टकवर्ग' : 'Ashtakavarga'}
            </TabsTrigger>
            <TabsTrigger value="magazine" className={isHi ? 'font-hindi' : ''}>
              {isHi ? 'पत्रिका' : 'Magazine'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Contributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyContributions.map((contribution, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {contribution.icon}
                      </div>
                      {contribution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {contribution.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contemporary Relevance */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                  <Clock className="w-5 h-5" />
                  {isHi ? 'समकालीन प्रासंगिकता' : 'Contemporary Relevance'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contemporaryRelevance.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className={`font-medium mb-2 ${isHi ? 'font-hindi' : ''}`}>
                        {item.area}
                      </h4>
                      <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                        {item.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vedha Tab */}
          <TabsContent value="vedha" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'विपरीत वेध विश्लेषण' : 'Vipreet Vedha Analysis'}
                </CardTitle>
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? 'नरक ग्रह द्वारा बाधा रद्द करने की अद्वितीय प्रक्रिया'
                    : 'Unique process of obstruction cancellation by malefic planets'}
                </p>
              </CardHeader>
              <CardContent>
                <VedhaAnalysisCard 
                  transitHouses={sampleTransitHouses} 
                  lang={lang} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ashtakavarga Tab */}
          <TabsContent value="ashtakavarga" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'अष्टकवर्ग गोचर शक्ति' : 'Ashtakavarga Transit Strength'}
                </CardTitle>
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? 'सार्वाष्टकवर्ग स्कोर आधारित गोचर प्रभाव मूल्यांकन'
                    : 'Transit impact evaluation based on Sarvashtakavarga scores'}
                </p>
              </CardHeader>
              <CardContent>
                <AshtakavargaTransitOverlay
                  transitingPlanets={sampleTransitingPlanets}
                  lang={lang}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Magazine Tab */}
          <TabsContent value="magazine" className="space-y-6">
            {/* Magazine History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {magazineHistory.map((period, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className={`${isHi ? 'font-hindi' : ''}`}>
                      {period.title}
                    </CardTitle>
                    <Badge variant="outline">{period.year}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                      {period.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Magazine Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className={`${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'पत्रिका आंकड़े' : 'Magazine Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">70</div>
                    <div className="text-sm text-muted-foreground">
                      {isHi ? 'वर्ष प्रकाशन' : 'Years Published'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-600">840+</div>
                    <div className="text-sm text-muted-foreground">
                      {isHi ? 'मासिक अंक' : 'Monthly Issues'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">50+</div>
                    <div className="text-sm text-muted-foreground">
                      {isHi ? 'योगदानकर्ता' : 'Contributors'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">1000+</div>
                    <div className="text-sm text-muted-foreground">
                      {isHi ? 'लेख' : 'Articles'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi 
              ? 'यह पृष्ठ बी.वी. रमण की 50+ वर्षों की ज्योतिष विरासत को समर्पित है, जिसे वेदिक राजकुमार प्लेटफॉर्म में एकीकृत किया गया है।'
              : 'This page is dedicated to B.V. Raman\'s 50+ years of astrological legacy, integrated into the Vedic Rajkumar platform.'}
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline">B.V. Raman</Badge>
            <Badge variant="outline">The Astrological Magazine</Badge>
            <Badge variant="outline">1936-2007</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
