/**
 * src/pages/DynamicTransitPage.tsx
 * Dynamic Transit Analysis Page
 * 
 * Displays real-time planetary transits with date picker
 */

import React, { useState, useEffect } from 'react';
import { DynamicTransitCalculator } from '../components/DynamicTransitCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, Info } from 'lucide-react';

export function DynamicTransitPage() {
  const [moonRashiIndex, setMoonRashiIndex] = useState<number>(3); // Default: Cancer
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    // Try to get moon rashi from localStorage if available
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (typeof profile?.name === 'string' && profile.name.trim()) {
          setUserName(profile.name.trim());
        }
        if (profile?.savedBirthDetails?.[0]?.moonRashiIndex !== undefined) {
          const index = profile.savedBirthDetails[0].moonRashiIndex;
          // Validate rashi index is within bounds (0-11)
          if (typeof index === 'number' && index >= 0 && index <= 11) {
            setMoonRashiIndex(index);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load user profile from localStorage:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Dynamic Transit Calculator</h1>
          <p className="text-lg text-gray-600">
            Real-time planetary transits with accurate ephemeris calculations
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                What's New
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>✅ Real ephemeris data integration (Swiss Ephemeris WASM)</p>
              <p>✅ Dynamic date-based calculations</p>
              <p>✅ Accurate sidereal (Lahiri) positions</p>
              <p>✅ User-selectable date & time picker</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-green-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>1. Select a date and time</p>
              <p>2. System calculates real planetary positions</p>
              <p>3. Compares with your Moon Rashi</p>
              <p>4. Provides detailed transit analysis</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Calculator */}
        <DynamicTransitCalculator
          moonRashiIndex={moonRashiIndex}
          userName={userName}
        />

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Understanding the Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="houses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="houses">Houses</TabsTrigger>
                <TabsTrigger value="vedha">Vedha</TabsTrigger>
                <TabsTrigger value="remedies">Remedies</TabsTrigger>
              </TabsList>

              <TabsContent value="houses" className="space-y-3 mt-4">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Transit Houses from Moon Rashi:</p>
                  <ul className="space-y-1 ml-4">
                    <li><strong>1st House:</strong> Self, personality, health</li>
                    <li><strong>2nd House:</strong> Wealth, family, speech</li>
                    <li><strong>3rd House:</strong> Courage, siblings, communication</li>
                    <li><strong>4th House:</strong> Home, property, mother</li>
                    <li><strong>5th House:</strong> Children, creativity, romance</li>
                    <li><strong>6th House:</strong> Health, enemies, service</li>
                    <li><strong>7th House:</strong> Marriage, partnerships, public</li>
                    <li><strong>8th House:</strong> Longevity, inheritance, secrets</li>
                    <li><strong>9th House:</strong> Fortune, father, spirituality</li>
                    <li><strong>10th House:</strong> Career, reputation, authority</li>
                    <li><strong>11th House:</strong> Income, friends, wishes</li>
                    <li><strong>12th House:</strong> Expenses, isolation, liberation</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="vedha" className="space-y-3 mt-4">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">What is Vedha?</p>
                  <p>
                    Vedha is an obstruction or blocking effect. When a planet is in a favorable house,
                    but another planet is in the vedha house (opposite house), the favorable effects are
                    reduced or blocked.
                  </p>
                  <p className="font-semibold mt-3">Example:</p>
                  <p>
                    If Jupiter is in the 11th house (favorable), but Saturn is in the 5th house (vedha),
                    Jupiter's benefits are partially blocked.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="remedies" className="space-y-3 mt-4">
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Recommended Remedies:</p>
                  <ul className="space-y-2 ml-4">
                    <li>
                      <strong>Mantras:</strong> Chant planet-specific mantras 108 times daily
                    </li>
                    <li>
                      <strong>Donations:</strong> Donate items associated with the planet on its day
                    </li>
                    <li>
                      <strong>Rituals:</strong> Perform specific rituals like lighting lamps
                    </li>
                    <li>
                      <strong>Gemstones:</strong> Wear recommended gemstones after consultation
                    </li>
                    <li>
                      <strong>Lifestyle:</strong> Follow specific practices and avoid certain activities
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accuracy Note */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Accuracy & Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <p>
              • This calculator uses Swiss Ephemeris WASM for 99.99% accurate planetary calculations
            </p>
            <p>
              • Sidereal zodiac (Lahiri Ayanamsa) is used as per Indian astrology standards
            </p>
            <p>
              • Results are for educational and entertainment purposes only
            </p>
            <p>
              • Consult a qualified astrologer for important life decisions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DynamicTransitPage;
