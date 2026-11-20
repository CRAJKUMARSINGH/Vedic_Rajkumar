/**
 * c4 Phase 9 — dasha timeline verification (synthetic fixtures only).
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashaTimeline, validateDashaChronology } from '@/features/dasha/components/DashaTimeline';
import { makeDashaResult, makeBrokenDashaResult } from './fixtures';

describe('dasha chronology validation', () => {
  it('accepts a well-ordered, contiguous tree', () => {
    expect(validateDashaChronology(makeDashaResult())).toEqual([]);
  });

  it('flags an out-of-order / overlapping tree', () => {
    const issues = validateDashaChronology(makeBrokenDashaResult());
    expect(issues.length).toBeGreaterThan(0);
  });

  it('flags unavailable data', () => {
    expect(validateDashaChronology(null)).toEqual(['Dasha data unavailable.']);
  });
});

describe('DashaTimeline rendering', () => {
  it('shows a missing-data state when no dasha is available', () => {
    render(<DashaTimeline dasha={null} />);
    expect(screen.getByTestId('dasha-timeline-empty')).toBeInTheDocument();
  });

  it('renders mahadashas and expands into antardashas and pratyantardashas', () => {
    render(<DashaTimeline dasha={makeDashaResult()} />);

    expect(screen.getByTestId('maha-0')).toBeInTheDocument();
    expect(screen.getByTestId('maha-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('maha-toggle-1'));
    expect(screen.getByTestId('antar-list-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('antar-toggle-1-2'));
    expect(screen.getByTestId('pd-list-1-2')).toBeInTheDocument();
    expect(screen.getByTestId('pd-1-2-0')).toBeInTheDocument();
    expect(screen.getByTestId('pd-1-2-1')).toBeInTheDocument();
  });

  it('highlights the current period', () => {
    render(<DashaTimeline dasha={makeDashaResult()} />);
    expect(screen.getByTestId('maha-1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('maha-current-1')).toBeInTheDocument();
    expect(screen.getByTestId('maha-0')).toHaveAttribute('data-active', 'false');
  });

  it('renders Hindi planetary names in Hindi mode', () => {
    render(<DashaTimeline dasha={makeDashaResult()} lang="hi" />);
    expect(screen.getByTestId('maha-toggle-1')).toHaveTextContent('शुक्र');
  });

  it('provides a printable table with calendar dates for every level', () => {
    render(<DashaTimeline dasha={makeDashaResult()} />);
    expect(screen.getByTestId('dasha-table')).toBeInTheDocument();
    expect(screen.getByTestId('table-md-0')).toHaveTextContent('1998-01-01');
    expect(screen.getByTestId('table-ad-0-0')).toBeInTheDocument();
    expect(screen.getByTestId('table-pd-1-2-0')).toBeInTheDocument();
  });
});
