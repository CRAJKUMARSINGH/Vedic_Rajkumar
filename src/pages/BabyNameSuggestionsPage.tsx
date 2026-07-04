/**
 * Baby Name Suggestions Page - Complete Naming Interface
 * Week 20: Baby Name Suggestions - Thursday Implementation
 * Comprehensive name search and selection tool with birth details input
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Baby, Heart, Star, Search, Filter, TrendingUp, Sparkles, Info } from 'lucide-react';
import { calculateBirthNakshatra, getNameSuggestions, type BirthDetails } from '@/services/namingLogicService';
import { getTopNameRecommendations, analyzeNameStrength, type BirthChartContext } from '@/services/nameAnalysisService';
import { type Gender, type BabyName } from '@/services/babyNameService';

export default function BabyNameSuggestionsPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [step, setStep] = useState<'input' | 'results'>('input');
  
  // Birth details state
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('boy');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  
  // Results state
  const [nakshatra, setNakshatra] = useState('');
  const [pada, setPada] = useState(0);
  const [luckyLetters, setLuckyLetters] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'strength' | 'popularity' | 'alphabetical'>('strength');
  const [minStrength, setMinStrength] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleCalculate = () => {
    if (!birthDate || !birthTime) {
      alert(language === 'en' ? 'Please enter birth date and time' : 'कृपया जन्म तिथि और समय दर्ज करें');
      return;
    }

    const birthDetails: BirthDetails = {
      date: new Date(birthDate),
      time: birthTime,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: 'Asia/Kolkata'
    };

    // Calculate nakshatra
    const nakshatraData = calculateBirthNakshatra(birthDetails);
    setNakshatra(nakshatraData.nakshatra);
    setPada(nakshatraData.pada);

    // Get name suggestions
    const suggestions = getNameSuggestions(birthDetails, gender, {
      sortBy: 'popularity',
      limit: 50
    });

    setLuckyLetters(suggestions.luckyLetters);

    // Get detailed recommendations
    const birthContext: BirthChartContext = {
      nakshatra: nakshatraData.nakshatra,
      pada: nakshatraData.pada,
      birthDate: birthDetails.date,
      rulingPlanet: suggestions.rulingPlanet
    };

    const topRecommendations = getTopNameRecommendations(
      suggestions.recommendedNames,
      birthContext,
      50
    );

    setRecommendations(topRecommendations);
    setStep('results');
  };

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rec =>
        rec.name.name.toLowerCase().includes(query) ||
        rec.name.meaning.en.toLowerCase().includes(query) ||
        rec.name.meaning.hi.includes(searchQuery)
      );
    }

    // Apply strength filter
    if (minStrength > 0) {
      filtered = filtered.filter(rec => rec.strengthAnalysis.overallStrength >= minStrength);
    }

    // Apply sorting
    if (sortBy === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.name.name.localeCompare(b.name.name));
    } else if (sortBy === 'popularity') {
      filtered = [...filtered].sort((a, b) => b.name.popularity - a.name.popularity);
    } else {
      filtered = [...filtered].sort((a, b) => b.strengthAnalysis.overallStrength - a.strengthAnalysis.overallStrength);
    }

    return filtered;
  }, [recommendations, searchQuery, minStrength, sortBy]);

  const toggleFavorite = (nameId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(nameId)) {
      newFavorites.delete(nameId);
    } else {
      newFavorites.add(nameId);
    }
    setFavorites(newFavorites);
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 85) return 'text-green-600';
    if (strength >= 75) return 'text-blue-600';
    if (strength >= 65) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 85) return 'default';
    if (strength >= 75) return 'secondary';
    if (strength >= 65) return 'outline';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Baby className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">
                {language === 'en' ? 'Baby Name Suggestions' : 'बच्चे के नाम सुझाव'}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
          </div>
          <CardDescription>
            {language === 'en'
              ? 'Find the perfect name based on birth nakshatra and numerology'
              : 'जन्म नक्षत्र और अंकशास्त्र के आधार पर सही नाम खोजें'}
          </CardDescription>
        </CardHeader>
      </Card>

      {step === 'input' ? (
        /* Birth Details Input */
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'en' ? 'Enter Birth Details' : 'जन्म विवरण दर्ज करें'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Provide accurate birth details for best name suggestions'
                : 'सर्वोत्तम नाम सुझावों के लिए सटीक जन्म विवरण प्रदान करें'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  {language === 'en' ? 'Birth Date' : 'जन्म तिथि'}
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthTime">
                  {language === 'en' ? 'Birth Time' : 'जन्म समय'}
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  {language === 'en' ? 'Gender' : 'लिंग'}
                </Label>
                <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">
                      {language === 'en' ? 'Boy' : 'लड़का'}
                    </SelectItem>
                    <SelectItem value="girl">
                      {language === 'en' ? 'Girl' : 'लड़की'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {language === 'en' ? 'Birth Location' : 'जन्म स्थान'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-1/2"
                  />
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-1/2"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'Default: New Delhi' : 'डिफ़ॉल्ट: नई दिल्ली'}
                </p>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Get Name Suggestions' : 'नाम सुझाव प्राप्त करें'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Results Display */
        <>
          {/* Nakshatra Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {language === 'en' ? 'Birth Nakshatra' : 'जन्म नक्षत्र'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Nakshatra' : 'नक्षत्र'}
                  </p>
                  <p className="text-lg font-semibold">{nakshatra}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Pada' : 'पद'}
                  </p>
                  <p className="text-lg font-semibold">{pada}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Lucky Letters' : 'शुभ अक्षर'}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {luckyLetters.slice(0, 4).map((letter, idx) => (
                      <Badge key={idx} variant="default">{letter}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('input')}
                className="mt-4"
              >
                {language === 'en' ? 'Change Details' : 'विवरण बदलें'}
              </Button>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">
                    {language === 'en' ? 'Search Names' : 'नाम खोजें'}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder={language === 'en' ? 'Search by name or meaning...' : 'नाम या अर्थ से खोजें...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortBy">
                    {language === 'en' ? 'Sort By' : 'क्रमबद्ध करें'}
                  </Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger id="sortBy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">
                        {language === 'en' ? 'Strength' : 'शक्ति'}
                      </SelectItem>
                      <SelectItem value="popularity">
                        {language === 'en' ? 'Popularity' : 'लोकप्रियता'}
                      </SelectItem>
                      <SelectItem value="alphabetical">
                        {language === 'en' ? 'Alphabetical' : 'वर्णमाला'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStrength">
                    {language === 'en' ? 'Min Strength' : 'न्यूनतम शक्ति'}: {minStrength}
                  </Label>
                  <Input
                    id="minStrength"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minStrength}
                    onChange={(e) => setMinStrength(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Name Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {language === 'en' ? 'Recommended Names' : 'अनुशंसित नाम'} ({filteredRecommendations.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const favNames = recommendations.filter(r => favorites.has(r.name.id));
                  if (favNames.length > 0) {
                    alert(`Favorites: ${favNames.map(f => f.name.name).join(', ')}`);
                  }
                }}
              >
                <Heart className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Favorites' : 'पसंदीदा'} ({favorites.size})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendations.map((rec) => (
                <Card key={rec.name.id} className="relative">
                  <button
                    onClick={() => toggleFavorite(rec.name.id)}
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-accent"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(rec.name.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                      }`}
                    />
                  </button>

                  <CardHeader>
                    <div className="flex items-start justify-between pr-8">
                      <div>
                        <CardTitle className="text-xl">{rec.name.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {rec.name.pronunciation.phonetic}
                        </CardDescription>
                      </div>
                      {rec.isTopChoice && (
                        <Badge variant="default" className="ml-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Top
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {language === 'en' ? 'Meaning' : 'अर्थ'}
                      </p>
                      <p className="text-sm">
                        {language === 'en' ? rec.name.meaning.en : rec.name.meaning.hi}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {language === 'en' ? 'Strength' : 'शक्ति'}
                        </span>
                        <Badge variant={getStrengthBadge(rec.strengthAnalysis.overallStrength)}>
                          {rec.strengthAnalysis.overallStrength}/100
                        </Badge>
                      </div>
                      <Progress value={rec.strengthAnalysis.overallStrength} className="h-2" />
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {rec.name.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Rating' : 'रेटिंग'}: {rec.strengthAnalysis.rating}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecommendations.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'en'
                      ? 'No names found matching your criteria. Try adjusting filters.'
                      : 'आपके मानदंडों से मेल खाने वाला कोई नाम नहीं मिला। फ़िल्टर समायोजित करने का प्रयास करें।'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
