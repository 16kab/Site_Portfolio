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

test('le carrousel Principes navigue via ses flèches (mobile)', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Carrousel visible en mobile');

  await page.goto('/apropos');

  const carrousel = page.getByRole('region', { name: 'Principes' });
  const precedent = carrousel.getByRole('button', { name: 'Précédent' });
  const suivant = carrousel.getByRole('button', { name: 'Suivant' });

  // Au départ : première carte, flèche précédente désactivée
  await expect(precedent).toBeDisabled();
  await expect(suivant).toBeEnabled();

  // Après avance : la flèche précédente s'active
  await suivant.click();
  await expect(precedent).toBeEnabled();

  // Retour à la première carte
  await precedent.click();
  await expect(precedent).toBeDisabled();
});
