import React from 'react';
import { YogaInsightsPanel } from '@/components/supplements/YogaInsightsPanel';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function YogaInsightsSupplementPage() {
  return (
    <MainLayout>
      <SEO
        title="Yoga Insights"
        description="100+ Vedic yoga detection with lifecycle status and timing information"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">
            Yoga Insights
          </h1>
          <YogaInsightsPanel />
        </div>
      </div>
    </MainLayout>
  );
}
