import { test, expect } from '@playwright/test';

/**
 * Régression visuelle sur les pages stables (hors accueil animé), dans les
 * deux thèmes. Capture le haut de page (le header fixe + le début du contenu)
 * — suffisant pour détecter une régression de mise en page ou de couleur.
 */
const PAGES = [
  { name: 'projets', path: '/projets' },
  { name: 'apropos', path: '/apropos' },
  { name: 'contact', path: '/contact' },
  { name: 'mentions', path: '/mentions-legales' },
  { name: '404', path: '/cette-page-nexiste-pas' },
];

for (const theme of ['light', 'dark'] as const) {
  for (const { name, path } of PAGES) {
    test(`${name} — ${theme}`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem('theme', t);
      }, theme);
      await page.goto(path);
      // Laisse les animations d'entrée (header, révélations) se poser
      await page.waitForTimeout(2500);
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
        fullPage: false,
      });
    });
  }
}
