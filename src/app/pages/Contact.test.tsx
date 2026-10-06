import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import { LanguageProvider } from '../i18n';
import Contact from './Contact';

const renderPage = (lang: 'fr' | 'en' = 'fr') => {
  window.localStorage.setItem('lang', lang);
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <LanguageProvider>
        <Contact />
      </LanguageProvider>
    </MemoryRouter>,
  );
};

it('affiche le titre hero « Travaillons ensemble » en h1', () => {
  renderPage();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
    /Travaillons ensemble/,
  );
});

it.each(['fr', 'en'] as const)('ne rend pas de références en %s', (lang) => {
  renderPage(lang);
  expect(screen.queryByText(/\(références\)|\(references\)/i)).toBeNull();
  expect(screen.queryByRole('button', { name: /suivant|next/i })).toBeNull();
});

it('conserve les 5 champs du formulaire', () => {
  renderPage();
  const form = document.querySelector('form') as HTMLFormElement;
  for (const name of ['nom', 'prenom', 'email', 'objet', 'message']) {
    expect(form.elements.namedItem(name)).toBeTruthy();
  }
});
