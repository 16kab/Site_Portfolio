import { test, expect } from '@playwright/test';

// Navigation par l'en-tête : desktop uniquement (le mobile passe par le
// menu burger, couvert dans mobile-menu.spec.ts ; exclu via testIgnore).
test.describe('Navigation par l’en-tête (desktop)', () => {
  test('ouvre le détail d’un projet depuis la liste', async ({ page }) => {
    await page.goto('/projets');
    await expect(
      page.getByRole('heading', { name: 'Projets', level: 1 }),
    ).toBeVisible();

    const firstCard = page
      .getByRole('link', { name: /Voir le projet/ })
      .first();
    await firstCard.click();

    await expect(page).toHaveURL(/\/projets\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('le lien « À propos » mène à la bonne page', async ({ page }) => {
    await page.goto('/projets');

    await page.getByRole('link', { name: 'À propos' }).click();

    await expect(page).toHaveURL(/\/apropos/);
    await expect(
      page.getByRole('heading', { name: 'À propos', level: 1 }),
    ).toBeVisible();
  });

  test('le lien « Projets » revient à la liste', async ({ page }) => {
    await page.goto('/apropos');

    await page.getByRole('link', { name: 'Projets' }).click();

    await expect(page).toHaveURL(/\/projets$/);
    await expect(
      page.getByRole('heading', { name: 'Projets', level: 1 }),
    ).toBeVisible();
  });
});
