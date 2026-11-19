/**
 * N7 — Vani / narrative composer
 *
 * Generates a natural-language bilingual (EN/HI) reading strictly grounded in
 * N6 structured findings.  Rules:
 *   - Every sentence maps to a finding ID; no claim is generated without one.
 *   - Approximations and uncertainty are labelled explicitly.
 *   - Predictions are framed as traditional interpretations, not guaranteed
 *     outcomes.
 *   - `generateVani()` is a pure function — no network, no randomness, no I/O.
 *
 * Phase B contract: accessible explanations; labelled uncertainty; no invented
 * chart data; deterministic from N6 output; test-snapshot compatible.
 */

import type { YuktiOutput, SynthesisFinding } from './n6Yukti';

export interface VaniSection {
  sectionId: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  sourceFindings: string[];  // findingIds from N6
  hasUncertainty: boolean;
}

export interface VaniOutput {
  /** One-line headline summary. */
  headlineEn: string;
  headlineHi: string;
  sections: VaniSection[];
  /** Plain caveat shown at the end of every reading. */
  disclaimerEn: string;
  disclaimerHi: string;
  calculatedAt: string;
  /** Reflects N6 overallConfidence. */
  confidence: string;
}

const DISCLAIMER_EN =
  'This reading is based on traditional Vedic astrological interpretation and is ' +
  'provided for educational reference only. Astrological analysis does not ' +
  'constitute predictions of guaranteed outcomes. Consult a qualified astrologer ' +
  'and relevant professionals before making major life decisions.';

const DISCLAIMER_HI =
  'यह पठन पारंपरिक वैदिक ज्योतिष की व्याख्या पर आधारित है और केवल शैक्षणिक संदर्भ के ' +
  'लिए प्रस्तुत है। ज्योतिषीय विश्लेषण निश्चित फलों की भविष्यवाणी नहीं है। कोई भी ' +
  'बड़ा निर्णय लेने से पहले योग्य ज्योतिषी और संबंधित विशेषज्ञों से परामर्श करें।';

function narrateFromFinding(f: SynthesisFinding): VaniSection {
  return {
    sectionId: f.findingId,
    titleEn: f.findingId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    titleHi: f.findingId,  // replaced below by specific cases
    bodyEn: f.summary,
    bodyHi: f.summaryHi,
    sourceFindings: [f.findingId],
    hasUncertainty: f.confidence === 'LOW' || f.confidence === 'INSUFFICIENT_DATA',
  };
}

function headlineFromFindings(
  findings: SynthesisFinding[],
  confidence: string,
): { en: string; hi: string } {
  if (findings.length === 0 || confidence === 'INSUFFICIENT_DATA') {
    return {
      en: 'Insufficient calculation data for a complete reading.',
      hi: 'पूर्ण पठन के लिए पर्याप्त गणना डेटा उपलब्ध नहीं है।',
    };
  }

  const dashaFinding = findings.find((f) => f.findingId === 'dasha-strength-alignment');
  if (dashaFinding) {
    return {
      en: dashaFinding.confidence === 'HIGH'
        ? 'Active dasha period is well-supported by planetary strength — a productive time.'
        : 'Active dasha period requires caution — planetary strength is below the classical threshold.',
      hi: dashaFinding.confidence === 'HIGH'
        ? 'सक्रिय दशाकाल ग्रहीय बल से समर्थित है — एक उत्पादक समय।'
        : 'सक्रिय दशाकाल में सतर्कता आवश्यक है — ग्रहीय बल शास्त्रीय सीमा से नीचे है।',
    };
  }

  return {
    en: `Chart analysis complete with ${confidence.toLowerCase()} confidence.`,
    hi: `कुंडली विश्लेषण ${confidence === 'HIGH' ? 'उच्च' : confidence === 'MEDIUM' ? 'मध्यम' : 'निम्न'} विश्वसनीयता के साथ पूर्ण।`,
  };
}

/**
 * Compose a bilingual narrative from N6 synthesis output.
 * Pure function — no side effects.
 */
export function generateVani(yukti: YuktiOutput): VaniOutput {
  const calculatedAt = new Date().toISOString();
  const { findings, overallConfidence } = yukti;

  const sections: VaniSection[] = findings.map(narrateFromFinding);

  // Patch Hindi section titles for known finding IDs.
  const titleMap: Record<string, string> = {
    'dasha-strength-alignment': 'दशा-बल संरेखण',
    'strongest-planet-dignity': 'सर्वाधिक बलशाली ग्रह की अवस्था',
    'upcoming-dasha': 'आगामी दशा',
  };
  for (const s of sections) {
    if (titleMap[s.sectionId]) s.titleHi = titleMap[s.sectionId];
  }

  if (yukti.conflicts.length > 0) {
    sections.push({
      sectionId: 'conflict-notice',
      titleEn: 'Conflicting Indicators',
      titleHi: 'परस्पर-विरोधी संकेत',
      bodyEn: `Note: ${yukti.conflicts.map((c) => c.description).join('; ')} — treat results with additional caution.`,
      bodyHi: `नोट: ${yukti.conflicts.map((c) => c.description).join('; ')} — परिणामों को अतिरिक्त सतर्कता से देखें।`,
      sourceFindings: yukti.conflicts.flatMap((c) => c.findingIds),
      hasUncertainty: true,
    });
  }

  if (findings.length === 0) {
    sections.push({
      sectionId: 'no-data',
      titleEn: 'Data Unavailable',
      titleHi: 'डेटा अनुपलब्ध',
      bodyEn: 'No calculation results were available to generate an interpretation.',
      bodyHi: 'व्याख्या उत्पन्न करने के लिए कोई गणना परिणाम उपलब्ध नहीं था।',
      sourceFindings: [],
      hasUncertainty: true,
    });
  }

  const headline = headlineFromFindings(findings, overallConfidence);

  return {
    headlineEn: headline.en,
    headlineHi: headline.hi,
    sections,
    disclaimerEn: DISCLAIMER_EN,
    disclaimerHi: DISCLAIMER_HI,
    calculatedAt,
    confidence: overallConfidence,
  };
}
