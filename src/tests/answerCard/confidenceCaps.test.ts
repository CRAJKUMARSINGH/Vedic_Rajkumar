import { describe, it, expect } from 'vitest';
import { deriveConfidenceV2, confidenceWord } from '@/services/answerCard/confidence';
import type { ConclusiveJatakJudgment } from '@/services/conclusiveJatakJudgmentService';

const j = (conflicts = 0): ConclusiveJatakJudgment => ({
  verdictType: 'DELIVERING', score: 80, therefore: 'x',
  houseVerdict: 'ok', transitVerdict: 'ok',
  conflictResolution: Array.from({ length: conflicts }, (_, i) => `c${i}`),
  evidence: [{ layer: 'l', score: 80, finding: 'f' }],
} as unknown as ConclusiveJatakJudgment);

const base = {
  judgment: j(0),
  degradedEphemeris: false,
  flags: { savCertified: true, ashtakavargaAvailable: true, dedicatedMoonTransit: true },
};

describe('deriveConfidenceV2 — WS-2 caps', () => {
  it('degraded ephemeris caps at C1=0.40', () => {
    const r = deriveConfidenceV2({ ...base, degradedEphemeris: true });
    expect(r.cappedBy).toBe('C1');
    expect(r.value).toBeLessThanOrEqual(0.40);
    expect(confidenceWord(r.value, 'en')).toBe('limited');
  });
  it('3+ conflicts cap at C11=0.62', () => {
    const r = deriveConfidenceV2({ ...base, judgment: j(3) });
    expect(r.cappedBy).toBe('C11');
    expect(r.value).toBeLessThanOrEqual(0.62);
  });
  it('missing SAV caps at C8=0.72; missing AV at C9=0.75', () => {
    const r8 = deriveConfidenceV2({ ...base, flags: { ...base.flags, savCertified: false } });
    expect(r8.cappedBy).toBe('C8');
    const r9 = deriveConfidenceV2({ ...base, flags: { ...base.flags, ashtakavargaAvailable: false } });
    expect(r9.cappedBy).toBe('C9');
  });
  it('no cap → ceiling 0.90, floor 0.20 preserved', () => {
    const r = deriveConfidenceV2(base);
    expect(r.cappedBy).toBeNull();
    expect(r.cap).toBe(0.90);
    expect(r.value).toBeGreaterThanOrEqual(0.2);
    expect(r.value).toBeLessThanOrEqual(0.9);
  });
});
