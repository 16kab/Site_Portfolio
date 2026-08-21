import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import Contact from './Contact';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/contact']}>
      <Contact />
    </MemoryRouter>,
  );

it('affiche le titre hero « Travaillons ensemble » en h1', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
    /Travaillons ensemble/,
  );
});

it('rend la section Références (bouton suivant présent)', () => {
  renderPage();
  expect(screen.getByRole('button', { name: /suivant|next/i })).toBeTruthy();
});

it('conserve les 5 champs du formulaire', () => {
  renderPage();
  const form = document.querySelector('form') as HTMLFormElement;
  for (const name of ['nom', 'prenom', 'email', 'objet', 'message']) {
    expect(form.elements.namedItem(name)).toBeTruthy();
  }
});

it('la section Références ne contient pas d’image', () => {
  const { container } = renderPage();
  expect(container.querySelector('img')).toBeNull();
});
