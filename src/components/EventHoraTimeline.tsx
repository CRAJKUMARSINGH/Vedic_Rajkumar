/**
 * src/components/EventHoraTimeline.tsx
 *
 * Generalized Hora Timeline component — shows current hora + timeline
 * of horas from now until the event.  Works for any event date/time,
 * not hardcoded to Priyansh.
 *
 * Adapted from SUPPLEMENTS/Transit-Prospects-Analysis CountdownTimer.tsx
 * but generalized: accepts any target UTC timestamp + event label.
 */

import React, { useState, useEffect } from 'react';
import type { HoraSlot } from '@/services/vedicAstroEngine';

interface Props {
  horaTimeline: HoraSlot[];
  eventLabel?: string;
  lang?: 'en' | 'hi';
}

const HORA_COLORS: Record<string, { bg: string; border: string; text: string; glyph: string }> = {
  Sun:     { bg: 'hsl(30 95% 55% / 0.10)',  border: 'hsl(30 95% 55% / 0.35)',  text: '#f97316', glyph: '☉' },
  Moon:    { bg: 'hsl(210 60% 55% / 0.10)', border: 'hsl(210 60% 55% / 0.35)', text: '#93c5fd', glyph: '☽' },
  Mars:    { bg: 'hsl(0 72% 51% / 0.10)',   border: 'hsl(0 72% 51% / 0.35)',   text: '#f87171', glyph: '♂' },
  Mercury: { bg: 'hsl(160 70% 40% / 0.10)', border: 'hsl(160 70% 40% / 0.35)', text: '#34d399', glyph: '☿' },
  Jupiter: { bg: 'hsl(45 95% 55% / 0.10)',  border: 'hsl(45 95% 55% / 0.35)',  text: '#fcd34d', glyph: '♃' },
  Venus:   { bg: 'hsl(320 80% 60% / 0.10)', border: 'hsl(320 80% 60% / 0.35)', text: '#f9a8d4', glyph: '♀' },
  Saturn:  { bg: 'hsl(270 50% 45% / 0.10)', border: 'hsl(270 50% 45% / 0.35)', text: '#c4b5fd', glyph: '♄' },
};

const HORA_QUALITIES: Record<string, { en: string; hi: string }> = {
  Sun:     { en: 'Authority & recognition',      hi: 'प्राधिकार और पहचान' },
  Moon:    { en: 'Intuition & connections',       hi: 'अंतर्ज्ञान और संपर्क' },
  Mars:    { en: 'Energy & assertion',            hi: 'ऊर्जा और दृढ़ता' },
  Mercury: { en: 'Communication & intellect',    hi: 'संचार और बुद्धि' },
  Jupiter: { en: 'Wisdom & expansion',           hi: 'ज्ञान और विस्तार' },
  Venus:   { en: 'Charm & career gains',         hi: 'आकर्षण और करियर लाभ' },
  Saturn:  { en: 'Discipline & structure',       hi: 'अनुशासन और संरचना' },
};

function formatLocal(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function EventHoraTimeline({ horaTimeline, eventLabel, lang = 'en' }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const isHi = lang === 'hi';

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  if (!horaTimeline || horaTimeline.length === 0) return null;

  // Find current hora from timeline
  const currentSlot = horaTimeline.find(s => now >= s.startsAt && now < s.endsAt)
    ?? horaTimeline[0];

  // Find event hora (marked in timeline)
  const eventSlot = horaTimeline.find(s => !s.isNow) ?? horaTimeline[horaTimeline.length - 1];

  const cur = HORA_COLORS[currentSlot.planet] ?? HORA_COLORS.Jupiter;
  const secsLeft = Math.max(0, Math.floor((currentSlot.endsAt - now) / 1000));
  const minsLeft = Math.floor(secsLeft / 60);
  const secsMod = secsLeft % 60;

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/30 dark:to-violet-950/30 p-4 space-y-4">

      {/* Section header */}
      <div>
        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
          🕐 {isHi ? 'होरा टाइमलाइन' : 'Hora Timeline'}
        </h4>
        {eventLabel && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{eventLabel}</p>
        )}
      </div>

      {/* Two current-hora cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Current hora */}
        <div
          className="rounded-lg p-3 space-y-1"
          style={{ background: cur.bg, border: `1px solid ${cur.border}` }}
        >
          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
            {isHi ? 'वर्तमान होरा' : 'Current Hora'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: cur.text }}>{cur.glyph}</span>
            <div>
              <div className="text-xs font-bold" style={{ color: cur.text }}>
                {currentSlot.planet} {isHi ? 'होरा' : 'Hora'}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isHi
                  ? HORA_QUALITIES[currentSlot.planet]?.hi
                  : HORA_QUALITIES[currentSlot.planet]?.en}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {isHi ? 'बदलेगा' : 'Changes in'} {minsLeft}m {String(secsMod).padStart(2, '0')}s
          </div>
        </div>

        {/* Event hora (first non-current slot with a future time) */}
        {(() => {
          const evSlot = horaTimeline.find(s => s.startsAt > now);
          if (!evSlot) return null;
          const ev = HORA_COLORS[evSlot.planet] ?? HORA_COLORS.Jupiter;
          return (
            <div
              className="rounded-lg p-3 space-y-1"
              style={{ background: ev.bg, border: `1px solid ${ev.border}` }}
            >
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">
                {isHi ? 'आगामी होरा' : 'Next Hora'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl" style={{ color: ev.text }}>{ev.glyph}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: ev.text }}>
                    {evSlot.planet} {isHi ? 'होरा' : 'Hora'}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatLocal(evSlot.startsAt)} — {formatLocal(evSlot.endsAt)}
                  </div>
                </div>
              </div>
              <div
                className="text-[10px] font-semibold"
                style={{ color: ev.text }}
              >
                {evSlot.quality === 'excellent' ? '✦ Excellent' : evSlot.quality === 'good' ? '✓ Good' : '○ Neutral'}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Expandable timeline */}
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
        >
          <span>{open ? '▾' : '▸'}</span>
          <span>{isHi ? `होरा अनुक्रम (${horaTimeline.length} होरे)` : `Hora sequence (${horaTimeline.length} slots)`}</span>
        </button>

        {open && (
          <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
            {horaTimeline.map((slot, i) => {
              const s = HORA_COLORS[slot.planet] ?? HORA_COLORS.Jupiter;
              const isActive = now >= slot.startsAt && now < slot.endsAt;
              return (
                <div
                  key={slot.startsAt}
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs"
                  style={{
                    background: isActive ? s.bg : 'transparent',
                    border: isActive ? `1px solid ${s.border}` : '1px solid transparent',
                  }}
                >
                  <span className="w-5 text-center flex-shrink-0 text-sm" style={{ color: s.text }}>
                    {s.glyph}
                  </span>
                  <span className="font-semibold w-14 flex-shrink-0" style={{ color: s.text }}>
                    {slot.planet}
                  </span>
                  <span className="text-muted-foreground flex-1 text-[10px]">
                    {formatLocal(slot.startsAt)} – {formatLocal(slot.endsAt)}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                  >
                    {slot.quality === 'excellent' ? '✦' : slot.quality === 'good' ? '✓' : '○'}
                    {' '}{slot.quality}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      ← {isHi ? 'अभी' : 'Now'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
