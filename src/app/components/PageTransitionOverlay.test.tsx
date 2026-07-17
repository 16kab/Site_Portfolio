import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import { PageTransitionOverlay } from './PageTransitionOverlay';

function TransitionSeed() {
  const { beginForward } = usePageTransition();

  return (
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
  );
}

afterEach(() => {
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
});
