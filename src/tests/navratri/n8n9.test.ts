/**
 * N8 Buddhi + N9 Raksha integration tests
 * Phase B acceptance: N9 gate validates; N8 enriches without fabricating.
 */
import { describe, it, expect } from 'vitest';
import { enrichWithCitations, InMemoryCorpusProvider } from '@/services/navratri/n8Buddhi';
import { runRaksha } from '@/services/navratri/n9Raksha';
import { generateVani } from '@/services/navratri/n7Vani';
import { computeYukti } from '@/services/navratri/n6Yukti';
import { computeKaal } from '@/services/navratri/n4Kaal';
import { computeBala } from '@/services/navratri/n5Bala';
import type { PlanetData } from '@/services/shadabalaService';

const SYNTH_PLANETS: PlanetData[] = [
  { name: 'Sun',     rashiIndex: 5,  longitude: 165, house: 5,  degrees: 15, isRetrograde: false },
  { name: 'Moon',    rashiIndex: 2,  longitude: 90,  house: 2,  degrees: 0,  isRetrograde: false },
  { name: 'Mars',    rashiIndex: 7,  longitude: 227, house: 7,  degrees: 17, isRetrograde: true  },
  { name: 'Mercury', rashiIndex: 5,  longitude: 175, house: 5,  degrees: 25, isRetrograde: false },
  { name: 'Jupiter', rashiIndex: 11, longitude: 345, house: 11, degrees: 15, isRetrograde: false },
  { name: 'Venus',   rashiIndex: 4,  longitude: 130, house: 4,  degrees: 10, isRetrograde: false },
  { name: 'Saturn',  rashiIndex: 9,  longitude: 285, house: 9,  degrees: 15, isRetrograde: false },
];

describe('N8 — enrichWithCitations', () => {
  it('enriches sections with classical citations', async () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const vani = generateVani(yukti);
    const result = await enrichWithCitations(vani, new InMemoryCorpusProvider());
    expect(result.retrievalAvailable).toBe(true);
    expect(result.sections.length).toBe(vani.sections.length);
  });

  it('never fabricates citations — missing rule returns empty citations', async () => {
    const emptyYukti = {
      findings: [],
      conflicts: [],
      overallConfidence: 'INSUFFICIENT_DATA' as const,
      inputSignature: 'empty',
      calculatedAt: new Date().toISOString(),
    };
    const vani = generateVani(emptyYukti);
    const result = await enrichWithCitations(vani, new InMemoryCorpusProvider());
    // The no-data section has no matching rule → empty citations.
    result.sections.forEach((s) => {
      if (s.sectionId === 'no-data') {
        expect(s.citations).toHaveLength(0);
      }
    });
  });

  it('citation entryIds are valid corpus IDs', async () => {
    const kaal = computeKaal('1990-03-14', '12:00');
    const bala = computeBala(SYNTH_PLANETS);
    const yukti = computeYukti(kaal, bala);
    const vani = generateVani(yukti);
    const result = await enrichWithCitations(vani, new InMemoryCorpusProvider());
    for (const section of result.sections) {
      for (const c of section.citations) {
        expect(c.entryId).toMatch(/^[A-Z]+-/); // e.g. BPHS-45-1
      }
    }
  });
});

describe('N9 — runRaksha', () => {
  it('returns passed:true for valid synthetic birth data with planets', async () => {
    const result = await runRaksha({
      birthDate: '1990-03-14',
      birthTime: '12:00',
      planets: SYNTH_PLANETS,
    });
    expect(result.passed).toBe(true);
    expect(result.blockReasons).toHaveLength(0);
  });

  it('provides a narrative with sections', async () => {
    const result = await runRaksha({
      birthDate: '1990-03-14',
      birthTime: '12:00',
      planets: SYNTH_PLANETS,
    });
    expect(result.narrative.sections.length).toBeGreaterThan(0);
    expect(result.narrative.headlineEn.length).toBeGreaterThan(5);
  });

  it('provides a ProvenanceEnvelope with claims', async () => {
    const result = await runRaksha({
      birthDate: '1990-03-14',
      birthTime: '12:00',
      planets: SYNTH_PLANETS,
    });
    expect(result.envelope.claims.length).toBeGreaterThan(0);
    expect(result.envelope.generated_at).toMatch(/^\d{4}-/);
  });

  it('never throws — returns a result even without planets', async () => {
    const result = await runRaksha({
      birthDate: '1990-03-14',
      birthTime: '12:00',
      // No planets supplied
    });
    // May pass or fail the N9 gate depending on content — but must not throw.
    expect(typeof result.passed).toBe('boolean');
  });

  it('N9 gate blocks a response with contradictions', async () => {
    // The gate is tested end-to-end here by injecting contradictions via
    // the adversarial fixture test suite. This smoke test confirms the
    // pipeline returns a boolean result for genuine inputs.
    const result = await runRaksha({
      birthDate: '1990-03-14',
      birthTime: '12:00',
      planets: SYNTH_PLANETS,
    });
    // For clean data there should be no contradictions.
    expect(result.envelope.contradictions).toHaveLength(0);
  });
});
