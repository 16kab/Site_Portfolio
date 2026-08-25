import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import Cv from './Cv';

const renderCv = () =>
  render(
    <MemoryRouter initialEntries={['/cv']}>
      <Cv />
    </MemoryRouter>,
  );

it('affiche le nom en h1 et le titre', () => {
  renderCv();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Alexis Kabiche',
  );
  expect(screen.getByText('Product & Brand Designer')).toBeTruthy();
});

it('rend les sections et les 4 postes', () => {
  renderCv();
  expect(screen.getByText('Expérience')).toBeTruthy();
  expect(screen.getByText('Compétences')).toBeTruthy();
  expect(screen.getByText('Formation')).toBeTruthy();
  expect(screen.getByText('UX/UI Designer')).toBeTruthy();
  expect(screen.getByText('Graphiste')).toBeTruthy();
});

it('le bouton « Télécharger le PDF » déclenche l’impression', () => {
  const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
  renderCv();
  fireEvent.click(
    screen.getByRole('button', { name: /télécharger le pdf|download pdf/i }),
  );
  expect(printSpy).toHaveBeenCalledTimes(1);
  printSpy.mockRestore();
});

it('pas d’image tant que la photo n’est pas fournie (placeholder)', () => {
  const { container } = renderCv();
  expect(container.querySelector('img')).toBeNull();
});

it('le switch bascule la feuille en sombre puis en clair', () => {
  renderCv();
  const sheet = screen.getByTestId('cv-sheet');
  expect(sheet.getAttribute('data-variant')).toBe('light');
  fireEvent.click(screen.getByRole('button', { name: /cv sombre|dark cv/i }));
  expect(sheet.getAttribute('data-variant')).toBe('dark');
  fireEvent.click(screen.getByRole('button', { name: /cv clair|light cv/i }));
  expect(sheet.getAttribute('data-variant')).toBe('light');
});
