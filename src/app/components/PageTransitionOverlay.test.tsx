import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import { PageTransitionOverlay } from './PageTransitionOverlay';

function TransitionSeed() {
  const { beginForward, isTransitioning } = usePageTransition();

  return (
    <>
      <output data-testid="transition-state">{isTransitioning ? 'active' : 'idle'}</output>
      <button
        type="button"
        onClick={() =>
          beginForward({
            imageSrc: '/test.webp',
            imageRect: { left: 10, top: 20, width: 300, height: 200 },
            projectLink: '/projets/test',
            originPath: '/projets',
            scrollTop: 0,
          })
        }
      >
        Begin forward
      </button>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
});

describe('PageTransitionOverlay', () => {
  it('renders the shared project image during a mobile forward transition', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });

    render(
      <PageTransitionProvider>
        <TransitionSeed />
        <PageTransitionOverlay />
      </PageTransitionProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));

    expect(screen.getByAltText('')).toHaveAttribute('src', '/test.webp');
  });

  it('completes and removes a mobile forward transition after 800ms', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });

    render(
      <PageTransitionProvider>
        <TransitionSeed />
        <PageTransitionOverlay />
      </PageTransitionProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('active');
    expect(screen.getByAltText('')).toHaveAttribute('src', '/test.webp');

    act(() => vi.advanceTimersByTime(799));
    expect(screen.getByAltText('')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('idle');
    expect(screen.queryByAltText('')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });
});
