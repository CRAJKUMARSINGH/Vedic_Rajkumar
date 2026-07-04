import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { SynthesisVerdict } from '../../services/synthesis/signalTypes';

export function SynthesisVerdictCard({ verdict }: { verdict: SynthesisVerdict }) {
  const isHighConfidence = verdict.scores.confidence >= 70;

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-amber-900 flex items-center gap-2 text-xl">
            {isHighConfidence ? (
              <ShieldCheck className="text-green-600" />
            ) : (
              <ShieldAlert className="text-yellow-600" />
            )}
            {verdict.domain.toUpperCase()} VERDICT
          </CardTitle>
          <Badge variant="outline" className="border-amber-400 text-amber-800">
            Confidence: {verdict.scores.confidence}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-amber-900">Net Probability</span>
            <span className="font-bold text-amber-700">{verdict.scores.netProbability}%</span>
          </div>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-500"
              style={{ width: `${verdict.scores.netProbability}%` }}
            />
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-md border border-amber-100">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" /> Executive Summary
          </h4>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {verdict.conciseExplanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
