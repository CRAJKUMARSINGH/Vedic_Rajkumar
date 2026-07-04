/**
 * Lucky Elements Page Component
 * 
 * Displays personalized lucky numbers and colors based on numerology
 * Week 21 - Thursday Implementation
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import {
  calculateAllNumerologyNumbers,
  getNumberMeaning,
  type NumerologyNumbers
} from '@/services/numerologySystemService';
import {
  calculateAllLuckyNumbers,
  getLuckyNumberRecommendations,
  isNumberLucky,
  type LuckyNumbersData
} from '@/services/luckyNumbersService';
import {
  calculateAllLuckyColors,
  getTodayColor,
  isColorLucky,
  type LuckyColorsData,
  type ColorData
} from '@/services/luckyColorsService';

export default function LuckyElementsPage() {
  const [birthDate, setBirthDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showResults, setShowResults] = useState(false);

  // Calculate all data when form is submitted
  const numerologyData = useMemo<NumerologyNumbers | null>(() => {
    if (!birthDate || !fullName) return null;
    const date = new Date(birthDate);
    return calculateAllNumerologyNumbers(date, fullName);
  }, [birthDate, fullName]);

  const luckyNumbersData = useMemo<LuckyNumbersData | null>(() => {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    return calculateAllLuckyNumbers(date);
  }, [birthDate]);

  const luckyColorsData = useMemo<LuckyColorsData | null>(() => {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    return calculateAllLuckyColors(date);
  }, [birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate && fullName) {
      setShowResults(true);
    }
  };

  const todayColor = getTodayColor();
  const currentYear = new Date().getFullYear();

  if (!showResults) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {language === 'en' ? 'Lucky Numbers & Colors' : 'भाग्यशाली अंक और रंग'}
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? 'Discover your personalized lucky elements based on numerology'
                : 'अंकशास्त्र के आधार पर अपने व्यक्तिगत भाग्यशाली तत्वों की खोज करें'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="birthDate">
                  {language === 'en' ? 'Birth Date' : 'जन्म तिथि'}
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullName">
                  {language === 'en' ? 'Full Name' : 'पूरा नाम'}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {language === 'en' ? 'Calculate Lucky Elements' : 'भाग्यशाली तत्वों की गणना करें'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                >
                  {language === 'en' ? 'हिंदी' : 'English'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!numerologyData || !luckyNumbersData || !luckyColorsData) {
    return null;
  }

  const lifePathMeaning = getNumberMeaning(numerologyData.lifePathNumber);
  const recommendations = getLuckyNumberRecommendations(numerologyData.lifePathNumber);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'en' ? 'Your Lucky Elements' : 'आपके भाग्यशाली तत्व'}
          </h1>
          <p className="text-muted-foreground">
            {fullName} • {new Date(birthDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowResults(false)}>
            {language === 'en' ? 'Back' : 'वापस'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
        </div>
      </div>

      {/* Numerology Overview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Your Numerology Profile' : 'आपकी अंकशास्त्र प्रोफ़ाइल'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-4xl font-bold text-primary">{numerologyData.lifePathNumber}</div>
              <div className="text-sm mt-2">
                {language === 'en' ? 'Life Path' : 'जीवन पथ'}
              </div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-4xl font-bold text-secondary">{numerologyData.destinyNumber}</div>
              <div className="text-sm mt-2">
                {language === 'en' ? 'Destiny' : 'भाग्य'}
              </div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-4xl font-bold">{numerologyData.soulUrgeNumber}</div>
              <div className="text-sm mt-2">
                {language === 'en' ? 'Soul Urge' : 'आत्मा की इच्छा'}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-4xl font-bold">{numerologyData.personalityNumber}</div>
              <div className="text-sm mt-2">
                {language === 'en' ? 'Personality' : 'व्यक्तित्व'}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">
              {lifePathMeaning.title[language]} ({language === 'en' ? 'Life Path' : 'जीवन पथ'} {numerologyData.lifePathNumber})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>{language === 'en' ? 'Strengths:' : 'शक्तियां:'}</strong>
                <ul className="list-disc list-inside">
                  {lifePathMeaning.strengths[language].map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>{language === 'en' ? 'Career:' : 'करियर:'}</strong>
                <ul className="list-disc list-inside">
                  {lifePathMeaning.career[language].slice(0, 3).map((career, i) => (
                    <li key={i}>{career}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Numbers and Colors */}
      <Tabs defaultValue="numbers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="numbers">
            {language === 'en' ? 'Lucky Numbers' : 'भाग्यशाली अंक'}
          </TabsTrigger>
          <TabsTrigger value="colors">
            {language === 'en' ? 'Lucky Colors' : 'भाग्यशाली रंग'}
          </TabsTrigger>
          <TabsTrigger value="calendar">
            {language === 'en' ? 'Calendar' : 'कैलेंडर'}
          </TabsTrigger>
          <TabsTrigger value="usage">
            {language === 'en' ? 'Usage Guide' : 'उपयोग गाइड'}
          </TabsTrigger>
        </TabsList>

        {/* Lucky Numbers Tab */}
        <TabsContent value="numbers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Your Lucky Numbers' : 'आपके भाग्यशाली अंक'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Lucky Numbers */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Primary Lucky Numbers' : 'प्राथमिक भाग्यशाली अंक'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {luckyNumbersData.primaryLuckyNumbers.map(num => (
                    <div
                      key={num}
                      className="w-16 h-16 flex items-center justify-center bg-green-100 text-green-800 rounded-lg text-2xl font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Lucky Numbers */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Secondary Lucky Numbers' : 'द्वितीयक भाग्यशाली अंक'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {luckyNumbersData.secondaryLuckyNumbers.map(num => (
                    <div
                      key={num}
                      className="w-16 h-16 flex items-center justify-center bg-blue-100 text-blue-800 rounded-lg text-2xl font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlucky Numbers */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Numbers to Avoid' : 'बचने योग्य अंक'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {luckyNumbersData.unluckyNumbers.map(num => (
                    <div
                      key={num}
                      className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-800 rounded-lg text-2xl font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorable Dates */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Favorable Dates (Monthly)' : 'अनुकूल तिथियां (मासिक)'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {luckyNumbersData.favorableDates.map(date => (
                    <Badge key={date} variant="secondary">
                      {date}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Lucky Times */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Lucky Times of Day' : 'दिन के भाग्यशाली समय'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {luckyNumbersData.luckyTimes.map((time, i) => (
                    <Badge key={i} variant="outline">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Number Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Number Recommendations' : 'अंक सिफारिशें'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">{rec.purpose}</h4>
                    <div className="flex gap-2 mb-2">
                      {rec.numbers.map(num => (
                        <Badge key={num} variant="default">{num}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.description[language]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lucky Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Your Lucky Colors' : 'आपके भाग्यशाली रंग'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Today's Color */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? "Today's Color" : 'आज का रंग'}
                </h3>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-lg border-4 border-white shadow-lg"
                    style={{ backgroundColor: todayColor.hex }}
                  />
                  <div>
                    <div className="font-semibold text-lg">{todayColor.name[language]}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Planet:' : 'ग्रह:'} {todayColor.planet}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {todayColor.effects[language].slice(0, 3).map((effect, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Colors */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Primary Lucky Colors' : 'प्राथमिक भाग्यशाली रंग'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {luckyColorsData.primaryColors.map((color, i) => (
                    <ColorCard key={i} color={color} language={language} />
                  ))}
                </div>
              </div>

              {/* Secondary Colors */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Secondary Lucky Colors' : 'द्वितीयक भाग्यशाली रंग'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {luckyColorsData.secondaryColors.map((color, i) => (
                    <ColorCard key={i} color={color} language={language} />
                  ))}
                </div>
              </div>

              {/* Colors to Avoid */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Colors to Minimize' : 'कम करने योग्य रंग'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {luckyColorsData.avoidColors.map((color, i) => (
                    <ColorCard key={i} color={color} language={language} avoid />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {language === 'en' ? `Lucky Days Calendar ${currentYear}` : `भाग्यशाली दिन कैलेंडर ${currentYear}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(luckyNumbersData.monthlyLuckyDays).map(([month, dates]) => (
                  <div key={month} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">{month}</h4>
                    <div className="flex flex-wrap gap-1">
                      {dates.slice(0, 10).map(date => (
                        <Badge key={date} variant="secondary" className="text-xs">
                          {date}
                        </Badge>
                      ))}
                      {dates.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{dates.length - 10}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Colors */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Daily Colors (By Weekday)' : 'दैनिक रंग (सप्ताह के दिन)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(luckyColorsData.dailyColors).map(([day, color]) => (
                  <div key={day} className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold mb-2">{day}</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded border-2 border-white shadow"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-sm">{color.name[language]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Guide Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Color Usage Guide' : 'रंग उपयोग गाइड'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {luckyColorsData.usageRecommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">{rec.category}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {rec.colors.map((colorName, j) => {
                        const colorData = luckyColorsData.primaryColors.find(
                          c => c.name.en === colorName
                        ) || luckyColorsData.secondaryColors.find(
                          c => c.name.en === colorName
                        );
                        return colorData ? (
                          <div key={j} className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: colorData.hex }}
                            />
                            <span className="text-sm">{colorData.name[language]}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.description[language]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for color cards
function ColorCard({ 
  color, 
  language, 
  avoid = false 
}: { 
  color: ColorData; 
  language: 'en' | 'hi'; 
  avoid?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border-2 ${avoid ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-16 h-16 rounded-lg border-4 border-white shadow-lg"
          style={{ backgroundColor: color.hex }}
        />
        <div>
          <div className="font-semibold">{color.name[language]}</div>
          <div className="text-xs text-muted-foreground">
            {language === 'en' ? 'Planet:' : 'ग्रह:'} {color.planet}
          </div>
          <div className="text-xs text-muted-foreground">
            {language === 'en' ? 'Element:' : 'तत्व:'} {color.element}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {color.effects[language].slice(0, 3).map((effect, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {effect}
          </Badge>
        ))}
      </div>
    </div>
  );
}
