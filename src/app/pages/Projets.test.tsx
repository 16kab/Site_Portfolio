import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import Projets from './Projets';
import { tousProjets } from '../data/projetsData';

const captureSnapshot = vi.fn();
const beginForward = vi.fn();
const beginReverse = vi.fn();
const clearTransition = vi.fn();

// État configurable du mock de PageTransitionContext : par défaut aucune
// visite de retour (snapshot null). Les tests de morph retour le remplacent
// avant `renderProjets()`.
type MockTransitionState = {
  snapshot: null | {
    imageSrc: string;
    imageRect: { left: number; top: number; width: number; height: number };
    projectLink: string;
    originPath: string;
    scrollTop: number;
  };
  direction: null | 'forward' | 'reverse';
};

let transitionState: MockTransitionState = { snapshot: null, direction: null };

vi.mock('../context/PageTransitionContext', () => ({
  usePageTransition: () => ({
    snapshot: transitionState.snapshot,
    direction: transitionState.direction,
    captureSnapshot,
    beginForward,
    beginReverse,
    clearTransition,
    isTransitioning: false,
  }),
}));

// `prefersReducedProjectMotion` mocké (configurable par test) ; le reste du
// module (roundTransitionRect, getProjectTransitionTiming) reste réel.
let reducedMotion = false;
vi.mock('../utils/projectTransition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/projectTransition')>();
  return {
    ...actual,
    prefersReducedProjectMotion: () => reducedMotion,
  };
});

const FOCUS_RECT = { left: 10, top: 20, width: 300, height: 200 };

function makeFocusImage() {
  const img = document.createElement('img');
  img.getBoundingClientRect = () =>
    ({
      ...FOCUS_RECT,
      right: FOCUS_RECT.left + FOCUS_RECT.width,
      bottom: FOCUS_RECT.top + FOCUS_RECT.height,
      x: FOCUS_RECT.left,
      y: FOCUS_RECT.top,
      toJSON: () => ({}),
    }) as DOMRect;
  return img;
}

// Mock du carousel : expose les items + un bouton pour déclencher
// onItemActivate (morph aller), et reproduit le comportement réel de
// remontée de l'image de la carte focus (onFocusedImageChange, au montage
// et à chaque changement d'index) pour piloter le morph retour en test.
// `refire-focus` permet de vérifier que le garde-fou anti double-déclenchement
// ne se relance pas si le focus est signalé une seconde fois.
vi.mock('../components/common/HeroCarousel', async () => {
  const React = await import('react');
  return {
    HeroCarousel: ({ items, index = 0, onItemActivate, onFocusedImageChange }: any) => {
      const imgRef = React.useRef<HTMLImageElement | null>(null);
      if (!imgRef.current) imgRef.current = makeFocusImage();
      React.useEffect(() => {
        onFocusedImageChange?.(imgRef.current);
      }, [index, onFocusedImageChange]);
      return (
        <div data-testid="carousel">
          <span data-testid="count">{items.length}</span>
          <span data-testid="first-credit">{items[0].credit}</span>
          <span data-testid="first-meta">{items[0].meta?.[0]}</span>
          <span data-testid="first-accent">{items[0].accent}</span>
          <button type="button" onClick={() => onItemActivate?.(0, document.createElement('img'))}>
            activate-0
          </button>
          <button type="button" onClick={() => onFocusedImageChange?.(imgRef.current)}>
            refire-focus
          </button>
        </div>
      );
    },
  };
});

const renderProjets = () =>
  render(
    <MemoryRouter initialEntries={['/projets']}>
      <Projets />
    </MemoryRouter>,
  );

function seedReturnVisit(projectLink: string) {
  transitionState = {
    snapshot: {
      imageSrc: '/test.webp',
      imageRect: { left: 0, top: 0, width: 390, height: 844 },
      projectLink,
      originPath: '/projets',
      scrollTop: 0,
    },
    direction: 'forward',
  };
}

beforeEach(() => {
  transitionState = { snapshot: null, direction: null };
  reducedMotion = false;
  captureSnapshot.mockClear();
  beginForward.mockClear();
  beginReverse.mockClear();
  clearTransition.mockClear();
});

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

it('un double-clic rapide sur la carte focus ne déclenche le morph aller qu\'une seule fois', () => {
  renderProjets();
  const button = screen.getByText('activate-0');
  fireEvent.click(button);
  fireEvent.click(button);
  expect(beginForward).toHaveBeenCalledTimes(1);
});

it('retour sur la liste : le focus sur la carte d\'origine déclenche le morph retour (beginReverse)', () => {
  seedReturnVisit(tousProjets[2].link);
  renderProjets();
  expect(beginReverse).toHaveBeenCalledTimes(1);
  expect(beginReverse).toHaveBeenCalledWith(FOCUS_RECT);
  expect(clearTransition).not.toHaveBeenCalled();
});

it('retour avec prefers-reduced-motion : clearTransition (pas de beginReverse)', () => {
  reducedMotion = true;
  seedReturnVisit(tousProjets[2].link);
  renderProjets();
  expect(clearTransition).toHaveBeenCalledTimes(1);
  expect(beginReverse).not.toHaveBeenCalled();
});

it('le morph retour ne se déclenche qu\'une fois même si le focus est signalé à nouveau', () => {
  seedReturnVisit(tousProjets[2].link);
  renderProjets();
  expect(beginReverse).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('refire-focus'));
  expect(beginReverse).toHaveBeenCalledTimes(1);
});
