import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TraceNode } from '../../services/synthesis/signalTypes';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle } from 'lucide-react';

export function SynthesisEvidencePanel({ trace }: { trace: TraceNode[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Evidence Trace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {trace.map((node, i) => (
            <div key={i} className="flex gap-3 text-sm p-2 rounded-md border bg-slate-50">
              <div className="mt-0.5 shrink-0">
                {node.signedContribution >= 0 ? (
                  <PlusCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <MinusCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {node.layer}
                  </Badge>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {node.category}
                  </span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{node.explanation}</p>
              </div>
            </div>
          ))}
          {trace.length === 0 && (
            <div className="text-sm text-slate-500 italic text-center p-4">
              No evidence trace available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
