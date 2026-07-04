/**
 * src/components/CompanyResearchCard.tsx
 *
 * Generic company research card.
 * Accepts a `companyQuery` string (company name or label).
 * Looks it up in the built-in preset map; if not found, renders a minimal
 * "company research pending" placeholder.
 *
 * Preset: RIB U.S. COST — management team, services, offices from priyansh.ts data.
 */

import React, { useState } from 'react';
import { Building2, MapPin, Users, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

// ─── Preset data ──────────────────────────────────────────────────────────────

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

/** Match query against preset keys (case-insensitive, partial match) */
function findPreset(query?: string): CompanyProfile | null {
  if (!query) return null;
  const q = query.toLowerCase();
  for (const [key, profile] of Object.entries(COMPANY_PRESETS)) {
    if (q.includes(key) || key.includes(q)) return profile;
  }
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Company name / event label — looked up in preset map */
  companyQuery?: string;
  /** Alternatively pass a full profile directly */
  company?: CompanyProfile;
  lang?: 'en' | 'hi';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompanyResearchCard({ companyQuery, company, lang = 'en' }: Props) {
  const [showServices, setShowServices] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const isHi = lang === 'hi';

  const profile = company ?? findPreset(companyQuery);

  // Nothing to show
  if (!profile && !companyQuery) return null;

  // No preset match but we have a label — show minimal placeholder
  if (!profile) {
    return (
      <Card className="border-blue-100 dark:border-blue-900">
        <CardContent className="pt-3 pb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {isHi ? 'कंपनी विवरण' : 'Company'}: <strong>{companyQuery}</strong>
            {' '}—{' '}
            {isHi ? 'विस्तृत डेटा उपलब्ध नहीं' : 'Detailed data not available for this company yet.'}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {isHi ? 'कंपनी अनुसंधान' : 'Company Research'} — {profile.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Core info row */}
        <div className="flex flex-wrap gap-2 text-xs">
          {profile.founded && (
            <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700">
              Est. {profile.founded}
            </Badge>
          )}
          {profile.hq && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" /> {profile.hq}
            </span>
          )}
          {profile.url && (
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-[10px]"
            >
              {profile.url.replace('https://', '')}
            </a>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          {profile.description}
        </p>

        {/* Offices */}
        {profile.offices && profile.offices.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.offices.map((office, i) => (
              <span
                key={i}
                className="text-[10px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5"
              >
                📍 {office}
              </span>
            ))}
          </div>
        )}

        {/* Services collapsible */}
        {profile.services && profile.services.length > 0 && (
          <div>
            <button
              onClick={() => setShowServices(o => !o)}
              className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 font-semibold hover:text-blue-900"
            >
              <Briefcase className="w-3 h-3" />
              {isHi ? 'सेवाएं' : 'Services'} ({profile.services.length})
              {showServices ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showServices && (
              <ul className="mt-1.5 space-y-0.5 pl-4">
                {profile.services.map((s, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground list-disc">{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Management team collapsible */}
        {profile.managementTeam && profile.managementTeam.length > 0 && (
          <div>
            <button
              onClick={() => setShowManagement(o => !o)}
              className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 font-semibold hover:text-blue-900"
            >
              <Users className="w-3 h-3" />
              {isHi ? 'प्रबंधन टीम' : 'Management Team'} ({profile.managementTeam.length})
              {showManagement ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showManagement && (
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {profile.managementTeam.map((m, i) => (
                  <div
                    key={i}
                    className="text-[10px] bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded p-1.5"
                  >
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</div>
                    <div className="text-muted-foreground">{m.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
