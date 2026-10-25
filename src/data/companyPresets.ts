/**
 * src/data/companyPresets.ts
 *
 * Canonical company-research data consumed by `CompanyResearchCard`.
 *
 * The card previously carried a private copy of this interface, the preset map
 * and the lookup function; the file below was a second, divergent copy that no
 * module imported. There is now a single source of truth: this module.
 *
 * Preset: RIB U.S. COST — management team, services, offices.
 */

export interface ManagementMember {
  name: string;
  role: string;
}

export interface CompanyProfile {
  name: string;
  url?: string;
  founded?: number;
  hq?: string;
  description: string;
  services?: string[];
  managementTeam?: ManagementMember[];
  offices?: string[];
}

const COMPANY_PRESETS: Record<string, CompanyProfile> = {
  'rib u.s. cost': {
    name: 'RIB U.S. COST',
    url: 'https://rib-uscost.com',
    founded: 1983,
    hq: 'Alpharetta, GA (HQ) — Miami, FL office',
    description:
      'A major subsidiary of RIB Software GmbH (Germany), providing professional construction cost estimating, scheduling, value engineering, project controls, BIM Services (iTWO), and claims analysis for large-scale private and public sector projects across the USA.',
    services: [
      'Cost Estimating & Lifecycle Cost Analysis',
      'Market Condition Studies',
      'Master Schedule Development & Updates',
      'Program Validation & Project Controls',
      'Risk Assessment & Risk Management',
      'Value Engineering Studies',
      'Claims Management & Analysis',
      'BIM Services (iTWO 5D platform)',
      'Constructability Review',
      'Change Order Management',
      'Reality Capture',
      'Data Dashboard Development',
    ],
    managementTeam: [
      { name: 'Suzanne Moltzen, MBA', role: 'CEO, RIB North America' },
      { name: 'Fabianne Arias', role: 'Vice President' },
      { name: 'Andreas Kristanto, CCP', role: 'Executive Vice President' },
      { name: 'Russell McElreath, CCP', role: 'Vice President' },
    ],
    offices: ['Atlanta, GA (HQ)', 'Washington, D.C.', 'Miami, FL', 'Dallas, TX', 'Memphis, TN'],
  },
};

/**
 * Match a free-text query against the preset keys (case-insensitive, partial in
 * either direction). Returns `null` when nothing matches so callers can decide
 * whether to render a placeholder.
 */
export function findCompanyProfile(query?: string): CompanyProfile | null {
  if (!query) return null;
  const q = query.toLowerCase();
  for (const [key, profile] of Object.entries(COMPANY_PRESETS)) {
    if (q.includes(key) || key.includes(q)) return profile;
  }
  return null;
}
