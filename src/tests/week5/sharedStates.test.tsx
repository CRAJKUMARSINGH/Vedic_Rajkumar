/**
 * Week 5: Shared State Components Tests
 *
 * Tests for:
 *  - ChartLoadingState  — renders with role="status" and message
 *  - ChartErrorState    — renders Alert with message and retry button
 *  - ChartEmptyState    — renders Empty primitives with title/description
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChartLoadingState from '@/components/ChartLoadingState';
import ChartErrorState from '@/components/ChartErrorState';
import ChartEmptyState from '@/components/ChartEmptyState';

// ─── ChartLoadingState ────────────────────────────────────────────────────────

describe('ChartLoadingState', () => {
  it('renders with role="status"', () => {
    render(<ChartLoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders default message', () => {
    render(<ChartLoadingState />);
    expect(screen.getByText('Calculating…')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ChartLoadingState message="Computing your chart…" />);
    expect(screen.getByText('Computing your chart…')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<ChartLoadingState />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(<ChartLoadingState className="test-class" />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('test-class');
  });
});

// ─── ChartErrorState ──────────────────────────────────────────────────────────

describe('ChartErrorState', () => {
  it('renders error message', () => {
    render(<ChartErrorState message="Calculation failed" />);
    expect(screen.getByText('Calculation failed')).toBeInTheDocument();
  });

  it('renders with role="alert"', () => {
    render(<ChartErrorState message="Error occurred" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders "Calculation Error" title', () => {
    render(<ChartErrorState message="test error" />);
    expect(screen.getByText('Calculation Error')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ChartErrorState message="Error" onRetry={onRetry} />);
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(<ChartErrorState message="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does NOT render retry button when onRetry is absent', () => {
    render(<ChartErrorState message="Error without retry" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ChartErrorState message="err" className="custom-error" />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('custom-error');
  });
});

// ─── ChartEmptyState ──────────────────────────────────────────────────────────

describe('ChartEmptyState', () => {
  it('renders the title', () => {
    render(<ChartEmptyState title="Enter birth details" />);
    expect(screen.getByText('Enter birth details')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <ChartEmptyState
        title="Ready"
        description="Fill in the form to get started"
      />,
    );
    expect(screen.getByText('Fill in the form to get started')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<ChartEmptyState title="Ready" />);
    // Only the title should be in document, no description paragraph
    expect(screen.queryByText('Fill in the form')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <ChartEmptyState
        title="Empty"
        icon={<span data-testid="test-icon">★</span>}
      />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    render(
      <ChartEmptyState
        title="Empty"
        action={<button>Start now</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Start now' })).toBeInTheDocument();
  });

  it('has aria-label equal to the title', () => {
    render(<ChartEmptyState title="My title" />);
    const empty = screen.getByLabelText('My title');
    expect(empty).toBeInTheDocument();
  });
});
