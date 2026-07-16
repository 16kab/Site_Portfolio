import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AppContent, getSafariChromeColor } from './App';

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

describe('getSafariChromeColor', () => {
  it('returns a chrome color consistent with the active theme', () => {
    expect(getSafariChromeColor(false)).toBe('#F2F2F2');
    expect(getSafariChromeColor(true)).toBe('#111111');
  });
});
