import React from 'react';
import { TransitsPanel } from '@/components/TransitsPanel';
import { MainLayout } from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

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
        </div>
      </div>
    </MainLayout>
  );
}
