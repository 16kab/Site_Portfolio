import { createRef } from 'react';
import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../../context/PageTransitionContext';
import NewProjectCard from './NewProjectCard';

vi.mock('../RollingText', () => ({
  default: ({ text, inView }: { text: string; inView: boolean }) => (
    <span data-testid="rolling-text" data-active={String(inView)}>
      {text}
    </span>
  ),
}));

const renderCard = (
  ref = createRef<HTMLImageElement>(),
  initialEntry = '/',
) => {
  const LocationProbe = () => {
    const location = useLocation();
    return <span data-testid="location">{location.pathname}</span>;
  };

  const TransitionProbe = () => {
    const { isTransitioning, direction, snapshot } = usePageTransition();
    return (
      <>
        <span data-testid="transition-state">
          {isTransitioning ? 'active' : 'idle'}:{direction ?? 'none'}
        </span>
        <span data-testid="snapshot-state">
          {snapshot
            ? `${snapshot.originPath}:${snapshot.projectLink}:${snapshot.scrollTop}`
            : 'none'}
        </span>
      </>
    );
  };

  const view = render(
    <MemoryRouter initialEntries={[initialEntry]}>
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
        <TransitionProbe />
      </PageTransitionProvider>
      <LocationProbe />
    </MemoryRouter>,
  );

  return { ...view, ref };
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: 1024,
  });
});

describe('NewProjectCard', () => {
  it('wraps the single project link in a decorative glow', () => {
    const { container } = renderCard();
    const glow = container.querySelector('.border-glow-card');
    const link = screen.getByRole('link', {
      name: 'Voir le projet Projet test',
    });

    expect(glow).toContainElement(link);
    expect(within(glow as HTMLElement).getAllByRole('link')).toHaveLength(1);
    expect(glow).not.toHaveAttribute('role');
  });

  it('uses one accessible link for the whole card without a nested button', () => {
    renderCard();
    const link = screen.getByRole('link', {
      name: 'Voir le projet Projet test',
    });

    expect(link).toHaveAttribute('href', '/projets/test');
    expect(within(link).queryByRole('button')).not.toBeInTheDocument();
  });

  it('activates the rolling label from the card hover and focus', () => {
    renderCard();
    const link = screen.getByRole('link', {
      name: 'Voir le projet Projet test',
    });
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
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1440,
    });
    renderCard();
    const link = screen.getByRole('link', {
      name: 'Voir le projet Projet test',
    });
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

  it('starts the image transition before navigating on mobile', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    renderCard();

    fireEvent.click(
      screen.getByRole('link', { name: 'Voir le projet Projet test' }),
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/');
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'active:forward',
    );

    act(() => vi.advanceTimersByTime(419));
    expect(screen.getByTestId('location')).toHaveTextContent('/');

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
  });

  it('schedules only one navigation when the project card is clicked twice', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    renderCard();
    const link = screen.getByRole('link', {
      name: 'Voir le projet Projet test',
    });

    fireEvent.click(link);
    fireEvent.click(link);

    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'active:forward',
    );
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(420));
    expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels its pending navigation when the card unmounts', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    const { unmount } = renderCard();

    fireEvent.click(
      screen.getByRole('link', { name: 'Voir le projet Projet test' }),
    );
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('navigates immediately without a transition when motion is reduced', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);
    document.body.scrollTop = 480;
    renderCard(createRef<HTMLImageElement>(), '/projets');

    fireEvent.click(
      screen.getByRole('link', { name: 'Voir le projet Projet test' }),
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/projets/test');
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'idle:none',
    );
    expect(screen.getByTestId('snapshot-state')).toHaveTextContent(
      '/projets:/projets/test:480',
    );
  });
});
