/**
 * SaraswatiMascot (@/components/SaraswatiMascot) — smoke + behaviour tests.
 *
 * Ported from the dropped-in `vedic-vijay/00 FOR ALL APPS/SARASWATI.test.tsx`,
 * which targeted a non-existent `client/src/components/SaraswatiMascot.tsx`
 * path and a `./__mocks__/mock-dependencies` folder that does not exist in this
 * repo. Re-pointed at the real component and this repo's Vitest + Testing
 * Library setup; the `mock-dependencies` import is unnecessary here because the
 * component has no side-effecting dependencies.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SARASWATI, { SARASWATI as NamedSaraswati } from '@/components/SaraswatiMascot';

describe('SARASWATI component', () => {
  it('renders without crashing and exposes the named export', () => {
    expect(NamedSaraswati).toBe(SARASWATI);
    const { container } = render(<SARASWATI />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('serves the static mascot asset with an accessible name', () => {
    render(<SARASWATI />);
    const img = screen.getByRole('img', { name: /saraswati/i });
    expect(img).toHaveAttribute('src', '/saraswati.jpg');
  });

  it('handles the size prop by setting width and height', () => {
    render(<SARASWATI size={140} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '140');
    expect(img).toHaveAttribute('height', '140');
  });

  it('uses a Hindi alt text when isHi is set', () => {
    render(<SARASWATI isHi />);
    expect(screen.getByAltText(/सरस्वती/)).toBeInTheDocument();
  });

  it('renders no speech bubble by default', () => {
    render(<SARASWATI />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('renders the bubble when a message is provided', () => {
    render(<SARASWATI message="Namaste" />);
    expect(screen.getByRole('note')).toHaveTextContent('Namaste');
  });

  it('renders the bilingual default message when showMessage is set', () => {
    render(<SARASWATI isHi showMessage />);
    expect(screen.getByRole('note')).toHaveTextContent('कुंडली');
  });

  it('matches snapshot', () => {
    const { container } = render(<SARASWATI size={64} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
