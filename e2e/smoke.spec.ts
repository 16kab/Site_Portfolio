import { test, expect } from '@playwright/test';

test('la page d’accueil se charge et affiche le hero', async ({ page }) => {
  await page.goto('/');

  // Le titre du document est posé dès le rendu
  await expect(page).toHaveTitle(/Alexis Kabiche/);

  // Le titre accessible (sr-only) est présent
  await expect(
    page.getByRole('heading', {
      name: 'Alexis Kabiche, Product & Brand Designer',
    }),
  ).toBeAttached();

  // Une fois le splash terminé, le mot « PRODUCT » du hero est visible
  await expect(page.getByText('PRODUCT').first()).toBeVisible({
    timeout: 6000,
  });
});

test('une URL inconnue affiche la page 404', async ({ page }) => {
  await page.goto('/cette-page-nexiste-pas');

  await expect(
    page.getByRole('heading', { name: 'Page introuvable' }),
  ).toBeVisible();
  await expect(page.getByText('Erreur 404')).toBeVisible();
  await expect(page.getByRole('link', { name: /Retour à l/ })).toBeVisible();
});
