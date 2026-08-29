import React, { useState } from 'react';
import { useChartCalculation } from '@/hooks/useChartCalculation';
import { EnhancedBirthInputForm } from '@/components/EnhancedBirthInputForm';
import { SynthesisDashboard } from '@/components/synthesis/SynthesisDashboard';
import { BirthChartInput } from '@/lib/astrology/types';
import { MainLayout } from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function SynthesisPage() {
  const [birthData, setBirthData] = useState<BirthChartInput | null>(null);
  const chart = useChartCalculation(birthData);

  return (
    <MainLayout>
      <SEO
        title="13-Layer Synthesis Dashboard"
        description="Comprehensive astrological synthesis combining all classical Vedic systems"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            13-Layer Synthesis Dashboard
          </h1>
          
          <div className="mb-8">
            <EnhancedBirthInputForm onSubmit={setBirthData} />
          </div>

          {chart && (
            <div className="mt-8">
              <SynthesisDashboard chart={chart} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
