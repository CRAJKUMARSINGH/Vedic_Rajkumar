import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { EventInput, EventProfile } from '@/services/eventTransitAnalysisService';

type OutcomeStatus =
  | 'scheduled'
  | 'completed'
  | 'waiting'
  | 'offered'
  | 'accepted'
  | 'rejected';

interface JournalEntry {
  profileKey: string;
  eventDate: string;
  eventType: string;
  outcome: OutcomeStatus;
  notes: string;
  cosmicNotes: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vedic-event-journal';

const OUTCOMES: { id: OutcomeStatus; en: string; hi: string }[] = [
  { id: 'scheduled', en: 'Scheduled', hi: 'निर्धारित' },
  { id: 'completed', en: 'Completed', hi: 'पूर्ण' },
  { id: 'waiting', en: 'Waiting', hi: 'प्रतीक्षा' },
  { id: 'offered', en: 'Offer Received', hi: 'प्रस्ताव मिला' },
  { id: 'accepted', en: 'Accepted', hi: 'स्वीकृत' },
  { id: 'rejected', en: 'Rejected', hi: 'अस्वीकृत' },
];

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface Props {
  profile: EventProfile;
  event: EventInput;
  lang?: 'en' | 'hi';
}

export default function EventOutcomeJournal({ profile, event, lang = 'en' }: Props) {
  const isHi = lang === 'hi';
  const profileKey = `${profile.name}|${profile.birthDate}`;

  const [outcome, setOutcome] = useState<OutcomeStatus>('scheduled');
  const [notes, setNotes] = useState('');
  const [cosmicNotes, setCosmicNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const entries = loadEntries();
    const match = entries.find(
      e => e.profileKey === profileKey && e.eventDate === event.eventDate,
    );
    if (match) {
      setOutcome(match.outcome);
      setNotes(match.notes);
      setCosmicNotes(match.cosmicNotes);
    }
  }, [profileKey, event.eventDate]);

  const handleSave = () => {
    const entries = loadEntries().filter(
      e => !(e.profileKey === profileKey && e.eventDate === event.eventDate),
    );
    entries.unshift({
      profileKey,
      eventDate: event.eventDate,
      eventType: event.eventType,
      outcome,
      notes,
      cosmicNotes,
      updatedAt: new Date().toISOString(),
    });
    saveEntries(entries.slice(0, 50));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      <Card className="border-violet-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            📓 {isHi ? 'घटना जर्नल / परिणाम ट्रैकर' : 'Event Journal / Outcome Tracker'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {isHi
              ? 'साक्षात्कार / परीक्षा के बाद वास्तविक परिणाम दर्ज करें — स्थानीय रूप से सहेजा जाता है।'
              : 'Record the real-world outcome after your interview or exam — saved locally in your browser.'}
          </p>

          <div className="flex flex-wrap gap-2">
            {OUTCOMES.map(o => (
              <Button
                key={o.id}
                size="sm"
                variant={outcome === o.id ? 'default' : 'outline'}
                className="text-[10px] h-7"
                onClick={() => setOutcome(o.id)}
              >
                {isHi ? o.hi : o.en}
              </Button>
            ))}
          </div>

          <div>
            <p className="text-xs font-medium mb-1">{isHi ? 'नोट्स' : 'Notes'}</p>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isHi ? 'साक्षात्कार कैसा रहा…' : 'How did the interview go…'}
              rows={3}
            />
          </div>

          <div>
            <p className="text-xs font-medium mb-1">
              {isHi ? 'ज्योतिष / कॉस्मिक नोट्स' : 'Astrological / cosmic notes'}
            </p>
            <Textarea
              value={cosmicNotes}
              onChange={e => setCosmicNotes(e.target.value)}
              placeholder={isHi ? 'गोचर अनुभव, hora, tara bala…' : 'Transit experience, hora, tara bala…'}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave}>
              {isHi ? 'सहेजें' : 'Save Entry'}
            </Button>
            {saved && (
              <Badge variant="outline" className="text-emerald-700 border-emerald-400">
                {isHi ? 'सहेजा गया' : 'Saved'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
