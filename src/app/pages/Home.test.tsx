import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import Home, { HOME_BODY_CLASS, getHomeAnimationDelays } from './Home';

vi.mock('../components/Shuffle', () => ({
  default: ({
    text,
    useCharacterMaskPadding = false,
  }: {
    text: string;
    useCharacterMaskPadding?: boolean;
  }) => (
    <span data-testid={`shuffle-${text}`} data-mask-padding={String(useCharacterMaskPadding)}>
      {text}
    </span>
  ),
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

  it('enables the anti-clipping mask only for the desktop PRODUCT title', () => {
    const { getAllByTestId } = render(
      <MemoryRouter>
        <Home showSplash={false} />
      </MemoryRouter>,
    );

    expect(
      getAllByTestId('shuffle-PRODUCT').map((element) =>
        element.getAttribute('data-mask-padding'),
      ),
    ).toEqual(['true', 'false']);
    expect(
      getAllByTestId('shuffle-DESIGNER').map((element) =>
        element.getAttribute('data-mask-padding'),
      ),
    ).toEqual(['false', 'false']);
  });
});
