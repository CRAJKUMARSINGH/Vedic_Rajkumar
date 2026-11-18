/**
 * Week 15 — the in-app verified / unverified badge.
 *
 * The week's gate is "every interpretive output is labelled verified or
 * unverified". These tests hold the two halves of that:
 *   - the registry cannot ship a half-translated or silently-verified entry,
 *   - a surface that renders an unverified transform actually carries the badge.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerificationBadge } from '@/components/VerificationBadge';
import ShadabalaCard from '@/components/ShadabalaCard';
import { VERIFICATION, verificationOf } from '@/config/verification';
import type { PlanetData } from '@/services/shadabalaService';

const PLANETS: PlanetData[] = [
  { name: 'Sun', rashiIndex: 0, house: 1, degrees: 10, isRetrograde: false, longitude: 10 },
  { name: 'Moon', rashiIndex: 1, house: 2, degrees: 3, isRetrograde: false, longitude: 33 },
  { name: 'Mars', rashiIndex: 9, house: 10, degrees: 28, isRetrograde: false, longitude: 298 },
  { name: 'Mercury', rashiIndex: 5, house: 6, degrees: 15, isRetrograde: true, longitude: 165 },
  { name: 'Jupiter', rashiIndex: 3, house: 4, degrees: 5, isRetrograde: false, longitude: 95 },
  { name: 'Venus', rashiIndex: 11, house: 12, degrees: 27, isRetrograde: false, longitude: 357 },
  { name: 'Saturn', rashiIndex: 6, house: 7, degrees: 20, isRetrograde: true, longitude: 200 },
];

describe('verification registry', () => {
  it('treats an unclassified topic as unverified (deny by default)', () => {
    expect(verificationOf('something.new.and.unclassified').status).toBe('unverified');
  });

  it('gives every entry a non-empty note in both languages', () => {
    for (const [key, entry] of Object.entries(VERIFICATION)) {
      expect(entry.note.en.trim(), `${key} en`).not.toBe('');
      expect(entry.note.hi.trim(), `${key} hi`).not.toBe('');
    }
  });

  it('classifies shadbala as unverified', () => {
    expect(verificationOf('shadbala').status).toBe('unverified');
  });
});

describe('VerificationBadge', () => {
  it('renders a verified badge with status="verified"', () => {
    render(<VerificationBadge topic="chart.positions" lang="en" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge).toHaveAttribute('data-status', 'verified');
    expect(badge).toHaveTextContent(/verified/i);
  });

  it('renders an unverified badge with status="unverified"', () => {
    render(<VerificationBadge topic="shadbala" lang="en" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge).toHaveAttribute('data-status', 'unverified');
    expect(badge).toHaveTextContent(/unverified/i);
  });

  it('translates the chip for Hindi', () => {
    render(<VerificationBadge topic="shadbala" lang="hi" />);
    expect(screen.getByTestId('verification-badge')).toHaveTextContent('अपरीक्षित');
  });
});

describe('shadbala surface labelling', () => {
  it('carries an unverified badge', () => {
    render(<ShadabalaCard planets={PLANETS} lang="en" />);
    const badge = screen.getByTestId('verification-badge');
    expect(badge).toHaveAttribute('data-status', 'unverified');
  });
});
