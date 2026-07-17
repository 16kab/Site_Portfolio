import { createRef } from 'react';
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageTransitionProvider } from '../../context/PageTransitionContext';
import NewProjectCard from './NewProjectCard';

vi.mock('../RollingText', () => ({
  default: ({ text, inView }: { text: string; inView: boolean }) => (
    <span data-testid="rolling-text" data-active={String(inView)}>
      {text}
    </span>
  ),
}));

const renderCard = (ref = createRef<HTMLImageElement>()) => {
  const LocationProbe = () => {
    const location = useLocation();
    return <span data-testid="location">{location.pathname}</span>;
  };

  const view = render(
    <MemoryRouter>
      <PageTransitionProvider>
        <NewProjectCard
          ref={ref}
          link="/projets/test"
          number="01"
          title="Projet test"
          description="Description test"
          tags={['UX', 'UI']}
          image="/test.webp"
        />
      </PageTransitionProvider>
      <LocationProbe />
    </MemoryRouter>,
  );

  return { ...view, ref };
};

afterEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
});

describe('NewProjectCard', () => {
  it('wraps the single project link in a decorative glow', () => {
    const { container } = renderCard();
    const glow = container.querySelector('.border-glow-card');
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' });

    expect(glow).toContainElement(link);
    expect(within(glow as HTMLElement).getAllByRole('link')).toHaveLength(1);
    expect(glow).not.toHaveAttribute('role');
  });

  it('uses one accessible link for the whole card without a nested button', () => {
    renderCard();
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' });

    expect(link).toHaveAttribute('href', '/projets/test');
    expect(within(link).queryByRole('button')).not.toBeInTheDocument();
  });

  it('activates the rolling label from the card hover and focus', () => {
    renderCard();
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' });
    const rolling = screen.getByTestId('rolling-text');

    expect(rolling).toHaveAttribute('data-active', 'false');
    fireEvent.mouseEnter(link);
    expect(rolling).toHaveAttribute('data-active', 'true');
    fireEvent.mouseLeave(link);
    fireEvent.focus(link);
    expect(rolling).toHaveAttribute('data-active', 'true');
    fireEvent.blur(link);
    expect(rolling).toHaveAttribute('data-active', 'false');
  });

  it('forwards its ref to the project image', () => {
    const { ref } = renderCard();

    expect(ref.current).toBe(screen.getByRole('img', { name: 'Projet test' }));
  });

  it('keeps modifier clicks native on desktop', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    renderCard();
    const link = screen.getByRole('link', { name: 'Voir le projet Projet test' });
    const event = createEvent.click(link, { button: 0, ctrlKey: true });
    let preventedByCard = true;
    document.addEventListener(
      'click',
      (nativeEvent) => {
        preventedByCard = nativeEvent.defaultPrevented;
        nativeEvent.preventDefault();
      },
      { once: true },
    );

    fireEvent(link, event);

    expect(preventedByCard).toBe(false);
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('uses immediate link navigation on mobile', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    renderCard();

    fireEvent.click(screen.getByRole('link', { name: 'Voir le projet Projet test' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
  });
});
