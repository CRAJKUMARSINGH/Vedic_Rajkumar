/**
 * Personalized Calendar Service
 * 
 * Generates personalized spiritual calendar combining:
 * - Hindu festivals
 * - Recommended anushthans
 * - Auspicious days based on birth chart
 * - Personalized reminders
 * 
 * Week 22 - Wednesday Implementation
 */

import { getFestivalsForYear, getUpcomingFestivals, type Festival } from './festivalDatabaseService';
import { getRecommendedAnushthans, type Anushthan } from './anushthanService';
import { calculateLifePathNumber } from './numerologySystemService';

export interface CalendarEvent {
  id: string;
  date: string; // ISO format
  type: 'Festival' | 'Anushthan' | 'Auspicious Day' | 'Reminder';
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  reminder?: {
    daysBefore: number;
    message: {
      en: string;
      hi: string;
    };
  };
}

export interface PersonalizedCalendar {
  year: number;
  birthDate: Date;
  lifePathNumber: number;
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  recommendedAnushthans: Anushthan[];
  auspiciousDays: Date[];
}

/**
 * Calculate auspicious days based on life path number
 */
function calculateAuspiciousDays(year: number, lifePathNumber: number): Date[] {
  const auspiciousDays: Date[] = [];
  
  // Days of week that are auspicious for each life path number
  const luckyDays: { [key: number]: number[] } = {
    1: [0], // Sunday
    2: [1], // Monday
    3: [4], // Thursday
    4: [0, 6], // Sunday, Saturday
    5: [3], // Wednesday
    6: [5], // Friday
    7: [1, 2], // Monday, Tuesday
    8: [6], // Saturday
    9: [2] // Tuesday
  };

  const days = luckyDays[lifePathNumber] || [0];

  // Find all occurrences of lucky days in the year
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (days.includes(date.getDay())) {
        auspiciousDays.push(date);
      }
    }
  }

  return auspiciousDays;
}

/**
 * Convert festival to calendar event
 */
function festivalToEvent(festival: Festival): CalendarEvent {
  return {
    id: `festival-${festival.id}`,
    date: festival.date,
    type: 'Festival',
    title: festival.name,
    description: festival.significance,
    priority: festival.type === 'Major' ? 'High' : 'Medium',
    category: festival.category,
    reminder: {
      daysBefore: 3,
      message: {
        en: `${festival.name.en} is coming in 3 days. Prepare for the celebration.`,
        hi: `${festival.name.hi} 3 दिनों में आ रहा है। उत्सव की तैयारी करें।`
      }
    }
  };
}

/**
 * Convert anushthan to calendar event
 */
function anushthanToEvent(anushthan: Anushthan, startDate: Date): CalendarEvent {
  return {
    id: `anushthan-${anushthan.id}`,
    date: startDate.toISOString().split('T')[0],
    type: 'Anushthan',
    title: anushthan.name,
    description: anushthan.purpose,
    priority: 'High',
    category: 'Spiritual Practice',
    reminder: {
      daysBefore: 1,
      message: {
        en: `Start ${anushthan.name.en} tomorrow. Duration: ${anushthan.duration.days} days.`,
        hi: `कल ${anushthan.name.hi} शुरू करें। अवधि: ${anushthan.duration.days} दिन।`
      }
    }
  };
}

/**
 * Generate personalized calendar
 */
export function generatePersonalizedCalendar(
  birthDate: Date,
  year: number = new Date().getFullYear()
): PersonalizedCalendar {
  const lifePathNumber = calculateLifePathNumber(birthDate);
  
  // Get festivals for the year
  const festivals = getFestivalsForYear(year);
  const festivalEvents = festivals.map(festivalToEvent);
  
  // Get recommended anushthans
  const recommendedAnushthans = getRecommendedAnushthans(birthDate);
  
  // Create anushthan events (suggest starting on auspicious days)
  const auspiciousDays = calculateAuspiciousDays(year, lifePathNumber);
  const anushthanEvents: CalendarEvent[] = [];
  
  recommendedAnushthans.forEach((anushthan, index) => {
    // Suggest starting anushthan on an auspicious day
    const startDay = auspiciousDays[index * 10] || auspiciousDays[0];
    if (startDay) {
      anushthanEvents.push(anushthanToEvent(anushthan, startDay));
    }
  });
  
  // Combine all events
  const allEvents = [...festivalEvents, ...anushthanEvents];
  
  // Sort by date
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get upcoming events (next 30 days)
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  
  const upcomingEvents = allEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= thirtyDaysLater;
  });
  
  return {
    year,
    birthDate,
    lifePathNumber,
    events: allEvents,
    upcomingEvents,
    recommendedAnushthans,
    auspiciousDays: auspiciousDays.slice(0, 50) // Limit to 50 days
  };
}

/**
 * Get events for a specific month
 */
export function getEventsForMonth(calendar: PersonalizedCalendar, month: number): CalendarEvent[] {
  return calendar.events.filter(event => {
    const eventMonth = parseInt(event.date.split('-')[1]);
    return eventMonth === month;
  });
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(calendar: PersonalizedCalendar, date: Date): CalendarEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  return calendar.events.filter(event => event.date === dateStr);
}

/**
 * Get high priority events
 */
export function getHighPriorityEvents(calendar: PersonalizedCalendar): CalendarEvent[] {
  return calendar.events.filter(event => event.priority === 'High');
}

/**
 * Get events by type
 */
export function getEventsByType(
  calendar: PersonalizedCalendar,
  type: CalendarEvent['type']
): CalendarEvent[] {
  return calendar.events.filter(event => event.type === type);
}

/**
 * Get events by category
 */
export function getEventsByCategory(calendar: PersonalizedCalendar, category: string): CalendarEvent[] {
  return calendar.events.filter(event => event.category === category);
}

/**
 * Check if a date is auspicious
 */
export function isAuspiciousDay(calendar: PersonalizedCalendar, date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return calendar.auspiciousDays.some(
    auspiciousDate => auspiciousDate.toISOString().split('T')[0] === dateStr
  );
}

/**
 * Get reminders for upcoming events
 */
export function getUpcomingReminders(calendar: PersonalizedCalendar): {
  event: CalendarEvent;
  daysUntil: number;
}[] {
  const today = new Date();
  const reminders: { event: CalendarEvent; daysUntil: number }[] = [];
  
  calendar.events.forEach(event => {
    if (event.reminder) {
      const eventDate = new Date(event.date);
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= event.reminder.daysBefore) {
        reminders.push({ event, daysUntil });
      }
    }
  });
  
  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Get calendar statistics
 */
export function getCalendarStats(calendar: PersonalizedCalendar): {
  totalEvents: number;
  festivals: number;
  anushthans: number;
  auspiciousDays: number;
  upcomingEvents: number;
  highPriority: number;
} {
  return {
    totalEvents: calendar.events.length,
    festivals: calendar.events.filter(e => e.type === 'Festival').length,
    anushthans: calendar.events.filter(e => e.type === 'Anushthan').length,
    auspiciousDays: calendar.auspiciousDays.length,
    upcomingEvents: calendar.upcomingEvents.length,
    highPriority: calendar.events.filter(e => e.priority === 'High').length
  };
}

/**
 * Export calendar to simple format
 */
export function exportCalendarData(calendar: PersonalizedCalendar, language: 'en' | 'hi' = 'en'): {
  date: string;
  title: string;
  description: string;
  type: string;
}[] {
  return calendar.events.map(event => ({
    date: event.date,
    title: event.title[language],
    description: event.description[language],
    type: event.type
  }));
}
