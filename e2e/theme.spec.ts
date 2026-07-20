import { test, expect } from '@playwright/test';

test('bascule le thème et le conserve après rechargement', async ({ page }) => {
  await page.goto('/contact');

  const html = page.locator('html');
  const toggle = page
    .getByRole('button', { name: /thème/i })
    .and(page.locator(':visible'));

  // Thème sombre par défaut (cf. theme-init.js)
  await expect(html).toHaveClass(/dark/);

  await toggle.click();
  await expect(html).not.toHaveClass(/dark/);

  await page.reload();
  await expect(html).not.toHaveClass(/dark/);
});
