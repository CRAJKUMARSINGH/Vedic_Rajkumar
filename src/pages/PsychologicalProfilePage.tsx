import React from 'react';
import { PsychologicalProfilePanel } from '@/components/supplements/PsychologicalProfilePanel';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function PsychologicalProfilePage() {
  return (
    <MainLayout>
      <SEO
        title="Vedic Psychological Profile"
        description="Deep psychological analysis using classical Vedic Jyotisha principles"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Vedic Psychological Profile
          </h1>
          <PsychologicalProfilePanel />
        </div>
      </div>
    </MainLayout>
  );
}
