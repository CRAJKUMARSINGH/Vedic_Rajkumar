/**
 * verification.ts — the verified / unverified label registry (Week 15).
 *
 * Every interpretive output in the app is either **verified** (gated against an
 * authority that is not this codebase — see docs/accuracy/METHODOLOGY.md) or
 * **unverified**. This registry is the single place that decision is written
 * down, so a surface cannot quietly imply verification by staying silent.
 *
 * The rule is deny-by-default: an unknown key resolves to `unverified`. A new
 * surface therefore ships labelled, not unlabelled.
 *
 * The inventory of what is unverified — and why — is docs/accuracy/UNVERIFIED.md,
 * which is gated against `UNVERIFIED_AREAS` in src/lib/accuracyReport.ts.
 */

export type VerificationStatus = 'verified' | 'unverified';

export interface VerificationEntry {
  status: VerificationStatus;
  /** Why, shown as the badge's tooltip/title. Bilingual: no language is a stub. */
  note: { en: string; hi: string };
}

export const VERIFICATION: Record<string, VerificationEntry> = {
  // ── Verified ─────────────────────────────────────────────────────────────
  'chart.positions': {
    status: 'verified',
    note: {
      en: 'Graha longitudes are gated against Swiss Ephemeris (arcsecond tolerance).',
      hi: 'ग्रह देशांतर स्विस एफेमेरिस के विरुद्ध गेटेड हैं (आर्कसेकण्ड सहनशीलता)।',
    },
  },

  // ── Unverified ───────────────────────────────────────────────────────────
  shadbala: {
    status: 'unverified',
    note: {
      en: 'A formula chain with no published worked example; the shipped engine is a simplified approximation, not BPHS-precise.',
      hi: 'सूत्र-श्रृंखला, कोई प्रकाशित हल किया हुआ उदाहरण नहीं; जारी इंजन एक सरलीकृत सन्निकटन है, BPHS-सटीक नहीं।',
    },
  },
  ashtakavarga: {
    status: 'unverified',
    note: {
      en: 'Bindu tables are not gated against any external authority.',
      hi: 'बिंदु तालिकाएँ किसी बाह्य प्रमाण के विरुद्ध गेटेड नहीं हैं।',
    },
  },
  yogas: {
    status: 'unverified',
    note: {
      en: 'Rule-based matching; no external authority consulted.',
      hi: 'नियम-आधारित मिलान; कोई बाह्य प्रमाण नहीं देखा गया।',
    },
  },
  divisional: {
    status: 'unverified',
    note: {
      en: 'D9 and up inherit a verified ascendant and Moon, but their own transform is unverified.',
      hi: 'D9 से ऊपर सत्यापित लग्न व चंद्र विरासत में लेते हैं, पर उनका स्वयं का रूपांतरण अपरीक्षित है।',
    },
  },
  dasha: {
    status: 'unverified',
    note: {
      en: 'Computed twice by independent code and the two agree, but neither is checked against JHora.',
      hi: 'स्वतंत्र कोड द्वारा दो बार गणना और दोनों सहमत, पर कोई भी JHora से नहीं जाँचा गया।',
    },
  },
  interpretation: {
    status: 'unverified',
    note: {
      en: 'Authored prose; no accuracy claim applies.',
      hi: 'लेखक-रचित भाष्य; कोई शुद्धता-दावा लागू नहीं।',
    },
  },
};

/** Deny by default: an unknown key is unverified, never silently verified. */
export function verificationOf(key: string): VerificationEntry {
  return (
    VERIFICATION[key] ?? {
      status: 'unverified',
      note: {
        en: 'Not classified. Treated as unverified.',
        hi: 'वर्गीकृत नहीं। अपरीक्षित माना गया।',
      },
    }
  );
}
