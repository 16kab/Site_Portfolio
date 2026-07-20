import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import { PageTransitionOverlay } from './PageTransitionOverlay';

function TransitionSeed() {
  const { beginForward, markArrival, isTransitioning } = usePageTransition();

  return (
    <>
      <output data-testid="transition-state">
        {isTransitioning ? 'active' : 'idle'}
      </output>
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
      <button type="button" onClick={markArrival}>
        Arrive
      </button>
    </>
  );
}

function renderOverlay() {
  return render(
    <PageTransitionProvider>
      <TransitionSeed />
      <PageTransitionOverlay />
    </PageTransitionProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1024,
  });
});

describe('PageTransitionOverlay', () => {
  it('renders the shared project image during a mobile forward transition', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });

    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));

    expect(screen.getByAltText('')).toHaveAttribute('src', '/test.webp');
  });

  it('reveals only after the morph ends AND the destination page arrived', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });

    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('active');

    // La page d'arrivée se monte pendant le morph (chunk préchargé)
    fireEvent.click(screen.getByRole('button', { name: 'Arrive' }));

    // Fin du morph (550 ms) : la révélation (fondu 200 ms) démarre
    act(() => vi.advanceTimersByTime(550));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('active');

    act(() => vi.advanceTimersByTime(199));
    expect(screen.getByAltText('')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('idle');
    expect(screen.queryByAltText('')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('holds the overlay until a late page arrival, then reveals', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });

    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));

    // Morph fini depuis longtemps, mais la page (chunk lazy) n'est pas là :
    // l'overlay tient, il ne révèle pas l'ancienne page.
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('active');
    expect(screen.getByAltText('')).toBeInTheDocument();

    // La page arrive tard : révélation immédiate (fondu 200 ms)
    fireEvent.click(screen.getByRole('button', { name: 'Arrive' }));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('idle');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('falls back to completing if the destination never arrives', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });

    renderOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));

    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('active');

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('transition-state')).toHaveTextContent('idle');
    expect(vi.getTimerCount()).toBe(0);
  });
});
