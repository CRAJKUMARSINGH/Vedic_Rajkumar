export interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
  services: string[];
  headquarters: string;
  offices: string[];
  management: { name: string; role: string; note?: string }[];
  website?: string;
}

const PRESETS: Record<string, CompanyProfile> = {
  'rib': {
    name: 'RIB U.S. Cost, Inc.',
    industry: 'Construction Technology / BIM Software',
    description:
      'RIB U.S. Cost (formerly U.S. Cost) provides construction estimating, takeoff, and BIM-integrated cost management software for contractors and owners across North America.',
    services: [
      'Construction estimating & takeoff',
      'BIM-integrated cost management',
      'Enterprise project controls',
      'Cloud-based collaboration for AEC firms',
    ],
    headquarters: 'Atlanta, Georgia, USA',
    offices: ['Atlanta GA', 'Miami FL', 'Chicago IL', 'Los Angeles CA'],
    management: [
      { name: 'Thomas Wolf', role: 'CEO, RIB Group', note: 'Global construction software leader' },
      { name: 'Regional Leadership', role: 'VP Sales — Americas', note: 'Enterprise AEC accounts' },
    ],
    website: 'https://www.rib-software.com',
  },
  'rib miami': {
    name: 'RIB U.S. Cost — Miami Office',
    industry: 'Construction Technology',
    description: 'Miami regional office serving Florida and Latin America AEC clients.',
    services: ['Regional sales & support', 'Implementation consulting', 'Training'],
    headquarters: 'Miami, Florida, USA',
    offices: ['Miami FL'],
    management: [{ name: 'Regional Director', role: 'Office Lead' }],
  },
};

export function lookupCompanyProfile(query?: string): CompanyProfile | null {
  if (!query?.trim()) return null;
  const key = query.toLowerCase().trim();
  if (PRESETS[key]) return PRESETS[key];
  for (const [k, v] of Object.entries(PRESETS)) {
    if (key.includes(k) || k.includes(key) || v.name.toLowerCase().includes(key)) return v;
  }
  if (/rib|u\.s\. cost|us cost/i.test(query)) return PRESETS['rib'];
  return {
    name: query.trim(),
    industry: '—',
    description: `Research ${query.trim()} before your event: review their website, recent news, leadership, and role requirements.`,
    services: [],
    headquarters: '—',
    offices: [],
    management: [],
  };
}
