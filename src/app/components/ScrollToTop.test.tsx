import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import type { ProjectTransitionSnapshot } from '../utils/projectTransition';
import { PageTransitionOverlay } from './PageTransitionOverlay';
import NewProjectCard from './common/NewProjectCard';
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

function TransitionState() {
  const { pathname } = useLocation();
  const {
    isTransitioning,
    direction,
    snapshot: currentSnapshot,
  } = usePageTransition();

  return (
    <>
      <output data-testid="location">{pathname}</output>
      <output data-testid="transition-state">
        {isTransitioning ? 'active' : 'idle'}:{direction ?? 'none'}:
        {currentSnapshot?.projectLink ?? 'none'}
      </output>
    </>
  );
}

function ProjectsRoute() {
  return (
    <>
      <NewProjectCard
        link={snapshot.projectLink}
        number="01"
        title="Projet test"
        description="Description test"
        tags={['UX', 'UI']}
        image={snapshot.imageSrc}
      />
      <Link to="/contact">Contact</Link>
    </>
  );
}

function ProjectDetailRoute() {
  const { beginForward, beginReverse, completeTransition } =
    usePageTransition();

  return (
    <>
      <button type="button" onClick={() => beginForward(snapshot)}>
        Seed forward
      </button>
      <button type="button" onClick={completeTransition}>
        Complete forward
      </button>
      <button
        type="button"
        onClick={() =>
          beginReverse({ left: 20, top: 160, width: 350, height: 250 })
        }
      >
        Begin reverse
      </button>
      <Link to="/projets">Projects</Link>
    </>
  );
}

function renderTransitionRoutes(initialEntry = '/projets') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PageTransitionProvider>
        <ScrollToTop />
        <TransitionState />
        <PageTransitionOverlay />
        <Routes>
          <Route path="/projets" element={<ProjectsRoute />} />
          <Route path="/projets/test" element={<ProjectDetailRoute />} />
          <Route path="/contact" element={<p>Contact page</p>} />
        </Routes>
      </PageTransitionProvider>
    </MemoryRouter>,
  );
}

describe('ScrollToTop route decisions', () => {
  it('restores project scroll only on the matching origin route', () => {
    expect(shouldRestoreProjectScroll('/projets', snapshot)).toBe(true);
    expect(shouldRestoreProjectScroll('/contact', snapshot)).toBe(false);
  });

  it('recognizes only the transition origin and project target routes', () => {
    expect(isTransitionRoute('/projets', snapshot)).toBe(true);
    expect(isTransitionRoute('/projets/test', snapshot)).toBe(true);
    expect(isTransitionRoute('/apropos', snapshot)).toBe(false);
  });
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    document.body.scrollTop = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
  });

  it('clears an active forward transition immediately on an unrelated route', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    renderTransitionRoutes();

    fireEvent.click(
      screen.getByRole('link', { name: 'Voir le projet Projet test' }),
    );
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'active:forward:/projets/test',
    );
    expect(screen.getByAltText('')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Contact' }));
    await act(async () => {});

    expect(screen.getByTestId('location')).toHaveTextContent('/contact');
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'idle:none:none',
    );
    expect(screen.queryByAltText('')).not.toBeInTheDocument();

    act(() => vi.runAllTimers());
    expect(screen.getByTestId('location')).toHaveTextContent('/contact');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps an active forward transition on its project target route', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    renderTransitionRoutes();

    fireEvent.click(
      screen.getByRole('link', { name: 'Voir le projet Projet test' }),
    );
    act(() => vi.advanceTimersByTime(420));

    expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'active:forward:/projets/test',
    );
    expect(screen.getByAltText('')).toBeInTheDocument();
  });

  it('keeps an active reverse transition on its projects origin route', () => {
    renderTransitionRoutes('/projets/test');
    fireEvent.click(screen.getByRole('button', { name: 'Seed forward' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete forward' }));
    fireEvent.click(screen.getByRole('button', { name: 'Begin reverse' }));

    fireEvent.click(screen.getByRole('link', { name: 'Projects' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/projets');
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'active:reverse:/projets/test',
    );
    expect(screen.getByAltText('')).toBeInTheDocument();
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
