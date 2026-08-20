import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, useNavigate } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { RouteTransition } from './RouteTransition';

let isTransitioning = false;
let snapshot: {
  originPath: string;
  projectLink?: string;
  imageSrc?: string;
  imageRect?: { left: number; top: number; width: number; height: number };
  scrollTop?: number;
} | null = null;
vi.mock('../context/PageTransitionContext', () => ({
  usePageTransition: () => ({ isTransitioning, snapshot }),
}));

let reduced = false;
vi.mock('../utils/projectTransition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/projectTransition')>();
  return { ...actual, prefersReducedProjectMotion: () => reduced };
});

// PageVeil mocké : expose des boutons pour simuler la fin des phases.
vi.mock('./PageVeil', () => ({
  PageVeil: ({ phase, onCovered, onRevealed }: any) => (
    <div data-testid="veil" data-phase={phase}>
      <button type="button" onClick={onCovered}>fire-covered</button>
      <button type="button" onClick={onRevealed}>fire-revealed</button>
    </div>
  ),
}));

function Nav() {
  const navigate = useNavigate();
  return (
    <div>
      <button type="button" onClick={() => navigate('/projets')}>go</button>
      <button type="button" onClick={() => navigate('/apropos')}>go-apropos</button>
    </div>
  );
}

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <RouteTransition>
        <Route path="/" element={<div>HOME<Nav /></div>} />
        <Route path="/projets" element={<div>PROJETS</div>} />
        <Route path="/apropos" element={<div>APROPOS</div>} />
      </RouteTransition>
    </MemoryRouter>,
  );

beforeEach(() => {
  isTransitioning = false;
  snapshot = null;
  reduced = false;
  document.body.scrollTop = 0;
});

it('au montage, affiche la page courante sans voile', () => {
  renderApp();
  expect(screen.getByText('HOME')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('navigation normale : voile joué, la nouvelle page n’apparaît qu’après couverture', () => {
  renderApp();
  fireEvent.click(screen.getByText('go'));
  // voile en cours, page encore = HOME (pas de flash)
  expect(screen.getByTestId('veil').getAttribute('data-phase')).toBe('covering');
  expect(screen.getByText('HOME')).toBeTruthy();
  expect(screen.queryByText('PROJETS')).toBeNull();
  // couverture terminée → swap
  fireEvent.click(screen.getByText('fire-covered'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.getByTestId('veil').getAttribute('data-phase')).toBe('revealing');
  // révélation terminée → voile retiré
  fireEvent.click(screen.getByText('fire-revealed'));
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('morph projet actif : swap immédiat, pas de voile', () => {
  isTransitioning = true;
  renderApp();
  fireEvent.click(screen.getByText('go'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('prefers-reduced-motion : swap immédiat, pas de voile', () => {
  reduced = true;
  renderApp();
  fireEvent.click(screen.getByText('go'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});

it('reset le scroll au swap (sauf /projets)', () => {
  reduced = true; // swap immédiat pour simplifier
  renderApp();
  document.body.scrollTop = 500;
  fireEvent.click(screen.getByText('go')); // → /projets : PAS de reset
  expect(document.body.scrollTop).toBe(500);
});

it('reset le scroll à 0 sur une navigation hors /projets', () => {
  reduced = true; // swap immédiat pour simplifier
  renderApp();
  document.body.scrollTop = 500;
  fireEvent.click(screen.getByText('go-apropos')); // → /apropos : reset à 0
  expect(document.body.scrollTop).toBe(0);
});

it('reverse morph imminent (snapshot ciblant /projets) : swap immédiat, pas de voile', () => {
  snapshot = {
    originPath: '/projets',
    projectLink: '/projets/x',
    imageSrc: '',
    imageRect: { left: 0, top: 0, width: 0, height: 0 },
    scrollTop: 0,
  };
  renderApp();
  fireEvent.click(screen.getByText('go'));
  expect(screen.getByText('PROJETS')).toBeTruthy();
  expect(screen.queryByTestId('veil')).toBeNull();
});
