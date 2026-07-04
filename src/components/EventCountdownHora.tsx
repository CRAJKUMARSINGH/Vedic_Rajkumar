import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { HoraSlot } from '@/services/vedicAstroEngine';

interface Props {
  eventDate: string;
  eventTime: string;
  horaTimeline: HoraSlot[];
  lang?: 'en' | 'hi';
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now / Past';
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

const QUALITY_COLORS: Record<string, string> = {
  excellent: 'border-emerald-400 bg-emerald-50 text-emerald-800',
  good: 'border-blue-400 bg-blue-50 text-blue-800',
  neutral: 'border-gray-300 bg-gray-50 text-gray-700',
};

export default function EventCountdownHora({ eventDate, eventTime, horaTimeline, lang = 'en' }: Props) {
  const isHi = lang === 'hi';
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(Date.now());

  const eventMs = new Date(`${eventDate}T${eventTime}:00`).getTime();
  const remaining = eventMs - now;
  const currentHora = horaTimeline.find(h => h.isNow);
  const eventHora = horaTimeline.find(h => eventMs >= h.startsAt && eventMs < h.endsAt);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
          <Clock className="w-4 h-4" />
          {isHi ? 'घटना उलटी गिनती और होरा' : 'Event Countdown & Hora Timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {isHi ? 'शेष समय' : 'Time Remaining'}
            </p>
            <p className="text-2xl font-bold text-indigo-700 font-mono">{formatCountdown(remaining)}</p>
          </div>
          {currentHora && (
            <div>
              <p className="text-[10px] text-muted-foreground">{isHi ? 'वर्तमान होरा' : 'Current Hora'}</p>
              <Badge className={QUALITY_COLORS[currentHora.quality] ?? ''}>
                {currentHora.symbol} {currentHora.planet}
              </Badge>
            </div>
          )}
          {eventHora && (
            <div>
              <p className="text-[10px] text-muted-foreground">{isHi ? 'घटना होरा' : 'Event Hora'}</p>
              <Badge className={QUALITY_COLORS[eventHora.quality] ?? ''}>
                {eventHora.symbol} {eventHora.planet} Hora
              </Badge>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {isHi ? 'होरा समयरेखा देखें' : 'Show hora timeline'}
        </button>

        {expanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {horaTimeline.map((slot, i) => {
              const start = new Date(slot.startsAt);
              const label = `${start.getHours().toString().padStart(2, '0')}:00`;
              return (
                <div
                  key={i}
                  className={`text-xs p-2 rounded border ${slot.isNow ? 'ring-2 ring-indigo-400' : ''} ${QUALITY_COLORS[slot.quality] ?? 'border-gray-200'}`}
                >
                  <span className="font-mono">{label}</span>
                  <span className="ml-1">{slot.symbol} {slot.planet}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
