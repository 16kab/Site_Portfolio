import { createRef } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
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
    </MemoryRouter>,
  );

  return { ...view, ref };
};

describe('NewProjectCard', () => {
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
});
