import { test, expect } from '@playwright/test';

// Menu burger : mobile uniquement (desktop exclu via testIgnore).
test.describe('Menu mobile', () => {
  test('ouvre le menu et navigue vers une page', async ({ page }) => {
    await page.goto('/projets');

    await page.getByRole('button', { name: /Ouvrir le menu/ }).click();

    const menu = page.getByRole('navigation', {
      name: 'Navigation principale',
    });
    await expect(menu.getByRole('link', { name: 'À propos' })).toBeVisible();

    await menu.getByRole('link', { name: 'À propos' }).click();

    await expect(page).toHaveURL(/\/apropos/);
    await expect(
      page.getByRole('heading', { name: 'À propos', level: 1 }),
    ).toBeVisible();
  });

  test('ferme le menu avec la touche Échap', async ({ page }) => {
    await page.goto('/projets');

    await page.getByRole('button', { name: /Ouvrir le menu/ }).click();
    const menuLink = page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Contact' });
    await expect(menuLink).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(menuLink).not.toBeVisible();
  });
});
