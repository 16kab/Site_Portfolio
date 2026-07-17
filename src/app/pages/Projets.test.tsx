import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren, Ref } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import {
  PageTransitionProvider,
  usePageTransition,
} from '../context/PageTransitionContext';
import { tousProjets } from '../data/projetsData';

vi.mock('../components/PageHeader', () => ({
  default: ({ children }: PropsWithChildren) => <header>{children}</header>,
}));

vi.mock('../components/ContactFooter', () => ({
  default: () => <footer>Contact footer</footer>,
}));

vi.mock('../components/ScrollRevealTitle', () => ({
  ScrollRevealTitle: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('../components/ScrollFadeIn', () => ({
  ScrollFadeIn: ({
    children,
    disabled = false,
  }: PropsWithChildren<{ disabled?: boolean }>) => (
    <div data-testid="scroll-fade" data-disabled={String(disabled)}>
      {children}
    </div>
  ),
}));

vi.mock('../components/common/NewProjectCard', async () => {
  const { forwardRef } = await import('react');

  const setRef = (ref: Ref<HTMLImageElement>, image: HTMLImageElement | null) => {
    if (typeof ref === 'function') {
      ref(image);
    } else if (ref) {
      ref.current = image;
    }
  };

  return {
    default: forwardRef<
      HTMLImageElement,
      { image?: string; link: string; title: string }
    >(({ image, link, title }, ref) => (
      <img
        ref={(node) => {
          if (node) {
            node.getBoundingClientRect = () =>
              ({
                left: 20,
                top: 160,
                width: 350,
                height: 250,
                right: 370,
                bottom: 410,
                x: 20,
                y: 160,
                toJSON: () => ({}),
              }) as DOMRect;
          }
          setRef(ref, node);
        }}
        src={image}
        alt={title}
        data-project-link={link}
      />
    )),
  };
});

vi.mock('motion/react', async () => {
  const { forwardRef } = await import('react');

  return {
    motion: {
      div: forwardRef<
        HTMLDivElement,
        PropsWithChildren<{
          initial: unknown;
          animate: unknown;
          transition: unknown;
          className?: string;
          style?: React.CSSProperties;
        }>
      >(({ children, initial, animate, transition, className, style }, ref) => (
        <div
          ref={ref}
          className={className}
          style={style}
          data-testid="motion-root"
          data-initial={JSON.stringify(initial)}
          data-animate={JSON.stringify(animate)}
          data-transition={JSON.stringify(transition)}
        >
          {children}
        </div>
      )),
    },
  };
});

import Projets from './Projets';

const existingProjectLink = tousProjets[0].link;

function TransitionState() {
  const { isTransitioning, direction, snapshot } = usePageTransition();

  return (
    <>
      <output data-testid="transition-state">
        {isTransitioning ? 'active' : 'idle'}:{direction ?? 'none'}:
        {snapshot?.projectLink ?? 'none'}
      </output>
      <output data-testid="transition-rect">
        {snapshot
          ? [
              snapshot.imageRect.left,
              snapshot.imageRect.top,
              snapshot.imageRect.width,
              snapshot.imageRect.height,
            ].join(',')
          : 'none'}
      </output>
    </>
  );
}

function ProjectDetailControls({ snapshotLink }: { snapshotLink: string }) {
  const navigate = useNavigate();
  const { beginForward, completeTransition } = usePageTransition();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          beginForward({
            imageSrc: '/test.webp',
            imageRect: { left: 0, top: 0, width: 390, height: 844 },
            projectLink: snapshotLink,
            originPath: '/projets',
            scrollTop: 480,
          })
        }
      >
        Seed forward
      </button>
      <button type="button" onClick={completeTransition}>
        Complete forward
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
      <Link to="/projets">Header projects</Link>
    </>
  );
}

function renderReturn(snapshotLink = existingProjectLink) {
  return render(
    <MemoryRouter
      initialEntries={['/projets', existingProjectLink]}
      initialIndex={1}
    >
      <PageTransitionProvider>
        <TransitionState />
        <Routes>
          <Route path="/projets" element={<Projets />} />
          <Route
            path="/projets/:id"
            element={<ProjectDetailControls snapshotLink={snapshotLink} />}
          />
        </Routes>
      </PageTransitionProvider>
    </MemoryRouter>,
  );
}

function seedAndCompleteForward() {
  fireEvent.click(screen.getByRole('button', { name: 'Seed forward' }));
  expect(screen.getByTestId('transition-state')).toHaveTextContent(
    `active:forward:${existingProjectLink}`,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Complete forward' }));
}

describe('Projets return transition', () => {
  beforeEach(() => {
    document.body.scrollTop = 0;
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it.each([
    ['browser history', 'Browser back'],
    ['the header projects link', 'Header projects'],
  ])('restores scroll and starts reverse through %s', (_label, returnControl) => {
    renderReturn();
    seedAndCompleteForward();

    fireEvent.click(screen.getByRole(returnControl === 'Browser back' ? 'button' : 'link', {
      name: returnControl,
    }));

    expect(document.body.scrollTop).toBe(480);
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      `active:reverse:${existingProjectLink}`,
    );
    expect(screen.getByTestId('transition-rect')).toHaveTextContent(
      '20,160,350,250',
    );
    expect(screen.getAllByTestId('scroll-fade')).toHaveLength(tousProjets.length);
    screen.getAllByTestId('scroll-fade').forEach((wrapper) => {
      expect(wrapper).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('clears the snapshot and shows the fallback page when the target is absent', () => {
    renderReturn('/projets/absent');
    fireEvent.click(screen.getByRole('button', { name: 'Seed forward' }));
    fireEvent.click(screen.getByRole('button', { name: 'Complete forward' }));

    fireEvent.click(screen.getByRole('link', { name: 'Header projects' }));

    expect(document.body.scrollTop).toBe(480);
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'idle:none:none',
    );
    expect(screen.getByRole('heading', { name: 'Projets' })).toBeVisible();
    expect(screen.getByTestId('motion-root')).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1 }),
    );
    expect(screen.getByTestId('motion-root')).toHaveAttribute(
      'data-transition',
      JSON.stringify({ duration: 0.2 }),
    );
  });

  it('clears immediately without reverse animation when motion is reduced', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    renderReturn();
    seedAndCompleteForward();

    fireEvent.click(screen.getByRole('link', { name: 'Header projects' }));

    expect(document.body.scrollTop).toBe(480);
    expect(screen.getByTestId('transition-state')).toHaveTextContent(
      'idle:none:none',
    );
    expect(screen.getByTestId('motion-root')).toHaveAttribute(
      'data-initial',
      'false',
    );
    expect(screen.getByTestId('motion-root')).toHaveAttribute(
      'data-transition',
      JSON.stringify({ duration: 0 }),
    );
  });
});
