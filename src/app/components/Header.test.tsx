import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('./Magnet', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./AnimatedThemeToggler', () => ({
  AnimatedThemeToggler: () => <button type="button">Changer de thème</button>,
}));

vi.mock('./RollingText', () => ({
  RollingText: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe('Header menu attenuation', () => {
  it.each(['projets', 'apropos', 'contact', 'theme'] as const)(
    'keeps %s fully visible and dims the other targets',
    (activeItem) => {
      const { container } = render(
        <MemoryRouter>
          <Header showSplash={false} />
        </MemoryRouter>,
      );

      const active = container.querySelector<HTMLElement>(
        `[data-menu-item="${activeItem}"]`,
      );
      expect(active).not.toBeNull();
      fireEvent.mouseEnter(active!);

      for (const item of ['projets', 'apropos', 'contact', 'theme']) {
        const element = container.querySelector<HTMLElement>(
          `[data-menu-item="${item}"]`,
        );
        expect(element).toHaveStyle({
          opacity: item === activeItem ? '1' : '0.4',
        });
      }
    },
  );
});
