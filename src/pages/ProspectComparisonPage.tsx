/**
 * ProspectComparisonPage.tsx
 *
 * Compare one base person against up to 5 prospects using the enhanced
 * Ashtakuta engine. Shows a ranked table with the recommended match highlighted.
 *
 * Route: /prospect-comparison
 */

import React, { useState, useCallback } from 'react';
import { Star, Download, Users, Plus, Trash2, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { compareProspects } from '@/features/matchmaking/stubs';
import { exportMatchReport } from '@/services/matchmakingPdfService';
import { calculateEnhancedAshtakuta } from '@/services/ashtakutaServiceEnhanced';
import JATAKS_RAW from '@/data/jataks/JATAKS_DATABASE.json';
import type { ProspectComparison, ProspectSummary } from '@/features/matchmaking/types';
import type { BirthData } from '@/features/kundli/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JatakRecord {
  id: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  state?: string;
  country?: string;
  relationship?: string;
  nakshatra?: string;
  moonRashi?: string;
}

type EntrySource =
  | { source: 'jatak'; jatak: JatakRecord }
  | { source: 'manual'; name: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JATAKS: JatakRecord[] = (JATAKS_RAW as { jataks: JatakRecord[] }).jataks;

function entryToBirthData(entry: EntrySource): BirthData | null {
  if (entry.source === 'jatak') {
    const j = entry.jatak;
    return {
      name: j.name,
      date: j.dateOfBirth,
      time: j.timeOfBirth,
      timezone: 'Asia/Kolkata',
      latitude: 0,   // compareProspects resolves via geocoding
      longitude: 0,
      place: j.placeOfBirth,
    };
  }
  if (!entry.name || !entry.dateOfBirth || !entry.timeOfBirth || !entry.placeOfBirth) return null;
  return {
    name: entry.name,
    date: entry.dateOfBirth,
    time: entry.timeOfBirth,
    timezone: 'Asia/Kolkata',
    latitude: 0,
    longitude: 0,
    place: entry.placeOfBirth,
  };
}

const ratingColor: Record<string, string> = {
  Excellent: 'text-emerald-400',
  Good: 'text-blue-400',
  Average: 'text-amber-400',
  Poor: 'text-red-400',
};

const ratingBg: Record<string, string> = {
  Excellent: 'bg-emerald-500/15 border-emerald-500/30',
  Good: 'bg-blue-500/15 border-blue-500/30',
  Average: 'bg-amber-500/15 border-amber-500/30',
  Poor: 'bg-red-500/15 border-red-500/30',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function JatakDropdown({
  value,
  onChange,
  label,
}: {
  value: EntrySource | null;
  onChange: (v: EntrySource) => void;
  label: string;
}) {
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === '__manual__') { setShowManual(true); return; }
    const jatak = JATAKS.find((j) => j.id === id);
    if (jatak) { setShowManual(false); onChange({ source: 'jatak', jatak }); }
  };

  const handleManualChange = (field: string, val: string) => {
    const updated = { ...manual, [field]: val };
    setManual(updated);
    onChange({ source: 'manual', ...updated });
  };

  const selectedId = value?.source === 'jatak' ? value.jatak.id : '';

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="relative">
        <select
          value={selectedId || (showManual ? '__manual__' : '')}
          onChange={handleSelect}
          aria-label={`Select ${label} from database`}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
                     appearance-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          <option value="" disabled>Select from database…</option>
          {JATAKS.map((j) => (
            <option key={j.id} value={j.id} className="bg-slate-900">
              {j.name} · {j.placeOfBirth} ({j.dateOfBirth})
            </option>
          ))}
          <option value="__manual__" className="bg-slate-900">✏ Enter manually…</option>
        </select>
        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {showManual && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {(['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth'] as const).map((field) => (
            <div key={field} className={field === 'name' || field === 'placeOfBirth' ? 'col-span-2' : ''}>
              <input
                type={field === 'dateOfBirth' ? 'date' : field === 'timeOfBirth' ? 'time' : 'text'}
                placeholder={
                  field === 'name' ? 'Full Name' :
                  field === 'dateOfBirth' ? 'Date of Birth' :
                  field === 'timeOfBirth' ? 'Time (HH:MM)' : 'Place of Birth'
                }
                value={manual[field]}
                onChange={(e) => handleManualChange(field, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white
                           placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MAX_PROSPECTS = 5;

export default function ProspectComparisonPage() {
  const [basePerson, setBasePerson] = useState<EntrySource | null>(null);
  const [prospects, setProspects] = useState<Array<EntrySource | null>>([null]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ProspectComparison | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState<Record<string, boolean>>({});

  const addProspect = () => {
    if (prospects.length < MAX_PROSPECTS) setProspects((p) => [...p, null]);
  };

  const removeProspect = (idx: number) => {
    setProspects((p) => p.filter((_, i) => i !== idx));
  };

  const updateProspect = (idx: number, entry: EntrySource) => {
    setProspects((p) => p.map((v, i) => (i === idx ? entry : v)));
  };

  const handleCompare = useCallback(async () => {
    const newErrors: Record<string, string> = {};

    if (!basePerson) { newErrors.base = 'Please select a base person.'; }

    const validProspects = prospects.filter(Boolean) as EntrySource[];
    if (validProspects.length === 0) newErrors.prospects = 'Add at least one prospect.';

    const bdBase = basePerson ? entryToBirthData(basePerson) : null;
    if (basePerson && !bdBase) newErrors.base = 'Please complete all base person fields.';

    const bdProspects = validProspects.map((p) => entryToBirthData(p));
    bdProspects.forEach((bd, i) => {
      if (!bd) newErrors[`prospect_${i}`] = `Prospect ${i + 1}: all fields required.`;
    });

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    setResult(null);

    try {
      const comparison = await compareProspects(
        bdBase!,
        bdProspects.filter(Boolean) as BirthData[],
      );
      setResult(comparison);
    } catch (err) {
      setErrors({ global: `Comparison failed: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setLoading(false);
    }
  }, [basePerson, prospects]);

  const handleDownloadPdf = useCallback(
    async (summary: ProspectSummary, prospectEntry: EntrySource | null) => {
      if (!basePerson || !prospectEntry) return;
      setPdfGenerating((p) => ({ ...p, [summary.prospectId]: true }));
      try {
        const baseData = entryToBirthData(basePerson);
        const prospectData = entryToBirthData(prospectEntry);
        if (!baseData || !prospectData) return;

        const enhanced = await calculateEnhancedAshtakuta(
          { name: baseData.name, dateOfBirth: baseData.date, timeOfBirth: baseData.time, placeOfBirth: baseData.place },
          { name: prospectData.name, dateOfBirth: prospectData.date, timeOfBirth: prospectData.time, placeOfBirth: prospectData.place },
        );

        await exportMatchReport(enhanced, {
          person1DisplayName: baseData.name,
          person2DisplayName: prospectData.name,
          language: 'en',
        });
      } catch (err) {
        console.error('[ProspectComparisonPage] PDF failed:', err);
      } finally {
        setPdfGenerating((p) => ({ ...p, [summary.prospectId]: false }));
      }
    },
    [basePerson],
  );

  return (
    <>
      <SEO
        title="Prospect Comparison | Kundli Milan | Vedic Rajkumar"
        description="Compare multiple marriage prospects side-by-side using classical Ashtakuta scoring with Manglik cross-check."
      />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Prospect Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Select a base person and up to {MAX_PROSPECTS} prospects to compare Ashtakuta compatibility with Manglik cross-check.
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-5">
          {/* Base person */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Base Person</h2>
            <JatakDropdown
              value={basePerson}
              onChange={setBasePerson}
              label="Base Person"
            />
            {errors.base && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.base}
              </p>
            )}
          </div>

          {/* Prospects */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Prospects</h2>
            <div className="space-y-4">
              {prospects.map((entry, idx) => (
                <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.015] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Prospect {idx + 1}</span>
                    {prospects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProspect(idx)}
                        aria-label={`Remove prospect ${idx + 1}`}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <JatakDropdown
                    value={entry}
                    onChange={(v) => updateProspect(idx, v)}
                    label={`Prospect ${idx + 1}`}
                  />
                  {errors[`prospect_${idx}`] && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors[`prospect_${idx}`]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {prospects.length < MAX_PROSPECTS && (
              <button
                type="button"
                onClick={addProspect}
                className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300
                           transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Prospect ({prospects.length}/{MAX_PROSPECTS})
              </button>
            )}

            {errors.prospects && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.prospects}
              </p>
            )}
          </div>

          {/* Global error */}
          {errors.global && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
              {errors.global}
            </div>
          )}

          {/* Compare button */}
          <button
            type="button"
            onClick={handleCompare}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50
                       text-black font-bold text-sm transition-colors flex items-center justify-center gap-2
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Compare prospects"
          >
            {loading
              ? <><span className="animate-spin inline-block">⚙</span> Calculating…</>
              : <><Users className="w-4 h-4" /> Compare Prospects</>}
          </button>
        </div>

        {/* Loading */}
        <div aria-live="polite" aria-atomic="true">
          {loading && (
            <p className="text-center text-sm text-slate-400 py-4">
              Calculating compatibility for all prospects…
            </p>
          )}
        </div>

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5">
            {/* Recommended banner */}
            {result.prospects.length > 0 && (
              <div
                className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5"
                aria-label="Recommended match"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
                  <span className="text-sm font-bold text-emerald-300">Recommended Match</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.recommendationReason}</p>
              </div>
            )}

            {/* Comparison table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-x-auto">
              <table role="table" className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Score /36</th>
                    <th scope="col" className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Manglik</th>
                    <th scope="col" className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Doshas</th>
                    <th scope="col" className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                    <th scope="col" className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.prospects.map((summary, _rowIdx) => {
                    const isRecommended = summary.prospectId === result.recommendedProspectId;
                    const matchedEntry = prospects[
                      // Find index by matching name since prospectId is generated
                      prospects.findIndex((p) => {
                        if (!p) return false;
                        const name = p.source === 'jatak' ? p.jatak.name : p.name;
                        return name === summary.name;
                      })
                    ] ?? null;

                    return (
                      <tr
                        key={summary.prospectId}
                        className={`transition-colors ${
                          isRecommended
                            ? 'ring-2 ring-inset ring-emerald-500/40 bg-emerald-950/10'
                            : 'hover:bg-white/[0.015]'
                        }`}
                        aria-label={isRecommended ? `${summary.name} — Recommended match` : summary.name}
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isRecommended && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                            )}
                            <div>
                              <p className="font-semibold text-white text-sm">{summary.name}</p>
                              {isRecommended && (
                                <span className="text-[10px] text-emerald-400 font-semibold">⭐ Recommended</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-3 py-3 text-center">
                          <span className="text-lg font-bold text-white">{summary.ashtakutaScore}</span>
                          <span className="text-slate-500 text-xs">/36</span>
                        </td>

                        {/* Manglik */}
                        <td className="px-3 py-3 text-center">
                          {summary.manglikDosha
                            ? <span className="text-xs text-red-400 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />Mismatch</span>
                            : <span className="text-xs text-emerald-400 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />OK</span>}
                        </td>

                        {/* Critical Doshas */}
                        <td className="px-3 py-3 text-center">
                          {summary.criticalDosha
                            ? <span className="text-xs text-red-400">⚠ Present</span>
                            : <span className="text-xs text-emerald-400">✓ None</span>}
                        </td>

                        {/* Rating */}
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ratingBg[summary.overallRating] ?? ''} ${ratingColor[summary.overallRating] ?? 'text-slate-400'}`}>
                            {summary.overallRating}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(summary, matchedEntry)}
                            disabled={pdfGenerating[summary.prospectId]}
                            aria-label={`Download PDF for ${summary.name}`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5
                                       rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors
                                       disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          >
                            {pdfGenerating[summary.prospectId]
                              ? <span className="animate-spin">⚙</span>
                              : <Download className="w-3 h-3" />}
                            PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Score guide */}
            <div className="rounded-xl border border-white/8 bg-white/[0.015] p-4">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Score Reference</p>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                {[['28+', 'Excellent'], ['21–27', 'Good'], ['14–20', 'Average'], ['<14', 'Poor']].map(([score, label]) => (
                  <div key={score} className="rounded-lg bg-white/[0.03] border border-white/8 p-2">
                    <p className="font-bold text-amber-300">{score}</p>
                    <p className="text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
