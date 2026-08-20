import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import Projets from './Projets';

const captureSnapshot = vi.fn();
const beginForward = vi.fn();
const beginReverse = vi.fn();
const clearTransition = vi.fn();
vi.mock('../context/PageTransitionContext', () => ({
  usePageTransition: () => ({
    snapshot: null,
    direction: null,
    captureSnapshot,
    beginForward,
    beginReverse,
    clearTransition,
    isTransitioning: false,
  }),
}));

// Mock du carousel : expose les items + un bouton pour déclencher onItemActivate.
vi.mock('../components/common/HeroCarousel', () => ({
  HeroCarousel: ({ items, onItemActivate }: any) => (
    <div data-testid="carousel">
      <span data-testid="count">{items.length}</span>
      <span data-testid="first-credit">{items[0].credit}</span>
      <span data-testid="first-meta">{items[0].meta?.[0]}</span>
      <span data-testid="first-accent">{items[0].accent}</span>
      <button type="button" onClick={() => onItemActivate?.(0, document.createElement('img'))}>
        activate-0
      </button>
    </div>
  ),
}));

const renderProjets = () =>
  render(
    <MemoryRouter initialEntries={['/projets']}>
      <Projets />
    </MemoryRouter>,
  );

it('câble les 10 projets au carousel', () => {
  renderProjets();
  expect(screen.getByTestId('count').textContent).toBe('10');
});

it('mappe credit=discipline, meta=année, accent', () => {
  renderProjets();
  expect(screen.getByTestId('first-credit').textContent).toMatch(/MOBILE|WEB|BRANDING/);
  expect(screen.getByTestId('first-meta').textContent).toMatch(/^\d{4}/);
  expect(screen.getByTestId('first-accent').textContent).toMatch(/^#[0-9a-fA-F]{6}$/);
});

it('onItemActivate déclenche le morph (captureSnapshot + beginForward)', () => {
  renderProjets();
  fireEvent.click(screen.getByText('activate-0'));
  expect(captureSnapshot).toHaveBeenCalledTimes(0); // morph normal → beginForward (pas reduce)
  expect(beginForward).toHaveBeenCalledTimes(1);
});
