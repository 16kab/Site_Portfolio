import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const motionMocks = vi.hoisted(() => ({
  useInView: vi.fn(() => false),
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('motion/react', async () => {
  const { forwardRef } = await import('react');

  return {
    useInView: motionMocks.useInView,
    useReducedMotion: motionMocks.useReducedMotion,
    motion: {
      div: forwardRef<
        HTMLDivElement,
        PropsWithChildren<{
          initial: unknown;
          animate: unknown;
          transition: unknown;
        }>
      >(({ children, initial, animate, transition }, ref) => (
        <div
          ref={ref}
          data-testid="motion-wrapper"
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

import ScrollFadeIn from './ScrollFadeIn';

describe('ScrollFadeIn', () => {
  beforeEach(() => {
    motionMocks.useInView.mockReturnValue(false);
    motionMocks.useReducedMotion.mockReturnValue(false);
  });

  it('forwards an earlier threshold and root margin to useInView', () => {
    render(
      <ScrollFadeIn amount={0.15} margin="0px 0px 10% 0px">
        Card
      </ScrollFadeIn>,
    );

    expect(motionMocks.useInView).toHaveBeenCalledWith(expect.anything(), {
      once: true,
      amount: 0.15,
      margin: '0px 0px 10% 0px',
    });
  });

  it('renders the visible state immediately when motion is reduced', () => {
    motionMocks.useReducedMotion.mockReturnValue(true);
    render(<ScrollFadeIn>Card</ScrollFadeIn>);

    expect(screen.getByTestId('motion-wrapper')).toHaveAttribute(
      'data-initial',
      'false',
    );
    expect(screen.getByTestId('motion-wrapper')).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1, y: 0, filter: 'blur(0px)' }),
    );
  });

  it('renders the visible state immediately when disabled', () => {
    render(<ScrollFadeIn disabled>Card</ScrollFadeIn>);

    const wrapper = screen.getByTestId('motion-wrapper');
    expect(wrapper).toHaveAttribute('data-initial', 'false');
    expect(wrapper).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1, y: 0, filter: 'blur(0px)' }),
    );
    expect(wrapper).toHaveAttribute(
      'data-transition',
      JSON.stringify({ duration: 0 }),
    );
  });
});
