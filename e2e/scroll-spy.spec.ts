import { test, expect } from '@playwright/test';

// Le menu sticky (switch) affiche ses libellés en desktop.
const bodyScrollTop = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.body.scrollTop);

test('Détail projet : le switch menu fait défiler vers la galerie', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Libellés visibles en desktop',
  );

  // Projet doté d'une galerie (le switch menu n'apparaît que dans ce cas)
  await page.goto('/projets/parcours-spvieassurances');
  await expect(page).toHaveURL(/parcours-spvieassurances/);

  const galerie = page.getByRole('button', { name: 'Galerie' });
  await galerie.click();

  // Mouvement réduit : le défilement est instantané ; on vérifie le saut
  await expect.poll(() => bodyScrollTop(page)).toBeGreaterThan(200);
});

test('À propos : le switch menu fait défiler vers une section', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Libellés visibles en desktop',
  );

  await page.goto('/apropos');

  await page.getByRole('button', { name: 'Principes' }).click();

  await expect.poll(() => bodyScrollTop(page)).toBeGreaterThan(200);
});
