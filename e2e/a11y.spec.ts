import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Audit d'accessibilité automatisé (axe-core) sur les pages clés, dans les
 * deux thèmes. On échoue sur les violations « serious » et « critical » —
 * le seuil pragmatique pour garder la porte sans bloquer sur des points
 * mineurs discutables.
 */
const PAGES = [
  { name: 'accueil', path: '/' },
  { name: 'projets', path: '/projets' },
  { name: 'à propos', path: '/apropos' },
  { name: 'contact', path: '/contact' },
  { name: 'mentions légales', path: '/mentions-legales' },
  { name: 'détail projet', path: '/projets/parcours-spvieassurances' },
  { name: '404', path: '/cette-page-nexiste-pas' },
];

const scan = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

for (const theme of ['light', 'dark'] as const) {
  test.describe(`Accessibilité — thème ${theme}`, () => {
    test.use({ colorScheme: theme });

    for (const { name, path } of PAGES) {
      test(`${name} sans violation serious/critical`, async ({ page }) => {
        await page.addInitScript((t) => {
          localStorage.setItem('theme', t);
        }, theme);
        await page.goto(path);
        // Laisse les animations d'entrée (header, hero, splash) se poser :
        // motion pilote la couleur du header par animation au montage, sinon
        // axe mesure une couleur intermédiaire (faux positif de contraste).
        await page.waitForTimeout(path === '/' ? 4500 : 2500);

        const results = await scan(page);
        const blocking = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );

        if (blocking.length > 0) {
          console.log(
            `Violations (${name}, ${theme}) :\n` +
              blocking
                .map((v) => `  [${v.impact}] ${v.id} — ${v.help}`)
                .join('\n'),
          );
        }
        expect(blocking).toEqual([]);
      });
    }
  });
}
