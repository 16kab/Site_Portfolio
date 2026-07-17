import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';
import {
  isTransitionRoute,
  ScrollToTop,
  shouldRestoreProjectScroll,
} from './ScrollToTop';

const snapshot: ProjectTransitionSnapshot = {
  imageSrc: '/test.webp',
  imageRect: { left: 10, top: 20, width: 300, height: 200 },
  projectLink: '/projets/test',
  originPath: '/projets',
  scrollTop: 480,
};

function TransitionControls() {
  const {
    snapshot: currentSnapshot,
    beginForward,
    completeTransition,
    clearTransition,
  } = usePageTransition();

  return (
    <>
      <output data-testid="snapshot">
        {currentSnapshot?.projectLink ?? 'none'}
      </output>
      <button type="button" onClick={() => beginForward(snapshot)}>
        Begin forward
      </button>
      <button type="button" onClick={completeTransition}>
        Complete
      </button>
      <button type="button" onClick={clearTransition}>
        Clear
      </button>
    </>
  );
}

describe('ScrollToTop route decisions', () => {
  it('restores project scroll only on the matching origin route', () => {
    expect(shouldRestoreProjectScroll('/projets', snapshot)).toBe(true);
    expect(shouldRestoreProjectScroll('/contact', snapshot)).toBe(false);
  });

  it('recognizes only the transition origin and project target routes', () => {
    expect(isTransitionRoute('/projets/test', snapshot)).toBe(true);
    expect(isTransitionRoute('/apropos', snapshot)).toBe(false);
  });
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    document.body.scrollTop = 0;
  });

  it('does not reset scroll when a snapshot disappears on the same pathname', () => {
    render(
      <MemoryRouter initialEntries={['/projets']}>
        <PageTransitionProvider>
          <ScrollToTop />
          <TransitionControls />
        </PageTransitionProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Begin forward' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
    expect(screen.getByTestId('snapshot')).toHaveTextContent('/projets/test');

    document.body.scrollTop = 480;
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByTestId('snapshot')).toHaveTextContent('none');
    expect(document.body.scrollTop).toBe(480);
  });
});
