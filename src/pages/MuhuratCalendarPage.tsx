/**
 * Muhurat Calendar Page - Complete Muhurat Interface
 * Week 19: Muhurat Calculations - Thursday Implementation
 * Comprehensive calendar with Panchang, auspicious/inauspicious periods, and event selection
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Sun, Moon, Star, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import type { EventType } from '@/services/eventMuhuratService';

interface MuhuratDay {
  date: Date;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  var: string;
  overallQuality: number;
  hasAuspiciousPeriod: boolean;
  hasInauspiciousPeriod: boolean;
}

const EVENT_TYPES: { value: EventType; label: { en: string; hi: string } }[] = [
  { value: 'marriage', label: { en: 'Marriage', hi: 'विवाह' } },
  { value: 'business_start', label: { en: 'Business Start', hi: 'व्यापार शुरुआत' } },
  { value: 'house_warming', label: { en: 'House Warming', hi: 'गृह प्रवेश' } },
  { value: 'vehicle_purchase', label: { en: 'Vehicle Purchase', hi: 'वाहन खरीद' } },
  { value: 'shop_opening', label: { en: 'Shop Opening', hi: 'दुकान उद्घाटन' } },
  { value: 'education_start', label: { en: 'Education Start', hi: 'शिक्षा शुरुआत' } },
  { value: 'travel', label: { en: 'Travel', hi: 'यात्रा' } },
  { value: 'naming_ceremony', label: { en: 'Naming Ceremony', hi: 'नामकरण' } },
  { value: 'thread_ceremony', label: { en: 'Thread Ceremony', hi: 'उपनयन' } },
  { value: 'property_purchase', label: { en: 'Property Purchase', hi: 'संपत्ति खरीद' } }
];

export default function MuhuratCalendarPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType>('marriage');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Generate sample muhurat data for current month
  const monthDays = useMemo(() => {
    const days: MuhuratDay[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        tithi: ['Pratipada', 'Dwitiya', 'Tritiya', 'Panchami', 'Saptami'][day % 5],
        nakshatra: ['Ashwini', 'Rohini', 'Pushya', 'Hasta', 'Revati'][day % 5],
        yoga: ['Vishkambha', 'Priti', 'Ayushman', 'Siddhi'][day % 4],
        karana: ['Bava', 'Balava', 'Kaulava'][day % 3],
        var: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
        overallQuality: 50 + (day % 40),
        hasAuspiciousPeriod: day % 3 !== 0,
        hasInauspiciousPeriod: day % 2 === 0
      });
    }
    return days;
  }, [currentMonth]);

  const selectedDayData = monthDays.find(
    d => d.date.toDateString() === selectedDate.toDateString()
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 80) return 'default';
    if (quality >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">
                {language === 'en' ? 'Muhurat Calendar' : 'मुहूर्त कैलेंडर'}
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
              ? 'Find auspicious timings for important life events'
              : 'महत्वपूर्ण जीवन घटनाओं के लिए शुभ समय खोजें'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Event Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'en' ? 'Select Event Type' : 'कार्यक्रम प्रकार चुनें'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={(value) => setSelectedEvent(value as EventType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(event => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label[language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                {language === 'en' ? 'Today' : 'आज'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {monthDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  p-2 rounded-lg border text-left transition-all
                  ${day.date.toDateString() === selectedDate.toDateString()
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'}
                  ${day.date.toDateString() === new Date().toDateString()
                    ? 'ring-2 ring-primary/30'
                    : ''}
                `}
              >
                <div className="font-semibold">{day.date.getDate()}</div>
                <div className="flex gap-1 mt-1">
                  {day.hasAuspiciousPeriod && (
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Auspicious period" />
                  )}
                  {day.hasInauspiciousPeriod && (
                    <div className="w-2 h-2 rounded-full bg-red-500" title="Inauspicious period" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {day.tithi.slice(0, 4)}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDayData && (
        <Tabs defaultValue="panchang" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="panchang">
              {language === 'en' ? 'Panchang' : 'पंचांग'}
            </TabsTrigger>
            <TabsTrigger value="periods">
              {language === 'en' ? 'Periods' : 'समय'}
            </TabsTrigger>
            <TabsTrigger value="muhurat">
              {language === 'en' ? 'Muhurat' : 'मुहूर्त'}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              {language === 'en' ? 'Timeline' : 'समयरेखा'}
            </TabsTrigger>
          </TabsList>

          {/* Panchang Tab */}
          <TabsContent value="panchang">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  {language === 'en' ? 'Daily Panchang' : 'दैनिक पंचांग'}
                </CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold">
                        {language === 'en' ? 'Tithi:' : 'तिथि:'}
                      </span>
                      <span>{selectedDayData.tithi}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">
                        {language === 'en' ? 'Nakshatra:' : 'नक्षत्र:'}
                      </span>
                      <span>{selectedDayData.nakshatra}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">
                        {language === 'en' ? 'Yoga:' : 'योग:'}
                      </span>
                      <span>{selectedDayData.yoga}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">
                        {language === 'en' ? 'Karana:' : 'करण:'}
                      </span>
                      <span>{selectedDayData.karana}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">
                        {language === 'en' ? 'Var:' : 'वार:'}
                      </span>
                      <span>{selectedDayData.var}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {language === 'en' ? 'Overall Quality:' : 'समग्र गुणवत्ता:'}
                    </span>
                    <Badge variant={getQualityBadge(selectedDayData.overallQuality)}>
                      {selectedDayData.overallQuality}/100
                    </Badge>
                  </div>
                  <Progress value={selectedDayData.overallQuality} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Periods Tab */}
          <TabsContent value="periods">
            <div className="space-y-4">
              {/* Auspicious Periods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    {language === 'en' ? 'Auspicious Periods' : 'शुभ समय'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Abhijit Muhurat</span>
                      <Badge variant="default">95/100</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      12:00 PM - 12:48 PM (48 minutes)
                    </div>
                    <div className="text-sm mt-2">
                      {language === 'en' 
                        ? 'Most auspicious period, ideal for all important work'
                        : 'सबसे शुभ समय, सभी महत्वपूर्ण कार्यों के लिए आदर्श'}
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Brahma Muhurat</span>
                      <Badge variant="default">90/100</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      4:24 AM - 6:00 AM (96 minutes)
                    </div>
                    <div className="text-sm mt-2">
                      {language === 'en'
                        ? 'Sacred pre-dawn period for meditation and spiritual practices'
                        : 'ध्यान और आध्यात्मिक अभ्यास के लिए पवित्र प्रभात काल'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inauspicious Periods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    {language === 'en' ? 'Inauspicious Periods' : 'अशुभ समय'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Rahu Kaal</span>
                      <Badge variant="destructive">High Severity</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedDayData.var === 'Sunday' && '4:30 PM - 6:00 PM'}
                      {selectedDayData.var === 'Monday' && '7:30 AM - 9:00 AM'}
                      {selectedDayData.var === 'Tuesday' && '3:00 PM - 4:30 PM'}
                      {selectedDayData.var === 'Wednesday' && '12:00 PM - 1:30 PM'}
                      {selectedDayData.var === 'Thursday' && '1:30 PM - 3:00 PM'}
                      {selectedDayData.var === 'Friday' && '10:30 AM - 12:00 PM'}
                      {selectedDayData.var === 'Saturday' && '9:00 AM - 10:30 AM'}
                      {' (90 minutes)'}
                    </div>
                    <div className="text-sm mt-2">
                      {language === 'en'
                        ? 'Avoid starting new work, travel, and important decisions'
                        : 'नया काम, यात्रा और महत्वपूर्ण निर्णय से बचें'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Muhurat Tab */}
          <TabsContent value="muhurat">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'en' ? 'Event Muhurat Analysis' : 'कार्यक्रम मुहूर्त विश्लेषण'}
                </CardTitle>
                <CardDescription>
                  {EVENT_TYPES.find(e => e.value === selectedEvent)?.label[language]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {language === 'en' ? 'Suitability:' : 'उपयुक्तता:'}
                    </span>
                    <Badge variant={selectedDayData.overallQuality >= 70 ? 'default' : 'secondary'}>
                      {selectedDayData.overallQuality >= 80 ? (language === 'en' ? 'Excellent' : 'उत्कृष्ट') :
                       selectedDayData.overallQuality >= 65 ? (language === 'en' ? 'Good' : 'अच्छा') :
                       selectedDayData.overallQuality >= 50 ? (language === 'en' ? 'Average' : 'औसत') :
                       (language === 'en' ? 'Poor' : 'खराब')}
                    </Badge>
                  </div>
                  <Progress value={selectedDayData.overallQuality} className="h-2" />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-semibold flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {language === 'en' ? 'Auspicious Factors' : 'शुभ कारक'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>{language === 'en' ? 'Favorable Tithi' : 'अनुकूल तिथि'}</li>
                    <li>{language === 'en' ? 'Auspicious Nakshatra' : 'शुभ नक्षत्र'}</li>
                    <li>{language === 'en' ? 'Good day of week' : 'सप्ताह का अच्छा दिन'}</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-semibold flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    {language === 'en' ? 'Recommendations' : 'सिफारिशें'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>{language === 'en' ? 'Perform event during Abhijit Muhurat' : 'अभिजित मुहूर्त के दौरान कार्यक्रम करें'}</li>
                    <li>{language === 'en' ? 'Avoid Rahu Kaal period' : 'राहु काल से बचें'}</li>
                    <li>{language === 'en' ? 'Consult with priest for detailed rituals' : 'विस्तृत अनुष्ठानों के लिए पुजारी से परामर्श करें'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {language === 'en' ? 'Daily Timeline' : 'दैनिक समयरेखा'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Timeline visualization */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    
                    {/* Brahma Muhurat */}
                    <div className="relative pl-12 pb-4">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                      <div className="text-sm font-semibold">4:24 AM - 6:00 AM</div>
                      <div className="text-sm text-muted-foreground">Brahma Muhurat</div>
                      <Badge variant="default" className="mt-1">Auspicious</Badge>
                    </div>

                    {/* Sunrise */}
                    <div className="relative pl-12 pb-4">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-background" />
                      <div className="text-sm font-semibold">6:00 AM</div>
                      <div className="text-sm text-muted-foreground">Sunrise</div>
                    </div>

                    {/* Rahu Kaal */}
                    <div className="relative pl-12 pb-4">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-background" />
                      <div className="text-sm font-semibold">
                        {selectedDayData.var === 'Monday' && '7:30 AM - 9:00 AM'}
                        {selectedDayData.var === 'Saturday' && '9:00 AM - 10:30 AM'}
                        {selectedDayData.var === 'Friday' && '10:30 AM - 12:00 PM'}
                      </div>
                      <div className="text-sm text-muted-foreground">Rahu Kaal</div>
                      <Badge variant="destructive" className="mt-1">Avoid</Badge>
                    </div>

                    {/* Abhijit Muhurat */}
                    <div className="relative pl-12 pb-4">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                      <div className="text-sm font-semibold">12:00 PM - 12:48 PM</div>
                      <div className="text-sm text-muted-foreground">Abhijit Muhurat</div>
                      <Badge variant="default" className="mt-1">Most Auspicious</Badge>
                    </div>

                    {/* Sunset */}
                    <div className="relative pl-12 pb-4">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-background" />
                      <div className="text-sm font-semibold">6:00 PM</div>
                      <div className="text-sm text-muted-foreground">Sunset</div>
                    </div>

                    {/* Godhuli Muhurat */}
                    <div className="relative pl-12">
                      <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                      <div className="text-sm font-semibold">5:36 PM - 6:24 PM</div>
                      <div className="text-sm text-muted-foreground">Godhuli Muhurat</div>
                      <Badge variant="default" className="mt-1">Auspicious</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
