import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AppContent } from './App';

vi.mock('./pages/Home', () => ({
  default: ({ showSplash }: { showSplash: boolean }) => (
    <div data-testid="home-splash-state">{String(showSplash)}</div>
  ),
}));

describe('AppContent', () => {
  it('passes the live splash state to Home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent showSplash={false} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('home-splash-state')).toHaveTextContent('false');
  });
});
