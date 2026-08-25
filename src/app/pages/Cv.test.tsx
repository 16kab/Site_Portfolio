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

it('affiche la photo (avec alt = nom)', () => {
  renderCv();
  const img = screen.getByRole('img', { name: 'Alexis Kabiche' });
  expect(img.getAttribute('src')).toBe('/cv-photo.png');
});
