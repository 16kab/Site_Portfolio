import { render } from '@testing-library/react';
import { PageVeil } from './PageVeil';

it('rend un voile décoratif plein écran avec dégradé haut/bas', () => {
  const { container } = render(
    <PageVeil phase="covering" onCovered={() => {}} onRevealed={() => {}} />,
  );
  const veil = container.firstChild as HTMLElement;
  expect(veil).toBeTruthy();
  expect(veil.getAttribute('aria-hidden')).toBe('true');
  // dégradé vertical vers transparent aux bords
  expect(veil.style.background).toMatch(/gradient/);
  expect(veil.style.background).toMatch(/transparent/);
  expect(veil.style.height).toMatch(/vh/);
});
