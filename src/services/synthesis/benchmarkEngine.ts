import { SynthesisDomain, AstrologicalContext } from './signalTypes';
import { runSynthesis } from './synthesisEngine';

export interface BenchmarkFixture {
  chartId: string;
  name: string;
  knownOutcomes: Partial<
    Record<
      SynthesisDomain,
      {
        expectedPromise: number; // 0-100
        expectedTimingClass: string;
        description: string;
      }
    >
  >;
  context: AstrologicalContext;
}

export interface BenchmarkResult {
  fixtureId: string;
  domain: SynthesisDomain;
  passed: boolean;
  actualPromise: number;
  expectedPromise: number;
  actualTimingClass: string;
  expectedTimingClass: string;
  discrepancyLog: string;
}

/**
 * Runs a suite of benchmark fixtures through the synthesis engine
 * to ensure that algorithmic changes do not regress known chart outcomes.
 */
export async function runBenchmarkSuite(
  fixtures: BenchmarkFixture[],
  domain: SynthesisDomain
): Promise<{
  total: number;
  passed: number;
  accuracy: number;
  results: BenchmarkResult[];
}> {
  const results: BenchmarkResult[] = [];
  let passedCount = 0;

  for (const fixture of fixtures) {
    if (!fixture.knownOutcomes[domain]) continue;

    const expected = fixture.knownOutcomes[domain]!;

    // Run the engine
    const verdict = await runSynthesis({ chartId: fixture.chartId, domain }, fixture.context);

    const promiseDiff = Math.abs(verdict.scores.promise - expected.expectedPromise);

    // We consider it a pass if promise is within 15 points and timing class matches
    const promisePassed = promiseDiff <= 15;
    const timingPassed = verdict.timingClass === expected.expectedTimingClass;

    const passed = promisePassed && timingPassed;
    if (passed) passedCount++;

    let log = '';
    if (!promisePassed) log += `Promise diff ${promiseDiff} exceeds threshold (15). `;
    if (!timingPassed) log += `Timing class mismatch. `;

    results.push({
      fixtureId: fixture.chartId,
      domain,
      passed,
      actualPromise: verdict.scores.promise,
      expectedPromise: expected.expectedPromise,
      actualTimingClass: verdict.timingClass,
      expectedTimingClass: expected.expectedTimingClass,
      discrepancyLog: log,
    });
  }

  return {
    total: results.length,
    passed: passedCount,
    accuracy: results.length > 0 ? (passedCount / results.length) * 100 : 0,
    results,
  };
}
