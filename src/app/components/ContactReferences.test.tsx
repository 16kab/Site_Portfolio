import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ContactReferences, referencesData } from './ContactReferences';

it('affiche la première citation au montage', () => {
  render(<ContactReferences />);
  expect(screen.getByText(referencesData[0].quote.fr)).toBeTruthy();
});

// Navigation testée via `aria-current` des points (rendu synchrone, hors
// AnimatePresence — évite les faux négatifs liés au timing d'exit en jsdom).
it('le bouton « suivant » avance le témoignage actif', () => {
  render(<ContactReferences />);
  const dots = () =>
    within(screen.getByTestId('references-dots')).getAllByRole('button');
  expect(dots()[0].getAttribute('aria-current')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: /suivant|next/i }));
  expect(dots()[1].getAttribute('aria-current')).toBe('true');
});

it('cliquer un point active le témoignage correspondant', () => {
  render(<ContactReferences />);
  const dots = () =>
    within(screen.getByTestId('references-dots')).getAllByRole('button');
  fireEvent.click(dots()[2]);
  expect(dots()[2].getAttribute('aria-current')).toBe('true');
});

it('ne contient aucune image (pas de photo)', () => {
  const { container } = render(<ContactReferences />);
  expect(container.querySelector('img')).toBeNull();
});

it('données placeholder : parité FR/EN, non vides, sans identité réelle', () => {
  expect(referencesData.length).toBeGreaterThanOrEqual(3);
  for (const ref of referencesData) {
    expect(ref.quote.fr.length).toBeGreaterThan(0);
    expect(ref.quote.en.length).toBeGreaterThan(0);
    expect(ref.role.fr.length).toBeGreaterThan(0);
    expect(ref.role.en.length).toBeGreaterThan(0);
    // Garde-fou anti fausse identité : pas de nom de personne en placeholder.
    expect(ref.name).toBeUndefined();
  }
});
