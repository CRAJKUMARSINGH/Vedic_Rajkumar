import React from 'react';
import { CompatibilityPanel } from '@/components/supplements/CompatibilityPanel';
import { MainLayout } from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function CompatibilityPage() {
  return (
    <MainLayout>
      <SEO
        title="Kundali Matching - Ashta Koota"
        description="36-point Ashta Koota kundali matching with deep compatibility analysis"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Kundali Matching — Ashta Koota
          </h1>
          <CompatibilityPanel />
        </div>
      </div>
    </MainLayout>
  );
}
