import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import {
  AppContent,
  getSafariChromeColor,
  syncSafariChromeColor,
} from './App';
import { PageTransitionProvider } from './context/PageTransitionContext';

vi.mock('./pages/Home', () => ({
  default: ({ showSplash }: { showSplash: boolean }) => (
    <div data-testid="home-splash-state">{String(showSplash)}</div>
  ),
}));

describe('AppContent', () => {
  it('passes the live splash state to Home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PageTransitionProvider>
          <AppContent showSplash={false} />
        </PageTransitionProvider>
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

  it('synchronizes the Safari chrome meta tag with theme changes', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    syncSafariChromeColor(true);
    expect(meta.content).toBe('#111111');

    syncSafariChromeColor(false);
    expect(meta.content).toBe('#F2F2F2');

    meta.remove();
  });
});
