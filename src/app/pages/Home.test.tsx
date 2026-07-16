import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import Home, { HOME_BODY_CLASS, getHomeAnimationDelays } from './Home';

vi.mock('../components/Shuffle', () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('Home', () => {
  it('uses a short reveal delay after the splash has completed', () => {
    expect(getHomeAnimationDelays(false)).toEqual({
      textDelay: 0.1,
      shuffleDelay1: 0,
      shuffleDelay2: 0.1,
    });
  });

  it('locks body scrolling only while the home page is mounted', () => {
    const view = render(
      <MemoryRouter>
        <Home showSplash={false} />
      </MemoryRouter>,
    );

    expect(document.body).toHaveClass(HOME_BODY_CLASS);
    view.unmount();
    expect(document.body).not.toHaveClass(HOME_BODY_CLASS);
  });
});
