import React from 'react';
import { DashaTimeline } from '@/components/supplements/DashaTimeline';
import { MainLayout } from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function DetailedDashaTimelinePage() {
  return (
    <MainLayout>
      <SEO
        title="Detailed Vimshottari Dasha Timeline"
        description="Complete Vimshottari Dasha timeline with Mahadasha, Antardasha, and Pratyantar Dasha"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Detailed Vimshottari Dasha Timeline
          </h1>
          <DashaTimeline />
        </div>
      </div>
    </MainLayout>
  );
}
