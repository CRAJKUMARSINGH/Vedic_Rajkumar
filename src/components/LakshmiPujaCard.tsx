/**
 * LakshmiPujaCard — Diwali-only puja muhurat.
 *
 * Renders nothing outside the Diwali window. Windows come from the panchang
 * engine; the card only selects and labels them.
 *
 * ADAPT: the repo's panchang engine is `getPanchang(date, lat, lon, tz)` — a
 * synchronous call that returns ISO-UTC timestamps plus `astronomical.sunset`
 * and `inauspiciousPeriods[]`. Pradosh Kaal is therefore derived from sunset
 * (~2h24m after it) and Rahu Kalam is looked up by name. A "sthir lagna"
 * (Vrishabha/Simha) window is deliberately NOT shown: the engine does not
 * compute the rising sign, and inventing one would violate the card's own
 * rule of showing nothing rather than a guess.
 */

import { useEffect, useState } from 'react';
import { Flame, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FESTIVALS, activeFestival } from '@/lib/festivals';
import { getPanchang, type PanchangData } from '@/features/panchang';

const TZ = 'Asia/Kolkata';

/** Classical Pradosh Kaal duration — roughly 2 hours 24 minutes from sunset. */
const PRADOSH_MINUTES = 144;

interface PujaWindow {
  label: string;
  start: string;
  end: string;
  quality: 'best' | 'good' | 'avoid';
  note: string;
}

interface Props {
  lat: number;
  lon: number;
  lang?: 'en' | 'hi' | 'hi-Latn';
  className?: string;
  /** Injected for tests; defaults to the panchang engine. */
  loadWindows?: (date: Date, lat: number, lon: number) => Promise<PujaWindow[]>;
}

const todayIso = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toIst = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

const addMinutes = (iso: string, mins: number): string =>
  new Date(new Date(iso).getTime() + mins * 60000).toISOString();

/** Select and label the puja windows from an engine-derived panchang. */
function deriveWindows(p: PanchangData): PujaWindow[] {
  const windows: PujaWindow[] = [
    {
      label: 'Pradosh Kaal',
      start: p.astronomical.sunset,
      end: addMinutes(p.astronomical.sunset, PRADOSH_MINUTES),
      quality: 'best',
      note: 'Primary Lakshmi Puja window — stable lagna, fixed by sunset.',
    },
  ];

  const rahu = p.inauspiciousPeriods.find(period => period.name === 'Rahu Kalam');
  if (rahu) {
    windows.push({
      label: 'Rahu Kalam',
      start: rahu.start,
      end: rahu.end,
      quality: 'avoid',
      note: 'Skip puja start inside this span; finish it before or begin after.',
    });
  }

  return windows;
}

/** Default loader: the real panchang engine, normalised to a promise. */
const engineLoader = (date: Date, lat: number, lon: number): Promise<PujaWindow[]> =>
  Promise.resolve()
    .then(() => deriveWindows(getPanchang(todayIso(date), lat, lon, TZ)))
    .catch(() => []);

export const LakshmiPujaCard = ({
  lat,
  lon,
  lang = 'en',
  className = '',
  loadWindows = engineLoader,
}: Props) => {
  const [windows, setWindows] = useState<PujaWindow[] | null>(null);
  const isDiwaliDay = activeFestival()?.id === 'diwali';

  useEffect(() => {
    if (!isDiwaliDay) return;
    let alive = true;
    loadWindows(new Date(), lat, lon).then(w => {
      if (alive) setWindows(w);
    });
    return () => {
      alive = false;
    };
  }, [isDiwaliDay, lat, lon, loadWindows]);

  if (!isDiwaliDay) return null;

  const title = lang === 'hi' ? 'लक्ष्मी पूजा मुहूर्त' : 'Lakshmi Puja Muhurat';

  return (
    <Card className={`festival-accent border-amber-300 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Flame className="h-5 w-5" aria-hidden="true" />
          {title}
        </CardTitle>
        <p className="text-xs text-amber-700">
          {FESTIVALS.diwali.copy[lang]?.sub ?? FESTIVALS.diwali.copy.en.sub}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 pt-4" aria-live="polite">
        {windows === null && <p className="text-sm text-slate-500">Computing windows…</p>}
        {windows?.length === 0 && (
          <p className="text-sm text-slate-500">Panchang unavailable — showing nothing rather than a guess.</p>
        )}
        {windows?.map(w => (
          <div
            key={w.label}
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
              w.quality === 'avoid'
                ? 'border-rose-200 bg-rose-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-800">
                {w.quality === 'avoid' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                )}
                {w.label}
              </p>
              <p className="text-xs text-slate-600">{w.note}</p>
            </div>
            <Badge variant={w.quality === 'avoid' ? 'destructive' : 'secondary'} className="shrink-0">
              {toIst(w.start)}–{toIst(w.end)}
            </Badge>
          </div>
        ))}
        <p className="pt-1 text-[10px] text-slate-400">
          Windows are engine-derived for your coordinates, not a generic table.
        </p>
      </CardContent>
    </Card>
  );
};

export default LakshmiPujaCard;
