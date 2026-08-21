import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import APropos from './APropos';

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/apropos']}>
      <APropos />
    </MemoryRouter>,
  );

it('affiche l’accroche manifeste en h1', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
    /tiennent debout sans moi/,
  );
});

it('rend les 5 expertises, 4 principes et 3 items recherche', () => {
  renderPage();
  for (const title of [
    'UX & Product Design',
    'Design Systems & Ops',
    'Moins, mais mieux',
    'Impact plutôt que production',
    'Collaboration réelle',
    'Maturité design',
  ]) {
    expect(screen.getByText(title)).toBeTruthy();
  }
  // Un item « recherche » retiré (parmi les 6 d'origine) est bien absent
  expect(screen.queryByText('Problématiques complexes')).toBeNull();
  expect(screen.queryByText('Culture centrée humain')).toBeNull();
});

it('affiche le bouton CV mais désactivé (bientôt)', () => {
  renderPage();
  const cv = screen.getByTestId('cv-button');
  expect(cv.getAttribute('aria-disabled')).toBe('true');
});

it('ne rend plus le menu sticky de navigation par section', () => {
  renderPage();
  expect(screen.queryByLabelText('Aller à la section Expertises')).toBeNull();
  expect(screen.queryByLabelText('Aller à la section Principes')).toBeNull();
});
