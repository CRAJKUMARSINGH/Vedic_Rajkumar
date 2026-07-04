/**
 * Festival Calendar Page Component
 * 
 * Displays personalized festival calendar with:
 * - Hindu festivals
 * - Recommended anushthans
 * - Auspicious days
 * - Reminders and notifications
 * 
 * Week 22 - Thursday Implementation
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bell, Star, Sparkles } from 'lucide-react';
import {
  generatePersonalizedCalendar,
  getEventsForMonth,
  getUpcomingReminders,
  getCalendarStats,
  type PersonalizedCalendar,
  type CalendarEvent
} from '@/services/personalizedCalendarService';
import { getAnushthanById } from '@/services/anushthanService';

export default function FestivalCalendarPage() {
  const [birthDate, setBirthDate] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showResults, setShowResults] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const calendar = useMemo<PersonalizedCalendar | null>(() => {
    if (!birthDate) return null;
    const date = new Date(birthDate);
    return generatePersonalizedCalendar(date);
  }, [birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate) {
      setShowResults(true);
    }
  };

  if (!showResults) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {language === 'en' ? 'Festival Calendar & Anushthan' : 'त्योहार कैलेंडर और अनुष्ठान'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Get your personalized spiritual calendar with festivals and rituals'
                : 'त्योहारों और अनुष्ठानों के साथ अपना व्यक्तिगत आध्यात्मिक कैलेंडर प्राप्त करें'}
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

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {language === 'en' ? 'Generate Calendar' : 'कैलेंडर बनाएं'}
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

  if (!calendar) return null;

  const stats = getCalendarStats(calendar);
  const reminders = getUpcomingReminders(calendar);
  const monthEvents = getEventsForMonth(calendar, selectedMonth);
  const currentYear = calendar.year;

  const monthNames = language === 'en'
    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    : ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            {language === 'en' ? 'Your Spiritual Calendar' : 'आपका आध्यात्मिक कैलेंडर'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? `Year ${currentYear}` : `वर्ष ${currentYear}`} • 
            {language === 'en' ? ` Life Path ${calendar.lifePathNumber}` : ` जीवन पथ ${calendar.lifePathNumber}`}
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

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.festivals}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Festivals' : 'त्योहार'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">{stats.anushthans}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Anushthans' : 'अनुष्ठान'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{stats.auspiciousDays}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Auspicious Days' : 'शुभ दिन'}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Upcoming' : 'आगामी'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="w-5 h-5" />
              {language === 'en' ? 'Upcoming Reminders' : 'आगामी अनुस्मारक'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.slice(0, 3).map((reminder, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-600">{reminder.daysUntil}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{reminder.event.title[language]}</div>
                    <div className="text-sm text-muted-foreground">
                      {reminder.event.reminder?.message[language]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">
            {language === 'en' ? 'Calendar' : 'कैलेंडर'}
          </TabsTrigger>
          <TabsTrigger value="festivals">
            {language === 'en' ? 'Festivals' : 'त्योहार'}
          </TabsTrigger>
          <TabsTrigger value="anushthans">
            {language === 'en' ? 'Anushthans' : 'अनुष्ठान'}
          </TabsTrigger>
          <TabsTrigger value="auspicious">
            {language === 'en' ? 'Auspicious Days' : 'शुभ दिन'}
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Month Selector */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Select Month' : 'महीना चुनें'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {monthNames.map((month, index) => (
                  <Button
                    key={index}
                    variant={selectedMonth === index + 1 ? 'default' : 'outline'}
                    onClick={() => setSelectedMonth(index + 1)}
                    className="w-full"
                  >
                    {month}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Month Events */}
          <Card>
            <CardHeader>
              <CardTitle>
                {monthNames[selectedMonth - 1]} {currentYear}
              </CardTitle>
              <CardDescription>
                {monthEvents.length} {language === 'en' ? 'events this month' : 'इस महीने की घटनाएं'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthEvents.map((event, i) => (
                  <EventCard key={i} event={event} language={language} />
                ))}
                {monthEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'en' ? 'No events this month' : 'इस महीने कोई घटना नहीं'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Festivals Tab */}
        <TabsContent value="festivals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Hindu Festivals' : 'हिंदू त्योहार'} {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendar.events
                  .filter(e => e.type === 'Festival')
                  .map((event, i) => (
                    <EventCard key={i} event={event} language={language} detailed />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anushthans Tab */}
        <TabsContent value="anushthans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Recommended Anushthans' : 'अनुशंसित अनुष्ठान'}
              </CardTitle>
              <CardDescription>
                {language === 'en'
                  ? 'Personalized ritual recommendations based on your birth chart'
                  : 'आपकी जन्म कुंडली के आधार पर व्यक्तिगत अनुष्ठान सिफारिशें'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendar.recommendedAnushthans.map((anushthan, i) => (
                  <AnushthanCard key={i} anushthan={anushthan} language={language} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auspicious Days Tab */}
        <TabsContent value="auspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {language === 'en' ? 'Your Auspicious Days' : 'आपके शुभ दिन'}
              </CardTitle>
              <CardDescription>
                {language === 'en'
                  ? `Based on your Life Path Number ${calendar.lifePathNumber}`
                  : `आपके जीवन पथ अंक ${calendar.lifePathNumber} के आधार पर`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {calendar.auspiciousDays.slice(0, 20).map((date, i) => (
                  <div
                    key={i}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
                  >
                    <div className="text-sm font-semibold">
                      {date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                        weekday: 'short'
                      })}
                    </div>
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

// Helper component for event cards
function EventCard({
  event,
  language,
  detailed = false
}: {
  event: CalendarEvent;
  language: 'en' | 'hi';
  detailed?: boolean;
}) {
  const date = new Date(event.date);
  const priorityColors = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${priorityColors[event.priority]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{event.type}</Badge>
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <h4 className="font-semibold text-lg">{event.title[language]}</h4>
          {detailed && (
            <p className="text-sm mt-2">{event.description[language]}</p>
          )}
        </div>
        {event.priority === 'High' && (
          <Sparkles className="w-5 h-5 text-red-600" />
        )}
      </div>
    </div>
  );
}

// Helper component for anushthan cards
function AnushthanCard({
  anushthan,
  language
}: {
  anushthan: any;
  language: 'en' | 'hi';
}) {
  return (
    <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{anushthan.name[language]}</h4>
          <p className="text-sm text-muted-foreground">
            {language === 'en' ? 'Deity:' : 'देवता:'} {anushthan.deity}
          </p>
        </div>
        <Badge>{anushthan.type}</Badge>
      </div>
      <p className="text-sm mb-3">{anushthan.purpose[language]}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-semibold">
            {language === 'en' ? 'Duration:' : 'अवधि:'}
          </span>{' '}
          {anushthan.duration.days} {language === 'en' ? 'days' : 'दिन'}
        </div>
        <div>
          <span className="font-semibold">
            {language === 'en' ? 'Best Time:' : 'सर्वोत्तम समय:'}
          </span>{' '}
          {anushthan.timing.bestTime}
        </div>
      </div>
    </div>
  );
}
