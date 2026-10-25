/**
 * Guards the single source of truth for company-research presets after the
 * duplicate copy was removed from `CompanyResearchCard`.
 */
import { describe, it, expect } from 'vitest';
import { findCompanyProfile } from '@/data/companyPresets';

describe('findCompanyProfile', () => {
  it('resolves the RIB preset from a partial, case-insensitive query', () => {
    expect(findCompanyProfile('RIB')?.name).toBe('RIB U.S. COST');
    expect(findCompanyProfile('rib u.s. cost')?.name).toBe('RIB U.S. COST');
  });

  it('returns null for an unknown company or an empty query', () => {
    expect(findCompanyProfile()).toBeNull();
    expect(findCompanyProfile('   ')).toBeNull();
    expect(findCompanyProfile('Nonexistent Widgets Ltd')).toBeNull();
  });

  it('keeps the full preset payload intact', () => {
    const p = findCompanyProfile('RIB');
    expect(p?.founded).toBe(1983);
    expect(p?.services).toHaveLength(12);
    expect(p?.managementTeam).toHaveLength(4);
    expect(p?.offices).toHaveLength(5);
  });
});
