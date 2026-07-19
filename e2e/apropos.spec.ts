import { test, expect } from '@playwright/test';

test('la page À propos rend les cartes Principes et Environnement', async ({
  page,
}) => {
  await page.goto('/apropos');

  await expect(
    page.getByRole('heading', { name: 'À propos', level: 1 }),
  ).toBeVisible();

  // Une carte de chaque section rend son contenu (grille en desktop,
  // carrousel en mobile — on cible l'exemplaire réellement affiché).
  await expect(
    page.getByText('Moins, mais mieux').filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Impact plutôt que production').filter({ visible: true }),
  ).toBeVisible();
});
