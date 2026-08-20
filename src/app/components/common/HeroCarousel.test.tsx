import { render, screen, fireEvent } from '@testing-library/react';
import { HeroCarousel, type HeroCarouselItem } from './HeroCarousel';

// jsdom n'a pas ResizeObserver : mock minimal.
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

const ITEMS: HeroCarouselItem[] = [
  { id: 'a', title: 'Alpha', image: 'a.jpg', credit: 'MOBILE', meta: ['2026'], accent: '#E4674F' },
  { id: 'b', title: 'Beta', image: 'b.jpg', credit: 'WEB', meta: ['2025'], accent: '#10B981' },
  { id: 'c', title: 'Gamma', image: 'c.jpg', credit: 'BRANDING', meta: ['2024'], accent: '#18233F' },
];

it('rend une carte par item et marque la carte focus', () => {
  render(<HeroCarousel items={ITEMS} defaultIndex={1} />);
  const cards = screen.getAllByRole('button', { name: /Alpha|Beta|Gamma/ });
  expect(cards).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute('aria-current', 'true');
});

it('onItemActivate est appelé quand on clique la carte focus (pas les autres)', () => {
  const onItemActivate = vi.fn();
  const onIndexChange = vi.fn();
  render(
    <HeroCarousel items={ITEMS} defaultIndex={1} onItemActivate={onItemActivate} onIndexChange={onIndexChange} />,
  );
  // clic carte NON focus → focus (onIndexChange), pas d'activation
  fireEvent.click(screen.getByRole('button', { name: 'Gamma' }));
  expect(onIndexChange).toHaveBeenCalledWith(2);
  expect(onItemActivate).not.toHaveBeenCalled();
  // clic sur la carte désormais focus (Gamma, suite au clic précédent) → activation avec (index, img)
  fireEvent.click(screen.getByRole('button', { name: 'Gamma' }));
  expect(onItemActivate).toHaveBeenCalledTimes(1);
  expect(onItemActivate.mock.calls[0][0]).toBe(2);
  expect(onItemActivate.mock.calls[0][1]).toBeInstanceOf(HTMLImageElement);
});

it('le cue CTA déclenche onItemActivate sur l’index courant', () => {
  const onItemActivate = vi.fn();
  render(<HeroCarousel items={ITEMS} defaultIndex={0} onItemActivate={onItemActivate} ctaLabel="Voir le projet" />);
  fireEvent.click(screen.getByRole('button', { name: /Voir le projet/i }));
  expect(onItemActivate).toHaveBeenCalledWith(0, expect.anything());
});

it('la flèche droite change l’index', () => {
  const onIndexChange = vi.fn();
  render(<HeroCarousel items={ITEMS} defaultIndex={0} onIndexChange={onIndexChange} />);
  const stage = screen.getByRole('group', { name: /projets|carousel|featured/i });
  fireEvent.keyDown(stage, { key: 'ArrowRight' });
  expect(onIndexChange).toHaveBeenCalledWith(1);
});
