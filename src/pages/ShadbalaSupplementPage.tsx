import React from 'react';
import { ShadbalaPanel } from '@/components/supplements/ShadbalaPanel';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function ShadbalaSupplementPage() {
  return (
    <MainLayout>
      <SEO
        title="Shadbala Analysis"
        description="Six-fold planetary strength analysis (Sthana, Dig, Kala, Chesta, Naisargika, Drik Bala)"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Shadbala — Six-fold Strength
          </h1>
          <ShadbalaPanel />
        </div>
      </div>
    </MainLayout>
  );
}
