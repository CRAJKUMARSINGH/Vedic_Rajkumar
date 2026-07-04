import React, { useState, useEffect, useMemo } from 'react';
import { ChartData } from '../../hooks/useChartCalculation';
import {
  AstrologicalContext,
  SynthesisDomain,
  SynthesisVerdict,
} from '../../services/synthesis/signalTypes';
import { runSynthesis } from '../../services/synthesis/synthesisEngine';
import { SynthesisVerdictCard } from './SynthesisVerdictCard';
import { SynthesisScorePanel } from './SynthesisScorePanel';
import { SynthesisEvidencePanel } from './SynthesisEvidencePanel';
import { SynthesisTimingCard } from './SynthesisTimingCard';

interface Props {
  chart: ChartData;
  isHi?: boolean;
}

export function SynthesisDashboard({ chart, isHi = false }: Props) {
  const [activeDomain, setActiveDomain] = useState<SynthesisDomain>('career');
  const [verdict, setVerdict] = useState<SynthesisVerdict | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Build the AstrologicalContext from ChartData
  const context = useMemo<AstrologicalContext | null>(() => {
    if (
      !chart.planetaryPositions ||
      !chart.ascendant ||
      !chart.dasha ||
      !chart.shadbala ||
      !chart.yogas ||
      !chart.ashtakavarga ||
      !chart.divisionalCharts
    ) {
      return null;
    }

    const planets = chart.planetaryPositions.planets.map(p => ({
      name: p.name,
      rashiIndex: p.rashiIndex,
      house: p.house,
      degrees: p.degrees,
      isRetrograde: p.retrograde ?? false,
      longitude: p.rashiIndex * 30 + p.degrees,
    }));

    return {
      planets,
      lagnaRashiIdx: chart.ascendant.ascendant.rashiIndex,
      shadabala: chart.shadbala.planets,
      shadabalaAnalysis: chart.shadbala,
      dasha: chart.dasha,
      yogaAnalysis: chart.yogas,
      // Mocking missing pieces for MVP that aren't natively in ChartData yet
      jaiminiAnalysis: {
        atmakaraka: null,
        padaLagna: {
          rashiIndex: chart.ascendant.ascendant.rashiIndex,
          rashiName: 'Unknown',
          degree: 0,
        },
        upapadaLagna: null,
        narrative: {
          soulDesire: '',
          publicImage: '',
          relationshipManifestation: '',
          careerPerception: '',
        },
      },
      transits: [
        { planet: 'Jupiter', house: 10, aspectsHouses: [2, 4, 6] },
        { planet: 'Saturn', house: 8, aspectsHouses: [10, 2, 5] },
      ],
      aspects: [],
      tenthLordName: 'Sun',
      divisional: {
        d9_strong: true,
        d10_strong: true,
        d60_strong: false,
      },
    };
  }, [chart]);

  useEffect(() => {
    if (!context) return;

    setIsSynthesizing(true);

    // In a real app this might be an async API call if the engine was backend
    // Since it's client-side, we run it immediately, but wrap in a small timeout for UI responsiveness
    const timer = setTimeout(() => {
      runSynthesis({ domain: activeDomain }, context)
        .then(res => {
          setVerdict(res);
          setIsSynthesizing(false);
        })
        .catch(err => {
          console.error('Synthesis Engine Error:', err);
          setIsSynthesizing(false);
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [context, activeDomain]);

  const domains: { id: SynthesisDomain; label: string }[] = [
    { id: 'career', label: 'Career & Authority' },
    { id: 'marriage', label: 'Marriage & Partnership' },
    { id: 'wealth', label: 'Wealth & Assets' },
    { id: 'children', label: 'Progeny & Legacy' },
  ];

  if (!context) {
    return (
      <div className="p-4 border rounded-xl bg-muted/30 text-sm text-slate-500 text-center">
        Calculating precise astrological context for synthesis...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Domain Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {domains.map(d => (
          <button
            key={d.id}
            onClick={() => setActiveDomain(d.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeDomain === d.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {isSynthesizing && (
        <div className="py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-amber-800 font-medium">Running 13-Layer Synthesis Engine...</div>
        </div>
      )}

      {!isSynthesizing && verdict && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Verdict */}
          <div className="md:col-span-12">
            <SynthesisVerdictCard verdict={verdict} />
          </div>

          {/* Scores Panel */}
          <div className="md:col-span-4">
            <SynthesisScorePanel scores={verdict.scores} />
          </div>

          {/* Timing */}
          <div className="md:col-span-4">
            <SynthesisTimingCard verdict={verdict} />
          </div>

          {/* Evidence Trace */}
          <div className="md:col-span-4">
            <SynthesisEvidencePanel trace={verdict.explanationTrace} />
          </div>
        </div>
      )}
    </div>
  );
}
