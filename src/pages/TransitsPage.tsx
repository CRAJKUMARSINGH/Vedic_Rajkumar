import React from 'react';
import { TransitsPanel } from '@/components/TransitsPanel';
import { TransitTimeline } from '@/components/transits/TransitTimeline';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';
import type { NatalChart } from '@/services/transits/transitService';

/** Demo natal longitudes so the Gochar timeline can render without a saved chart. */
const SAMPLE_NATAL: NatalChart = {
  lagnaSign: 0,
  planets: {
    Sun: 15,
    Moon: 45,
    Mars: 80,
    Mercury: 20,
    Jupiter: 210,
    Venus: 40,
    Saturn: 300,
    Rahu: 120,
    Ketu: 300,
  },
};

export default function TransitsPage() {
  return (
    <MainLayout>
      <SEO
        title="Planetary Transits"
        description="Detailed planetary transit analysis"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Planetary Transits
          </h1>
          <TransitsPanel />
          <section className="mt-10 rounded-xl border border-slate-700 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-xl font-semibold">Gochar timeline</h2>
            <TransitTimeline natal={SAMPLE_NATAL} />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
