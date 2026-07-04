import { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  Scale,
  Target,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartData } from '@/hooks/useChartCalculation';
import {
  runCurrentDashaForecast,
  type ReferenceType,
  type DashaForecastResult,
} from '@/services/dashaForecastService';
import { buildConclusiveJatakJudgment } from '@/services/conclusiveJatakJudgmentService';

interface DashaForecastPanelProps {
  chart: ChartData;
  referenceType: ReferenceType;
}

function ForecastMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function buildForecast(chart: ChartData, referenceType: ReferenceType): DashaForecastResult | null {
  const planets = chart.planetaryPositions?.planets;
  const currentMahadasha = chart.dasha?.currentMahadasha;
  if (!planets || !currentMahadasha) return null;

  return runCurrentDashaForecast({
    referenceType,
    planets,
    ascendantRashiIndex: chart.ascendant?.ascendant.rashiIndex ?? 0,
    currentMahadasha,
    currentAntardasha: chart.dasha?.currentAntardasha,
    shadbala: chart.shadbala,
    divisionalCharts: chart.divisionalCharts,
  });
}

export default function DashaForecastPanel({ chart, referenceType }: DashaForecastPanelProps) {
  const forecast = useMemo(() => buildForecast(chart, referenceType), [chart, referenceType]);
  const conclusiveJudgment = useMemo(
    () => (forecast ? buildConclusiveJatakJudgment(chart, forecast, referenceType) : null),
    [chart, forecast, referenceType]
  );

  if (!forecast) return null;

  return (
    <Card className="max-w-2xl mx-auto border-primary/20 shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="rounded-lg uppercase tracking-wide">
            {forecast.referenceType === 'natal' ? 'Birth Chart Basis' : 'Question-Time Basis'}
          </Badge>
          <Badge className="rounded-lg bg-primary text-primary-foreground">
            {forecast.overallProbability}% delivery index
          </Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Deep Current Dasha Forecast
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{forecast.referenceNote}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Therefore
          </div>
          <p className="text-sm leading-6">{forecast.thereforeClause}</p>
        </div>

        {conclusiveJudgment && (
          <div className="rounded-lg border border-emerald-300/60 bg-emerald-50/70 p-4 dark:bg-emerald-950/10">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                <Scale className="h-4 w-4" />
                Conclusive Jatak Judgment
              </div>
              <Badge className="rounded-lg bg-emerald-700 text-white">
                {conclusiveJudgment.verdictType} - {conclusiveJudgment.score}/100
              </Badge>
            </div>
            <p className="text-sm font-semibold leading-6 text-emerald-950 dark:text-emerald-100">
              {conclusiveJudgment.headline}
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-950/85 dark:text-emerald-100/85">
              {conclusiveJudgment.therefore}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {conclusiveJudgment.evidence.map(item => (
                <div
                  key={item.layer}
                  className="rounded-md border border-emerald-200 bg-white/75 p-3 dark:bg-background/40"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-200">
                      {item.layer}
                    </p>
                    <Badge
                      variant="outline"
                      className="rounded-lg border-emerald-400 text-emerald-800 dark:text-emerald-200"
                    >
                      {item.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.finding}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-emerald-200 bg-white/75 p-3 dark:bg-background/40">
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-200">
                Conflict resolution
              </p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {conclusiveJudgment.conflictResolution.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 p-4 dark:bg-amber-950/10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
              <Layers3 className="h-4 w-4" />
              {forecast.subjectiveAnalysis.title}
            </div>
            <Badge
              variant="outline"
              className="rounded-lg border-amber-400 text-amber-800 dark:text-amber-200"
            >
              Subjective Dasha Phaladesh
            </Badge>
          </div>
          <p className="text-sm leading-6 text-amber-950/85 dark:text-amber-100/85">
            {forecast.subjectiveAnalysis.finalJatakVerdict}
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-amber-200 bg-white/70 p-3 dark:bg-background/40">
              <p className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
                Planetary mandate
              </p>
              <ul className="space-y-2 text-sm leading-6">
                {forecast.subjectiveAnalysis.planetaryMandate.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-amber-200 bg-white/70 p-3 dark:bg-background/40">
              <p className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
                Inner script
              </p>
              <div className="space-y-3 text-sm leading-6">
                <p>{forecast.subjectiveAnalysis.mdAdSynthesis}</p>
                <p>{forecast.subjectiveAnalysis.d9InnerScript}</p>
                <p>{forecast.subjectiveAnalysis.shadbalaGate}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-amber-200 bg-white/70 p-3 dark:bg-background/40">
            <p className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
              Psychological weather
            </p>
            <ul className="grid gap-2 text-sm leading-6 md:grid-cols-2">
              {forecast.subjectiveAnalysis.psychologicalWeather.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ForecastMetric
            label="MD Lord"
            value={`${forecast.mdAnalysis.planet} (${forecast.mdAnalysis.natalDignity})`}
          />
          <ForecastMetric
            label="AD Lord"
            value={
              forecast.adAnalysis
                ? `${forecast.adAnalysis.planet} (${forecast.adAnalysis.natalDignity})`
                : 'Not active'
            }
          />
          <ForecastMetric
            label="Shadbala Gate"
            value={
              forecast.mdAnalysis.shadbalaRupas === null
                ? 'Unknown'
                : `${forecast.mdAnalysis.shadbalaRupas.toFixed(2)} rupas`
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              MD Placement
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {forecast.mdAnalysis.placementVerdict}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="h-4 w-4 text-primary" />
              MD / AD Relationship
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {forecast.mdAdRelationship?.combinedTheme ?? 'No Antardasha relationship active.'}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Layers3 className="h-4 w-4 text-primary" />
            Jatak-wise synthesis
          </div>
          <p className="text-sm font-medium">{forecast.detailedSynthesis.subjectSignature}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Judgment stack
              </p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {forecast.detailedSynthesis.judgmentStack.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Dasha protocol
              </p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {forecast.detailedSynthesis.dashaProtocol.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Life-area hierarchy
            </p>
            <ul className="space-y-1 text-sm leading-6">
              {forecast.detailedSynthesis.lifeAreaHierarchy.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Life-area verdicts</p>
          {forecast.subjectiveAnalysis.domainReadings.map(area => (
            <div key={area.area} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold capitalize">{area.area}</span>
                <Badge variant="secondary" className="rounded-lg">
                  {forecast.lifeAreaForecasts.find(item => item.area === area.area)?.probability ??
                    0}
                  %
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{area.promise}</p>
              <div className="mt-3 grid gap-2 text-xs leading-5 sm:grid-cols-3">
                <p>
                  <span className="font-semibold">Obstruction:</span> {area.obstruction}
                </p>
                <p>
                  <span className="font-semibold">Timing:</span> {area.timing}
                </p>
                <p>
                  <span className="font-semibold">Instruction:</span> {area.subjectiveInstruction}
                </p>
              </div>
              <p className="mt-2 text-sm font-medium">{area.therefore}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-2 text-sm font-semibold">Intervention map</p>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {forecast.subjectiveAnalysis.interventionMap.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {forecast.failureMode && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Failure mode
            </div>
            <p className="text-sm leading-6">{forecast.failureMode}</p>
            {forecast.remedyTarget && (
              <p className="mt-2 text-sm font-semibold">Remedy target: {forecast.remedyTarget}</p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="mb-2 text-sm font-semibold">Classical frame</p>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            {forecast.classicalReferences.map(reference => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
