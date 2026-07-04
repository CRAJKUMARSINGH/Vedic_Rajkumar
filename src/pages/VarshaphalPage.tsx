/**
 * Varshaphal Page - Annual Solar Return Analysis
 * BV Raman Magazine Enhancement Plan Implementation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Calculator } from 'lucide-react';
import VarshaphalCard from '@/components/VarshaphalCard';

export default function VarshaphalPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const isHi = lang === 'hi';

  const [birthDate, setBirthDate] = useState<string>('');
  const [birthLatitude, setBirthLatitude] = useState<string>('');
  const [birthLongitude, setBirthLongitude] = useState<string>('');
  const [targetYear, setTargetYear] = useState<string>(new Date().getFullYear().toString());
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill from user profile if available (simplified for now)
  useEffect(() => {
    // TODO: Implement user profile auto-fill when store is available
    // if (currentUser?.birthData) {
    //   setBirthDate(currentUser.birthData.date || '');
    //   setBirthLatitude(currentUser.birthData.latitude?.toString() || '');
    //   setBirthLongitude(currentUser.birthData.longitude?.toString() || '');
    // }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!birthDate) {
      newErrors.birthDate = isHi ? 'जन्म तिथि आवश्यक है' : 'Birth date is required';
    }

    if (!birthLatitude || isNaN(Number(birthLatitude)) || Number(birthLatitude) < -90 || Number(birthLatitude) > 90) {
      newErrors.birthLatitude = isHi ? 'अक्षांश -90 से 90 के बीच होना चाहिए' : 'Latitude must be between -90 and 90';
    }

    if (!birthLongitude || isNaN(Number(birthLongitude)) || Number(birthLongitude) < -180 || Number(birthLongitude) > 180) {
      newErrors.birthLongitude = isHi ? 'देशांतर -180 से 180 के बीच होना चाहिए' : 'Longitude must be between -180 and 180';
    }

    if (!targetYear || isNaN(Number(targetYear)) || Number(targetYear) < 1900 || Number(targetYear) > 2100) {
      newErrors.targetYear = isHi ? 'वर्ष 1900 से 2100 के बीच होना चाहिए' : 'Year must be between 1900 and 2100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowResults(true);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBirthLatitude(position.coords.latitude.toString());
          setBirthLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
          setErrors({
            location: isHi ? 'स्थान प्राप्त करने में त्रुटि' : 'Error getting location'
          });
        }
      );
    } else {
      setErrors({
        location: isHi ? 'भू-स्थान एपीआई समर्थित नहीं' : 'Geolocation API not supported'
      });
    }
  };

  const handleQuickFill = () => {
    // Quick fill with sample data for testing
    setBirthDate('1963-09-15');
    setBirthLatitude('24.5');
    setBirthLongitude('74.5');
    setTargetYear('2026');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold text-amber-800 dark:text-amber-300 mb-2 ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'वर्षफल - वार्षिक सौर प्रत्यागमन' : 'Varshaphal - Annual Solar Return'}
          </h1>
          <p className={`text-lg text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
            {isHi ? 'बी.वी. रमण परंपरा के अनुसार वार्षिक भविष्यवाणी' : 'Annual Predictions per B.V. Raman Tradition'}
          </p>
          <Badge className="mt-2 bg-amber-600 text-white">
            {isHi ? '50+ वर्षों का ज्ञान' : '50+ Years of Wisdom'}
          </Badge>
        </div>

        {/* Input Form */}
        {!showResults && (
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isHi ? 'font-hindi' : ''}`}>
                <Calculator className="w-5 h-5" />
                {isHi ? 'जन्म विवरण दर्ज करें' : 'Enter Birth Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className={isHi ? 'font-hindi' : ''}>
                    {isHi ? 'जन्म तिथि' : 'Birth Date'}
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={errors.birthDate ? 'border-red-500' : ''}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-500">{errors.birthDate}</p>
                  )}
                </div>

                {/* Birth Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <Label className={isHi ? 'font-hindi' : ''}>
                      {isHi ? 'जन्म स्थान' : 'Birth Location'}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseCurrentLocation}
                    >
                      {isHi ? 'वर्तमान स्थान' : 'Current Location'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className={isHi ? 'font-hindi' : ''}>
                        {isHi ? 'अक्षांश' : 'Latitude'}
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        placeholder="24.5"
                        value={birthLatitude}
                        onChange={(e) => setBirthLatitude(e.target.value)}
                        className={errors.birthLatitude ? 'border-red-500' : ''}
                      />
                      {errors.birthLatitude && (
                        <p className="text-sm text-red-500">{errors.birthLatitude}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude" className={isHi ? 'font-hindi' : ''}>
                        {isHi ? 'देशांतर' : 'Longitude'}
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        placeholder="74.5"
                        value={birthLongitude}
                        onChange={(e) => setBirthLongitude(e.target.value)}
                        className={errors.birthLongitude ? 'border-red-500' : ''}
                      />
                      {errors.birthLongitude && (
                        <p className="text-sm text-red-500">{errors.birthLongitude}</p>
                      )}
                    </div>
                  </div>

                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Target Year */}
                <div className="space-y-2">
                  <Label htmlFor="targetYear" className={isHi ? 'font-hindi' : ''}>
                    {isHi ? 'वर्ष' : 'Year'}
                  </Label>
                  <Select value={targetYear} onValueChange={setTargetYear}>
                    <SelectTrigger className={errors.targetYear ? 'border-red-500' : ''}>
                      <SelectValue placeholder={isHi ? 'वर्ष चुनें' : 'Select year'} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.targetYear && (
                    <p className="text-sm text-red-500">{errors.targetYear}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {isHi ? 'वर्षफल की गणना करें' : 'Calculate Varshaphal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleQuickFill}>
                    {isHi ? 'नमूना डेटा' : 'Sample Data'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
              >
                {isHi ? 'नया विश्लेषण' : 'New Analysis'}
              </Button>
              <Badge className="bg-green-600 text-white">
                {isHi ? 'वर्ष' : 'Year'} {targetYear}
              </Badge>
            </div>

            {/* Varshaphal Card */}
            <VarshaphalCard
              birthDate={new Date(birthDate)}
              birthLatitude={Number(birthLatitude)}
              birthLongitude={Number(birthLongitude)}
              targetYear={Number(targetYear)}
              lang={lang}
            />
          </div>
        )}

        {/* Information Cards */}
        {!showResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'वर्षेश' : 'Varshesh'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? 'वर्षेश वह ग्रह है जो वर्ष के लिए सबसे महत्वपूर्ण प्रभाव देता है। यह सौर प्रत्यागमन की डिग्री के आधार पर निर्धारित होता है।'
                    : 'Varshesh is the ruling planet of the year, determined by the degree of solar return.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'मुंथा' : 'Muntha'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? 'मुंथा वार्षिक लग्न है जो प्रत्येक वर्ष एक घर आगे बढ़ता है। यह वर्ष के दौरान समग्र स्वास्थ्य और कल्याण को दर्शाता है।'
                    : 'Muntha is the annual ascendant that moves one house each year, indicating overall health and wellbeing.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`text-lg ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'ताजिका योग' : 'Tajika Yogas'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-sm text-muted-foreground ${isHi ? 'font-hindi' : ''}`}>
                  {isHi 
                    ? 'ताजिका योग वार्षिक चार्ट में ग्रह संबंधों के आधार पर विशिष्ट परिणामों को दर्शाते हैं, जो वर्ष के महत्वपूर्ण घटनाओं का संकेत देते हैं।'
                    : 'Tajika yogas show specific results based on planetary combinations in the annual chart.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
